/* ============================================================
   VIP BETCOTE — Envoi d'un e-mail contenant un code (26/11, James : point 8)
   ------------------------------------------------------------
   Avant : la fonction publique send-email acceptait N'IMPORTE QUEL e-mail
   et N'IMPORTE QUEL « code » (texte libre, insere tel quel dans le HTML)
   -> n'importe qui pouvait vider le quota Resend, ou envoyer un faux
   message au nom de contact@vipbetcote.com.
   Maintenant : ce module n'est appele QUE par le serveur
   (request-signup-code), dans le meme processus, sans passer par Internet.
   Le code doit faire exactement 6 chiffres ; l'adresse doit etre valide.
   Modele de l'e-mail : identique a l'ancien send-email.js.
   ============================================================ */
'use strict';

const { alerterEchecEmail } = require('./alerte-email-echec');

const TEXTES = {
  verification: {
    subject: 'Votre code de vérification VipBetcote',
    title: 'Vérification de votre adresse e-mail',
    message: 'Voici votre code de vérification pour continuer sur VipBetcote.',
    securityMessage: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez simplement ignorer cet e-mail."
  },
  password_reset: {
    subject: 'Code de réinitialisation de votre mot de passe VipBetcote',
    title: 'Réinitialisation de votre mot de passe',
    message: 'Voici votre code de réinitialisation de mot de passe.',
    securityMessage: "Si vous n'êtes pas à l'origine de cette demande, votre mot de passe ne sera pas modifié. Vous pouvez ignorer cet e-mail."
  }
};

function construireHtml(code, type) {
  const { subject, title, message, securityMessage } = TEXTES[type];
  return `
<!DOCTYPE html>

<html lang="fr">

<head>

  <meta charset="UTF-8">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <meta
    name="color-scheme"
    content="dark"
  >

  <title>${subject}</title>

</head>


<body
  style="
    margin:0;
    padding:0;
    background:#030617;
    font-family:Arial,Helvetica,sans-serif;
    color:#F4F3ED;
  "
>


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  role="presentation"
  style="
    width:100%;
    background:#030617;
    padding:22px 12px;
  "
>

<tr>

<td align="center">


<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  role="presentation"
  style="
    max-width:540px;
    background:#081020;
    border:1px solid rgba(244,243,237,.09);
    border-radius:16px;
    overflow:hidden;
  "
>


<!-- =====================================================
     HEADER
===================================================== -->

<tr>

<td
  align="center"
  style="
    padding:25px 20px 20px;
    background:#030617;
  "
>

  <div
    style="
      font-size:18px;
      line-height:22px;
      font-weight:800;
      letter-spacing:1px;
      color:#F4F3ED;
      text-align:center;
    "
  >
    VipBetcote
  </div>


  <div
    style="
      margin-top:5px;
      font-size:11px;
      line-height:17px;
      font-weight:600;
      letter-spacing:1px;
      color:#C9A44C;
      text-align:center;
    "
  >
    Genyen chak lèw jwe
  </div>

</td>

</tr>


<!-- =====================================================
     LIGNE VERTE
===================================================== -->

<tr>

<td
  style="
    height:2px;
    padding:0;
    background:#2ED47F;
    font-size:0;
    line-height:0;
  "
>
&nbsp;
</td>

</tr>


<!-- =====================================================
     CONTENU
===================================================== -->

<tr>

<td
  style="
    padding:28px 28px 26px;
    background:#081020;
  "
>


<h1
  style="
    margin:0 0 12px;
    text-align:center;
    font-size:22px;
    line-height:29px;
    font-weight:800;
    color:#F4F3ED;
  "
>
  ${title}
</h1>


<p
  style="
    margin:0 auto 20px;
    max-width:430px;
    text-align:center;
    font-size:14px;
    line-height:21px;
    color:#93A89B;
  "
>
  ${message}
</p>


<!-- =====================================================
     CODE
===================================================== -->

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  border="0"
  role="presentation"
  style="
    width:100%;
    background:#0E1728;
    border:1px solid rgba(46,212,127,.38);
    border-radius:12px;
  "
>

<tr>

<td
  align="center"
  style="
    padding:18px 12px 20px;
  "
>


<div
  style="
    margin-bottom:7px;
    font-size:10px;
    line-height:15px;
    font-weight:700;
    letter-spacing:2px;
    color:#2ED47F;
  "
>
  VOTRE CODE
</div>


<div
  style="
    font-family:'Courier New',Courier,monospace;
    font-size:30px;
    line-height:36px;
    font-weight:800;
    letter-spacing:7px;
    color:#E8CE8A;
    text-align:center;
  "
>
  ${code}
</div>


</td>

</tr>

</table>


<!-- =====================================================
     EXPIRATION
===================================================== -->

<p
  style="
    margin:16px 0 0;
    text-align:center;
    font-size:12px;
    line-height:18px;
    color:#93A89B;
  "
>

  Ce code est valable pendant

  <strong
    style="
      color:#F4F3ED;
    "
  >
    15 minutes.
  </strong>

</p>


<!-- =====================================================
     SÉCURITÉ
===================================================== -->

<p
  style="
    margin:13px auto 0;
    max-width:430px;
    text-align:center;
    font-size:11px;
    line-height:17px;
    color:#66786F;
  "
>
  ${securityMessage}
</p>


</td>

</tr>


<!-- =====================================================
     FOOTER
===================================================== -->

<tr>

<td
  align="center"
  style="
    padding:12px 15px 14px;
    background:#030617;
    border-top:1px solid rgba(244,243,237,.07);
  "
>

<div
  style="
    font-size:9px;
    line-height:14px;
    color:#566A60;
  "
>
  © 2026 VipBetcote — Tous droits réservés.
</div>

</td>

</tr>


</table>


</td>

</tr>

</table>


</body>

</html>
  `;
}

/* Retourne { ok: true } ou { ok: false, statut, erreur }. Ne leve jamais d'exception. */
async function envoyerEmailCode({ email, code, type = 'verification' } = {}) {
  email = String(email || '').trim().toLowerCase();
  code = String(code == null ? '' : code);
  if (!TEXTES[type]) return { ok: false, statut: 400, erreur: 'type_inconnu' };
  if (!/^[^\s@<>"]+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email)) return { ok: false, statut: 400, erreur: 'email_invalide' };
  if (!/^\d{6}$/.test(code)) return { ok: false, statut: 400, erreur: 'code_invalide' };
  const source = type === 'password_reset' ? 'modpas_bliye' : 'code_inscription';
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'VipBetcote <contact@vipbetcote.com>',
        to: email,
        subject: TEXTES[type].subject,
        html: construireHtml(code, type)
      })
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      await alerterEchecEmail({ source, email, statut: resp.status, detail: JSON.stringify(data || {}) });
      return { ok: false, statut: resp.status, erreur: data };
    }
    return { ok: true };
  } catch (err) {
    await alerterEchecEmail({ source, email: null, statut: 0, detail: err && err.message });
    return { ok: false, statut: 0, erreur: (err && err.message) || 'erreur_inconnue' };
  }
}

module.exports = { envoyerEmailCode, construireHtml };
