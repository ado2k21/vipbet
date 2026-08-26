/**
 * ============================================================================
 * VIP BETCOTE — GÉNÉRATION MANUELLE DE FICHE (Netlify Function, HTTP, admin)
 * Fichier : netlify/functions/bot-generate-tickets-manual.js
 * ----------------------------------------------------------------------------
 * Déclenchée à la demande depuis le bouton "GÉNÉRER FICHE" du panneau admin
 * (admin.html) — PAS une tâche planifiée (pas de `config.schedule` exporté
 * ici, contrairement à bot-generate-tickets.js).
 *
 * Réutilise directement les briques de bot-generate-tickets.js (extraction
 * des marchés, construction de fiche, publication en base) via require() —
 * volontairement PAS une copie séparée : la logique de marché est ajustée
 * régulièrement, une seconde copie divergerait silencieusement au fil du
 * temps. Seul le point d'entrée (paramètres choisis par l'admin, fenêtre
 * horaire personnalisée, pas d'anti-doublon, cote max personnalisée,
 * publication immédiate ou programmée) est spécifique à ce fichier.
 *
 * SÉCURITÉ : accessible uniquement à un compte avec profiles.role='admin'.
 * Le jeton d'accès Supabase de la session admin (déjà connectée dans
 * admin.html) est transmis en en-tête Authorization et vérifié ici auprès
 * de Supabase Auth avant toute génération.
 * ============================================================================
 */

const bot = require('./bot-generate-tickets.js');

const {
  verifierConfigSupabase, sbSelect, partsHaiti, heureHaitiDuMatch,
  resetStats, stats, recupererFixturesJour, recupererCoteParFixture,
  extraireMarchesFoot, construireFiche, construireFicheScoreExact,
  publierFiche, ALLOWED_LEAGUES_FOOT, TOP_LEAGUES_FOOT
} = bot;

const SUPABASE_URL = process.env.SUPABASE_URL;
// Clé anon PUBLIQUE (même valeur que celle déjà embarquée côté navigateur
// dans admin.html/index.html — ce n'est pas un secret, elle sert
// uniquement à faire valider un jeton utilisateur par Supabase Auth).
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWlmamZjcHlkZHdqa2ZlcnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTU2MjcsImV4cCI6MjEwMjI5MTYyN30.Bw7-CHFDYV4LmNtt6WyIc5gSt3UCe7n5agbyBEo6-Zc';

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  };
}

// Vérifie le jeton d'accès envoyé par admin.html auprès de Supabase Auth,
// puis confirme que l'utilisateur a bien profiles.role='admin'. Ne fait
// JAMAIS confiance à un id/rôle envoyé par le client — toujours revérifié
// côté serveur à chaque appel.
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

// Convertit une date+heure LOCALE Haïti ("2026-08-26","14:30") en Date UTC
// exacte, sans supposer le décalage fixe (Haïti change d'heure d'été/hiver
// comme les USA — voir commentaire d'en-tête de bot-generate-tickets.js).
// Haïti n'utilise que 2 décalages possibles (UTC-4 ou UTC-5) : on essaie
// les deux et on garde celui dont la reconversion locale correspond.
function haitiLocalVersUtc(dateStr, heureStr) {
  for (const decalageH of [4, 5]) {
    const essai = new Date(`${dateStr}T${heureStr}:00.000Z`);
    essai.setUTCHours(essai.getUTCHours() + decalageH);
    const verif = partsHaiti(essai);
    if (verif.iso === dateStr && verif.heure === heureStr) return essai;
  }
  // Repli (ne devrait jamais arriver) : UTC-4 par défaut.
  const repli = new Date(`${dateStr}T${heureStr}:00.000Z`);
  repli.setUTCHours(repli.getUTCHours() + 4);
  return repli;
}

function minutesDuJour(heureStr) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(heureStr || '').trim());
  if (!m) return null;
  const h = parseInt(m[1], 10), min = parseInt(m[2], 10);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { erreur: 'Méthode non autorisée.' });
  }

  resetStats();

  try { verifierConfigSupabase(); }
  catch (e) { return jsonResponse(500, { erreur: e.message }); }

  // --- Authentification admin ---
  let auth;
  try {
    auth = await verifierAdmin(event.headers && (event.headers.authorization || event.headers.Authorization));
  } catch (e) {
    return jsonResponse(500, { erreur: 'Vérification admin impossible : ' + e.message });
  }
  if (!auth.ok) return jsonResponse(auth.code, { erreur: auth.message });

  // --- Lecture et validation des paramètres envoyés par admin.html ---
  let body;
  try { body = JSON.parse(event.body || '{}'); }
  catch (e) { return jsonResponse(400, { erreur: 'JSON invalide.' }); }

  const { playDate, heureDebut, heureFin, sport, plans, coteMax, publishMode, scheduledAt } = body;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(playDate || ''))) {
    return jsonResponse(400, { erreur: 'Date de match invalide (AAAA-MM-JJ attendu).' });
  }
  const minDebut = minutesDuJour(heureDebut);
  const minFin = minutesDuJour(heureFin);
  if (minDebut == null || minFin == null || minDebut >= minFin) {
    return jsonResponse(400, { erreur: 'Fenêtre horaire invalide (heure de début doit précéder heure de fin, format HH:MM).' });
  }
  if (sport !== 'foot') {
    // Le basketball n'est PAS encore raccordé à une vraie génération de
    // fiches (seuls des diagnostics existent aujourd'hui côté bot — voir
    // diagnostiquerNBA/diagnostiquerBasket dans bot-generate-tickets.js,
    // l'API NBA v2 n'expose même aucune cote). Refuser clairement plutôt
    // que de publier une fiche construite sur des données inventées.
    return jsonResponse(400, { erreur: 'Basketball/NBA : génération manuelle pas encore disponible (aucune source de cotes fiable branchée pour l\'instant). Football uniquement pour le moment.' });
  }
  const rangsDemandes = Array.isArray(plans) ? plans.map(Number).filter(n => n >= 1 && n <= 4) : [];
  if (!rangsDemandes.length) {
    return jsonResponse(400, { erreur: 'Choisissez au moins un plan.' });
  }
  const coteMaxDemandee = Number(coteMax);
  if (!isFinite(coteMaxDemandee) || coteMaxDemandee <= 1.01) {
    return jsonResponse(400, { erreur: 'Cote maximale invalide (doit être > 1.01).' });
  }
  const programmee = publishMode === 'scheduled';
  let scheduledPublishAtIso = null;
  if (programmee) {
    // scheduledAt attendu au format "AAAA-MM-JJTHH:MM" (heure LOCALE Haïti,
    // comme un <input type="datetime-local">), jamais un ISO déjà en UTC.
    const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(String(scheduledAt || ''));
    if (!m) return jsonResponse(400, { erreur: 'Date/heure de programmation invalide.' });
    const utc = haitiLocalVersUtc(m[1], m[2]);
    if (utc.getTime() <= Date.now()) {
      return jsonResponse(400, { erreur: 'La publication programmée doit être dans le futur.' });
    }
    scheduledPublishAtIso = utc.toISOString();
  }

  // --- Plans réels demandés (jamais inventer min/max/max_leg_odd) ---
  let plansRows;
  try {
    plansRows = await sbSelect('plans', 'select=rank,min_total_odd,max_total_odd,max_leg_odd,includes_exact_score');
  } catch (e) {
    return jsonResponse(500, { erreur: 'Lecture des plans impossible : ' + e.message });
  }
  const plansChoisis = plansRows.filter(p => rangsDemandes.includes(p.rank));
  if (!plansChoisis.length) {
    return jsonResponse(400, { erreur: 'Aucun des plans demandés n\'existe en base.' });
  }

  // --- Fixtures du jour choisi (même appel que le bot quotidien) ---
  const fixturesJour = await recupererFixturesJour(playDate);
  if (!fixturesJour.length) {
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucun match reçu pour cette date depuis API-Sports.' }))
    });
  }

  // --- Filtrage local : championnat autorisé + fenêtre horaire CHOISIE
  // PAR L'ADMIN (distincte de la fenêtre par défaut du bot 08:00-22:00 —
  // reste néanmoins bornée par elle, extraireMarchesFoot rejette de toute
  // façon tout match hors 08:00-22:00 plus bas). ---
  const noms = {};
  let candidats = [];
  fixturesJour.forEach(f => {
    const league = f.league, fixture = f.fixture;
    if (!league || !fixture) return;
    if (!ALLOWED_LEAGUES_FOOT.includes(league.id)) return;
    const h = heureHaitiDuMatch(fixture.date);
    if (!h || h.iso !== playDate) return;
    const minutesJour = h.heureNum * 60 + h.minuteNum;
    if (minutesJour < minDebut || minutesJour > minFin) return;
    if (!['NS', 'TBD'].includes(fixture.status.short)) return;
    noms[fixture.id] = {
      label: `${f.teams.home.name} — ${f.teams.away.name}`,
      statut: fixture.status.short,
      kickoffUtc: fixture.date,
      equipeDomicileId: f.teams.home.id,
      equipeExterieurId: f.teams.away.id
    };
    candidats.push({ fixtureId: fixture.id, prioritaire: TOP_LEAGUES_FOOT.includes(league.id) });
  });

  const PLAFOND_APPELS_COTES = 60;
  candidats.sort((a, b) => (b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0));
  if (candidats.length > PLAFOND_APPELS_COTES) candidats = candidats.slice(0, PLAFOND_APPELS_COTES);

  if (!candidats.length) {
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucun match disponible dans la fenêtre horaire choisie pour cette date.' }))
    });
  }

  let poolFoot = [];
  for (const c of candidats) {
    const oddsItem = await recupererCoteParFixture(c.fixtureId);
    if (!oddsItem) continue;
    poolFoot = poolFoot.concat(extraireMarchesFoot(oddsItem, playDate, noms[c.fixtureId]));
  }

  if (!poolFoot.length) {
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucune sélection ne passe les filtres de marché pour les matchs disponibles.' }))
    });
  }

  const nbMatchsDisponibles = new Set(poolFoot.map(b => b.fixtureId)).size;
  const buteursUtilises = new Set();
  // Suffixe de génération (26/08) : garantit un code unique même si
  // l'admin génère plusieurs fois le même plan le même jour — l'anti-
  // doublon normal (dejaGenereAujourdhui) est volontairement IGNORÉ ici,
  // c'est le sens même de la génération manuelle.
  const horodatage = partsHaiti(new Date()).heure.replace(':', '') + String(new Date().getSeconds()).padStart(2, '0');
  const codePrefix = `ADM${horodatage}`;

  const resultats = [];
  for (const plan of plansChoisis) {
    // Cote max : celle choisie par l'admin, jamais au-delà du max RÉEL du
    // plan (le trigger base le refuserait de toute façon — on le signale
    // proprement plutôt que de laisser échouer l'insertion en silence).
    const planMax = plan.max_total_odd != null ? Number(plan.max_total_odd) : null;
    const coteMaxEffective = planMax != null ? Math.min(coteMaxDemandee, planMax) : coteMaxDemandee;
    const clamped = planMax != null && coteMaxDemandee > planMax;

    const fiche = construireFiche(poolFoot, plan, {
      buteursUtilises, nbMatchsDisponibles,
      cibleMinOverride: 1.01, cibleMaxOverride: coteMaxEffective
    });

    const publierOptions = {
      source: 'admin', published: !programmee,
      scheduledPublishAt: programmee ? scheduledPublishAtIso : null,
      forcerExemption: true, codePrefix
    };

    if (!fiche.valide) {
      resultats.push({ rank: plan.rank, publie: false, raison: `Aucune combinaison possible (${fiche.selections.length} sélection(s) trouvée(s), minimum 2 requis).` });
    } else {
      const ok = await publierFiche(plan, fiche, playDate, 'foot', noms, '', publierOptions);
      resultats.push({
        rank: plan.rank, publie: ok, coteTotale: fiche.coteTotale, selections: fiche.selections.length,
        coteMaxDemandee: coteMaxDemandee, coteMaxAppliquee: coteMaxEffective, clampeAuMaxDuPlan: clamped,
        programmee, scheduledPublishAt: scheduledPublishAtIso,
        raison: ok ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
      });
    }

    // Fiche score exact dédiée, même principe que le bot quotidien.
    if (plan.includes_exact_score) {
      const ficheExacte = construireFicheScoreExact(poolFoot, plan, {
        cibleMinOverride: 1.01, cibleMaxOverride: coteMaxEffective
      });
      if (ficheExacte.valide) {
        const okExact = await publierFiche(plan, ficheExacte, playDate, 'foot', noms, '-EXACT', publierOptions);
        resultats.push({
          rank: plan.rank, exact: true, publie: okExact, coteTotale: ficheExacte.coteTotale,
          selections: ficheExacte.selections.length, programmee, scheduledPublishAt: scheduledPublishAtIso,
          raison: okExact ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
        });
      }
      // Pas de "raison" loguée si score exact invalide : c'est un simple
      // complément optionnel, jamais bloquant pour la fiche normale.
    }
  }

  return jsonResponse(200, { resultats });
}

module.exports.handler = handler;
