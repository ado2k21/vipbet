/**
 * ============================================================================
 * VIP BETCOTE — DIAGNOSTICS DU BOT (Netlify Function, HTTP, normale)
 * Fichier : netlify/functions/bot-diagnostics.js
 * ----------------------------------------------------------------------------
 * RECONSTRUIT le 28/08 v5, suite à la conversion de la génération réelle
 * en fonction "Background" (bot-generate-tickets-background.js, jusqu'à
 * 15 minutes d'exécution pour pouvoir espacer ses appels /odds et respecter
 * la limite de 10 requêtes/minute d'API-Sports — voir ce fichier pour le
 * détail). Une fonction Background ne renvoie JAMAIS de réponse visible
 * (Netlify répond 202 immédiatement, l'exécution continue après, invisible
 * pour l'appelant) — donc tous les modes ?diag=... qui doivent s'afficher
 * directement dans Safari doivent impérativement rester dans une fonction
 * NORMALE, séparée. C'est le rôle de ce fichier.
 *
 * Réutilise directement les briques de bot-generate-tickets-background.js
 * via require() — jamais une copie séparée, même principe que
 * bot-generate-tickets-manual.js : la logique de marché évolue
 * régulièrement, une seconde copie divergerait silencieusement.
 *
 * IMPORTANT : les diagnostics qui appellent /odds par match (oddscoverage,
 * poolpreview) sont plafonnés à 9 candidats ici (pas 60) — cette fonction
 * reste SYNCHRONE (réponse immédiate), donc sous la limite de 10
 * requêtes/minute d'API-Sports SANS avoir besoin d'espacer les appels.
 * Pour un aperçu du pool sur TOUS les candidats du jour (jusqu'à 60,
 * espacés), utiliser la vraie génération en mode test à la place — la
 * base de données fait alors foi (pas de réponse visible non plus, voir
 * plus haut).
 *
 * SÉCURITÉ : même jeton que la génération réelle (BOT_TEST_TOKEN),
 * protège contre un déclenchement par un tiers.
 * ============================================================================
 */

const bot = require('./bot-generate-tickets-background.js');

const {
  verifierConfigSupabase, sbSelect, partsHaiti, heureHaitiDuMatch,
  resetStats, stats, apiSportsGetRaw, apiSportsGet,
  recupererFixturesJour, recupererCoteParFixture, extraireMarchesFoot,
  filtrerCandidatsJour, construireFiche, construireFicheScoreExact,
  ALLOWED_LEAGUES_FOOT, TOP_LEAGUES_FOOT, TZ_HAITI, API_SPORTS_KEY,
  recupererFiabiliteMarches, annoterPoolAvecFiabilite,
  recupererLigues, recupererEquipes, recupererEvenementsBSD,
  diagnostiquerBBSD, diagnostiquerNBA, diagnostiquerBasket,
  FOOT_HOST, NBA_HOST, BASKET_HOST, BSD_API_KEY, BBS_API_KEY,
  BOOKMAKER_ID, dateCibleDemainHaiti
} = bot;

async function handler(event) {
  resetStats();

  const jetonTest = process.env.BOT_TEST_TOKEN || '';
  const jetonFourni = (event.queryStringParameters && event.queryStringParameters.token) || '';
  const modeTest = jetonTest && jetonFourni && jetonFourni === jetonTest;
  if (!modeTest) {
    return { statusCode: 401, body: 'Jeton manquant ou invalide. Utilisez ?token=<BOT_TEST_TOKEN>&diag=<mode>.' };
  }
  if (!event.queryStringParameters || !event.queryStringParameters.diag) {
    return { statusCode: 400, body: 'Ajoutez &diag=<mode>. Modes disponibles : bets, bookmakers-foot, oddscoverage, stats, poolpreview, leagues, teams, bbsd, bsd, basket, nba.' };
  }

  // MODE DIAGNOSTIC LIGUES (25/08) : ?token=...&diag=leagues&q=Portugal,Qatar,...
  // Retourne les vrais id/nom/pays de chaque terme cherché sur API-Sports,
  // pour confirmer un ID avant de l'ajouter aux listes de championnats —
  // n'exécute PAS la génération normale de fiches.
  // MODE DIAGNOSTIC CATALOGUE DES MARCHÉS FOOT : ?token=...&diag=bets
  // Liste tous les types de paris connus d'API-Sports, pour vérifier
  // l'existence réelle et l'ID exact d'un marché (ex. DNB/Handicap 0,
  // recommandé par le document d'optimisation du 25/08) avant d'écrire du
  // code d'extraction dessus — jamais deviner un ID (leçon du 23-24/08).
  if (modeTest && event.queryStringParameters.diag === 'bets') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    try {
      const data = await apiSportsGetRaw(FOOT_HOST, '/odds/bets', {});
      const erreurs = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
      return { statusCode: 200, body: JSON.stringify({
        resultats: (data.response || []).map(b => ({ id: b.id, nom: b.name })),
        erreurApi: (erreurs && erreurs.length) ? erreurs : null
      }, null, 2) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ erreur: e.message }, null, 2) };
    }
  }

  // MODE DIAGNOSTIC BOOKMAKERS FOOT (28/08 v4) : ?token=...&diag=bookmakers-foot
  // Liste tous les bookmakers connus d'API-Sports pour le football — jamais
  // interrogé jusqu'ici (seul BOOKMAKER_ID=8/Bet365 est utilisé en dur).
  // Isolé, lecture seule, 1 SEUL appel API. Sert uniquement à confirmer un
  // vrai ID de bookmaker de repli avant de l'ajouter au code — jamais
  // deviné, même principe que diag=leagues/teams/bets.
  if (modeTest && event.queryStringParameters.diag === 'bookmakers-foot') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    try {
      const data = await apiSportsGetRaw(FOOT_HOST, '/odds/bookmakers', {});
      const erreurs = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
      return { statusCode: 200, body: JSON.stringify({
        resultats: (data.response || []).map(b => ({ id: b.id, nom: b.name })),
        erreurApi: (erreurs && erreurs.length) ? erreurs : null
      }, null, 2) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ erreur: e.message }, null, 2) };
    }
  }

  // MODE DIAGNOSTIC COUVERTURE DES COTES (28/08) : ?token=...&diag=oddscoverage[&date=AAAA-MM-JJ]
  // Répond à la question "pourquoi Premier League/Ligue 1 sont absentes
  // alors que des matchs existent" — SANS toucher à la génération réelle.
  // Compte, par championnat TOP, combien de matchs sont trouvés sur
  // /fixtures vs combien renvoient une cote exploitable via le bookmaker
  // UNIQUE actuellement utilisé (BOOKMAKER_ID=8, Bet365). Si l'écart est
  // important sur un grand championnat, ça confirme qu'il faut un
  // bookmaker de repli — jamais deviné sans ce diagnostic (même principe
  // que diag=leagues/teams : rien n'est ajouté sans une vraie donnée).
  // ATTENTION QUOTA : 1 appel /odds par match TOP trouvé — à lancer une
  // seule fois par jour, pas en boucle (quota partagé 100/jour).
  if (modeTest && event.queryStringParameters.diag === 'oddscoverage') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const dateC = event.queryStringParameters.date || dateCibleDemainHaiti();
    const fixturesJourD = await recupererFixturesJour(dateC);
    // Plafond de 9 appels /odds (28/08 v5) : cette fonction reste SYNCHRONE
    // (réponse immédiate dans le navigateur) — sous la limite de 10
    // requêtes/minute d'API-Sports, aucune pause n'est nécessaire tant
    // qu'on reste sous ce seuil.
    const PLAFOND_DIAG = 9;
    let appelsRestants = PLAFOND_DIAG;
    const parLigue = {};
    for (const f of fixturesJourD) {
      if (appelsRestants <= 0) break;
      const league = f.league, fixture = f.fixture;
      if (!league || !fixture || !TOP_LEAGUES_FOOT.includes(league.id)) continue;
      const clef = `${league.id} — ${league.name}`;
      if (!parLigue[clef]) parLigue[clef] = { matchsTrouves: 0, avecCoteBet365: 0, exemplesSansCote: [] };
      parLigue[clef].matchsTrouves++;
      appelsRestants--;
      const oddsItem = await recupererCoteParFixture(fixture.id);
      if (oddsItem) parLigue[clef].avecCoteBet365++;
      else if (parLigue[clef].exemplesSansCote.length < 3) parLigue[clef].exemplesSansCote.push(`${f.teams.home.name} — ${f.teams.away.name} (fixture ${fixture.id})`);
    }
    return { statusCode: 200, body: JSON.stringify({ date: dateC, parLigue }, null, 2) };
  }

  // MODE DIAGNOSTIC DONNÉES STATISTIQUES (28/08, point 3 du cahier des
  // charges "règles strictes") : ?token=...&diag=stats[&date=AAAA-MM-JJ]
  // AVANT de construire toute logique d'analyse par match (forme, blessures,
  // historique face-à-face — règles 7/8/15/16), on vérifie ce que le plan
  // API-Sports gratuit expose RÉELLEMENT sur ces endpoints. Jamais deviner
  // (même principe que diag=leagues/teams/bets) — un plan gratuit a souvent
  // des restrictions non documentées, découvertes uniquement par un vrai
  // test. Isolé à 100% : lecture seule, aucun impact sur la génération
  // réelle, aucune écriture en base.
  // Teste sur le premier match TOP trouvé pour la date visée (par défaut,
  // demain — même date que la vraie génération).
  if (modeTest && event.queryStringParameters.diag === 'stats') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const dateS = event.queryStringParameters.date || dateCibleDemainHaiti();
    const fixturesJourS = await recupererFixturesJour(dateS);
    const candidat = fixturesJourS.find(f => f.league && TOP_LEAGUES_FOOT.includes(f.league.id) && f.fixture);
    if (!candidat) {
      return { statusCode: 200, body: JSON.stringify({ date: dateS, note: 'Aucun match TOP trouvé pour cette date — retester avec &date=AAAA-MM-JJ sur un jour avec des matchs des grands championnats.' }, null, 2) };
    }
    const fixtureId = candidat.fixture.id;
    const leagueId = candidat.league.id;
    const season = candidat.league.season;
    const equipeDomId = candidat.teams.home.id;
    const equipeExtId = candidat.teams.away.id;
    const rapport = {
      date: dateS,
      matchTeste: `${candidat.teams.home.name} — ${candidat.teams.away.name} (${candidat.league.name}, fixture ${fixtureId})`,
      endpoints: {}
    };

    async function tester(nom, path, params) {
      try {
        const data = await apiSportsGetRaw(FOOT_HOST, path, params);
        const erreurs = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
        rapport.endpoints[nom] = {
          nbResultats: Array.isArray(data.response) ? data.response.length : 0,
          erreurApi: (erreurs && erreurs.length) ? erreurs : null,
          echantillon: Array.isArray(data.response) ? data.response.slice(0, 2) : data.response
        };
      } catch (e) {
        rapport.endpoints[nom] = { erreur: e.message };
      }
    }

    // 1. Blessures/suspensions — pertinent pour les règles 7/8/15 (jamais
    // choisir un buteur ou une victoire sans vérifier les absences).
    await tester('injuries_par_fixture', '/injuries', { fixture: fixtureId });
    // 2. Statistiques d'équipe sur la saison — forme, buts marqués/encaissés
    // domicile/extérieur (règle 7).
    await tester('team_stats_domicile', '/teams/statistics', { team: equipeDomId, league: leagueId, season });
    await tester('team_stats_exterieur', '/teams/statistics', { team: equipeExtId, league: leagueId, season });
    // 3. Historique des confrontations directes — utile pour score exact
    // (règle 16) et BTTS (règle 10).
    await tester('head_to_head', '/fixtures/headtohead', { h2h: `${equipeDomId}-${equipeExtId}`, last: 10 });

    rapport.conclusion = 'Vérifier nbResultats et erreurApi pour chaque endpoint — nbResultats=0 avec erreurApi rempli signifie souvent une restriction de plan (ex. "This endpoint is not available with your subscription").';
    return { statusCode: 200, body: JSON.stringify(rapport, null, 2) };
  }

  // MODE DIAGNOSTIC APERÇU DU POOL (28/08 v3) : ?token=...&diag=poolpreview[&date=AAAA-MM-JJ]
  // MODE DIAGNOSTIC RÉPONSE BRUTE /fixtures (29/08 v6) : ?token=...&diag=rawfixtures[&date=AAAA-MM-JJ]
  // Créé après un cas où /fixtures a renvoyé une liste vide SANS aucun
  // champ "errors" rempli (donc ni notre détection de quota via
  // apiSportsGetRaw, ni un throw HTTP, ne s'est déclenchée) — sur une date
  // dont on savait avec certitude qu'elle avait de vrais matchs quelques
  // heures plus tôt. Montre l'enveloppe COMPLÈTE de la réponse API-Sports
  // (results, paging, parameters, errors — pas seulement le tableau
  // "response" que le reste du code garde d'habitude), pour voir ce qui se
  // passe réellement sans deviner davantage. Isolé, lecture seule, 1 SEUL
  // appel API.
  if (modeTest && event.queryStringParameters.diag === 'rawfixtures') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const dateR = event.queryStringParameters.date || dateCibleDemainHaiti();
    try {
      const data = await apiSportsGetRaw(FOOT_HOST, '/fixtures', { date: dateR, timezone: TZ_HAITI });
      return { statusCode: 200, body: JSON.stringify({
        date: dateR,
        enveloppeComplete: {
          get: data.get, parameters: data.parameters, errors: data.errors,
          results: data.results, paging: data.paging,
          nbDansResponse: Array.isArray(data.response) ? data.response.length : null,
          echantillonResponse: Array.isArray(data.response) ? data.response.slice(0, 2) : data.response
        }
      }, null, 2) };
    } catch (e) {
      return { statusCode: 200, body: JSON.stringify({ date: dateR, erreurLevee: e.message }, null, 2) };
    }
  }

  // Reproduit EXACTEMENT le pipeline de la vraie génération (mêmes appels
  // API, mêmes filtres, même construction de fiche via construireFiche/
  // construireFicheScoreExact — aucune logique dupliquée) mais NE PUBLIE
  // RIEN en base : purement une simulation à blanc, renvoyée directement
  // dans la réponse HTTP. Créé suite à la panne des logs Netlify
  // ("Function logs are currently unavailable") pour pouvoir diagnostiquer
  // sans dépendre d'eux — répond à la place à stats.poolFinal du run réel.
  // Limité à 9 candidats (28/08 v5, fonction synchrone — la vraie
  // génération complète tourne désormais dans bot-generate-tickets-
  // background.js, en fonction Background, avec un vrai espacement).
  if (modeTest && event.queryStringParameters.diag === 'poolpreview') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    try { verifierConfigSupabase(); } catch (e) { return { statusCode: 500, body: e.message }; }
    const dateP = event.queryStringParameters.date || dateCibleDemainHaiti();
    const fixturesJourP = await recupererFixturesJour(dateP);
    const filtreP = filtrerCandidatsJour(fixturesJourP, dateP);
    const nomsP = filtreP.noms;
    // Plafond de 9 (28/08 v5) : fonction SYNCHRONE, jamais 60 ici (ça, c'est
    // le rôle de la vraie génération en fonction Background, qui peut
    // espacer ses appels). Un échantillon de 9 suffit à diagnostiquer.
    const candidatsP = filtreP.candidats.slice(0, 9);

    let poolFootP = [];
    // Suivi explicite réussite/échec des appels /odds (28/08 v4, suite à
    // un taux d'échec suspect de 51/60 matchs) — sans ça, impossible de
    // distinguer "pas de cote Bet365 pour ce match" d'un quota API épuisé
    // en cours de boucle (recupererCoteParFixture absorbe l'erreur et
    // renvoie null dans les deux cas, silencieusement).
    let candidatsAvecCote = 0, candidatsSansCote = 0;
    for (const c of candidatsP) {
      const oddsItem = await recupererCoteParFixture(c.fixtureId);
      if (!oddsItem) { candidatsSansCote++; continue; }
      candidatsAvecCote++;
      poolFootP = poolFootP.concat(extraireMarchesFoot(oddsItem, dateP, nomsP[c.fixtureId]));
    }
    const carteFiabiliteP = await recupererFiabiliteMarches();
    annoterPoolAvecFiabilite(poolFootP, carteFiabiliteP);

    let plansP = [];
    try {
      plansP = await sbSelect('plans', 'select=rank,min_total_odd,max_total_odd,max_leg_odd,includes_exact_score');
      plansP.sort((a, b) => a.rank - b.rank);
    } catch (e) { /* non bloquant pour ce diagnostic */ }

    const nbMatchsDisponiblesP = new Set(poolFootP.map(b => b.fixtureId)).size;
    // Simulation SANS aucune exclusion (Set/Map vides) : montre ce que
    // CHAQUE plan pourrait obtenir individuellement à partir du même pool,
    // pas ce qui resterait après que les plans précédents aient consommé
    // des sélections — donc optimiste par rapport à un vrai passage
    // séquentiel, mais suffisant pour voir si la cible est même atteignable.
    const simulation = plansP.map(plan => {
      const fiche = construireFiche(poolFootP, plan, { nbMatchsDisponibles: nbMatchsDisponiblesP });
      const resultat = {
        rang: plan.rank, cible: [Number(plan.min_total_odd), plan.max_total_odd == null ? null : Number(plan.max_total_odd)],
        valide: fiche.valide, coteObtenue: fiche.coteTotale, nbSelections: fiche.selections.length
      };
      if (plan.includes_exact_score) {
        const fe = construireFicheScoreExact(poolFootP, plan, {});
        resultat.scoreExact = { valide: fe.valide, coteObtenue: fe.coteTotale, nbSelections: fe.selections.length };
      }
      return resultat;
    });

    const parTier = t => poolFootP.filter(b => b.tier === t).length;
    return {
      statusCode: 200,
      body: JSON.stringify({
        date: dateP,
        matchsTrouvesTotal: fixturesJourP.length,
        matchsCandidatsApresFiltres: candidatsP.length,
        // Nouveau (28/08 v4) : distingue "cote reçue mais filtrée" de
        // "aucune cote reçue" (souvent = quota API épuisé en cours de run).
        candidatsAvecCoteRecuperee: candidatsAvecCote,
        candidatsSansCoteRecuperee: candidatsSansCote,
        nbMatchsAvecAuMoinsUneSelection: nbMatchsDisponiblesP,
        poolFinal: { total: poolFootP.length, SAFE: parTier('SAFE'), PREMIUM: parTier('PREMIUM'), EXACT_SCORE: parTier('EXACT_SCORE') },
        // Erreurs brutes API-Sports rencontrées pendant ce run (ex. quota
        // dépassé) — jusque-là silencieusement absorbées par
        // recupererCoteParFixture, jamais visibles dans ce diagnostic.
        // Drapeau visible en un coup d'œil (29/08 v6) — plus besoin de lire
        // toute la liste erreursRencontrees pour repérer un quota dépassé.
        quotaJournalierDepasse: stats.erreurs.some(e => e.includes('QUOTA JOURNALIER DÉPASSÉ')),
        erreursRencontrees: stats.erreurs,
        simulationParPlan: simulation,
        detailSelections: poolFootP.map(b => ({
          match: (nomsP[b.fixtureId] && nomsP[b.fixtureId].label) || b.fixtureId,
          league: b.league, market: b.market, pick: b.pick, odd: b.odd, tier: b.tier
        }))
      }, null, 2)
    };
  }

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
  // VARIANTE PAR CHAMPIONNAT : ?diag=teams&league=307&season=2026 — utile
  // quand la recherche par nom échoue (clubs introuvables sous leur nom
  // usuel, ex. Al Nassr/Al Hilal/Al Ittihad le 25/08) : retourne l'effectif
  // complet du championnat sans dépendre d'une recherche textuelle.
  if (modeTest && event.queryStringParameters.diag === 'teams') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const leagueId = event.queryStringParameters.league;
    if (leagueId) {
      const season = event.queryStringParameters.season || String(new Date().getFullYear());
      try {
        const data = await apiSportsGetRaw(FOOT_HOST, '/teams', { league: leagueId, season });
        const erreurs = data.errors && (Array.isArray(data.errors) ? data.errors : Object.values(data.errors));
        const resultats = (data.response || []).map(item => ({ id: item.team.id, nom: item.team.name }));
        return { statusCode: 200, body: JSON.stringify({
          league: leagueId, season, resultats,
          erreurApi: (erreurs && erreurs.length) ? erreurs : null
        }, null, 2) };
      } catch (e) {
        return { statusCode: 200, body: JSON.stringify({ erreur: e.message }, null, 2) };
      }
    }
    const termes = (event.queryStringParameters.q || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!termes.length) return { statusCode: 400, body: 'Ajouter &q=terme1,terme2,... ou &league=ID&season=AAAA' };
    const resultats = {};
    for (const t of termes) {
      resultats[t] = await recupererEquipes(t);
    }
    return { statusCode: 200, body: JSON.stringify(resultats, null, 2) };
  }

  // MODE DIAGNOSTIC BIG BALLS SPORTS DATA : ?token=...&diag=bbsd[&date=AAAA-MM-JJ]
  // Isolé, lecture seule, aucun impact sur la génération réelle des fiches.
  if (modeTest && event.queryStringParameters.diag === 'bbsd') {
    if (!BBS_API_KEY) return { statusCode: 500, body: 'BBS_API_KEY manquante (variable Netlify).' };
    const dateB = event.queryStringParameters.date || partsHaiti(new Date()).iso;
    const rapport = await diagnostiquerBBSD(dateB);
    return { statusCode: 200, body: JSON.stringify(rapport, null, 2) };
  }

  // MODE DIAGNOSTIC BSD : ?token=...&diag=bsd[&date=AAAA-MM-JJ]
  // (25/08) Vérifie que BSD_API_KEY fonctionne et que des matchs sont bien
  // reçus pour la date visée, AVANT de lancer une vraie génération. Isolé,
  // lecture seule, n'écrit rien en base, n'affecte aucune fiche.
  if (modeTest && event.queryStringParameters.diag === 'bsd') {
    if (!BSD_API_KEY) return { statusCode: 500, body: 'BSD_API_KEY manquante (variable Netlify).' };
    const dateBsd = event.queryStringParameters.date || partsHaiti(new Date()).iso;
    const evenements = await recupererEvenementsBSD(dateBsd);
    return { statusCode: 200, body: JSON.stringify({
      date: dateBsd,
      cleConfiguree: true,
      erreur: stats.bsd.erreur,
      nombreMatchs: evenements.length,
      // Échantillon (10 max) pour vérifier visuellement que les noms
      // d'équipe et les cotes 1X2 ont un sens, sans noyer la réponse.
      echantillon: evenements.slice(0, 10).map(e => ({
        match: `${e.home_team} — ${e.away_team}`,
        odds_home: e.odds_home, odds_draw: e.odds_draw, odds_away: e.odds_away
      }))
    }, null, 2) };
  }

  // MODE DIAGNOSTIC NBA : ?token=...&diag=nba[&date=AAAA-MM-JJ]
  // Quota NBA separe du football : ce test n'entame PAS le quota foot.
  // MODE DIAGNOSTIC BASKETBALL : ?token=...&diag=basket[&date=AAAA-MM-JJ]
  if (modeTest && event.queryStringParameters.diag === 'basket') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    const dateB = event.queryStringParameters.date || partsHaiti(new Date()).iso;
    const rapport = await diagnostiquerBasket(dateB);
    return { statusCode: 200, body: JSON.stringify(rapport, null, 2) };
  }

  if (modeTest && event.queryStringParameters.diag === 'nba') {
    if (!API_SPORTS_KEY) return { statusCode: 500, body: 'API_SPORTS_KEY manquante.' };
    // Par défaut la date d'aujourd'hui en heure Haïti (la NBA joue surtout
    // en soirée américaine = nuit Haïti). Surchargeable avec &date=AAAA-MM-JJ
    // pour tester un jour où l'on sait qu'il y a des matchs.
    const dateNba = event.queryStringParameters.date || partsHaiti(new Date()).iso;
    const rapport = await diagnostiquerNBA(dateNba);
    return { statusCode: 200, body: JSON.stringify(rapport, null, 2) };
  }

  return { statusCode: 400, body: `Mode diag inconnu : "${event.queryStringParameters.diag}".` };
}

module.exports.handler = handler;
