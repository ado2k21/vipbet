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
    /* 1. Liberer les tentatives abandonnees. Fait AVANT la lecture pour
       ne pas interroger inutilement le prestataire sur des references
       mortes depuis longtemps. */
    try {
      const res = await C.sbRpc(cfg, 'expirer_paiements_prestataire', {});
      bilan.expires = (res && res.expires) || 0;
    } catch (e) {
      console.error('[paiement-poll] expiration impossible :', e.message);
    }

    /* 2. Tous les paiements encore reellement en attente cote prestataire.
       Les plus anciens d'abord : ce sont ceux qui approchent de leur
       expiration, donc les plus urgents a trancher. */
    const paiements = await C.sbSelect(
      cfg, 'payments',
      'status=eq.pending&provider=not.is.null' +
      '&select=id,status,method,plan_id,reference,provider,provider_reference,expires_at' +
      '&order=created_at.asc&limit=' + MAX_PAR_PASSAGE
    );

    if (!paiements || !paiements.length) {
      console.log('[paiement-poll] aucun paiement en attente. Expires :', bilan.expires);
      return { statusCode: 200, body: JSON.stringify(bilan) };
    }

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

    console.log('[paiement-poll] bilan :', JSON.stringify(bilan));
    return { statusCode: 200, body: JSON.stringify(bilan) };

  } catch (e) {
    console.error('[paiement-poll] echec global :', e && e.message);
    return { statusCode: 500, body: JSON.stringify({ erreur: e && e.message, bilan: bilan }) };
  }
};

/* Documentaire uniquement — seul netlify.toml declenche reellement. */
exports.config = { schedule: '*/3 * * * *' };
