/* ============================================================
   VIP BETCOTE — send-email (FERMEE au public le 26/11, James : point 8)
   ------------------------------------------------------------
   Cette adresse acceptait n'importe quel e-mail et n'importe quel texte
   comme « code » : n'importe qui pouvait vider le quota Resend (plan
   gratuit : 100/jour) ou envoyer un faux message au nom de
   contact@vipbetcote.com. Seul request-signup-code s'en servait : il
   appelle maintenant directement lib/email-code.js (meme processus, meme
   modele d'e-mail). Aucun autre appelant (site, base, autres fonctions).
   Le fichier reste pour qu'un appel residuel recoive une reponse claire.
   ============================================================ */
exports.handler = async (event) => {
  console.warn('[send-email] appel public refuse (fonction fermee le 26/11)', event && event.httpMethod);
  return { statusCode: 403, body: JSON.stringify({ error: 'appel_interdit' }) };
};
