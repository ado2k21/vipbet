/**
 * ============================================================================
 * VIP BETCOTE — GÉNÉRATION MANUELLE DE FICHE (Netlify Function, Background)
 * Fichier : netlify/functions/bot-generate-tickets-manual-background.js
 * ----------------------------------------------------------------------------
 * RENOMMÉE le 28/08 v5 (était bot-generate-tickets-manual.js, fonction HTTP
 * normale) : convertie en fonction "Background" (jusqu'à 15 minutes
 * d'exécution) pour pouvoir espacer ses appels /odds (~6.5s entre chaque,
 * comme bot-generate-tickets-background.js) et examiner jusqu'à 60
 * candidats sans se faire rejeter par la limite de 10 requêtes/minute
 * d'API-Sports (HTTP 429, cause racine identifiée le 28/08).
 *
 * CONSÉQUENCE IMPORTANTE POUR admin.html/index.html : une fonction
 * Background ne renvoie JAMAIS de réponse utilisable à l'appelant (Netlify
 * répond 202 immédiatement, l'exécution continue après, invisible pour le
 * navigateur). Le bouton "GÉNÉRER FICHE" ne peut donc plus afficher le
 * résultat dans la foulée — il doit avertir l'admin que la génération est
 * en cours (~6-7 minutes) et proposer un bouton "Vérifier maintenant" qui
 * rafraîchit simplement la liste des Fiches (renderFiches()).
 *
 * Déclenchée à la demande depuis le bouton "GÉNÉRER FICHE" du panneau admin
 * (admin.html) — PAS une tâche planifiée (pas de `config.schedule` exporté
 * ici, contrairement à bot-generate-tickets-background.js). NE PAS déclarer
 * dans netlify.toml (même raison que bot-diagnostics.js : le schedule
 * bloquerait l'invocation directe).
 *
 * Réutilise directement les briques de bot-generate-tickets-background.js
 * (extraction des marchés, construction de fiche, publication en base) via
 * require() — volontairement PAS une copie séparée.
 *
 * SÉCURITÉ : accessible uniquement à un compte avec profiles.role='admin'.
 * Le jeton d'accès Supabase de la session admin est transmis en en-tête
 * Authorization et vérifié ici auprès de Supabase Auth avant toute
 * génération — la vérification a toujours lieu même en Background, mais
 * un rejet (401/403) n'est plus visible par l'admin dans l'immédiat
 * (aucune réponse ne lui parvient) : seule l'absence de nouvelle fiche
 * dans la liste le révèle. Le bouton reste de toute façon caché derrière
 * l'authentification admin déjà en place côté panneau.
 * ============================================================================
 */

const bot = require('./bot-generate-tickets-background.js');

const {
  verifierConfigSupabase, sbSelect, partsHaiti, heureHaitiDuMatch,
  resetStats, stats, recupererFixturesJour, recupererCoteParFixture,
  extraireMarchesFoot, construireFiche, construireFicheScoreExact,
  publierFiche, ALLOWED_LEAGUES_FOOT, TOP_LEAGUES_FOOT,
  recupererFiabiliteMarches, annoterPoolAvecFiabilite, attendre,
  getQuotaInterneEpuise
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
// comme les USA — voir commentaire d'en-tête de bot-generate-tickets-background.js).
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

  const { playDate, heureDebut, heureFin, sport, plans, coteMax, nombreMatchs, mode, publishMode, scheduledAt } = body;
  // mode==='exact' (27/08, bouton admin "GÉNÉRER SCORE EXACT" demandé par
  // James) : génère UNIQUEMENT des fiches score-exact, l'admin choisit le
  // NOMBRE de matchs (3-6) au lieu d'une cote cible. Toute autre valeur
  // (ou absence de mode) garde le comportement normal existant, inchangé.
  const modeScoreExact = mode === 'exact';

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
    // diagnostiquerNBA/diagnostiquerBasket dans bot-generate-tickets-background.js,
    // l'API NBA v2 n'expose même aucune cote). Refuser clairement plutôt
    // que de publier une fiche construite sur des données inventées.
    return jsonResponse(400, { erreur: 'Basketball/NBA : génération manuelle pas encore disponible (aucune source de cotes fiable branchée pour l\'instant). Football uniquement pour le moment.' });
  }
  const rangsDemandes = Array.isArray(plans) ? plans.map(Number).filter(n => n >= 1 && n <= 4) : [];
  if (!rangsDemandes.length) {
    return jsonResponse(400, { erreur: 'Choisissez au moins un plan.' });
  }
  const coteMaxDemandee = Number(coteMax);
  if (!modeScoreExact && (!isFinite(coteMaxDemandee) || coteMaxDemandee <= 1.01)) {
    return jsonResponse(400, { erreur: 'Cote maximale invalide (doit être > 1.01).' });
  }
  const nombreMatchsDemande = Math.round(Number(nombreMatchs));
  if (modeScoreExact && (!isFinite(nombreMatchsDemande) || nombreMatchsDemande < 3 || nombreMatchsDemande > 6)) {
    return jsonResponse(400, { erreur: 'Nombre de matchs invalide (entre 3 et 6 pour une fiche score exact).' });
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

  // Plafond 60 (28/08 v5, restauré) : cette fonction tourne désormais en
  // Background (15 minutes) — peut examiner autant de candidats que le bot
  // automatique, avec le même espacement entre appels /odds ci-dessous.
  const PLAFOND_APPELS_COTES = 60;
  candidats.sort((a, b) => (b.prioritaire ? 1 : 0) - (a.prioritaire ? 1 : 0));
  if (candidats.length > PLAFOND_APPELS_COTES) candidats = candidats.slice(0, PLAFOND_APPELS_COTES);

  if (!candidats.length) {
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucun match disponible dans la fenêtre horaire choisie pour cette date.' }))
    });
  }

  let poolFoot = [];
  // Même rythme que bot-generate-tickets-background.js (28/08 v5) : 6.5s
  // entre chaque appel /odds, possible uniquement parce que cette fonction
  // tourne désormais en Background (15 minutes disponibles).
  const DELAI_ENTRE_APPELS_MS = 6500;
  for (let i = 0; i < candidats.length; i++) {
    if (getQuotaInterneEpuise()) {
      console.log(`[MANUEL] Arrêt anticipé (quota interne épuisé) après ${i}/${candidats.length} candidats.`);
      break;
    }
    const c = candidats[i];
    const oddsItem = await recupererCoteParFixture(c.fixtureId);
    if (oddsItem) poolFoot = poolFoot.concat(extraireMarchesFoot(oddsItem, playDate, noms[c.fixtureId]));
    if (i < candidats.length - 1 && !getQuotaInterneEpuise()) await attendre(DELAI_ENTRE_APPELS_MS);
  }

  if (!poolFoot.length) {
    return jsonResponse(200, {
      resultats: plansChoisis.map(p => ({ rank: p.rank, publie: false, raison: 'Aucune sélection ne passe les filtres de marché pour les matchs disponibles.' }))
    });
  }

  // Fiabilité réelle par championnat+marché (28/08) — même mécanisme que
  // le bot automatique, voir bot-generate-tickets-background.js. Jamais bloquant.
  const carteFiabilite = await recupererFiabiliteMarches();
  annoterPoolAvecFiabilite(poolFoot, carteFiabilite);

  const nbMatchsDisponibles = new Set(poolFoot.map(b => b.fixtureId)).size;
  const buteursUtilises = new Set();
  // Partie 1/2/3/4/9 (27/08, spec anti-doublon de James — même mécanisme
  // central que bot-generate-tickets-background.js, voir construireFiche) :
  // - selectionsExclues : toute sélection déjà publiée AUJOURD'HUI, pour
  //   CE sport, qu'elle vienne du bot automatique ou d'une génération
  //   manuelle précédente le même jour (protège aussi contre deux clics
  //   admin successifs sur GÉNÉRER FICHE — idempotence, Partie 9).
  // - equipesUtilisees : compteur d'apparitions par équipe, max 2/jour,
  //   jamais appliqué au score exact (Partie 4).
  // Sans repli possible : si le contenu restant est épuisé, le plan reste
  // simplement sans fiche PROPRE (Partie 6/7 — jamais de doublon forcé),
  // ses abonnés restent couverts par le rang inférieur via la cascade
  // d'accès (minPlan<=rang abonné).
  const cleSelection = s => `${s.fixture_id || s.fixtureId}|${s.market}|${s.pick}`;
  const selectionsExclues = new Set();
  // Exclusion au niveau du MATCH ENTIER (28/08, demande explicite de James
  // — voir bot-generate-tickets-background.js/construireFiche pour le détail) : jamais
  // un même match dans 2 fiches différentes, même avec des marchés
  // différents ("V1" dans une fiche, "X2" dans une autre créerait de la
  // confusion pour l'abonné).
  const fixturesExclues = new Set();
  try {
    const legsExistants = await sbSelect('ticket_legs',
      `select=fixture_id,market,pick,tickets!inner(play_date,sport)&tickets.play_date=eq.${playDate}&tickets.sport=eq.${sport}`);
    legsExistants.forEach(l => { selectionsExclues.add(cleSelection(l)); fixturesExclues.add(l.fixture_id); });
  } catch (e) {
    // Non bloquant : au pire on revient au comportement sans protection
    // cross-run, jamais une raison de bloquer une génération manuelle.
  }
  const equipesUtilisees = new Map();
  // Suffixe de génération (26/08) : garantit un code unique même si
  // l'admin génère plusieurs fois le même plan le même jour — l'anti-
  // doublon normal (dejaGenereAujourdhui) est volontairement IGNORÉ ici,
  // c'est le sens même de la génération manuelle.
  const horodatage = partsHaiti(new Date()).heure.replace(':', '') + String(new Date().getSeconds()).padStart(2, '0');
  const codePrefix = `ADM${horodatage}`;

  // UNE SEULE fiche par génération manuelle (28/08, demande explicite de
  // James : "toujours une seule à chaque génération manuelle, même si on a
  // choisi [des plans dont le] min dépasse les petits plans") — même
  // principe que la Partie 7 du cahier des charges anti-doublon (27/08) :
  // "une fiche peut être partagée entre plusieurs plans, jamais 4 copies
  // physiques inutiles". Avant ce correctif, chaque plan coché recevait sa
  // PROPRE fiche construite séparément (jusqu'à 4 lignes en base pour un
  // seul clic) ; maintenant, UNE seule fiche est construite, ancrée sur le
  // plan de rang le PLUS BAS parmi ceux cochés — min_plan_rank la rend
  // automatiquement visible à tous les plans cochés via la cascade d'accès
  // (minPlan<=rang abonné), sans jamais créer de doublon physique.
  const publierOptions = {
    source: 'admin', published: !programmee,
    scheduledPublishAt: programmee ? scheduledPublishAtIso : null,
    forcerExemption: true, codePrefix
  };
  const resultats = [];

  if (modeScoreExact) {
    // Seuls les plans cochés qui autorisent réellement le score exact
    // peuvent ancrer la fiche partagée — signalé explicitement pour les
    // autres plans cochés, jamais silencieux.
    const plansEligibles = plansChoisis.filter(p => p.includes_exact_score);
    const plansInexigibles = plansChoisis.filter(p => !p.includes_exact_score);
    plansInexigibles.forEach(p => resultats.push({ rank: p.rank, exact: true, publie: false, raison: 'Ce plan n\'inclut pas les scores exacts — non concerné par cette fiche partagée.' }));

    if (!plansEligibles.length) {
      return jsonResponse(200, { resultats });
    }
    const planPartage = plansEligibles.reduce((a, b) => (a.rank < b.rank ? a : b));
    const ficheExacte = construireFicheScoreExact(poolFoot, planPartage, {
      selectionsExclues, fixturesExclues, nombreMatchsOverride: nombreMatchsDemande,
      // cibleMax reste un plafond de sécurité (jamais le critère d'arrêt en
      // mode nombre-de-matchs) — celui du plan de rang le plus bas cochés
      // (le plus restrictif), pour rester valide pour tous les plans
      // cochés une fois partagée via la cascade d'accès.
      cibleMaxOverride: planPartage.max_total_odd != null ? Number(planPartage.max_total_odd) : undefined
    });
    if (!ficheExacte.valide) {
      resultats.push({ rank: planPartage.rank, exact: true, publie: false, plansConcernes: plansEligibles.map(p => p.rank), raison: `Aucune combinaison possible (${ficheExacte.selections.length} sélection(s) trouvée(s), minimum 3 requis) — contenu déjà utilisé ailleurs aujourd'hui, ou pool trop pauvre.` });
      return jsonResponse(200, { resultats });
    }
    ficheExacte.selections.forEach(s => { selectionsExclues.add(cleSelection(s)); fixturesExclues.add(s.fixtureId); });
    const okExact = await publierFiche(planPartage, ficheExacte, playDate, 'foot', noms, '-EXACT', publierOptions);
    resultats.push({
      rank: planPartage.rank, exact: true, publie: okExact, coteTotale: ficheExacte.coteTotale,
      selections: ficheExacte.selections.length, nombreMatchsDemande,
      plansConcernes: plansEligibles.map(p => p.rank),
      programmee, scheduledPublishAt: scheduledPublishAtIso,
      raison: okExact ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
    });
    return jsonResponse(200, { resultats });
  }

  // Mode normal : ancré sur le plan de rang le plus bas parmi ceux cochés
  // (le plus restrictif) — sa propre cote max borne la fiche partagée,
  // jamais celle d'un plan plus haut, pour rester appropriée aux abonnés
  // du rang le plus bas qui la verront aussi via la cascade d'accès.
  const planPartage = plansChoisis.reduce((a, b) => (a.rank < b.rank ? a : b));
  const planMax = planPartage.max_total_odd != null ? Number(planPartage.max_total_odd) : null;
  const coteMaxEffective = planMax != null ? Math.min(coteMaxDemandee, planMax) : coteMaxDemandee;
  const clamped = planMax != null && coteMaxDemandee > planMax;

  const fiche = construireFiche(poolFoot, planPartage, {
    buteursUtilises, equipesUtilisees, selectionsExclues, fixturesExclues, nbMatchsDisponibles,
    cibleMinOverride: 1.01, cibleMaxOverride: coteMaxEffective
  });

  if (!fiche.valide) {
    resultats.push({ rank: planPartage.rank, publie: false, plansConcernes: plansChoisis.map(p => p.rank), raison: `Aucune combinaison NOUVELLE possible (${fiche.selections.length} sélection(s) trouvée(s), minimum 2 requis) — le contenu disponible est déjà utilisé ailleurs aujourd'hui, ou le pool est trop pauvre.` });
    return jsonResponse(200, { resultats });
  }
  fiche.selections.forEach(s => { selectionsExclues.add(cleSelection(s)); fixturesExclues.add(s.fixtureId); });
  const ok = await publierFiche(planPartage, fiche, playDate, 'foot', noms, '', publierOptions);
  resultats.push({
    rank: planPartage.rank, publie: ok, coteTotale: fiche.coteTotale, selections: fiche.selections.length,
    coteMaxDemandee: coteMaxDemandee, coteMaxAppliquee: coteMaxEffective, clampeAuMaxDuPlan: clamped,
    plansConcernes: plansChoisis.map(p => p.rank),
    programmee, scheduledPublishAt: scheduledPublishAtIso,
    raison: ok ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
  });

  // Fiche score exact dédiée, EN COMPLÉMENT — même principe que le bot
  // quotidien, ancrée sur le même planPartage (si celui-ci n'autorise pas
  // le score exact, aucun complément n'est créé pour cette génération ;
  // utiliser le bouton dédié "GÉNÉRER SCORE EXACT" séparément si voulu).
  if (planPartage.includes_exact_score) {
    const ficheExacte = construireFicheScoreExact(poolFoot, planPartage, {
      selectionsExclues, fixturesExclues, cibleMinOverride: 1.01, cibleMaxOverride: coteMaxEffective
    });
    if (ficheExacte.valide) {
      ficheExacte.selections.forEach(s => { selectionsExclues.add(cleSelection(s)); fixturesExclues.add(s.fixtureId); });
      const okExact = await publierFiche(planPartage, ficheExacte, playDate, 'foot', noms, '-EXACT', publierOptions);
      resultats.push({
        rank: planPartage.rank, exact: true, publie: okExact, coteTotale: ficheExacte.coteTotale,
        selections: ficheExacte.selections.length, plansConcernes: plansChoisis.map(p => p.rank),
        programmee, scheduledPublishAt: scheduledPublishAtIso,
        raison: okExact ? null : (stats.erreurs[stats.erreurs.length - 1] || 'Échec de publication.')
      });
    }
    // Pas de "raison" loguée si score exact invalide : c'est un simple
    // complément optionnel, jamais bloquant pour la fiche normale.
  }

  return jsonResponse(200, { resultats });
}

module.exports.handler = handler;
