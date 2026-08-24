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
  288   // Premier Soccer League (Afrique du Sud)
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
// avec de vrais grands buteurs reconnus). VIDE pour l'instant — tant qu'elle
// est vide, le filtre club est ignoré (seul LEAGUES_BUTEUR_AUTORISEES
// s'applique) pour ne pas désactiver tout le marché buteur en attendant les
// IDs confirmés via ?diag=teams. Dès qu'elle est remplie, le filtre club
// s'active automatiquement.
const GRANDS_CLUBS_BUTEUR = [
  // À remplir avec les IDs confirmés : Real Madrid, Barcelone, Bayern,
  // Man City, Man United, Liverpool, Arsenal, Chelsea, Tottenham,
  // Inter Milan, Juventus, AC Milan, Napoli, PSG, Al-Nassr, Al-Ittihad,
  // Al-Hilal, Inter Miami (Messi), etc.
];

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

async function recupererCoteParFixture(fixtureId) {
  try {
    const data = await apiSportsGetRaw(FOOT_HOST, '/odds', { fixture: fixtureId, bookmaker: BOOKMAKER_ID });
    return (data.response && data.response[0]) || null;
  } catch (e) {
    stats.erreurs.push(`foot/odds(fixture=${fixtureId}): ${e.message}`);
    return null;
  }
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
// 5. EXTRACTION DES MARCHÉS PERTINENTS (foot)
// ============================================================================

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
          kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
        });
      }
    }
    // Double chance (id 12) — profil "safe"
    if (betType.id === 12) {
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.19 && c <= 1.70) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_double_chance',
            pick: `Double chance : ${v.value}`, odd: c, tier: 'SAFE',
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
            fixtureId: fixture.id, league: league.name, market: 'mk_1x2',
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
            fixtureId: fixture.id, league: league.name, market: 'mk_total_buts',
            pick: traduireButs(v.value), odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        }
        if (c >= 1.95 && c <= 2.40 && v.value === 'Over 2.5') {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: 'mk_total_buts',
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
            fixtureId: fixture.id, league: league.name, market: 'mk_btts',
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
          fixtureId: fixture.id, league: league.name, market: 'mk_buteur',
          pick: `Buteur : ${meilleurButeur.value}`, odd: meilleureCote, tier: 'PREMIUM',
          kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
        });
      }
    }
    // Total buts par équipe (id 16 = domicile, id 17 = extérieur) — le
    // marché décrit par James (ex: "Real Madrid 1.5+ buts"). Même logique
    // safe/premium que le total buts du match.
    if (betType.id === 16 || betType.id === 17) {
      const cote = betType.id === 16 ? 'mk_total_domicile' : 'mk_total_exterieur';
      const label = betType.id === 16 ? 'Domicile' : 'Extérieur';
      betType.values.forEach(v => {
        const c = parseFloat(v.odd);
        if (c >= 1.19 && c <= 1.70) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: cote,
            pick: `${label} : ${traduireButs(v.value)}`, odd: c, tier: 'SAFE',
            kickoffUtc: fixture.date, matchTimeHaiti: h.heure, prioritaire
          });
        } else if (c >= 1.90 && c <= 2.60) {
          trouvees.push({
            fixtureId: fixture.id, league: league.name, market: cote,
            pick: `${label} : ${traduireButs(v.value)}`, odd: c, tier: 'PREMIUM',
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
    if ([16, 17, 92].includes(betType.id) && !stats.echantillonsValeurs[betType.id]) {
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
function construireFiche(pool, plan, options) {
  options = options || {};
  const buteursUtilises = options.buteursUtilises || new Set();
  const nbMatchsDisponibles = options.nbMatchsDisponibles || 0;

  let cibleMin = plan.min_total_odd != null ? Number(plan.min_total_odd) : 1.5;
  const cibleMax = plan.max_total_odd != null ? Number(plan.max_total_odd) : 999;
  const maxLeg = plan.max_leg_odd != null ? Number(plan.max_leg_odd) : 2.5;
  const autoriseScoreExact = !!plan.includes_exact_score;

  // EXCEPTION (règle confirmée par James, seuil < 4 matchs valides) : les
  // jours avec peu de matchs, les plans à cote cible élevée (rang ≥3)
  // acceptent une cote réduite (~15) plutôt que de ne jamais publier.
  // Ne s'applique jamais à la baisse au-delà de la cible d'origine.
  if (plan.rank >= 3 && nbMatchsDisponibles < 4 && cibleMin > 15) {
    cibleMin = 15;
  }

  function meilleurParMatch(liste) {
    const meilleur = {};
    liste.forEach(b => {
      if (!meilleur[b.fixtureId] || b.odd > meilleur[b.fixtureId].odd) meilleur[b.fixtureId] = b;
    });
    return Object.values(meilleur).sort((a, b) => {
      if (a.prioritaire !== b.prioritaire) return a.prioritaire ? -1 : 1;
      return b.odd - a.odd;
    });
  }
  const safe = meilleurParMatch(pool.filter(b => b.tier === 'SAFE'));
  // Buteur (🔴) exclu du pool PREMIUM général — réservé aux plans score-exact,
  // et jamais un joueur déjà utilisé dans une fiche publiée plus tôt ce jour.
  const premium = meilleurParMatch(pool.filter(b => b.tier === 'PREMIUM' && b.market !== 'mk_buteur'));
  const exact = autoriseScoreExact ? meilleurParMatch(pool.filter(b => b.tier === 'EXACT_SCORE')) : [];
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
  const PLAFOND_PAR_MARCHE = { mk_buteur: 1 }; // règle 14 : max 1 buteur par fiche
  // Plan 1 : prudence renforcée — éviter de combiner trop de grosses cotes
  // (règle explicite de James). Limite le nombre de sélections 🟡 (premium)
  // autorisées, quasi tout doit venir du 🟢 (safe).
  const MAX_PREMIUM_PLAN1 = 1;

  function tenterAjout(bet) {
    if (matchsUtilises.has(bet.fixtureId)) return false; // anti-corrélation : jamais 2 legs du même match
    // Cotes ≥1.90 acceptées pour les marchés SAFE/PREMIUM déjà bien établis
    // et encadrés (victoire directe, plus de 2.5 buts, BTTS) — le plafond
    // strict du plan ne s'applique qu'aux cotes hors de ces plages
    // contrôlées. EXACT_SCORE et PREMIUM sont donc tous deux exemptés.
    if (bet.odd > maxLeg && bet.tier !== 'EXACT_SCORE' && bet.tier !== 'PREMIUM') return false;
    const plafondMarche = PLAFOND_PAR_MARCHE[bet.market] || MAX_PAR_MARCHE;
    if ((marchesUtilises[bet.market] || 0) >= plafondMarche) return false;
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
  // 1 buteur max, seulement si le plan l'autorise et joueur pas déjà utilisé
  // ailleurs aujourd'hui
  if (autoriseScoreExact) {
    for (const b of buteurs) {
      if (tenterAjout(b)) { buteursUtilises.add(b.pick); break; }
    }
  }
  // Sélections 🟡 (premium) : jusqu'à 2, sauf Plan 1 limité à 1 (prudence)
  const maxPremium = plan.rank === 1 ? MAX_PREMIUM_PLAN1 : 2;
  let premCount = 0;
  for (const b of premium) {
    if (premCount >= maxPremium) break;
    if (tenterAjout(b)) premCount++;
  }
  // Compléter avec du 🟢 (safe) jusqu'à atteindre la cible (jamais au-delà du max)
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
    valide: selections.length >= 2 && coteTotale >= cibleMin && coteTotale <= cibleMax
  };
}

/**
 * Fiche "score exact" dédiée — jamais mélangée avec d'autres marchés.
 * 3 à 6 sélections, toutes score exact, une par match distinct.
 * Réservée aux plans score-exact ; s'ajoute à la fiche normale du même
 * plan (ne la remplace pas — confirmé par James).
 */
function construireFicheScoreExact(pool, plan) {
  if (!plan.includes_exact_score) return { selections: [], coteTotale: 0, confiance: 0, valide: false };

  const cibleMin = plan.min_total_odd != null ? Number(plan.min_total_odd) : 1.5;
  const cibleMax = plan.max_total_odd != null ? Number(plan.max_total_odd) : 999;

  const meilleur = {};
  pool.filter(b => b.tier === 'EXACT_SCORE').forEach(b => {
    if (!meilleur[b.fixtureId] || b.odd < meilleur[b.fixtureId].odd) meilleur[b.fixtureId] = b;
  });
  // Les scores les plus probables (cote la plus basse) d'abord — construction
  // INCRÉMENTALE respectant [min_total_odd, max_total_odd] du plan, comme
  // construireFiche le fait déjà pour la fiche normale. CORRIGE le bug du
  // 24/08 : prendre 6 scores exacts d'un coup sans plafond produisait une
  // cote totale de 3473 rejetée par Supabase (cote_hors_plage, max 100).
  const candidats = Object.values(meilleur).sort((a, b) => a.odd - b.odd);

  const selections = [];
  let coteTotale = 1.0;
  for (const b of candidats) {
    if (selections.length >= 6) break;
    // Triés croissant : si celui-ci dépasse déjà le max, les suivants
    // (plus chers) seraient pires — on arrête plutôt que de sauter au suivant.
    if (coteTotale * b.odd > cibleMax * 1.05) break;
    selections.push(b);
    coteTotale *= b.odd;
    if (selections.length >= 3 && coteTotale >= cibleMin) break;
  }

  const valide = selections.length >= 3 && coteTotale >= cibleMin && coteTotale <= cibleMax * 1.05;

  const confiance = selections.length
    ? Math.round(100 * selections.reduce((s, b) => s + 1 / b.odd, 0) / selections.length)
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

async function publierFiche(plan, fiche, dateCible, sport, noms, suffixeCode) {
  const code = `BOT-${dateCible}-${sport.toUpperCase()}-R${plan.rank}${suffixeCode || ''}`;
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
      score_legs_count: scoreLegsCount,
      // Distinction interne BOT/ADMIN (25/08) : permet au panneau admin de
      // signaler l'origine d'une fiche. Une correction manuelle ultérieure
      // ne remet jamais cette valeur à 'admin' (voir admin_save_ticket).
      source: 'bot'
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

  // MODE DIAGNOSTIC LIGUES (25/08) : ?token=...&diag=leagues&q=Portugal,Qatar,...
  // Retourne les vrais id/nom/pays de chaque terme cherché sur API-Sports,
  // pour confirmer un ID avant de l'ajouter aux listes de championnats —
  // n'exécute PAS la génération normale de fiches.
  if (modeTest && event.queryStringParameters.diag === 'leagues') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const termes = (event.queryStringParameters.q || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!termes.length) return { statusCode: 400, body: 'Ajouter &q=terme1,terme2,...' };
    const resultats = {};
    for (const t of termes) {
      resultats[t] = await recupererLigues(t);
    }
    return { statusCode: 200, body: JSON.stringify(resultats, null, 2) };
  }

  // MODE DIAGNOSTIC ÉQUIPES (25/08) : ?token=...&diag=teams&q=Real Madrid,Barcelona,...
  // Même principe que diag=leagues, mais pour confirmer les IDs des "grands
  // clubs" avant de les ajouter à GRANDS_CLUBS_BUTEUR.
  if (modeTest && event.queryStringParameters.diag === 'teams') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const termes = (event.queryStringParameters.q || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!termes.length) return { statusCode: 400, body: 'Ajouter &q=terme1,terme2,...' };
    const resultats = {};
    for (const t of termes) {
      resultats[t] = await recupererEquipes(t);
    }
    return { statusCode: 200, body: JSON.stringify(resultats, null, 2) };
  }

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

  // --- Fixtures du jour (1 seul appel, aucune restriction championnat/saison) ---
  const fixturesJour = await recupererFixturesJour(dateCible);
  stats.matchsTrouves = fixturesJour.length;

  if (!fixturesJour.length) {
    console.log('[BOT] Aucun match reçu — vérifier le plan API-Sports (endpoint /fixtures).');
    logFinal();
    return { statusCode: 200, body: 'Aucun match disponible — aucune fiche publiée.' };
  }

  // Filtrage local : championnat autorisé, fenêtre horaire Haïti, statut
  // programmé. On construit `noms` directement ici (label, statut, heure
  // de coup d'envoi) — plus besoin d'un appel séparé pour les noms d'équipes.
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
      equipeExterieurId: f.teams.away.id
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

  let poolFoot = [];
  for (const c of candidats) {
    const oddsItem = await recupererCoteParFixture(c.fixtureId);
    if (!oddsItem) continue;
    poolFoot = poolFoot.concat(extraireMarchesFoot(oddsItem, dateCible, noms[c.fixtureId]));
  }

  if (!poolFoot.length) {
    console.log('[BOT] Aucune sélection foot ne passe les filtres (0 cote disponible parmi les matchs candidats).');
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

  for (const plan of plans) {
    const fiche = construireFiche(poolFoot, plan, { buteursUtilises, nbMatchsDisponibles });
    stats.fichesGenerees++;
    if (!fiche.valide) {
      console.log(`[BOT] Rang ${plan.rank} : non publiée — ${fiche.selections.length} sélection(s), cote atteinte ${fiche.coteTotale}, cible [${plan.min_total_odd}–${plan.max_total_odd}]`);
    } else {
      await publierFiche(plan, fiche, dateCible, 'foot', noms);
    }

    // Fiche score exact dédiée (3-6 sélections, jamais mélangée) — s'ajoute
    // à la fiche normale, ne la remplace pas (confirmé par James).
    if (plan.includes_exact_score) {
      const ficheExacte = construireFicheScoreExact(poolFoot, plan);
      stats.fichesGenerees++;
      if (!ficheExacte.valide) {
        console.log(`[BOT] Rang ${plan.rank} (score exact) : non publiée — ${ficheExacte.selections.length} sélection(s) (minimum 3 requis)`);
      } else {
        await publierFiche(plan, ficheExacte, dateCible, 'foot', noms, '-EXACT');
      }
    }
  }

  logFinal();
  return {
    statusCode: 200,
    body: `Terminé. ${stats.fichesPubliees} fiche(s) publiée(s) pour ${dateCible}.`
  };
}
