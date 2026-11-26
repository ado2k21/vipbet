'use strict';
/* 26/11 (James : « NBA en priorite ; sans NBA 2/3/4 matchs seulement ; exclure ceux qui echouent
   toujours ; ne pas casser le systeme ») — test du bot basket :
   1. apprentissage par championnat : un championnat qui perd nettement est ecarte, jamais la NBA,
      jamais avec moins de 15 resultats ;
   2. jour sans NBA (option kMax = 4) : 2 a 4 matchs, meme cote du jour, jamais la methode gloutonne ;
   3. sans l'option kMax, la cascade donne EXACTEMENT le meme resultat qu'avant (option VIEUX_BOT :
      chemin d'une copie de l'ancienne version, pour la comparaison).
   Lancer : node tests/basket-fiche-courte.test.js */
const assert = require('assert');
const path = require('path');
const app = require('../netlify/functions/lib/basket-apprentissage.js');
const bot = require('../netlify/functions/bot-generate-tickets-basket-background.js');

let ok = 0;
function cas(nom, f) { f(); ok++; console.log('OK  ', nom); }

function graine(s) { let a = s | 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function lignes(league, pays, n, tauxGagne, odd, debut) {
  const r = graine(debut || 7), out = [];
  for (let i = 0; i < n; i++) out.push({ play_date: '2026-11-' + String(1 + (i % 25)).padStart(2, '0'), game_id: (debut || 0) * 1000 + i, market: 'mk_basket_1x2', pick: 'Victoire : Home', odd, result: r() < tauxGagne ? 'won' : 'lost', league, league_country: pays });
  return out;
}

cas('championnat perdant ecarte, NBA jamais, petit echantillon jamais', () => {
  const data = [].concat(
    lignes('Euroleague', 'Europe', 190, 0.50, 1.5, 1),       // annonce 67 %, reel ~50 %
    lignes('NBA', 'USA', 60, 0.35, 1.5, 2),                    // tres mauvais mais NBA : jamais ecartee
    lignes('Petite Ligue', 'X', 10, 0.10, 1.5, 3),             // 10 resultats : jamais ecartee
    lignes('ABA League', 'Europe', 60, 0.70, 1.5, 4));         // bonne ligue
  const c = app.calculerCalibration(data);
  assert.strictEqual(c.ligues['Euroleague|Europe'].exclu, true);
  assert.strictEqual(c.ligues['NBA|USA'].exclu, false);
  assert.strictEqual(c.ligues['Petite Ligue|X'].exclu, false);
  assert.strictEqual(c.ligues['ABA League|Europe'].exclu, false);
  const pool = [{ league: 'Euroleague', leagueCountry: 'Europe', market: 'mk_basket_1x2', pick: 'Victoire : Home', odd: 1.5 },
                { league: 'NBA', leagueCountry: 'USA', market: 'mk_basket_1x2', pick: 'Victoire : Home', odd: 1.5 },
                { league: 'Inconnue', leagueCountry: 'Y', market: 'mk_basket_1x2', pick: 'Victoire : Home', odd: 1.5 }];
  app.appliquerCalibration(pool, c);
  assert.deepStrictEqual(pool.map(b => b.ligueExclue), [true, false, false]);
  app.appliquerCalibration(pool, null);                       // pas de calibration : rien n'est ecarte
  assert.deepStrictEqual(pool.map(b => b.ligueExclue), [false, false, false]);
});

function poolAleatoire(seed, nbMatchs) {
  const r = graine(seed), pool = [];
  for (let g = 1; g <= nbMatchs; g++) {
    const nba = r() < 0.3;
    const o1 = Math.round((1.2 + r() * 1.0) * 100) / 100;
    pool.push({ gameId: seed * 100 + g, market: 'mk_basket_1x2', pick: 'Victoire : Home', odd: o1, league: nba ? 'NBA' : 'Liga', leagueCountry: nba ? 'USA' : 'X', scoreFiabilite: 1 / o1 + (r() - 0.5) * 0.1, facteurSegment: 0.9 });
    if (r() < 0.6) { const o2 = Math.round((1.6 + r() * 0.5) * 100) / 100; pool.push({ gameId: seed * 100 + g, market: 'mk_basket_total', pick: (r() < 0.5 ? 'Plus' : 'Moins') + ' de 160.5 points', odd: o2, league: nba ? 'NBA' : 'Liga', leagueCountry: nba ? 'USA' : 'X', scoreFiabilite: 1 / o2, facteurSegment: 0.88 }); }
  }
  return pool;
}

cas('jour sans NBA : 2 a 4 matchs, cote <= cible x 1,05', () => {
  let fiches = 0;
  for (let s = 1; s <= 150; s++) {
    const pool = poolAleatoire(s, 4 + (s % 15));
    for (const cible of [2, 4, 7, 10]) {
      const c = bot.cascadeFicheBasket(pool, cible, graine(s), { kMax: bot.MAX_SELECTIONS_SANS_NBA });
      if (!c.fiche) continue;
      fiches++;
      assert.ok(c.fiche.selections.length >= 2 && c.fiche.selections.length <= 4, 'nb selections ' + c.fiche.selections.length);
      assert.ok(c.fiche.coteTotale <= cible * 1.05 + 1e-9, 'cote ' + c.fiche.coteTotale);
      assert.strictEqual(new Set(c.fiche.selections.map(b => b.gameId)).size, c.fiche.selections.length);
    }
  }
  assert.ok(fiches > 400, 'assez de fiches testees : ' + fiches);
});

cas('cotes hautes toujours possibles sans NBA : cote 14-20 en 4 matchs max', () => {
  assert.strictEqual(bot.MAX_SELECTIONS_SANS_NBA, 4);
  let jours = 0, atteintes = 0;
  for (let s = 1; s <= 100; s++) {
    const pool = poolAleatoire(1000 + s, 18);                   // journee riche, sans NBA ou presque
    for (const cible of [14, 17, 19, 20]) {
      const c = bot.cascadeFicheBasket(pool, cible, graine(s), { kMax: bot.MAX_SELECTIONS_SANS_NBA });
      jours++;
      if (!c.fiche) continue;
      assert.ok(c.fiche.selections.length <= 4);
      if (c.cibleRetenue === cible) atteintes++;
    }
  }
  console.log(`      cote 14-20 atteinte en 4 matchs max : ${atteintes}/${jours} journees riches`);
  assert.ok(atteintes / jours > 0.8);
});

cas('fiche courte impossible -> aucune fiche (jamais l\'ancienne methode qui empile les matchs)', () => {
  const pool = [1, 2, 3, 4, 5, 6].map(g => ({ gameId: g, market: 'mk_basket_1x2', pick: 'Victoire : Home', odd: 1.21, league: 'Liga', scoreFiabilite: 0.8, facteurSegment: 0.9 }));
  const c = bot.cascadeFicheBasket(pool, 5, graine(1), { kMax: 4 });   // 1,21^4 = 2,14 : seulement le dernier palier
  if (c.fiche) assert.ok(c.fiche.selections.length <= 4);
});

const VIEUX = process.env.VIEUX_BOT;
if (VIEUX) {
  cas('365 dates (tirage reel 2-20), jour sans NBA : ancien vs nouveau', () => {
    const ancien = require(path.resolve(VIEUX));
    const A = { n: 0, matchs: 0, cotes: [] }, N = { n: 0, matchs: 0, cotes: [] };
    for (let d = 0; d < 365; d++) {
      const date = new Date(Date.UTC(2026, 0, 1) + d * 86400000).toISOString().slice(0, 10);
      const cible = bot.tirerCibleDuJourBasket(date);
      const pool = poolAleatoire(5000 + d, 16).map(b => Object.assign({}, b, { league: 'Liga' }));
      const a = ancien.cascadeFicheBasket(pool, cible, graine(d), { partTotaux: 1 / 3 });
      const n = bot.cascadeFicheBasket(pool, cible, graine(d), { partTotaux: 1 / 3, kMax: bot.MAX_SELECTIONS_SANS_NBA });
      if (a.fiche) { A.n++; A.matchs += a.fiche.selections.length; A.cotes.push(a.fiche.coteTotale); }
      if (n.fiche) { N.n++; N.matchs += n.fiche.selections.length; N.cotes.push(n.fiche.coteTotale); }
    }
    const resume = X => `${X.n} fiches, ${(X.matchs / X.n).toFixed(1)} matchs en moyenne, cote >= 14 : ${X.cotes.filter(c => c >= 14).length} jours, cote max ${Math.max.apply(null, X.cotes).toFixed(2)}`;
    console.log('      ancien  : ' + resume(A));
    console.log('      nouveau : ' + resume(N));
    assert.ok(N.cotes.filter(c => c >= 14).length > 0, 'des cotes >= 14 restent possibles');
    assert.ok(N.matchs / N.n < A.matchs / A.n, 'moins de matchs par fiche');
  });
}
if (VIEUX) {
  cas('sans kMax : resultat IDENTIQUE a l\'ancienne version (300 pools x 4 cotes)', () => {
    const ancien = require(path.resolve(VIEUX));
    let compares = 0;
    for (let s = 1; s <= 300; s++) {
      const pool = poolAleatoire(s, 3 + (s % 18));
      for (const cible of [2, 5, 9, 17]) {
        const a = ancien.cascadeFicheBasket(pool, cible, graine(s), { partTotaux: 1 / 3 });
        const b = bot.cascadeFicheBasket(pool, cible, graine(s), { partTotaux: 1 / 3 });
        const sig = c => c.fiche ? c.fiche.selections.map(x => x.gameId + x.pick).join(',') + '@' + c.fiche.coteTotale + '/' + c.cibleRetenue : 'aucune';
        assert.strictEqual(sig(b), sig(a), `pool ${s} cible ${cible}`);
        compares++;
      }
    }
    assert.strictEqual(compares, 1200);
  });
  cas('calibration des SEGMENTS identique a l\'ancienne version', () => {
    const ancienApp = require(path.resolve(path.dirname(VIEUX), 'lib/basket-apprentissage.js'));
    const data = [].concat(lignes('Euroleague', 'Europe', 190, 0.5, 1.5, 1), lignes('NBA', 'USA', 80, 0.7, 1.7, 2), lignes('ABA', 'E', 40, 0.6, 2.05, 3));
    const a = ancienApp.calculerCalibration(data), b = app.calculerCalibration(data);
    assert.deepStrictEqual(b.segments, a.segments);
    assert.strictEqual(b.global, a.global);
  });
}
console.log(`\n${ok} cas OK`);
