/**
 * ============================================================================
 * VIP BETCOTE — GÉNÉRATION MANUELLE DE FICHE BASKETBALL (Netlify Function, Background)
 * Fichier : netlify/functions/bot-generate-tickets-basket-manual-background.js
 * ----------------------------------------------------------------------------
 * Session suivante, demande explicite de James : bouton "GÉNÉRER FICHE
 * BASKETBALL" côté admin. Même principe que
 * bot-generate-tickets-manual-background.js côté foot : fonction
 * "Background" (jusqu'à 15 minutes), déclenchée à la demande, JAMAIS
 * planifiée (pas de config.schedule, NE PAS déclarer dans netlify.toml —
 * même raison que sa cousine foot : un schedule bloquerait l'invocation
 * directe par URL).
 *
 * CONSÉQUENCE ADMIN.HTML/INDEX.HTML : une fonction Background ne renvoie
 * jamais de réponse utilisable immédiatement (Netlify répond 202 tout de
 * suite, l'exécution continue ensuite, invisible pour le navigateur) — le
 * bouton doit avertir que la génération est en cours (~1-2 minutes,
 * beaucoup plus rapide que le foot : au plus 30 candidats, 6.5s entre
 * chaque, jamais 60) et proposer un "Vérifier maintenant" qui rafraîchit
 * simplement la liste des Fiches.
 *
 * AUCUNE restriction d'heure ici (contrairement à
 * bot-generate-tickets-basket-background.js, qui ne se déclenche qu'à
 * 19h00 Haïti) — l'admin peut générer manuellement à tout moment.
 *
 * SÉCURITÉ : identique au foot — accessible uniquement à un compte
 * profiles.role='admin', vérifié auprès de Supabase Auth à chaque appel,
 * jamais une confiance dans un rôle envoyé par le client.
 *
 * Réutilise directement les briques déjà exportées par
 * bot-generate-tickets-basket-background.js (extraction, construction,
 * publication via bot-generate-tickets-background.js) — jamais une copie
 * séparée.
 * ============================================================================
 */

const botBasket = require('./bot-generate-tickets-basket-background.js');
const bot = require('./bot-generate-tickets-background.js');

const {
  recupererMatchsBasketJour, recupererCoteParMatchBasket, extraireMarchesBasket,
  construireFicheBasket, BASKET_MIN_HOUR, BASKET_MAX_MINUTES,
  stats, resetStatsBasket, logFinal
} = botBasket;
const {
  verifierConfigSupabase, sbSelect, partsHaiti, heureHaitiDuMatch,
  dateCibleDemainHaiti, publierFiche, attendre, API_SPORTS_KEY,
  recupererFiabiliteMarches, annoterPoolAvecFiabilite
} = bot;

const SUPABASE_URL = process.env.SUPABASE_URL;
// Clé anon PUBLIQUE (même valeur que celle déjà embarquée côté navigateur
// dans index.html/admin.html — pas un secret, sert uniquement à faire
// valider un jeton utilisateur par Supabase Auth).
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWlmamZjcHlkZHdqa2ZlcnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTU2MjcsImV4cCI6MjEwMjI5MTYyN30.Bw7-CHFDYV4LmNtt6WyIc5gSt3UCe7n5agbyBEo6-Zc';

function jsonResponse(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

// Même vérification que bot-generate-tickets-manual-background.js — jamais
// une copie divergente de cette logique de sécurité.
async function verifierAdmin(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, code: 401, message: 'Authentification requise.' };
  }
  const token = authHeader.slice(7).trim();
  const resp = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: SUPABASE_ANON_KEY }
  });
  if (!resp.ok) return { ok: false, code: 401, message: 'Session invalide ou expirée.' };
  const user = await resp.json();
  if (!user || !user.id) return { ok: false, code: 401, message: 'Session invalide.' };

  const profils = await sbSelect('profiles', `select=role&id=eq.${user.id}&limit=1`);
  const role = profils && profils[0] && profils[0].role;
  if (role !== 'admin') return { ok: false, code: 403, message: 'Réservé aux administrateurs.' };
  return { ok: true, userId: user.id };
}

async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { erreur: 'Méthode non autorisée.' });
  }

  resetStatsBasket();

  if (!API_SPORTS_KEY) {
    return jsonResponse(500, { erreur: 'API_SPORTS_KEY absente des variables Netlify.' });
  }
  try { verifierConfigSupabase(); }
  catch (e) { return jsonResponse(500, { erreur: e.message }); }

  const authHeader = event.headers && (event.headers.authorization || event.headers.Authorization);
  const verif = await verifierAdmin(authHeader);
  if (!verif.ok) return jsonResponse(verif.code, { erreur: verif.message });

  // Date cible : toujours "demain" comme la version planifiée — pas de
  // choix de date personnalisé ici, contrairement au foot (le basketball
  // reste volontairement simple : une seule fiche partagée, jamais de
  // configuration par plan à choisir).
  const dateCible = dateCibleDemainHaiti();

  const matchsJour = await recupererMatchsBasketJour(dateCible);
  stats.matchsTrouves = matchsJour.length;
  if (!matchsJour.length) {
    logFinal();
    return jsonResponse(200, { publie: false, raison: 'Aucun match basketball disponible pour cette date.' });
  }

  const noms = {};
  let candidats = [];
  matchsJour.forEach(g => {
    if (!g || !g.id || !g.date) return;
    const statut = g.status && g.status.short;
    if (statut !== 'NS') return;
    const h = heureHaitiDuMatch(g.date);
    if (!h || h.iso !== dateCible) return;
    const minutesJour = h.heureNum * 60 + h.minuteNum;
    if (minutesJour < BASKET_MIN_HOUR * 60 || minutesJour > BASKET_MAX_MINUTES) return;
    noms[g.id] = {
      gameId: g.id,
      label: g.teams ? `${(g.teams.home && g.teams.home.name) || '?'} — ${(g.teams.away && g.teams.away.name) || '?'}` : `Match ${g.id}`,
      kickoffUtc: g.date,
      league: (g.league && g.league.name) || 'Basketball',
      leagueCountry: (g.country && g.country.name) || null
    };
    candidats.push(g.id);
  });

  const PLAFOND_CANDIDATS = 30;
  if (candidats.length > PLAFOND_CANDIDATS) candidats = candidats.slice(0, PLAFOND_CANDIDATS);

  if (!candidats.length) {
    logFinal();
    return jsonResponse(200, { publie: false, raison: 'Aucun match dans la fenêtre horaire basketball pour cette date.' });
  }

  let poolBasket = [];
  const DELAI_ENTRE_APPELS_MS = 6500;
  for (let i = 0; i < candidats.length; i++) {
    const gameId = candidats[i];
    const oddsItem = await recupererCoteParMatchBasket(gameId);
    if (oddsItem) poolBasket = poolBasket.concat(extraireMarchesBasket(oddsItem, dateCible, noms[gameId]));
    if (i < candidats.length - 1) await attendre(DELAI_ENTRE_APPELS_MS);
  }

  if (!poolBasket.length) {
    logFinal();
    return jsonResponse(200, { publie: false, raison: 'Aucune sélection basketball ne passe les filtres pour cette date.' });
  }

  const carteFiabilite = await recupererFiabiliteMarches();
  annoterPoolAvecFiabilite(poolBasket, carteFiabilite);

  const planPartage = { rank: 1, min_total_odd: null, max_total_odd: null };
  const fiche = construireFicheBasket(poolBasket);
  if (!fiche.valide) {
    logFinal();
    return jsonResponse(200, { publie: false, raison: 'Pas assez de sélections distinctes pour un combiné (minimum 2).' });
  }

  const nomsPourPublication = {};
  fiche.selections.forEach(s => {
    s.fixtureId = s.gameId;
    nomsPourPublication[s.gameId] = { label: noms[s.gameId] && noms[s.gameId].label };
  });
  const ok = await publierFiche(planPartage, fiche, dateCible, 'basket', nomsPourPublication, '', { source: 'admin' });

  logFinal();
  return jsonResponse(200, {
    publie: ok, coteTotale: fiche.coteTotale, selections: fiche.selections.length,
    raison: ok ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
  });
}

module.exports.handler = handler;
