/**
 * ============================================================================
 * VIP BETCOTE — BOT DE GÉNÉRATION DES FICHES BASKETBALL (Netlify Background Function)
 * Fichier : netlify/functions/bot-generate-tickets-basket-background.js
 * ----------------------------------------------------------------------------
 * Session suivante, demande explicite de James, confirmée par le diagnostic
 * ?diag=basket du même jour (host v1.basketball.api-sports.io, quota
 * SÉPARÉ du football — 100/jour indépendant, jamais partagé).
 *
 * RÈGLES EXPLICITES DE JAMES POUR CE MOTEUR (différentes du foot, jamais
 * les mêmes règles bêtement recopiées) — CORRIGÉES une 2e fois par James
 * (session suivante, même jour) :
 *  1. Pas seulement NBA — tous les championnats que les bookmakers
 *     couvrent réellement (confirmé le jour même : NBA W, LNBP, VBA,
 *     compétitions internationales...). Aucune liste blanche de
 *     championnat, contrairement à ALLOWED_LEAGUES_FOOT.
 *  2. UNE SEULE FICHE COMBINÉE par jour (pas plusieurs fiches comme la
 *     première version) — plusieurs sélections DANS cette même fiche
 *     (comme un combiné foot), jamais un seul pick isolé.
 *  3. AUCUN plancher de cote obligatoire (contrairement au foot, où
 *     min_total_odd bloquait avant le correctif du même jour) — mais un
 *     PLAFOND strict à 25 pour cette fiche unique, quel que soit le
 *     nombre de sélections qu'il faut pour l'atteindre ou non.
 *  4. Fenêtre horaire jusqu'à 23h59 Haïti (juste avant minuit) INCLUSE —
 *     jamais coupée à 22h00 comme le foot. dateCible reste "demain" (même
 *     règle que le foot), donc un match à 23h50 Haïti reste bien un match
 *     de demain, jamais exclu.
 *  5. La fiche est partagée à TOUS les plans, peu importe sa cote —
 *     publiée une seule fois à min_plan_rank=1, la cascade d'accès déjà
 *     en place couvre tous les rangs au-dessus automatiquement.
 *  6. Générée à 19h00 Haïti — VOLONTAIREMENT différent des 18h30 du foot
 *     (demande explicite de James : éviter que les deux moteurs tournent
 *     en même temps et surchargent le site).
 *  7. sport='basket' sur la fiche → l'étiquette "Basketball" déjà câblée
 *     côté Dashboard/Admin (titreFicheDash/titreFiche, prime sur "Cote
 *     normal"/"Score exact") s'affiche automatiquement, sans rien changer
 *     côté front.
 *
 * ⚠️ HYPOTHÈSES NON ENCORE VÉRIFIÉES EN CONDITIONS RÉELLES (aucun match
 * basketball n'était en cours au moment du diagnostic — saison NBA en
 * pause fin août) :
 *  - g.status.short === 'NS' pour "pas encore commencé" — cohérent avec
 *    la convention déjà confirmée côté football sur cette même famille
 *    d'API, mais jamais vu explicitement pour le basketball.
 *  Si cette hypothèse est fausse, l'effet est SANS DANGER (best-effort) :
 *  au pire, un match déjà commencé serait filtré à tort (aucune fiche
 *  publiée ce jour-là), jamais l'inverse.
 *
 * Réutilise directement les briques déjà exportées par
 * bot-generate-tickets-background.js (config Supabase, fuseau horaire,
 * publierFiche) via require() — jamais une copie séparée.
 * ============================================================================
 */

// Fenêtre DÉLIBÉRÉMENT DIFFÉRENTE du foot (21h-23h59 UTC) — cible 19h00
// Haïti, décalée d'une heure par rapport aux 18h30 du foot pour ne jamais
// faire tourner les deux moteurs en même temps (demande explicite de
// James). 19h00 Haïti franchit minuit UTC selon la saison (23h00 UTC en
// heure d'été UTC-4, 00h00 UTC le jour suivant en heure standard UTC-5) —
// deux valeurs d'heures séparées par une virgule, jamais une plage
// unique (23-0 n'est pas une plage cron valide).
const config = {
  schedule: '*/15 23,0 * * *'
};

const bot = require('./bot-generate-tickets-background.js');
const {
  verifierConfigSupabase, sbSelect, sbInsert, sbRpc, partsHaiti, heureHaitiDuMatch,
  dateCibleDemainHaiti, publierFiche, attendre, API_SPORTS_KEY, BASKET_HOST
} = bot;

// ============================================================================
// SUIVI DE QUOTA BASKETBALL — même principe que le foot (voir
// verifierEtIncrementerQuota dans bot-generate-tickets-background.js), mais
// completement independant : provider différent dans la MÊME table
// api_quota_usage (déjà générique, colonne provider en texte libre).
// ============================================================================
const QUOTA_MAX_JOUR_BASKET = 90; // marge de sécurité sous le vrai plafond de 100/jour
let quotaInterneEpuiseBasket = false;

async function verifierEtIncrementerQuotaBasket(contexte) {
  if (quotaInterneEpuiseBasket) return false;
  try {
    const r = await sbRpc('increment_api_quota', { p_provider: 'api-sports-basketball', p_max: QUOTA_MAX_JOUR_BASKET });
    if (r && r.quota_restant <= 0) {
      quotaInterneEpuiseBasket = true;
      stats.erreurs.push(`[QUOTA INTERNE ÉPUISÉ] ${contexte || ''} — arrêt propre avant de cogner le vrai quota.`);
      return false;
    }
    return true;
  } catch (e) {
    stats.erreurs.push(`suivi_quota_basket: ${e.message}`);
    return true; // jamais bloquant sur un échec du suivi lui-même
  }
}

async function apiSportsGetBasketRaw(path, params) {
  const ok = await verifierEtIncrementerQuotaBasket(`${path}`);
  if (!ok) return { response: [] };
  const url = new URL(`https://${BASKET_HOST}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  if (!resp.ok) throw new Error(`API-Sports basket ${path} → HTTP ${resp.status}`);
  const data = await resp.json();
  const messagesErreur = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (messagesErreur && messagesErreur.length) {
    stats.erreurs.push(`API-Sports basket ${path}${/request limit|reached the.*limit/i.test(messagesErreur.join(' ')) ? ' [QUOTA JOURNALIER DÉPASSÉ]' : ''}: ${messagesErreur.join(' | ')}`);
  }
  return data;
}

// ============================================================================
// LOG STRUCTURÉ — indépendant de celui du foot (fichier/process séparé).
// ============================================================================
const stats = {
  demarre: null,
  dateCible: null,
  matchsTrouves: 0,
  candidatsExamines: 0,
  poolFinal: 0,
  fichesPubliees: 0,
  erreurs: []
};
function resetStatsBasket() {
  stats.demarre = new Date().toISOString();
  stats.dateCible = null;
  stats.matchsTrouves = 0;
  stats.candidatsExamines = 0;
  stats.poolFinal = 0;
  stats.fichesPubliees = 0;
  stats.erreurs = [];
}
function logFinal() {
  console.log('[BOT-BASKET]', JSON.stringify(stats, null, 2));
}

// Fenêtre horaire basketball : dès 08h00, jusqu'à 23h59 Haïti INCLUS — voir
// règle 3 en en-tête. Contrairement au foot (FOOT_MAX_MINUTES=22h00), pas
// de coupure haute — demande explicite de James.
const BASKET_MIN_HOUR = 8;
const BASKET_MAX_MINUTES = 23 * 60 + 59;

// Un seul appel : tous les matchs du jour cible, tous championnats
// confondus (aucune liste blanche — règle 1 en en-tête).
async function recupererMatchsBasketJour(dateCible) {
  try {
    const data = await apiSportsGetBasketRaw('/games', { date: dateCible });
    return data.response || [];
  } catch (e) {
    stats.erreurs.push('basket/games(jour): ' + e.message);
    return [];
  }
}

async function recupererCoteParMatchBasket(gameId) {
  const ok = await verifierEtIncrementerQuotaBasket(`basket/odds(game=${gameId})`);
  if (!ok) return null;
  try {
    const url = new URL(`https://${BASKET_HOST}/odds`);
    url.searchParams.set('game', gameId);
    url.searchParams.set('bookmaker', 8); // Bet365 — même référence que le foot
    const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
    if (!resp.ok) {
      stats.erreurs.push(`basket/odds(game=${gameId}): HTTP ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    return (data.response && data.response[0]) || null;
  } catch (e) {
    stats.erreurs.push(`basket/odds(game=${gameId}): ${e.message}`);
    return null;
  }
}

// Traduit "Over X.X"/"Under X.X" en français, même logique que le foot
// (traduireButs dans bot-generate-tickets-background.js), mais autonome ici
// (le mot "buts" n'a pas de sens en basketball — "points").
function traduirePointsBasket(value) {
  const m = /^(Over|Under)\s+([\d.]+)$/i.exec(String(value).trim());
  if (!m) return value;
  const mot = m[1].toLowerCase() === 'over' ? 'Plus' : 'Moins';
  return `${mot} de ${m[2]} points`;
}

// ============================================================================
// EXTRACTION DES MARCHÉS — repli volontairement RESTREINT à 2 marchés pour
// cette première version (victoire directe + total de points), mêmes
// fourchettes de cote que le foot pour que la qualité ne dépende jamais du
// sport. Handicap asiatique (vu dans le diagnostic) volontairement laissé
// de côté pour l'instant — extension possible plus tard si James le
// demande, jamais imposée d'avance.
// ============================================================================
function extraireMarchesBasket(oddsItem, dateCible, infosMatch) {
  const trouvees = [];
  const h = heureHaitiDuMatch(infosMatch.kickoffUtc);
  if (!h || h.iso !== dateCible) return [];
  const minutesJour = h.heureNum * 60 + h.minuteNum;
  if (minutesJour < BASKET_MIN_HOUR * 60 || minutesJour > BASKET_MAX_MINUTES) return [];

  const bookmakers = oddsItem.bookmakers || [];
  const bk = bookmakers.find(b => Number(b.id) === 8) || bookmakers[0];
  const bets = (bk && bk.bets) || [];

  bets.forEach(betType => {
    // Victoire directe (id 2, "Home/Away" — pas de nul en basketball).
    if (betType.id === 2) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.19 && c <= 1.70) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_1x2', pick: `Victoire : ${v.value}`, odd: c, tier: 'SAFE',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure
          });
        }
        if (c >= 1.95 && c <= 2.50) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_1x2', pick: `Victoire : ${v.value}`, odd: c, tier: 'PREMIUM',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure
          });
        }
      });
    }
    // Total de points du match entier (id 4, "Over/Under").
    if (betType.id === 4) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        const estOver = /^Over/i.test(String(v.value));
        if (estOver && c >= 1.19 && c <= 1.70) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_total', pick: traduirePointsBasket(v.value), odd: c, tier: 'SAFE',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure
          });
        }
        if (estOver && c >= 1.95 && c <= 2.40) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_total', pick: traduirePointsBasket(v.value), odd: c, tier: 'PREMIUM',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure
          });
        }
      });
    }
  });

  return trouvees;
}

// ============================================================================
// CONSTRUCTION DE FICHE — CORRIGÉ (règle 2/3 en en-tête, 2e passage de
// James le même jour) : UNE SEULE fiche combinée par jour (plus "1 fiche =
// 1 seule sélection, jusqu'à 3 fiches"), avec :
//  - aucun plancher de cote obligatoire (contrairement au foot) ;
//  - un plafond STRICT à 25, jamais dépassé ;
//  - au plus 1 sélection par match (anti-corrélation, même principe que
//    construireFiche côté foot) ;
//  - jamais moins de 2 sélections — sinon ce n'est plus un "combiné" mais
//    un pick isolé, contraire à la demande explicite.
// Choisit les meilleures probabilités d'abord (1/cote — pas encore
// d'historique réel basketball pour affiner, contrairement au foot où
// market_reliability a déjà des mois de données).
// ============================================================================
const CIBLE_MAX_BASKET = 25;
const MAX_SELECTIONS_BASKET = 10;

function construireFicheBasket(pool) {
  // Au plus 1 candidat par match (le meilleur, même principe que
  // meilleurParMatch côté foot) — jamais 2 legs corrélés du même match.
  const parMatch = {};
  pool.forEach(b => {
    if (!parMatch[b.gameId] || (1 / b.odd) > (1 / parMatch[b.gameId].odd)) parMatch[b.gameId] = b;
  });
  const candidats = Object.values(parMatch).sort((a, b) => (1 / b.odd) - (1 / a.odd)); // meilleure probabilité d'abord

  const selections = [];
  let coteTotale = 1.0;
  for (const b of candidats) {
    if (selections.length >= MAX_SELECTIONS_BASKET) break;
    // Marge de 5% comme côté foot — jamais dépasser franchement le
    // plafond, mais on continue d'essayer les candidats suivants (plus
    // chers) plutôt que de tout arrêter net : un petit candidat plus loin
    // dans la liste peut encore tenir sous le plafond.
    if (coteTotale * b.odd > CIBLE_MAX_BASKET * 1.05) continue;
    selections.push(b);
    coteTotale *= b.odd;
  }

  const confiance = selections.length
    ? Math.round(100 * selections.reduce((s, b) => s + 1 / b.odd, 0) / selections.length)
    : 0;

  return {
    selections,
    coteTotale: Math.round(coteTotale * 100) / 100,
    confiance,
    // Pas de plancher (règle 3) — seul le nombre minimum de sélections
    // (2, pour que ce soit réellement un combiné) et le plafond comptent.
    valide: selections.length >= 2 && coteTotale <= CIBLE_MAX_BASKET * 1.05
  };
}

async function handler(event) {
  resetStatsBasket();

  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;

  const maintenant = partsHaiti(new Date());
  if (!modeTest && maintenant.heureNum !== 19) {
    return { statusCode: 200, body: 'Hors fenêtre 19h00 Haïti — rien à faire. (ajoutez ?token=... pour tester manuellement)' };
  }
  if (modeTest) console.log('[BOT-BASKET] === MODE TEST déclenché manuellement ===');

  if (!API_SPORTS_KEY) {
    stats.erreurs.push('API_SPORTS_KEY absente des variables Netlify');
    logFinal();
    return { statusCode: 500, body: 'Configuration incomplète.' };
  }
  try { verifierConfigSupabase(); }
  catch (e) { stats.erreurs.push(e.message); logFinal(); return { statusCode: 500, body: e.message }; }

  const dateCible = dateCibleDemainHaiti();
  stats.dateCible = dateCible;

  // Idempotence (même principe que le foot) : évite une double génération
  // si le cron se déclenche plusieurs fois dans la fenêtre 21h-23h59 UTC.
  try {
    const existantes = await sbSelect('tickets',
      `select=id&sport=eq.basket&play_date=eq.${dateCible}&source=eq.bot&limit=1`);
    if (existantes.length && !modeTest) {
      logFinal();
      return { statusCode: 200, body: 'Déjà généré aujourd\'hui pour cette date — rien à refaire.' };
    }
  } catch (e) {
    stats.erreurs.push('vérif idempotence: ' + e.message);
  }

  // Rang 1 : synthétique, jamais lu depuis la table plans — un basketball
  // n'a ni cible min ni cible max (règle 4 en en-tête), min_plan_rank=1
  // suffit pour que la cascade d'accès couvre tous les rangs au-dessus.
  const planPartage = { rank: 1, min_total_odd: null, max_total_odd: null };

  const matchsJour = await recupererMatchsBasketJour(dateCible);
  stats.matchsTrouves = matchsJour.length;
  if (!matchsJour.length) {
    logFinal();
    return { statusCode: 200, body: 'Aucun match basketball disponible — aucune fiche publiée.' };
  }

  // Filtrage local : statut "pas encore commencé" + fenêtre horaire. AUCUNE
  // liste de championnat (règle 1 en en-tête) — tout ce que l'API renvoie
  // avec un statut valide est candidat.
  const noms = {};
  let candidats = [];
  matchsJour.forEach(g => {
    if (!g || !g.id || !g.date) return;
    const statut = g.status && g.status.short;
    if (statut !== 'NS') return; // voir avertissement en en-tête : hypothèse non vérifiée en conditions réelles
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

  // Plafond de sécurité (même logique que le foot : ne pas épuiser le
  // quota interne sur un jour anormalement chargé) — 30 candidats
  // examinés donnent largement de quoi construire un combiné jusqu'à 10
  // sélections (MAX_SELECTIONS_BASKET) sous le plafond de cote 25.
  const PLAFOND_CANDIDATS = 30;
  if (candidats.length > PLAFOND_CANDIDATS) candidats = candidats.slice(0, PLAFOND_CANDIDATS);

  let poolBasket = [];
  const DELAI_ENTRE_APPELS_MS = 6500; // même rythme que le foot, même contrainte API-Sports
  for (let i = 0; i < candidats.length; i++) {
    if (quotaInterneEpuiseBasket) {
      console.log(`[BOT-BASKET] Arrêt anticipé (quota interne épuisé) après ${i}/${candidats.length} candidats.`);
      break;
    }
    stats.candidatsExamines++;
    const gameId = candidats[i];
    const oddsItem = await recupererCoteParMatchBasket(gameId);
    if (oddsItem) poolBasket = poolBasket.concat(extraireMarchesBasket(oddsItem, dateCible, noms[gameId]));
    if (i < candidats.length - 1 && !quotaInterneEpuiseBasket) await attendre(DELAI_ENTRE_APPELS_MS);
  }
  stats.poolFinal = poolBasket.length;

  if (!poolBasket.length) {
    logFinal();
    return { statusCode: 200, body: 'Aucune sélection basketball ne passe les filtres — aucune fiche publiée.' };
  }

  // UNE SEULE fiche combinée (règle 2 en en-tête), publiée à
  // min_plan_rank=1 (règle 5) — jamais plusieurs fiches, contrairement à
  // la première version de ce moteur.
  const fiche = construireFicheBasket(poolBasket);
  if (!fiche.valide) {
    logFinal();
    return { statusCode: 200, body: 'Pas assez de sélections distinctes pour un combiné (minimum 2) — aucune fiche publiée.' };
  }
  // publierFiche attend fixtureId sur chaque selection (champ générique,
  // partagé avec le foot) — gameId basketball y est placé directement.
  // noms couvre TOUTES les sélections retenues (potentiellement plusieurs
  // matchs distincts, contrairement à la version à 1 seule sélection).
  const nomsPourPublication = {};
  fiche.selections.forEach(s => {
    s.fixtureId = s.gameId;
    nomsPourPublication[s.gameId] = { label: noms[s.gameId] && noms[s.gameId].label };
  });
  const ok = await publierFiche(planPartage, fiche, dateCible, 'basket', nomsPourPublication, '');
  if (ok) stats.fichesPubliees++;

  logFinal();
  return {
    statusCode: 200,
    body: `Terminé. ${stats.fichesPubliees} fiche(s) basketball publiée(s) pour ${dateCible} (cote ${fiche.coteTotale}, ${fiche.selections.length} sélections).`
  };
}

module.exports.handler = handler;
module.exports.config = config;
