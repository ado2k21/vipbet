/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DE DÉCLENCHEMENT MANUEL (Netlify Function, Background)
 * Fichier : netlify/functions/bot-generate-tickets-trigger-background.js
 * ----------------------------------------------------------------------------
 * Créé le 28/08 v5, suite à la confirmation (test réel, page blanche) que
 * Netlify bloque l'invocation directe par URL de toute fonction qui exporte
 * un config.schedule — même une fonction "Background" (mêmes symptômes
 * qu'avec l'ancien bot-generate-tickets.js, voir bot-diagnostics.js pour
 * le précédent historique sur ce même problème).
 *
 * Ce fichier N'EXPORTE AUCUN config.schedule — jamais déclenché par le
 * cron (seul bot-generate-tickets-background.js l'est, via netlify.toml).
 * Il existe UNIQUEMENT pour permettre un déclenchement manuel par URL,
 * pour tester ou forcer une génération immédiate.
 *
 * IMPORTANT : le suffixe "-background" est OBLIGATOIRE dans le NOM DE CE
 * FICHIER (pas seulement dans celui qu'il relaie) — c'est le nom du
 * fichier déployé qui détermine si Netlify accorde 15 minutes d'exécution
 * ou seulement les ~10-26s d'une fonction normale. Un relais SANS ce
 * suffixe ferait tourner le handler (jusqu'à ~7 minutes, appels /odds
 * espacés) dans le budget d'une fonction normale et se ferait couper en
 * plein milieu.
 *
 * Réutilise le handler tel quel via require() — jamais une copie séparée.
 * ============================================================================
 */

module.exports.handler = require('./bot-generate-tickets-background.js').handler;
