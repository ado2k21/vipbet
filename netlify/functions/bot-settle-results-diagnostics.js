/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DE TEST MANUEL POUR bot-settle-results
 * Fichier : netlify/functions/bot-settle-results-diagnostics.js
 * ----------------------------------------------------------------------------
 * Pourquoi ce fichier existe (04/09) : Netlify bloque l'accès direct par URL
 * à toute fonction déclarant un `schedule` (qu'il soit déclaré dans
 * netlify.toml ou via module.exports.config, comme ici) — même avec le bon
 * jeton de test. James a constaté une page blanche en appelant
 * bot-settle-results directement. Ce fichier n'est PAS planifié (aucun
 * `config.schedule`), donc Netlify l'expose normalement en HTTP — il
 * réexporte simplement le VRAI handler de bot-settle-results.js, sans
 * jamais dupliquer une seule ligne de sa logique. Toujours garder les deux
 * fichiers synchronisés au déploiement (aucune action requise : celui-ci
 * lit toujours le code le plus récent de l'autre au démarrage).
 *
 * Utilisation : ouvrir dans Safari —
 *   https://machecha.netlify.app/.netlify/functions/bot-settle-results-diagnostics?token=test2026vip
 * ============================================================================
 */
module.exports.handler = require('./bot-settle-results.js').handler;
