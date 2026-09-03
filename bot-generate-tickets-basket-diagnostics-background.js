/**
 * ============================================================================
 * VIP BETCOTE — RELAIS DE TEST MANUEL POUR LE BOT BASKETBALL
 * Fichier : netlify/functions/bot-generate-tickets-basket-diagnostics-background.js
 * ----------------------------------------------------------------------------
 * REMPLACE bot-generate-tickets-basket-diagnostics.js (SUPPRIMÉ — jamais
 * déployé sous ce nom, aucune trace à nettoyer côté GitHub au-delà de ne
 * pas l'ajouter). Cause du crash "Task timed out after 30.00 seconds" :
 * un nom de fichier SANS le suffixe -background fait tourner la fonction
 * comme une Netlify Function normale (budget ~30s), jamais assez pour le
 * bot basketball qui espace volontairement ses appels API de 6,5s (jusqu'à
 * 30 candidats à examiner, largement plus de 30s au total). Le suffixe
 * -background dans LE NOM DU FICHIER LUI-MÊME (pas une option de config)
 * est ce qui fait basculer Netlify sur le budget de 15 minutes — même
 * mécanisme déjà utilisé par bot-generate-tickets-basket-background.js
 * lui-même et par bot-generate-tickets-background.js (foot).
 *
 * CONSÉQUENCE IMPORTANTE : une Background Function répond immédiatement
 * (202, corps vide) — Netlify ne fait JAMAIS attendre le visiteur/l'appelant
 * jusqu'à la fin réelle du traitement. Le résultat détaillé n'apparaît donc
 * PAS dans le navigateur après l'appel (c'est normal, pas un nouvel échec) :
 * il faut aller le chercher soit dans le panneau de logs Netlify de CETTE
 * fonction, soit — plus simple — directement dans la table Supabase
 * bot_run_log (colonne bot='basket'), déjà alimentée par le correctif
 * précédent, après avoir laissé 1 à 2 minutes s'écouler.
 *
 * JAMAIS de logique dupliquée — une seule ligne utile, le require() du
 * fichier réel.
 *
 * Utilisation :
 *   /.netlify/functions/bot-generate-tickets-basket-diagnostics-background?token=VOTRE_JETON
 * Attendre l'écran "Function has crashed" du 1er essai ne se reproduira
 * plus : la réponse sera vide/quasi instantanée (202), c'est le comportement
 * ATTENDU d'une Background Function, pas un signe d'échec.
 * ============================================================================
 */

module.exports.handler = require('./bot-generate-tickets-basket-background.js').handler;
