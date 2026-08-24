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
 * fenêtre (20h00–22h59 UTC, qui couvre 17h00 Haïti quel que soit le
 * décalage) et ne génère RÉELLEMENT qu'au quart d'heure où il est
 * effectivement 17h00 en Haïti. Une vérification en base empêche toute
 * double génération si le cron se déclenche plusieurs fois dans la fenêtre.
 * ============================================================================
 */

// PAS de dépendance @supabase/supabase-js : ce paquet n'est pas déclaré dans
// le package.json du repo (les autres fonctions Netlify du site parlent à
// Supabase en fetch() direct sur l'API REST). On fait pareil ici pour éviter
// tout échec de build lié à une dépendance manquante.

export const config = {
  // Toutes les 15 min entre 20h00 et 22h59 UTC — couvre 17h00 Haïti
  // (UTC-4 en heure d'été → 21h00 UTC ; UTC-5 en heure standard → 22h00 UTC)
  schedule: '*/15 20-22 * * *'
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
const BOOKMAKER_ID = 8; // Bet365 — référence large et stable

// Championnats autorisés — grandes premières divisions, plusieurs continents.
// Liste vivante : confirmée/élargie à partir des vrais matchs reçus lors des
// tests (23/08). Volontairement 1ʳᵉ division uniquement — jamais une division
// inférieure (2ᵉ, 3ᵉ, 4ᵉ...) où les données stats/fiabilité sont trop faibles.
const ALLOWED_LEAGUES_FOOT = [
  2, 3,                    // Ligue des champions, Europa League
  39, 40,                  // Premier League, Championship (Angleterre)
  140,                     // La Liga (Espagne)
  135,                     // Serie A (Italie)
  78,                      // Bundesliga (Allemagne)
  61, 62,                  // Ligue 1, Ligue 2 (France)
  88,                      // Eredivisie (Pays-Bas)
  94,                      // Primeira Liga (Portugal)
  71,                      // Serie A (Brésil) — confirmé réel le 23/08
  128,                     // Liga Profesional (Argentine) — confirmé réel le 23/08
  113,                     // Allsvenskan (Suède) — confirmé réel le 23/08
  253,                     // MLS (USA)
  262                      // Liga MX (Mexique)
];
// Exclu volontairement (vu dans les tests, divisions inférieures) :
// 114 Superettan (Suède, 2ᵉ div.), 129 Primera Nacional (Argentine, 2ᵉ div.),
// 132 Primera C (Argentine, 4ᵉ div.)

// Fenêtre horaire football en heure Haïti (règle métier stricte)
const FOOT_MIN_HOUR = 8;   // 08:00 accepté
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
  matchsTrouves: 0,
  matchsRetenus: 0,
  matchsRejetes: 0,
  raisonsRejet: {},
  championnatsVus: {}, // diagnostic : quels league.id/name l'API renvoie réellement
  fichesGenerees: 0,
  fichesPubliees: 0,
  doublonsDetectes: false,
  erreurs: []
};
// BUG CORRIGÉ : sur un conteneur Netlify "chaud" (réutilisé entre deux
// invocations rapprochées), un objet déclaré au niveau du module n'est PAS
// réinitialisé automatiquement — les compteurs s'accumulaient d'un run à
// l'autre. On réinitialise donc explicitement stats en tout début de handler.
function resetStats() {
  stats.demarre = new Date().toISOString();
  stats.dateCible = null;
  stats.matchsTrouves = 0;
  stats.matchsRetenus = 0;
  stats.matchsRejetes = 0;
  stats.raisonsRejet = {};
  stats.championnatsVus = {};
  stats.fichesGenerees = 0;
  stats.fichesPubliees = 0;
  stats.doublonsDetectes = false;
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

async function apiSportsGet(host, path, params) {
  const url = new URL(`https://${host}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString(), {
    headers: { 'x-apisports-key': API_SPORTS_KEY }
  });
  if (!resp.ok) {
    throw new Error(`API-Sports ${host}${path} → HTTP ${resp.status}`);
  }
  const data = await resp.json();
  if (data.errors && Array.isArray(data.errors) ? data.errors.length : Object.keys(data.errors || {}).length) {
    // L'API-Sports renvoie errors:{} ou errors:[] même en cas de succès partiel —
    // on logue sans bloquer, la donnée utile (response) reste exploitable.
    console.warn('[BOT] avertissement API', host, path, JSON.stringify(data.errors));
  }
  return data.response || [];
}

// Une seule requête regroupe cotes + infos de match pour le foot (économe en quota)
async function recupererCotesFoot(dateCible) {
  try {
    return await apiSportsGet(FOOT_HOST, '/odds', { date: dateCible, bookmaker: BOOKMAKER_ID, page: 1 });
  } catch (e) {
    stats.erreurs.push('foot/odds: ' + e.message);
    return [];
  }
}

// Résolution des vrais noms d'équipes — le paramètre groupé "ids" de
// /fixtures est verrouillé sur le plan gratuit (confirmé en test le 23/08 :
// "Free plans do not have access to the Ids parameter"). Alternative gratuite :
// un seul appel /fixtures?date=...&timezone=... (tous les matchs du monde ce
// jour-là, en heure Haïti), puis filtrage local sur les fixtures qui
// nous intéressent. Un seul appel API quel que soit le nombre de matchs.
async function resoudreNomsEquipes(fixtureIds, dateCible) {
  const noms = {};
  if (!fixtureIds.length) return noms;
  const aTrouver = new Set(fixtureIds);
  try {
    const data = await apiSportsGet(FOOT_HOST, '/fixtures', { date: dateCible, timezone: TZ_HAITI });
    data.forEach(f => {
      if (aTrouver.has(f.fixture.id)) {
        noms[f.fixture.id] = {
          label: `${f.teams.home.name} — ${f.teams.away.name}`,
          statut: f.fixture.status.short,
          kickoffUtc: f.fixture.date
        };
      }
    });
  } catch (e) {
    stats.erreurs.push('foot/fixtures(date): ' + e.message);
  }
  return noms;
}

// ============================================================================
// 5. EXTRACTION DES MARCHÉS PERTINENTS (foot)
// ============================================================================

function extraireMarchesFoot(oddsItem, dateCible) {
  const fixture = oddsItem.fixture;
  const league = oddsItem.league;
  if (!fixture || !league) { rejeter('donnees_incompletes'); return []; }
  if (!ALLOWED_LEAGUES_FOOT.includes(league.id)) {
    rejeter('championnat_non_autorise');
    const clef = `${league.id} — ${league.name} (${league.country || '?'})`;
    stats.championnatsVus[clef] = (stats.championnatsVus[clef] || 0) + 1;
    return [];
  }

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

  bets.forEach(betType => {
    // Score exact (id 10) — seulement si probabilité raisonnable (cote 4.0–15.0)
    if (betType.id === 10) {
      let meilleur = null, minCote = 999;
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c < minCote) { minCote = c; meilleur = v; }
      });
      if (meilleur && minCote >= 4.0 && minCote <= 15.0) {
        trouvees.push({
          fixtureId: fixture.id, league: league.name, market: 'mk_score_exact',
          pick: `Score exact : ${meilleur.value}`, odd: minCote, tier: 'EXACT_SCORE',
          kickoffUtc: fixture.date, matchTimeHaiti: h.heure
        });
      }
    }
    // Double chance (id 12) — profil "safe"
    if (betType.id === 12) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.20 && c <= 1.70) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_double_chance',
            pick: `Double chance : ${v.value}`, odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure
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
            fixtureId: fixture.id, league: league.name, market: 'mk_1x2',
            pick: `Victoire : ${v.value}`, odd: c, tier: 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure
          });
        }
      });
    }
    // Total buts (id 5) — safe + exception premium sur Over 2.5
    if (betType.id === 5) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.20 && c <= 1.70 && ['Over 1.5', 'Under 4.5'].includes(v.value)) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_total_buts',
            pick: v.value, odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure
          });
        }
        if (c >= 1.95 && c <= 2.40 && v.value === 'Over 2.5') {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_total_buts',
            pick: 'Plus de 2.5 buts', odd: c, tier: 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure
          });
        }
      });
    }
    // BTTS (id 8, "Both Teams Score") — profil safe/premium selon la cote
    if (betType.id === 8) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (v.value === 'Yes' && c >= 1.20 && c <= 2.20) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_btts',
            pick: 'Les deux équipes marquent : Oui', odd: c,
            tier: c <= 1.70 ? 'SAFE' : 'PREMIUM',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure
          });
        }
      });
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
 */
function construireFiche(pool, plan) {
  const cibleMin = plan.min_total_odd != null ? Number(plan.min_total_odd) : 1.5;
  const cibleMax = plan.max_total_odd != null ? Number(plan.max_total_odd) : 999;
  const maxLeg = plan.max_leg_odd != null ? Number(plan.max_leg_odd) : 2.5;
  const autoriseScoreExact = !!plan.includes_exact_score;

  // CORRIGÉ : ne jamais laisser le hasard piocher une cote faible sur un match
  // alors qu'une meilleure option existe sur ce même match — la règle anti-
  // corrélation (1 seule sélection par match) verrouillerait alors ce match
  // sur la moins bonne option pour toujours. On garde la MEILLEURE cote
  // éligible par match, triée par cote décroissante (déterministe).
  function meilleurParMatch(liste) {
    const meilleur = {};
    liste.forEach(b => {
      if (!meilleur[b.fixtureId] || b.odd > meilleur[b.fixtureId].odd) meilleur[b.fixtureId] = b;
    });
    return Object.values(meilleur).sort((a, b) => b.odd - a.odd);
  }
  const safe = meilleurParMatch(pool.filter(b => b.tier === 'SAFE'));
  const premium = meilleurParMatch(pool.filter(b => b.tier === 'PREMIUM'));
  const exact = autoriseScoreExact ? meilleurParMatch(pool.filter(b => b.tier === 'EXACT_SCORE')) : [];

  const selections = [];
  const matchsUtilises = new Set();
  const championnatsUtilises = {};
  const marchesUtilises = {};
  let coteTotale = 1.0;

  const MAX_PAR_MARCHE = 2;   // diversification des marchés
  const MAX_PAR_CHAMPIONNAT = 3; // diversification des championnats
  const MAX_SELECTIONS = 10;

  function tenterAjout(bet) {
    if (matchsUtilises.has(bet.fixtureId)) return false; // anti-corrélation : jamais 2 legs du même match
    if (bet.odd > maxLeg && bet.tier !== 'EXACT_SCORE') return false;
    if ((marchesUtilises[bet.market] || 0) >= MAX_PAR_MARCHE) return false;
    if ((championnatsUtilises[bet.league] || 0) >= MAX_PAR_CHAMPIONNAT) return false;
    if (selections.length >= MAX_SELECTIONS) return false;
    if (coteTotale * bet.odd > cibleMax * 1.05) return false; // petite marge, jamais dépasser franchement
    selections.push(bet);
    matchsUtilises.add(bet.fixtureId);
    marchesUtilises[bet.market] = (marchesUtilises[bet.market] || 0) + 1;
    championnatsUtilises[bet.league] = (championnatsUtilises[bet.league] || 0) + 1;
    coteTotale *= bet.odd;
    return true;
  }

  // 1 score exact max, seulement si le plan l'autorise
  if (autoriseScoreExact) {
    for (const b of exact) { if (tenterAjout(b)) break; }
  }
  // Jusqu'à 2 sélections premium
  let premCount = 0;
  for (const b of premium) {
    if (premCount >= 2) break;
    if (tenterAjout(b)) premCount++;
  }
  // Compléter avec du safe jusqu'à atteindre la cible (jamais au-delà du max)
  for (const b of safe) {
    if (coteTotale >= cibleMin) break;
    tenterAjout(b);
  }

  // Score de confiance = moyenne des probabilités implicites des cotes (1/cote),
  // heuristique basée sur les cotes du marché — PAS une vraie analyse statistique
  // indépendante (forme, blessures...) : cela demanderait un fournisseur de
  // données stats séparé, à décider avec James si on veut aller plus loin.
  const confiance = selections.length
    ? Math.round(100 * selections.reduce((s, b) => s + 1 / b.odd, 0) / selections.length)
    : 0;

  return {
    selections,
    coteTotale: Math.round(coteTotale * 100) / 100,
    confiance,
    valide: selections.length > 0 && coteTotale >= cibleMin && coteTotale <= cibleMax
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

async function publierFiche(plan, fiche, dateCible, sport, noms) {
  const code = `BOT-${dateCible}-${sport.toUpperCase()}-R${plan.rank}`;
  // score_legs_count : nombre de sélections "score exact" dans la fiche —
  // nécessaire au filtrage RLS côté Dashboard client (colonne NOT NULL,
  // default 0, mais doit refléter la réalité dès qu'une fiche en contient).
  const scoreLegsCount = fiche.selections.filter(s => s.tier === 'EXACT_SCORE').length;

  let ticket;
  try {
    const inserted = await sbInsert('tickets', [{
      code, sport, min_plan_rank: plan.rank, status: 'pending',
      confidence: fiche.confiance, play_date: dateCible, published: true,
      legs_count: fiche.selections.length, total_odd: fiche.coteTotale,
      score_legs_count: scoreLegsCount
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
      market: s.market,
      pick: s.pick,
      odd: s.odd,
      position: i + 1,
      fixture_id: s.fixtureId, // bigint en base — jamais convertir en texte
      result: null
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

export async function handler(event) {
  resetStats(); // corrige le bug de compteurs cumulatifs entre invocations à chaud

  // MODE TEST : permet de déclencher le bot manuellement (hors fenêtre 17h)
  // pour vérifier tout de suite s'il fonctionne, sans attendre le cron.
  // Utilisation : ouvrir l'URL de la fonction avec ?token=<BOT_TEST_TOKEN>
  // Protégé par jeton pour qu'un tiers ne puisse pas déclencher le bot à volonté.
  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;

  // Ne générer que si on est effectivement à 17h00 (± 14 min) en Haïti —
  // le cron se déclenche plus souvent que nécessaire par sécurité DST.
  // (ignoré en mode test)
  const maintenant = partsHaiti(new Date());
  if (!modeTest && maintenant.heureNum !== 17) {
    return { statusCode: 200, body: 'Hors fenêtre 17h00 Haïti — rien à faire. (ajoutez ?token=... pour tester manuellement)' };
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
    plans = await sbSelect('plans', 'select=rank,min_total_odd,max_total_odd,max_leg_odd,includes_exact_score');
    if (!plans || !plans.length) throw new Error('table plans vide');
  } catch (e) {
    stats.erreurs.push('lecture table plans: ' + e.message);
    logFinal();
    return { statusCode: 500, body: 'Impossible de lire les plans.' };
  }

  // --- Cotes réelles foot ---
  const oddsRaw = await recupererCotesFoot(dateCible);
  stats.matchsTrouves = oddsRaw.length;

  if (!oddsRaw.length) {
    // Aucune cote disponible (plan API insuffisant, pas de match, panne) :
    // on ne publie RIEN plutôt que d'inventer — règle 29/39.
    console.log('[BOT] Aucune cote reçue — vérifier le plan API-Sports (endpoint /odds).');
    logFinal();
    return { statusCode: 200, body: 'Aucune cote disponible — aucune fiche publiée.' };
  }

  let poolFoot = [];
  oddsRaw.forEach(item => { poolFoot = poolFoot.concat(extraireMarchesFoot(item, dateCible)); });

  if (!poolFoot.length) {
    console.log('[BOT] Aucune sélection foot ne passe les filtres.');
  }

  // --- Résolution des vrais noms d'équipes (uniquement les matchs candidats) ---
  const idsUtiles = [...new Set(poolFoot.map(b => b.fixtureId))];
  const noms = idsUtiles.length ? await resoudreNomsEquipes(idsUtiles, dateCible) : {};
  // On exclut les matchs dont le statut réel n'est pas "programmé" (reporté/annulé avant même publication)
  poolFoot = poolFoot.filter(b => {
    const n = noms[b.fixtureId];
    if (!n) { rejeter('nom_equipe_introuvable'); return false; }
    if (!['NS', 'TBD'].includes(n.statut)) { rejeter('statut_match_non_programme'); return false; }
    return true;
  });

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
  for (const plan of plans) {
    const fiche = construireFiche(poolFoot, plan);
    stats.fichesGenerees++;
    if (!fiche.valide) {
      console.log(`[BOT] Rang ${plan.rank} : non publiée — ${fiche.selections.length} sélection(s), cote atteinte ${fiche.coteTotale}, cible [${plan.min_total_odd}–${plan.max_total_odd}]`);
      continue;
    }
    await publierFiche(plan, fiche, dateCible, 'foot', noms);
  }

  logFinal();
  return {
    statusCode: 200,
    body: `Terminé. ${stats.fichesPubliees} fiche(s) publiée(s) pour ${dateCible}.`
  };
}
