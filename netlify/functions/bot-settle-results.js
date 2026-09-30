/**
 * ============================================================================
 * VIP BETCOTE — BOT DE RÈGLEMENT DES RÉSULTATS (Netlify Scheduled Function)
 * Fichier : netlify/functions/bot-settle-results.js
 * ----------------------------------------------------------------------------
 * 2ᵉ fonction du bot, complément de bot-generate-tickets.js. Ne touche NI
 * index.html NI admin.html. Pour chaque fiche encore "pending" dont la
 * play_date est passée, va chercher le résultat réel de chaque match
 * (fixture_id déjà stocké dans ticket_legs) et met à jour :
 *   - ticket_legs.result  → 'won' | 'lost' | 'void'
 *   - tickets.status      → 'won' | 'lost' (inchangé si un match est encore
 *                            en cours — on réessaiera au prochain passage)
 *
 * VALEURS CONFIRMÉES DANS index.html (25/08, avant d'écrire une seule ligne
 * de ce fichier) — ne jamais inventer d'autres valeurs, le frontend ne les
 * reconnaîtrait pas :
 *   - tickets.status : 'pending' | 'won' | 'lost'
 *     (index.html : `.eq('status','won')`, statusKey={won,lost,pending})
 *   - ticket_legs.result : 'won' | 'lost' | 'void'
 *     (index.html : `l.result!=='void'` — un combiné gagnant peut contenir
 *     des legs void sans que ça invalide la fiche : match reporté = neutre,
 *     jamais une preuve mais jamais une raison de perdre non plus)
 *
 * RÈGLE DES 23H59 HAÏTI (cahier des charges) : un match qui n'a toujours pas
 * de statut final le lendemain de sa date de jeu (play_date) — reporté,
 * annulé, ou données API introuvables — est marqué 'void' plutôt que de
 * bloquer indéfiniment le règlement de la fiche.
 * ============================================================================
 */

const config = {
  // Une fois par heure entre 10h00 et 23h00 UTC — couvre la quasi-totalité
  // des heures où des matchs se terminent en Haïti (matchs de l'après-midi
  // jusqu'à ceux de fin de soirée). Le mode test permet de forcer un passage
  // hors de cette fenêtre.
  schedule: '0 10-23 * * *'
};

// ============================================================================
// 1. CONFIGURATION (identique à bot-generate-tickets.js)
// ============================================================================

const TZ_HAITI = 'America/Port-au-Prince';
const API_SPORTS_KEY = process.env.API_SPORTS_KEY || '';
const FOOT_HOST = 'v3.football.api-sports.io';
// Session suivante (règlement basketball) : hôte SÉPARÉ, jamais mélangé
// avec FOOT_HOST — un fixture_id foot et un gameId basketball peuvent
// coïncider numériquement par pur hasard (deux espaces d'ID totalement
// indépendants), donc jamais une seule table de correspondance commune.
const BASKET_HOST = 'v1.basketball.api-sports.io';

// CRITIQUE (30/09) — depuis l'inversion de priorité côté génération basketball
// (bot-generate-tickets-basket-background.js), une partie des fixture_id
// stockés dans ticket_legs pour le sport basketball proviennent désormais de
// The Odds API (identifiant hexadécimal), plus seulement d'API-Sports
// (toujours un entier). Sans cette clé et le chemin de règlement qui l'utilise
// plus bas (recupererMatchsBasketDateOddsApi), CES fiches-là ne pourraient
// JAMAIS être retrouvées dans l'index API-Sports (parGame) : elles
// tomberaient systématiquement dans la règle des 23h59 et seraient annulées
// ('void') à tort après ~1 jour, sans jamais montrer "gagné"/"perdu" — un
// bug distinct de celui, déjà corrigé, du texte du pick lui-même (voir
// evenementOddsApiVersOddsItem). Absente/vide → simplement ignorée (le
// règlement continue de fonctionner pour tout ce qui reste sur API-Sports).
const ODDS_API_KEY = (process.env.ODDS_API_KEY || '').trim();
const ODDS_API_HOST = 'api.the-odds-api.com';

// Encodage id The Odds API -> entier négatif (colonne ticket_legs.fixture_id
// = bigint) — MÊME module que côté génération, pour que les deux côtés
// calculent toujours exactement la même valeur pour un même match.
const { oddsApiIdVersEntier, estIdOddsApi } = require('./lib/id-source.js');
// Garde-fous quota (30/09, suite à l'audit) — voir lib/quota-guard.js.
const garde = require('./lib/quota-guard.js');
// Relais BSD (30/09) : règlement des sélections foot dont le match vient de BSD
// (fixture_id négatif sur une fiche foot). Voir lib/bsd-relais.js.
const bsdRelais = require('./lib/bsd-relais.js');
const BSD_API_KEY = (process.env.BSD_API_KEY || '').trim();
const BSD_HOST = 'sports.bzzoiro.com';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function verifierConfigSupabase() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans les variables Netlify');
  }
}

function sbHeaders(extra) {
  return Object.assign({
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }, extra || {});
}

async function sbSelect(table, query) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
  const resp = await fetch(url, { headers: sbHeaders() });
  if (!resp.ok) throw new Error(`Supabase SELECT ${table} → HTTP ${resp.status} : ${await resp.text()}`);
  return resp.json();
}

// PATCH via l'API REST PostgREST — un seul enregistrement ciblé par id à
// chaque appel (pas de mise à jour groupée : chaque leg/ticket a sa propre
// logique de résultat, jamais deux lignes avec la même valeur par accident).
async function sbUpdate(table, id, champs) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?id=eq.${id}`;
  const resp = await fetch(url, {
    method: 'PATCH',
    headers: sbHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(champs)
  });
  if (!resp.ok) throw new Error(`Supabase PATCH ${table}(${id}) → HTTP ${resp.status} : ${await resp.text()}`);
  return true;
}

// Insertion simple (ajoutée le 27/08 pour validation_log — jusqu'ici ce
// fichier n'écrivait qu'avec sbUpdate/PATCH sur des lignes existantes).
async function sbInsert(table, lignes) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(lignes)
  });
  if (!resp.ok) throw new Error(`Supabase POST ${table} → HTTP ${resp.status} : ${await resp.text()}`);
  return true;
}

// ============================================================================
// LOG DE VALIDATION PERSISTANT (Phase 2, section 23 du cahier des charges,
// 27/08/2026) : trace exhaustive de CE QUI a servi à régler chaque leg et
// chaque fiche — match, marché, valeur jouée, donnée réelle utilisée,
// source, statuts avant/après. Purement additif et jamais bloquant : un
// échec d'écriture ici est journalisé dans stats.erreurs mais n'empêche
// JAMAIS le règlement réel (ticket_legs/tickets) de se terminer — le log
// est un outil de diagnostic, pas une dépendance du chemin critique.
async function enregistrerValidationLog(entree) {
  try {
    await sbInsert('validation_log', [entree]);
  } catch (e) {
    stats.erreurs.push(`validation_log: ${e.message}`);
  }
}

// ============================================================================
// 2. OUTILS FUSEAU HORAIRE HAÏTI (identiques à bot-generate-tickets.js)
// ============================================================================

function partsHaiti(date) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_HAITI, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const o = {};
  f.formatToParts(date).forEach(p => { o[p.type] = p.value; });
  return { iso: `${o.year}-${o.month}-${o.day}` };
}

function aujourdhuiHaiti() {
  return partsHaiti(new Date()).iso;
}

// Nombre de jours écoulés entre une date (YYYY-MM-DD) et aujourd'hui, en
// jours calendaires Haïti — utilisé pour la règle des 23h59 (un match dont
// la play_date remonte à hier ou plus et qui n'a toujours pas de statut
// final est voidé plutôt que de bloquer la fiche indéfiniment).
function joursEcoules(dateIso) {
  const a = new Date(dateIso + 'T00:00:00Z');
  const b = new Date(aujourdhuiHaiti() + 'T00:00:00Z');
  return Math.round((b - a) / 86400000);
}

// ============================================================================
// 3. LOG STRUCTURÉ
// ============================================================================

const stats = {
  demarre: null,
  fuseauUtilise: TZ_HAITI,
  datesTraitees: [],
  ticketsExamines: 0,
  ticketsRegles: { won: 0, lost: 0 },
  ticketsEnAttente: 0, // au moins un match pas encore terminé — réessai au prochain passage
  ticketsToutVoid: 0,  // toutes selections 'void' : décision manuelle admin, jamais de verdict inventé
  legsMisAJour: { won: 0, lost: 0, void: 0 },
  appelsEvents: 0,     // appels /fixtures/events pour vérifier un buteur
  appelsApiSports: { foot: 0, basket: 0 }, // 30/09 : appels réellement envoyés à API-Sports par ce passage
  ticketsSansRienARegler: 0, // 30/09 : fiches 100% void (attente admin) — plus aucun appel API pour elles
  datesSansAppelApi: 0,      // 30/09 : dates traitées sans aucun appel API-Sports (rien à régler)
  erreurs: []
};
function resetStats() {
  stats.demarre = new Date().toISOString();
  stats.datesTraitees = [];
  stats.ticketsExamines = 0;
  stats.ticketsRegles = { won: 0, lost: 0 };
  stats.ticketsEnAttente = 0;
  stats.ticketsToutVoid = 0;
  stats.legsMisAJour = { won: 0, lost: 0, void: 0 };
  stats.appelsEvents = 0;
  stats.appelsApiSports = { foot: 0, basket: 0 };
  stats.ticketsSansRienARegler = 0;
  stats.datesSansAppelApi = 0;
  stats.bsd = { legsExaminees: 0, legsResolues: 0 };
  stats.erreurs = [];
}
function logFinal() {
  console.log('[SETTLE]', JSON.stringify(stats, null, 2));
}

// ============================================================================
// 4. APPELS API-SPORTS
// ============================================================================

// ============================================================================
// SUIVI DE QUOTA DU RÈGLEMENT (30/09, audit) — jusqu'ici ce fichier appelait
// API-Sports SANS jamais rien compter : le règlement tourne CHAQUE HEURE (24
// passages/jour) et pouvait à lui seul consommer des dizaines de requêtes que
// le compteur ne voyait pas. Même RPC que la génération (increment_api_quota)
// et même compteur par produit (foot / basket), avec un plafond plus HAUT (95)
// que la génération (80/75) : le règlement passe toujours après elle, ses
// requêtes sont les dernières à sacrifier. Plafond atteint → l'appel n'est PAS
// envoyé et les fiches restent « en attente » (jamais voidées, voir plus bas).
// ============================================================================
const QUOTA_MAX_REGLEMENT = 95;

async function sbRpc(name, params) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/${name}`;
  const resp = await fetch(url, { method: 'POST', headers: sbHeaders(), body: JSON.stringify(params || {}) });
  if (!resp.ok) throw new Error(`Supabase RPC ${name} → HTTP ${resp.status} : ${await resp.text()}`);
  const texte = await resp.text();
  if (!texte) return null;
  const data = JSON.parse(texte);
  return Array.isArray(data) ? data[0] : data;
}

// Lève une erreur si le plafond du règlement est atteint ; un incident du
// SUIVI lui-même (Supabase indisponible) ne bloque jamais le règlement.
async function verifierQuotaReglement(provider, contexte) {
  try {
    const r = await sbRpc('increment_api_quota', { p_provider: provider, p_max: QUOTA_MAX_REGLEMENT });
    if (r && r.quota_restant <= 0) {
      throw new Error(`quota interne épuisé (${r.call_count}/${r.quota_max}) — appel évité : ${contexte}`);
    }
  } catch (e) {
    if (/quota interne épuisé/.test(e.message)) throw e;
    stats.erreurs.push(`suivi_quota_reglement: ${e.message}`);
  }
}

// Vrai quota restant, lu dans les en-têtes (même mécanisme que la génération).
async function enregistrerQuotaReelReglement(provider, resp) {
  try {
    const remaining = resp.headers.get('x-ratelimit-requests-remaining');
    const limite = resp.headers.get('x-ratelimit-requests-limit');
    if (remaining === null || limite === null) return;
    await sbRpc('record_real_api_quota', { p_provider: provider, p_remaining: parseInt(remaining, 10), p_limit: parseInt(limite, 10) });
  } catch (e) {
    stats.erreurs.push(`suivi_quota_reel_reglement: ${e.message}`);
  }
}

// Lit la réponse d'API-Sports ; une erreur — HTTP non-2xx OU champ `errors`
// renseigné (API-Sports répond souvent 200 même compte suspendu ou quota
// dépassé, avec response=[]) — LÈVE une exception. Avant le 30/09 ce dernier
// cas passait pour « aucun match », et le règlement en concluait que le match
// avait disparu : voir la règle des 23h59, qui voidait alors la sélection.
async function lireReponseApiSports(resp, libelle) {
  if (!resp.ok) throw new Error(`${libelle} → HTTP ${resp.status}`);
  const data = await resp.json();
  const messages = garde.messagesErreur(data.errors);
  if (messages.length) throw new Error(`${libelle} → ${messages.join(' | ')}`);
  return data.response || [];
}

async function apiSportsGet(path, params) {
  await verifierQuotaReglement('api-sports-football', `${FOOT_HOST}${path}`);
  const url = new URL(`https://${FOOT_HOST}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  stats.appelsApiSports.foot++;
  const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  await enregistrerQuotaReelReglement('api-sports-football', resp);
  return lireReponseApiSports(resp, `API-Sports ${path}`);
}

// Session suivante (règlement basketball) — même principe, hôte différent.
async function apiSportsGetBasket(path, params) {
  await verifierQuotaReglement('api-sports-basketball', `${BASKET_HOST}${path}`);
  const url = new URL(`https://${BASKET_HOST}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  stats.appelsApiSports.basket++;
  const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  await enregistrerQuotaReelReglement('api-sports-basketball', resp);
  return lireReponseApiSports(resp, `API-Sports basket ${path}`);
}

// Un seul appel par date à régler (comme bot-generate-tickets.js) : tous les
// matchs du jour, avec statut final et score si terminé. Jamais un appel par
// fixture — même logique de contournement du quota que la génération.
// RETOURNE null (et non plus []) quand l'appel ÉCHOUE (compte suspendu, quota,
// réseau…) : [] veut dire « l'API a répondu qu'il n'y a aucun match », null
// veut dire « on ne sait pas » — et sur un « on ne sait pas », il ne faut
// JAMAIS conclure qu'un match a disparu et voider la sélection.
async function recupererFixturesDate(dateIso) {
  try {
    return await apiSportsGet('/fixtures', { date: dateIso, timezone: TZ_HAITI });
  } catch (e) {
    stats.erreurs.push(`fixtures(${dateIso}): ${e.message}`);
    return null;
  }
}

// Uniquement pour les legs "buteur" — la liste des buts (avec le nom du
// buteur) n'est pas dans /fixtures, il faut /fixtures/events. Appelé au cas
// par cas, jamais en boucle sur tous les matchs (seuls ceux avec un leg
// mk_buteur en attente de règlement le déclenchent).
async function recupererButeurs(fixtureId) {
  stats.appelsEvents++;
  try {
    const events = await apiSportsGet('/fixtures/events', { fixture: fixtureId });
    // Règle temps réglementaire (27/08, rappelée explicitement par James) :
    // par défaut, TOUS les marchés — buteur inclus — comptent uniquement
    // le temps réglementaire (90 min + arrêts de jeu), jamais la
    // prolongation, sauf si le marché dit explicitement le contraire (ce
    // qui n'est le cas d'aucun marché actuellement généré par le bot).
    // API-Sports encode le temps de jeu dans e.time.elapsed : 1-90 pour le
    // temps réglementaire (arrêts de jeu inclus via e.time.extra, qui ne
    // fait jamais dépasser 90 dans elapsed), 91+ pour la prolongation. Un
    // but sans e.time exploitable est écarté par prudence plutôt que
    // compté à tort (mieux vaut une sélection non reconnue → en attente,
    // qu'un verdict faux sur de l'argent réel).
    return events
      .filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty')
      .filter(e => e.time && typeof e.time.elapsed === 'number' && e.time.elapsed <= 90)
      .map(e => (e.player && e.player.name) || '');
  } catch (e) {
    stats.erreurs.push(`events(fixture=${fixtureId}): ${e.message}`);
    return null; // null = échec réel, à distinguer de [] = aucun but marqué
  }
}

// Session suivante (règlement basketball) — même principe qu'au-dessus
// (un seul appel/date, tous les matchs), mais hôte et forme de réponse
// différents (pas de fixture.status imbriqué, tout est à plat sur g.*).
// Même convention que recupererFixturesDate : null = appel échoué (inconnu),
// [] = l'API a répondu « aucun match ».
async function recupererMatchsBasketDate(dateIso) {
  try {
    return await apiSportsGetBasket('/games', { date: dateIso });
  } catch (e) {
    stats.erreurs.push(`basket/games(${dateIso}): ${e.message}`);
    return null;
  }
}

// CRITIQUE (30/09) — distingue un fixture_id The Odds API d'un fixture_id
// API-Sports. La colonne ticket_legs.fixture_id est un BIGINT : l'id hexadécimal
// d'Odds API y est stocké encodé en entier NÉGATIF (voir lib/id-source.js),
// alors qu'API-Sports n'a JAMAIS utilisé autre chose qu'un entier POSITIF
// (ex: 511550). Le signe suffit donc à choisir la bonne source de règlement,
// sans colonne supplémentaire en base ni ambiguïté possible entre les deux
// espaces d'identifiants. estIdOddsApi() est importée de ce module partagé.

// Session suivante (30/09) — pendant basketball via The Odds API (voir
// ODDS_API_KEY plus haut). Un seul appel par date à régler, même principe
// de contournement de quota que recupererMatchsBasketDate() : jamais un
// appel par match. daysFrom (paramètre officiel de l'endpoint /scores/,
// 1 à 3 accepté sur le plan gratuit) est calculé à partir du nombre de jours
// réellement écoulés depuis dateIso, jamais codé en dur.
// null = source indisponible (clé absente, réseau, HTTP, réponse illisible) ;
// [] = l'API a répondu et n'a pas ce match. Voir recupererFixturesDate.
async function recupererMatchsBasketDateOddsApi(dateIso) {
  if (!ODDS_API_KEY) return null;
  const joursDepuis = Math.min(3, Math.max(1, joursEcoules(dateIso)));
  const url = new URL(`https://${ODDS_API_HOST}/v4/sports/basketball_nba/scores/`);
  url.searchParams.set('apiKey', ODDS_API_KEY);
  url.searchParams.set('daysFrom', String(joursDepuis));

  let resp;
  try {
    resp = await fetch(url.toString());
  } catch (e) {
    stats.erreurs.push(`odds-api basket/scores(${dateIso}): ${e.message}`);
    return null;
  }
  if (!resp.ok) {
    stats.erreurs.push(`odds-api basket/scores(${dateIso}) → HTTP ${resp.status}`);
    return null;
  }
  let data;
  try {
    data = await resp.json();
  } catch (e) {
    stats.erreurs.push(`odds-api basket/scores(${dateIso}) réponse illisible: ${e.message}`);
    return null;
  }
  if (!Array.isArray(data)) {
    stats.erreurs.push(`odds-api basket/scores(${dateIso}) : réponse inattendue (pas une liste)`);
    return null;
  }
  return data;
}

// Traduit un évènement The Odds API (/scores/) vers la même forme
// {statut, ptsHome, ptsAway, teamHomeId, teamAwayId} que parGame côté
// API-Sports, pour que le reste de reglerTicketsBasket() ne voie jamais la
// différence entre les deux sources. teamHomeId/teamAwayId restent null
// (The Odds API ne fournit aucun identifiant d'équipe) — capturerStatsEquipesBasket()
// ignore déjà proprement ce cas (bonus historique maison, jamais bloquant).
// completed=false → statut 'NS' (jamais terminé) plutôt qu'un statut annulé
// deviné : The Odds API ne distingue pas "pas encore joué" de "annulé", donc
// un match non complété retombe simplement, comme avant ce correctif, sur la
// règle des 23h59 — jamais un verdict inventé.
function evenementOddsApiScoreVersInfo(ev) {
  let ptsHome = null, ptsAway = null;
  if (ev.completed && Array.isArray(ev.scores)) {
    ev.scores.forEach(s => {
      if (!s || s.score == null) return;
      const val = Number(s.score);
      if (Number.isNaN(val)) return;
      if (s.name === ev.home_team) ptsHome = val;
      else if (s.name === ev.away_team) ptsAway = val;
    });
  }
  return {
    statut: ev.completed ? 'FT' : 'NS',
    ptsHome, ptsAway,
    teamHomeId: null, teamAwayId: null
  };
}

// Statuts API-Sports considérés comme définitivement terminés / non-terminés (foot)
const STATUTS_TERMINES = ['FT', 'AET', 'PEN'];
const STATUTS_ANNULES = ['PST', 'CANC', 'ABD', 'WO', 'AWD', 'SUSP'];

// Statuts basketball — ⚠️ NON ENCORE VÉRIFIÉS SUR UN VRAI MATCH TERMINÉ
// (aucun match n'était fini au moment du diagnostic ?diag=basket, saison
// NBA en pause fin août). Cohérents avec la convention déjà confirmée
// côté football sur cette même famille d'API, mais jamais vus
// explicitement pour le basketball — à reconfirmer avec un vrai match
// terminé avant de faire confiance à 100% à ce règlement automatique.
// Effet si faux : SANS DANGER (leg reste "en attente", jamais un verdict
// inventé) — jamais l'inverse.
const STATUTS_TERMINES_BASKET = ['FT', 'AOT'];
const STATUTS_ANNULES_BASKET = ['POST', 'CANC', 'SUSP', 'AWD', 'ABD'];

// Retourne 'won' | 'lost' | null (null = marché non reconnu ou score
// indisponible — jamais deviné, voir evaluerLeg() pour le même principe
// côté foot).
function evaluerLegBasket(leg, ptsHome, ptsAway) {
  const pick = String(leg.pick || '');
  switch (leg.market) {
    case 'mk_basket_1x2': {
      if (ptsHome == null || ptsAway == null || ptsHome === ptsAway) return null; // jamais de nul en basketball : égalité = données suspectes
      const camp = pick.replace('Victoire : ', '').trim();
      const gagnant = ptsHome > ptsAway ? 'Home' : 'Away';
      return gagnant === camp ? 'won' : 'lost';
    }
    case 'mk_basket_total': {
      const m = /(Plus|Moins) de ([\d.]+) points/i.exec(pick);
      if (!m || ptsHome == null || ptsAway == null) return null;
      const total = ptsHome + ptsAway;
      const seuil = parseFloat(m[2]);
      return (m[1].toLowerCase() === 'plus' ? total > seuil : total < seuil) ? 'won' : 'lost';
    }
    default:
      return null;
  }
}

// ============================================================================
// 5. ÉVALUATION D'UN LEG (marché + pick + score final → won/lost)
// ============================================================================

// Extrait le seuil numérique d'un pick "Plus de X buts" / "Moins de X buts"
// (format en français depuis le patch du 25/08 sur bot-generate-tickets.js).
function seuilButs(pick) {
  const m = /(Plus|Moins) de ([\d.]+) buts/i.exec(String(pick));
  if (!m) return null;
  return { sens: m[1].toLowerCase() === 'plus' ? 'plus' : 'moins', seuil: parseFloat(m[2]) };
}

function resultat1x2(golHome, golAway) {
  if (golHome > golAway) return 'Home';
  if (golAway > golHome) return 'Away';
  return 'Draw';
}

// Retourne 'won' | 'lost' | null (null = marché non reconnu, à laisser en
// attente plutôt que de deviner — mieux vaut un règlement manuel qu'une
// erreur silencieuse sur l'argent réel des utilisateurs).
function evaluerLeg(leg, golHome, golAway, buteurs) {
  const pick = String(leg.pick || '');
  const total = golHome + golAway;

  switch (leg.market) {
    case 'mk_1x2': {
      const camp = pick.replace('Victoire : ', '').trim();
      return resultat1x2(golHome, golAway) === camp ? 'won' : 'lost';
    }
    case 'mk_double_chance': {
      // Corrigé (28/08) : le générateur écrit "X1"/"12"/"X2" (voir
      // LIBELLE_DOUBLE_CHANCE dans bot-generate-tickets.js), jamais
      // "Home/Draw" comme l'ancien code le supposait ici — ce qui
      // faisait échouer TOUTE sélection double chance (toujours 'lost',
      // quel que soit le résultat réel du match). resultat1x2() n'est
      // pas modifiée (reste 'Home'/'Away'/'Draw') — la correspondance
      // se fait ici, localement, jamais un format deviné.
      const CORRESPONDANCE_DOUBLE_CHANCE = { X1: ['Home', 'Draw'], '12': ['Home', 'Away'], X2: ['Draw', 'Away'] };
      const val = pick.replace('Double chance : ', '').trim(); // "X1", "12", "X2"
      const camp = CORRESPONDANCE_DOUBLE_CHANCE[val];
      if (!camp) return null; // format non reconnu (ex. ancien format historique) : jamais deviner, laissé en attente
      return camp.includes(resultat1x2(golHome, golAway)) ? 'won' : 'lost';
    }
    case 'mk_btts':
      return (golHome > 0 && golAway > 0) ? 'won' : 'lost';
    case 'mk_total_buts': {
      const s = seuilButs(pick);
      if (!s) return null;
      return (s.sens === 'plus' ? total > s.seuil : total < s.seuil) ? 'won' : 'lost';
    }
    case 'mk_total_domicile': {
      const s = seuilButs(pick);
      if (!s) return null;
      return (s.sens === 'plus' ? golHome > s.seuil : golHome < s.seuil) ? 'won' : 'lost';
    }
    case 'mk_total_exterieur': {
      const s = seuilButs(pick);
      if (!s) return null;
      return (s.sens === 'plus' ? golAway > s.seuil : golAway < s.seuil) ? 'won' : 'lost';
    }
    case 'mk_score_exact': {
      const m = /Score exact\s*:\s*(\d+)\s*:\s*(\d+)/.exec(pick);
      if (!m) return null;
      return (golHome === parseInt(m[1], 10) && golAway === parseInt(m[2], 10)) ? 'won' : 'lost';
    }
    case 'mk_buteur': {
      if (buteurs === null) return null; // échec API events : on réessaiera
      const nom = pick.replace('Buteur : ', '').trim().toLowerCase();
      return buteurs.some(b => b.toLowerCase() === nom) ? 'won' : 'lost';
    }
    default:
      return null;
  }
}

// Relance ciblée (18/09, bug signalé par James : LDU Quito-Palmeiras du
// 16/09, voidée à tort alors que le vrai score 90 minutes existait bel et
// bien chez API-Sports — juste pas encore renvoyé par l'appel en BLOC du
// jour au moment du passage). Un seul appel /fixtures?id=X sur CETTE
// fixture précise, indépendant du lot groupé de la date — interroge
// l'API une seconde fois, spécifiquement pour ce match, avant d'abandonner
// définitivement. Coût : au plus un appel par match encore bloqué le
// lendemain, jamais en boucle sur tout le lot du jour — négligeable sur
// le quota. Même logique de fiabilité que parFixture plus bas : jamais un
// repli sur goals (qui inclurait la prolongation) pour un match AET/PEN.
async function retenterFixtureUnique(fixtureId) {
  // Relais BSD : un id négatif n'existe pas chez API-Sports — aucun appel.
  if (Number(fixtureId) < 0) return null;
  try {
    const reponse = await apiSportsGet('/fixtures', { id: fixtureId });
    const f = reponse[0];
    if (!f || !f.fixture) return null;
    const statut = f.fixture.status && f.fixture.status.short;
    const ft = f.score && f.score.fulltime;
    const ftFiable = ft && ft.home != null && ft.away != null;
    const alleeEnProlongation = statut === 'AET' || statut === 'PEN';
    return {
      statut,
      golHome: ftFiable ? ft.home : (f.goals && f.goals.home),
      golAway: ftFiable ? ft.away : (f.goals && f.goals.away),
      scoreFiable: !alleeEnProlongation || ftFiable
    };
  } catch (e) {
    stats.erreurs.push(`fixtures?id=${fixtureId} (relance ciblée) : ${e.message}`);
    return null;
  }
}

// ============================================================================
// RELAIS BSD (30/09) — résultat d'un match BSD (fixture_id foot négatif).
// null = inconnu/pas terminé/incertain → la sélection reste EN ATTENTE
// (jamais void, jamais deviné). Détail par id d'abord, sinon liste de la date
// (une seule lecture par date et par passage).
// ============================================================================
let cacheBSD = { parId: new Map(), scanParDate: new Map() };
function resetCacheBSD() { cacheBSD = { parId: new Map(), scanParDate: new Map() }; }

async function infoBSDPourLeg(fixtureId, dateIso) {
  if (!BSD_API_KEY) return null;
  const id = -Number(fixtureId);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  if (!cacheBSD.parId.has(id)) {
    let ev = await bsdRelais.recupererEvenementParId({ cle: BSD_API_KEY, hote: BSD_HOST, id });
    if (!ev) {
      if (!cacheBSD.scanParDate.has(dateIso)) {
        const r = await bsdRelais.recupererEvenementsParDate({ cle: BSD_API_KEY, hote: BSD_HOST, dateIso });
        if (r.erreur) stats.erreurs.push(`BSD liste(${dateIso}): ${r.erreur}`);
        cacheBSD.scanParDate.set(dateIso, r.carte);
      }
      ev = cacheBSD.scanParDate.get(dateIso).get(id) || null;
    }
    cacheBSD.parId.set(id, ev ? bsdRelais.resultatDepuisEvenementBSD(ev) : null);
  }
  return cacheBSD.parId.get(id);
}

// RÈGLEMENT DE SECOURS PAR NOMS (30/09) — UNIQUEMENT quand API-Sports a
// échoué pour la date. Une sélection à id API-Sports est réglée d'après BSD si
// et seulement si l'appariement est strict (voir trouverEvenementParNoms) ET
// que le match est terminé avec un score à 90 minutes sûr. Jamais de void par
// cette voie, jamais de buteur. Sinon null → la sélection reste en attente.
async function infoBSDParNoms(leg, dateIso, accepterAnnule) {
  if (!BSD_API_KEY || leg.market === 'mk_buteur') return null;
  const morceaux = String(leg.match_label || '').split(' — ');
  if (morceaux.length !== 2) return null;
  const t = Date.parse(leg.kickoff_at);
  if (!isFinite(t)) return null;
  const jours = [...new Set([dateIso, new Date(t).toISOString().slice(0, 10)])];
  const evenements = [];
  for (const jour of jours) {
    if (!cacheBSD.scanParDate.has(jour)) {
      const r = await bsdRelais.recupererEvenementsParDate({ cle: BSD_API_KEY, hote: BSD_HOST, dateIso: jour });
      if (r.erreur) stats.erreurs.push(`BSD liste(${jour}): ${r.erreur}`);
      cacheBSD.scanParDate.set(jour, r.carte);
    }
    cacheBSD.scanParDate.get(jour).forEach(ev => evenements.push(ev));
  }
  const ev = bsdRelais.trouverEvenementParNoms({ evenements, home: morceaux[0], away: morceaux[1], kickoffIso: leg.kickoff_at });
  if (!ev) return null;
  const res = bsdRelais.resultatDepuisEvenementBSD(ev);
  if (!res) return null;
  if (res.statut !== 'FT' && !(accepterAnnule && (res.statut === 'CANC' || res.statut === 'PST'))) return null;
  return Object.assign({}, res, { parNoms: true, bsdId: ev.id, scoreTexte: ev.home_score + '-' + ev.away_score });
}


// ============================================================================
// RATTRAPAGE BSD D'UNE DATE (30/09) — sur demande uniquement (?diag=bsd-rattrapage,
// jamais automatique). Fiches FOOT encore « pending » dont des sélections ont été
// mises en void à tort pendant une panne d'API-Sports. Chaque sélection est
// recalculée d'après BSD (appariement strict par noms, score 90 min sûr).
// RÈGLE : tout ou rien PAR FICHE. Si une seule sélection de la fiche ne peut pas
// être confirmée (match introuvable/ambigu/prolongation/pas terminé/buteur), la
// fiche entière reste INTACTE. Un match que BSD confirme reporté/annulé reste void.
// appliquer=false (défaut) : rien n'est écrit, seulement le rapport.
// ============================================================================
async function rattraperDateBSD(dateIso, appliquer) {
  const rapport = { date: dateIso, appliquer: appliquer === true, fiches: [] };
  if (!BSD_API_KEY) { rapport.erreur = 'BSD_API_KEY absente'; return rapport; }
  resetCacheBSD();
  const tickets = await sbSelect('tickets', `select=id,code,play_date,sport&status=eq.pending&sport=eq.foot&play_date=eq.${dateIso}`);
  for (const t of tickets) {
    const legs = await sbSelect('ticket_legs', `select=id,fixture_id,market,pick,result,match_label,kickoff_at&ticket_id=eq.${t.id}&order=position.asc`);
    const fiche = { code: t.code, selections: [], complete: true, ecrit: false };
    const nouveaux = [];
    for (const leg of legs) {
      const ligne = { match: leg.match_label, marche: leg.market, pick: leg.pick, avant: leg.result };
      if (leg.fixture_id < 0) { ligne.raison = 'match BSD (géré par le règlement normal)'; fiche.complete = false; fiche.selections.push(ligne); continue; }
      let info = null;
      try { info = await infoBSDParNoms(leg, dateIso, true); } catch (e) { ligne.raison = 'erreur BSD: ' + e.message; }
      if (!info) { ligne.raison = ligne.raison || 'BSD : aucun match sûr (introuvable, ambigu, pas terminé ou prolongation)'; fiche.complete = false; fiche.selections.push(ligne); continue; }
      ligne.bsdId = info.bsdId; ligne.scoreBSD = info.scoreTexte;
      let res = null;
      if (info.statut === 'FT') res = evaluerLeg(leg, info.golHome, info.golAway, undefined);
      else res = 'void'; // reporté/annulé confirmé par BSD
      if (res === null) { ligne.raison = 'marché non évaluable automatiquement'; fiche.complete = false; fiche.selections.push(ligne); continue; }
      ligne.apres = res; ligne.statutBSD = info.statut;
      fiche.selections.push(ligne);
      nouveaux.push({ leg, res, info });
    }
    if (fiche.complete) {
      const finals = legs.map(l => { const n = nouveaux.find(x => x.leg.id === l.id); return n ? n.res : l.result; });
      const aPerdu = finals.includes('lost'), aGagne = finals.includes('won');
      const estExact = String(t.code || '').endsWith('-EXACT');
      fiche.statutFinal = (!aPerdu && !aGagne) ? 'pending (tout void)' : estExact ? (aGagne ? 'won' : 'lost') : (aPerdu ? 'lost' : 'won');
      if (appliquer === true && (aPerdu || aGagne)) {
        for (const n of nouveaux) {
          if (n.leg.result === n.res) continue;
          await sbUpdate('ticket_legs', n.leg.id, { result: n.res, settled_at: new Date().toISOString() });
          await enregistrerValidationLog({
            scope: 'leg', fixture_id: n.leg.fixture_id, ticket_id: t.id, ticket_code: t.code, leg_id: n.leg.id,
            market: n.leg.market, pick: n.leg.pick,
            actual_result: n.info.statut === 'FT' ? `Score temps réglementaire ${n.info.scoreTexte} (BSD)` : `Match ${n.info.statut} (BSD)`,
            statistic_used: `rattrapage BSD, appariement strict par noms, id BSD ${n.info.bsdId}`,
            source: 'bsd', status_before: n.leg.result, status_after: n.res
          });
        }
        await sbUpdate('tickets', t.id, { status: fiche.statutFinal, settled_at: new Date().toISOString() });
        await enregistrerValidationLog({
          scope: 'ticket', fixture_id: null, ticket_id: t.id, ticket_code: t.code, leg_id: null, market: null, pick: null,
          actual_result: `rattrapage BSD : ${finals.filter(x => x === 'won').length} won / ${finals.filter(x => x === 'lost').length} lost / ${finals.filter(x => x === 'void').length} void`,
          statistic_used: 'rattrapage BSD (toutes les sélections confirmées)', source: 'bsd', status_before: 'pending', status_after: fiche.statutFinal
        });
        fiche.ecrit = true;
      }
    }
    rapport.fiches.push(fiche);
  }
  return rapport;
}

// ============================================================================
// 6. RÈGLEMENT D'UNE DATE (tous les tickets pending dont play_date = dateIso)
// ============================================================================

// ============================================================================
// 6bis. RÈGLEMENT BASKETBALL (session suivante) — plus simple que le foot :
// chaque fiche n'a qu'UNE seule sélection (règle du générateur basketball),
// donc le statut de la fiche est directement celui de son unique leg,
// jamais de logique AND/OR à trancher entre plusieurs marchés.
// ============================================================================
// ============================================================================
// HISTORIQUE MAISON BASKETBALL (session suivante, "chantier" décidé après
// diag=basket-stats du 30/08 — /statistics et /standings bloqués sur le
// plan gratuit pour la saison en cours). /games/statistics/teams (box-
// score d'un match DÉJÀ JOUÉ) fonctionne, lui — accumulé match après
// match dans basket_team_game_stats, UNIQUEMENT pour les matchs sur
// lesquels on a réellement misé (jamais tous les matchs de la journée,
// pour ne jamais mettre en danger le quota basketball déjà limité à
// 100/jour, partagé entre génération et règlement). Vérifie d'abord si
// déjà capturé (évite de dépenser un appel API pour rien sur les passages
// suivants du même jour — le règlement tourne toutes les heures).
// ============================================================================
async function capturerStatsEquipesBasket(gameId, dateIso, teamHomeId, teamAwayId, ptsHome, ptsAway) {
  if (teamHomeId == null || teamAwayId == null) return;
  try {
    const dejaCapture = await sbSelect('basket_team_game_stats', `select=game_id&game_id=eq.${gameId}&limit=1`);
    if (dejaCapture.length) return; // déjà fait un jour précédent — jamais redépenser un appel API
  } catch (e) {
    stats.erreurs.push(`verif stats basket déjà capturées(${gameId}): ${e.message}`);
    return; // prudence : en cas de doute, ne pas dépenser l'appel
  }

  let equipes;
  try {
    equipes = await apiSportsGetBasket('/games/statistics/teams', { id: gameId });
  } catch (e) {
    stats.erreurs.push(`basket/games/statistics/teams(${gameId}): ${e.message}`);
    return;
  }
  if (!Array.isArray(equipes) || !equipes.length) return;

  const lignes = equipes.map(e => {
    const tid = e.team && e.team.id;
    if (tid == null) return null;
    const estHome = tid === teamHomeId;
    return {
      game_id: gameId, team_id: tid, opponent_id: estHome ? teamAwayId : teamHomeId, is_home: estHome,
      points_for: estHome ? ptsHome : ptsAway, points_against: estHome ? ptsAway : ptsHome,
      field_goals_pct: e.field_goals && e.field_goals.percentage != null ? Number(e.field_goals.percentage) : null,
      threept_pct: e.threepoint_goals && e.threepoint_goals.percentage != null ? Number(e.threepoint_goals.percentage) : null,
      freethrows_pct: e.freethrows_goals && e.freethrows_goals.percentage != null ? Number(e.freethrows_goals.percentage) : null,
      rebounds: e.rebounds && e.rebounds.total != null ? Number(e.rebounds.total) : null,
      assists: e.assists != null ? Number(e.assists) : null,
      steals: e.steals != null ? Number(e.steals) : null,
      blocks: e.blocks != null ? Number(e.blocks) : null,
      turnovers: e.turnovers != null ? Number(e.turnovers) : null,
      game_date: dateIso
    };
  }).filter(Boolean);

  if (!lignes.length) return;
  try {
    await sbInsert('basket_team_game_stats', lignes);
  } catch (e) {
    // Non bloquant : l'historique est un bonus, jamais une raison de faire
    // échouer le règlement réel des fiches.
    stats.erreurs.push(`ecriture basket_team_game_stats(${gameId}): ${e.message}`);
  }
}

// besoinApi (30/09) : faux quand AUCUNE fiche basket de cette date n'a de leg
// sans résultat (voir trierTicketsAReglerSelonLegs) — dans ce cas on n'envoie
// aucune requête à API-Sports ni à The Odds API. Absent = vrai (ancien
// comportement, pour tout appelant qui ne le précise pas).
async function reglerTicketsBasket(dateIso, ticketsBasket, besoinApi) {
  if (besoinApi === undefined) besoinApi = true;
  // Déplacé AVANT la construction de parGame (30/09) : on a besoin de
  // connaître les fixture_id réellement engagés pour savoir si un appel
  // The Odds API est nécessaire — jamais systématique, pour ne pas gaspiller
  // le quota gratuit (500 crédits/mois, partagé avec la génération) sur des
  // dates qui n'ont que des fiches API-Sports.
  let gameIdsAvecPari = [];
  try {
    const legsParies = await sbSelect('ticket_legs',
      `select=fixture_id,tickets!inner(play_date,sport)&tickets.play_date=eq.${dateIso}&tickets.sport=eq.basket`);
    gameIdsAvecPari = [...new Set(legsParies.map(l => l.fixture_id))];
  } catch (e) {
    stats.erreurs.push(`lecture fixture_id paries basket(${dateIso}): ${e.message}`);
  }
  const besoinOddsApi = gameIdsAvecPari.some(estIdOddsApi);

  // 30/09 : null = l'appel a ÉCHOUÉ (compte suspendu, quota, réseau) — la
  // source est alors « indisponible » : ses sélections restent EN ATTENTE au
  // lieu d'être voidées comme si le match avait disparu (voir plus bas).
  let apiSportsIndisponible = false;
  let oddsApiIndisponible = false;
  let matchsJour = [];
  if (besoinApi) {
    const r = await recupererMatchsBasketDate(dateIso);
    if (r === null) apiSportsIndisponible = true; else matchsJour = r;
  }
  // Index gameId → {statut, ptsHome, ptsAway}. ⚠️ Chemin des scores
  // (g.scores.home.total / g.scores.away.total) cohérent avec la
  // convention habituelle de cette famille d'API, mais PAS ENCORE VÉRIFIÉ
  // sur un vrai match terminé (voir avertissement plus haut) — si absent
  // ou de forme différente, ptsFiable=false et le leg reste "en attente",
  // jamais un score inventé.
  const parGame = {};
  matchsJour.forEach(g => {
    if (!g || !g.id) return;
    const statut = g.status && g.status.short;
    const ptsHome = g.scores && g.scores.home && g.scores.home.total;
    const ptsAway = g.scores && g.scores.away && g.scores.away.total;
    parGame[g.id] = {
      statut,
      ptsHome: (typeof ptsHome === 'number') ? ptsHome : null,
      ptsAway: (typeof ptsAway === 'number') ? ptsAway : null,
      // Session suivante (historique maison, voir capturerStatsEquipesBasket).
      teamHomeId: g.teams && g.teams.home && g.teams.home.id,
      teamAwayId: g.teams && g.teams.away && g.teams.away.id,
      source: 'api-sports-basketball'
    };
  });

  // CRITIQUE (30/09) — fusion de la source The Odds API, UNIQUEMENT si au
  // moins un fixture_id pariés ce jour-là en a besoin (voir besoinOddsApi
  // ci-dessus). Les identifiants des deux sources ne se chevauchent JAMAIS
  // (entier positif pour API-Sports, entier négatif pour Odds API), donc
  // aucun risque d'écraser une entrée API-Sports existante dans parGame.
  // Chaque évènement /scores/ est indexé par le MÊME encodage que celui
  // calculé à la génération : c'est ce qui permet de retrouver le score à
  // partir du seul fixture_id lu en base.
  if (besoinApi && besoinOddsApi) {
    const matchsJourOdds = await recupererMatchsBasketDateOddsApi(dateIso);
    if (matchsJourOdds === null) {
      oddsApiIndisponible = true;
    } else {
      matchsJourOdds.forEach(ev => {
        if (!ev || !ev.id) return;
        const idNumerique = oddsApiIdVersEntier(ev.id);
        if (idNumerique === null) return; // id illisible : jamais un score rattaché au mauvais match
        parGame[idNumerique] = Object.assign(evenementOddsApiScoreVersInfo(ev), { source: 'odds-api-basketball' });
      });
    }
  }
  // La source d'un leg se lit dans le SIGNE de son fixture_id (voir lib/id-source.js).
  const sourceIndisponiblePour = fixtureId => (estIdOddsApi(fixtureId) ? oddsApiIndisponible : apiSportsIndisponible);

  const ecouler = joursEcoules(dateIso);

  // Historique maison (session suivante) : capture les box-scores des
  // matchs basketball réellement terminés PARMI CEUX SUR LESQUELS ON A
  // PARIÉ (jamais tous les matchs de la journée) — un seul passage par
  // match grâce à la vérification "déjà capturé" à l'intérieur de la
  // fonction, peu importe combien de fois le règlement repasse dessus.
  for (const gid of gameIdsAvecPari) {
    if (!besoinApi) break; // rien à régler : aucune requête, même pour l'historique maison
    const info = parGame[gid];
    if (info && STATUTS_TERMINES_BASKET.includes(info.statut) && info.ptsHome != null && info.ptsAway != null) {
      await capturerStatsEquipesBasket(gid, dateIso, info.teamHomeId, info.teamAwayId, info.ptsHome, info.ptsAway);
    }
  }

  for (const ticket of ticketsBasket) {
    stats.ticketsExamines++;
    let legs;
    try {
      legs = await sbSelect('ticket_legs',
        `select=id,fixture_id,market,pick,result&ticket_id=eq.${ticket.id}&order=position.asc`);
    } catch (e) {
      stats.erreurs.push(`lecture legs basket(ticket=${ticket.id}): ${e.message}`);
      continue;
    }
    // Toujours 1 seule leg par construction (générateur basketball) — la
    // boucle reste écrite pour tolérer plusieurs legs sans jamais en
    // dépendre, au cas où ça évoluerait plus tard.
    let toutesResolues = true;
    for (const leg of legs) {
      if (leg.result) continue;
      const info = parGame[leg.fixture_id];
      let nouveauResultat = null;

      if (info && STATUTS_TERMINES_BASKET.includes(info.statut) && info.ptsHome != null && info.ptsAway != null) {
        nouveauResultat = evaluerLegBasket(leg, info.ptsHome, info.ptsAway);
      } else if (info && STATUTS_ANNULES_BASKET.includes(info.statut)) {
        nouveauResultat = 'void';
      } else if (ecouler >= 1 && !sourceIndisponiblePour(leg.fixture_id)) {
        // Règle des 23h59 Haïti, même principe que le foot : jamais bloquer indéfiniment.
        // 30/09 : uniquement quand la source a RÉPONDU sans ce match. Si l'appel
        // a échoué (suspension, quota, réseau), on ne sait rien du match : la
        // sélection reste en attente et sera retentée au prochain passage.
        nouveauResultat = 'void';
      }

      if (nouveauResultat === null) { toutesResolues = false; continue; }

      try {
        await sbUpdate('ticket_legs', leg.id, { result: nouveauResultat, settled_at: new Date().toISOString() });
        stats.legsMisAJour[nouveauResultat]++;
        leg.result = nouveauResultat;
        await enregistrerValidationLog({
          scope: 'leg', fixture_id: leg.fixture_id, ticket_id: ticket.id, ticket_code: ticket.code,
          leg_id: leg.id, market: leg.market, pick: leg.pick,
          actual_result: info ? `Score final ${info.ptsHome}-${info.ptsAway} (statut ${info.statut})` : 'Statut indisponible — règle 23h59 appliquée',
          statistic_used: info ? `statut=${info.statut}` : 'aucune donnée basketball pour cette date',
          source: info ? info.source : 'api-sports-basketball', status_before: null, status_after: nouveauResultat
        });
      } catch (e) {
        stats.erreurs.push(`maj leg basket(${leg.id}): ${e.message}`);
        toutesResolues = false;
      }
    }

    if (!toutesResolues) { stats.ticketsEnAttente++; continue; }

    const aPerdu = legs.some(l => l.result === 'lost');
    const aGagne = legs.some(l => l.result === 'won');
    if (!aPerdu && !aGagne) { stats.ticketsToutVoid++; continue; } // tout void : décision manuelle admin

    const statutFinal = aPerdu ? 'lost' : 'won';
    try {
      await sbUpdate('tickets', ticket.id, { status: statutFinal, settled_at: new Date().toISOString() });
      stats.ticketsRegles[statutFinal]++;
      await enregistrerValidationLog({
        scope: 'ticket', fixture_id: null, ticket_id: ticket.id, ticket_code: ticket.code,
        leg_id: null, market: null, pick: null,
        actual_result: `${legs.filter(l => l.result === 'won').length} won / ${legs.filter(l => l.result === 'lost').length} lost / ${legs.filter(l => l.result === 'void').length} void sur ${legs.length} sélection(s)`,
        statistic_used: 'fiche basketball à sélection unique : le résultat du leg = le résultat de la fiche',
        source: 'api-sports-basketball', status_before: 'pending', status_after: statutFinal
      });
    } catch (e) {
      stats.erreurs.push(`maj ticket basket(${ticket.id}): ${e.message}`);
    }
  }
}

async function reglerDate(dateIso) {
  stats.datesTraitees.push(dateIso);

  let tickets;
  try {
    tickets = await sbSelect('tickets',
      `select=id,code,play_date,sport&status=eq.pending&play_date=eq.${dateIso}`);
  } catch (e) {
    stats.erreurs.push(`lecture tickets(${dateIso}): ${e.message}`);
    return;
  }
  if (!tickets.length) return;

  // ÉCONOMIE D'APPELS (30/09, audit) : le règlement repasse chaque heure. Une
  // fiche dont toutes les sélections sont déjà 'void' attend une décision
  // MANUELLE de l'admin — la re-régler ne change rien, et pourtant chaque
  // passage horaire envoyait 1 appel foot + 1 appel basket pour elle (fiches
  // du 26/09 : ~48 appels/jour, non comptés). On lit donc d'abord les legs
  // en base (gratuit) et on n'appelle API-Sports que s'il reste une leg SANS
  // résultat. Les fiches concernées gardent exactement le même traitement.
  let besoinBsdIds = null; // relais BSD : tickets foot ayant une leg BSD en attente
  let besoinApiIds = null; // null = lecture impossible → comportement d'avant (tout traiter, appeler l'API)
  try {
    const ids = tickets.map(t => t.id);
    const legsRows = await sbSelect('ticket_legs',
      `select=ticket_id,result,fixture_id&ticket_id=in.(${ids.join(',')})&limit=5000`);
    const tri = garde.trierTicketsAReglerSelonLegs(tickets, legsRows);
    stats.ticketsSansRienARegler += tickets.length - tri.aTraiter.length;
    stats.ticketsToutVoid += tickets.length - tri.aTraiter.length; // même statistique qu'avant : fiche 100% void en attente admin
    tickets = tri.aTraiter;
    besoinApiIds = tri.besoinApiIds;
    besoinBsdIds = tri.besoinBsdIds;
  } catch (e) {
    stats.erreurs.push(`pré-lecture legs(${dateIso}): ${e.message} — traitement complet comme avant`);
  }
  if (!tickets.length) { stats.datesSansAppelApi++; return; }
  const besoinApiPour = liste => besoinApiIds === null || liste.some(t => besoinApiIds.has(t.id));

  // Session suivante (règlement basketball) : séparé dès la lecture — un
  // fixture_id foot et un gameId basketball peuvent coïncider
  // numériquement par pur hasard, jamais une seule table de
  // correspondance commune entre les deux sports. sport absent/'foot' →
  // traité comme foot (compatibilité avec les fiches déjà en base avant
  // ce correctif, qui n'avaient pas encore ce distinguo).
  const ticketsFoot = tickets.filter(t => t.sport !== 'basket');
  const ticketsBasket = tickets.filter(t => t.sport === 'basket');

  if (ticketsBasket.length) await reglerTicketsBasket(dateIso, ticketsBasket, besoinApiPour(ticketsBasket));
  if (!ticketsFoot.length) return;
  tickets = ticketsFoot;

  // Aucune leg foot sans résultat : aucun appel (les fiches sont seulement
  // finalisées à partir des résultats déjà en base).
  const besoinApiFoot = besoinApiPour(ticketsFoot);
  if (!besoinApiFoot) stats.datesSansAppelApi++;
  let fixturesJour = besoinApiFoot ? await recupererFixturesDate(dateIso) : [];
  let apiFootEnEchec = false;
  if (fixturesJour === null) {
    // 30/09 : l'appel a ÉCHOUÉ (suspension, quota, réseau) — on ne sait RIEN
    // des matchs. Avant, [] était substitué et la règle des 23h59 voidait les
    // sélections de plus de 2 jours comme si les matchs avaient disparu.
    // Maintenant : rien n'est modifié, tout reste « en attente » jusqu'à ce
    // qu'API-Sports réponde de nouveau.
    // Relais BSD : seules les fiches ayant une sélection BSD en attente
    // continuent (via BSD) ; les sélections API-Sports restent en attente.
    const aSelectionBsd = besoinBsdIds && ticketsFoot.some(t => besoinBsdIds.has(t.id));
    const aSelectionSecours = !!BSD_API_KEY && besoinApiIds && ticketsFoot.some(t => besoinApiIds.has(t.id));
    if (!(aSelectionBsd || aSelectionSecours)) {
      stats.ticketsEnAttente += ticketsFoot.length;
      return;
    }
    apiFootEnEchec = true;
    fixturesJour = [];
  }
  // Index rapide fixture_id → {statut, golHome, golAway, scoreFiable}
  //
  // PROLONGATIONS (27/08, section 11 du cahier des charges — "le bot doit
  // avoir de vraies données pour mettre won ou lost, jamais deviner") :
  // tous les marchés actuellement générés par le bot (1X2, double chance,
  // BTTS, totaux, score exact, buteur) sont des marchés "90 minutes" au
  // sens bookmaker standard — les cotes sont toujours calculées sur le
  // temps réglementaire, jamais la prolongation (sauf marché explicite de
  // qualification, qu'on ne génère pas). f.goals.home/away d'API-Sports
  // est le score APRÈS prolongation pour un match AET — donc FAUX pour
  // ces marchés si on l'utilise tel quel. f.score.fulltime.home/away est
  // le vrai score à la 90e minute.
  //
  // RÈGLE STRICTE : pour un match FT (jamais allé en prolongation), goals
  // et fulltime sont par définition identiques — les deux sont fiables.
  // Pour un match AET ou PEN, fulltime est OBLIGATOIRE : s'il manque,
  // scoreFiable=false et le match est traité comme "pas encore
  // exploitable" (le leg reste en attente, jamais réglé sur une
  // supposition) — plutôt qu'un repli silencieux sur goals qui donnerait
  // un verdict inventé, potentiellement faux, comme cela s'est produit
  // pour Celje–Slovan Bratislava le 26/08.
  const parFixture = {};
  fixturesJour.forEach(f => {
    if (!f.fixture) return;
    const statut = f.fixture.status && f.fixture.status.short;
    const ft = f.score && f.score.fulltime;
    const ftFiable = ft && ft.home != null && ft.away != null;
    const alleeEnProlongation = statut === 'AET' || statut === 'PEN';
    parFixture[f.fixture.id] = {
      statut,
      golHome: ftFiable ? ft.home : (f.goals && f.goals.home),
      golAway: ftFiable ? ft.away : (f.goals && f.goals.away),
      // scoreFiable=false uniquement quand le match EST allé en
      // prolongation ET que fulltime n'est pas fourni par l'API — le seul
      // cas où utiliser goals serait une supposition, jamais la vraie
      // donnée du temps réglementaire.
      scoreFiable: !alleeEnProlongation || ftFiable
    };
  });

  const cacheButeurs = {}; // fixture_id → liste de noms, calculé une seule fois par match même si plusieurs legs buteur

  for (const ticket of tickets) {
    stats.ticketsExamines++;
    let legs;
    try {
      legs = await sbSelect('ticket_legs',
        `select=id,fixture_id,market,pick,result,match_label,kickoff_at&ticket_id=eq.${ticket.id}&order=position.asc`);
    } catch (e) {
      stats.erreurs.push(`lecture legs(ticket=${ticket.id}): ${e.message}`);
      continue;
    }

    let toutesResolues = true;
    const ecouler = joursEcoules(dateIso); // 0 = aujourd'hui, 1 = hier, etc.
    // Le règlement tourne toutes les heures (schedule '0 10-23 * * *') :
    // sans ce garde-fou, retenterFixtureUnique() se redéclencherait à
    // CHAQUE passage tant qu'un match reste bloqué le même jour (jusqu'à
    // 14 fois), au lieu d'une seule fois comme prévu — coûteux et inutile
    // sur le quota. 10h UTC = première heure de la fenêtre planifiée.
    const premierPassageDuJour = new Date().getUTCHours() === 10;

    for (const leg of legs) {
      if (leg.result) continue; // déjà réglé lors d'un passage précédent

      let info = parFixture[leg.fixture_id];
      // Relais BSD : fiche foot + fixture_id négatif = match BSD.
      const estLegBSD = Number(leg.fixture_id) < 0;
      if (estLegBSD && !info) {
        stats.bsd.legsExaminees++;
        info = await infoBSDPourLeg(leg.fixture_id, dateIso) || undefined;
      } else if (!estLegBSD && !info && apiFootEnEchec) {
        // Secours : API-Sports indisponible → BSD, appariement strict par noms.
        info = await infoBSDParNoms(leg, dateIso) || undefined;
      }
      let nouveauResultat = null;

      let buteursPourLog = null; // section 23 : trace la donnée réelle utilisée, si applicable
      if (info && STATUTS_TERMINES.includes(info.statut) && info.scoreFiable) {
        let buteurs = undefined;
        if (leg.market === 'mk_buteur') {
          if (!(leg.fixture_id in cacheButeurs)) {
            cacheButeurs[leg.fixture_id] = await recupererButeurs(leg.fixture_id);
          }
          buteurs = cacheButeurs[leg.fixture_id];
        }
        buteursPourLog = buteurs || null;
        nouveauResultat = evaluerLeg(leg, info.golHome, info.golAway, buteurs);
      } else if (info && STATUTS_ANNULES.includes(info.statut)) {
        nouveauResultat = 'void';
      } else if (info && STATUTS_TERMINES.includes(info.statut) && !info.scoreFiable) {
        // Match AET/PEN terminé mais fulltime absent du lot groupé du
        // jour. CORRIGÉ (18/09) : avant de voider, une relance ciblée sur
        // cette fixture précise (voir retenterFixtureUnique) — parfois
        // l'API renvoie enfin un fulltime fiable à l'appel individuel
        // alors que le lot groupé ne l'avait pas. Si ça échoue encore,
        // un jour de grâce SUPPLÉMENTAIRE (ecouler>=2 au lieu de 1) avant
        // d'abandonner en 'void' — jamais indéfiniment bloqué, mais
        // jamais abandonné après une seule tentative non plus.
        if (ecouler >= 1) {
          const retente = premierPassageDuJour ? await retenterFixtureUnique(leg.fixture_id) : null;
          if (retente && retente.scoreFiable) {
            let buteursRetente = buteursPourLog;
            if (leg.market === 'mk_buteur') {
              if (!(leg.fixture_id in cacheButeurs)) {
                cacheButeurs[leg.fixture_id] = await recupererButeurs(leg.fixture_id);
              }
              buteursRetente = cacheButeurs[leg.fixture_id];
            }
            buteursPourLog = buteursRetente || null;
            nouveauResultat = evaluerLeg(leg, retente.golHome, retente.golAway, buteursRetente);
          } else if (ecouler >= 2) {
            nouveauResultat = 'void';
          } else {
            stats.erreurs.push(`fixture ${leg.fixture_id} : AET/PEN sans fulltime fiable même après relance ciblée, leg ${leg.id} laissé en attente (1 jour de grâce supplémentaire)`);
          }
        } else {
          stats.erreurs.push(`fixture ${leg.fixture_id} : AET/PEN sans score fulltime fiable, leg ${leg.id} laissé en attente`);
        }
      } else if (estLegBSD) {
        // Relais BSD : résultat BSD absent/pas terminé/incertain → on attend.
        // JAMAIS la règle des 23h59 (pas de void sur simple absence de donnée).
      } else if (apiFootEnEchec) {
        // API-Sports a échoué pendant ce passage : on ne sait rien, on attend.
      } else if (ecouler >= 1) {
        // Règle des 23h59 Haïti : match introuvable dans /fixtures, ou
        // statut bloqué en NS/TBD/LIVE anormalement longtemps. CORRIGÉ
        // (18/09) : même relance ciblée qu'au-dessus avant d'abandonner —
        // un match absent du lot groupé peut très bien être présent à
        // l'appel individuel (limite de pagination ou décalage de fuseau
        // sur l'appel en bloc, par exemple). Void seulement si la relance
        // échoue ENCORE le jour suivant (ecouler>=2).
        const retente = premierPassageDuJour ? await retenterFixtureUnique(leg.fixture_id) : null;
        if (retente && STATUTS_TERMINES.includes(retente.statut) && retente.scoreFiable) {
          let buteursRetente = null;
          if (leg.market === 'mk_buteur') {
            if (!(leg.fixture_id in cacheButeurs)) {
              cacheButeurs[leg.fixture_id] = await recupererButeurs(leg.fixture_id);
            }
            buteursRetente = cacheButeurs[leg.fixture_id];
          }
          buteursPourLog = buteursRetente;
          nouveauResultat = evaluerLeg(leg, retente.golHome, retente.golAway, buteursRetente);
        } else if (retente && STATUTS_ANNULES.includes(retente.statut)) {
          nouveauResultat = 'void';
        } else if (ecouler >= 2) {
          nouveauResultat = 'void';
        } else {
          stats.erreurs.push(`fixture ${leg.fixture_id} : introuvable/statut bloqué même après relance ciblée, leg ${leg.id} laissé en attente (1 jour de grâce supplémentaire)`);
        }
      }

      if (nouveauResultat === null) {
        toutesResolues = false;
        continue;
      }

      try {
        // settled_at : horodatage du règlement, écrit une seule fois. Une
        // leg dont le result est déjà renseigné est ignorée plus haut
        // (`if (leg.result) continue`), donc on n'écrase jamais un verdict
        // déjà rendu — règle de fiabilité du 25/08.
        await sbUpdate('ticket_legs', leg.id, {
          result: nouveauResultat,
          settled_at: new Date().toISOString()
        });
        stats.legsMisAJour[nouveauResultat]++;
        if (estLegBSD || (info && info.parNoms)) stats.bsd.legsResolues++;
        leg.result = nouveauResultat; // reflète localement pour le calcul du ticket ci-dessous

        // Section 23 du cahier des charges (27/08) : une ligne de log par
        // leg réglé — jamais bloquant pour le règlement réel lui-même (voir
        // enregistrerValidationLog, qui avale ses propres erreurs).
        // status_before toujours null ici : le `if (leg.result) continue`
        // plus haut garantit qu'on n'entre dans ce bloc que pour un leg
        // jamais encore réglé.
        await enregistrerValidationLog({
          scope: 'leg',
          fixture_id: leg.fixture_id,
          ticket_id: ticket.id,
          ticket_code: ticket.code,
          leg_id: leg.id,
          market: leg.market,
          pick: leg.pick,
          actual_result: !info
            ? 'Statut indisponible (fixture absente de la réponse API-Sports du jour) — règle 23h59 appliquée'
            : buteursPourLog !== null
              ? `Buteurs 90min : ${buteursPourLog.length ? buteursPourLog.join(', ') : 'aucun'}`
              : `Score temps réglementaire ${info.golHome}-${info.golAway} (statut ${info.statut})`,
          statistic_used: !info
            ? 'aucune donnée fixture pour cette date'
            : `statut=${info.statut} fulltime_fiable=${info.scoreFiable}${info.parNoms ? ' (BSD, appariement strict par noms, id BSD ' + info.bsdId + ')' : ''}`,
          source: (estLegBSD || (info && info.parNoms)) ? 'bsd' : 'api-sports',
          status_before: null,
          status_after: nouveauResultat
        });
      } catch (e) {
        stats.erreurs.push(`maj leg(${leg.id}): ${e.message}`);
        toutesResolues = false;
      }

    }

    if (!toutesResolues) {
      stats.ticketsEnAttente++;
      continue; // au moins un match encore en cours ou en échec API : réessai au prochain passage
    }

    /* Statut global calculé sur TOUTES les selections de la fiche, pas
       seulement celles réglées lors de ce passage : une leg déjà marquée
       'lost' à une exécution précédente est sautée par `continue` plus
       haut, et serait invisible si on se fiait au seul drapeau local.
       Règle métier : GAGNÉ seulement si TOUTES les selections sont
       gagnantes ; une seule perdante suffit à faire perdre le combiné.
       Une selection 'void' (match reporté) est neutre — ni gagnante ni
       perdante — conformément à ce qu'attend déjà index.html. */
    const aPerdu = legs.some(l => l.result === 'lost');
    const aGagne = legs.some(l => l.result === 'won');

    if (!aPerdu && !aGagne) {
      /* Toutes les selections sont 'void' (journée entièrement reportée) :
         ce n'est ni une victoire ni une défaite. On laisse la fiche en
         'pending' pour décision manuelle de l'admin plutôt que d'inventer
         un verdict — jamais de résultat artificiel. */
      stats.ticketsToutVoid++;
      continue;
    }

    // RÈGLE SPÉCIALE SCORE EXACT (27/08, section 10 du cahier des charges) :
    // UNIQUEMENT pour la fiche dédiée "-EXACT" produite par
    // construireFicheScoreExact (jamais pour une fiche normale, même si
    // elle contient une ou plusieurs sélections mk_score_exact parmi
    // d'autres marchés — c'est exactement pourquoi on teste le SUFFIXE DU
    // CODE de la fiche, jamais le marché des legs individuellement).
    // Un seul score exact correct suffit à faire gagner toute la fiche.
    const estFicheScoreExacteDediee = String(ticket.code || '').endsWith('-EXACT');
    const statutFinal = estFicheScoreExacteDediee
      ? (aGagne ? 'won' : 'lost')
      : (aPerdu ? 'lost' : 'won');
    try {
      await sbUpdate('tickets', ticket.id, {
        status: statutFinal,
        settled_at: new Date().toISOString()
      });
      stats.ticketsRegles[statutFinal]++;

      // Section 23 : log de validation au niveau fiche — statut_before
      // toujours 'pending' ici (la requête qui a sélectionné ce ticket plus
      // haut filtre déjà status=eq.pending).
      await enregistrerValidationLog({
        scope: 'ticket',
        fixture_id: null,
        ticket_id: ticket.id,
        ticket_code: ticket.code,
        leg_id: null,
        market: null,
        pick: null,
        actual_result: `${legs.filter(l => l.result === 'won').length} won / ${legs.filter(l => l.result === 'lost').length} lost / ${legs.filter(l => l.result === 'void').length} void sur ${legs.length} sélection(s)`,
        statistic_used: estFicheScoreExacteDediee
          ? 'règle score-exact dédiée : un seul won suffit (logique OR)'
          : 'règle normale : un seul lost suffit à perdre (logique AND)',
        source: 'api-sports',
        status_before: 'pending',
        status_after: statutFinal
      });
    } catch (e) {
      stats.erreurs.push(`maj ticket(${ticket.id}): ${e.message}`);
    }
  }
}

// ============================================================================
// 7. ORCHESTRATION PRINCIPALE
// ============================================================================

async function handler(event) {
  resetStats();
  resetCacheBSD();

  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;
  if (modeTest) console.log('[SETTLE] === MODE TEST déclenché manuellement ===');

  // CORRIGÉ (30/09, même bug que côté génération basketball) : bloquer TOUT
  // le règlement (foot ET basket) faute d'API_SPORTS_KEY serait une erreur
  // si ODDS_API_KEY est disponible — le foot resterait de toute façon
  // simplement "en attente" sans clé API-Sports (jamais de verdict inventé,
  // voir recupererFixturesDate), mais le basketball, lui, peut désormais se
  // régler via The Odds API seule.
  if (!API_SPORTS_KEY && !ODDS_API_KEY) {
    stats.erreurs.push('API_SPORTS_KEY et ODDS_API_KEY absentes des variables Netlify');
    logFinal();
    return { statusCode: 500, body: 'Configuration incomplète.' };
  }
  try { verifierConfigSupabase(); }
  catch (e) { stats.erreurs.push(e.message); logFinal(); return { statusCode: 500, body: e.message }; }

  // Toutes les dates distinctes ayant au moins une fiche encore "pending",
  // AUJOURD'HUI INCLUS (25/08 : retiré le blocage qui attendait le
  // lendemain — demande explicite de James, "une fois tous les matchs
  // terminés, va dans historique, pas le lendemain"). Aucun risque de faux
  // verdict : reglerDate() ne marque un résultat que si le statut réel du
  // match chez API-Sports est FT/AET/PEN (vraiment terminé) — un match du
  // jour encore en cours reste "pending" et sera revérifié à l'heure
  // suivante, exactement comme avant pour les dates passées.
  let dates;
  try {
    const q = `select=play_date&status=eq.pending&play_date=lte.${aujourdhuiHaiti()}`;
    const lignes = await sbSelect('tickets', q);
    dates = [...new Set(lignes.map(l => l.play_date))];
  } catch (e) {
    stats.erreurs.push('lecture dates pending: ' + e.message);
    logFinal();
    return { statusCode: 500, body: 'Impossible de lire les tickets en attente.' };
  }

  if (!dates.length) {
    logFinal();
    return { statusCode: 200, body: 'Rien à régler — aucune fiche pending avec une date passée.' };
  }

  for (const d of dates) {
    await reglerDate(d);
  }

  logFinal();
  return {
    statusCode: 200,
    body: `Terminé. ${stats.ticketsRegles.won} gagnée(s), ${stats.ticketsRegles.lost} perdue(s), ${stats.ticketsEnAttente} en attente.`
  };
}

module.exports.handler = handler;
module.exports.rattraperDateBSD = rattraperDateBSD;
module.exports.config = config;
