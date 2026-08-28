/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DIAGNOSTIC (Netlify Function, HTTP, PAS planifiée)
 * Fichier : netlify/functions/bot-diagnostics.js
 * ----------------------------------------------------------------------------
 * Existe UNIQUEMENT parce que bot-generate-tickets.js est déclarée
 * "scheduled" dans netlify.toml (correctif du 27/08 pour le cron
 * automatique) — depuis, Netlify BLOQUE toute invocation HTTP directe de
 * CETTE fonction précise (comportement documenté officiellement : "you
 * can't invoke [scheduled functions] directly with a URL"). Conséquence
 * concrète : tous les modes diagnostic internes à bot-generate-tickets.js
 * (?diag=bets, ?diag=leagues, ?diag=teams, ?diag=nba, ?diag=basket,
 * ?diag=bsd, ?diag=bbsd) sont devenus injoignables par URL — page blanche
 * garantie, sans aucune erreur visible (le blocage a lieu AVANT que le code
 * de la fonction s'exécute, donc même les logs Netlify restent muets).
 *
 * Ce fichier ne contient AUCUNE logique propre — il relaie tel quel vers
 * bot-generate-tickets.js (déjà exporté via module.exports.handler), pour
 * ne jamais dupliquer les branches diag ailleurs (une seule source de
 * vérité, comme bot-generate-tickets-manual.js le fait déjà pour la
 * génération). AUCUN config.schedule exporté ici : cette fonction reste
 * donc invocable normalement par URL.
 *
 * Utilisation (identique à avant, remplacer juste le nom de fonction dans
 * l'URL — remplacer <TOKEN> par la valeur de BOT_TEST_TOKEN, jamais écrite
 * ici pour éviter que le scanner de secrets Netlify ne la détecte dans un
 * simple commentaire d'exemple) :
 *   https://onliye.netlify.app/.netlify/functions/bot-diagnostics?token=<TOKEN>&diag=bets
 *   https://onliye.netlify.app/.netlify/functions/bot-diagnostics?token=<TOKEN>&diag=leagues&q=Portugal
 *   https://onliye.netlify.app/.netlify/functions/bot-diagnostics?token=<TOKEN>
 *     (sans &diag=... : déclenche une génération manuelle complète, comme
 *     avant — même jeton BOT_TEST_TOKEN, même comportement, rien de neuf.)
 * ============================================================================
 */

const bot = require('./bot-generate-tickets.js');

module.exports.handler = bot.handler;
// PAS de module.exports.config ici — c'est précisément ce qui garde cette
// fonction "normale" aux yeux de Netlify, donc invocable par URL.
