/* =====================================================================
   VIP BETCOTE — paiement-webhook
   ---------------------------------------------------------------------
   Recoit les notifications HTTP POST du prestataire (evenements
   `transaction.created` et `transaction.status_changed`) des que
   `webhook_url` est configuree sur le compte marchand.

   IMPORTANT — ceci n'est PAS un deuxieme chemin de confirmation. La
   regle du projet reste : verifierEtConfirmer() est le SEUL chemin
   d'activation (voir lib/paiement-commun.js). Ce webhook se contente de
   declencher cette meme fonction plus tot que le prochain passage du
   poller planifie (jusqu'a 3 min d'attente sinon) — il rappelle
   /api/paiement-verify aupres du prestataire exactement comme le
   ferait paiement-verify.js ou paiement-poll-background.js, il ne fait
   JAMAIS confiance au contenu du webhook lui-meme pour confirmer un
   paiement.

   Le prestataire l'a documente lui-meme comme "best-effort, non
   garanti a 100%" : le poller planifie (toutes les 3 min) reste donc le
   VRAI filet de securite, inchange. Ce webhook est une optimisation de
   vitesse, jamais une dependance.

   Securite : toute requete doit porter un en-tete X-Webhook-Signature
   valide (HMAC-SHA256 du corps brut, cle = PLOPPLOP_CLIENT_SECRET).
   Sans PLOPPLOP_CLIENT_SECRET configuree cote Netlify, ou sans
   signature valide, la requete est refusee (401) — jamais traitee en
   mode degrade, contrairement au reste du module qui echoue toujours
   ouvert : ici, une signature absente est un signe de non-configuration
   ou de tentative de forgerie, jamais un cas normal a laisser passer.
   ===================================================================== */

'use strict';

const crypto = require('crypto');
const C = require('./lib/paiement-commun.js');

/* Compare la signature recue a celle calculee, en temps constant.
   `hash_hmac('sha256', ...)` cote prestataire correspond a l'algo
   'sha256' cote Node — meme construction que l'exemple PHP fourni par
   le prestataire (`sha256=<hex>`). */
function signatureValide(secret, corpsBrut, enteteRecu) {
  if (!secret || !corpsBrut || !enteteRecu) return false;
  const attendu = 'sha256=' + crypto.createHmac('sha256', secret).update(corpsBrut, 'utf8').digest('hex');
  const a = Buffer.from(attendu);
  const b = Buffer.from(String(enteteRecu).trim());
  if (a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(a, b);
  } catch (e) {
    return false;
  }
}

/* Netlify peut livrer le corps encode en base64 selon le Content-Type
   percu — on ne calcule JAMAIS la signature sur le corps deja parse en
   JSON (le HMAC porte sur les octets bruts exacts envoyes par le
   prestataire, un JSON.stringify ne redonnerait pas forcement le meme
   texte, ex. ordre des cles ou espacement). */
function corpsBrutDepuisEvent(event) {
  if (!event) return '';
  if (event.isBase64Encoded) {
    return Buffer.from(event.body || '', 'base64').toString('utf8');
  }
  return event.body || '';
}

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return C.reponseJson(405, { ok: false, code: 'METHODE_NON_AUTORISEE' });
  }

  const cfg = C.lireConfig();
  if (cfg.manquantes.length) {
    console.error('[paiement-webhook] variables manquantes :', cfg.manquantes.join(', '));
    return C.reponseJson(500, { ok: false, code: 'CONFIG_INCOMPLETE' });
  }

  const secret = (process.env.PLOPPLOP_CLIENT_SECRET || '').trim();
  if (!secret) {
    console.error('[paiement-webhook] PLOPPLOP_CLIENT_SECRET absente — webhook refuse par prudence');
    return C.reponseJson(401, { ok: false, code: 'SIGNATURE_NON_CONFIGUREE' });
  }

  const corpsBrut = corpsBrutDepuisEvent(event);
  const entetes = event.headers || {};
  const signatureRecue = entetes['x-webhook-signature'] || entetes['X-Webhook-Signature'] || '';

  if (!signatureValide(secret, corpsBrut, signatureRecue)) {
    console.error('[paiement-webhook] signature invalide ou absente');
    return C.reponseJson(401, { ok: false, code: 'SIGNATURE_INVALIDE' });
  }

  let payload;
  try {
    payload = JSON.parse(corpsBrut || '{}');
  } catch (e) {
    return C.reponseJson(400, { ok: false, code: 'CORPS_INVALIDE' });
  }

  const evenement = String(payload.event || '');
  const trans = payload.transaction || {};
  const referencePrestataire = String(trans.reference_id || '').trim();

  if (!referencePrestataire) {
    return C.reponseJson(200, { ok: true, code: 'IGNORE_SANS_REFERENCE' });
  }

  /* transaction.created : purement informatif, la ligne payments existe
     deja (creee par paiement-create AVANT l'appel au prestataire). On
     journalise pour l'audit et on repond, rien d'autre a faire. */
  if (evenement === 'transaction.created') {
    try {
      const lignes = await C.sbSelect(
        cfg, 'payments',
        'provider_reference=eq.' + encodeURIComponent(referencePrestataire) + '&select=id&limit=1'
      );
      const paiement = lignes && lignes[0];
      await C.journaliser(cfg, paiement ? paiement.id : null, 'webhook_created', { payload });
    } catch (e) {
      console.error('[paiement-webhook] journalisation transaction.created impossible :', e.message);
    }
    return C.reponseJson(200, { ok: true, code: 'RECU' });
  }

  if (evenement !== 'transaction.status_changed') {
    return C.reponseJson(200, { ok: true, code: 'EVENEMENT_IGNORE' });
  }

  const nouveauStatut = String(trans.new_status || '').toLowerCase();

  try {
    const lignes = await C.sbSelect(
      cfg, 'payments',
      'provider_reference=eq.' + encodeURIComponent(referencePrestataire) +
      '&select=id,status,method,plan_id,reference,provider,provider_reference,expires_at&limit=1'
    );
    const paiement = lignes && lignes[0];
    if (!paiement) {
      console.error('[paiement-webhook] aucun paiement pour reference prestataire', referencePrestataire);
      return C.reponseJson(200, { ok: true, code: 'PAIEMENT_INTROUVABLE' });
    }

    await C.journaliser(cfg, paiement.id, 'webhook_status_changed', { payload });

    if (paiement.status !== 'pending') {
      /* Deja confirme (ou clos) par le poller ou par le retour navigateur
         avant l'arrivee du webhook — parfaitement normal, rien a refaire. */
      return C.reponseJson(200, { ok: true, etat: paiement.status, code: 'DEJA_TRAITE' });
    }

    if (nouveauStatut !== 'ok') {
      /* "no"/"pending"/"failed" : on ne fait rien de plus ici, le poller
         planifie reste responsable de l'expiration eventuelle — le
         webhook n'a pas vocation a dupliquer cette logique. */
      return C.reponseJson(200, { ok: true, etat: 'attente', code: 'STATUT_' + (nouveauStatut || 'INCONNU').toUpperCase() });
    }

    /* new_status === 'ok' : on redemande confirmation au VRAI chemin
       unique, qui revalide lui-meme aupres du prestataire (jamais de
       confiance aveugle au contenu du webhook) puis appelle la RPC
       securisee cote base. */
    const res = await C.verifierEtConfirmer(cfg, paiement);
    return C.reponseJson(200, { ok: res.etat !== 'erreur', etat: res.etat, code: res.code || null });

  } catch (e) {
    console.error('[paiement-webhook] echec :', e && e.message);
    /* 200 volontaire malgre l'echec interne : le prestataire ne re-emet
       jamais un webhook en echec de livraison (documente par lui-meme),
       donc renvoyer une erreur HTTP n'apporterait aucune nouvelle
       tentative — seulement du bruit cote prestataire. Le poller
       planifie reprendra ce paiement au prochain passage de toute facon. */
    return C.reponseJson(200, { ok: false, code: 'ERREUR_INTERNE' });
  }
};
