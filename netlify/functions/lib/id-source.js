'use strict';

// ============================================================================
// Identifiants de matchs : conversion d'un id The Odds API vers un entier.
//
// POURQUOI (30/09) : la colonne ticket_legs.fixture_id est un BIGINT en base
// (et le restera — index, anti-doublon et règlement en dépendent). Or The Odds
// API identifie ses matchs par une chaîne hexadécimale de 32 caractères
// (ex: "a1b2c3d4e5f60718293a4b5c6d7e8f90"), que Postgres refuse d'insérer dans
// un bigint (erreur 22P02) — la fiche serait perdue à la publication.
//
// SOLUTION : on encode l'id en ENTIER NÉGATIF, calculé à partir des 13
// premiers caractères hexadécimaux (52 bits, donc toujours inférieur à
// 2^53 - 1 : entier sûr en JavaScript ET en JSON). Un id API-Sports est
// toujours un entier POSITIF, donc les deux espaces d'identifiants ne se
// chevauchent jamais, et le signe suffit à retrouver la source au règlement.
//
// Le même encodage est appliqué des deux côtés (génération et règlement) :
// c'est ce qui permet de retrouver le score d'un match à partir du seul
// fixture_id stocké en base, sans colonne supplémentaire ni table de
// correspondance.
// ============================================================================

const LONGUEUR_PREFIXE_HEX = 13; // 13 chiffres hexadécimaux = 52 bits < 2^53

// Retourne un entier négatif, ou null si l'id est absent / illisible.
// Ne lève jamais d'exception : l'appelant écarte simplement l'évènement.
function oddsApiIdVersEntier(idHex) {
  const s = String(idHex == null ? '' : idHex).trim().toLowerCase();
  if (!/^[0-9a-f]+$/.test(s) || s.length < LONGUEUR_PREFIXE_HEX) return null;
  const n = parseInt(s.slice(0, LONGUEUR_PREFIXE_HEX), 16);
  if (!Number.isSafeInteger(n) || n <= 0) return null; // 0 exclu : -0 serait ambigu
  return -n;
}

// Vrai si ce fixture_id (tel que lu en base) vient de The Odds API.
// API-Sports n'a JAMAIS utilisé autre chose qu'un entier strictement positif.
function estIdOddsApi(fixtureId) {
  if (fixtureId === null || fixtureId === undefined || fixtureId === '') return false;
  const n = Number(fixtureId);
  return Number.isSafeInteger(n) && n < 0;
}

module.exports = { oddsApiIdVersEntier, estIdOddsApi, LONGUEUR_PREFIXE_HEX };
