/**
 * Alerte de securite 2FA envoyee a l'admin lui-meme (14/10).
 *
 * Comme les vrais services (Google, GitHub...) : chaque changement de la
 * double authentification d'un compte admin declenche un e-mail a
 * l'adresse de CE compte, pour qu'un changement non voulu soit repere
 * tout de suite.
 *
 * SECURITE :
 *  - le jeton de session est verifie aupres de Supabase Auth ;
 *  - le compte doit avoir profiles.role = 'admin' (lu avec la cle service) ;
 *  - l'e-mail part UNIQUEMENT vers l'adresse du compte connecte, jamais
 *    vers une adresse fournie par le navigateur ;
 *  - seuls 4 evenements connus sont acceptes.
 *
 * Variables : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
 */

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
const SERVICE_KEY = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const SUPABASE_ANON_KEY = 'sb_publishable_AtGtgVlUNec--OpbCQ-t3A_nU9oCGUF';

const EVENEMENTS = {
  mfa_active: {
    sujet: 'La double authentification (2FA) est activée sur votre compte',
    titre: '2FA activée',
    texte: 'La double authentification vient d’être activée sur votre compte administrateur VipBetcote. Un code vous sera désormais demandé à chaque connexion.'
  },
  mfa_desactive: {
    sujet: 'Alerte : la double authentification (2FA) a été désactivée',
    titre: '2FA désactivée',
    texte: 'La double authentification vient d’être désactivée sur votre compte administrateur VipBetcote. Votre compte n’est plus protégé que par votre mot de passe.'
  },
  mfa_reinitialise: {
    sujet: 'Alerte : votre 2FA a été réinitialisée avec un code de secours',
    titre: '2FA réinitialisée',
    texte: 'Un code de secours vient d’être utilisé pour réinitialiser la double authentification de votre compte administrateur VipBetcote. Pensez à la réactiver depuis le menu Sécurité 2FA.'
  },
  mfa_codes_regeneres: {
    sujet: 'Nouveaux codes de secours 2FA générés',
    titre: 'Nouveaux codes de secours',
    texte: 'De nouveaux codes de secours viennent d’être générés pour votre compte administrateur VipBetcote. Les anciens codes ne fonctionnent plus.'
  }
};

const reponse = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
});

const echapper = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return reponse(405, { error: 'Méthode non autorisée' });
  if (!SUPABASE_URL || !SERVICE_KEY || !process.env.RESEND_API_KEY) {
    return reponse(500, { error: 'Configuration serveur incomplète' });
  }

  let evenement;
  try { evenement = JSON.parse(event.body || '{}').evenement; } catch (e) { evenement = null; }
  const modele = EVENEMENTS[evenement];
  if (!modele) return reponse(400, { error: 'Événement inconnu' });

  // 1. Session valide ?
  const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || '';
  if (!auth.startsWith('Bearer ')) return reponse(401, { error: 'Authentification requise' });
  const token = auth.slice(7).trim();
  const respUser = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
  });
  if (!respUser.ok) return reponse(401, { error: 'Session invalide' });
  const user = await respUser.json();
  if (!user || !user.id || !user.email) return reponse(401, { error: 'Session invalide' });

  // 2. Compte admin ?
  const respProfil = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=role&id=eq.${encodeURIComponent(user.id)}&limit=1`, {
    headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY }
  });
  const profils = respProfil.ok ? await respProfil.json().catch(() => []) : [];
  if (!profils[0] || profils[0].role !== 'admin') return reponse(403, { error: 'Réservé aux administrateurs' });

  // 3. E-mail a l'adresse du compte uniquement
  const quand = new Date().toLocaleString('fr-FR', { timeZone: 'America/Port-au-Prince', dateStyle: 'long', timeStyle: 'short' });
  const ip = (event.headers && (event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'])) || '';
  const appareil = (event.headers && event.headers['user-agent']) || '';
  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${echapper(modele.sujet)}</title></head>
<body style="margin:0;padding:0;background:#030617;font-family:Arial,Helvetica,sans-serif;color:#F4F3ED">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#030617;padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#0A1324;border:1px solid rgba(244,243,237,.12);border-radius:18px;padding:28px">
<tr><td style="font-size:13px;letter-spacing:.14em;color:#E8CE8A;font-weight:bold">VIPBETCOTE &middot; S&Eacute;CURIT&Eacute;</td></tr>
<tr><td style="padding:16px 0 8px;font-size:22px;font-weight:bold;color:#ffffff">${echapper(modele.titre)}</td></tr>
<tr><td style="font-size:15px;line-height:1.6;color:#C5D0DC">${echapper(modele.texte)}</td></tr>
<tr><td style="padding:18px 0;font-size:13px;line-height:1.7;color:#9AA8BA">
<b style="color:#F4F3ED">Date :</b> ${echapper(quand)} (heure d'Ha&iuml;ti)<br>
${ip ? `<b style="color:#F4F3ED">Adresse IP :</b> ${echapper(ip)}<br>` : ''}
${appareil ? `<b style="color:#F4F3ED">Appareil :</b> ${echapper(appareil.slice(0, 160))}` : ''}
</td></tr>
<tr><td style="padding:14px 16px;border-radius:12px;background:rgba(226,99,79,.1);border:1px solid rgba(226,99,79,.35);font-size:13.5px;line-height:1.6;color:#F4C7BE">
Si vous n'&ecirc;tes pas &agrave; l'origine de ce changement, changez imm&eacute;diatement votre mot de passe et r&eacute;activez la double authentification.
</td></tr>
</table></td></tr></table></body></html>`;

  const envoi = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'VipBetcote <contact@vipbetcote.com>', to: user.email, subject: modele.sujet, html })
  });
  if (!envoi.ok) return reponse(502, { error: 'Envoi de l’e-mail impossible' });
  return reponse(200, { ok: true });
};
