/**
 * ============================================================================
 * ALERTE PAIEMENT MANUEL EN ATTENTE (Netlify Function — webhook, PAS planifiée)
 * Fichier : netlify/functions/alerte-paiement-manuel.js
 * ----------------------------------------------------------------------------
 * Appelée UNIQUEMENT par le trigger Postgres `trg_notifier_paiement_manuel`
 * (via pg_net), à l'instant même où un dépôt manuel MonCash/NatCash est créé
 * (status='pending', provider IS NULL, method in moncash/natcash — ce qui
 * exclut Stripe, qui a aussi provider NULL).
 *
 * AUCUNE URL publique déclenchante : la requête doit porter le header
 * x-webhook-secret, comparé au secret stocké dans Supabase Vault
 * (vault.secrets, nom 'paiement_manuel_webhook_secret'). Sans correspondance
 * exacte : 401, aucun envoi.
 *
 * Canal : WhatsApp uniquement (CallMeBot), par choix explicite — plus rapide,
 * pas de secours email/Telegram pour cette alerte précise. Le watchdog
 * (alerte-watchdog.js) reste séparé et inchangé.
 *
 * Ne JAMAIS déclarer dans netlify.toml (pas de config.schedule ici, même
 * règle que paiement-create.js / paiement-verify.js).
 *
 * Variables Netlify requises :
 *   WEBHOOK_PAIEMENT_MANUEL_SECRET   (doit être IDENTIQUE au secret Vault)
 *   WHATSAPP_PHONE + WHATSAPP_APIKEY (déjà utilisées par alerte-watchdog.js)
 * ============================================================================
 */

async function fetchAvecDelai(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 15000);
  try { return await fetch(url, Object.assign({}, options, { signal: ctrl.signal })); }
  finally { clearTimeout(t); }
}

// Abréviations de méthode demandées. S-T (Stripe) est prête pour le format,
// mais le déclencheur SQL ne se réveille aujourd'hui que pour MonCash/NatCash
// (voir notifier_paiement_manuel() dans la migration) — Stripe n'envoie donc
// pas encore cette alerte tant que le déclencheur n'est pas élargi.
const ABBR_METHODE = { moncash: 'M-C', natcash: 'N-C', stripe: 'S-T' };

// Format volontairement générique (aucune identité client — nom/email/ID —
// dans le message, par choix explicite) : seul le montant est dynamique.
function construireMessage(p) {
  const methode = ABBR_METHODE[p.method] || p.method || '?';
  const montant = p.amount_htg != null ? `${p.amount_htg} G` : '?';
  const ref = p.manual_transaction_ref || 'non fournie';
  return [
    'MANUEL EN ATTENTE',
    '',
    `Pl : User — ${montant}`,
    `Méthode : ${methode}`,
    `Réf. : ${ref}`,
    `Référence interne : ${p.reference || '?'}`,
    '',
    'À valider dans le panneau maintenant.'
  ].join('\n');
}

async function envoyerWhatsapp(texte) {
  const phone = process.env.WHATSAPP_PHONE;
  const apikey = process.env.WHATSAPP_APIKEY;
  if (!phone || !apikey) return { ok: false, raison: 'WhatsApp non configuré (WHATSAPP_PHONE/WHATSAPP_APIKEY manquants)' };
  // CallMeBot supprime l'apostrophe droite : on la remplace par l'apostrophe typographique.
  const corps = texte.slice(0, 1000).replace(/'/g, '\u2019');
  const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(phone) +
    '&text=' + encodeURIComponent(corps) + '&apikey=' + encodeURIComponent(apikey);
  try {
    const r = await fetchAvecDelai(url, { method: 'GET' }, 15000);
    if (!r.ok) return { ok: false, raison: `HTTP ${r.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, raison: e.message };
  }
}

async function handler(event) {
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée.' };
  }

  const secretAttendu = process.env.WEBHOOK_PAIEMENT_MANUEL_SECRET;
  const secretRecu = (event.headers && (event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'])) || '';
  if (!secretAttendu || secretRecu !== secretAttendu) {
    console.log('[ALERTE PAIEMENT] secret invalide ou absent');
    return { statusCode: 401, body: 'Accès refusé.' };
  }

  let payload;
  try { payload = JSON.parse(event.body || '{}'); }
  catch (e) {
    console.log('[ALERTE PAIEMENT] JSON invalide :', e.message);
    return { statusCode: 400, body: 'JSON invalide.' };
  }

  const texte = construireMessage(payload);
  const r = await envoyerWhatsapp(texte);
  if (!r.ok) console.log('[ALERTE PAIEMENT] échec WhatsApp :', r.raison);

  // Toujours 200 : un échec d'envoi ne doit jamais faire réessayer le trigger
  // Postgres à l'infini (pg_net n'a pas de logique de nouvel essai de toute
  // façon, mais on reste explicite et on journalise pour vérification manuelle).
  return { statusCode: 200, body: JSON.stringify({ ok: r.ok, raison: r.raison || null }) };
}

module.exports.handler = handler;
module.exports._interne = { construireMessage, envoyerWhatsapp };
