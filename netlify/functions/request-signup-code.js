/* ============================================================
   VIP BETCOTE — request-signup-code
   ------------------------------------------------------------
   Version SANS dépendance npm + logs détaillés à chaque étape,
   pour diagnostiquer précisément où ça bloque (visible dans
   Netlify > Functions > request-signup-code > logs).

   Variables d'environnement nécessaires :
     SUPABASE_URL
     SUPABASE_SERVICE_ROLE_KEY
     SITE_URL   (optionnel — sinon on déduit l'URL depuis la requête)
   ============================================================ */

const crypto = require('crypto');
const dns = require('dns').promises;
// 26/11 (point 8) : envoi DIRECT, sans repasser par la fonction publique send-email (fermee).
const { envoyerEmailCode } = require('./lib/email-code');

/* 25/11 (James : « refuser les adresses impossibles ») : aucun code n'est envoye vers un domaine
   qui ne recoit pas d'e-mails (ex. « garryson@1.com ») — chaque envoi rate videait le quota Resend
   (plan gratuit : 100/jour). Verification DNS (enregistrement MX) avec delai court.
   SECURITE : si la recherche DNS elle-meme est en panne (meme gmail.com introuvable) ou trop lente,
   on LAISSE PASSER — jamais bloquer les inscriptions par erreur. */
const DOMAINES_SURS = new Set(['gmail.com','googlemail.com','yahoo.com','yahoo.fr','yahoo.ca','yahoo.co.uk','ymail.com','rocketmail.com',
  'hotmail.com','hotmail.fr','hotmail.ca','outlook.com','outlook.fr','live.com','live.fr','msn.com','icloud.com','me.com','mac.com',
  'aol.com','protonmail.com','proton.me','gmx.com','zoho.com','mail.com']);
const cacheMx = new Map();
function avecDelai(promesse, ms) {
  return Promise.race([promesse, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('delai'), { code: 'DELAI' })), ms))]);
}
/* 25/11 (James : « un e-mail professionnel ou Yahoo doit toujours etre accepte ») : un domaine SANS
   enregistrement MX mais qui EXISTE (adresse IP) peut quand meme recevoir des e-mails (RFC 5321) :
   il est accepte. On ne refuse QUE les domaines qui n'existent pas du tout, ou qui declarent
   explicitement ne recevoir aucun e-mail (MX nul). */
async function domaineExiste(domaine) {
  for (const f of [dns.resolve4, dns.resolve6]) {
    try { const r = await avecDelai(f.call(dns, domaine), 3000); if (r && r.length) return 'oui'; }
    catch (e) { if (!(e && (e.code === 'ENOTFOUND' || e.code === 'ENODATA' || e.code === 'NXDOMAIN'))) return 'inconnu'; }
  }
  return 'non';
}
async function aDesMx(domaine) {
  try {
    const mx = await avecDelai(dns.resolveMx(domaine), 3000);
    // « MX nul » (RFC 7505) : le domaine declare explicitement ne recevoir aucun e-mail
    return (mx || []).some(m => m && m.exchange && m.exchange !== '.') ? 'oui' : 'non';
  } catch (e) {
    if (e && (e.code === 'ENOTFOUND' || e.code === 'ENODATA' || e.code === 'NXDOMAIN')) return 'non';
    return 'inconnu';   // delai, SERVFAIL, reseau... : on ne conclut rien
  }
}
async function domaineRecoitEmails(email) {
  const domaine = String(email.split('@')[1] || '').toLowerCase();
  if (DOMAINES_SURS.has(domaine)) return true;
  if (cacheMx.has(domaine)) return cacheMx.get(domaine);
  const r = await aDesMx(domaine);
  if (r === 'oui') { cacheMx.set(domaine, true); return true; }
  if (r === 'inconnu') return true;
  if (r === 'non') {
    const existe = await domaineExiste(domaine);
    if (existe !== 'non') { cacheMx.set(domaine, true); return true; }   // existe (ou on ne sait pas) : accepte
  }
  // « non » : on verifie que le DNS fonctionne (gmail.com doit avoir des MX) avant de refuser
  const controle = await aDesMx('gmail.com');
  if (controle !== 'oui') { console.warn('[request-signup-code] DNS indisponible : verification du domaine ignoree'); return true; }
  cacheMx.set(domaine, false);
  return false;
}

const CODE_TTL_MINUTES = 10;
const MAX_CODES_PER_WINDOW = 5;
const WINDOW_MINUTES = 15;
// 26/11 (point 6, quota Resend) : au moins 60 s entre deux codes pour la meme adresse.
const ATTENTE_ENTRE_CODES_S = 60;

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  console.log('[request-signup-code] env check — SUPABASE_URL present:', !!process.env.SUPABASE_URL,
    '| SERVICE_ROLE_KEY present:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  let email;
  try {
    const body = JSON.parse(event.body || '{}');
    email = (body.email || '').trim().toLowerCase();
  } catch (e) {
    console.error('[request-signup-code] body JSON invalide:', event.body);
    return { statusCode: 400, body: JSON.stringify({ error: 'bad_request' }) };
  }

  if (!isValidEmail(email)) {
    console.error('[request-signup-code] email invalide recu:', email);
    return { statusCode: 400, body: JSON.stringify({ error: 'email_invalide' }) };
  }

  // Partie avant @ contenant deja un domaine (« nomgmail.comnom@... ») : adresse collee deux fois.
  if (/(gmail|hotmail|outlook|icloud)\.?com/.test(email.split('@')[0] || '') || !(await domaineRecoitEmails(email))) {
    console.warn('[request-signup-code] adresse impossible refusee (aucun e-mail envoye) :', email);
    return { statusCode: 400, body: JSON.stringify({ error: 'adresse_impossible' }) };
  }

  const base = process.env.SUPABASE_URL + '/rest/v1';

  try {
    // Anti-abus : trop de demandes recentes pour cette adresse ?
    const fenetre = new Date(Date.now() - WINDOW_MINUTES * 60000).toISOString();
    const countUrl = base + '/signup_codes?select=id,created_at&email=eq.' + encodeURIComponent(email) +
      '&created_at=gte.' + encodeURIComponent(fenetre) + '&order=created_at.desc&limit=' + (MAX_CODES_PER_WINDOW + 1);
    const countResp = await fetch(countUrl, { headers: sbHeaders() });
    if (!countResp.ok) {
      console.error('[request-signup-code] lecture signup_codes echouee, status:', countResp.status, await countResp.text());
    }
    const countRows = countResp.ok ? await countResp.json() : [];
    if (countRows.length >= MAX_CODES_PER_WINDOW) {
      console.error('[request-signup-code] rate limit atteint pour', email);
      return { statusCode: 429, body: JSON.stringify({ error: 'trop_de_demandes' }) };
    }
    // Code envoye il y a moins de 60 s : on n'en envoie PAS un nouveau (le precedent est valable 10 min).
    const dernier = countRows[0] && Date.parse(countRows[0].created_at);
    const ecoule = dernier ? (Date.now() - dernier) / 1000 : Infinity;
    if (ecoule >= 0 && ecoule < ATTENTE_ENTRE_CODES_S) {
      const secondes = Math.max(1, Math.ceil(ATTENTE_ENTRE_CODES_S - ecoule));
      console.log('[request-signup-code] code deja envoye il y a', Math.round(ecoule), 's pour', email);
      return { statusCode: 429, body: JSON.stringify({ error: 'attendre', secondes }) };
    }

    // Génération du vrai code — jamais renvoyé au navigateur.
    const code = String(crypto.randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60000).toISOString();

    const insResp = await fetch(base + '/signup_codes', {
      method: 'POST',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ email, code_hash: hashCode(code), expires_at: expiresAt })
    });
    if (!insResp.ok) {
      // DIAGNOSTIC RENFORCE : le corps de reponse peut etre vide selon
      // ce qui a repondu (Supabase, ou un intermediaire type proxy/CDN
      // qui intercepte la requete avant Supabase). On capture donc AUSSI
      // le statut HTTP exact et le content-type, qui eux ne peuvent
      // jamais etre vides — de quoi trancher meme si le corps l'est.
      const rawText = await insResp.text();
      const contentType = insResp.headers.get('content-type') || '(aucun)';
      const detail = 'HTTP ' + insResp.status + ' [' + contentType + '] ' +
        (rawText ? rawText.slice(0, 300) : '(corps de reponse vide)');
      console.error('[request-signup-code] insertion signup_codes echouee, status:', insResp.status,
        'content-type:', contentType, 'corps brut:', rawText);
      return { statusCode: 500, body: JSON.stringify({ error: 'stockage_echoue', detail }) };
    }
    console.log('[request-signup-code] code stocke en base pour', email);

    // Envoi reel : directement via lib/email-code (meme modele d'e-mail que l'ancien send-email).
    const envoi = await envoyerEmailCode({ email, code, type: 'verification' });
    if (!envoi.ok) {
      const detail = typeof envoi.erreur === 'string' ? envoi.erreur : JSON.stringify(envoi.erreur || {}).slice(0, 300);
      console.error('[request-signup-code] envoi du code echoue:', envoi.statut, detail);
      return { statusCode: 502, body: JSON.stringify({ error: 'envoi_echoue', detail }) };
    }

    console.log('[request-signup-code] email envoye avec succes pour', email);
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error('[request-signup-code] exception non geree:', e && e.message, e && e.stack);
    return { statusCode: 500, body: JSON.stringify({ error: (e && e.message) || 'erreur_inconnue' }) };
  }
};
