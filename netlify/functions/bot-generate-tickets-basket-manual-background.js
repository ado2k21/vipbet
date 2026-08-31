/**
 * ============================================================================
 * VIP BETCOTE — GÉNÉRATION MANUELLE DE FICHE BASKETBALL (Netlify Function, Background)
 * Fichier : netlify/functions/bot-generate-tickets-basket-manual-background.js
 * ----------------------------------------------------------------------------
 * RÉÉCRIT (session suivante, demande explicite de James : "doit être comme
 * les autres pages générateurs manuels, mêmes options — je peux modifier
 * heure, date, choisir le plan que je veux, identique aux autres"). Reprend
 * EXACTEMENT le même modèle que bot-generate-tickets-manual-background.js
 * (foot) :
 *  - date/heure de début/fin choisies par l'admin (pas figées à "demain") ;
 *  - plans cochés par l'admin (checkboxes, comme le foot) ;
 *  - UNE SEULE fiche publiée par génération (jamais 4 copies physiques),
 *    ancrée sur le plan de rang le PLUS BAS parmi ceux cochés — visible
 *    par tous les plans cochés (et au-dessus) via la cascade d'accès
 *    (min_plan_rank<=rang abonné), même principe déjà établi côté foot
 *    le 28/08 ;
 *  - cote max choisie par l'admin (25 par défaut si non précisée) ;
 *  - anti-doublon cross-run (mêmes sélections déjà publiées aujourd'hui,
 *    même sport, jamais republiées) ;
 *  - publication immédiate ou programmée, comme le foot.
 *
 * Reste différent du foot volontairement : aucun mode "score exact" (le
 * basketball n'en a pas), aucun sélecteur de sport (implicite : cette
 * fonction ne fait QUE du basketball), aucune notion de min_total_odd
 * (règle du 30/08 : le basketball n'a jamais de plancher obligatoire,
 * seul le plafond compte).
 *
 * Reste identique au passage automatique 19h00
 * (bot-generate-tickets-basket-background.js) sur tout le reste : tous
 * championnats (aucune liste blanche), 1X2 + total de points uniquement,
 * apprentissage réel (market_reliability) déjà branché.
 * ============================================================================
 */

const botBasket = require('./bot-generate-tickets-basket-background.js');
const bot = require('./bot-generate-tickets-background.js');

const {
  recupererMatchsBasketJour, recupererCoteParMatchBasket, extraireMarchesBasket,
  construireFicheBasket, recupererProfilsEquipesBasket, stats, resetStatsBasket, logFinal
} = botBasket;
const {
  verifierConfigSupabase, sbSelect, partsHaiti, heureHaitiDuMatch,
  publierFiche, attendre, API_SPORTS_KEY,
  recupererFiabiliteMarches, annoterPoolAvecFiabilite
} = bot;

const SUPABASE_URL = process.env.SUPABASE_URL;
// Clé anon PUBLIQUE (même valeur que celle déjà embarquée côté navigateur
// dans index.html/admin.html — pas un secret, sert uniquement à faire
// valider un jeton utilisateur par Supabase Auth). Identique à celle du
// fichier manuel foot.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWlmamZjcHlkZHdqa2ZlcnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTU2MjcsImV4cCI6MjEwMjI5MTYyN30.Bw7-CHFDYV4LmNtt6WyIc5gSt3UCe7n5agbyBEo6-Zc';

function jsonResponse(statusCode, body) {
  return { statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}

function minutesDuJour(hhmm) {
  const m = /^(\d{2}):(\d{2})$/.exec(String(hhmm || ''));
  if (!m) return null;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

// Même vérification que les autres fichiers manuels — jamais une copie divergente.
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

function haitiLocalVersUtc(dateIso, heureHHMM) {
  // Même méthode que bot-generate-tickets-manual-background.js (foot) :
  // construit l'offset réel Haïti pour ce jour précis via Intl, jamais un
  // décalage fixe supposé (DST).
  const [h, m] = heureHHMM.split(':').map(Number);
  const approx = new Date(`${dateIso}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00Z`);
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Port-au-Prince', hour: '2-digit', hour12: false, minute: '2-digit'
  });
  const partsUtc = f.formatToParts(approx).reduce((o, p) => { o[p.type] = p.value; return o; }, {});
  const heureVueHaiti = (partsUtc.hour === '24' ? 0 : parseInt(partsUtc.hour, 10)) * 60 + parseInt(partsUtc.minute, 10);
  const heureVoulueMin = h * 60 + m;
  let decalageMin = heureVueHaiti - heureVoulueMin;
  if (decalageMin > 720) decalageMin -= 1440;
  if (decalageMin < -720) decalageMin += 1440;
  return new Date(approx.getTime() + decalageMin * 60000);
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

  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return jsonResponse(400, { erreur: 'JSON invalide.' }); }

  const { playDate, heureDebut, heureFin, plans, coteMax, publishMode, scheduledAt } = body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(playDate || ''))) {
    return jsonResponse(400, { erreur: 'Date de match invalide (AAAA-MM-JJ attendu).' });
  }
  const minDebut = minutesDuJour(heureDebut);
  const minFin = minutesDuJour(heureFin);
  if (minDebut == null || minFin == null || minDebut >= minFin) {
    return jsonResponse(400, { erreur: 'Fenêtre horaire invalide (heure de début doit précéder heure de fin, format HH:MM).' });
  }
  const rangsDemandes = Array.isArray(plans) ? plans.map(Number).filter(n => n >= 1 && n <= 4) : [];
  if (!rangsDemandes.length) {
    return jsonResponse(400, { erreur: 'Choisissez au moins un plan pour continuer.' });
  }
  const coteMaxDemandee = Number(coteMax);
  if (!isFinite(coteMaxDemandee) || coteMaxDemandee <= 1.01) {
    return jsonResponse(400, { erreur: 'Cote maximale invalide (doit être > 1.01).' });
  }
  const programmee = publishMode === 'scheduled';
  let scheduledPublishAtIso = null;
  if (programmee) {
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(String(scheduledAt || ''));
    if (!m) return jsonResponse(400, { erreur: 'Date/heure de programmation invalide.' });
    const utc = haitiLocalVersUtc(m[1], m[2]);
    if (utc.getTime() <= Date.now()) {
      return jsonResponse(400, { erreur: 'La publication programmée doit être dans le futur.' });
    }
    scheduledPublishAtIso = utc.toISOString();
  }

  // --- Plans réels demandés (jamais inventer un rang/plan) ---
  let plansRows;
  try {
    plansRows = await sbSelect('plans', 'select=rank,name');
  } catch (e) {
    return jsonResponse(500, { erreur: 'Lecture des plans impossible : ' + e.message });
  }
  const plansChoisis = plansRows.filter(p => rangsDemandes.includes(p.rank));
  if (!plansChoisis.length) {
    return jsonResponse(400, { erreur: 'Aucun des plans demandés n\'existe en base.' });
  }

  // --- Matchs basketball du jour CHOISI par l'admin ---
  const matchsJour = await recupererMatchsBasketJour(playDate);
  stats.dateCible = playDate;
  stats.matchsTrouves = matchsJour.length;
  if (!matchsJour.length) {
    logFinal();
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucun match basketball reçu pour cette date depuis API-Sports.' }))
    });
  }

  // Filtrage local : statut NS + fenêtre horaire CHOISIE PAR L'ADMIN
  // (distincte de la fenêtre par défaut du passage automatique). Aucune
  // liste de championnat (le basketball n'en a jamais eu — tous les
  // championnats proposés par les bookmakers).
  const noms = {};
  let candidats = [];
  matchsJour.forEach(g => {
    if (!g || !g.id || !g.date) return;
    const statut = g.status && g.status.short;
    if (statut !== 'NS') return;
    const h = heureHaitiDuMatch(g.date);
    if (!h || h.iso !== playDate) return;
    const minutesJour = h.heureNum * 60 + h.minuteNum;
    if (minutesJour < minDebut || minutesJour > minFin) return;
    noms[g.id] = {
      gameId: g.id,
      label: g.teams ? `${(g.teams.home && g.teams.home.name) || '?'} — ${(g.teams.away && g.teams.away.name) || '?'}` : `Match ${g.id}`,
      kickoffUtc: g.date,
      league: (g.league && g.league.name) || 'Basketball',
      leagueCountry: (g.country && g.country.name) || null,
      equipeDomicileId: g.teams && g.teams.home && g.teams.home.id,
      equipeExterieurId: g.teams && g.teams.away && g.teams.away.id
    };
    candidats.push(g.id);
  });

  const PLAFOND_CANDIDATS = 30;
  if (candidats.length > PLAFOND_CANDIDATS) candidats = candidats.slice(0, PLAFOND_CANDIDATS);

  if (!candidats.length) {
    logFinal();
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucun match dans la fenêtre horaire choisie pour cette date.' }))
    });
  }

  let poolBasket = [];
  // Vraies statistiques (session suivante) — même principe que le passage
  // automatique, voir bot-generate-tickets-basket-background.js.
  const profilsEquipes = await recupererProfilsEquipesBasket(playDate);
  const DELAI_ENTRE_APPELS_MS = 6500;
  for (let i = 0; i < candidats.length; i++) {
    stats.candidatsExamines++;
    const gameId = candidats[i];
    const oddsItem = await recupererCoteParMatchBasket(gameId);
    if (oddsItem) poolBasket = poolBasket.concat(extraireMarchesBasket(oddsItem, playDate, noms[gameId], profilsEquipes));
    if (i < candidats.length - 1) await attendre(DELAI_ENTRE_APPELS_MS);
  }
  stats.poolFinal = poolBasket.length;

  if (!poolBasket.length) {
    logFinal();
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucune sélection basketball ne passe les filtres pour cette date/fenêtre.' }))
    });
  }

  // Apprentissage réel (déjà générique par championnat+marché, sport confondu).
  const carteFiabilite = await recupererFiabiliteMarches();
  annoterPoolAvecFiabilite(poolBasket, carteFiabilite);

  // Anti-doublon cross-run (même principe que le foot, Partie 1/9) : toute
  // sélection basketball déjà publiée AUJOURD'HUI (bot automatique ou
  // génération manuelle précédente) est exclue.
  const cleSelection = s => `${s.fixture_id || s.fixtureId}|${s.market}|${s.pick}`;
  const selectionsExclues = new Set();
  try {
    const legsExistants = await sbSelect('ticket_legs',
      `select=fixture_id,market,pick,tickets!inner(play_date,sport)&tickets.play_date=eq.${playDate}&tickets.sport=eq.basket`);
    legsExistants.forEach(l => selectionsExclues.add(cleSelection(l)));
  } catch (e) {
    // Non bloquant : au pire on revient sans protection cross-run, jamais
    // une raison de bloquer une génération manuelle.
  }
  const poolBasketFiltre = poolBasket.filter(b => !selectionsExclues.has(cleSelection({ fixtureId: b.gameId, market: b.market, pick: b.pick })));

  if (!poolBasketFiltre.length) {
    logFinal();
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Tout le contenu disponible est déjà publié aujourd\'hui pour cette date — rien de nouveau à proposer.' }))
    });
  }

  // UNE SEULE fiche par génération manuelle (même principe que le foot,
  // 28/08) : ancrée sur le plan de rang le PLUS BAS parmi ceux cochés —
  // min_plan_rank la rend automatiquement visible à tous les plans cochés
  // (et au-dessus) via la cascade d'accès, sans jamais créer de doublon
  // physique. Aucun plancher de cote (règle du 30/08) — seule la cote max
  // choisie par l'admin borne la fiche.
  const planPartage = plansChoisis.reduce((a, b) => (a.rank < b.rank ? a : b));
  const fiche = construireFicheBasket(poolBasketFiltre, coteMaxDemandee);

  if (!fiche.valide) {
    stats.erreurs.push(`DIAGNOSTIC échec fiche : matchsDistincts=${fiche.debugMatchsDistincts}, cibleMax=${fiche.debugCibleMax}, meilleuresCotes=${JSON.stringify(fiche.debugMeilleuresCotes)}`);
    logFinal();
    return jsonResponse(200, {
      resultats: [{ rank: planPartage.rank, publie: false, plansConcernes: plansChoisis.map(p => p.rank),
        raison: `Pas assez de sélections distinctes pour un combiné (${fiche.selections.length} trouvée(s), minimum 2 requis) sous la cote max choisie.`,
        debug: { matchsDistincts: fiche.debugMatchsDistincts, cibleMax: fiche.debugCibleMax, meilleuresCotes: fiche.debugMeilleuresCotes } }]
    });
  }

  const nomsPourPublication = {};
  fiche.selections.forEach(s => {
    s.fixtureId = s.gameId;
    nomsPourPublication[s.gameId] = { label: noms[s.gameId] && noms[s.gameId].label };
  });

  // CORRIGÉ (31/08, même bug que le passage automatique) : publierFiche()
  // pousse ses erreurs dans bot.stats.erreurs (module foot), jamais dans
  // le stats.erreurs de ce fichier basket — capturé explicitement ici pour
  // que la vraie raison d'échec apparaisse dans la réponse JSON et le log.
  const nbErreursFootAvant = bot.stats.erreurs.length;
  const horodatage = partsHaiti(new Date()).heure.replace(':', '') + String(new Date().getSeconds()).padStart(2, '0');
  const ok = await publierFiche(planPartage, fiche, playDate, 'basket', nomsPourPublication, '', {
    source: 'admin', published: !programmee, scheduledPublishAt: programmee ? scheduledPublishAtIso : null,
    forcerExemption: true, codePrefix: `ADM${horodatage}`
  });
  if (!ok) {
    const nouvelles = bot.stats.erreurs.slice(nbErreursFootAvant);
    stats.erreurs.push(`publierFiche a échoué (basket) : ${nouvelles.length ? nouvelles.join(' | ') : 'raison inconnue, aucune erreur remontée par le module foot'}`);
  }

  logFinal();
  return jsonResponse(200, {
    resultats: [{
      rank: planPartage.rank, publie: ok, coteTotale: fiche.coteTotale, selections: fiche.selections.length,
      coteMaxDemandee, plansConcernes: plansChoisis.map(p => p.rank),
      programmee, scheduledPublishAt: scheduledPublishAtIso,
      raison: ok ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
    }]
  });
}

module.exports.handler = handler;
