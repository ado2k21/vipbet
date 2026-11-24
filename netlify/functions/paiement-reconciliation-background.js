/* =====================================================================
   VIP BETCOTE — paiement-reconciliation-background
   ---------------------------------------------------------------------
   Filet de rattrapage ajoute le 29/09, en complement de paiement-poll-
   background.js. Cible un cas rare mais reel : une personne qui met plus
   de PLOPPLOP_PENDING_TTL_MIN (10 min) a reellement terminer sa saisie
   USSD + code PIN (reseau tres degrade, interruption, nouvel essai sur
   la meme invite...) alors qu'elle a deja ferme l'onglet du site. Le
   paiement est alors marque 'failed' par expirer_paiements_prestataire
   AVANT que le prestataire ait fini de confirmer sa transaction.

   Sans cette fonction : la personne a paye mais son abonnement ne
   s'active jamais automatiquement — il faudrait qu'un admin s'en
   apercoive manuellement.

   Avec cette fonction : toutes les X minutes, on reinterroge le
   prestataire pour les paiements 'failed' recents lies a un
   provider_reference, et si celui-ci dit desormais "ok", on rouvre le
   paiement (RPC rouvrir_paiement_expire, atomique et reversible) puis on
   repasse par le SEUL chemin de confirmation officiel
   (verifierEtConfirmer), exactement comme partout ailleurs — aucun
   raccourci de securite, aucune confiance aveugle : le montant et la
   methode sont revalides a l'interieur de confirmer_paiement_prestataire
   comme pour n'importe quelle confirmation normale.

   Ce job est volontairement SANS EFFET si rien d'anormal ne s'est
   produit : un paiement 'failed' pour lequel le prestataire dit encore
   "no"/"ok"-jamais-atteint reste tel quel, sans aucune modification.
   ===================================================================== */

'use strict';

const C = require('./lib/paiement-commun.js');
const { chatAlerte } = require('./lib/garde-telegram-alertes');

/* 24/11 (James, paiement auto : « changer de moyen ») : ALERTE ADMIN Telegram (bot d'alertes,
   jamais un groupe VIP) quand un paiement ferme se revele PAYE mais ne peut pas etre rouvert
   (un autre paiement est deja ouvert), ou quand un paiement que l'abonne avait lui-meme ferme
   (bouton « Reeseye », provider_status 'annule_client') est finalement confirme : double
   paiement possible a verifier. UNE seule alerte par paiement et par motif (payment_events).
   Aucune identite client dans le message : reference, moyen, montant. Jamais bloquant. */
async function alerterAdminUneFois(cfg, p, motif, lignes) {
  try {
    const evt = 'alerte_admin_' + motif;
    const deja = await C.sbSelect(cfg, 'payment_events', 'payment_id=eq.' + p.id + '&event=eq.' + evt + '&select=id&limit=1');
    if (deja && deja.length) return;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const garde = chatAlerte();
    let envoi = 'non envoye';
    if (token && garde.ok) {
      const r = await C.fetchAvecDelai('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: garde.chat, text: lignes.join('\n').slice(0, 3900) })
      }, 15000);
      envoi = r.ok ? 'envoye' : 'HTTP ' + r.status;
    } else {
      envoi = !token ? 'TELEGRAM_BOT_TOKEN absent' : garde.raison;
    }
    await C.journaliser(cfg, p.id, evt, { message: 'Telegram : ' + envoi });
  } catch (e) {
    console.error('[paiement-reconciliation] alerte admin impossible :', p.reference, e.message);
  }
}
const ABBR = { moncash: 'MonCash', natcash: 'NatCash' };

const PAUSE_MS = 400;
const MAX_PAR_PASSAGE = 30;
/* Fenetre de recherche : au-dela, un paiement 'failed' a de toute facon
   trop peu de chances d'etre un rattrapage legitime (le prestataire ne
   garde pas une transaction USSD ouverte des heures) — on evite aussi de
   rescanner indefiniment tout l'historique. */
const FENETRE_HEURES = 24;

function pause(ms) {
  return new Promise(function (r) { setTimeout(r, ms); });
}

exports.handler = async function () {
  const cfg = C.lireConfig();
  if (cfg.manquantes.length) {
    console.error('[paiement-reconciliation] variables manquantes :', cfg.manquantes.join(', '));
    return { statusCode: 500, body: 'config incomplete' };
  }

  const bilan = { vus: 0, reouverts_et_confirmes: 0, reouverts_mais_refuses: 0, toujours_en_attente: 0, non_reouvrables: 0, erreurs: 0 };

  try {
    const depuis = new Date(Date.now() - FENETRE_HEURES * 3600 * 1000).toISOString();

    const paiements = await C.sbSelect(
      cfg, 'payments',
      'status=eq.failed&provider=not.is.null&provider_reference=not.is.null' +
      /* 16/10 : la table payments n'a PAS de colonne updated_at (l'ancien
         filtre faisait echouer chaque passage). Un paiement expire par TTL
         porte toujours expires_at : c'est la bonne fenetre de recherche. */
      '&expires_at=gte.' + encodeURIComponent(depuis) +
      '&select=id,user_id,status,method,plan_id,reference,provider,provider_reference,provider_status,amount_htg,expires_at' +
      '&order=expires_at.asc&limit=' + MAX_PAR_PASSAGE
    );

    if (paiements && paiements.length) {
      for (let i = 0; i < paiements.length; i++) {
        const p = paiements[i];
        bilan.vus++;
        try {
          /* 1. Lecture seule d'abord : on ne touche rien tant qu'on n'a
             pas la preuve, fraiche, que le prestataire dit "ok". */
          const verif = await C.verifierTransaction(cfg, p.provider_reference);
          const statutTrans = verif && verif.json ? String(verif.json.trans_status || '').toLowerCase() : '';

          if (!verif.ok || !verif.json) {
            bilan.erreurs++;
            console.error('[paiement-reconciliation] reponse prestataire invalide pour', p.reference, verif.httpStatus);
            continue;
          }
          if (statutTrans !== 'ok') {
            bilan.toujours_en_attente++;
            continue;
          }

          /* 2. Le prestataire confirme "ok" pour un paiement qu'on avait
             marque 'failed' : on tente la reouverture atomique. */
          const rouv = await C.sbRpc(cfg, 'rouvrir_paiement_expire', { p_payment_id: p.id });

          if (!rouv || !rouv.ok) {
            bilan.non_reouvrables++;
            console.error('[paiement-reconciliation] non reouvrable :', p.reference, rouv && rouv.code);
            await C.journaliser(cfg, p.id, 'reconciliation_non_reouvrable', { payload: rouv });
            if (rouv && rouv.code === 'AUTRE_PAIEMENT_PENDING_EXISTE') {
              await alerterAdminUneFois(cfg, p, 'paye_non_reouvrable', [
                '‼️ PAIEMENT AUTO PAYÉ MAIS FERMÉ',
                '',
                'Le prestataire confirme ce paiement, mais un autre paiement du même abonné est ouvert : réouverture automatique impossible pour l\'instant (nouvel essai toutes les 20 min).',
                'Réf. : ' + (p.reference || '?'),
                'Moyen : ' + (ABBR[p.method] || p.method || '?') + ' · Montant : ' + (p.amount_htg != null ? p.amount_htg + ' G' : '?'),
                '',
                'À vérifier dans le panneau (double paiement possible).'
              ]);
            }
            continue;
          }

          /* rouv.code === 'ALREADY_CONFIRMED' : un autre passage a deja
             tout confirme entre-temps, rien de plus a faire ici. */
          if (rouv.code === 'ALREADY_CONFIRMED') {
            continue;
          }

          /* 3. Reouvert avec succes -> chemin de confirmation habituel,
             en simulant l'objet paiement avec son nouveau statut local
             (la ligne en base est deja 'pending' grace au RPC). */
          const res = await C.verifierEtConfirmer(cfg, Object.assign({}, p, { status: 'pending' }));

          if (res.etat === 'confirme') {
            bilan.reouverts_et_confirmes++;
            console.log('[paiement-reconciliation] RATTRAPAGE reussi :', p.reference, res.code);
            if (p.provider_status === 'annule_client') {
              await alerterAdminUneFois(cfg, p, 'annule_puis_paye', [
                '⚠️ PAIEMENT AUTO RATTRAPÉ',
                '',
                'L\'abonné avait fermé ce paiement (bouton « Reeseye ») mais le prestataire l\'a finalement confirmé : plan activé automatiquement.',
                'Réf. : ' + (p.reference || '?'),
                'Moyen : ' + (ABBR[p.method] || p.method || '?') + ' · Montant : ' + (p.amount_htg != null ? p.amount_htg + ' G' : '?'),
                '',
                'Vérifier s\'il a aussi payé avec un autre moyen (double paiement possible).'
              ]);
            }
          } else if (res.etat === 'refuse') {
            bilan.reouverts_mais_refuses++;
            /* Rare : le prestataire dit "ok" mais le montant/methode ne
               correspond pas (ex: personne a paye un montant different
               entre-temps). Le paiement reste 'pending' pour qu'un admin
               puisse trancher manuellement, exactement comme n'importe
               quel autre refus. */
            console.error('[paiement-reconciliation] reouvert mais REFUS :', p.reference, JSON.stringify(res));
          } else {
            bilan.erreurs++;
            console.error('[paiement-reconciliation] reouvert mais erreur :', p.reference, res.code, res.message || '');
          }
        } catch (e) {
          bilan.erreurs++;
          console.error('[paiement-reconciliation] exception sur', p.reference, ':', e.message);
        }
        if (i < paiements.length - 1) await pause(PAUSE_MS);
      }
    }

    console.log('[paiement-reconciliation] bilan :', JSON.stringify(bilan));
    return { statusCode: 200, body: JSON.stringify(bilan) };

  } catch (e) {
    console.error('[paiement-reconciliation] echec global :', e && e.message);
    return { statusCode: 500, body: JSON.stringify({ erreur: e && e.message, bilan: bilan }) };
  }
};

/* Documentaire uniquement — seul netlify.toml declenche reellement. */
exports.config = { schedule: '*/20 * * * *' };
