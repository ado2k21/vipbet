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
  stats.erreurs = [];
}
function logFinal() {
  console.log('[SETTLE]', JSON.stringify(stats, null, 2));
}

// ============================================================================
// 4. APPELS API-SPORTS
// ============================================================================

async function apiSportsGet(path, params) {
  const url = new URL(`https://${FOOT_HOST}${path}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const resp = await fetch(url.toString(), { headers: { 'x-apisports-key': API_SPORTS_KEY } });
  if (!resp.ok) throw new Error(`API-Sports ${path} → HTTP ${resp.status}`);
  const data = await resp.json();
  return data.response || [];
}

// Un seul appel par date à régler (comme bot-generate-tickets.js) : tous les
// matchs du jour, avec statut final et score si terminé. Jamais un appel par
// fixture — même logique de contournement du quota que la génération.
async function recupererFixturesDate(dateIso) {
  try {
    return await apiSportsGet('/fixtures', { date: dateIso, timezone: TZ_HAITI });
  } catch (e) {
    stats.erreurs.push(`fixtures(${dateIso}): ${e.message}`);
    return [];
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
    return events
      .filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty')
      .map(e => (e.player && e.player.name) || '');
  } catch (e) {
    stats.erreurs.push(`events(fixture=${fixtureId}): ${e.message}`);
    return null; // null = échec réel, à distinguer de [] = aucun but marqué
  }
}

// Statuts API-Sports considérés comme définitivement terminés / non-terminés
const STATUTS_TERMINES = ['FT', 'AET', 'PEN'];
const STATUTS_ANNULES = ['PST', 'CANC', 'ABD', 'WO', 'AWD', 'SUSP'];

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
      const paire = pick.replace('Double chance : ', '').trim(); // "Home/Draw", "Home/Away", "Draw/Away"
      const res = resultat1x2(golHome, golAway);
      return paire.split('/').includes(res) ? 'won' : 'lost';
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

// ============================================================================
// 6. RÈGLEMENT D'UNE DATE (tous les tickets pending dont play_date = dateIso)
// ============================================================================

async function reglerDate(dateIso) {
  stats.datesTraitees.push(dateIso);

  let tickets;
  try {
    tickets = await sbSelect('tickets',
      `select=id,code,play_date&status=eq.pending&play_date=eq.${dateIso}`);
  } catch (e) {
    stats.erreurs.push(`lecture tickets(${dateIso}): ${e.message}`);
    return;
  }
  if (!tickets.length) return;

  const fixturesJour = await recupererFixturesDate(dateIso);
  // Index rapide fixture_id → {statut, golHome, golAway}
  //
  // PROLONGATIONS (27/08, section 11 du cahier des charges) : tous les
  // marchés actuellement generes par le bot (1X2, double chance, BTTS,
  // totaux, score exact, buteur) sont des marches "90 minutes" au sens
  // bookmaker standard — jamais un marche qui inclut explicitement la
  // prolongation. f.goals.home/away d'API-Sports est le score APRES
  // prolongation pour un match AET (mais AVANT tirs au but, qui ne sont
  // jamais des buts). f.score.fulltime.home/away est le vrai score a la
  // 90e minute, quel que soit ce qui s'est passe ensuite. On utilise
  // TOUJOURS fulltime en priorite ; goals ne sert que de repli si
  // fulltime est absent (ne devrait arriver que pour un match qui n'est
  // pas alle en prolongation, ou` les deux valeurs sont de toute facon
  // identiques).
  const parFixture = {};
  fixturesJour.forEach(f => {
    if (!f.fixture) return;
    const ft = f.score && f.score.fulltime;
    parFixture[f.fixture.id] = {
      statut: f.fixture.status && f.fixture.status.short,
      golHome: (ft && ft.home != null) ? ft.home : (f.goals && f.goals.home),
      golAway: (ft && ft.away != null) ? ft.away : (f.goals && f.goals.away)
    };
  });

  const cacheButeurs = {}; // fixture_id → liste de noms, calculé une seule fois par match même si plusieurs legs buteur

  for (const ticket of tickets) {
    stats.ticketsExamines++;
    let legs;
    try {
      legs = await sbSelect('ticket_legs',
        `select=id,fixture_id,market,pick,result&ticket_id=eq.${ticket.id}&order=position.asc`);
    } catch (e) {
      stats.erreurs.push(`lecture legs(ticket=${ticket.id}): ${e.message}`);
      continue;
    }

    let toutesResolues = true;
    const ecouler = joursEcoules(dateIso); // 0 = aujourd'hui, 1 = hier, etc.

    for (const leg of legs) {
      if (leg.result) continue; // déjà réglé lors d'un passage précédent

      const info = parFixture[leg.fixture_id];
      let nouveauResultat = null;

      if (info && STATUTS_TERMINES.includes(info.statut)) {
        let buteurs = undefined;
        if (leg.market === 'mk_buteur') {
          if (!(leg.fixture_id in cacheButeurs)) {
            cacheButeurs[leg.fixture_id] = await recupererButeurs(leg.fixture_id);
          }
          buteurs = cacheButeurs[leg.fixture_id];
        }
        nouveauResultat = evaluerLeg(leg, info.golHome, info.golAway, buteurs);
      } else if (info && STATUTS_ANNULES.includes(info.statut)) {
        nouveauResultat = 'void';
      } else if (ecouler >= 1) {
        // Règle des 23h59 Haïti : match sans statut final le lendemain de
        // sa date de jeu (introuvable dans /fixtures, ou statut bloqué en
        // NS/TBD/LIVE anormalement longtemps) → void, jamais bloquant.
        nouveauResultat = 'void';
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
        leg.result = nouveauResultat; // reflète localement pour le calcul du ticket ci-dessous
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

  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;
  if (modeTest) console.log('[SETTLE] === MODE TEST déclenché manuellement ===');

  if (!API_SPORTS_KEY) {
    stats.erreurs.push('API_SPORTS_KEY absente des variables Netlify');
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
module.exports.config = config;
