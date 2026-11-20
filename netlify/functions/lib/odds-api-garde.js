'use strict';
// ============================================================================
// Garde-fou The Odds API (20/11) — partagé par la création des fiches basket
// et le calcul des résultats.
//
// Constat du 20/11 (base) : 500 crédits/mois, 48 → 46 → 44 restants du 16 au
// 18/11 puis 4 le 19/11 et 0 le 20/11. Le calcul des résultats interrogeait
// /scores toutes les heures (≈2 crédits par appel) sans jamais compter ses
// appels, et la création des fiches rappelait /odds à chaque passage.
// Une fois le quota épuisé, la réponse « Usage quota has been reached »
// (OUT_OF_USAGE_CREDITS) était lue par l'alerte comme « site Netlify refusé ».
//
// Ce module :
//   1) reconnaît la réponse « quota épuisé » et pose un marqueur 12 h : plus
//      aucun appel The Odds API pendant ce temps (création ET calcul) ;
//   2) met en cache les réponses (/odds 1 fois par jour, /scores 3 h) ;
//   3) compte chaque appel réel (api_quota_usage, provider odds-api-basketball)
//      et enregistre les crédits restants lus dans les en-têtes.
// Rien n'est bloquant : un incident Supabase retombe sur l'appel normal.
// ============================================================================

const PROVIDER_QUOTA = 'odds-api-basketball';
const PROVIDER_CACHE = 'api-sports-basketball';   // même ligne de cache que le basket (table api_fixtures_cache)
const CLE_MARQUEUR_QUOTA = 'oddsapi-quota-epuise';
const TTL_MARQUEUR_QUOTA_MS = 12 * 60 * 60 * 1000;
const COMPTEUR_MAX = 100000;                        // compteur seulement : jamais un refus

function estReponseQuotaEpuise(status, texte) {
  return (Number(status) === 401 || Number(status) === 429)
    && /quota has been reached|OUT_OF_USAGE_CREDITS/i.test(String(texte || ''));
}

function creer({ sbSelect, sbRpc, erreurs }) {
  const noter = m => { try { if (Array.isArray(erreurs)) erreurs.push(m); } catch (_) { /* rien */ } };

  async function lireCache(cle, ttlMs) {
    try {
      const rows = await sbSelect('api_fixtures_cache', `select=payload,fetched_at&provider=eq.${PROVIDER_CACHE}&cle=eq.${encodeURIComponent(cle)}&limit=1`);
      if (rows && rows.length) {
        const age = Date.now() - new Date(rows[0].fetched_at).getTime();
        if (age >= 0 && age < ttlMs) return rows[0].payload;
      }
    } catch (_) { /* jamais bloquant */ }
    return null;
  }
  async function ecrireCache(cle, payload) {
    try { await sbRpc('cache_api_fixtures_upsert', { p_provider: PROVIDER_CACHE, p_cle: cle, p_payload: payload }); }
    catch (_) { /* jamais bloquant */ }
  }

  // true = quota mensuel épuisé constaté il y a moins de 12 h : ne pas appeler.
  async function quotaEpuise() {
    const m = await lireCache(CLE_MARQUEUR_QUOTA, TTL_MARQUEUR_QUOTA_MS);
    return !!(m && m.epuise === true);
  }

  // À appeler après CHAQUE réponse réelle de The Odds API (réussie ou non).
  async function apresAppel(resp, texteErreur) {
    try { await sbRpc('increment_api_quota', { p_provider: PROVIDER_QUOTA, p_max: COMPTEUR_MAX }); }
    catch (e) { noter('compteur_odds_api: ' + e.message); }
    try {
      const restant = resp && resp.headers ? resp.headers.get('x-requests-remaining') : null;
      const utilise = resp && resp.headers ? resp.headers.get('x-requests-used') : null;
      if (restant !== null && restant !== undefined && restant !== '') {
        const r = parseInt(restant, 10), u = parseInt(utilise, 10);
        await sbRpc('record_real_api_quota', {
          p_provider: PROVIDER_QUOTA, p_remaining: r, p_limit: Number.isFinite(u) ? r + u : null
        });
      }
    } catch (e) { noter('suivi_quota_odds_api: ' + e.message); }
    if (resp && !resp.ok && estReponseQuotaEpuise(resp.status, texteErreur)) {
      await ecrireCache(CLE_MARQUEUR_QUOTA, { epuise: true, vu_le: new Date().toISOString() });
    }
  }

  return { quotaEpuise, apresAppel, lireCache, ecrireCache };
}

module.exports = { creer, estReponseQuotaEpuise, PROVIDER_QUOTA, CLE_MARQUEUR_QUOTA };
