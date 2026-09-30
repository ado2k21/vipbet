/* =====================================================================
   VIP BETCOTE — paiement-poll-background
   ---------------------------------------------------------------------
   Filet de securite du paiement automatique.

   L'API du prestataire n'offre AUCUN webhook : sa documentation demande
   explicitement de relancer paiement-verify jusqu'au passage a « ok ».
   Sans cette fonction, quelqu'un qui paie puis ferme son navigateur ne
   serait jamais active — il aurait paye pour rien.

   IMPORTANT (lecon des 27/08 et 08/09) : une fonction planifiee n'est
   reellement appelee que si elle est declaree dans netlify.toml. Le
   config.schedule ci-dessous est purement documentaire.

   ORDRE CORRIGE LE 29/09 (etait invers auparavant) : on verifie D'ABORD
   le statut REEL aupres du prestataire pour chaque paiement encore
   pending, et on n'expire qu'APRES cette verification fraiche. L'ancien
   ordre (expirer puis lire) pouvait marquer "echec" un paiement en train
   d'etre reellement confirme au meme instant cote prestataire (USSD +
   saisie du code PIN pouvant prendre 1-2 min, plus avec un reseau
   lent) — quelqu'un qui a ferme son navigateur pile a l'expiration
   aurait alors paye pour rien, sans jamais etre repêche. Avec ce nouvel
   ordre, un paiement qui vient de passer a "ok" est deja confirme et
   n'est donc plus status='pending' au moment ou expirer_paiements_
   prestataire s'execute — il ne peut plus jamais etre expire par erreur.
   C'est ce correctif qui rend sur de reduire PLOPPLOP_PENDING_TTL_MIN
   (15 min a l'origine, ramene a 10 min le 29/09 une fois ce correctif
   en place).
   ===================================================================== */

'use strict';

const C = require('./lib/paiement-commun.js');

/* L'API renvoie 429 au-dela d'un certain rythme : on laisse respirer
   entre deux verifications plutot que de risquer un blocage global. */
const PAUSE_MS = 400;
const MAX_PAR_PASSAGE = 40;

function pause(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

exports.handler = async function () {
  const cfg = C.lireConfig();
  if (cfg.manquantes.length) {
    console.error('[paiement-poll] variables manquantes :', cfg.manquantes.join(', '));
    return { statusCode: 500, body: 'config incomplete' };
  }

  const bilan = { vus: 0, confirmes: 0, attente: 0, refuses: 0, erreurs: 0, expires: 0 };

  try {
    /* 1. Tous les paiements encore reellement en attente cote prestataire,
       verifies AVANT toute expiration. Les plus anciens d'abord : ce sont
       ceux qui approchent de (ou ont deja depasse) leur expiration, donc
       les plus urgents a trancher pendant qu'il en est encore temps. */
    const paiements = await C.sbSelect(
      cfg, 'payments',
      'status=eq.pending&provider=not.is.null' +
      '&select=id,status,method,plan_id,reference,provider,provider_reference,expires_at' +
      '&order=created_at.asc&limit=' + MAX_PAR_PASSAGE
    );

    if (paiements && paiements.length) {
      for (let i = 0; i < paiements.length; i++) {
        const p = paiements[i];
        bilan.vus++;
        try {
          const res = await C.verifierEtConfirmer(cfg, p);
          if (res.etat === 'confirme') {
            bilan.confirmes++;
            console.log('[paiement-poll] confirme :', p.reference, res.code);
          } else if (res.etat === 'attente') {
            bilan.attente++;
          } else if (res.etat === 'refuse') {
            bilan.refuses++;
            /* Un refus n'est jamais silencieux : c'est exactement le cas
               ou quelqu'un a paye moins que le prix du plan, ou avec une
               methode differente. Il doit remonter a l'admin. */
            console.error('[paiement-poll] REFUS :', p.reference, JSON.stringify(res));
          } else if (res.etat === 'erreur') {
            bilan.erreurs++;
            console.error('[paiement-poll] erreur :', p.reference, res.code, res.message || '');
          }
        } catch (e) {
          bilan.erreurs++;
          console.error('[paiement-poll] exception sur', p.reference, ':', e.message);
        }
        if (i < paiements.length - 1) await pause(PAUSE_MS);
      }
    }

    /* 2. Liberer les tentatives abandonnees — fait APRES la verification
       ci-dessus, jamais avant : tout paiement reellement passe a "ok"
       vient deja d'etre confirme (donc n'est plus status='pending') et
       ne peut plus se faire expirer par erreur ici. */
    try {
      const res = await C.sbRpc(cfg, 'expirer_paiements_prestataire', {});
      bilan.expires = (res && res.expires) || 0;
    } catch (e) {
      console.error('[paiement-poll] expiration impossible :', e.message);
    }

    console.log('[paiement-poll] bilan :', JSON.stringify(bilan));
    return { statusCode: 200, body: JSON.stringify(bilan) };

  } catch (e) {
    console.error('[paiement-poll] echec global :', e && e.message);
    return { statusCode: 500, body: JSON.stringify({ erreur: e && e.message, bilan: bilan }) };
  }
};

/* Documentaire uniquement — seul netlify.toml declenche reellement. */
exports.config = { schedule: '*/3 * * * *' };
