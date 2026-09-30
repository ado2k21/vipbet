'use strict';

// ============================================================================
// Garde-fous API-Sports partagés (30/09) — fonctions PURES ou quasi pures,
// sans dépendance, testables seules. Ajoutées après l'audit de l'intégration :
// AUCUNE logique métier (choix des matchs, cotes, fiches) n'est ici, seulement
// la décision « faut-il encore appeler API-Sports ? » et le verrou
// anti-chevauchement entre deux exécutions d'un même bot.
// ============================================================================

// Quand le VRAI quota restant (en-tête x-ratelimit-requests-remaining) tombe à
// cette valeur ou en dessous, la GÉNÉRATION arrête ses appels. Les ~20 requêtes
// restantes sont réservées au règlement des résultats et aux diagnostics.
const RESERVE_REEL_GENERATION = 20;

// Durée de vie du verrou = durée maximale d'une fonction Background Netlify
// (15 min). Libéré explicitement à la fin de l'exécution ; ce TTL ne sert que
// si la fonction est tuée avant de pouvoir le libérer.
const TTL_VERROU_SECONDES = 900;

// Un match SANS cote (réponse valide mais vide) n'est pas redemandé pendant
// cette durée : les passages de secours du même soir ne repaient pas l'appel.
const TTL_CACHE_SANS_COTE_MS = 2 * 60 * 60 * 1000;

// 429 : une pause plus longue laisse la fenêtre « par minute » se vider ;
// deux échecs consécutifs = on arrête net, plus aucun appel pour ce passage.
const PAUSE_APRES_429_MS = 60 * 1000;
const MAX_429_CONSECUTIFS = 2;

// Vrai si le quota réel restant est à la réserve ou en dessous. Une valeur
// absente / illisible ne bloque JAMAIS (on ne coupe que sur une preuve).
function resteReelSousReserve(remaining, reserve) {
  if (remaining === null || remaining === undefined || remaining === '') return false;
  const n = parseInt(remaining, 10);
  if (!Number.isFinite(n)) return false;
  const seuil = (reserve === undefined || reserve === null) ? RESERVE_REEL_GENERATION : reserve;
  return n <= seuil;
}

// Classe le texte d'erreur renvoyé dans data.errors par API-Sports.
//  - 'quota'    : limite journalière atteinte → plus aucun appel jusqu'à 00:00 UTC
//  - 'suspendu' : compte suspendu / clé refusée → inutile d'insister
//  - 'debit'    : trop de requêtes par minute → une pause peut suffire
//  - null       : autre erreur (ou aucune)
function classerErreurApi(messages) {
  const texte = (Array.isArray(messages) ? messages : [messages]).filter(Boolean).join(' | ');
  if (!texte) return null;
  if (/suspend|account.*(disabled|blocked)|invalid.*(api|key)|application key/i.test(texte)) return 'suspendu';
  if (/request limit|reached the.*limit|daily/i.test(texte)) return 'quota';
  if (/too many requests|rate ?limit/i.test(texte)) return 'debit';
  return null;
}

// Extrait la liste de messages d'un champ data.errors (tableau OU objet).
function messagesErreur(errors) {
  if (!errors) return [];
  const liste = Array.isArray(errors) ? errors : Object.values(errors);
  return liste.filter(m => m !== null && m !== undefined && String(m) !== '').map(String);
}

// Cache : marqueur d'un match sans cote.
const MARQUEUR_SANS_COTE = { __sansCote: true };
function estMarqueurSansCote(payload) {
  return !!(payload && typeof payload === 'object' && !Array.isArray(payload) && payload.__sansCote === true);
}
// Un marqueur « sans cote » n'est valable que TTL_CACHE_SANS_COTE_MS ; une
// vraie réponse en cache garde le TTL habituel (géré par l'appelant).
function marqueurSansCoteEncoreValable(ageMs) {
  return typeof ageMs === 'number' && ageMs >= 0 && ageMs < TTL_CACHE_SANS_COTE_MS;
}

// ----------------------------------------------------------------------------
// Verrou atomique (RPC try_acquire_bot_lock / release_bot_lock, migration du
// 30/09). sbRpc = la fonction d'appel RPC de l'appelant. Ne lève JAMAIS :
//  - { acquis: true }                          → on peut travailler
//  - { acquis: false }                         → une autre exécution tourne déjà
//  - { acquis: true, indisponible: true, ... } → verrou injoignable (RPC absente,
//    Supabase en panne…) : on continue COMME AVANT, jamais bloquer la
//    génération à cause d'un problème de verrou.
// ----------------------------------------------------------------------------
async function acquerirVerrou(sbRpc, cle, detenteur, ttlSecondes) {
  try {
    const r = await sbRpc('try_acquire_bot_lock', {
      p_key: cle,
      p_ttl_seconds: ttlSecondes || TTL_VERROU_SECONDES,
      p_holder: detenteur
    });
    if (r === false) return { acquis: false };
    if (r === true) return { acquis: true };
    return { acquis: true, indisponible: true, raison: 'réponse inattendue du verrou' };
  } catch (e) {
    return { acquis: true, indisponible: true, raison: e.message };
  }
}

async function libererVerrou(sbRpc, cle, detenteur) {
  try {
    await sbRpc('release_bot_lock', { p_key: cle, p_holder: detenteur });
    return true;
  } catch (e) {
    return false; // le TTL finira par libérer
  }
}

// Identifiant d'exécution (détenteur du verrou).
function nouveauDetenteur(prefixe) {
  return `${prefixe || 'run'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ----------------------------------------------------------------------------
// Règlement : quels tickets ont VRAIMENT besoin d'un appel API-Sports ?
// legsRows = [{ ticket_id, result }] (toutes les legs des tickets pending).
// - Un ticket dont TOUTES les legs sont déjà réglées et toutes 'void' attend
//   une décision manuelle de l'admin : le re-régler ne change rien, et chaque
//   passage horaire coûtait pourtant 1 appel foot + 1 appel basket.
// - Un ticket avec au moins une leg sans résultat a besoin de l'API.
// - Un ticket dont toutes les legs sont réglées mais avec won/lost est gardé
//   (il faut encore calculer son statut final), SANS besoin d'appel API.
// ----------------------------------------------------------------------------
function trierTicketsAReglerSelonLegs(tickets, legsRows) {
  const parTicket = new Map();
  (legsRows || []).forEach(l => {
    if (!l) return;
    if (!parTicket.has(l.ticket_id)) parTicket.set(l.ticket_id, []);
    parTicket.get(l.ticket_id).push(l);
  });
  const aTraiter = [];
  const besoinApiIds = new Set();
  (tickets || []).forEach(t => {
    const legs = parTicket.get(t.id) || [];
    const aLegSansResultat = legs.some(l => !l.result);
    const aLegDecisive = legs.some(l => l.result === 'won' || l.result === 'lost');
    if (!aLegSansResultat && !aLegDecisive) return; // tout void (ou aucune leg) : rien à faire automatiquement
    aTraiter.push(t);
    if (aLegSansResultat) besoinApiIds.add(t.id);
  });
  return { aTraiter, besoinApiIds };
}

module.exports = {
  RESERVE_REEL_GENERATION,
  TTL_VERROU_SECONDES,
  TTL_CACHE_SANS_COTE_MS,
  PAUSE_APRES_429_MS,
  MAX_429_CONSECUTIFS,
  MARQUEUR_SANS_COTE,
  resteReelSousReserve,
  classerErreurApi,
  messagesErreur,
  estMarqueurSansCote,
  marqueurSansCoteEncoreValable,
  acquerirVerrou,
  libererVerrou,
  nouveauDetenteur,
  trierTicketsAReglerSelonLegs
};
