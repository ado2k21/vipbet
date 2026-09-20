/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DE TEST DES ALERTES (Netlify Function normale)
 * Fichier : netlify/functions/alerte-watchdog-relais.js
 * ----------------------------------------------------------------------------
 * Une fonction planifiée (config.schedule) ne peut jamais être appelée
 * directement par URL : ce relais NON planifié réutilise son handler tel quel.
 * Aucun config.schedule ici, aucune logique dupliquée.
 *
 * Le jeton BOT_TEST_TOKEN est OBLIGATOIRE (sinon 403) : jamais d'URL publique
 * qui déclenche des contrôles ou des envois.
 * Test d'envoi (email + Telegram si configuré), réponse immédiate en JSON :
 *   /.netlify/functions/alerte-watchdog-relais?token=TON_JETON&test=1
 * Contrôle réel à la demande (mêmes règles que le passage planifié) :
 *   /.netlify/functions/alerte-watchdog-relais?token=TON_JETON
 * ============================================================================
 */

const principal = require('./alerte-watchdog.js');

module.exports.handler = async (event) => {
  const qs = (event && event.queryStringParameters) || {};
  const jeton = process.env.BOT_TEST_TOKEN || '';
  if (!jeton || qs.token !== jeton) return { statusCode: 403, body: 'Accès refusé.' };
  return principal.handler(event);
};
