/* =====================================================================
   VIP BETCOTE — paiement-changer (24/11, James)
   ---------------------------------------------------------------------
   Paiement AUTOMATIQUE MonCash / NatCash seulement. L'abonne revenu sur
   le site sans avoir termine peut fermer LUI-MEME son paiement encore
   ouvert pour choisir un autre moyen, sans attendre la fin des 10 minutes.

   Garde-fous (dans cet ordre, aucun n'est contournable par le navigateur) :
     1. session valide + quota par personne ;
     2. le paiement est le SIEN, encore 'pending', d'un prestataire
        (jamais un depot manuel, jamais Stripe) ;
     3. au moins 5 minutes depuis le lancement (temps de finir le code PIN ;
        le paiement reel le plus lent observe au 24/11 : 3 min 11 s) ;
     4. le PRESTATAIRE est interroge maintenant (C.verifierEtConfirmer) :
          - « payé »  -> le paiement est CONFIRME (plan active), jamais annule ;
          - pas de reponse / erreur -> on NE TOUCHE A RIEN ;
          - « pas payé » -> fermeture (etape 5) ;
     5. fermeture CONDITIONNELLE : status passe a 'failed' seulement s'il est
        encore 'pending' a cet instant (une confirmation arrivee entre-temps
        gagne toujours) ; abonnement provisoire 'cancelled' — exactement ce
        que fait deja l'expiration automatique (expirer_paiements_prestataire).
   Le rattrapage (paiement-reconciliation-background, toutes les 20 min)
   revérifie ensuite ce paiement pendant 24 h : si le prestataire dit
   finalement « payé », il est rouvert et confirme (ou l'admin est alerte).
   Fonction HTTP normale : NE PAS la declarer dans netlify.toml.
   ===================================================================== */

'use strict';

const C = require('./lib/paiement-commun.js');

const DELAI_MIN_MS = 5 * 60 * 1000;

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: { 'Cache-Control': 'no-store' }, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return C.reponseJson(405, { ok: false, code: 'METHODE_NON_AUTORISEE' });
  }

  const cfg = C.lireConfig();
  if (cfg.manquantes.length) {
    console.error('[paiement-changer] variables manquantes :', cfg.manquantes.join(', '));
    return C.reponseJson(500, { ok: false, code: 'CONFIG_INCOMPLETE' });
  }

  let corps;
  try { corps = JSON.parse(event.body || '{}'); } catch (e) {
    return C.reponseJson(400, { ok: false, code: 'CORPS_INVALIDE' });
  }
  const paymentId = String(corps.payment_id || '').trim();
  if (!/^[0-9a-f-]{36}$/i.test(paymentId)) {
    return C.reponseJson(400, { ok: false, code: 'IDENTIFIANT_MANQUANT' });
  }

  const entetes = event.headers || {};
  const utilisateur = await C.utilisateurDepuisJeton(cfg, entetes.authorization || entetes.Authorization);
  if (!utilisateur) return C.reponseJson(401, { ok: false, code: 'SESSION_INVALIDE' });

  const quota = await C.verifierQuota(cfg, 'changer:user:' + utilisateur.id, 6, cfg.quotaFenetreSecondes);
  if (!quota.autorise) {
    return C.reponseJson(429, { ok: false, code: 'TROP_DE_TENTATIVES', reessayer_dans: quota.resteSecondes || 60 });
  }

  try {
    const lignes = await C.sbSelect(
      cfg, 'payments',
      'id=eq.' + encodeURIComponent(paymentId) + '&user_id=eq.' + utilisateur.id +
      '&select=id,user_id,status,method,plan_id,reference,provider,provider_reference,subscription_id,created_at,expires_at&limit=1'
    );
    const p = lignes && lignes[0];
    if (!p) return C.reponseJson(404, { ok: false, code: 'PAIEMENT_INTROUVABLE' });

    if (p.status === 'confirmed') return C.reponseJson(200, { ok: true, etat: 'confirme', reference: p.reference });
    if (p.status !== 'pending') return C.reponseJson(200, { ok: true, etat: 'ferme', reference: p.reference });
    if (!p.provider || !p.provider_reference) {
      return C.reponseJson(400, { ok: false, code: 'PAS_UN_PAIEMENT_AUTOMATIQUE' });
    }

    const age = Date.now() - new Date(p.created_at).getTime();
    if (!(age >= DELAI_MIN_MS)) {
      return C.reponseJson(200, {
        ok: false, code: 'TROP_TOT',
        reste_secondes: Math.max(1, Math.ceil((DELAI_MIN_MS - (Number.isFinite(age) ? age : 0)) / 1000))
      });
    }

    /* 4. Le prestataire d'abord. verifierEtConfirmer confirme lui-meme le
       paiement s'il est paye (controle du montant et du moyen en base). */
    const res = await C.verifierEtConfirmer(cfg, p);
    if (res.etat === 'confirme') {
      return C.reponseJson(200, { ok: true, etat: 'confirme', reference: p.reference });
    }
    if (res.etat !== 'attente') {
      // erreur reseau, reponse illisible, refus de montant... : dans le doute, rien n'est ferme.
      await C.journaliser(cfg, p.id, 'changer_refuse', { message: 'verification non concluante : ' + (res.code || res.etat) });
      return C.reponseJson(200, { ok: false, code: 'VERIFICATION_IMPOSSIBLE' });
    }

    /* 5. « pas payé » : fermeture conditionnelle (seulement si encore 'pending'). */
    const fermes = await C.sbUpdate(
      cfg, 'payments',
      'id=eq.' + p.id + '&status=eq.pending',
      { status: 'failed', provider_status: 'annule_client' }
    );
    if (!fermes || !fermes.length) {
      // Le statut a change entre-temps (confirme par le suivi automatique, ou expire) : on relit.
      const relu = await C.sbSelect(cfg, 'payments', 'id=eq.' + p.id + '&select=status&limit=1');
      const st = relu && relu[0] && relu[0].status;
      return C.reponseJson(200, { ok: true, etat: st === 'confirmed' ? 'confirme' : 'ferme', reference: p.reference });
    }
    if (p.subscription_id) {
      // Abonnement PROVISOIRE de ce paiement seulement (filtre status=pending : un plan actif n'est
      // jamais touche). Un second essai en cas de coupure reseau.
      for (let essai = 1; essai <= 2; essai++) {
        try {
          await C.sbUpdate(cfg, 'subscriptions', 'id=eq.' + p.subscription_id + '&status=eq.pending', { status: 'cancelled' });
          break;
        } catch (e) {
          console.error('[paiement-changer] abonnement provisoire non ferme (essai ' + essai + ') :', p.reference, e.message);
        }
      }
    }
    await C.journaliser(cfg, p.id, 'annule_client', {
      message: 'Abonne : changer de moyen. Prestataire interroge : pas paye. Rattrapage actif 24 h.'
    });
    return C.reponseJson(200, { ok: true, etat: 'annule', reference: p.reference });
  } catch (e) {
    console.error('[paiement-changer] echec :', e && e.message);
    return C.reponseJson(500, { ok: false, code: 'ERREUR_INTERNE' });
  }
};
