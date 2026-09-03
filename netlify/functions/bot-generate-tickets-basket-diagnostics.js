/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DE TEST MANUEL POUR LE BOT BASKETBALL
 * Fichier : netlify/functions/bot-generate-tickets-basket-diagnostics.js
 * ----------------------------------------------------------------------------
 * Créé (session diagnostic) pour la même raison que
 * bot-settle-results-diagnostics.js : bot-generate-tickets-basket-background.js
 * est une Netlify Background Function planifiée (schedule dans son export
 * config) — Netlify bloque silencieusement tout appel direct par URL sur
 * ce type de fonction, avant même que le code ne s'exécute. Ce relais N'EST
 * PAS planifié (aucun export config ici) : il se contente de réexposer le
 * handler existant sous une URL appelable manuellement à tout moment.
 *
 * JAMAIS de logique dupliquée — une seule ligne utile, le require() du
 * fichier réel. Toute correction future du moteur basketball se fait
 * uniquement dans bot-generate-tickets-basket-background.js ; ce relais
 * n'a besoin d'aucune modification tant que la structure du handler ne
 * change pas.
 *
 * Utilisation : appeler cette URL avec le jeton de test pour forcer un
 * passage réel, en dehors de la fenêtre normale 19h-20h59 Haïti :
 *   /.netlify/functions/bot-generate-tickets-basket-diagnostics?token=VOTRE_JETON
 *
 * Le résultat complet (matchsTrouves, statutsRecus, poolFinal, erreurs,
 * fichesPubliees) est à la fois dans les logs Netlify de CETTE fonction-ci
 * (jamais dans ceux de la fonction planifiée d'origine) et, depuis le
 * correctif du même jour, persisté dans la table Supabase bot_run_log
 * (bot='basket') — consultable directement depuis la base, sans ouvrir
 * Netlify.
 * ============================================================================
 */

module.exports.handler = require('./bot-generate-tickets-basket-background.js').handler;
