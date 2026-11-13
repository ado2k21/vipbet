'use strict';
/**
 * VIP BETCOTE — APPRENTISSAGE DU BOT BASKET (14/11, accord de James).
 *
 * 1. SEGMENTS : chaque selection basket est rangee par type de pari et tranche de cote :
 *      V = victoire, P = plus de X points, M = moins de X points
 *      tranches 1.19-1.29 / 1.30-1.49 / 1.50-1.69 / 1.70-1.99 / 2.00+
 *    ex. « V|1.30-1.49 ». Tous championnats confondus : assez de resultats pour apprendre
 *    (par championnat, la plupart n'ont que 1 a 5 resultats).
 *
 * 2. CALIBRATION : pour chaque segment, on compare la reussite REELLE a la reussite
 *    annoncee par la cote (1/cote). facteur = reussite reelle / annoncee, lisse vers le
 *    facteur global (jamais un facteur extreme sur 3 resultats). Le bot multiplie sa
 *    probabilite par ce facteur pour choisir ses selections. Un segment qui perd nettement
 *    plus que sa cote (assez de resultats ET facteur < SEUIL_EXCLUSION) est ecarte.
 *
 * 3. JOURNAL (table basket_journal) : toutes les selections envisagees (choisies ou non)
 *    avec leur resultat reel -> l'apprentissage progresse vite, chaque jour.
 *
 * Tout est NON BLOQUANT : table absente, erreur reseau... -> le bot fait exactement
 * comme avant (facteur fixe 0,91, aucune exclusion).
 */

const TRANCHES = [
  { min: 0, max: 1.30, nom: '1.19-1.29' },
  { min: 1.30, max: 1.50, nom: '1.30-1.49' },
  { min: 1.50, max: 1.70, nom: '1.50-1.69' },
  { min: 1.70, max: 2.00, nom: '1.70-1.99' },
  { min: 2.00, max: 99, nom: '2.00+' }
];

const FACTEUR_DEFAUT = 0.91;      // ancien facteur fixe du bot (reussite observee / annoncee)
const K_GLOBAL = 50;              // lissage du facteur global vers FACTEUR_DEFAUT
const K_SEGMENT = 20;             // lissage du facteur d'un segment vers le facteur global
const FACTEUR_MIN = 0.70, FACTEUR_MAX = 1.15;
const SEUIL_EXCLUSION = 0.85;     // segment ecarte si facteur lisse < 0,85...
const MIN_RESULTATS_EXCLUSION = 15; // ...ET au moins 15 resultats dans ce segment
const JOURS_HISTORIQUE = 120;

function typePari(market, pick) {
  if (market === 'mk_basket_1x2') return 'V';
  if (market === 'mk_basket_total') return /^Moins/i.test(String(pick || '')) ? 'M' : 'P';
  return null;
}
function tranche(odd) {
  const o = Number(odd);
  if (!Number.isFinite(o)) return null;
  const t = TRANCHES.find(x => o >= x.min && o < x.max);
  return t ? t.nom : null;
}
function segment(market, pick, odd) {
  const ty = typePari(market, pick), tr = tranche(odd);
  return ty && tr ? `${ty}|${tr}` : null;
}
function ligneDuPick(pick) {
  const m = /([\d.]+)\s*points/i.exec(String(pick || ''));
  return m ? parseFloat(m[1]) : null;
}
const borne = (x, a, b) => Math.min(b, Math.max(a, x));

// lignes : [{ play_date, game_id, market, pick, odd, result }] (won/lost seulement comptent).
// Doublons (meme jour + match + marche + choix) comptes UNE fois.
function calculerCalibration(lignes) {
  const vus = new Set();
  const parSeg = new Map();
  let N = 0, W = 0, P = 0;
  (lignes || []).forEach(l => {
    if (l.result !== 'won' && l.result !== 'lost') return;
    const odd = Number(l.odd);
    if (!(odd > 1)) return;
    const cle = `${l.play_date}|${l.game_id}|${l.market}|${l.pick}`;
    if (vus.has(cle)) return;
    vus.add(cle);
    const seg = segment(l.market, l.pick, odd);
    if (!seg) return;
    const s = parSeg.get(seg) || { n: 0, w: 0, p: 0 };
    s.n++; s.p += 1 / odd; if (l.result === 'won') s.w++;
    parSeg.set(seg, s);
    N++; P += 1 / odd; if (l.result === 'won') W++;
  });
  // Facteur global, lisse vers l'ancien facteur fixe.
  const global = P > 0 ? borne((W + K_GLOBAL * FACTEUR_DEFAUT * (P / N)) / (N + K_GLOBAL) / (P / N), FACTEUR_MIN, FACTEUR_MAX) : FACTEUR_DEFAUT;
  const segments = {};
  parSeg.forEach((s, seg) => {
    const pMoy = s.p / s.n;
    const facteur = borne((s.w + K_SEGMENT * global * pMoy) / (s.n + K_SEGMENT) / pMoy, FACTEUR_MIN, FACTEUR_MAX);
    segments[seg] = {
      n: s.n, gagnes: s.w,
      reussite: Math.round(1000 * s.w / s.n) / 10,
      annoncee: Math.round(1000 * pMoy) / 10,
      facteur: Math.round(facteur * 10000) / 10000,
      exclu: s.n >= MIN_RESULTATS_EXCLUSION && facteur < SEUIL_EXCLUSION
    };
  });
  return { global: Math.round(global * 10000) / 10000, resultats: N, segments };
}

// Annote chaque selection du pool : b.segment, b.facteurSegment, b.segmentExclu.
function appliquerCalibration(pool, calib) {
  (pool || []).forEach(b => {
    b.segment = segment(b.market, b.pick, b.odd);
    const s = calib && b.segment ? calib.segments[b.segment] : null;
    b.facteurSegment = s ? s.facteur : (calib ? calib.global : FACTEUR_DEFAUT);
    b.segmentExclu = !!(s && s.exclu);
  });
  return pool;
}

// ---------------------------------------------------------------------------
// Acces base (REST Supabase, cle service_role) — autonome, jamais bloquant.
// ---------------------------------------------------------------------------
function cfg() {
  const url = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && cle ? { url: url.replace(/\/$/, ''), cle } : null;
}
function entetes(c, extra) {
  return Object.assign({ apikey: c.cle, Authorization: `Bearer ${c.cle}`, 'Content-Type': 'application/json' }, extra || {});
}
async function lire(table, requete) {
  const c = cfg(); if (!c) throw new Error('configuration Supabase absente');
  const r = await fetch(`${c.url}/rest/v1/${table}?${requete}`, { headers: entetes(c) });
  if (!r.ok) throw new Error(`lecture ${table} → HTTP ${r.status}`);
  return r.json();
}
async function ecrire(table, lignes, onConflict, fusion) {
  const c = cfg(); if (!c) throw new Error('configuration Supabase absente');
  if (!lignes.length) return;
  const r = await fetch(`${c.url}/rest/v1/${table}?on_conflict=${onConflict}`, {
    method: 'POST',
    headers: entetes(c, { Prefer: `resolution=${fusion ? 'merge' : 'ignore'}-duplicates,return=minimal` }),
    body: JSON.stringify(lignes)
  });
  if (!r.ok) throw new Error(`ecriture ${table} → HTTP ${r.status} : ${(await r.text()).slice(0, 200)}`);
}
async function modifier(table, filtre, champs) {
  const c = cfg(); if (!c) throw new Error('configuration Supabase absente');
  const r = await fetch(`${c.url}/rest/v1/${table}?${filtre}`, {
    method: 'PATCH', headers: entetes(c, { Prefer: 'return=minimal' }), body: JSON.stringify(champs)
  });
  if (!r.ok) throw new Error(`maj ${table} → HTTP ${r.status}`);
}
function dateMoinsJours(jours) {
  return new Date(Date.now() - jours * 86400000).toISOString().slice(0, 10);
}

// Calibration a partir du journal + des selections basket publiees (avant le journal).
// erreurs : tableau ou pousser les incidents (jamais d'exception).
async function lireCalibration(erreurs) {
  const depuis = dateMoinsJours(JOURS_HISTORIQUE);
  let lignes = [];
  try {
    const j = await lire('basket_journal',
      `select=play_date,game_id,market,pick,odd,result&result=in.(won,lost)&play_date=gte.${depuis}&limit=20000`);
    lignes = lignes.concat(j);
  } catch (e) { if (erreurs) erreurs.push(`apprentissage: journal illisible (${e.message})`); }
  try {
    const legs = await lire('ticket_legs',
      `select=fixture_id,market,pick,odd,result,tickets!inner(play_date,sport)&tickets.sport=eq.basket&tickets.play_date=gte.${depuis}&result=in.(won,lost)&limit=5000`);
    legs.forEach(l => lignes.push({
      play_date: l.tickets && l.tickets.play_date, game_id: l.fixture_id, market: l.market, pick: l.pick, odd: l.odd, result: l.result
    }));
  } catch (e) { if (erreurs) erreurs.push(`apprentissage: fiches publiees illisibles (${e.message})`); }
  if (!lignes.length) return null;
  return calculerCalibration(lignes);
}

// Journalise TOUT le pool du jour (choisies ou non). Jamais bloquant.
function lignesJournal(pool, dateCible, noms) {
  const parPari = new Map(); // autre cote du meme pari (meme match + marche + ligne)
  pool.forEach(b => {
    const k = `${b.gameId}|${b.market}|${b.market === 'mk_basket_total' ? ligneDuPick(b.pick) : ''}`;
    if (!parPari.has(k)) parPari.set(k, []);
    parPari.get(k).push(b);
  });
  const vus = new Set();
  const lignes = [];
  pool.forEach(b => {
    const cle = `${b.gameId}|${b.market}|${b.pick}`;
    if (vus.has(cle) || !(b.odd > 1)) return;
    vus.add(cle);
    const k = `${b.gameId}|${b.market}|${b.market === 'mk_basket_total' ? ligneDuPick(b.pick) : ''}`;
    const autre = (parPari.get(k) || []).find(x => x.pick !== b.pick);
    lignes.push({
      play_date: dateCible, game_id: b.gameId, market: b.market, pick: b.pick,
      league: b.league || null, league_country: b.leagueCountry || null,
      match_label: (noms && noms[b.gameId] && noms[b.gameId].label) || null,
      kickoff_at: b.kickoffUtc || null,
      odd: b.odd, odd_autre: autre ? autre.odd : null,
      segment: b.segment || segment(b.market, b.pick, b.odd) || 'inconnu',
      ligne: b.market === 'mk_basket_total' ? ligneDuPick(b.pick) : null,
      projection_total: Number.isFinite(b.projectionTotal) ? Math.round(b.projectionTotal) : null,
      projection_confirmee: b.market === 'mk_basket_total' ? !!b.projectionConfirmee : null,
      score_fiabilite: Number.isFinite(b.scoreFiabilite) ? Math.round(b.scoreFiabilite * 10000) / 10000 : null,
      facteur_segment: Number.isFinite(b.facteurSegment) ? b.facteurSegment : null
    });
  });
  return lignes;
}
async function journaliserPool(pool, dateCible, noms, erreurs) {
  try {
    const lignes = lignesJournal(pool || [], dateCible, noms);
    for (let i = 0; i < lignes.length; i += 200) await ecrire('basket_journal', lignes.slice(i, i + 200), 'play_date,game_id,market,pick', true);
    return lignes.length;
  } catch (e) { if (erreurs) erreurs.push(`journal basket: ${e.message}`); return 0; }
}
async function marquerChoisies(selections, dateCible, ticketId, erreurs) {
  try {
    for (const s of selections || []) {
      await modifier('basket_journal',
        `play_date=eq.${dateCible}&game_id=eq.${s.gameId}&market=eq.${encodeURIComponent(s.market)}&pick=eq.${encodeURIComponent(s.pick)}`,
        { choisie: true, ticket_id: ticketId || null });
    }
  } catch (e) { if (erreurs) erreurs.push(`journal basket (choix): ${e.message}`); }
}

// Regle les lignes du journal d'une date avec les scores deja recus par le calcul.
// parGame : id -> { statut, ptsHome, ptsAway } ; evaluer(leg, h, a) -> 'won'|'lost'|null.
async function reglerJournalDate(dateIso, parGame, termines, annules, evaluer, erreurs) {
  let lignes;
  try {
    lignes = await lire('basket_journal', `select=game_id,market,pick&play_date=eq.${dateIso}&result=is.null&limit=2000`);
  } catch (e) { return 0; } // table absente : rien a faire
  let n = 0;
  for (const l of lignes) {
    const info = parGame[l.game_id];
    if (!info) continue;
    let res = null;
    if (termines.includes(info.statut) && info.ptsHome != null && info.ptsAway != null) res = evaluer({ market: l.market, pick: l.pick }, info.ptsHome, info.ptsAway);
    else if (annules.includes(info.statut)) res = 'void';
    if (!res) continue;
    try {
      await modifier('basket_journal',
        `play_date=eq.${dateIso}&game_id=eq.${l.game_id}&market=eq.${encodeURIComponent(l.market)}&pick=eq.${encodeURIComponent(l.pick)}`,
        { result: res, points_home: info.ptsHome, points_away: info.ptsAway, settled_at: new Date().toISOString() });
      n++;
    } catch (e) { if (erreurs) erreurs.push(`journal basket (resultat): ${e.message}`); break; }
  }
  return n;
}
// Dates recentes (hier et avant-hier) qui ont encore des lignes sans resultat.
async function datesJournalARegler() {
  try {
    const l = await lire('basket_journal', `select=play_date,game_id&result=is.null&play_date=gte.${dateMoinsJours(3)}&play_date=lt.${dateMoinsJours(0)}&limit=2000`);
    const parDate = new Map();
    l.forEach(x => { if (!parDate.has(x.play_date)) parDate.set(x.play_date, new Set()); parDate.get(x.play_date).add(Number(x.game_id)); });
    return parDate;
  } catch (e) { return new Map(); }
}

// Historique des points (tous les matchs termines du jour, sans appel API en plus) pour la
// projection des totaux. Ne touche jamais un match deja enregistre (box-score complet).
async function enregistrerPointsMatchs(dateIso, parGame, termines, exclus, erreurs) {
  const lignes = [];
  Object.keys(parGame).forEach(id => {
    const g = parGame[id];
    const gid = Number(id);
    if (!(gid > 0) || (exclus && exclus.has(gid))) return;
    if (!termines.includes(g.statut) || g.ptsHome == null || g.ptsAway == null || g.teamHomeId == null || g.teamAwayId == null) return;
    lignes.push({ game_id: gid, team_id: g.teamHomeId, opponent_id: g.teamAwayId, is_home: true, points_for: g.ptsHome, points_against: g.ptsAway, game_date: dateIso });
    lignes.push({ game_id: gid, team_id: g.teamAwayId, opponent_id: g.teamHomeId, is_home: false, points_for: g.ptsAway, points_against: g.ptsHome, game_date: dateIso });
  });
  try {
    for (let i = 0; i < lignes.length; i += 200) await ecrire('basket_team_game_stats', lignes.slice(i, i + 200), 'game_id,team_id', false);
    return lignes.length / 2;
  } catch (e) { if (erreurs) erreurs.push(`historique points basket: ${e.message}`); return 0; }
}
// Lecture de cet historique (45 derniers jours) pour les profils d'equipes.
async function lireHistoriquePoints(dateCible, jours, erreurs) {
  try {
    const depuis = new Date(Date.parse(dateCible + 'T00:00:00Z') - (jours || 45) * 86400000).toISOString().slice(0, 10);
    return await lire('basket_team_game_stats',
      `select=game_id,team_id,is_home,points_for,points_against,game_date&game_date=gte.${depuis}&game_date=lt.${dateCible}&limit=20000`);
  } catch (e) { if (erreurs) erreurs.push(`historique points basket (lecture): ${e.message}`); return []; }
}

module.exports = {
  TRANCHES, FACTEUR_DEFAUT, SEUIL_EXCLUSION, MIN_RESULTATS_EXCLUSION,
  typePari, tranche, segment, ligneDuPick, calculerCalibration, appliquerCalibration,
  lireCalibration, lignesJournal, journaliserPool, marquerChoisies,
  reglerJournalDate, datesJournalARegler, enregistrerPointsMatchs, lireHistoriquePoints
};
