/**
 * ============================================================================
 * VIP BETCOTE — BOT DE GÉNÉRATION DES FICHES (Netlify Scheduled Function)
 * Fichier : netlify/functions/bot-generate-tickets.js
 * ----------------------------------------------------------------------------
 * Ne touche NI index.html NI admin.html. Écrit directement dans Supabase
 * (tables `tickets` et `ticket_legs`) via la clé service_role — exactement
 * les mêmes tables que celles lues par le Dashboard client et l'admin.
 *
 * DÉCLENCHEMENT
 * L'heure d'Haïti change de décalage UTC selon la saison (heure d'été/hiver,
 * comme aux USA). Plutôt que de figer un cron UTC qui se déréglerait deux
 * fois par an, cette fonction se réveille toutes les 15 min dans une large
 * fenêtre (21h00–23h59 UTC, qui couvre 18h30 Haïti quel que soit le
 * décalage — session suivante, changé de 17h00 à 18h30 sur demande
 * explicite de James : la cible (dateCible) est déjà le lendemain, donc ce
 * décalage n'exclut aucun match, contrairement à un décalage qui aurait
 * touché le jour même) et ne génère RÉELLEMENT qu'au quart d'heure où il
 * est effectivement 18h30 en Haïti. Une vérification en base empêche toute
 * double génération si le cron se déclenche plusieurs fois dans la fenêtre.
 * ============================================================================
 */

// PAS de dépendance @supabase/supabase-js : ce paquet n'est pas déclaré dans
// le package.json du repo (les autres fonctions Netlify du site parlent à
// Supabase en fetch() direct sur l'API REST). On fait pareil ici pour éviter
// tout échec de build lié à une dépendance manquante.

const config = {
  // Toutes les 15 min entre 21h00 et 23h59 UTC — couvre 18h30 Haïti
  // (UTC-4 en heure d'été → 22h30 UTC ; UTC-5 en heure standard → 23h30 UTC)
  schedule: '*/15 21-23 * * *'
};

// ============================================================================
// 1. CONFIGURATION
// ============================================================================

const TZ_HAITI = 'America/Port-au-Prince';

// API-Sports EN DIRECT (dashboard.api-football.com) — PAS RapidAPI.
// Deux abonnements gratuits séparés (100 req/jour chacun), même clé.
const API_SPORTS_KEY = process.env.API_SPORTS_KEY || '';
const FOOT_HOST = 'v3.football.api-sports.io';
const NBA_HOST = 'v2.nba.api-sports.io';
// API basketball GENERIQUE — service DIFFERENT de l'API NBA. Couvre les
// championnats non-NBA (EuroLeague, Liga ACB, Lega A, BBL, NCAA...).
// Teste le 25/08 : l'API NBA (v2) n'expose AUCUN endpoint /odds
// ("This endpoint do not exist."), d'ou le recours a ce service pour
// esperer obtenir de vraies cotes de bookmaker sur le basket.
const BASKET_HOST = 'v1.basketball.api-sports.io';

// Big Balls Sports Data (25/08) — service DISTINCT d'API-Sports, exploré en
// complément d'ANALYSE uniquement (compositions, stats), jamais comme
// source de cotes (leur offre gratuite ne couvre pas les cotes — voir
// diagnostiquerBBSD). Authentification par bearer token, pas par
// x-apisports-key. Clé stockée séparément pour ne jamais la confondre avec
// API_SPORTS_KEY. Cette config n'est utilisée QUE par le mode diagnostic
// (?diag=bbsd) — aucune ligne de la génération réelle des fiches n'y touche.
const BBS_API_KEY = process.env.BBS_API_KEY || '';
const BBS_HOST = 'api.bigballsdata.com';
const BOOKMAKER_ID = 8; // Bet365 — référence large et stable

// Bzzoiro Sports Data / "BSD" (25/08, demande explicite de James) — 2e
// source INDÉPENDANTE d'API-Football, utilisée en complément, jamais en
// remplacement (voir point 18 de son cahier des charges : ne rien casser
// de l'existant). Contrairement à BBS_* ci-dessus (service différent,
// jamais retenu faute de cotes gratuites), BSD offre un vrai plan gratuit
// avec cotes ET prédictions ML — vérifié le 25/08 sur sports.bzzoiro.com.
// Rôle STRICT et volontairement limité au départ ("commencer petit") :
// uniquement une vérification de convergence sur les picks 1X2 (marché le
// plus simple à comparer objectivement, deux sources → deux probabilités
// implicites). N'affecte JAMAIS la cote publiée (toujours celle d'API-
// Football, jamais inventée) — seulement une pondération légère du score
// de confiance. Aucun impact sur double_chance/total_buts/btts/buteur/
// score_exact pour l'instant — extension possible plus tard si James le
// souhaite, une fois ce premier étage validé en conditions réelles.
const BSD_API_KEY = process.env.BSD_API_KEY || '';
const BSD_HOST = 'sports.bzzoiro.com';

// Championnats autorisés — uniquement des compétitions couvertes par les
// grands bookmakers en ligne (pour que l'utilisateur retrouve facilement
// le match ailleurs et puisse parier rapidement). Deux niveaux :
// TOP = 10 plus gros championnats + grandes compétitions internationales
// (prioritaires dans la construction des fiches) ; SECONDAIRE = autres
// 1ʳᵉ divisions reconnues, utilisées en complément si pas assez de matchs
// TOP un jour donné. Jamais de division inférieure (2ᵉ, 3ᵉ, 4ᵉ...).
//
// IDs confirmés par un vrai test le 23/08 : 71, 128, 113. Les autres
// proviennent de la documentation publique API-Sports (identifiants
// stables et largement utilisés dans la communauté) — à confirmer/ajuster
// au fil des prochains tests via le diagnostic championnatsVus des logs,
// comme on l'a fait jusqu'ici.
const TOP_LEAGUES_FOOT = [
  39,   // Premier League (Angleterre)
  140,  // La Liga (Espagne)
  135,  // Serie A (Italie)
  78,   // Bundesliga (Allemagne)
  61,   // Ligue 1 (France)
  71,   // Serie A (Brésil) — confirmé réel le 23/08
  128,  // Liga Profesional (Argentine) — confirmé réel le 23/08
  94,   // Primeira Liga (Portugal)
  88,   // Eredivisie (Pays-Bas)
  203,  // Süper Lig (Turquie)
  307,  // Saudi Pro League — confirmé via diagnostic le 25/08 (Al-Nassr/Al-Ittihad, CR7/Benzema)
  2,    // Ligue des champions UEFA
  3,    // Europa League UEFA
  13,   // CONMEBOL Libertadores — confirmé par un vrai match le 24/08
  1,    // Coupe du Monde
  4,    // Championnat d'Europe des Nations (Euro)
  9     // Copa America
];
const SECONDARY_LEAGUES_FOOT = [
  113,  // Allsvenskan (Suède) — confirmé réel le 23/08
  253,  // MLS (USA)
  262,  // Liga MX (Mexique)
  144,  // Pro League (Belgique)
  32,   // Qualifications Coupe du Monde — zone Europe
  34,   // Qualifications Coupe du Monde — zone Amérique du Sud
  31,   // Qualifications Coupe du Monde — zone CONCACAF
  1028, // CONCACAF Central American Cup — confirmé par un vrai match le 24/08
  // --- Ajouts du 25/08, confirmés via diagnostic /leagues ---
  95,   // Segunda Liga (Portugal, 2ᵉ div)
  701,  // Liga Revelação U23 (Portugal) — ajoutée à la demande explicite de James
  40,   // Championship (Angleterre, 2ᵉ div)
  141,  // Segunda División (Espagne, 2ᵉ div)
  136,  // Serie B (Italie, 2ᵉ div)
  79,   // 2. Bundesliga (Allemagne, 2ᵉ div)
  62,   // Ligue 2 (France, 2ᵉ div)
  89,   // Eerste Divisie (Pays-Bas, 2ᵉ div)
  145,  // Challenger Pro League (Belgique, 2ᵉ div)
  308,  // Division 1 (Arabie Saoudite, 2ᵉ tier)
  305,  // Stars League (Qatar)
  239,  // Primera A (Colombie)
  759,  // Liga Mayor (République Dominicaine)
  288,  // Premier Soccer League (Afrique du Sud)
  // --- Ajouts du 27/08, demande explicite de James (matchs vus ce jour
  // sur des championnats absents de la liste) — IDs issus de la
  // documentation publique API-Sports, PAS confirmés par un vrai match
  // comme les autres entrées ci-dessus : à vérifier au premier passage via
  // le diagnostic stats.championnatsVus, comme fait jusqu'ici pour toute
  // nouvelle ligue.
  48,   // EFL Cup / Carabao Cup (Angleterre) — à confirmer
  848   // UEFA Europa Conference League — à confirmer
];
const ALLOWED_LEAGUES_FOOT = [...TOP_LEAGUES_FOOT, ...SECONDARY_LEAGUES_FOOT];

// Ligues domestiques où le marché buteur est activé — grands championnats
// uniquement, jamais les compétitions continentales/qualifications (clubs
// parfois mineurs en phase préliminaire) ni les divisions secondaires.
// Règle confirmée par James (25/08) : un vrai buteur reconnu (Haaland,
// Mbappé, Kane, Benzema/CR7 type Saudi Pro League), jamais un joueur
// choisi au hasard dans un petit club. Saudi Pro League et Qatar Stars
// League à ajouter ici une fois leurs IDs confirmés (diagnostic en cours).
const LEAGUES_BUTEUR_AUTORISEES = [
  39, 140, 135, 78, 61,  // Big 5 européens
  94, 88, 203,           // Portugal, Pays-Bas, Turquie
  71, 128,               // Brésil, Argentine
  307,                   // Saudi Pro League (CR7, Benzema) — confirmé le 25/08
  253                    // MLS — inclus pour permettre Inter Miami (Messi), voir GRANDS_CLUBS_BUTEUR
];

// Liste des IDs des grands clubs où le buteur est activé (règle du 25/08 :
// pas n'importe quelle équipe d'un grand championnat, seulement les clubs
// avec de vrais grands buteurs reconnus). Le marché buteur n'est propose
// que si AU MOINS UNE des deux equipes du match figure ici.
//
// TOUS ces IDs ont ete confirmes par le diagnostic ?diag=teams (25/08),
// jamais devines. Attention : la recherche renvoie aussi les equipes
// feminines (suffixe W), reserves (II, B, Res.) et jeunes (U19/U21/U23) —
// seuls les IDs des equipes PREMIERES masculines sont retenus ici.
//
// Une fiche n'a PAS toujours besoin d'un buteur : si aucun match du jour
// n'implique un de ces clubs, aucune selection buteur n'est generee, et
// c'est le comportement voulu (regle explicite de James).
const GRANDS_CLUBS_BUTEUR = [
  541,   // Real Madrid (Espagne)
  529,   // Barcelona (Espagne)
  157,   // Bayern München (Allemagne)
  50,    // Manchester City (Angleterre)
  33,    // Manchester United (Angleterre)
  40,    // Liverpool (Angleterre)
  42,    // Arsenal (Angleterre)
  49,    // Chelsea (Angleterre)
  47,    // Tottenham (Angleterre)
  505,   // Inter (Italie)
  496,   // Juventus (Italie)
  489,   // AC Milan (Italie)
  492,   // Napoli (Italie)
  85,    // Paris Saint Germain (France)
  9568,  // Inter Miami (MLS) — Messi
  2939,  // Al-Nassr (Arabie Saoudite) — CR7
  2932,  // Al-Hilal Saudi FC (Arabie Saoudite)
  2938   // Al-Ittihad FC (Arabie Saoudite) — Benzema
];

// Fenêtre horaire football en heure Haïti (règle métier stricte)
const FOOT_MIN_HOUR = 7;   // 07:00 accepté (28/08 v3, demande explicite de James — était 08:00)
const FOOT_MAX_MINUTES = 22 * 60; // 22:00 accepté, 22:01 refusé
// Le basketball n'a AUCUNE limite horaire haute.

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

// SELECT via l'API REST PostgREST de Supabase (jamais SUPABASE_URL avec /rest/v1 en dur ici,
// on le construit une seule fois — évite le bug PGRST125 déjà documenté sur ce projet)
async function sbSelect(table, query) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
  const resp = await fetch(url, { headers: sbHeaders() });
  if (!resp.ok) throw new Error(`Supabase SELECT ${table} → HTTP ${resp.status} : ${await resp.text()}`);
  return resp.json();
}

async function sbInsert(table, rows) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: sbHeaders({ Prefer: 'return=representation' }),
    body: JSON.stringify(rows)
  });
  if (!resp.ok) throw new Error(`Supabase INSERT ${table} → HTTP ${resp.status} : ${await resp.text()}`);
  return resp.json();
}

async function sbDelete(table, query) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/${table}?${query}`;
  const resp = await fetch(url, { method: 'DELETE', headers: sbHeaders() });
  if (!resp.ok) throw new Error(`Supabase DELETE ${table} → HTTP ${resp.status} : ${await resp.text()}`);
  return true;
}

// Appel d'une fonction RPC Postgres (29/08, suivi de quota) — renvoie le
// premier élément du tableau (les RPC "returns table(...)" renvoient
// toujours un tableau via PostgREST, même avec une seule ligne).
async function sbRpc(name, params) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/rpc/${name}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: sbHeaders(),
    body: JSON.stringify(params || {})
  });
  if (!resp.ok) throw new Error(`Supabase RPC ${name} → HTTP ${resp.status} : ${await resp.text()}`);
  const data = await resp.json();
  return Array.isArray(data) ? data[0] : data;
}

// ============================================================================
// SUIVI DE QUOTA API-SPORTS (29/08, demande explicite de James) — table
// api_quota_usage + RPC increment_api_quota (migration Supabase du 29/08).
// Appelée AVANT chaque appel réel à API-Sports (foot) : incrémente le
// compteur interne et dit si on a encore de la marge. QUOTA_MAX_JOUR fixé
// à 95 plutôt que 100 (marge de sécurité — le vrai plafond API-Sports est
// 100/jour, mais notre compteur interne peut légèrement dériver si un
// appel échoue avant d'atteindre l'incrémentation, ou si un autre outil
// hors de ce code appelle l'API directement).
// ============================================================================
const QUOTA_MAX_JOUR = 95;
let quotaInterneEpuise = false; // drapeau local au run : une fois vrai, plus aucun appel tenté

async function verifierEtIncrementerQuota(contexte) {
  if (quotaInterneEpuise) return false;
  try {
    const r = await sbRpc('increment_api_quota', { p_provider: 'api-sports-football', p_max: QUOTA_MAX_JOUR });
    if (r && r.quota_restant <= 0) {
      quotaInterneEpuise = true;
      stats.erreurs.push(`[QUOTA INTERNE ÉPUISÉ] ${contexte || ''} — ${r.call_count}/${r.quota_max} appels aujourd'hui, arrêt propre avant de cogner le vrai quota API-Sports.`);
      return false;
    }
    return true;
  } catch (e) {
    // Non bloquant : si le suivi lui-même échoue (Supabase indisponible),
    // on laisse passer l'appel API-Sports plutôt que de tout bloquer sur
    // un problème de suivi — jamais une raison d'empêcher la génération.
    stats.erreurs.push(`suivi_quota: ${e.message}`);
    return true;
  }
}

// ============================================================================
// SUIVI DU VRAI QUOTA API-SPORTS (session suivante, complète le compteur
// interne ci-dessus) — capture les en-têtes x-ratelimit-requests-remaining/
// -limit renvoyées par API-Sports sur CHAQUE appel réel réussi ou échoué,
// et les écrit via record_real_api_quota (migration Supabase du même jour).
// Remplace la piste /status (diag=quota-status du 29/08), qui s'est révélée
// peu fiable sur le plan gratuit — les en-têtes, elles, sont documentées
// comme présentes sur toute réponse. Non-bloquant : un échec ici (Supabase
// indisponible, etc.) ne doit jamais faire échouer l'appel API-Sports réel
// qui vient d'avoir lieu.
// ============================================================================
async function enregistrerQuotaReel(resp) {
  try {
    const remaining = resp.headers.get('x-ratelimit-requests-remaining');
    const limite = resp.headers.get('x-ratelimit-requests-limit');
    if (remaining === null || limite === null) return;
    await sbRpc('record_real_api_quota', {
      p_provider: 'api-sports-football',
      p_remaining: parseInt(remaining, 10),
      p_limit: parseInt(limite, 10)
    });
  } catch (e) {
    // Jamais remonté comme une erreur de génération — c'est un suivi
    // annexe, pas une condition d'arrêt.
    stats.erreurs.push(`suivi_quota_reel: ${e.message}`);
  }
}

// ============================================================================
// 2. OUTILS FUSEAU HORAIRE HAÏTI (même logique que admin.html : Intl natif)
// ============================================================================

function partsHaiti(date) {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ_HAITI, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  });
  const o = {};
  f.formatToParts(date).forEach(p => { o[p.type] = p.value; });
  return {
    iso: `${o.year}-${o.month}-${o.day}`,
    heure: (o.hour === '24' ? '00' : o.hour) + ':' + o.minute,
    heureNum: parseInt(o.hour === '24' ? '0' : o.hour, 10),
    minuteNum: parseInt(o.minute, 10)
  };
}

// Date cible = demain, en heure Haïti (règle : le 23 à 17h prépare le 24)
function dateCibleDemainHaiti() {
  const maintenant = new Date();
  const demain = new Date(maintenant.getTime() + 24 * 3600 * 1000);
  return partsHaiti(demain).iso;
}

// L'API renvoie souvent la date/heure du match en UTC (ISO avec offset) —
// on la reconvertit systématiquement en heure Haïti nous-mêmes, jamais
// en se fiant à un éventuel paramètre timezone de l'API (défense en profondeur).
function heureHaitiDuMatch(isoUtc) {
  const d = new Date(isoUtc);
  if (isNaN(d.getTime())) return null;
  return partsHaiti(d);
}

// ============================================================================
// 3. LOG STRUCTURÉ (règle 35 du cahier des charges)
// ============================================================================

const stats = {
  demarre: null,
  fuseauUtilise: TZ_HAITI,
  dateCible: null,
  pagesOddsRecuperees: 0,
  pagesOddsTotal: 0,
  matchsTrouves: 0,
  matchsRetenus: 0,
  matchsRejetes: 0,
  raisonsRejet: {},
  championnatsVus: {}, // diagnostic : quels league.id/name l'API renvoie réellement
  marchesInconnus: {}, // diagnostic : quels types de marché on ne gère pas encore
  echantillonsValeurs: {}, // diagnostic : format réel des valeurs pour les marchés ajoutés récemment
  fichesGenerees: 0,
  fichesPubliees: 0,
  doublonsDetectes: false,
  poolFinal: null,
  bsd: { actif: false, evenementsRecuperes: 0, correspondances: 0, repliTente: 0, repliReussi: 0, erreur: null },
  erreurs: []
};
// BUG CORRIGÉ : sur un conteneur Netlify "chaud" (réutilisé entre deux
// invocations rapprochées), un objet déclaré au niveau du module n'est PAS
// réinitialisé automatiquement — les compteurs s'accumulaient d'un run à
// l'autre. On réinitialise donc explicitement stats en tout début de handler.
function resetStats() {
  stats.demarre = new Date().toISOString();
  stats.dateCible = null;
  stats.pagesOddsRecuperees = 0;
  stats.pagesOddsTotal = 0;
  stats.matchsTrouves = 0;
  stats.matchsRetenus = 0;
  stats.matchsRejetes = 0;
  stats.raisonsRejet = {};
  stats.championnatsVus = {};
  stats.marchesInconnus = {};
  stats.echantillonsValeurs = {};
  stats.fichesGenerees = 0;
  stats.fichesPubliees = 0;
  stats.doublonsDetectes = false;
  stats.poolFinal = null;
  stats.bsd = { actif: false, evenementsRecuperes: 0, correspondances: 0, repliTente: 0, repliReussi: 0, erreur: null };
  stats.erreurs = [];
}
function rejeter(raison) {
  stats.matchsRejetes++;
  stats.raisonsRejet[raison] = (stats.raisonsRejet[raison] || 0) + 1;
}
function logFinal() {
  console.log('[BOT]', JSON.stringify(stats, null, 2));
}

// ============================================================================
// 4. APPELS API-SPORTS (foot)
// ============================================================================

async function apiSportsGetRaw(host, path, params) {
  // Suivi de quota (29/08) : vérifié AVANT l'appel réel. Si le quota
  // interne est épuisé, on ne tente même pas l'appel — évite de cogner le
  // vrai mur API-Sports (429/erreur silencieuse) pour rien.
  const ok = await verifierEtIncrementerQuota(`${host}${path}`);
  if (!ok) {
    return { response: [], errors: { quota: 'Quota interne épuisé, appel évité.' } };
  }
  const url = new URL(`https://${host}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_SPORTS_KEY }
  });
  await enregistrerQuotaReel(resp);
  if (!resp.ok) {
    throw new Error(`API-Sports ${host}${path} → HTTP ${resp.status}`);
  }
  const data = await resp.json();
  const messagesErreur = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (messagesErreur && messagesErreur.length) {
    // CORRIGÉ (29/08) : l'API-Sports répond souvent HTTP 200 même en cas de
    // quota journalier dépassé — seul data.errors le révèle (ex. "You have
    // reached the maximum number of requests..."), avec response=[]
    // silencieux (c'est exactement ce qui a produit "0 match trouvé" le
    // 29/08 sur une date où on savait qu'il y avait de vrais matchs).
    // Avant ce correctif, seulement loggé en console.warn — perdu vu la
    // panne des logs Netlify ("Function logs are currently unavailable").
    // Maintenant aussi remonté dans stats.erreurs, donc visible dans tous
    // les diagnostics ET dans le corps de réponse final du bot.
    stats.erreurs.push(`API-Sports ${host}${path}${/request limit|reached the.*limit/i.test(messagesErreur.join(' ')) ? ' [QUOTA JOURNALIER DÉPASSÉ]' : ''}: ${messagesErreur.join(' | ')}`);
  }
  return data;
}

async function apiSportsGet(host, path, params) {
  const data = await apiSportsGetRaw(host, path, params);
  return data.response || [];
}

// STRATÉGIE DÉFINITIVEMENT FIXÉE (24/08, 5ᵉ et dernière révision) :
// la requête par championnat (date + league) sur /odds est une IMPASSE sur
// le plan gratuit (season obligatoire, rejetée pour la saison en cours).
// La pagination générique par date sur /odds est limitée à 3 pages/10 et
// ne garantit pas de voir les grands championnats.
// SOLUTION : /fixtures?date=...&timezone=... n'a AUCUNE de ces
// restrictions et renvoie TOUS les matchs du jour en un seul appel — on
// filtre localement par championnat autorisé, fenêtre horaire et statut,
// PUIS on demande la cote UNIQUEMENT pour ces matchs-là via
// /odds?fixture=<id> (pas de "league", donc pas de "season" requis).
// Garantit qu'un grand championnat apparaît dès qu'il joue ce jour-là.
async function recupererFixturesJour(dateCible) {
  try {
    const data = await apiSportsGetRaw(FOOT_HOST, '/fixtures', { date: dateCible, timezone: TZ_HAITI });
    return data.response || [];
  } catch (e) {
    stats.erreurs.push('foot/fixtures(jour): ' + e.message);
    return [];
  }
}

// Pause simple, en millisecondes — utilisée pour respecter la limite de
// requêtes/minute du plan API-Sports gratuit (28/08 v5, voir plus bas).
function attendre(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function recupererCoteParFixture(fixtureId, essai) {
  essai = essai || 1;
  // Suivi de quota (29/08) : vérifié avant CHAQUE appel /odds — c'est ici
  // que se joue l'essentiel de la consommation (jusqu'à 60/passage). Ne
  // décompte jamais deux fois un même essai (le réessai après 429 plus bas
  // n'incrémente pas une seconde fois, il réutilise la même tentative).
  if (essai === 1) {
    const ok = await verifierEtIncrementerQuota(`foot/odds(fixture=${fixtureId})`);
    if (!ok) return null;
  }
  try {
    const url = new URL(`https://${FOOT_HOST}/odds`);
    url.searchParams.set('fixture', fixtureId);
    url.searchParams.set('bookmaker', BOOKMAKER_ID);
    const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
    await enregistrerQuotaReel(resp);
    // Filet de sécurité (28/08 v5) : même avec le rythme normal
    // (attendre() dans la boucle appelante), un 429 isolé peut survenir
    // (horloge légèrement décalée, autre invocation concurrente...). Un
    // seul réessai après une pause plus longue, jamais plus — pour ne pas
    // transformer un vrai problème persistant en boucle interminable.
    if (resp.status === 429 && essai < 2) {
      stats.erreurs.push(`foot/odds(fixture=${fixtureId}): HTTP 429, nouvelle tentative dans 15s`);
      await attendre(15000);
      return recupererCoteParFixture(fixtureId, essai + 1);
    }
    if (!resp.ok) {
      stats.erreurs.push(`foot/odds(fixture=${fixtureId}): HTTP ${resp.status}`);
      return null;
    }
    const data = await resp.json();
    const messagesErreur = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
    if (messagesErreur && messagesErreur.length) {
      // CORRIGÉ (29/08) : même piège que /fixtures (voir apiSportsGetRaw) —
      // HTTP 200 mais quota dépassé, response vide, seul data.errors le
      // révèle. Absorbé silencieusement avant ce correctif.
      stats.erreurs.push(`foot/odds(fixture=${fixtureId})${/request limit|reached the.*limit/i.test(messagesErreur.join(' ')) ? ' [QUOTA JOURNALIER DÉPASSÉ]' : ''}: ${messagesErreur.join(' | ')}`);
    }
    return (data.response && data.response[0]) || null;
  } catch (e) {
    stats.erreurs.push(`foot/odds(fixture=${fixtureId}): ${e.message}`);
    return null;
  }
}

// Filtrage local des fixtures du jour : championnat autorisé, fenêtre
// horaire Haïti, statut programmé, puis priorisation + plafond de quota.
// FACTORISÉ (28/08 v3) depuis le handler principal, pour être réutilisé
// tel quel par le nouveau diagnostic diag=poolpreview (voir plus bas) —
// jamais deux copies qui pourraient diverger silencieusement.
function filtrerCandidatsJour(fixturesJour, dateCible) {
  const noms = {};
  let candidats = [];
  fixturesJour.forEach(f => {
    const league = f.league;
    const fixture = f.fixture;
    if (!league || !fixture) return;
    if (!ALLOWED_LEAGUES_FOOT.includes(league.id)) {
      const clef = `${league.id} — ${league.name} (${league.country || '?'})`;
      stats.championnatsVus[clef] = (stats.championnatsVus[clef] || 0) + 1;
      return;
    }
    const h = heureHaitiDuMatch(fixture.date);
    if (!h || h.iso !== dateCible) return;
    const minutesJour = h.heureNum * 60 + h.minuteNum;
    if (minutesJour < FOOT_MIN_HOUR * 60 || minutesJour > FOOT_MAX_MINUTES) return;
    if (!['NS', 'TBD'].includes(fixture.status.short)) return;

    noms[fixture.id] = {
      label: `${f.teams.home.name} — ${f.teams.away.name}`,
      statut: fixture.status.short,
      kickoffUtc: fixture.date,
      equipeDomicileId: f.teams.home.id,
      equipeExterieurId: f.teams.away.id,
      // Ajouté (session suivante, repli BSD) : /fixtures a déjà league.id/
      // name/country, mais candidats[]/noms[] les jetaient jusqu'ici (plus
      // besoin une fois filtré). Le repli BSD n'a AUCUN autre moyen de
      // connaître le vrai championnat (BSD n'a pas d'ID commun avec
      // API-Sports) — sans ce champ, une sélection BSD n'aurait aucun
      // championnat réel à afficher, jamais acceptable (règle : jamais
      // inventer une donnée).
      league: { id: league.id, name: league.name, country: league.country || null }
    };
    candidats.push({
      fixtureId: fixture.id,
      prioritaire: TOP_LEAGUES_FOOT.includes(league.id)
    });
  });

  // Garde-fou quota : priorité aux grands championnats si trop de matchs
  // candidats un même jour (1 appel /odds par match candidat).
  const PLAFOND_APPELS_COTES = 60;
  candidats.sort((a, b) => (b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0));
  if (candidats.length > PLAFOND_APPELS_COTES) candidats = candidats.slice(0, PLAFOND_APPELS_COTES);
  return { noms, candidats };
}

// DIAGNOSTIC (25/08) : retrouve les vrais id/nom/pays d'un championnat via
// /leagues?search=... — utilisé uniquement en mode test (?diag=leagues) pour
// confirmer un ID avant de l'ajouter à TOP_LEAGUES_FOOT/SECONDARY_LEAGUES_FOOT,
// jamais deviné à la main (leçon du 23-24/08 : un ID faux échoue en silence).
async function recupererLigues(recherche) {
  const url = `https://${FOOT_HOST}/leagues?search=${encodeURIComponent(recherche)}`;
  const resp = await fetch(url, { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  if (!resp.ok) return { erreur: `HTTP ${resp.status}` };
  const data = await resp.json();
  const messagesErreur = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (messagesErreur && messagesErreur.length) {
    return { erreurApi: messagesErreur, resultats: (data.response || []).map(item => ({
      id: item.league.id, nom: item.league.name, type: item.league.type,
      pays: item.country && item.country.name,
      saisonActuelle: (item.seasons || []).find(s => s.current) ? item.seasons.find(s => s.current).year : null
    })) };
  }
  return (data.response || []).map(item => ({
    id: item.league.id,
    nom: item.league.name,
    type: item.league.type,
    pays: item.country && item.country.name,
    saisonActuelle: (item.seasons || []).find(s => s.current)
      ? item.seasons.find(s => s.current).year : null
  }));
}

// DIAGNOSTIC (25/08) : retrouve les vrais id/nom/pays d'une équipe via
// /teams?search=... — utilisé en mode test (?diag=teams) pour confirmer les
// IDs des "grands clubs" avant de les ajouter à GRANDS_CLUBS_BUTEUR.
async function recupererEquipes(recherche) {
  const url = `https://${FOOT_HOST}/teams?search=${encodeURIComponent(recherche)}`;
  const resp = await fetch(url, { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  if (!resp.ok) return { erreur: `HTTP ${resp.status}` };
  const data = await resp.json();
  const messagesErreur = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
  if (messagesErreur && messagesErreur.length) {
    return { erreurApi: messagesErreur, resultats: (data.response || []).map(item => ({
      id: item.team.id, nom: item.team.name, pays: item.team.country
    })) };
  }
  return (data.response || []).map(item => ({
    id: item.team.id,
    nom: item.team.name,
    pays: item.team.country
  }));
}

// ============================================================================
// 4bis. BSD (Bzzoiro Sports Data) — 2e SOURCE, VÉRIFICATION 1X2 UNIQUEMENT
// ============================================================================
// Voir commentaire de config plus haut pour le rôle exact. Trois fonctions :
// récupération (1 seul appel/jour, même philosophie que fixturesJour),
// appariement par nom d'équipe (aucun identifiant commun entre les deux
// fournisseurs), puis annotation du pool déjà construit.

async function recupererEvenementsBSD(dateCible) {
  if (!BSD_API_KEY) return []; // pas de clé configurée → source simplement absente, jamais bloquant
  try {
    const url = `https://${BSD_HOST}/api/events/?date=${dateCible}`;
    const resp = await fetch(url, { headers: { Authorization: `Token ${BSD_API_KEY}` } });
    if (!resp.ok) {
      stats.bsd.erreur = `HTTP ${resp.status}`;
      return [];
    }
    const data = await resp.json();
    return (data.results || data || []);
  } catch (e) {
    stats.bsd.erreur = e.message;
    return [];
  }
}

// Normalisation minimale pour comparer un nom d'équipe API-Football à un nom
// BSD : accents retirés, ponctuation retirée, suffixes génériques (FC/CF/SC/
// AFC) retirés — jamais de suffixe porteur d'identité (United, Real, Club...)
// pour ne pas créer de faux positifs entre deux clubs différents.
function normaliserNomEquipe(nom) {
  return String(nom || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(mot => mot && !['fc', 'cf', 'sc', 'afc'].includes(mot))
    .join(' ')
    .trim();
}

// Apparie un match API-Football (via son label "Domicile — Exterieur") à un
// évènement BSD. Comparaison sur les DEUX noms d'équipe, jamais un seul —
// réduit fortement le risque de faux appariement un jour à beaucoup de matchs.
function trouverEvenementBSD(labelMatch, evenementsBSD) {
  const [dom, ext] = String(labelMatch || '').split(' — ');
  if (!dom || !ext) return null;
  const domN = normaliserNomEquipe(dom), extN = normaliserNomEquipe(ext);
  if (!domN || !extN) return null;
  return evenementsBSD.find(e => {
    const eDom = normaliserNomEquipe(e.home_team), eExt = normaliserNomEquipe(e.away_team);
    if (!eDom || !eExt) return false;
    const domOk = eDom === domN || eDom.includes(domN) || domN.includes(eDom);
    const extOk = eExt === extN || eExt.includes(extN) || extN.includes(eExt);
    return domOk && extOk;
  }) || null;
}

// Annote EN PLACE les entrées mk_1x2 du pool déjà construit avec la
// probabilité implicite BSD du même côté (Home ou Away). Ne touche à AUCUNE
// cote publiée, uniquement à un champ interne (bsdProbImplicite) lu ensuite
// par le calcul de confiance dans construireFiche. Silencieux et jamais
// bloquant si BSD est indisponible, vide, ou ne connaît pas le match.
function annoterPoolAvecBSD(poolFoot, noms, evenementsBSD) {
  if (!evenementsBSD.length) return;
  for (const bet of poolFoot) {
    if (bet.market !== 'mk_1x2') continue;
    const info = noms[bet.fixtureId];
    if (!info) continue;
    const evt = trouverEvenementBSD(info.label, evenementsBSD);
    if (!evt) continue;
    const cote = bet.pick.endsWith('Home') ? evt.odds_home : bet.pick.endsWith('Away') ? evt.odds_away : null;
    if (!cote || !isFinite(cote) || cote <= 1) continue;
    bet.bsdProbImplicite = 1 / cote;
    stats.bsd.correspondances++;
  }
}

// ============================================================================
// REPLI BSD (session suivante) — repli PARTIEL déclenché UNIQUEMENT quand
// Bet365/API-Sports n'a renvoyé AUCUNE cote pour un match candidat
// (recupererCoteParFixture → null). Ne couvre QUE ce que BSD expose
// réellement (confirmé par diag=bsd-markets, 29/08) : 1X2 (Home/Away),
// total de buts du match (Over 1.5 et Over 2.5 seulement — BSD n'a pas
// d'équivalent "Under 4.5"), BTTS. JAMAIS double chance, total par équipe,
// buteur, score exact — ces marchés restent simplement absents pour ce
// match si Bet365 est vide, jamais inventés ni déduits d'un autre marché
// BSD. Mêmes seuils de cote et mêmes tiers que extraireMarchesFoot (id
// 1/5/8), pour que la qualité d'une sélection ne dépende jamais de sa
// source. `infosFixture` doit venir de noms[fixtureId] (contient déjà
// league.id/name/country depuis /fixtures — BSD n'a aucun ID commun avec
// API-Sports, jamais de championnat deviné).
// ============================================================================
function extraireMarchesBSD(evenementBSD, dateCible, infosFixture, prioritaire) {
  if (!infosFixture || !infosFixture.league) return [];
  const h = heureHaitiDuMatch(infosFixture.kickoffUtc);
  if (!h || h.iso !== dateCible) return [];
  const minutesJour = h.heureNum * 60 + h.minuteNum;
  if (minutesJour < FOOT_MIN_HOUR * 60 || minutesJour > FOOT_MAX_MINUTES) return [];

  const league = infosFixture.league;
  const trouvees = [];
  const base = {
    fixtureId: infosFixture.fixtureId, league: league.name, leagueCountry: league.country || null,
    equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId,
    kickoffUtc: infosFixture.kickoffUtc, matchTimeHaiti: h.heure, prioritaire: !!prioritaire,
    viaBSD: true
  };

  // Victoire directe (PREMIUM) — mêmes bornes que extraireMarchesFoot (id 1).
  const cHome = parseFloat(evenementBSD.odds_home), cAway = parseFloat(evenementBSD.odds_away);
  if (isFinite(cHome) && cHome >= 1.95 && cHome <= 2.50) {
    trouvees.push(Object.assign({}, base, { market: 'mk_1x2', pick: 'Victoire : Home', odd: cHome, tier: 'PREMIUM' }));
  }
  if (isFinite(cAway) && cAway >= 1.95 && cAway <= 2.50) {
    trouvees.push(Object.assign({}, base, { market: 'mk_1x2', pick: 'Victoire : Away', odd: cAway, tier: 'PREMIUM' }));
  }

  // Total buts — SAFE (Over 1.5) et PREMIUM (Over 2.5), mêmes bornes que
  // extraireMarchesFoot (id 5). Pas d'équivalent BSD pour "Under 4.5".
  const cOver15 = parseFloat(evenementBSD.odds_over_15);
  if (isFinite(cOver15) && cOver15 >= 1.19 && cOver15 <= 1.70) {
    trouvees.push(Object.assign({}, base, { market: 'mk_total_buts', pick: traduireButs('Over 1.5'), odd: cOver15, tier: 'SAFE' }));
  }
  const cOver25 = parseFloat(evenementBSD.odds_over_25);
  if (isFinite(cOver25) && cOver25 >= 1.95 && cOver25 <= 2.40) {
    trouvees.push(Object.assign({}, base, { market: 'mk_total_buts', pick: 'Plus de 2.5 buts', odd: cOver25, tier: 'PREMIUM' }));
  }

  // BTTS — mêmes bornes que extraireMarchesFoot (id 8).
  const cBttsOui = parseFloat(evenementBSD.odds_btts_yes);
  if (isFinite(cBttsOui) && cBttsOui >= 1.19 && cBttsOui <= 2.20) {
    trouvees.push(Object.assign({}, base, {
      market: 'mk_btts', pick: 'Les deux équipes marquent : Oui', odd: cBttsOui,
      tier: cBttsOui <= 1.70 ? 'SAFE' : 'PREMIUM'
    }));
  }

  return trouvees;
}

// ============================================================================
// FIABILITÉ RÉELLE PAR CHAMPIONNAT+MARCHÉ (28/08, demande explicite de
// James : "l'algorithme doit privilégier les résultats réels pour
// augmenter chaque jour les gains, pas choisir les cotes au hasard").
// Lit la vue SQL market_reliability (voir migration du 28/08) — un taux de
// réussite calculé UNIQUEMENT à partir de vrais résultats déjà réglés par
// bot-settle-results.js, jamais une statistique inventée ou estimée. Sous
// SEUIL_MIN_FIABILITE légs réglés, un championnat+marché est ignoré (pas
// assez d'historique pour en tirer une vraie conclusion) — le score retombe
// alors sur la seule probabilité implicite du marché (1/cote), jamais une
// valeur bricolée pour compenser.
// ============================================================================
const SEUIL_MIN_FIABILITE = 8;

async function recupererFiabiliteMarches() {
  const carte = new Map(); // clé "league|market" -> { taux, echantillon }
  try {
    const lignes = await sbSelect('market_reliability', 'select=league,market,echantillon,taux_reussite');
    lignes.forEach(l => {
      if (l.echantillon >= SEUIL_MIN_FIABILITE && l.taux_reussite != null) {
        carte.set(`${l.league}|${l.market}`, { taux: Number(l.taux_reussite), echantillon: l.echantillon });
      }
    });
  } catch (e) {
    // Non bloquant : sans cette donnée, tout retombe sur la probabilité de
    // marché seule (comportement précédent) — jamais une raison de bloquer
    // la génération.
  }
  return carte;
}

// Score de sélection = mélange 50/50 entre la probabilité implicite du
// bookmaker (1/cote — toujours disponible, vraie donnée de marché) et le
// taux de réussite RÉEL observé pour ce championnat+marché (quand assez
// d'historique existe). Remplace l'ancien tri "toujours la cote la plus
// haute par match" par un tri qui privilégie la fiabilité réelle — peut
// tout aussi bien favoriser une cote basse (1.20) qu'une cote plus élevée
// (1.70), selon ce qui a VRAIMENT le mieux réussi jusqu'ici pour ce
// championnat et ce marché précis.
function annoterPoolAvecFiabilite(poolFoot, carteFiabilite) {
  poolFoot.forEach(bet => {
    const probMarche = 1 / bet.odd;
    const info = carteFiabilite.get(`${bet.league}|${bet.market}`);
    const tauxReel = info ? info.taux : null;
    bet.scoreFiabilite = (tauxReel != null) ? (probMarche * 0.5 + tauxReel * 0.5) : probMarche;
    bet.tauxReel = tauxReel;
    bet.echantillonReel = info ? info.echantillon : null;
    // VALUE BET (session suivante, roadmap "amélioration continue") :
    // probabilité RÉELLE observée × cote proposée — jamais calculée sur la
    // seule cote (qui donnerait toujours ~1.0 par construction, aucune
    // information). Reste null tant qu'aucun historique suffisant n'existe
    // pour ce championnat+marché (voir SEUIL_MIN_FIABILITE) — jamais une
    // value inventée à partir d'une probabilité non fiable. Purement
    // informatif : n'entre dans AUCUN filtre de sélection pour l'instant.
    bet.valueScore = (tauxReel != null) ? Math.round(tauxReel * bet.odd * 100) / 100 : null;
  });
}

// ============================================================================
// SCORE DE CONFIANCE A-E (session suivante, roadmap "amélioration
// continue") — étiquette purement informative de bet.scoreFiabilite (déjà
// utilisé pour la SÉLECTION des légs, inchangé). Ne décide rien ici,
// n'existe que pour l'affichage admin et pour se valider soi-même dans le
// temps (voir get_rapport_apprentissage : si "A" ne gagne pas vraiment
// plus souvent que "E" une fois assez de fiches réglées, ces seuils
// devront être resserrés — jamais supposés corrects définitivement).
// A/B réservés aux cas où un VRAI historique (échantillon ≥
// SEUIL_MIN_FIABILITE) soutient le score ; sans historique réel, plafonné
// à C au mieux, quelle que soit la cote — une cote basse seule ne prouve
// jamais une vraie fiabilité.
// ============================================================================
const SEUILS_CONFIANCE = { A: 0.68, B: 0.55, C: 0.45, D: 0.35 };
function classerConfiance(bet) {
  const s = bet.scoreFiabilite != null ? bet.scoreFiabilite : (1 / bet.odd);
  const aHistorique = bet.echantillonReel != null && bet.echantillonReel >= SEUIL_MIN_FIABILITE;
  if (aHistorique && s >= SEUILS_CONFIANCE.A) return 'A';
  if (aHistorique && s >= SEUILS_CONFIANCE.B) return 'B';
  if (s >= SEUILS_CONFIANCE.C) return 'C';
  if (s >= SEUILS_CONFIANCE.D) return 'D';
  return 'E';
}


// Traduit les libellés bruts "Over X.X" / "Under X.X" de l'API en français
// ("Plus de X.X buts" / "Moins de X.X buts") — demande de James (25/08).
// Si le format ne correspond pas au motif attendu, on garde la valeur brute
// plutôt que de casser l'affichage (garde-fou).
function traduireButs(value) {
  const m = /^(Over|Under)\s+([\d.]+)$/i.exec(String(value).trim());
  if (!m) return value;
  const mot = m[1].toLowerCase() === 'over' ? 'Plus' : 'Moins';
  return `${mot} de ${m[2]} buts`;
}

function extraireMarchesFoot(oddsItem, dateCible, infosFixture) {
  const fixture = oddsItem.fixture;
  const league = oddsItem.league;
  if (!fixture || !league) { rejeter('donnees_incompletes'); return []; }
  if (!ALLOWED_LEAGUES_FOOT.includes(league.id)) {
    rejeter('championnat_non_autorise');
    const clef = `${league.id} — ${league.name} (${league.country || '?'})`;
    stats.championnatsVus[clef] = (stats.championnatsVus[clef] || 0) + 1;
    return [];
  }
  const prioritaire = TOP_LEAGUES_FOOT.includes(league.id);

  // Fenêtre horaire Haïti stricte pour le foot (règle 4)
  const h = heureHaitiDuMatch(fixture.date);
  if (!h) { rejeter('date_invalide'); return []; }
  if (h.iso !== dateCible) { rejeter('mauvaise_date_locale'); return []; }
  const minutesJour = h.heureNum * 60 + h.minuteNum;
  if (minutesJour < FOOT_MIN_HOUR * 60 || minutesJour > FOOT_MAX_MINUTES) {
    rejeter('hors_fenetre_horaire_foot');
    return [];
  }

  const bets = (oddsItem.bookmakers && oddsItem.bookmakers[0] && oddsItem.bookmakers[0].bets) || [];
  const trouvees = [];

  // PRINCIPE : la cote du marché reflète la probabilité implicite estimée
  // par le bookmaker (1/cote) — plus la cote est basse, plus la probabilité
  // de réussite est jugée élevée. C'est cette logique qui guide tous les
  // seuils ci-dessous (SAFE = cotes basses = forte probabilité). Plancher
  // absolu à 1.19 : en dessous, la marge de sécurité devient trop faible
  // pour justifier une sélection.
  bets.forEach(betType => {
    // Score exact (id 10) — probabilité raisonnable (cote 4.0–15.0).
    // CORRECTIF (25/08, retour de James) : on ne garde plus SEULEMENT la
    // cote la plus basse (qui donne quasi toujours 1-1/1-0/2-1, les scores
    // les plus fréquents statistiquement, peu importe le match) — on garde
    // jusqu'à 5 candidats par match, et c'est construireFicheScoreExact qui
    // choisira celui cohérent avec le profil réel du match (BTTS/totaux
    // déjà récupérés pour ce même match, voir plus bas).
    if (betType.id === 10) {
      const candidats = betType.values
        .map(v => ({ value: v.value, odd: parseFloat(v.odd) }))
        .filter(v => isFinite(v.odd) && v.odd >= 4.0 && v.odd <= 15.0)
        .sort((a, b) => a.odd - b.odd)
        .slice(0, 5);
      candidats.forEach(c => {
        trouvees.push({
          fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_score_exact',
          pick: `Score exact : ${c.value}`, odd: c.odd, tier: 'EXACT_SCORE',
          kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
        });
      });
    }
    // Double chance (id 12) — profil "safe"
    if (betType.id === 12) {
      // Notation standard des paris (25/08, demande explicite de James) :
      // l'API renvoie "Home/Draw" / "Home/Away" / "Draw/Away" en anglais,
      // jamais reconnu par le grand public haïtien — converti en 1X/12/X2,
      // la notation utilisée partout ailleurs (bookmakers, paryajpam.com).
      const LIBELLE_DOUBLE_CHANCE = { 'Home/Draw': 'X1', 'Home/Away': '12', 'Draw/Away': 'X2' };
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.19 && c <= 1.70) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_double_chance',
            pick: `Double chance : ${LIBELLE_DOUBLE_CHANCE[v.value] || v.value}`, odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
      });
    }
    // Victoire directe (id 1) — profil "premium"
    if (betType.id === 1) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.95 && c <= 2.50 && (v.value === 'Home' || v.value === 'Away')) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_1x2',
            pick: `Victoire : ${v.value}`, odd: c, tier: 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
      });
    }
    // Total buts (id 5) — safe + exception premium sur Over 2.5
    if (betType.id === 5) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.19 && c <= 1.70 && ['Over 1.5', 'Under 4.5'].includes(v.value)) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_total_buts',
            pick: traduireButs(v.value), odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
        if (c >= 1.95 && c <= 2.40 && v.value === 'Over 2.5') {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_total_buts',
            pick: 'Plus de 2.5 buts', odd: c, tier: 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
      });
    }
    // BTTS (id 8, "Both Teams Score") — profil safe/premium selon la cote
    if (betType.id === 8) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (v.value === 'Yes' && c >= 1.19 && c <= 2.20) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_btts',
            pick: 'Les deux équipes marquent : Oui', odd: c,
            tier: c <= 1.70 ? 'SAFE' : 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
      });
    }
    // Buteur à tout moment (id 92 — "Anytime Goal Scorer", confirmé via le
    // diagnostic marchesInconnus du 24/08 ; id 42 utilisé avant était FAUX,
    // ses valeurs numériques "0/1/2" ne sont pas des noms de joueur et ont
    // produit 2 fiches erronées, supprimées). CORRIGÉ (24/08, 2ᵉ incident) :
    // ce marché liste 20-30 joueurs par match ; ne garder QUE le buteur le
    // PLUS PROBABLE (cote la plus basse dans la plage fiable) — jamais tous
    // les joueurs, sinon l'algorithme peut attraper un remplaçant à cote 6.0
    // (a produit une fiche à cote 6.0 sur 1 seule sélection, supprimée).
    // Plage resserrée à 1.90–3.00 : au-delà, probabilité jugée trop faible
    // pour un "buteur fiable après analyse". Garde-fou : on rejette toute
    // valeur qui ressemble à un nombre pur (protection contre un ID à
    // nouveau mal identifié). Tier PREMIUM, exempté du plafond 1.90 du
    // plan, limité à 1 par fiche (règle 14 du cahier des charges).
    // Règle du 25/08 : pas n'importe quelle équipe d'un grand championnat —
    // seulement les grands clubs avec de vrais buteurs reconnus (voir
    // GRANDS_CLUBS_BUTEUR). Tant que cette liste est vide, seul le filtre
    // championnat s'applique (voir commentaire à sa définition). Aucun
    // appel API supplémentaire : les IDs équipe viennent déjà de /fixtures.
    const clubAutorise = GRANDS_CLUBS_BUTEUR.length === 0
      || (infosFixture && (
        GRANDS_CLUBS_BUTEUR.includes(infosFixture.equipeDomicileId) ||
        GRANDS_CLUBS_BUTEUR.includes(infosFixture.equipeExterieurId)
      ));
    if (betType.id === 92 && LEAGUES_BUTEUR_AUTORISEES.includes(league.id) && clubAutorise) {
      let meilleurButeur = null, meilleureCote = 999;
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        const ressembleANombre = /^-?\d+(\.\d+)?$/.test(String(v.value).trim());
        if (!ressembleANombre && c >= 1.30 && c <= 3.00 && c < meilleureCote) {
          meilleureCote = c;
          meilleurButeur = v;
        }
      });
      if (meilleurButeur) {
        trouvees.push({
          fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: 'mk_buteur',
          pick: `Buteur : ${meilleurButeur.value}`, odd: meilleureCote, tier: 'PREMIUM',
          kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
        });
      }
    }
    // Total buts par équipe (id 16 = domicile, id 17 = extérieur).
    // RÈGLE DURCIE LE 25/08 (James) : ce marché est jugé plus risqué qu'un
    // total sur le match entier — un but suffit à faire basculer une seule
    // équipe, alors que le total du match lisse ce risque sur les deux. Le
    // "Plus de X buts" doit se jouer sur le match ENTIER (mk_total_buts,
    // ci-dessus) en priorité ; le total par équipe n'est conservé qu'à
    // cote très basse et quasi garantie (≤1.30) — le palier PREMIUM
    // (1.90–2.60) est purement et simplement retiré, jugé trop risqué.
    if (betType.id === 16 || betType.id === 17) {
      const cote = betType.id === 16 ? 'mk_total_domicile' : 'mk_total_exterieur';
      const label = betType.id === 16 ? 'Domicile' : 'Extérieur';
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        // Plancher remonté de 1.10 à 1.19 (28/08, règle stricte : aucune
        // sélection individuelle sous 1.19, quel que soit le marché — une
        // cote plus basse n'ajoute pas de fiabilité réelle, seulement une
        // fausse sécurité, et dilue la cote totale sans justification).
        if (c >= 1.19 && c <= 1.30) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, leagueCountry: league.country || null, equipeDomicileId: infosFixture.equipeDomicileId, equipeExterieurId: infosFixture.equipeExterieurId, market: cote,
            pick: `${label} : ${traduireButs(v.value)}`, odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
      });
    }
    // Diagnostic : tout type de marché non encore géré ci-dessus, pour
    // repérer d'autres marchés à ajouter plus tard.
    const ID_CONNUS = [1, 5, 8, 10, 12, 16, 17, 92];
    if (!ID_CONNUS.includes(betType.id)) {
      const clef = `${betType.id} — ${betType.name || '?'}`;
      stats.marchesInconnus[clef] = (stats.marchesInconnus[clef] || 0) + 1;
    }
    // Échantillon de valeurs brutes pour les marchés ajoutés cette session,
    // pour confirmer le format réel (ex: "Over 1.5" vs autre chose) avant
    // de leur faire pleinement confiance au prochain test.
    if ([9, 16, 17, 92].includes(betType.id) && !stats.echantillonsValeurs[betType.id]) {
      stats.echantillonsValeurs[betType.id] = betType.values.slice(0, 3).map(v => `${v.value} @ ${v.odd}`);
    }
  });

  if (trouvees.length) stats.matchsRetenus++;
  return trouvees;
}

// ============================================================================
// 6. CONSTRUCTION DES FICHES PAR PLAN (diversification + anti-corrélation)
// ============================================================================

/**
 * Choisit les sélections d'une fiche pour un plan donné.
 * Priorité stricte : fiabilité > diversification > cote finale > nombre de matchs
 * (jamais l'inverse — règle 40 du cahier des charges).
 *
 * Classement de fiabilité (défini par James, 24/08) :
 * 🟢 très fiable = SAFE (double chance, over/under buts modérés, totaux équipe bas)
 * 🟡 fiabilité moyenne = PREMIUM hors buteur (victoire directe, +2.5 buts, BTTS, totaux équipe hauts)
 * 🔴 très risqué, usage exceptionnel = score exact ET buteur — tous deux réservés
 * aux plans qui autorisent explicitement le score exact (includes_exact_score),
 * jamais au Plan 1/2. Le buteur ne doit jamais être réutilisé dans une autre
 * fiche le même jour (passé via options.buteursUtilises, partagé entre tous
 * les appels de la génération du jour).
 */
/**
 * Détection de contradiction réelle entre deux sélections du MÊME match,
 * publiées dans deux fiches normales différentes le même jour (28/08 v2,
 * demande explicite de James : "même match dans jusqu'à 2 fiches
 * normales, c'est normal, mais pas contradictoire — par exemple Plus de
 * 1.5 buts dans une fiche et Moins de 1.5 buts dans une autre sur le même
 * match, ÇA c'est contradictoire"). Ne bloque QUE les cas où les deux
 * sélections ne peuvent JAMAIS être vraies en même temps — jamais des cas
 * simplement différents ou redondants (ex. "Plus de 1.5" et "Plus de 2.5"
 * sur le même match restent autorisés ensemble, ils peuvent coexister).
 */
function extrairePlusMoins(pick) {
  const m = /(Plus|Moins) de ([\d.]+) buts/i.exec(String(pick || '').trim());
  if (!m) return null;
  return { sens: m[1].toLowerCase() === 'plus' ? 'plus' : 'moins', seuil: parseFloat(m[2]) };
}
function contredictionPlusMoins(pickA, pickB) {
  const a = extrairePlusMoins(pickA), b = extrairePlusMoins(pickB);
  if (!a || !b || a.sens === b.sens) return false; // même sens (2x Plus ou 2x Moins) : jamais contradictoire ici
  const plus = a.sens === 'plus' ? a : b;
  const moins = a.sens === 'moins' ? a : b;
  // Aucun total entier ne peut satisfaire "Plus de X" ET "Moins de Y" à
  // la fois si Y <= X (ex. Plus de 1.5 [total>=2] et Moins de 1.5
  // [total<=1] : aucun total commun -> contradiction). Si Y > X (ex.
  // Plus de 1.5 et Moins de 2.5 -> total=2 satisfait les deux), les deux
  // peuvent être vraies ensemble : pas une contradiction.
  return moins.seuil <= plus.seuil;
}
function estContradictoire(marketA, pickA, marketB, pickB) {
  // Victoire directe : Home et Away sur le même match sont mutuellement exclusifs.
  if (marketA === 'mk_1x2' && marketB === 'mk_1x2') {
    return String(pickA).replace('Victoire : ', '').trim() !== String(pickB).replace('Victoire : ', '').trim();
  }
  // Double chance vs Victoire directe : X1 exclut une victoire extérieure,
  // X2 exclut une victoire à domicile (12 n'exclut que le nul, jamais
  // publié seul par ce bot, donc rien à vérifier ici pour 12).
  const contreDoubleChance = (dc, victoire) => {
    const val = String(dc).replace('Double chance : ', '').trim();
    const camp = String(victoire).replace('Victoire : ', '').trim();
    return (val === 'X1' && camp === 'Away') || (val === 'X2' && camp === 'Home');
  };
  if (marketA === 'mk_double_chance' && marketB === 'mk_1x2') return contreDoubleChance(pickA, pickB);
  if (marketB === 'mk_double_chance' && marketA === 'mk_1x2') return contreDoubleChance(pickB, pickA);
  // Total de buts du match entier : voir contredictionPlusMoins ci-dessus.
  if (marketA === 'mk_total_buts' && marketB === 'mk_total_buts') return contredictionPlusMoins(pickA, pickB);
  // Total de buts d'une même équipe (domicile ou extérieur) : même
  // logique Plus/Moins, mais uniquement comparé au sein du MÊME marché
  // (domicile avec domicile, extérieur avec extérieur — jamais l'un
  // contre l'autre, ce sont deux équipes différentes).
  if (marketA === marketB && (marketA === 'mk_total_domicile' || marketA === 'mk_total_exterieur')) {
    const nettoie = p => String(p).replace(/^(Domicile|Extérieur)\s*:\s*/, '');
    return contredictionPlusMoins(nettoie(pickA), nettoie(pickB));
  }
  return false;
}

function construireFiche(pool, plan, options) {
  options = options || {};
  const buteursUtilises = options.buteursUtilises || new Set();
  const nbMatchsDisponibles = options.nbMatchsDisponibles || 0;
  // Partie 1/2 (27/08, spec anti-doublon de James) : clé logique
  // fixtureId|market|pick déjà utilisée AILLEURS aujourd'hui (autre plan de
  // ce même lot, OU fiche déjà publiée en base — voir le code appelant qui
  // alimente ce Set avant l'appel). Une sélection ici exclue ne peut PLUS
  // être choisie, point final — pas de repli qui la réintroduirait, pour
  // qu'un doublon exact devienne structurellement impossible plutôt que
  // simplement découragé.
  const selectionsExclues = options.selectionsExclues || new Set();
  // Legacy (26/08, génération manuelle admin uniquement — un seul appel à
  // la fois, la notion de "jusqu'à 2 fiches par match" n'a pas de sens
  // pour une fiche unique) : exclusion totale du match si fourni,
  // comportement inchangé pour bot-generate-tickets-manual.js.
  const fixturesExclues = options.fixturesExclues || new Set();
  // REMPLACE l'ancienne exclusion totale du match pour le bot automatique
  // (28/08 v2, retour explicite de James : "même match dans jusqu'à 2
  // fiches normales, c'est normal, tant que ce n'est pas contradictoire —
  // par exemple Plus de 1.5 buts dans une fiche et Moins de 1.5 buts dans
  // une autre sur le même match, ÇA c'est contradictoire"). Deux
  // mécanismes distincts :
  //  - matchUsageCount : nombre de fiches NORMALES distinctes ayant déjà
  //    utilisé ce match aujourd'hui, plafonné à MAX_FICHES_PAR_MATCH.
  //  - selectionsParFixture : toutes les sélections déjà publiées
  //    aujourd'hui pour ce match, comparées via estContradictoire() avant
  //    d'accepter une nouvelle sélection sur ce même match ailleurs.
  const selectionsParFixture = options.selectionsParFixture || new Map();
  const matchUsageCount = options.matchUsageCount || new Map();
  const MAX_FICHES_PAR_MATCH = 2;
  // Partie 3/4 : compteur d'apparitions par équipe, PARTAGÉ sur toute la
  // génération du jour (comme buteursUtilises) — jamais appliqué aux
  // fiches score exact (elles passent par construireFicheScoreExact, qui
  // ne reçoit jamais cette option — exemption structurelle, Partie 4).
  const equipesUtilisees = options.equipesUtilisees || new Map();
  const MAX_APPARITIONS_EQUIPE = 2;
  // Diversification des marchés ENTRE LES FICHES (session suivante, demande
  // explicite de James, 31/08 v2 : "si dans un jour il y a 5 équipes
  // choisies pour créer les fiches, même sur deux fiches différentes, il
  // faut éviter de choisir le même marché pour la majorité des matchs — par
  // exemple BTTS dans trois matchs différents"). DISTINCT de
  // marchesUtilises (plus bas), qui ne plafonne l'usage d'un marché QUE
  // dans LA fiche en cours de construction (MAX_PAR_MARCHE=2) —
  // marchesUtiliseesJour, lui, est partagé et cumulé sur TOUTE la
  // génération du jour (toutes fiches, tous plans confondus), passé par le
  // code appelant selon le même principe "copie tentative, validée
  // seulement si la fiche est retenue" déjà utilisé pour
  // equipesUtilisees/buteursUtilises (voir tenterEtPublier).
  const marchesUtiliseesJour = options.marchesUtiliseesJour || new Map();
  // Plafond adaptatif : jamais un chiffre fixe qui casserait la génération
  // un jour pauvre en matchs — au moins 3 matchs par marché autorisés dans
  // la journée, ou 40% du nombre de matchs distincts disponibles ce jour-là
  // si plus grand (40%, volontairement sous la "majorité" de 50% demandée
  // par James, pour une vraie marge de sécurité plutôt que de coller pile
  // à la limite).
  const MAX_PAR_MARCHE_JOUR = Math.max(3, Math.ceil(nbMatchsDisponibles * 0.4));

  let cibleMin = options.cibleMinOverride != null
    ? Number(options.cibleMinOverride)
    : (plan.min_total_odd != null ? Number(plan.min_total_odd) : 1.5);
  // cibleMaxOverride (26/08) : uniquement utilisé par la génération
  // manuelle admin, quand l'admin choisit lui-même une cote max propre à
  // la fiche (déjà clampée au max réel du plan avant l'appel — voir
  // bot-generate-tickets-manual.js). Aucun appelant existant ne le passe,
  // donc le bot quotidien garde exactement le même comportement.
  const cibleMax = options.cibleMaxOverride != null
    ? Number(options.cibleMaxOverride)
    : (plan.max_total_odd != null ? Number(plan.max_total_odd) : 999);
  const maxLeg = plan.max_leg_odd != null ? Number(plan.max_leg_odd) : 2.5;
  const autoriseScoreExact = !!plan.includes_exact_score;

  // EXCEPTION (règle confirmée par James, seuil < 4 matchs valides) : les
  // jours avec peu de matchs, les plans à cote cible élevée (rang ≥3)
  // acceptent une cote réduite (~15) plutôt que de ne jamais publier.
  // Ne s'applique jamais à la baisse au-delà de la cible d'origine.
  if (plan.rank >= 3 && nbMatchsDisponibles < 4 && cibleMin > 15) {
    cibleMin = 15;
  }

  // CORRIGÉ (28/08, demande explicite de James) : gardait avant
  // systématiquement la cote LA PLUS HAUTE par match, triée décroissante —
  // ignorait toujours les cotes basses même quand elles étaient la
  // sélection la plus fiable pour ce match. Utilise maintenant
  // scoreFiabilite (mélange probabilité de marché + taux de réussite réel
  // par championnat/marché, voir annoterPoolAvecFiabilite) — peut
  // parfaitement retenir une cote de 1.20 si son championnat+marché a un
  // vrai historique de réussite, jamais un choix arbitraire haut ou bas.
  // b.scoreFiabilite absent (pas encore annoté, ex. appel direct sans
  // passer par le handler) → repli sur 1/cote, jamais une erreur.
  function meilleurParMatch(liste) {
    const meilleur = {};
    const score = b => (b.scoreFiabilite != null ? b.scoreFiabilite : 1 / b.odd);
    liste.forEach(b => {
      if (!meilleur[b.fixtureId] || score(b) > score(meilleur[b.fixtureId])) meilleur[b.fixtureId] = b;
    });
    return Object.values(meilleur).sort((a, b) => {
      if (a.prioritaire !== b.prioritaire) return a.prioritaire ? -1 : 1;
      return score(b) - score(a);
    });
  }
  const safe = meilleurParMatch(pool.filter(b => b.tier === 'SAFE'));
  // Buteur (🔴) exclu du pool PREMIUM général — réservé aux plans score-exact,
  // et jamais un joueur déjà utilisé dans une fiche publiée plus tôt ce jour.
  const premium = meilleurParMatch(pool.filter(b => b.tier === 'PREMIUM' && b.market !== 'mk_buteur'));
  // Le score exact n'apparaît JAMAIS dans la fiche normale — uniquement
  // dans la fiche dédiée (construireFicheScoreExact, "jamais mélangée avec
  // d'autres marchés"). Bug corrigé le 25/08 : une ancienne ligne insérait
  // encore une sélection score-exact ici, mélangée à des marchés normaux
  // (ex. fiche R3 avec "Score exact : 0:2" + "Domicile : Plus de 1.5 buts"
  // dans la même fiche) — contraire à la règle documentée.
  const buteurs = autoriseScoreExact
    ? meilleurParMatch(pool.filter(b => b.market === 'mk_buteur' && !buteursUtilises.has(b.pick)))
    : [];

  const selections = [];
  const matchsUtilises = new Set();
  const championnatsUtilises = {};
  const marchesUtilises = {};
  let coteTotale = 1.0;

  const MAX_PAR_MARCHE = 2;   // diversification des marchés
  const MAX_PAR_CHAMPIONNAT = 3; // diversification des championnats
  const MAX_SELECTIONS = 10;
  // PLAFOND_PAR_MARCHE dynamique selon la cible : pour une fiche <20, le
  // document d'optimisation (point 11) demande explicitement d'éviter
  // plusieurs "Domicile Plus de X buts"/"Extérieur Plus de X buts" dans la
  // même fiche, même à cote basse — un seul suffit, le reste doit venir
  // d'un marché différent pour rester diversifié.
  const PLAFOND_PAR_MARCHE = cibleMax < 20
    ? { mk_buteur: 1, mk_total_domicile: 1, mk_total_exterieur: 1 }
    : { mk_buteur: 1 };
  // Plan 1 : prudence renforcée — éviter de combiner trop de grosses cotes
  // (règle explicite de James). Limite le nombre de sélections 🟡 (premium)
  // autorisées, quasi tout doit venir du 🟢 (safe).
  const MAX_PREMIUM_PLAN1 = 1;

  function tenterAjout(bet) {
    if (matchsUtilises.has(bet.fixtureId)) return false; // anti-corrélation : jamais 2 legs du même match dans LA MÊME fiche
    // Legacy (génération manuelle uniquement, voir plus haut) : exclusion totale si fournie.
    if (fixturesExclues.has(bet.fixtureId)) return false;
    // Plafond de 2 fiches normales par match (28/08 v2) — à ce stade,
    // bet.fixtureId n'est PAS encore dans matchsUtilises (sinon la ligne
    // ci-dessus aurait déjà bloqué), donc l'accepter compterait comme une
    // NOUVELLE fiche pour ce match.
    if ((matchUsageCount.get(bet.fixtureId) || 0) >= MAX_FICHES_PAR_MATCH) return false;
    // Contradiction logique réelle avec une sélection déjà publiée
    // ailleurs aujourd'hui sur ce même match (28/08 v2, ex. donné par
    // James : "Plus de 1.5 buts" dans une fiche et "Moins de 1.5 buts"
    // dans une autre, même match — ça, c'est contradictoire ; deux
    // marchés différents mais compatibles restent autorisés).
    const dejaPubliees = selectionsParFixture.get(bet.fixtureId);
    if (dejaPubliees && dejaPubliees.some(p => estContradictoire(p.market, p.pick, bet.market, bet.pick))) return false;
    // Partie 1/2 : jamais une sélection déjà publiée ailleurs aujourd'hui.
    if (selectionsExclues.has(`${bet.fixtureId}|${bet.market}|${bet.pick}`)) return false;
    // Partie 3 : une équipe (domicile OU extérieur) ne peut pas dépasser
    // MAX_APPARITIONS_EQUIPE fiches dans la même journée. IDs absents
    // (anciennes données) → aucune restriction, jamais bloquant.
    if (bet.equipeDomicileId != null && (equipesUtilisees.get(bet.equipeDomicileId) || 0) >= MAX_APPARITIONS_EQUIPE) return false;
    if (bet.equipeExterieurId != null && (equipesUtilisees.get(bet.equipeExterieurId) || 0) >= MAX_APPARITIONS_EQUIPE) return false;
    // Cotes ≥1.90 acceptées pour les marchés SAFE/PREMIUM déjà bien établis
    // et encadrés (victoire directe, plus de 2.5 buts, BTTS) — le plafond
    // strict du plan ne s'applique qu'aux cotes hors de ces plages
    // contrôlées. EXACT_SCORE et PREMIUM sont donc tous deux exemptés.
    if (bet.odd > maxLeg && bet.tier !== 'EXACT_SCORE' && bet.tier !== 'PREMIUM') return false;
    const plafondMarche = PLAFOND_PAR_MARCHE[bet.market] || MAX_PAR_MARCHE;
    if ((marchesUtilises[bet.market] || 0) >= plafondMarche) return false;
    // Plafond du JOUR (toutes fiches confondues, voir définition plus haut)
    // — jamais appliqué au score exact (mk_score_exact ne passe pas par
    // cette fonction) ni au buteur (déjà à 1 max via PLAFOND_PAR_MARCHE).
    if ((marchesUtiliseesJour.get(bet.market) || 0) >= MAX_PAR_MARCHE_JOUR) return false;
    if ((championnatsUtilises[bet.league] || 0) >= MAX_PAR_CHAMPIONNAT) return false;
    if (selections.length >= MAX_SELECTIONS) return false;
    if (coteTotale * bet.odd > cibleMax * 1.05) return false; // petite marge, jamais dépasser franchement
    selections.push(bet);
    matchsUtilises.add(bet.fixtureId);
    marchesUtilises[bet.market] = (marchesUtilises[bet.market] || 0) + 1;
    marchesUtiliseesJour.set(bet.market, (marchesUtiliseesJour.get(bet.market) || 0) + 1);
    championnatsUtilises[bet.league] = (championnatsUtilises[bet.league] || 0) + 1;
    if (bet.equipeDomicileId != null) equipesUtilisees.set(bet.equipeDomicileId, (equipesUtilisees.get(bet.equipeDomicileId) || 0) + 1);
    if (bet.equipeExterieurId != null) equipesUtilisees.set(bet.equipeExterieurId, (equipesUtilisees.get(bet.equipeExterieurId) || 0) + 1);
    coteTotale *= bet.odd;
    return true;
  }

  // NOTE : plus d'insertion de score exact ici (voir commentaire plus haut).
  // 1 buteur max, seulement si le plan l'autorise et joueur pas déjà utilisé
  // ailleurs aujourd'hui
  if (autoriseScoreExact) {
    for (const b of buteurs) {
      if (tenterAjout(b)) { buteursUtilises.add(b.pick); break; }
    }
  }
  // Sélections 🟡 (premium) : jusqu'à 2, sauf si la CIBLE de la fiche est
  // <20 (règle du document d'optimisation du 25/08, point 11 : "éviter
  // plusieurs victoires proches de 2.00 dans une même fiche <20" — cette
  // règle dépend de la cote cible réelle de la fiche, pas du rang du plan :
  // un plan autre que le Plan 1 peut très bien avoir, un jour donné, une
  // cible réduite via cibleMinOverride ou une config <20, et doit alors
  // suivre la même prudence).
  const maxPremium = cibleMax < 20 ? MAX_PREMIUM_PLAN1 : 2;
  let premCount = 0;
  for (const b of premium) {
    if (premCount >= maxPremium) break;
    if (tenterAjout(b)) premCount++;
  }
  // Inclusion volontaire d'une petite cote fiable (session suivante,
  // demande explicite de James, 31/08 v2 : "pour les petites cotes je vois
  // moins de odds à 1,30 ; 1,60 etc, il faut les choisir aussi, mais
  // toujours pas au hasard, avec des stats et pronostics fiables"). Le tri
  // du bloc suivant se fait par scoreFiabilite décroissant : une petite
  // cote, même fiable, peut ne jamais remonter un jour où d'autres
  // sélections ont un scoreFiabilite légèrement supérieur. On cherche ici,
  // AVANT de compléter dans l'ordre habituel, la MEILLEURE petite cote
  // disponible (1.15-1.70, fourchette "petite cote" pour du foot) dont la
  // fiabilité réelle (scoreFiabilite, jamais un choix arbitraire) dépasse
  // un seuil minimum — jamais injectée au hasard, jamais si la fiche en a
  // déjà une, jamais si aucune ne passe le seuil de fiabilité.
  const PETITE_COTE_MIN = 1.15, PETITE_COTE_MAX = 1.70, SEUIL_FIABILITE_PETITE_COTE = 0.55;
  const scoreDe = b => (b.scoreFiabilite != null ? b.scoreFiabilite : 1 / b.odd);
  const aDejaPetiteCote = selections.some(s => s.odd >= PETITE_COTE_MIN && s.odd <= PETITE_COTE_MAX);
  if (!aDejaPetiteCote) {
    const candidatsPetiteCote = safe
      .filter(b => b.odd >= PETITE_COTE_MIN && b.odd <= PETITE_COTE_MAX && scoreDe(b) >= SEUIL_FIABILITE_PETITE_COTE)
      .sort((a, b) => scoreDe(b) - scoreDe(a));
    for (const b of candidatsPetiteCote) {
      if (tenterAjout(b)) break;
    }
  }

  // Compléter avec du 🟢 (safe) jusqu'à atteindre la cible (jamais au-delà du max).
  // CORRECTIF (25/08) : une seule sélection premium peut déjà dépasser
  // cibleMin (ex. 2.50 pour un plan à 2.00 min) — sans le "selections.length<2"
  // ci-dessous, la boucle s'arrêtait avant d'ajouter une 2ᵉ sélection, la
  // fiche restait à 1 seule sélection et échouait la validation (≥2 requis),
  // donc n'était JAMAIS publiée. C'est la cause du Plan 1 manquant le 25/08.
  for (const b of safe) {
    if (selections.length >= 2 && coteTotale >= cibleMin) break;
    tenterAjout(b);
  }

  // Score de confiance = moyenne des scoreFiabilite des légs retenus.
  // AMÉLIORÉ (session suivante) : utilisait avant uniquement 1/cote (+
  // léger mélange BSD pour le 1X2) — ignorait complètement le vrai taux de
  // réussite historique déjà calculé pour la SÉLECTION des légs
  // (scoreFiabilite, voir annoterPoolAvecFiabilite). Le chiffre affiché à
  // l'abonné reflète maintenant la même donnée que celle qui a guidé le
  // choix des légs — jamais deux confiances différentes pour une même
  // fiche. bet.scoreFiabilite absent (repli 1/cote) → comportement
  // identique à avant pour ce leg précis.
  const confiance = selections.length
    ? Math.round(100 * selections.reduce((s, b) => {
        const base = (b.scoreFiabilite != null) ? b.scoreFiabilite : (1 / b.odd);
        const prob = (b.bsdProbImplicite != null)
          ? (base * 0.75 + b.bsdProbImplicite * 0.25)
          : base;
        return s + prob;
      }, 0) / selections.length)
    : 0;

  return {
    selections,
    coteTotale: Math.round(coteTotale * 100) / 100,
    confiance,
    // CHANGÉ (session suivante, décision explicite de James — inverse la
    // règle du 28/08) : cibleMin reste utilisé PLUS HAUT pour VISER la
    // vraie cote cible pendant la construction (boucle "compléter avec du
    // safe jusqu'à cibleMin" ci-dessus, inchangée) — un jour riche en
    // matchs, le résultat atteint donc toujours sa vraie plage
    // normalement. Mais cibleMin ne REJETTE plus le résultat s'il n'est
    // pas atteint : seul le plafond du plan (cibleMax) reste une limite
    // stricte. La seule vraie raison qu'un plan reste sans fiche devient
    // "moins de 2 sélections utilisables dans tout le pool", jamais "la
    // cote atteinte est jugée trop basse". min_odd_exempted (publierFiche)
    // continue de signaler honnêtement quand ce cas se produit.
    valide: selections.length >= 2 && coteTotale <= cibleMax
  };
}

/**
 * Fiche "score exact" dédiée — jamais mélangée avec d'autres marchés.
 * 3 à 6 sélections, toutes score exact, une par match distinct.
 * Réservée aux plans score-exact ; s'ajoute à la fiche normale du même
 * plan (ne la remplace pas — confirmé par James).
 */
function construireFicheScoreExact(pool, plan, options) {
  options = options || {};
  if (!plan.includes_exact_score) return { selections: [], coteTotale: 0, confiance: 0, valide: false };

  // cibleMinOverride (26/08, demande explicite de James : "toujours au
  // moins une fiche par plan, meme les jours pauvres, sans respecter le
  // minimum — SEULEMENT les jours pauvres"). Meme mecanisme que pour la
  // fiche normale (voir essayer() dans le handler) : 1er essai avec la
  // vraie cible du plan, repli sur un plancher tres bas si invalide. Le
  // nombre MINIMUM de selections (3) et le MAXIMUM du plan, eux, restent
  // toujours stricts — jamais assouplis, meme en repli.
  const cibleMin = options.cibleMinOverride != null
    ? Number(options.cibleMinOverride)
    : (plan.min_total_odd != null ? Number(plan.min_total_odd) : 1.5);
  const cibleMax = options.cibleMaxOverride != null
    ? Number(options.cibleMaxOverride)
    : (plan.max_total_odd != null ? Number(plan.max_total_odd) : 999);

  // Extrait home/away d'un pick "Score exact : X:Y".
  function parseScore(pick) {
    const m = /(\d+):(\d+)/.exec(String(pick));
    return m ? { home: parseInt(m[1], 10), away: parseInt(m[2], 10) } : null;
  }

  // PROFIL DU MATCH (25/08, retour de James : "pas toujours 1-1/1-0, selon
  // des pronostics clairs") — utilise le BTTS et le total buts DÉJÀ
  // récupérés pour ce même match (aucune donnée nouvelle inventée) pour
  // orienter le choix du score plutôt que de prendre systématiquement la
  // cote la plus basse (qui donne presque toujours 1-1/1-0/2-1, quel que
  // soit le match). Signal faible par nature (peu de matchs ont les deux
  // marchés), donc on ne l'applique que quand un signal SAFE existe
  // vraiment ; sinon on retombe honnêtement sur la cote la plus basse.
  function profil(fixtureId) {
    const btts = pool.find(b => b.fixtureId === fixtureId && b.market === 'mk_btts' && b.tier === 'SAFE');
    if (btts) return 'BTTS'; // les deux équipes marquent probablement
    const under = pool.find(b => b.fixtureId === fixtureId && b.market === 'mk_total_buts'
      && b.tier === 'SAFE' && /^Moins/.test(b.pick));
    if (under) return 'PEU_DE_BUTS';
    const overFort = pool.find(b => b.fixtureId === fixtureId && b.market === 'mk_total_buts'
      && b.tier === 'PREMIUM' && /^Plus/.test(b.pick));
    if (overFort) return 'BEAUCOUP_DE_BUTS';
    return null; // aucun signal fiable pour ce match — repli sur la cote la plus basse
  }

  function correspond(score, prof) {
    if (!prof || !score) return true;
    const total = score.home + score.away;
    if (prof === 'BTTS') return score.home > 0 && score.away > 0;
    if (prof === 'PEU_DE_BUTS') return total <= 2;
    if (prof === 'BEAUCOUP_DE_BUTS') return total >= 3;
    return true;
  }

  const parFixture = {};
  // Match déjà utilisé dans une AUTRE fiche publiée aujourd'hui (28/08,
  // même règle que construireFiche) — un score exact sur un match déjà
  // "V1" ou "X2" ailleurs serait tout aussi contradictoire aux yeux d'un
  // abonné. Filtré ici, avant même le calcul du profil BTTS/totaux.
  const fixturesExclues = options.fixturesExclues || new Set();
  pool.filter(b => b.tier === 'EXACT_SCORE' && !fixturesExclues.has(b.fixtureId)).forEach(b => {
    (parFixture[b.fixtureId] = parFixture[b.fixtureId] || []).push(b);
  });
  const meilleur = {};
  Object.entries(parFixture).forEach(([fixtureId, candidats]) => {
    candidats.sort((a, b) => a.odd - b.odd); // du moins cher au plus cher
    const prof = profil(Number(fixtureId));
    // CORRECTIF (28/08, retour explicite de James : "je ne veux pas du
    // hasard et toujours des répétitions si ce n'est pas choisi avec des
    // données réelles") — SANS profil réel (aucun BTTS/totaux déjà validé
    // pour CE match précis), il n'existe AUCUNE corroboration indépendante
    // du score choisi : ce n'est alors qu'"le moins cher par défaut", pas
    // un pronostic fiable. Avant ce correctif, ce cas revenait quand même
    // au moins cher (correspondants[0]||candidats[0] — et correspond()
    // retourne toujours vrai quand prof est null, donc ce repli était en
    // réalité systématique dès qu'aucun signal n'existait), d'où les
    // scores répétés (2:0, 1:1...) sur des matchs sans lien entre eux.
    // Le match est maintenant EXCLU plutôt que deviné sans corroboration —
    // conforme à "jamais forcer, qualité > quantité" déjà établi ailleurs.
    if (!prof) return;
    const correspondants = candidats.filter(c => correspond(parseScore(c.pick), prof));
    if (!correspondants.length) return; // profil réel mais aucun score ne colle : pareil, on exclut plutôt que de forcer
    meilleur[fixtureId] = correspondants[0];
  });
  // Les scores les plus probables (cote la plus basse, DANS le profil retenu
  // ci-dessus) d'abord — construction INCRÉMENTALE respectant
  // [min_total_odd, max_total_odd] du plan, comme construireFiche le fait
  // déjà pour la fiche normale. CORRIGE le bug du 24/08 : prendre 6 scores
  // exacts d'un coup sans plafond produisait une cote totale de 3473
  // rejetée par Supabase (cote_hors_plage, max 100).
  const candidats = Object.values(meilleur).sort((a, b) => a.odd - b.odd);

  // Partie 1/2/4 : "même fiche exacte répétée plusieurs fois → toujours
  // interdit" (contrairement à la limite d'apparition par équipe, cette
  // règle-ci S'APPLIQUE au score exact — seule la Partie 3 est exemptée).
  const selectionsExclues = options.selectionsExclues || new Set();

  // Mode "nombre de matchs" (27/08, demande explicite de James pour le
  // bouton admin GÉNÉRER SCORE EXACT) : l'admin choisit directement COMBIEN
  // de matchs inclure (3 à 6), au lieu d'une cote cible — le principe de
  // sélection reste identique (profil du match, cote la plus basse dans ce
  // profil, jamais de sélection déjà utilisée). cibleMax reste un plafond
  // de SÉCURITÉ (le trigger base le refuserait de toute façon), jamais le
  // critère d'arrêt dans ce mode. Comportement PAR COTE (défaut) inchangé
  // quand cette option est absente.
  const nombreCible = options.nombreMatchsOverride != null
    ? Math.max(3, Math.min(6, Math.round(Number(options.nombreMatchsOverride))))
    : null;

  const selections = [];
  let coteTotale = 1.0;
  for (const b of candidats) {
    if (selections.length >= (nombreCible || 6)) break;
    if (selectionsExclues.has(`${b.fixtureId}|${b.market}|${b.pick}`)) continue;
    // Triés croissant : si celui-ci dépasse déjà le max, les suivants
    // (plus chers) seraient pires — on arrête plutôt que de sauter au suivant.
    if (coteTotale * b.odd > cibleMax * 1.05) break;
    selections.push(b);
    coteTotale *= b.odd;
    if (!nombreCible && selections.length >= 3 && coteTotale >= cibleMin) break;
  }

  // En mode "nombre de matchs" : valide dès 3 sélections minimum (règle
  // structurelle jamais assouplie), même si moins que demandé faute de
  // matchs disponibles — best-effort, jamais de fiche inventée pour
  // atteindre pile le nombre choisi (même philosophie que le reste du site).
  // CHANGÉ (session suivante, même règle que construireFiche) : cibleMin
  // ne bloque plus dans les deux modes — seul le plafond compte.
  const valide = selections.length >= 3 && coteTotale <= cibleMax * 1.05;

  // AMÉLIORÉ (session suivante) : même principe que construireFiche —
  // utilise scoreFiabilite (vrai historique quand disponible) plutôt que
  // la seule cote.
  const confiance = selections.length
    ? Math.round(100 * selections.reduce((s, b) => s + (b.scoreFiabilite != null ? b.scoreFiabilite : 1 / b.odd), 0) / selections.length)
    : 0;

  return {
    selections,
    coteTotale: Math.round(coteTotale * 100) / 100,
    confiance,
    valide
  };
}

// ============================================================================
// 7. IDEMPOTENCE — jamais deux fois la même génération pour la même date
// ============================================================================

async function dejaGenereAujourdhui(dateCible) {
  try {
    const data = await sbSelect(
      'tickets',
      `select=id&play_date=eq.${dateCible}&code=like.BOT-*&limit=1`
    );
    return !!(data && data.length);
  } catch (e) {
    stats.erreurs.push('verif_doublon: ' + e.message);
    return false;
  }
}

// ============================================================================
// 8. ÉCRITURE EN BASE
// ============================================================================

async function publierFiche(plan, fiche, dateCible, sport, noms, suffixeCode, options) {
  // options (26/08, ajouté pour la génération manuelle admin — 100%
  // rétrocompatible : aucun appelant existant ne passe ce paramètre, donc
  // le bot quotidien garde EXACTEMENT le même comportement qu'avant).
  options = options || {};
  const prefixeCode = options.codePrefix || 'BOT';
  const code = `${prefixeCode}-${dateCible}-${sport.toUpperCase()}-R${plan.rank}${suffixeCode || ''}`;
  // score_legs_count : nombre de sélections "score exact" dans la fiche —
  // nécessaire au filtrage RLS côté Dashboard client (colonne NOT NULL,
  // default 0, mais doit refléter la réalité dès qu'une fiche en contient).
  // CORRIGÉ (session suivante) : au moins 3 fiches déjà publiées (08/26,
  // 08/28, 08/29) se sont retrouvées avec score_legs_count=0 alors que
  // 100% de leurs légs étaient bien mk_score_exact (cause exacte non
  // confirmée avec certitude) — filet de sécurité en plus de tier, jamais
  // à la place : compte aussi via s.market, qui est ce qui finit
  // réellement écrit en base pour chaque leg.
  const scoreLegsCount = fiche.selections.filter(s => s.tier === 'EXACT_SCORE' || s.market === 'mk_score_exact').length;

  // min_odd_exempted (26/08) : reflète un FAIT, pas un chemin de code —
  // vrai dès que la cote réellement publiée est sous le vrai plancher du
  // plan (plan.min_total_odd, la valeur RÉELLE en base, jamais le repli
  // interne à 1.5 ni l'exception rank>=3/nbMatchsDisponibles<4, qui ne
  // sont que des mécanismes de CONSTRUCTION). Couvre les deux chemins qui
  // peuvent produire une cote sous le plancher, sans avoir à les tracer
  // individuellement. Le trigger trg_valider_cote_plan lit ce flag pour
  // ignorer le contrôle du minimum uniquement dans ce cas précis — le
  // maximum, lui, reste toujours strict côté base, aucune exemption.
  // La génération manuelle admin (options.forcerExemption) est TOUJOURS
  // exemptée : par construction, l'admin choisit une cote max propre à
  // cette fiche, potentiellement sous le plancher normal du plan — ce
  // n'est jamais une anomalie à signaler comme un jour pauvre du bot.
  const trueMin = plan.min_total_odd != null ? Number(plan.min_total_odd) : null;
  const miniExempte = !!options.forcerExemption || (trueMin != null && fiche.coteTotale < trueMin);

  const publie = options.published != null ? !!options.published : true;

  let ticket;
  try {
    const inserted = await sbInsert('tickets', [{
      code, sport, min_plan_rank: plan.rank, status: 'pending',
      confidence: fiche.confiance, play_date: dateCible, published: publie,
      legs_count: fiche.selections.length, total_odd: fiche.coteTotale,
      score_legs_count: scoreLegsCount,
      // Distinction interne BOT/ADMIN (25/08) : permet au panneau admin de
      // signaler l'origine d'une fiche. Une correction manuelle ultérieure
      // ne remet jamais cette valeur à 'admin' (voir admin_save_ticket).
      source: options.source || 'bot',
      // Jour pauvre en matchs (26/08) : la cote réelle est en dessous du
      // plancher du plan — publiée quand même sur demande de James
      // ("toujours une fiche par plan"), mais marquée comme telle pour que
      // le trigger l'accepte et que le front puisse un jour l'afficher
      // différemment si souhaité.
      min_odd_exempted: miniExempte,
      // scheduled_publish_at (26/08) : uniquement rempli pour une fiche
      // générée manuellement en admin avec publication PROGRAMMÉE — NULL
      // dans tous les autres cas (bot quotidien, publication immédiate).
      scheduled_publish_at: options.scheduledPublishAt || null
    }]);
    ticket = inserted && inserted[0];
    if (!ticket) throw new Error('réponse vide à l\'insertion du ticket');
  } catch (e) {
    stats.erreurs.push(`publication ticket rang ${plan.rank}: ${e.message}`);
    return false;
  }

  const legs = fiche.selections.map((s, i) => {
    const nom = noms[s.fixtureId];
    return {
      ticket_id: ticket.id,
      match_label: (nom && nom.label) || `Match ${s.fixtureId}`,
      match_time: s.matchTimeHaiti,
      kickoff_at: s.kickoffUtc,
      league: s.league,
      // Phase 2, section 2 (27/08) : pays du championnat tel que retourné
      // par API-Sports (league.country), jamais une association inventée.
      // null pour les rares cas où l'API ne le fournit pas (jamais bloquant).
      league_country: s.leagueCountry || null,
      market: s.market,
      pick: s.pick,
      odd: s.odd,
      position: i + 1,
      fixture_id: s.fixtureId, // bigint en base — jamais convertir en texte
      result: null,
      // Session suivante (roadmap "amélioration continue") : purement
      // informatif pour l'admin, jamais lu par le règlement
      // (bot-settle-results.js). classerConfiance(s) tolère un
      // scoreFiabilite absent (repli 1/cote), jamais une erreur ici.
      confidence_label: classerConfiance(s),
      value_score: s.valueScore != null ? s.valueScore : null,
      real_sample_size: s.echantillonReel != null ? s.echantillonReel : null
    };
  });

  try {
    await sbInsert('ticket_legs', legs);
  } catch (e) {
    stats.erreurs.push(`publication legs rang ${plan.rank}: ${e.message}`);
    // On retire le ticket orphelin plutôt que de laisser une fiche vide publiée
    try { await sbDelete('tickets', `id=eq.${ticket.id}`); }
    catch (e2) { stats.erreurs.push(`nettoyage ticket orphelin rang ${plan.rank}: ${e2.message}`); }
    return false;
  }
  stats.fichesPubliees++;
  return true;
}

// ============================================================================
// 9. ORCHESTRATION PRINCIPALE
// ============================================================================


// ============================================================================
// DIAGNOSTIC BIG BALLS SPORTS DATA (25/08) — service d'ANALYSE en complément,
// jamais une source de cotes (leur plan gratuit n'inclut pas /odds, réservé
// au plan Edge à 149$/mois). Vérifie 3 choses précises repérées dans leur
// doc publique avant d'y construire quoi que ce soit :
//   1. Les compositions confirmées (/lineups) sont-elles vraiment servies ?
//   2. Le flux de stats joueurs (xG) est-il réellement figé depuis juin
//      2026 comme leur propre page le laisse entendre, ou à jour ?
//   3. Les stats d'équipe post-match (xG du match) répondent-elles ?
// Isolé à 100% : lecture seule, jamais appelé par la génération réelle.
// ============================================================================
async function diagnostiquerBBSD(dateIso) {
  const rapport = {
    host: BBS_HOST, dateTestee: dateIso, endpoints: {},
    compositionsDisponibles: null, xgAJour: null, conclusion: ''
  };

  async function essayer(nom, path) {
    try {
      const url = 'https://' + BBS_HOST + path;
      const resp = await fetch(url, { headers: { Authorization: 'Bearer ' + BBS_API_KEY } });
      const brut = await resp.json().catch(() => ({}));
      rapport.endpoints[nom] = {
        http: resp.status,
        resume: JSON.stringify(brut).slice(0, 600)
      };
      return resp.ok ? brut : null;
    } catch (e) {
      rapport.endpoints[nom] = { erreur: e.message };
      return null;
    }
  }

  // 1. Ligues disponibles (confirme juste que la clé fonctionne)
  await essayer('leagues', '/v1/leagues?sport=football');

  // 2. Matchs du jour visé — sert à récupérer un vrai id de match pour les
  //    tests suivants (compositions, stats), sans deviner un id au hasard.
  const matchsData = await essayer('matches', '/v1/matches?sport=football&date=' + dateIso);
  const premierMatch = matchsData && Array.isArray(matchsData.data) && matchsData.data[0];

  if (premierMatch && premierMatch.id) {
    rapport.exempleMatch = {
      id: premierMatch.id, league: premierMatch.league,
      equipes: premierMatch.home && premierMatch.away
        ? (premierMatch.home.name + ' — ' + premierMatch.away.name) : null,
      statut: premierMatch.status
    };
    const compo = await essayer('lineups', '/v1/stored/matches/' + premierMatch.id + '/lineups');
    // CORRECTIF (25/08) : la présence d'un objet `data` ne suffit pas — leur
    // API renvoie `data:{home:[],away:[]}` avec `meta.available:false` quand
    // rien n'est encore publié. Seuls des tableaux non vides comptent.
    rapport.compositionsDisponibles = !!(compo && compo.data &&
      ((compo.data.home && compo.data.home.length) || (compo.data.away && compo.data.away.length)));
    rapport.compositionsMeta = compo && compo.meta;

    const stats = await essayer('stats_match', '/v1/stored/matches/' + premierMatch.id + '/stats');
    rapport.xgMatchDisponible = !!(stats && JSON.stringify(stats).toLowerCase().includes('xg'));
  } else {
    rapport.exempleMatch = null;
    rapport.compositionsDisponibles = false;
    rapport.note = 'Aucun match trouvé ce jour-là — retester avec &bbsdDate=AAAA-MM-JJ sur un jour avec matchs des grands championnats couverts (EPL, Liga, Bundesliga, Serie A, Ligue 1, MLS, UCL).';
  }

  // 3. Le point d'alerte repéré dans leur doc : le flux xG joueurs est-il
  //    réellement figé depuis juin 2026 ? On teste sur un joueur connu pour
  //    exister dans leur base si un match a été trouvé, sinon on saute.
  rapport.conclusion = rapport.compositionsDisponibles
    ? 'Compositions confirmées accessibles — utile en complément (ex. vérifier qu\'un buteur pressenti démarre vraiment).'
    : 'Compositions non confirmées sur ce test — voir endpoints.lineups pour le détail brut.';

  return rapport;
}

// ============================================================================
// DIAGNOSTIC NBA (25/08) — reconnaissance du plan gratuit
// ----------------------------------------------------------------------------
// L'API NBA (v2.nba.api-sports.io) est un abonnement SÉPARÉ du football :
// quota distinct (100 req/jour), endpoints différents, restrictions
// potentiellement différentes. Rien n'est supposé ici — chaque endpoint est
// testé un par un et le rapport contient exactement ce que l'API répond, y
// compris les messages d'erreur bruts. (Leçon des sessions précédentes : un
// plan gratuit a des restrictions non documentées, découvertes uniquement
// par des tests réels.)
//
// Question centrale à trancher : LES COTES SONT-ELLES DISPONIBLES ?
// Sans cotes, tout le moteur de fiches — qui utilise la cote du bookmaker
// comme proxy de probabilité — est inapplicable à la NBA.
// ============================================================================
async function diagnostiquerNBA(dateIso) {
  const rapport = {
    host: NBA_HOST, dateTestee: dateIso, endpoints: {},
    coteDisponible: null, marchesVus: {}, echantillonCotes: [], conclusion: ''
  };

  async function essayer(nom, path, params) {
    try {
      const url = new URL('https://' + NBA_HOST + path);
      Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
      const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
      const brut = await resp.json().catch(() => ({}));
      const erreurs = brut.errors && (Array.isArray(brut.errors) ? brut.errors : Object.values(brut.errors));
      rapport.endpoints[nom] = {
        http: resp.status,
        nbResultats: Array.isArray(brut.response) ? brut.response.length : 0,
        erreursApi: (erreurs && erreurs.length) ? erreurs : null
      };
      return (resp.ok && Array.isArray(brut.response)) ? brut.response : null;
    } catch (e) {
      rapport.endpoints[nom] = { erreur: e.message };
      return null;
    }
  }

  // 1. Saisons accessibles (equivalent NBA du blocage "Free plans do not
  //    have access to this season" rencontre cote football).
  await essayer('seasons', '/seasons', {});

  // 2. Matchs du jour vise.
  const games = (await essayer('games?date', '/games', { date: dateIso })) || [];
  if (games.length) {
    const g = games[0];
    rapport.exempleMatch = {
      id: g.id,
      date: g.date && (g.date.start || g.date),
      statut: g.status && (g.status.long || g.status.short),
      equipes: g.teams ? ((g.teams.home && g.teams.home.name) + ' — ' +
                          (g.teams.visitors && g.teams.visitors.name)) : null
    };
  }

  // 3. LE point critique : les cotes. Teste sur un vrai match du jour si
  //    disponible, sinon a vide pour au moins connaitre le message d'erreur.
  const idMatch = games.length ? games[0].id : null;
  const cotes = idMatch
    ? await essayer('odds?game', '/odds', { game: idMatch })
    : await essayer('odds?date', '/odds', { date: dateIso });

  if (cotes && cotes.length) {
    rapport.coteDisponible = true;
    // Inventaire des marches reellement proposes : determinera quels types
    // de paris le bot pourra generer pour la NBA.
    cotes.slice(0, 3).forEach(item => {
      (item.bookmakers || []).forEach(bk => {
        (bk.bets || []).forEach(bet => {
          const cle = bet.id + ' — ' + bet.name;
          rapport.marchesVus[cle] = (rapport.marchesVus[cle] || 0) + 1;
          (bet.values || []).slice(0, 3).forEach(v => {
            if (rapport.echantillonCotes.length < 12) {
              rapport.echantillonCotes.push('[' + bet.name + '] ' + v.value + ' @ ' + v.odd);
            }
          });
        });
      });
    });
  } else {
    rapport.coteDisponible = false;
  }

  // 4. Bookmakers et marches declares par l'API, independamment d'un match.
  await essayer('bookmakers', '/odds/bookmakers', {});
  await essayer('bets', '/odds/bets', {});

  rapport.conclusion = rapport.coteDisponible
    ? 'Cotes NBA accessibles — un moteur de fiches NBA est realisable sur ce plan.'
    : 'Aucune cote NBA recuperee — voir endpoints.odds pour le motif exact (restriction de plan, aucun match ce jour-la, ou endpoint inexistant).';

  return rapport;
}


// ============================================================================
// DIAGNOSTIC BASKETBALL (25/08) — host v1.basketball, distinct de l'API NBA
// ----------------------------------------------------------------------------
// Objectif : verifier si CE service expose des cotes (contrairement a l'API
// NBA v2 qui n'en a pas du tout), et inventorier les championnats couverts
// par les bookmakers. Rien n'est suppose : chaque endpoint est teste et le
// rapport contient le message d'erreur brut de l'API le cas echeant.
// ============================================================================
async function diagnostiquerBasket(dateIso) {
  const rapport = {
    host: BASKET_HOST, dateTestee: dateIso, endpoints: {},
    coteDisponible: null, championnatsDuJour: {}, marchesVus: {},
    echantillonCotes: [], exempleMatch: null, conclusion: ''
  };

  async function essayer(nom, path, params) {
    try {
      const url = new URL('https://' + BASKET_HOST + path);
      Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
      const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
      const brut = await resp.json().catch(() => ({}));
      const erreurs = brut.errors && (Array.isArray(brut.errors) ? brut.errors : Object.values(brut.errors));
      rapport.endpoints[nom] = {
        http: resp.status,
        nbResultats: Array.isArray(brut.response) ? brut.response.length : 0,
        erreursApi: (erreurs && erreurs.length) ? erreurs : null
      };
      return (resp.ok && Array.isArray(brut.response)) ? brut.response : null;
    } catch (e) {
      rapport.endpoints[nom] = { erreur: e.message };
      return null;
    }
  }

  // 1. Matchs du jour, tous championnats confondus (1 seul appel).
  const games = (await essayer('games?date', '/games', { date: dateIso })) || [];
  games.forEach(g => {
    const lg = g.league ? (g.league.id + ' — ' + g.league.name +
      (g.country && g.country.name ? ' (' + g.country.name + ')' : '')) : '?';
    rapport.championnatsDuJour[lg] = (rapport.championnatsDuJour[lg] || 0) + 1;
  });
  if (games.length) {
    const g = games[0];
    rapport.exempleMatch = {
      id: g.id,
      date: g.date,
      statut: g.status && (g.status.long || g.status.short),
      championnat: g.league && g.league.name,
      equipes: g.teams ? ((g.teams.home && g.teams.home.name) + ' — ' +
                          (g.teams.away && g.teams.away.name)) : null
    };
  }

  // 2. LE point critique : les cotes existent-elles sur ce service ?
  const idMatch = games.length ? games[0].id : null;
  const cotes = idMatch
    ? await essayer('odds?game', '/odds', { game: idMatch })
    : await essayer('odds?date', '/odds', { date: dateIso });

  if (cotes && cotes.length) {
    rapport.coteDisponible = true;
    cotes.slice(0, 3).forEach(item => {
      (item.bookmakers || []).forEach(bk => {
        (bk.bets || []).forEach(bet => {
          const cle = bet.id + ' — ' + bet.name;
          rapport.marchesVus[cle] = (rapport.marchesVus[cle] || 0) + 1;
          (bet.values || []).slice(0, 3).forEach(v => {
            if (rapport.echantillonCotes.length < 15) {
              rapport.echantillonCotes.push('[' + bet.name + '] ' + v.value + ' @ ' + v.odd);
            }
          });
        });
      });
    });
  } else {
    rapport.coteDisponible = false;
  }

  // 3. Marches et bookmakers declares (independamment d'un match).
  await essayer('bets', '/odds/bets', {});
  await essayer('bookmakers', '/odds/bookmakers', {});

  rapport.conclusion = rapport.coteDisponible
    ? 'Cotes basketball accessibles sur ' + BASKET_HOST + ' — un moteur de fiches basket est realisable.'
    : 'Aucune cote basket recuperee — voir endpoints pour le motif exact (endpoint inexistant, restriction de plan, ou aucun match ce jour-la).';

  return rapport;
}

// ============================================================================
// DIAGNOSTIC STATISTIQUES BASKETBALL (session suivante, demande explicite
// de James : "vraies statistiques pour une rentabilité réelle") — objectif
// UNIQUEMENT vérifier si v1.basketball.api-sports.io expose de vraies
// statistiques d'équipe (buts/points marqués-encaissés domicile/extérieur,
// forme) exploitables sur le plan gratuit, AVANT d'écrire une seule ligne
// de moteur dessus. Rien n'est supposé : chaque endpoint candidat est
// testé isolément, avec le message d'erreur brut de l'API si échec.
// N'écrit RIEN en base, ne publie aucune fiche — lecture seule.
// ============================================================================
async function diagnostiquerBasketStats(dateIso) {
  const rapport = {
    host: BASKET_HOST, dateTestee: dateIso,
    matchExemple: null, champsBrutsMatch: null,
    endpoints: {}, conclusion: ''
  };

  async function essayer(nom, path, params) {
    try {
      const url = new URL('https://' + BASKET_HOST + path);
      Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
      const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
      const brut = await resp.json().catch(() => ({}));
      const erreurs = brut.errors && (Array.isArray(brut.errors) ? brut.errors : Object.values(brut.errors));
      rapport.endpoints[nom] = {
        http: resp.status,
        nbResultats: Array.isArray(brut.response) ? brut.response.length : (brut.response ? 1 : 0),
        erreursApi: (erreurs && erreurs.length) ? erreurs : null,
        // Échantillon brut (tronqué) — pour voir la VRAIE forme de la
        // réponse si elle existe, jamais supposée d'avance.
        echantillonBrut: Array.isArray(brut.response) ? brut.response.slice(0, 1) : (brut.response || null)
      };
      return (resp.ok && brut.response) ? brut.response : null;
    } catch (e) {
      rapport.endpoints[nom] = { erreur: e.message };
      return null;
    }
  }

  // 1. Un match réel du jour pour en extraire league.id, season (si le
  // champ existe — pas garanti) et les IDs d'équipe.
  const games = (await essayer('games?date', '/games', { date: dateIso })) || [];
  if (!games.length) {
    rapport.conclusion = 'Aucun match ce jour-là — impossible de tester les endpoints de statistiques (ils ont besoin d\'un vrai id d\'équipe/championnat).';
    return rapport;
  }
  const g = games[0];
  // Dump BRUT complet du premier match (pas de champ présélectionné) —
  // c'est justement ce qu'on ne connaît pas encore (season existe-t-il ?).
  rapport.champsBrutsMatch = g;
  rapport.matchExemple = {
    gameId: g.id, leagueId: g.league && g.league.id, season: g.league && g.league.season,
    teamHomeId: g.teams && g.teams.home && g.teams.home.id,
    teamAwayId: g.teams && g.teams.away && g.teams.away.id
  };

  const { leagueId, season, teamHomeId, gameId } = {
    leagueId: rapport.matchExemple.leagueId, season: rapport.matchExemple.season,
    teamHomeId: rapport.matchExemple.teamHomeId, gameId: rapport.matchExemple.gameId
  };

  // 2. Candidats plausibles pour des statistiques d'équipe — AUCUN n'est
  // supposé exister, chacun est testé isolément. Noms de paramètres
  // alignés sur la convention déjà confirmée côté football
  // (/teams/statistics?team=&league=&season=), jamais garantis identiques
  // côté basketball.
  if (teamHomeId != null) {
    await essayer('statistics?team+league+season', '/statistics', { team: teamHomeId, league: leagueId, season: season });
    if (season == null) {
      // Repli sans season (si le champ n'existait pas sur le match) —
      // certains plans API-Sports acceptent une saison déduite côté serveur.
      await essayer('statistics?team+league (sans season)', '/statistics', { team: teamHomeId, league: leagueId });
    }
  }
  if (leagueId != null && season != null) {
    await essayer('standings?league+season', '/standings', { league: leagueId, season: season });
  }
  if (gameId != null) {
    await essayer('games/statistics/teams?id', '/games/statistics/teams', { id: gameId });
  }

  const auMoinsUnDisponible = Object.values(rapport.endpoints).some(e => e.nbResultats > 0);
  rapport.conclusion = auMoinsUnDisponible
    ? 'Au moins un endpoint de statistiques a renvoyé de vraies données — voir echantillonBrut pour la forme exacte avant de construire quoi que ce soit dessus.'
    : 'Aucun endpoint testé n\'a renvoyé de statistiques exploitables sur ce plan — voir erreursApi de chaque endpoint pour le motif exact (inexistant, restriction de plan, ou données absentes pour ce match précis).';

  return rapport;
}

async function handler(event) {
  resetStats(); // corrige le bug de compteurs cumulatifs entre invocations à chaud

  // MODE TEST : permet de déclencher le bot manuellement (hors fenêtre 17h)
  // pour vérifier tout de suite s'il fonctionne, sans attendre le cron.
  // Utilisation : ouvrir l'URL de la fonction avec ?token=<BOT_TEST_TOKEN>
  // Protégé par jeton pour qu'un tiers ne puisse pas déclencher le bot à volonté.
  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;

  // Ne générer que si on est effectivement à 18h30 (ou après, jusqu'à la
  // fin de la fenêtre) en Haïti — le cron se déclenche plus souvent que
  // nécessaire par sécurité DST. CHANGÉ (session suivante, 17h00→18h30) :
  // vérifie maintenant heure ET minute, pas seulement l'heure — sinon un
  // décalage vers une cible à la demie (18h30) se déclencherait dès 18h00
  // (premier passage de l'heure 18), pas à l'heure demandée. dateCible
  // reste "demain" quoi qu'il arrive : ce décalage n'exclut aucun match.
  // (ignoré en mode test)
  const maintenant = partsHaiti(new Date());
  if (!modeTest && !(maintenant.heureNum === 18 && maintenant.minuteNum >= 30)) {
    return { statusCode: 200, body: 'Hors fenêtre 18h30 Haïti — rien à faire. (ajoutez ?token=... pour tester manuellement)' };
  }
  if (modeTest) console.log('[BOT] === MODE TEST déclenché manuellement ===');


  if (!API_SPORTS_KEY) {
    stats.erreurs.push('API_SPORTS_KEY absente des variables Netlify');
    logFinal();
    return { statusCode: 500, body: 'Configuration incomplète.' };
  }

  try { verifierConfigSupabase(); }
  catch (e) { stats.erreurs.push(e.message); logFinal(); return { statusCode: 500, body: e.message }; }

  const dateCible = dateCibleDemainHaiti();
  stats.dateCible = dateCible;
  console.log(`[BOT] ${new Date().toISOString()} — Date cible (Haïti, demain) : ${dateCible}`);

  // --- Protection anti-doublon ---
  if (await dejaGenereAujourdhui(dateCible)) {
    stats.doublonsDetectes = true;
    logFinal();
    return { statusCode: 200, body: `Fiches déjà générées pour ${dateCible} — abandon.` };
  }

  // --- Plans réels (cotes cible par rang) ---
  let plans;
  try {
    plans = await sbSelect('plans', 'select=rank,min_total_odd,max_total_odd,max_leg_odd,includes_exact_score&order=rank.asc');
    if (!plans || !plans.length) throw new Error('table plans vide');
    // Tri explicite par rang croissant (28/08, correctif "petites cotes
    // Plan 1") : la requête PostgREST ne garantit AUCUN ordre. Sans ce
    // tri, un plan VIP/Lifetime pouvait passer avant le Plan 1 au Tour 1
    // et consommer des matchs (jusqu'à 10 par fiche) dont le Plan 1 avait
    // besoin pour sa propre fiche à petite cote — laissant une sélection
    // fiable et à cote basse totalement inutilisée ce jour-là. Plan 1
    // (rang le plus bas, besoin le plus faible en matchs) choisit
    // désormais toujours en premier à chaque tour.
    plans.sort((a, b) => a.rank - b.rank);
  } catch (e) {
    stats.erreurs.push('lecture table plans: ' + e.message);
    logFinal();
    return { statusCode: 500, body: 'Impossible de lire les plans.' };
  }

  // --- Fixtures du jour (1 seul appel, aucune restriction championnat/saison) ---
  const fixturesJour = await recupererFixturesJour(dateCible);
  stats.matchsTrouves = fixturesJour.length;

  if (!fixturesJour.length) {
    console.log('[BOT] Aucun match reçu — vérifier le plan API-Sports (endpoint /fixtures).');
    logFinal();
    return { statusCode: 200, body: 'Aucun match disponible — aucune fiche publiée.' };
  }

  // Filtrage local : championnat autorisé, fenêtre horaire Haïti, statut
  // programmé (voir filtrerCandidatsJour, factorisée pour être réutilisée
  // telle quelle par le diagnostic diag=poolpreview).
  const { noms, candidats } = filtrerCandidatsJour(fixturesJour, dateCible);

  let poolFoot = [];
  // Repli BSD (session suivante, roadmap du 29/08 : "conception à faire
  // une fois le quota réglé") — récupéré UNE SEULE FOIS avant la boucle
  // (aucun coût de quota API-Sports, fournisseur totalement séparé),
  // réutilisé à deux endroits : (1) dès qu'un match précis n'a AUCUNE cote
  // Bet365, (2) pour tous les candidats restants si le quota interne
  // s'épuise en cours de route — BSD ne coûtant rien, aucune raison de les
  // abandonner silencieusement. Repli PARTIEL seulement : mk_1x2, mk_total_
  // buts, mk_btts — voir extraireMarchesBSD pour ce qui n'est jamais couvert.
  let evenementsBSD = [];
  stats.bsd.actif = !!BSD_API_KEY;
  if (BSD_API_KEY) {
    evenementsBSD = await recupererEvenementsBSD(dateCible);
    stats.bsd.evenementsRecuperes = evenementsBSD.length;
  }
  function tenterRepliBSD(c) {
    if (!BSD_API_KEY || !evenementsBSD.length) return;
    const infos = noms[c.fixtureId];
    if (!infos) return;
    stats.bsd.repliTente++;
    const evt = trouverEvenementBSD(infos.label, evenementsBSD);
    if (!evt) return;
    const picks = extraireMarchesBSD(evt, dateCible, infos, c.prioritaire);
    if (picks.length) {
      poolFoot = poolFoot.concat(picks);
      stats.bsd.repliReussi++;
    }
  }
  // Rythme entre chaque appel /odds (28/08 v5, cause racine du 429 massif
  // du 28/08 : le plan gratuit API-Sports limite à ~10 requêtes/minute,
  // et la boucle envoyait ses 60 appels d'affilée sans pause — seuls les
  // 9-10 premiers passaient, les 50+ suivants étaient rejetés). 6.5s entre
  // chaque appel = ~9.2 requêtes/minute, sous la limite avec marge.
  // Possible UNIQUEMENT parce que cette fonction est désormais une
  // fonction "Background" Netlify (jusqu'à 15 minutes d'exécution) — une
  // fonction normale (10-26s) ne pourrait jamais tenir ce rythme sur 60
  // candidats (~6-7 minutes au total).
  const DELAI_ENTRE_APPELS_MS = 6500;
  let indexTraite = 0;
  for (; indexTraite < candidats.length; indexTraite++) {
    if (quotaInterneEpuise) {
      // Quota atteint en cours de boucle (29/08) : inutile de continuer à
      // attendre 6.5s entre des appels qui échoueraient tous — on arrête
      // net avec ce qu'on a déjà. Les candidats restants passent quand
      // même par le repli BSD juste après (voir plus bas), plutôt que
      // d'être abandonnés.
      console.log(`[BOT] Arrêt anticipé (quota interne épuisé) après ${indexTraite}/${candidats.length} candidats examinés.`);
      break;
    }
    const c = candidats[indexTraite];
    const oddsItem = await recupererCoteParFixture(c.fixtureId);
    if (oddsItem) {
      poolFoot = poolFoot.concat(extraireMarchesFoot(oddsItem, dateCible, noms[c.fixtureId]));
    } else {
      // Repli BSD (session suivante) : Bet365 n'a rien renvoyé pour CE
      // match précis — jamais un abandon total tant que BSD peut couvrir
      // au moins une partie du profil du match.
      tenterRepliBSD(c);
    }
    if (indexTraite < candidats.length - 1 && !quotaInterneEpuise) await attendre(DELAI_ENTRE_APPELS_MS);
  }
  if (quotaInterneEpuise && indexTraite < candidats.length) {
    console.log(`[BOT] Quota API-Sports épuisé — repli BSD (sans coût de quota) pour les ${candidats.length - indexTraite} candidat(s) restant(s).`);
    for (let i = indexTraite; i < candidats.length; i++) tenterRepliBSD(candidats[i]);
  }

  if (!poolFoot.length) {
    console.log('[BOT] Aucune sélection foot ne passe les filtres (0 cote disponible parmi les matchs candidats, y compris après repli BSD).');
  }

  // --- BSD (25/08) : vérification croisée 1X2 pour les sélections VENANT
  // D'API-SPORTS uniquement — jamais sur une sélection déjà sourcée depuis
  // BSD elle-même (voir viaBSD ci-dessus), ce serait une comparaison de la
  // cote à elle-même, sans aucune valeur. evenementsBSD déjà récupéré plus
  // haut (session suivante) — plus de second appel ici.
  if (evenementsBSD.length && poolFoot.length) {
    annoterPoolAvecBSD(poolFoot.filter(b => !b.viaBSD), noms, evenementsBSD);
  }

  // --- Fiabilité réelle par championnat+marché (28/08) : voir
  // annoterPoolAvecFiabilite plus haut. Toujours tenté, jamais bloquant —
  // sans historique suffisant, retombe simplement sur la probabilité de
  // marché seule (comportement précédent).
  if (poolFoot.length) {
    const carteFiabilite = await recupererFiabiliteMarches();
    stats.fiabilite = { championnatsMarchesConnus: carteFiabilite.size };
    annoterPoolAvecFiabilite(poolFoot, carteFiabilite);
  }

  // --- Diagnostic : taille réelle du pool de sélections après tous les filtres ---
  const parTierCompte = t => poolFoot.filter(b => b.tier === t).length;
  stats.poolFinal = {
    total: poolFoot.length,
    SAFE: parTierCompte('SAFE'),
    PREMIUM: parTierCompte('PREMIUM'),
    EXACT_SCORE: parTierCompte('EXACT_SCORE'),
    detail: poolFoot.map(b => ({
      match: (noms[b.fixtureId] && noms[b.fixtureId].label) || b.fixtureId,
      market: b.market, pick: b.pick, odd: b.odd, tier: b.tier
    }))
  };

  // --- Construction + publication par plan ---
  // nbMatchsDisponibles : utilisé pour l'exception de cote basse (règle
  // confirmée par James : <4 matchs valides → cote réduite acceptée pour
  // les plans rang ≥3). buteursUtilises : partagé sur toute la génération
  // du jour pour qu'un même buteur ne soit jamais réutilisé dans 2 fiches.
  const nbMatchsDisponibles = new Set(poolFoot.map(b => b.fixtureId)).size;
  const buteursUtilises = new Set();
  // Partie 3 (27/08, spec anti-doublon de James) : compteur d'apparitions
  // par équipe, partagé sur toute la génération du jour — max 2 fiches
  // par équipe, jamais appliqué au score exact (Partie 4).
  const equipesUtilisees = new Map();
  // Diversification des marchés ENTRE LES FICHES (31/08 v2, voir la
  // définition complète et la justification dans construireFiche) —
  // partagé et cumulé sur toute la génération du jour, même principe de
  // copie tentative que buteursUtilises/equipesUtilisees ci-dessus/dessous.
  const marchesUtiliseesJour = new Map();
  // Partie 1/2/9 : sélections déjà utilisées AUJOURD'HUI, relues depuis la
  // base (pas seulement depuis ce lot en mémoire) — protège aussi contre
  // une double-exécution accidentelle du bot le même jour (idempotence,
  // Partie 9). Alimenté au fil de la boucle dès qu'une fiche est publiée ;
  // ne bloque jamais construireFiche, seulement une RÉUTILISATION de la
  // même sélection exacte.
  const cleSelection = s => `${s.fixture_id}|${s.market}|${s.pick}`;
  const selectionsExclues = new Set();
  // REMPLACE l'ancienne exclusion totale du match (28/08 v2, demande
  // explicite de James : "même match dans jusqu'à 2 fiches normales,
  // c'est normal, tant que ce n'est pas contradictoire"). Trois
  // structures alimentées depuis la MÊME lecture DB que selectionsExclues :
  //  - selectionsParFixture : sélections déjà publiées aujourd'hui par
  //    match (fiches NORMALES uniquement), pour la détection de
  //    contradiction réelle (voir estContradictoire).
  //  - matchUsageCount : nombre de fiches normales distinctes par match,
  //    plafonné à 2 dans construireFiche.
  //  - fixturesUtiliseesNormales : simple Set des matchs utilisés dans au
  //    moins une fiche normale — passé comme fixturesExclues à
  //    construireFicheScoreExact, qui reste EXCLUE de tout match déjà
  //    utilisé ailleurs (prudence inchangée : un score exact fait une
  //    affirmation forte sur le score final, jamais mélangé aux fiches
  //    normales du même match).
  const selectionsParFixture = new Map();
  const matchUsageCount = new Map();
  const fixturesUtiliseesNormales = new Set();
  try {
    const legsExistants = await sbSelect('ticket_legs',
      `select=fixture_id,market,pick,ticket_id,tickets!inner(play_date,sport,code)&tickets.play_date=eq.${dateCible}&tickets.sport=eq.foot`);
    const fichesParFixture = new Map(); // fixtureId -> Set(ticket_id), fiches normales uniquement
    legsExistants.forEach(l => {
      selectionsExclues.add(cleSelection(l));
      // Une fiche "-EXACT" ne compte jamais dans le plafond des 2 fiches
      // normales par match, et n'alimente jamais la détection de
      // contradiction entre fiches normales (marché différent par nature).
      const estScoreExacte = String((l.tickets && l.tickets.code) || '').endsWith('-EXACT');
      if (estScoreExacte) return;
      fixturesUtiliseesNormales.add(l.fixture_id);
      if (!selectionsParFixture.has(l.fixture_id)) selectionsParFixture.set(l.fixture_id, []);
      selectionsParFixture.get(l.fixture_id).push({ market: l.market, pick: l.pick });
      if (!fichesParFixture.has(l.fixture_id)) fichesParFixture.set(l.fixture_id, new Set());
      fichesParFixture.get(l.fixture_id).add(l.ticket_id);
    });
    fichesParFixture.forEach((tickets, fixtureId) => matchUsageCount.set(fixtureId, tickets.size));
  } catch (e) {
    // Non bloquant : au pire on revient au comportement d'avant (pas de
    // protection cross-run), jamais une raison d'empêcher la génération.
    stats.erreurs.push(`lecture legsExistants (anti-doublon): ${e.message}`);
  }

  // Score exact construit AVANT les fiches normales dans ce run (28/08 v6,
  // voir le bloc dédié plus bas) — initialisé avec les matchs déjà
  // utilisés en fiche normale AUJOURD'HUI depuis une exécution précédente
  // (ex. une fiche manuelle ajoutée plus tôt dans la journée) : le score
  // exact continue de les éviter, même s'il passe désormais en premier au
  // sein de CE run.
  const fixturesUtiliseesScoreExact = new Set(fixturesUtiliseesNormales);

  // Nombre MAXIMUM de fiches classiques par plan (28/08, demande explicite
  // de James) — jamais un objectif forcé, seulement un plafond : un jour
  // pauvre en matchs, un plan peut très bien n'en recevoir qu'une seule
  // (ou aucune), comme avant. Le score exact, lui, reste 1 par plan par
  // jour, inchangé (non concerné par cette demande).
  const MAX_FICHES_PAR_PLAN = 3;
  const fichesPublieesParPlan = {}; // rank -> nb de fiches classiques publiées ce passage
  const planEncoreActif = {};       // rank -> false dès qu'un tour échoue (inutile de retenter, le pool ne peut que s'appauvrir davantage)
  plans.forEach(p => { fichesPublieesParPlan[p.rank] = 0; planEncoreActif[p.rank] = true; });

  // avecRepli=true (tour 1, fiche GARANTIE) : publie dès que possible sous
  // le plafond du plan, quelle que soit la cote atteinte — CHANGÉ (session
  // suivante, décision explicite de James, inverse le 28/08) : la vraie
  // cible (cibleMin) continue de GUIDER la construction à l'intérieur de
  // construireFiche (un jour riche en matchs, le résultat l'atteint donc
  // normalement quand même), mais ne bloque plus la publication si elle
  // n'est pas atteinte. Plus de relance à 1.5 nécessaire : construireFiche
  // ne rejette déjà plus sur le plancher, un seul essai suffit.
  // avecRepli=false (fiches BONUS, tours 2-3) : règle du 28/08 TOUJOURS
  // valable ici, volontairement pas concernée par le changement ci-dessus
  // (confirmé par James) — une fiche bonus n'existe QUE si elle atteint
  // vraiment la cote visée par ce plan, jamais un supplément à cote
  // artificiellement basse juste pour remplir un quota.
  async function tenterEtPublier(plan, avecRepli) {
    const buteursTmp = new Set(buteursUtilises);
    const equipesTmp = new Map(equipesUtilisees);
    const marchesJourTmp = new Map(marchesUtiliseesJour);
    const fiche = construireFiche(poolFoot, plan, {
      buteursUtilises: buteursTmp, equipesUtilisees: equipesTmp, marchesUtiliseesJour: marchesJourTmp,
      selectionsExclues, selectionsParFixture, matchUsageCount,
      fixturesExclues: fixturesUtiliseesScoreExact, nbMatchsDisponibles
    });
    stats.fichesGenerees++;
    if (!fiche.valide) return false;
    if (!avecRepli && fiche.coteTotale < Number(plan.min_total_odd || 0)) return false;
    buteursTmp.forEach(p => buteursUtilises.add(p));
    equipesTmp.forEach((v, k) => equipesUtilisees.set(k, v));
    marchesJourTmp.forEach((v, k) => marchesUtiliseesJour.set(k, v));
    // Met à jour les 3 structures avec les sélections de CETTE fiche
    // (28/08 v2) : selectionsExclues (doublon exact), selectionsParFixture
    // (pour la détection de contradiction des prochaines fiches) et
    // matchUsageCount (+1 par match distinct utilisé dans cette fiche,
    // jamais par leg — un match ne compte qu'une fois par fiche, déjà
    // garanti par matchsUtilises à l'intérieur de construireFiche).
    const fixturesDeCetteFiche = new Set();
    fiche.selections.forEach(s => {
      selectionsExclues.add(`${s.fixtureId}|${s.market}|${s.pick}`);
      if (!selectionsParFixture.has(s.fixtureId)) selectionsParFixture.set(s.fixtureId, []);
      selectionsParFixture.get(s.fixtureId).push({ market: s.market, pick: s.pick });
      fixturesDeCetteFiche.add(s.fixtureId);
    });
    fixturesDeCetteFiche.forEach(fid => {
      matchUsageCount.set(fid, (matchUsageCount.get(fid) || 0) + 1);
      fixturesUtiliseesNormales.add(fid);
    });
    // ÉTIQUETAGE PAR RANG EFFECTIF (session suivante, demande explicite de
    // James : "les petites cotes sont créées en premier et partagées avec
    // tous les 4 plans, les plus grosses cotes sont partagées aux plus
    // gros plans seulement — ainsi impossible qu'un plan reste sans fiche
    // quand des fiches sont créées ce jour-là"). AVANT ce correctif :
    // chaque fiche était étiquetée au rang du plan pour lequel elle avait
    // été construite (plan.rank) — une cote 4.51 construite pour le rang 4
    // restait invisible aux rangs 1/2/3 même si elle tenait largement sous
    // leur plafond, puisque la cascade d'accès ne remonte JAMAIS vers le
    // bas (min_plan_rank<=rang abonné). MAINTENANT : on cherche, parmi
    // TOUS les plans, le rang le PLUS BAS dont le plafond accepte cette
    // cote précise, et on publie avec CE rang — jamais plus haut que
    // nécessaire. `plans` est déjà trié par rang croissant (voir le
    // correctif d'ordre du même jour), donc le premier qui convient est
    // le bon.
    const planEtiquette = plans.find(p => p.max_total_odd == null || fiche.coteTotale <= Number(p.max_total_odd)) || plan;
    await publierFiche(planEtiquette, fiche, dateCible, 'foot', noms);
    return true;
  }

  // SCORE EXACT D'ABORD (28/08 v6, retour explicite de James après le test
  // du 28/08 : la fiche normale du plan 3 avait utilisé jusqu'à 10 matchs
  // avant que son propre score exact ne soit tenté, ne laissant que des
  // miettes — aucune fiche score exact publiable). Construit et publié
  // AVANT les fiches classiques, pour que les matchs les mieux corroborés
  // (BTTS/totaux déjà validés, seul signal accepté par
  // construireFicheScoreExact) soient réservés au score exact avant que
  // les fiches normales (tours 1-3) ne les utilisent pour un autre marché.
  // fixturesUtiliseesScoreExact alimente ensuite fixturesExclues des
  // fiches normales (voir tenterEtPublier ci-dessus) — même principe
  // d'exclusivité qu'avant, juste dans l'autre sens. CHANGÉ (session
  // suivante) : plus de relance à 1.5, construireFicheScoreExact ne
  // rejette déjà plus sur le plancher (même principe que construireFiche)
  // — un seul essai suffit, "1 par plan par jour" reste inchangé.
  // CORRIGÉ (30/08, confirmé explicitement par James en 2 temps) : le score
  // exact n'a JAMAIS de plafond de cote — peu importe la cote atteinte, il
  // est TOUJOURS partagé entre les rangs 3 et 4 ensemble, jamais l'un sans
  // l'autre, sauf génération manuelle admin qui cible volontairement un
  // plan précis.
  // 1er correctif (insuffisant) : une seule construction par jour, mais
  // encore plafonnée à 100 (le max_total_odd du rang 3) — réglait le
  // symptôme de la boucle à deux constructions séparées (voir plus haut),
  // mais aurait quand même rejeté toute fiche au-delà de 100, ce qui n'est
  // pas ce que James demande.
  // MAINTENANT : AUCUN plafond de cote n'est appliqué à la construction ni
  // à l'étiquetage du score exact automatique — cibleMaxOverride neutralise
  // le plafond du plan de référence dans construireFicheScoreExact, et
  // l'étiquetage est FIXE sur le rang le plus bas éligible (rang 3),
  // jamais recalculé selon la cote atteinte. `plans` déjà trié ascendant,
  // donc le premier plan avec includes_exact_score=true est bien le rang 3.
  // Cascade d'accès existante (min_plan_rank<=rang abonné) garantit que le
  // rang 4 la voit aussi automatiquement. Le trigger Postgres
  // trg_valider_cote_plan a été mis à jour en parallèle (migration du
  // 30/08) pour exempter le score exact du contrôle de maximum, sinon
  // l'insertion aurait échoué (cote_hors_plage) dès que la cote dépasse
  // 100 — la contrainte "maximum toujours strict, jamais exemptable"
  // documentée jusqu'ici ne s'applique qu'aux fiches classiques.
  const planScoreExactRef = plans.find(p => p.includes_exact_score);
  if (planScoreExactRef) {
    const ficheExacte = construireFicheScoreExact(poolFoot, planScoreExactRef, {
      selectionsExclues, fixturesExclues: fixturesUtiliseesScoreExact,
      cibleMaxOverride: 99999 // aucun plafond réel pour le score exact automatique
    });
    stats.fichesGenerees++;
    if (!ficheExacte.valide) {
      console.log(`[BOT] Score exact : aucune fiche propre publiable — ${ficheExacte.selections.length} sélection(s) (minimum 3 requis), cote atteinte ${ficheExacte.coteTotale}.`);
    } else {
      // Score exact ne compte JAMAIS dans le plafond des 2 fiches
      // normales par match ni dans selectionsParFixture — seulement
      // selectionsExclues (empêche exactement le même score exact d'être
      // republié tel quel) et fixturesUtiliseesScoreExact (réserve ces
      // matchs, exclus des fiches normales ci-dessous).
      ficheExacte.selections.forEach(s => {
        selectionsExclues.add(`${s.fixtureId}|${s.market}|${s.pick}`);
        fixturesUtiliseesScoreExact.add(s.fixtureId);
      });
      // Étiquetage FIXE au rang 3 (jamais recalculé selon la cote) — c'est
      // ce qui garantit le partage systématique 3+4 via la cascade, peu
      // importe la cote atteinte.
      await publierFiche(planScoreExactRef, ficheExacte, dateCible, 'foot', noms, '-EXACT');
    }
  }

  // TOUR 1 — fiche GARANTIE pour chaque plan (session suivante : publie
  // désormais dès que possible sous le plafond du plan, quelle que soit la
  // cote atteinte — voir tenterEtPublier). Ne reste sans fiche QUE si le
  // pool entier n'a plus 2 sélections utilisables pour ce plan (contenu
  // déjà épuisé par le score exact/d'autres plans aujourd'hui, ou
  // vraiment trop peu de matchs) — dans ce seul cas, ses abonnés restent
  // couverts par le rang inférieur via la cascade d'accès.
  for (const plan of plans) {
    const ok = await tenterEtPublier(plan, true);
    if (ok) { fichesPublieesParPlan[plan.rank] = 1; }
    else {
      planEncoreActif[plan.rank] = false;
      console.log(`[BOT] Rang ${plan.rank} : aucune fiche publiable au tour 1 (pool épuisé — moins de 2 sélections restantes pour ce plan) — cible [${plan.min_total_odd}–${plan.max_total_odd}]. Abonnés couverts via cascade par le rang inférieur.`);
    }
  }

  // TOURS 2 et 3 — fiches BONUS, jusqu'à 3 au total par plan (28/08,
  // demande explicite de James). Traitement PAR TOUR (une tentative pour
  // CHAQUE plan, puis une autre) plutôt que "le Plan 1 prend tout avant que
  // les autres jouent" — protège les gros plans (VIP/Lifetime) d'un pool
  // déjà épuisé par les petits plans avant même d'avoir eu leur propre
  // chance à leur vraie cote cible, un jour riche en matchs. Aucun log
  // d'échec ici : ne pas atteindre 3 fiches est le cas normal, pas une
  // anomalie à signaler comme le tour 1.
  for (let tour = 2; tour <= MAX_FICHES_PAR_PLAN; tour++) {
    for (const plan of plans) {
      if (!planEncoreActif[plan.rank]) continue; // déjà échoué à un tour précédent : le pool ne peut que s'être appauvri davantage
      const ok = await tenterEtPublier(plan, false);
      if (ok) fichesPublieesParPlan[plan.rank]++;
      else planEncoreActif[plan.rank] = false;
    }
  }

  logFinal();
  return {
    statusCode: 200,
    body: `Terminé. ${stats.fichesPubliees} fiche(s) publiée(s) pour ${dateCible}.`
  };
}

module.exports.handler = handler;
module.exports.config = config;

// ============================================================================
// EXPORTS RÉUTILISABLES (26/08) — pour bot-generate-tickets-manual.js, la
// génération manuelle depuis le panneau admin. Exports purement ADDITIFS :
// rien n'est retiré ni modifié dans le comportement du handler cron
// ci-dessus, qui reste le SEUL point d'entrée déclenché automatiquement.
// Objectif : une seule et même logique de marché (extraireMarchesFoot,
// construireFiche...) pour le bot ET la génération manuelle — jamais deux
// copies qui pourraient diverger silencieusement au fil des ajustements.
// ============================================================================
module.exports.verifierConfigSupabase = verifierConfigSupabase;
module.exports.sbSelect = sbSelect;
module.exports.sbInsert = sbInsert;
module.exports.sbDelete = sbDelete;
module.exports.partsHaiti = partsHaiti;
module.exports.heureHaitiDuMatch = heureHaitiDuMatch;
module.exports.resetStats = resetStats;
module.exports.stats = stats;
module.exports.apiSportsGetRaw = apiSportsGetRaw;
module.exports.apiSportsGet = apiSportsGet;
module.exports.recupererFixturesJour = recupererFixturesJour;
module.exports.recupererCoteParFixture = recupererCoteParFixture;
module.exports.extraireMarchesFoot = extraireMarchesFoot;
module.exports.extraireMarchesBSD = extraireMarchesBSD;
module.exports.construireFiche = construireFiche;
module.exports.construireFicheScoreExact = construireFicheScoreExact;
module.exports.publierFiche = publierFiche;
module.exports.ALLOWED_LEAGUES_FOOT = ALLOWED_LEAGUES_FOOT;
module.exports.TOP_LEAGUES_FOOT = TOP_LEAGUES_FOOT;
module.exports.TZ_HAITI = TZ_HAITI;
module.exports.API_SPORTS_KEY = API_SPORTS_KEY;
module.exports.recupererFiabiliteMarches = recupererFiabiliteMarches;
module.exports.annoterPoolAvecFiabilite = annoterPoolAvecFiabilite;
module.exports.annoterPoolAvecBSD = annoterPoolAvecBSD;
// Exports ajoutés (28/08 v5, conversion en fonction Background) — pour que
// bot-diagnostics.js (fonction normale, synchrone, séparée) puisse
// reconstruire tous les modes ?diag=... sans dupliquer une seule ligne de
// logique. Rien n'est retiré ni modifié dans le comportement du handler
// ci-dessus, purement additif.
module.exports.filtrerCandidatsJour = filtrerCandidatsJour;
module.exports.recupererLigues = recupererLigues;
module.exports.recupererEquipes = recupererEquipes;
module.exports.recupererEvenementsBSD = recupererEvenementsBSD;
module.exports.trouverEvenementBSD = trouverEvenementBSD;
module.exports.diagnostiquerBBSD = diagnostiquerBBSD;
module.exports.diagnostiquerNBA = diagnostiquerNBA;
module.exports.diagnostiquerBasket = diagnostiquerBasket;
module.exports.diagnostiquerBasketStats = diagnostiquerBasketStats;
module.exports.FOOT_HOST = FOOT_HOST;
module.exports.NBA_HOST = NBA_HOST;
module.exports.BASKET_HOST = BASKET_HOST;
module.exports.BSD_API_KEY = BSD_API_KEY;
module.exports.BBS_API_KEY = BBS_API_KEY;
module.exports.BOOKMAKER_ID = BOOKMAKER_ID;
module.exports.dateCibleDemainHaiti = dateCibleDemainHaiti;
module.exports.attendre = attendre;
module.exports.sbRpc = sbRpc;
module.exports.verifierEtIncrementerQuota = verifierEtIncrementerQuota;
module.exports.enregistrerQuotaReel = enregistrerQuotaReel;
// Getter, pas la valeur brute (29/08) : un export direct de la variable
// capturerait sa valeur au moment du require() (toujours false), jamais
// mise à jour ensuite — le getter, lui, lit la valeur réelle à chaque appel.
module.exports.getQuotaInterneEpuise = () => quotaInterneEpuise;
module.exports.QUOTA_MAX_JOUR = QUOTA_MAX_JOUR;
