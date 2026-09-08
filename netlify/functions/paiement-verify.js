/* =====================================================================
   VIP BETCOTE — paiement-verify
   ---------------------------------------------------------------------
   Appelee par le navigateur au retour de la page du prestataire, puis en
   relance periodique tant que le paiement reste en attente.

   Point de securite central : le retour du navigateur ne CONFIRME jamais
   rien par lui-meme. Il ne fait que DEMANDER une verification, dont la
   seule source de verite est la reponse du prestataire interrogee ici,
   cote serveur. Une URL de retour forgee n'a donc aucun effet.
   ===================================================================== */

'use strict';

const C = require('./lib/paiement-commun.js');

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return C.reponseJson(405, { ok: false, code: 'METHODE_NON_AUTORISEE' });
  }

  const cfg = C.lireConfig();
  if (cfg.manquantes.length) {
    console.error('[paiement-verify] variables manquantes :', cfg.manquantes.join(', '));
    return C.reponseJson(500, { ok: false, code: 'CONFIG_INCOMPLETE' });
  }

  let corps;
  try {
    corps = JSON.parse(event.body || '{}');
  } catch (e) {
    return C.reponseJson(400, { ok: false, code: 'CORPS_INVALIDE' });
  }

  const paymentId = String(corps.payment_id || '').trim();
  const reference = String(corps.reference || '').trim();
  if (!paymentId && !reference) {
    return C.reponseJson(400, { ok: false, code: 'IDENTIFIANT_MANQUANT' });
  }

  const entetes = event.headers || {};
  const utilisateur = await C.utilisateurDepuisJeton(
    cfg, entetes.authorization || entetes.Authorization
  );
  if (!utilisateur) {
    return C.reponseJson(401, { ok: false, code: 'SESSION_INVALIDE' });
  }

  try {
    /* Le filtre user_id est la garantie qu'on ne peut jamais declencher la
       verification — ni lire le statut — du paiement de quelqu'un d'autre,
       meme en connaissant son identifiant. */
    const filtre = paymentId
      ? 'id=eq.' + encodeURIComponent(paymentId)
      : 'reference=eq.' + encodeURIComponent(reference);

    const lignes = await C.sbSelect(
      cfg, 'payments',
      filtre + '&user_id=eq.' + utilisateur.id +
      '&select=id,status,method,plan_id,reference,provider,provider_reference,' +
      'provider_url,expires_at&limit=1'
    );
    const paiement = lignes && lignes[0];
    if (!paiement) return C.reponseJson(404, { ok: false, code: 'PAIEMENT_INTROUVABLE' });

    if (paiement.status === 'confirmed') {
      return C.reponseJson(200, { ok: true, etat: 'confirme', reference: paiement.reference });
    }
    if (paiement.status !== 'pending') {
      return C.reponseJson(200, {
        ok: true, etat: 'clos', status: paiement.status, reference: paiement.reference
      });
    }
    if (!paiement.provider || !paiement.provider_reference) {
      /* Paiement manuel historique (ou Stripe) : rien a verifier ici, il
         reste du ressort de la confirmation admin. */
      return C.reponseJson(200, { ok: true, etat: 'manuel', reference: paiement.reference });
    }

    const res = await C.verifierEtConfirmer(cfg, paiement);

    /* Un paiement toujours en attente ET perime est libere immediatement,
       plutot que d'attendre le prochain passage du poller : la personne
       peut relancer une tentative dans la foulee. */
    if (res.etat === 'attente' && paiement.expires_at &&
        new Date(paiement.expires_at).getTime() < Date.now()) {
      try {
        await C.sbRpc(cfg, 'expirer_paiements_prestataire', {});
        await C.journaliser(cfg, paiement.id, 'expire', { message: 'Delai depasse sans paiement.' });
        return C.reponseJson(200, { ok: true, etat: 'expire', reference: paiement.reference });
      } catch (e) {
        console.error('[paiement-verify] expiration impossible :', e.message);
      }
    }

    return C.reponseJson(200, {
      ok: res.etat !== 'erreur',
      etat: res.etat,
      code: res.code || null,
      reference: paiement.reference,
      url: (res.etat === 'attente') ? (paiement.provider_url || null) : null
    });

  } catch (e) {
    console.error('[paiement-verify] echec :', e && e.message);
    return C.reponseJson(500, { ok: false, code: 'ERREUR_INTERNE' });
  }
};
