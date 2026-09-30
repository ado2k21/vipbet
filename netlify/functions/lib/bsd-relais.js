'use strict';
/**
 * ============================================================================
 * RELAIS BSD (Bzzoiro Sports Data) — FOOTBALL UNIQUEMENT
 * Fichier : netlify/functions/lib/bsd-relais.js
 * ----------------------------------------------------------------------------
 * RÔLE : quand API-Sports est suspendu ou n'a plus de quota, /fixtures échoue
 * et le générateur s'arrêtait net (« Aucun match disponible »). Ce module
 * fournit alors la liste des matchs depuis BSD, convertie AU FORMAT
 * API-SPORTS — le reste du pipeline (filtres, marchés BSD, construction et
 * publication des fiches) est exactement le même qu'avant.
 *
 * ADDITIF : aucun code de ce module n'est appelé tant qu'API-Sports répond.
 * Pur et testable : aucun état global, `fetch` injectable.
 *
 * IDENTIFIANTS : un match BSD d'id N est stocké dans ticket_legs.fixture_id
 * sous la forme -N (entier négatif). Les ids API-Sports sont positifs, donc
 * aucune collision ; le règlement reconnaît ainsi une sélection BSD.
 * (Le basket utilise aussi des ids négatifs pour The Odds API, mais le
 * règlement les distingue par le sport de la fiche.)
 *
 * NE JAMAIS DEVINER : championnat inconnu → ligue.id null → le match est
 * simplement écarté (et listé dans stats.championnatsVus pour calibrage).
 * ============================================================================
 */

const HOTE_DEFAUT = 'sports.bzzoiro.com';
const PAGE_TAILLE = 200;      // max documenté par BSD
const PAGES_MAX = 10;         // borne dure : 2000 évènements
const TIMEOUT_MS = 20000;

// ---------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------
function normaliser(s) {
  return String(s == null ? '' : s)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Correspondance championnat BSD -> id API-Sports (celui de ALLOWED_LEAGUES_FOOT)
// Nom EXACT (normalisé) + pays. Les compétitions continentales acceptent tout
// pays (BSD peut écrire Europe / World / International...). Prudent : dans le
// doute, pas de correspondance (le match est écarté, jamais un faux
// championnat affiché à l'utilisateur).
// ---------------------------------------------------------------------------
const PAYS = {
  angleterre: ['england', 'united kingdom', 'uk'],
  espagne: ['spain'],
  italie: ['italy'],
  allemagne: ['germany'],
  france: ['france'],
  bresil: ['brazil', 'brasil'],
  argentine: ['argentina'],
  portugal: ['portugal'],
  paysbas: ['netherlands', 'holland', 'the netherlands'],
  turquie: ['turkey', 'turkiye'],
  arabie: ['saudi arabia', 'saudi-arabia'],
  suede: ['sweden'],
  usa: ['usa', 'united states', 'united states of america', 'us'],
  mexique: ['mexico'],
  belgique: ['belgium'],
  colombie: ['colombia'],
  qatar: ['qatar']
};
const CONTINENTAL = null; // n'importe quel pays

const LIGUES = [
  { id: 39,  noms: ['premier league'], pays: PAYS.angleterre },
  { id: 40,  noms: ['championship', 'efl championship'], pays: PAYS.angleterre },
  { id: 48,  noms: ['efl cup', 'carabao cup', 'league cup'], pays: PAYS.angleterre },
  { id: 140, noms: ['la liga', 'laliga', 'primera division', 'laliga ea sports'], pays: PAYS.espagne },
  { id: 141, noms: ['segunda division', 'la liga 2', 'laliga 2', 'laliga hypermotion'], pays: PAYS.espagne },
  { id: 135, noms: ['serie a'], pays: PAYS.italie },
  { id: 136, noms: ['serie b'], pays: PAYS.italie },
  { id: 78,  noms: ['bundesliga'], pays: PAYS.allemagne },
  { id: 79,  noms: ['2 bundesliga', 'bundesliga 2'], pays: PAYS.allemagne },
  { id: 61,  noms: ['ligue 1'], pays: PAYS.france },
  { id: 62,  noms: ['ligue 2'], pays: PAYS.france },
  { id: 71,  noms: ['serie a', 'brasileirao', 'brasileirao serie a'], pays: PAYS.bresil },
  { id: 128, noms: ['liga profesional', 'liga profesional argentina', 'liga profesional de futbol', 'primera division'], pays: PAYS.argentine },
  { id: 94,  noms: ['primeira liga', 'liga portugal'], pays: PAYS.portugal },
  { id: 95,  noms: ['segunda liga', 'liga portugal 2'], pays: PAYS.portugal },
  { id: 88,  noms: ['eredivisie'], pays: PAYS.paysbas },
  { id: 89,  noms: ['eerste divisie', 'keuken kampioen divisie'], pays: PAYS.paysbas },
  { id: 203, noms: ['super lig', 'trendyol super lig'], pays: PAYS.turquie },
  { id: 307, noms: ['saudi pro league', 'pro league', 'roshn saudi league'], pays: PAYS.arabie },
  { id: 113, noms: ['allsvenskan'], pays: PAYS.suede },
  { id: 253, noms: ['mls', 'major league soccer'], pays: PAYS.usa },
  { id: 262, noms: ['liga mx'], pays: PAYS.mexique },
  { id: 144, noms: ['pro league', 'jupiler pro league', 'first division a'], pays: PAYS.belgique },
  { id: 145, noms: ['challenger pro league'], pays: PAYS.belgique },
  { id: 239, noms: ['primera a', 'liga betplay'], pays: PAYS.colombie },
  { id: 305, noms: ['stars league', 'qatar stars league'], pays: PAYS.qatar },
  { id: 2,   noms: ['uefa champions league', 'champions league'], pays: CONTINENTAL },
  { id: 3,   noms: ['uefa europa league', 'europa league'], pays: CONTINENTAL },
  { id: 848, noms: ['uefa europa conference league', 'uefa conference league', 'conference league'], pays: CONTINENTAL },
  { id: 13,  noms: ['copa libertadores', 'conmebol libertadores', 'libertadores'], pays: CONTINENTAL }
];

// Retourne l'id API-Sports du championnat, ou null (jamais deviné).
function idLigueAPISports(league) {
  if (!league || typeof league !== 'object') return null;
  if (league.is_women === true) return null;
  const nom = normaliser(league.name);
  if (!nom) return null;
  const pays = normaliser(league.country);
  for (const l of LIGUES) {
    if (!l.noms.includes(nom)) continue;
    if (l.pays === CONTINENTAL) return l.id;
    if (pays && l.pays.includes(pays)) return l.id;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Statuts BSD
// ---------------------------------------------------------------------------
function statutNormalise(s) { return normaliser(s).replace(/ /g, ''); }
const NON_COMMENCE = ['notstarted', 'scheduled', 'ns', 'upcoming', 'pending'];
const TERMINE = ['finished', 'ft', 'ended', 'fulltime', 'aftermatch'];
const ANNULE = ['cancelled', 'canceled', 'abandoned', 'walkover', 'awarded'];
const REPORTE = ['postponed'];

function nonCommence(ev) { return !!ev && NON_COMMENCE.includes(statutNormalise(ev.status)); }

// ---------------------------------------------------------------------------
// Évènement BSD -> fixture au format API-Sports (celui de recupererFixturesJour)
// ---------------------------------------------------------------------------
function evenementBSDVersFixture(ev) {
  if (!ev || !Number.isSafeInteger(ev.id) || ev.id <= 0) return null;
  if (!ev.home_team || !ev.away_team || !ev.event_date) return null;
  const t = Date.parse(ev.event_date);
  if (!isFinite(t)) return null;
  if (!nonCommence(ev)) return null;
  const lg = ev.league || {};
  return {
    fixture: { id: -ev.id, date: ev.event_date, status: { short: 'NS' } },
    league: { id: idLigueAPISports(lg), name: lg.name || '?', country: lg.country || null },
    teams: { home: { id: null, name: String(ev.home_team) }, away: { id: null, name: String(ev.away_team) } }
  };
}

// ---------------------------------------------------------------------------
// Accès réseau BSD
// ---------------------------------------------------------------------------
function jourSuivant(dateIso) {
  const d = new Date(dateIso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

async function getJson(url, cle, fetchFn) {
  const f = fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!f) throw new Error('fetch indisponible');
  const opts = { headers: { Authorization: `Token ${cle}` } };
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) opts.signal = AbortSignal.timeout(TIMEOUT_MS);
  const resp = await f(url, opts);
  if (!resp.ok) { const e = new Error(`BSD HTTP ${resp.status}`); e.statut = resp.status; throw e; }
  return resp.json();
}

// URL « next » : n'est suivie que si elle reste sur l'hôte BSD en https
// (la clé ne doit JAMAIS partir vers un autre domaine).
function urlSuivanteSure(next, hote) {
  if (!next || typeof next !== 'string') return null;
  try {
    const u = new URL(next);
    if (u.protocol !== 'https:' || u.hostname !== hote) return null;
    return u.toString();
  } catch (e) { return null; }
}

// Parcourt la liste paginée. Retourne { evenements, pages, erreur }.
async function parcourirEvenements(urlDebut, o) {
  const evenements = [];
  let url = urlDebut, pages = 0, erreur = null;
  while (url && pages < (o.pagesMax || PAGES_MAX)) {
    let data;
    try { data = await getJson(url, o.cle, o.fetchFn); }
    catch (e) { erreur = e.message; break; }
    pages++;
    const liste = Array.isArray(data) ? data : (data && Array.isArray(data.results) ? data.results : []);
    liste.forEach(x => evenements.push(x));
    url = Array.isArray(data) ? null : urlSuivanteSure(data && data.next, o.hote);
  }
  return { evenements, pages, erreur };
}

function dansFenetre(ev, dateCible) {
  const t = Date.parse(ev && ev.event_date);
  if (!isFinite(t)) return false;
  const debut = Date.parse(dateCible + 'T00:00:00Z');
  const fin = Date.parse(jourSuivant(jourSuivant(dateCible)) + 'T00:00:00Z');
  return t >= debut && t < fin; // large (UTC) ; le filtre exact Haïti est fait ensuite par filtrerCandidatsJour
}

// ---------------------------------------------------------------------------
// Matchs du jour pour la GÉNÉRATION
// Retourne { fixtures, evenements, pages, mode, erreur, total }
//  - fixtures   : au format API-Sports (statut NS uniquement)
//  - evenements : évènements BSD bruts (cotes incluses) de la même fenêtre
// ---------------------------------------------------------------------------
async function recupererFixturesRelais(o) {
  const hote = o.hote || HOTE_DEFAUT;
  const base = { cle: o.cle, fetchFn: o.fetchFn, hote, pagesMax: o.pagesMax };
  const sortie = { fixtures: [], evenements: [], pages: 0, mode: null, erreur: null, total: 0 };
  if (!o.cle) { sortie.erreur = 'BSD_API_KEY absente'; return sortie; }
  const d = o.dateCible;

  // Essai 1 : filtre de dates (ignoré sans erreur si BSD ne le connaît pas).
  const essais = [
    { mode: 'date_from/date_to', url: `https://${hote}/api/events/?limit=${PAGE_TAILLE}&date_from=${d}&date_to=${jourSuivant(d)}` },
    { mode: 'pagination simple', url: `https://${hote}/api/events/?limit=${PAGE_TAILLE}` }
  ];
  for (const essai of essais) {
    const r = await parcourirEvenements(essai.url, base);
    sortie.pages += r.pages;
    sortie.total = r.evenements.length;
    if (r.erreur) sortie.erreur = r.erreur;
    const fenetre = r.evenements.filter(ev => dansFenetre(ev, d));
    if (fenetre.length) {
      sortie.mode = essai.mode;
      sortie.erreur = null;
      sortie.evenements = fenetre;
      break;
    }
  }
  const vus = new Set();
  sortie.evenements.forEach(ev => {
    const f = evenementBSDVersFixture(ev);
    if (f && !vus.has(f.fixture.id)) { vus.add(f.fixture.id); sortie.fixtures.push(f); }
  });
  return sortie;
}

// ---------------------------------------------------------------------------
// Résultat d'un match BSD pour le RÈGLEMENT.
// Retourne null tant que le résultat n'est pas SÛR (jamais deviné) :
//  { statut:'FT', golHome, golAway, scoreFiable:true }  match terminé en 90 min
//  { statut:'CANC'|'PST' }                              annulé / reporté
// Prolongation / tirs au but (score 90 min incertain) → null (reste en attente).
// ---------------------------------------------------------------------------
function resultatDepuisEvenementBSD(ev) {
  if (!ev) return null;
  const st = statutNormalise(ev.status);
  if (ANNULE.includes(st)) return { statut: 'CANC' };
  if (REPORTE.includes(st)) return { statut: 'PST' };
  if (!TERMINE.includes(st)) return null;
  const periode = statutNormalise(ev.period);
  if (['aet', 'ap', 'pen', 'et', 'extratime', 'penalties'].includes(periode)) return null;
  if (ev.penalty_shootout) return null;
  const et = ev.extra_time_score;
  if (et !== null && et !== undefined && et !== '' && !(typeof et === 'object' && !Object.keys(et).length)) return null;
  const h = ev.home_score, a = ev.away_score;
  if (h === null || h === undefined || a === null || a === undefined || h === '' || a === '') return null;
  const gh = Number(h), ga = Number(a);
  if (!Number.isInteger(gh) || !Number.isInteger(ga) || gh < 0 || ga < 0) return null;
  return { statut: 'FT', golHome: gh, golAway: ga, scoreFiable: true };
}

// Un match par id : détail /api/events/{id}/ (peut ne pas exister → null).
async function recupererEvenementParId(o) {
  const hote = o.hote || HOTE_DEFAUT;
  if (!o.cle || !Number.isSafeInteger(o.id) || o.id <= 0) return null;
  try {
    const data = await getJson(`https://${hote}/api/events/${o.id}/`, o.cle, o.fetchFn);
    return data && data.id === o.id ? data : null;
  } catch (e) { return null; }
}

// Repli : parcourt la liste d'une date et indexe par id. Map id -> évènement.
async function recupererEvenementsParDate(o) {
  const hote = o.hote || HOTE_DEFAUT;
  const d = o.dateIso;
  const r = await parcourirEvenements(
    `https://${hote}/api/events/?limit=${PAGE_TAILLE}&date_from=${d}&date_to=${jourSuivant(d)}`,
    { cle: o.cle, fetchFn: o.fetchFn, hote, pagesMax: o.pagesMax });
  const carte = new Map();
  r.evenements.forEach(ev => { if (ev && Number.isSafeInteger(ev.id)) carte.set(ev.id, ev); });
  return { carte, erreur: r.erreur, pages: r.pages };
}

// ---------------------------------------------------------------------------
// Appariement STRICT d'une sélection API-Sports (sans id BSD) avec un match BSD.
// Sert au règlement de secours quand API-Sports est indisponible.
// JAMAIS d'approximation : les DEUX équipes doivent avoir exactement le même
// nom (après normalisation : accents, ponctuation, suffixe « FC/CF/SC/AFC »),
// dans le même sens (domicile/extérieur), l'heure de coup d'envoi doit être à
// moins de `toleranceMs`, et UN SEUL match BSD doit correspondre. Sinon : null
// (la sélection reste en attente). « Real Sociedad II » ≠ « Real Sociedad ».
// ---------------------------------------------------------------------------
function nomStrict(nom) {
  return normaliser(nom).split(' ').filter(m => m && !['fc', 'cf', 'sc', 'afc'].includes(m)).join(' ');
}
function trouverEvenementParNoms(o) {
  const dom = nomStrict(o.home), ext = nomStrict(o.away);
  const t0 = Date.parse(o.kickoffIso);
  if (!dom || !ext || !isFinite(t0)) return null;
  const tol = o.toleranceMs == null ? 3 * 3600 * 1000 : o.toleranceMs;
  const trouves = (o.evenements || []).filter(ev => {
    if (!ev || !Number.isSafeInteger(ev.id)) return false;
    if (nomStrict(ev.home_team) !== dom || nomStrict(ev.away_team) !== ext) return false;
    const t = Date.parse(ev.event_date);
    return isFinite(t) && Math.abs(t - t0) <= tol;
  });
  if (trouves.length !== 1) return null; // aucun, ou ambigu
  return trouves[0];
}

module.exports = {
  nomStrict,
  trouverEvenementParNoms,
  normaliser,
  idLigueAPISports,
  evenementBSDVersFixture,
  recupererFixturesRelais,
  resultatDepuisEvenementBSD,
  recupererEvenementParId,
  recupererEvenementsParDate,
  jourSuivant,
  PAGES_MAX
};
