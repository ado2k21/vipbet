/* 06/11 : note le lieu approximatif au clic sur « Payer par carte » (Stripe).
   Appelee par le site juste avant d'ouvrir le lien Stripe ; stripe-webhook rattache ensuite
   ce lieu au paiement confirme. N'influence JAMAIS le paiement : toute erreur renvoie 204. */
'use strict';
const C = require('./lib/paiement-commun');
const { lireGeo } = require('./lib/geo-requete');

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: '' };
  try {
    const cfg = C.lireConfig();
    const entetes = event.headers || {};
    const utilisateur = await C.utilisateurDepuisJeton(cfg, entetes.authorization || entetes.Authorization);
    if (!utilisateur) return { statusCode: 204, body: '' };
    const quota = await C.verifierQuota(cfg, 'stripe-geo:user:' + utilisateur.id, 6, 60);
    if (!quota.autorise) return { statusCode: 204, body: '' };
    const geo = lireGeo(entetes);
    if (!geo.geo_country && geo.geo_lat == null) return { statusCode: 204, body: '' };
    await C.sbRequete(cfg, '/rest/v1/stripe_geo_clic?on_conflict=user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: {
        user_id: utilisateur.id, geo_country: geo.geo_country, geo_region: geo.geo_region,
        geo_city: geo.geo_city, geo_lat: geo.geo_lat, geo_lon: geo.geo_lon,
        created_at: new Date().toISOString()
      }
    });
  } catch (e) {
    console.error('[stripe-geo]', e && e.message);
  }
  return { statusCode: 204, body: '' };
};
