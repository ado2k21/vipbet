/* 06/11 : lieu approximatif d'un DEPOT MANUEL (MonCash/NatCash avec recu), pour le globe admin.
   Le depot manuel est ecrit par le navigateur, qui n'a pas le droit d'ecrire les colonnes geo_*
   (declencheur trg_payments_protect_geo_cols). Le site appelle donc cette fonction juste apres
   « Soumet resi a » ; elle note le lieu sur le SEUL paiement manuel en attente de la personne
   connectee, cree il y a moins de 15 minutes et sans lieu. Elle ne touche a rien d'autre (ni
   statut, ni montant, ni abonnement) et ne fait JAMAIS echouer l'envoi : toute erreur -> 204.
   Le lieu n'apparait sur le globe qu'apres la validation par l'admin (paiement confirme). */
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
    const quota = await C.verifierQuota(cfg, 'paiement-geo:user:' + utilisateur.id, 6, 60);
    if (!quota.autorise) return { statusCode: 204, body: '' };
    const geo = lireGeo(entetes);
    if (!geo.geo_country && geo.geo_lat == null) return { statusCode: 204, body: '' };
    const depuis = new Date(Date.now() - 15 * 60000).toISOString();
    const lignes = await C.sbSelect(cfg, 'payments',
      'user_id=eq.' + encodeURIComponent(utilisateur.id) +
      '&status=eq.pending&provider=is.null&geo_source=is.null&method=in.(moncash,natcash)' +
      '&created_at=gte.' + encodeURIComponent(depuis) +
      '&select=id&order=created_at.desc&limit=1');
    const p = lignes && lignes[0];
    if (!p) return { statusCode: 204, body: '' };
    await C.sbRequete(cfg, '/rest/v1/payments?id=eq.' + encodeURIComponent(p.id) + '&geo_source=is.null', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: geo
    });
  } catch (e) {
    console.error('[paiement-geo]', e && e.message);
  }
  return { statusCode: 204, body: '' };
};
