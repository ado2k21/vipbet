/* ============================================================
   VIP BETCOTE — Webhook Stripe (confirmation automatique, v2 — 03/10/2026)
   ------------------------------------------------------------
   Appelee par Stripe (et par personne d'autre) quand un paiement se
   termine sur un Payment Link.

   PRINCIPE (hybride, jamais de risque pour l'existant) :
     - Le site cree TOUJOURS d'abord le paiement 'pending' + l'abonnement
       'pending' (flux existant, inchange), avec une reference VB-AAAAMM-NNNN.
       Cette reference est transmise a Stripe dans l'adresse du lien
       (?client_reference_id=VB-...).
     - Ce webhook NE CREE PLUS de paiement ni d'abonnement : il retrouve la
       ligne 'pending' par sa reference et la confirme via la fonction SQL
       confirmer_paiement_stripe (atomique, idempotente, meme regles que
       MonCash/NatCash). Si UNE seule verification echoue, rien n'est active
       et la ligne reste 'pending' : l'admin la valide a la main, comme avant.

   FAIL-CLOSED : tant que STRIPE_PLAN_AMOUNTS n'est pas configure (montant
   + devise exacts de chaque plan), AUCUNE activation automatique n'a lieu.

   Verifications avant toute activation :
     1. signature Stripe HMAC SHA-256 sur le corps BRUT + anti-rejeu 5 min
     2. evenement de test refuse sauf STRIPE_ALLOW_TEST=1
     3. reference VB-... valide et ligne payments method='stripe' existante
     4. montant ET devise exactement egaux a ceux attendus pour le plan de
        LA LIGNE EN BASE (jamais un plan lu dans l'adresse)
     5. si STRIPE_PLINK_PLANS est defini : le Payment Link reellement paye
        correspond au plan de la ligne
     6. (en SQL) pending, compte non suspendu, session jamais utilisee
        ailleurs, abonnement 'pending' rattache

   Remboursements / litiges : journalises dans error_log pour decision
   humaine (aucune annulation automatique d'abonnement).

   Aucune dependance npm : Node natif uniquement (crypto + fetch).

   Variables d'environnement (Netlify) :
     STRIPE_WEBHOOK_SECRET   whsec_... du endpoint (different test / reel)
     STRIPE_PLAN_AMOUNTS     {"p1":{"amount":399,"currency":"usd"},...}
                             amount = plus petite unite (399 = 3,99 USD) ; un plan
                             peut avoir une LISTE de prix (USD + HTG)
     STRIPE_PLINK_PLANS      (optionnel) {"plink_xxx":"p1",...}
     STRIPE_ALLOW_TEST       (optionnel) "1" pour accepter le mode test
     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   ============================================================ */

const crypto = require('crypto');

/* ---- Configuration lue A CHAQUE APPEL (testable, rechargeable) ---- */
function lireConfig() {
  let u = (process.env.SUPABASE_URL || '').trim();
  u = u.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');   // incident deja vu : chemin en trop
  return {
    secret: (process.env.STRIPE_WEBHOOK_SECRET || '').trim(),
    serviceKey: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE || '').trim(),
    supabaseUrl: u,
    autoriserTest: String(process.env.STRIPE_ALLOW_TEST || '').trim() === '1',
    montants: lireJson(process.env.STRIPE_PLAN_AMOUNTS),
    plinks: lireJson(process.env.STRIPE_PLINK_PLANS)
  };
}
function lireJson(brut) {
  if (!brut) return null;
  try {
    const v = JSON.parse(brut);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : null;
  } catch (e) { return null; }
}

/* ---- Petit client Supabase (REST, cle service_role) --------- */
async function sb(cfg, chemin, options) {
  options = options || {};
  const res = await fetch(cfg.supabaseUrl + '/rest/v1/' + chemin, {
    method: options.method || 'GET',
    headers: {
      apikey: cfg.serviceKey,
      Authorization: 'Bearer ' + cfg.serviceKey,
      'Content-Type': 'application/json',
      Prefer: options.prefer || 'return=representation'
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });
  const texte = await res.text();
  let donnees = null;
  if (texte) { try { donnees = JSON.parse(texte); } catch (e) { donnees = texte; } }
  if (!res.ok) {
    const err = new Error('Supabase ' + res.status + ' sur ' + chemin + ' : ' + texte);
    err.statut = res.status;
    err.donnees = donnees;
    throw err;
  }
  return donnees;
}

/* Journalisation technique : ne remonte jamais a l'utilisateur et ne fait
   jamais echouer le traitement principal. */
async function journaliser(cfg, contexte, message) {
  try {
    await sb(cfg, 'error_log', {
      method: 'POST', prefer: 'return=minimal',
      body: [{ context: contexte, message: String(message).slice(0, 2000) }]
    });
  } catch (e) { /* si meme le journal est injoignable, on n'insiste pas */ }
}

/* ---- Verification de la signature Stripe -------------------- */
function signatureValide(secret, corpsBrut, enteteSignature) {
  if (!secret || !enteteSignature) return { ok: false, raison: 'secret ou entete absent' };
  let horodatage = null;
  const signatures = [];
  String(enteteSignature).split(',').forEach(part => {
    const i = part.indexOf('=');
    if (i < 0) return;
    const cle = part.slice(0, i).trim();
    const val = part.slice(i + 1).trim();
    if (cle === 't') horodatage = val;
    else if (cle === 'v1') signatures.push(val);
  });
  if (!horodatage || !signatures.length) return { ok: false, raison: 'entete mal formee' };

  const ageSecondes = Math.abs(Math.floor(Date.now() / 1000) - parseInt(horodatage, 10));
  if (!isFinite(ageSecondes) || ageSecondes > 300) return { ok: false, raison: 'horodatage trop ancien (' + ageSecondes + 's)' };

  const attendu = crypto.createHmac('sha256', secret).update(horodatage + '.' + corpsBrut, 'utf8').digest('hex');
  const attenduBuf = Buffer.from(attendu, 'utf8');
  const correspond = signatures.some(sig => {
    const sigBuf = Buffer.from(sig, 'utf8');
    if (sigBuf.length !== attenduBuf.length) return false;
    return crypto.timingSafeEqual(sigBuf, attenduBuf);
  });
  return correspond ? { ok: true } : { ok: false, raison: 'signature non conforme' };
}

const FORMAT_REFERENCE = /^VB-\d{6}-\d{4}$/;

/* Codes de la fonction SQL qui exigent une decision humaine : on les
   journalise (200, car reessayer ne changerait rien). */
const CODES_MANUELS = {
  PAYMENT_NOT_FOUND: 'aucune ligne de paiement pour cette reference',
  NOT_PENDING: 'le paiement n\'est plus en attente (refuse/echoue/rembourse)',
  DOUBLE_PAYMENT: 'DEUXIEME paiement Stripe pour une reference deja confirmee : argent encaisse en double',
  SESSION_DEJA_UTILISEE: 'cette session Stripe a deja servi pour un autre paiement',
  NO_SUBSCRIPTION: 'aucun abonnement rattache au paiement',
  PLAN_NOT_FOUND: 'plan inconnu en base',
  USER_SUSPENDED: 'compte suspendu',
  BAD_INPUT: 'donnees incompletes'
};

/* ---- Traitement d'un paiement reussi ------------------------ */
async function traiterPaiement(cfg, session, livemode) {
  const sessionId = session.id;
  const ref = String(session.client_reference_id || '');
  const infos = 'session=' + sessionId + ' ref=' + (ref || '?') +
    ' email=' + ((session.customer_details && session.customer_details.email) || '?') +
    ' montant=' + session.amount_total + ' ' + session.currency;

  if (!FORMAT_REFERENCE.test(ref)) {
    /* Paiement reel mais impossible a rattacher : ne JAMAIS le perdre
       silencieusement. L'admin le retrouve dans Stripe. */
    await journaliser(cfg, 'stripe_webhook_orphelin', 'Paiement sans reference VB-... exploitable. ' + infos);
    return { statusCode: 200, body: 'orphelin journalise' };
  }

  const lignes = await sb(cfg, 'payments?reference=eq.' + encodeURIComponent(ref) +
    '&method=eq.stripe&select=id,user_id,plan_id,status,subscription_id');
  if (!Array.isArray(lignes) || !lignes.length) {
    await journaliser(cfg, 'stripe_webhook_orphelin', 'Aucune ligne payments (method=stripe) pour cette reference. ' + infos);
    return { statusCode: 200, body: 'ligne absente journalisee' };
  }
  const ligne = lignes[0];

  /* ---- Montant + devise : FAIL-CLOSED ----------------------
     Un plan peut avoir PLUSIEURS prix acceptes (ex. USD et HTG quand le
     Payment Link propose les deux devises) : STRIPE_PLAN_AMOUNTS accepte
     un objet {amount,currency} OU une liste de ces objets. Le paiement doit
     correspondre EXACTEMENT a l'un d'eux. */
  const brut = cfg.montants && cfg.montants[ligne.plan_id];
  const acceptes = (Array.isArray(brut) ? brut : (brut ? [brut] : []))
    .filter(x => x && Number.isFinite(Number(x.amount)) && x.currency);
  if (!acceptes.length) {
    await journaliser(cfg, 'stripe_webhook_montant_non_configure',
      'STRIPE_PLAN_AMOUNTS sans entree valide pour ' + ligne.plan_id + ' : activation automatique impossible, ' +
      'paiement laisse en attente pour validation manuelle. ' + infos);
    return { statusCode: 200, body: 'montant non configure — laisse en attente' };
  }
  const devise = String(session.currency || '').toLowerCase();
  const correspond = acceptes.some(x =>
    Number(session.amount_total) === Number(x.amount) && devise === String(x.currency).toLowerCase());
  if (!correspond) {
    await journaliser(cfg, 'stripe_webhook_montant',
      'Ecart de montant pour ' + ligne.plan_id + ' : recu ' + session.amount_total + ' ' + session.currency +
      ', attendu ' + acceptes.map(x => x.amount + ' ' + x.currency).join(' ou ') +
      '. Abonnement NON active, laisse en attente. ' + infos);
    return { statusCode: 200, body: 'montant a verifier — laisse en attente' };
  }

  /* ---- Lien de paiement reellement paye (optionnel mais strict si defini) */
  if (cfg.plinks) {
    const planDuLien = session.payment_link ? cfg.plinks[session.payment_link] : null;
    if (planDuLien !== ligne.plan_id) {
      await journaliser(cfg, 'stripe_webhook_lien',
        'Le Payment Link paye (' + (session.payment_link || '?') + ' -> ' + (planDuLien || 'inconnu') +
        ') ne correspond pas au plan de la ligne (' + ligne.plan_id + '). Laisse en attente. ' + infos);
      return { statusCode: 200, body: 'lien incoherent — laisse en attente' };
    }
  }

  /* ---- Confirmation atomique cote SQL ----------------------- */
  let reponse;
  try {
    reponse = await sb(cfg, 'rpc/confirmer_paiement_stripe', {
      method: 'POST',
      body: {
        p_reference: ref,
        p_session_id: sessionId,
        p_amount: Number(session.amount_total),
        p_currency: String(session.currency || '').toLowerCase(),
        p_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        p_livemode: !!livemode,
        p_payload: null
      }
    });
  } catch (e) {
    /* Exception volontaire de la fonction (abonnement deja modifie) :
       decision humaine. Tout autre echec (reseau, 5xx, 401, 404...) est
       releve -> 500 -> Stripe reessaie, l'idempotence evite tout doublon. */
    const msg = (e && e.donnees && e.donnees.message) || '';
    if (e && e.statut === 400 && /ABONNEMENT_DEJA_MODIFIE/.test(msg)) {
      await journaliser(cfg, 'stripe_webhook_a_traiter_manuellement',
        'ABONNEMENT_DEJA_MODIFIE : aucune ecriture appliquee. ' + infos);
      return { statusCode: 200, body: 'abonnement deja modifie — manuel' };
    }
    throw e;
  }

  const r = Array.isArray(reponse) ? reponse[0] : reponse;
  if (r && r.ok === true) return { statusCode: 200, body: String(r.code || 'ok') };

  const code = r && r.code ? r.code : 'INCONNU';
  await journaliser(cfg, 'stripe_webhook_a_traiter_manuellement',
    code + ' — ' + (CODES_MANUELS[code] || 'reponse inattendue') + '. ' + infos);
  return { statusCode: 200, body: 'manuel: ' + code };
}

/* ---- Remboursement / litige : journal seulement ------------- */
async function traiterRetour(cfg, evenement) {
  const obj = (evenement.data && evenement.data.object) || {};
  const pi = (typeof obj.payment_intent === 'string' && obj.payment_intent) || '';
  let refs = '?';
  if (pi) {
    try {
      const l = await sb(cfg, 'payments?provider_payload->>payment_intent=eq.' + encodeURIComponent(pi) +
        '&select=reference,user_id,plan_id,status');
      if (Array.isArray(l) && l.length) refs = l.map(x => x.reference + ' (' + x.plan_id + ', user ' + x.user_id + ', ' + x.status + ')').join('; ');
    } catch (e) { /* recherche best effort */ }
  }
  await journaliser(cfg, 'stripe_webhook_remboursement_ou_litige',
    evenement.type + ' — action admin requise (abonnement NON modifie automatiquement). ' +
    'payment_intent=' + (pi || '?') + ' montant=' + obj.amount + ' ' + obj.currency + ' paiements=' + refs);
  return { statusCode: 200, body: 'journalise' };
}

/* ============================================================ */
exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const cfg = lireConfig();
  if (!cfg.secret || !cfg.serviceKey || !cfg.supabaseUrl) {
    await journaliser(cfg, 'stripe_webhook_config', 'Variables manquantes : STRIPE_WEBHOOK_SECRET / cle service_role / SUPABASE_URL');
    return { statusCode: 500, body: 'Configuration incomplete' };
  }

  // Le corps doit rester EXACTEMENT tel que Stripe l'a envoye.
  const corpsBrut = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : (event.body || '');
  const h = event.headers || {};
  const entete = h['stripe-signature'] || h['Stripe-Signature'];
  const verif = signatureValide(cfg.secret, corpsBrut, entete);
  if (!verif.ok) {
    await journaliser(cfg, 'stripe_webhook_signature', 'Appel rejete : ' + verif.raison);
    return { statusCode: 400, body: 'Signature invalide' };
  }

  let evenement;
  try { evenement = JSON.parse(corpsBrut); }
  catch (e) { return { statusCode: 400, body: 'Corps illisible' }; }

  const type = evenement.type;
  const livemode = evenement.livemode === true;

  /* Evenement de test : refuse sauf autorisation explicite. Le secret du
     endpoint etant propre a chaque mode, cela evite qu'un endpoint de test
     laisse branche active un vrai abonnement avec un faux paiement. */
  if (!livemode && !cfg.autoriserTest) {
    await journaliser(cfg, 'stripe_webhook_test_ignore', 'Evenement mode test ignore (STRIPE_ALLOW_TEST non defini) : ' + type);
    return { statusCode: 200, body: 'mode test ignore' };
  }

  try {
    if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
      const session = (evenement.data && evenement.data.object) || {};
      // 'unpaid' = paiement asynchrone pas encore encaisse : on attend
      // checkout.session.async_payment_succeeded.
      if (session.payment_status !== 'paid') return { statusCode: 200, body: 'non paye' };
      return await traiterPaiement(cfg, session, livemode);
    }
    if (type === 'charge.refunded' || type === 'charge.dispute.created') {
      return await traiterRetour(cfg, evenement);
    }
    // Tout autre evenement : 200 pour que Stripe ne le rejoue pas sans fin.
    return { statusCode: 200, body: 'ignore' };
  } catch (e) {
    await journaliser(cfg, 'stripe_webhook_traitement', type + ' — ' + (e && e.message ? e.message : String(e)));
    // 500 : Stripe reessaiera. L'idempotence SQL garantit zero doublon.
    return { statusCode: 500, body: 'erreur de traitement' };
  }
};

exports.__test = { signatureValide, lireConfig, FORMAT_REFERENCE };
