/* ============================================================
   VIP BETCOTE — Webhook Stripe
   ------------------------------------------------------------
   Appelee par Stripe (et par personne d'autre) chaque fois qu'un
   paiement se termine sur une page de paiement Stripe.

   REGLE CENTRALE : c'est la SEULE porte d'entree par laquelle un
   paiement par carte peut exister dans la base. Le site public
   n'ecrit plus rien au moment du clic sur "Payer avec Stripe" — un
   aller-retour sans payer ne laisse donc aucune trace.

   Securite :
     - la signature Stripe est verifiee cryptographiquement (HMAC
       SHA-256) sur le corps BRUT de la requete. Un faux appel, meme
       parfaitement forme, est rejete.
     - protection anti-rejeu : un evenement plus vieux que 5 minutes
       est refuse.
     - le montant reellement encaisse est compare au montant attendu
       pour le plan reclame (voir MONTANTS_ATTENDUS). En cas d'ecart,
       l'abonnement n'est JAMAIS active automatiquement : le paiement
       est laisse en attente pour verification manuelle par l'admin.
     - idempotence : Stripe reessaie en cas d'erreur. L'identifiant de
       session Stripe sert de reference unique du paiement, donc un
       meme paiement ne peut jamais creer deux abonnements.

   Aucune dependance npm : Node natif uniquement (crypto + fetch).
   ============================================================ */

const crypto = require('crypto');

/* ---- Variables d'environnement (a definir dans Netlify) ---- */
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE || '';

/* Incident deja rencontre sur ce projet : SUPABASE_URL avait ete
   enregistree avec un chemin en trop (/rest/v1/), ce qui cassait tous
   les appels. On nettoie donc systematiquement, par securite. */
function baseSupabase() {
  let u = (process.env.SUPABASE_URL || '').trim();
  u = u.replace(/\/rest\/v1\/?$/i, '');
  u = u.replace(/\/+$/, '');
  return u;
}

/* ---- Montants attendus par plan ----------------------------
   Cle = identifiant du plan ; valeur = { montant, devise }.
   'montant' est exprime dans la plus petite unite de la devise,
   exactement comme Stripe le renvoie (ex. 25.00 USD => 2500).
   'devise' en minuscules (ex. 'usd').

   Tant que cette table est vide, la verification est faite en mode
   JOURNAL SEULEMENT : l'ecart est enregistre dans error_log mais
   n'empeche pas l'activation. Des qu'un plan y figure, l'ecart
   bloque l'activation automatique pour ce plan.
   ------------------------------------------------------------ */
const MONTANTS_ATTENDUS = {
  // p1: { montant: 0, devise: 'usd' },
  // p2: { montant: 0, devise: 'usd' },
  // p3: { montant: 0, devise: 'usd' },
  // p4: { montant: 0, devise: 'usd' }
};

/* ---- Petit client Supabase (REST, cle service_role) --------- */
async function sb(chemin, options) {
  options = options || {};
  const url = baseSupabase() + '/rest/v1/' + chemin;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: Object.assign({
      apikey: SERVICE_KEY,
      Authorization: 'Bearer ' + SERVICE_KEY,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation'
    }, options.headers || {}),
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const texte = await res.text();
  let donnees = null;
  if (texte) { try { donnees = JSON.parse(texte); } catch (e) { donnees = texte; } }
  if (!res.ok) {
    const err = new Error('Supabase ' + res.status + ' sur ' + chemin + ' : ' + texte);
    err.statut = res.status;
    throw err;
  }
  return donnees;
}

/* Journalisation technique : ne remonte jamais a l'utilisateur, et ne
   fait jamais echouer le traitement principal. */
async function journaliser(contexte, message) {
  try {
    await sb('error_log', {
      method: 'POST',
      prefer: 'return=minimal',
      body: [{ context: contexte, message: String(message).slice(0, 2000) }]
    });
  } catch (e) { /* si meme le journal est injoignable, on n'insiste pas */ }
}

/* ---- Verification de la signature Stripe -------------------- */
function signatureValide(corpsBrut, enteteSignature) {
  if (!WEBHOOK_SECRET || !enteteSignature) return { ok: false, raison: 'secret ou entete absent' };
  let horodatage = null;
  const signatures = [];
  enteteSignature.split(',').forEach(part => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const cle = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (cle === 't') horodatage = val;
    else if (cle === 'v1') signatures.push(val);
  });
  if (!horodatage || !signatures.length) return { ok: false, raison: 'entete mal formee' };

  // Anti-rejeu : un evenement capture puis renvoye plus tard est refuse.
  const ageSecondes = Math.abs(Math.floor(Date.now() / 1000) - parseInt(horodatage, 10));
  if (!isFinite(ageSecondes) || ageSecondes > 300) return { ok: false, raison: 'horodatage trop ancien (' + ageSecondes + 's)' };

  const attendu = crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(horodatage + '.' + corpsBrut, 'utf8')
    .digest('hex');
  const attenduBuf = Buffer.from(attendu, 'utf8');
  const correspond = signatures.some(sig => {
    const sigBuf = Buffer.from(sig, 'utf8');
    if (sigBuf.length !== attenduBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, attenduBuf);   // comparaison a temps constant
  });
  return correspond ? { ok: true } : { ok: false, raison: 'signature non conforme' };
}

/* ============================================================ */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  if (!WEBHOOK_SECRET || !SERVICE_KEY || !baseSupabase()) {
    await journaliser('stripe_webhook_config', 'Variables manquantes : STRIPE_WEBHOOK_SECRET / cle service_role / SUPABASE_URL');
    return { statusCode: 500, body: 'Configuration incomplete' };
  }

  // Le corps doit rester EXACTEMENT tel que Stripe l'a envoye : toute
  // reserialisation invaliderait la signature.
  const corpsBrut = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');

  const entete = event.headers['stripe-signature'] || event.headers['Stripe-Signature'];
  const verif = signatureValide(corpsBrut, entete);
  if (!verif.ok) {
    await journaliser('stripe_webhook_signature', 'Appel rejete : ' + verif.raison);
    return { statusCode: 400, body: 'Signature invalide' };
  }

  let evenement;
  try { evenement = JSON.parse(corpsBrut); }
  catch (e) { return { statusCode: 400, body: 'Corps illisible' }; }

  // Un seul evenement nous interesse. Tous les autres recoivent 200 :
  // sans ca, Stripe les considererait en echec et reessaierait sans fin.
  if (evenement.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'ignore' };
  }
  const session = (evenement.data && evenement.data.object) || {};
  if (session.payment_status !== 'paid') {
    return { statusCode: 200, body: 'non paye' };
  }

  const refStripe = session.id;                       // cs_... — reference unique du paiement
  const crid = session.client_reference_id || '';
  const sep = crid.indexOf('__');
  const uid = sep > 0 ? crid.slice(0, sep) : '';
  const planId = sep > 0 ? crid.slice(sep + 2) : '';

  if (!uid || !planId) {
    /* Paiement reel mais impossible a rattacher : ne JAMAIS le perdre
       silencieusement. On le journalise pour que l'admin puisse le
       retrouver dans Stripe et le traiter a la main. */
    await journaliser('stripe_webhook_orphelin',
      'Paiement sans client_reference_id exploitable. session=' + refStripe +
      ' email=' + ((session.customer_details && session.customer_details.email) || '?') +
      ' montant=' + session.amount_total + ' ' + session.currency);
    return { statusCode: 200, body: 'orphelin journalise' };
  }

  try {
    /* ---- 1. Idempotence -------------------------------------
       Stripe reessaie tant qu'il ne recoit pas 200. La reference du
       paiement est l'identifiant de session Stripe : si un paiement
       porte deja cette reference, l'evenement a deja ete traite. */
    const dejaVu = await sb('payments?reference=eq.' + encodeURIComponent(refStripe) + '&select=id,status,subscription_id');
    if (Array.isArray(dejaVu) && dejaVu.length && dejaVu[0].status === 'confirmed') {
      return { statusCode: 200, body: 'deja traite' };
    }

    /* ---- 2. Le plan reclame doit exister reellement ---------- */
    const plans = await sb('plans?id=eq.' + encodeURIComponent(planId) + '&select=id,price_htg,duration_days');
    if (!Array.isArray(plans) || !plans.length) {
      await journaliser('stripe_webhook_plan_inconnu', 'Plan "' + planId + '" absent de la table plans. session=' + refStripe);
      return { statusCode: 200, body: 'plan inconnu' };
    }
    const plan = plans[0];

    /* ---- 3. Verification du montant reellement encaisse ------
       Empeche qu'une adresse modifiee a la main fasse payer le prix
       du petit plan tout en reclamant le grand. */
    let montantSuspect = false;
    const attendu = MONTANTS_ATTENDUS[planId];
    if (attendu) {
      const memeMontant = Number(session.amount_total) === Number(attendu.montant);
      const memeDevise = String(session.currency || '').toLowerCase() === String(attendu.devise).toLowerCase();
      if (!memeMontant || !memeDevise) {
        montantSuspect = true;
        await journaliser('stripe_webhook_montant',
          'Ecart de montant pour ' + planId + ' : recu ' + session.amount_total + ' ' + session.currency +
          ', attendu ' + attendu.montant + ' ' + attendu.devise + '. session=' + refStripe +
          ' — abonnement NON active, laisse en attente pour verification manuelle.');
      }
    } else {
      await journaliser('stripe_webhook_montant_non_configure',
        'Aucun montant attendu configure pour ' + planId + ' : recu ' + session.amount_total + ' ' +
        session.currency + '. session=' + refStripe + ' — verification impossible, activation faite quand meme.');
    }

    /* ---- 4. Le paiement d'abord (ancre d'idempotence) --------
       Ecrit avant l'abonnement : si la suite echoue et que Stripe
       reessaie, on repart de cette ligne au lieu d'en creer une
       deuxieme. */
    let paiementId = (Array.isArray(dejaVu) && dejaVu.length) ? dejaVu[0].id : null;
    if (!paiementId) {
      const cree = await sb('payments', {
        method: 'POST',
        body: [{
          user_id: uid, plan_id: planId, subscription_id: null,
          amount_htg: plan.price_htg, method: 'stripe',
          status: 'pending', reference: refStripe
        }]
      });
      paiementId = Array.isArray(cree) && cree.length ? cree[0].id : null;
    }
    if (!paiementId) throw new Error('Impossible de creer ou retrouver la ligne de paiement');

    /* Montant douteux : on s'arrete ici volontairement. L'argent est
       bien trace (paiement en attente, visible dans l'espace admin),
       mais aucun acces n'est ouvert automatiquement. */
    if (montantSuspect) {
      return { statusCode: 200, body: 'montant a verifier — laisse en attente' };
    }

    /* ---- 5. Fermeture de l'ancien abonnement actif -----------
       Meme regle que la validation manuelle par l'admin : jamais deux
       abonnements actifs en meme temps pour une meme personne. */
    await sb('subscriptions?user_id=eq.' + encodeURIComponent(uid) + '&status=eq.active', {
      method: 'PATCH', prefer: 'return=minimal', body: { status: 'cancelled' }
    });

    /* ---- 6. Le nouvel abonnement, actif -----------------------
       Les vraies dates sont fixees ICI, au moment du paiement reel —
       jamais a l'avance. Plan a vie = aucune expiration. */
    const debut = new Date();
    let expire = null;
    if (plan.duration_days) {
      const fin = new Date(debut);
      fin.setDate(fin.getDate() + plan.duration_days);
      expire = fin.toISOString();
    }
    const abos = await sb('subscriptions', {
      method: 'POST',
      body: [{
        user_id: uid, plan_id: planId, status: 'active',
        starts_at: debut.toISOString(), expires_at: expire
      }]
    });
    const aboId = Array.isArray(abos) && abos.length ? abos[0].id : null;
    if (!aboId) throw new Error('Abonnement non cree');

    /* ---- 7. Le paiement passe a confirme ---------------------- */
    await sb('payments?id=eq.' + encodeURIComponent(paiementId), {
      method: 'PATCH', prefer: 'return=minimal',
      body: { status: 'confirmed', confirmed_at: new Date().toISOString(), subscription_id: aboId }
    });

    /* ---- 8. Notification + journal d'audit -------------------
       Best effort : leur echec ne doit jamais faire rejouer le
       paiement, qui est deja correctement enregistre. */
    try {
      await sb('notifications', {
        method: 'POST', prefer: 'return=minimal',
        body: [{ user_id: uid, type: 'payment_confirmed', plan_id: planId, reason: null }]
      });
    } catch (e) { /* sans consequence sur le paiement */ }
    try {
      await sb('audit_log', {
        method: 'POST', prefer: 'return=minimal',
        body: [{
          admin_id: null,                       // aucun admin : action automatique de Stripe
          action: 'payment_confirmed',
          target_user_id: uid,
          old_value: { payment_id: paiementId, status: 'pending', source: 'stripe_webhook' },
          new_value: {
            payment_id: paiementId, status: 'confirmed', subscription_id: aboId,
            stripe_session: refStripe,
            stripe_amount: session.amount_total, stripe_currency: session.currency
          },
          reason: null
        }]
      });
    } catch (e) { /* sans consequence sur le paiement */ }

    return { statusCode: 200, body: 'ok' };

  } catch (e) {
    await journaliser('stripe_webhook_traitement',
      'session=' + refStripe + ' user=' + uid + ' plan=' + planId + ' — ' + (e && e.message ? e.message : String(e)));
    // 500 : Stripe reessaiera automatiquement. L'idempotence ci-dessus
    // garantit qu'un nouvel essai ne creera pas de doublon.
    return { statusCode: 500, body: 'erreur de traitement' };
  }
};
