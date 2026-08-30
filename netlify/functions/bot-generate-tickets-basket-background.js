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
  dateCibleDemainHaiti, publierFiche, attendre, API_SPORTS_KEY, BASKET_HOST,
  recupererFiabiliteMarches, annoterPoolAvecFiabilite
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
// PROFILS RÉELS DE SCORING PAR ÉQUIPE (session suivante, demande explicite
// de James : "vraies statistiques pour une rentabilité réelle") — CE QUI
// EST RÉELLEMENT POSSIBLE, confirmé par ?diag=basket-stats du 30/08 :
// /statistics et /standings sont REFUSÉS sur le plan gratuit pour la
// saison en cours ("Free plans do not have access to this season, try
// from 2022 to 2024") — donc AUCUNE projection pace/efficacité n'est
// constructible. En revanche /games?date= (déjà utilisé partout ailleurs,
// confirmé SANS restriction de saison) contient déjà le score final
// complet (scores.home.total/away.total) de chaque match terminé — on
// peut donc calculer NOUS-MÊMES une vraie moyenne de points marqués/
// encaissés par équipe, à domicile et à l'extérieur, uniquement à partir
// de résultats réels déjà joués. Ce n'est PAS du pace/efficacité avancé
// (impossible aujourd'hui), mais c'est une vraie statistique, jamais
// inventée — utilisée plus bas comme signal supplémentaire, jamais un
// filtre qui bloque à lui seul.
// ============================================================================
const HISTORIQUE_JOURS_BASKET = 10; // 10 appels /games?date=, coût modéré sur le quota basketball du jour
const HISTORIQUE_MIN_MATCHS_BASKET = 3; // en dessous, échantillon jugé trop faible — jamais utilisé

async function recupererProfilsEquipesBasket(dateCible) {
  const profils = new Map(); // teamId -> { n, ptsPour, ptsContre, nDom, ptsPourDom, ptsContreDom, nExt, ptsPourExt, ptsContreExt }
  function ajouter(teamId, pour, contre, domicile) {
    if (!profils.has(teamId)) profils.set(teamId, { n: 0, ptsPour: 0, ptsContre: 0, nDom: 0, ptsPourDom: 0, ptsContreDom: 0, nExt: 0, ptsPourExt: 0, ptsContreExt: 0 });
    const p = profils.get(teamId);
    p.n++; p.ptsPour += pour; p.ptsContre += contre;
    if (domicile) { p.nDom++; p.ptsPourDom += pour; p.ptsContreDom += contre; }
    else { p.nExt++; p.ptsPourExt += pour; p.ptsContreExt += contre; }
  }

  const base = new Date(dateCible + 'T00:00:00Z');
  for (let i = 1; i <= HISTORIQUE_JOURS_BASKET; i++) {
    const d = new Date(base.getTime() - i * 86400000);
    const iso = d.toISOString().slice(0, 10);
    let matchs;
    try {
      const data = await apiSportsGetBasketRaw('/games', { date: iso });
      matchs = data.response || [];
    } catch (e) {
      stats.erreurs.push(`historique_basket(${iso}): ${e.message}`);
      continue;
    }
    matchs.forEach(g => {
      if (!g || !g.status || g.status.short !== 'FT') return; // uniquement matchs réellement terminés, jamais un score partiel
      const ptsHome = g.scores && g.scores.home && g.scores.home.total;
      const ptsAway = g.scores && g.scores.away && g.scores.away.total;
      if (typeof ptsHome !== 'number' || typeof ptsAway !== 'number') return; // jamais une moyenne calculée sur une donnée absente
      const homeId = g.teams && g.teams.home && g.teams.home.id;
      const awayId = g.teams && g.teams.away && g.teams.away.id;
      if (homeId != null) ajouter(homeId, ptsHome, ptsAway, true);
      if (awayId != null) ajouter(awayId, ptsAway, ptsHome, false);
    });
  }
  return profils;
}

// Projection simple à partir des profils réels : moyenne de (attaque
// domicile de l'équipe A + défense extérieur de l'équipe B) et l'inverse,
// jamais un modèle avancé — juste une moyenne de vrais résultats passés.
// Retourne null si l'échantillon est insuffisant pour l'une des deux
// équipes (jamais une projection sur une base trop faible).
function projeterTotalBasket(profils, homeId, awayId) {
  const ph = profils.get(homeId), pa = profils.get(awayId);
  if (!ph || !pa || ph.n < HISTORIQUE_MIN_MATCHS_BASKET || pa.n < HISTORIQUE_MIN_MATCHS_BASKET) return null;
  // Repli sur la moyenne globale si moins de 2 matchs dans le sous-échantillon domicile/extérieur.
  const attHome = ph.nDom >= 2 ? ph.ptsPourDom / ph.nDom : ph.ptsPour / ph.n;
  const defHome = ph.nDom >= 2 ? ph.ptsContreDom / ph.nDom : ph.ptsContre / ph.n;
  const attAway = pa.nExt >= 2 ? pa.ptsPourExt / pa.nExt : pa.ptsPour / pa.n;
  const defAway = pa.nExt >= 2 ? pa.ptsContreExt / pa.nExt : pa.ptsContre / pa.n;
  return Math.round(((attHome + defAway) / 2 + (attAway + defHome) / 2));
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
    // CORRIGÉ (session suivante, après un test réel resté sans aucune
    // fiche malgré 27+ appels /odds réussis) : le filtre bookmaker=8
    // (Bet365) avait été copié du foot SANS jamais être vérifié pour le
    // basketball. Le diagnostic ?diag=basket du 29/08, qui a confirmé les
    // marchés, n'utilisait PAS ce filtre — si Bet365 ne couvre pas ces
    // championnats côté basketball (LNBP, VBA, etc.), chaque appel
    // renvoyait une liste de bookmakers VIDE, donc zéro sélection extraite
    // malgré des appels API réussis. Retiré : on prend le premier
    // bookmaker disponible (voir extraireMarchesBasket), jamais un
    // bookmaker précis supposé sans preuve.
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
// CORRIGÉ (session suivante) : `profils` (recupererProfilsEquipesBasket)
// optionnel — quand fourni et l'échantillon suffisant pour les deux
// équipes, chaque candidat mk_basket_total est comparé à la projection
// réelle maison (projeterTotalBasket). `projectionConfirmee` est un
// signal ADDITIF, jamais un filtre : un candidat sans confirmation reste
// pleinement valide, juste sans le bonus de tri (voir construireFicheBasket).
// ============================================================================
function extraireMarchesBasket(oddsItem, dateCible, infosMatch, profils) {
  const trouvees = [];
  const h = heureHaitiDuMatch(infosMatch.kickoffUtc);
  if (!h || h.iso !== dateCible) return [];
  const minutesJour = h.heureNum * 60 + h.minuteNum;
  if (minutesJour < BASKET_MIN_HOUR * 60 || minutesJour > BASKET_MAX_MINUTES) return [];

  const projectionTotal = (profils && infosMatch.equipeDomicileId != null && infosMatch.equipeExterieurId != null)
    ? projeterTotalBasket(profils, infosMatch.equipeDomicileId, infosMatch.equipeExterieurId)
    : null;

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
        const seuil = parseFloat(String(v.value).replace(/^(Over|Under)\s+/i, ''));
        // Vraie statistique (session suivante) : accord entre la
        // projection maison (vrais scores finaux des 10 derniers jours,
        // voir recupererProfilsEquipesBasket) et le sens du pari — jamais
        // calculé si l'échantillon est insuffisant (projectionTotal reste
        // null dans ce cas, projectionConfirmee retombe à false partout,
        // comportement identique à avant ce correctif).
        const projectionConfirmee = (projectionTotal != null && isFinite(seuil))
          ? (estOver ? projectionTotal > seuil : projectionTotal < seuil)
          : false;
        if (estOver && c >= 1.19 && c <= 1.70) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_total', pick: traduirePointsBasket(v.value), odd: c, tier: 'SAFE',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure,
            projectionTotal, projectionConfirmee
          });
        }
        if (estOver && c >= 1.95 && c <= 2.40) {
          trouvees.push({
            gameId: infosMatch.gameId, league: infosMatch.league, leagueCountry: infosMatch.leagueCountry,
            market: 'mk_basket_total', pick: traduirePointsBasket(v.value), odd: c, tier: 'PREMIUM',
            kickoffUtc: infosMatch.kickoffUtc, matchTimeHaiti: h.heure,
            projectionTotal, projectionConfirmee
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
// CORRIGÉ (session suivante, demande explicite de James : "vraies
// statistiques pour une rentabilité réelle") : trie désormais par
// scoreFiabilite (mélange 50/50 probabilité de marché + vrai taux de
// réussite observé par championnat+marché — même mécanisme déjà en place
// côté foot depuis le 28/08, market_reliability étant déjà générique par
// championnat+marché, sport confondu) au lieu de la seule cote (1/cote).
// Sans historique suffisant (marché tout neuf), retombe honnêtement sur
// 1/cote, jamais une valeur inventée.
// ============================================================================
const CIBLE_MAX_BASKET = 25;
const MAX_SELECTIONS_BASKET = 10;

function construireFicheBasket(pool, cibleMaxOverride) {
  // Plafond personnalisable (session suivante, génération manuelle avec
  // les mêmes options que le foot) — 25 par défaut (passage automatique
  // 19h00), ou la cote max choisie par l'admin en génération manuelle.
  const cibleMax = (cibleMaxOverride != null && isFinite(cibleMaxOverride)) ? cibleMaxOverride : CIBLE_MAX_BASKET;
  // Au plus 1 candidat par match (le meilleur, même principe que
  // meilleurParMatch côté foot) — jamais 2 legs corrélés du même match.
  // Bonus léger (session suivante) : +0.05 quand la vraie projection
  // maison (scores réels des 10 derniers jours) confirme le sens du pari
  // total de points — jamais assez pour renverser une grosse différence
  // de cote, juste un départage entre candidats sinon équivalents.
  const score = b => (b.scoreFiabilite != null ? b.scoreFiabilite : 1 / b.odd) + (b.projectionConfirmee ? 0.05 : 0);
  const parMatch = {};
  pool.forEach(b => {
    if (!parMatch[b.gameId] || score(b) > score(parMatch[b.gameId])) parMatch[b.gameId] = b;
  });
  const candidats = Object.values(parMatch).sort((a, b) => score(b) - score(a)); // meilleure fiabilité d'abord

  const selections = [];
  let coteTotale = 1.0;
  for (const b of candidats) {
    if (selections.length >= MAX_SELECTIONS_BASKET) break;
    // Marge de 5% comme côté foot — jamais dépasser franchement le
    // plafond, mais on continue d'essayer les candidats suivants (plus
    // chers) plutôt que de tout arrêter net : un petit candidat plus loin
    // dans la liste peut encore tenir sous le plafond.
    if (coteTotale * b.odd > cibleMax * 1.05) continue;
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
    valide: selections.length >= 2 && coteTotale <= cibleMax * 1.05
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
      leagueCountry: (g.country && g.country.name) || null,
      // Session suivante (vraies statistiques) : nécessaires à
      // projeterTotalBasket, jamais disponibles autrement pour ce match
      // précis une fois qu'on n'a plus la réponse /games brute sous la main.
      equipeDomicileId: g.teams && g.teams.home && g.teams.home.id,
      equipeExterieurId: g.teams && g.teams.away && g.teams.away.id
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
  // Vraies statistiques (session suivante) : récupérées UNE SEULE fois
  // avant la boucle (10 appels /games?date=, coût fixe indépendant du
  // nombre de candidats). Jamais bloquant si ça échoue — repli silencieux
  // sur le comportement d'avant (projectionConfirmee toujours false).
  const profilsEquipes = await recupererProfilsEquipesBasket(dateCible);
  const DELAI_ENTRE_APPELS_MS = 6500; // même rythme que le foot, même contrainte API-Sports
  for (let i = 0; i < candidats.length; i++) {
    if (quotaInterneEpuiseBasket) {
      console.log(`[BOT-BASKET] Arrêt anticipé (quota interne épuisé) après ${i}/${candidats.length} candidats.`);
      break;
    }
    stats.candidatsExamines++;
    const gameId = candidats[i];
    const oddsItem = await recupererCoteParMatchBasket(gameId);
    if (oddsItem) poolBasket = poolBasket.concat(extraireMarchesBasket(oddsItem, dateCible, noms[gameId], profilsEquipes));
    if (i < candidats.length - 1 && !quotaInterneEpuiseBasket) await attendre(DELAI_ENTRE_APPELS_MS);
  }
  stats.poolFinal = poolBasket.length;

  if (!poolBasket.length) {
    logFinal();
    return { statusCode: 200, body: 'Aucune sélection basketball ne passe les filtres — aucune fiche publiée.' };
  }

  // Apprentissage réel (session suivante) : market_reliability est déjà
  // générique par championnat+marché, sport confondu — jamais bloquant si
  // pas encore assez d'historique (retombe sur 1/cote, voir construireFicheBasket).
  const carteFiabilite = await recupererFiabiliteMarches();
  annoterPoolAvecFiabilite(poolBasket, carteFiabilite);

  // ANTI-DOUBLON RÉEL (session suivante, demande explicite de James : "pas
  // de doublons") — CORRIGÉ : l'ancienne vérification d'idempotence
  // (quelques lignes plus haut) ne regardait que "le BOT a-t-il déjà
  // généré aujourd'hui", jamais "cette sélection précise existe-t-elle
  // déjà" — un match+marché+pronostic déjà publié par une génération
  // MANUELLE admin plus tôt le même jour aurait pu être repris tel quel
  // ici. Exclut maintenant toute sélection basketball déjà publiée
  // aujourd'hui, peu importe la source (bot ou admin).
  const cleSelectionBasket = s => `${s.gameId}|${s.market}|${s.pick}`;
  const selectionsExcluesBasket = new Set();
  try {
    const legsExistants = await sbSelect('ticket_legs',
      `select=fixture_id,market,pick,tickets!inner(play_date,sport)&tickets.play_date=eq.${dateCible}&tickets.sport=eq.basket`);
    legsExistants.forEach(l => selectionsExcluesBasket.add(`${l.fixture_id}|${l.market}|${l.pick}`));
  } catch (e) {
    stats.erreurs.push('vérif anti-doublon basket: ' + e.message);
  }
  const poolBasketFiltre = poolBasket.filter(b => !selectionsExcluesBasket.has(cleSelectionBasket(b)));

  // UNE SEULE fiche combinée (règle 2 en en-tête), publiée à
  // min_plan_rank=1 (règle 5) — jamais plusieurs fiches, contrairement à
  // la première version de ce moteur.
  const fiche = construireFicheBasket(poolBasketFiltre);
  if (!fiche.valide) {
    logFinal();
    return { statusCode: 200, body: 'Pas assez de sélections NOUVELLES pour un combiné (minimum 2) — contenu déjà publié aujourd\'hui, ou pool trop pauvre.' };
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

// ============================================================================
// EXPORTS RÉUTILISABLES (session suivante, pour la génération manuelle
// bot-generate-tickets-basket-manual-background.js) — jamais une copie
// séparée de la logique d'extraction/construction.
// ============================================================================
module.exports.recupererMatchsBasketJour = recupererMatchsBasketJour;
module.exports.recupererProfilsEquipesBasket = recupererProfilsEquipesBasket;
module.exports.projeterTotalBasket = projeterTotalBasket;
module.exports.recupererCoteParMatchBasket = recupererCoteParMatchBasket;
module.exports.extraireMarchesBasket = extraireMarchesBasket;
module.exports.construireFicheBasket = construireFicheBasket;
module.exports.BASKET_MIN_HOUR = BASKET_MIN_HOUR;
module.exports.BASKET_MAX_MINUTES = BASKET_MAX_MINUTES;
module.exports.CIBLE_MAX_BASKET = CIBLE_MAX_BASKET;
module.exports.stats = stats;
module.exports.resetStatsBasket = resetStatsBasket;
module.exports.logFinal = logFinal;
