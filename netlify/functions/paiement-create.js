/* =====================================================================
   VIP BETCOTE — paiement-create
   ---------------------------------------------------------------------
   Cree un paiement MonCash/NatCash chez le prestataire et renvoie l'URL
   de redirection.

   Principes non negociables appliques ici :
   - le montant est TOUJOURS lu en base (plans.price_htg), jamais recu du
     navigateur ;
   - la ligne payments est ecrite par le SERVEUR (service_role), donc
     expected_amount_htg est une verite serveur ;
   - la reference envoyee au prestataire n'est jamais renvoyee au client ;
   - si l'appel au prestataire echoue, les lignes creees sont supprimees :
     jamais de 'pending' fantome qui bloquerait la personne (index unique
     idx_un_seul_paiement_pending_par_user).
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
    console.error('[paiement-create] variables manquantes :', cfg.manquantes.join(', '));
    return C.reponseJson(500, { ok: false, code: 'CONFIG_INCOMPLETE' });
  }

  let corps;
  try {
    corps = JSON.parse(event.body || '{}');
  } catch (e) {
    return C.reponseJson(400, { ok: false, code: 'CORPS_INVALIDE' });
  }

  const planId = String(corps.plan_id || '').trim();
  const methode = String(corps.method || '').trim().toLowerCase();

  if (!planId) return C.reponseJson(400, { ok: false, code: 'PLAN_MANQUANT' });
  if (C.METHODES_AUTORISEES.indexOf(methode) === -1) {
    return C.reponseJson(400, { ok: false, code: 'METHODE_NON_SUPPORTEE' });
  }

  /* ---- Identite reelle de l'appelant ---------------------------------- */
  const entetes = event.headers || {};
  const utilisateur = await C.utilisateurDepuisJeton(
    cfg, entetes.authorization || entetes.Authorization
  );
  if (!utilisateur) {
    return C.reponseJson(401, { ok: false, code: 'SESSION_INVALIDE' });
  }
  const uid = utilisateur.id;

  try {
    /* ---- Etat du compte ---------------------------------------------- */
    const profils = await C.sbSelect(
      cfg, 'profiles', 'id=eq.' + uid + '&select=id,email_verified,suspended_at&limit=1'
    );
    const profil = profils && profils[0];
    if (!profil) return C.reponseJson(403, { ok: false, code: 'PROFIL_INTROUVABLE' });
    if (profil.suspended_at) return C.reponseJson(403, { ok: false, code: 'COMPTE_SUSPENDU' });
    if (profil.email_verified !== true) {
      return C.reponseJson(403, { ok: false, code: 'EMAIL_NON_VERIFIE' });
    }

    /* ---- Plan : le prix vient d'ici, et de nulle part d'ailleurs ------ */
    const plans = await C.sbSelect(
      cfg, 'plans', 'id=eq.' + encodeURIComponent(planId) +
      '&select=id,name,price_htg,duration_days&limit=1'
    );
    const plan = plans && plans[0];
    if (!plan) return C.reponseJson(404, { ok: false, code: 'PLAN_INTROUVABLE' });

    /* ---- Liberation des attentes perimees avant tout controle ---------
       Sinon une tentative abandonnee il y a deux jours bloquerait encore
       cette personne via l'index unique partiel. */
    try {
      await C.sbRpc(cfg, 'expirer_paiements_prestataire', {});
    } catch (e) {
      console.error('[paiement-create] expiration prealable impossible :', e.message);
    }

    /* ---- Une seule demande en attente a la fois ----------------------- */
    const enAttente = await C.sbSelect(
      cfg, 'payments',
      'user_id=eq.' + uid + '&status=eq.pending&select=id,reference,provider_url,method&limit=1'
    );
    if (enAttente && enAttente.length) {
      const p = enAttente[0];
      /* Si c'est la meme methode et que l'URL du prestataire est encore
         connue, on la renvoie : la personne reprend son paiement au lieu
         de se heurter a un refus qu'elle ne comprendrait pas. */
      if (p.provider_url && p.method === methode) {
        return C.reponseJson(200, {
          ok: true, reprise: true, url: p.provider_url,
          payment_id: p.id, reference: p.reference
        });
      }
      return C.reponseJson(409, {
        ok: false, code: 'PAIEMENT_DEJA_EN_ATTENTE', reference: p.reference || null
      });
    }

    /* ---- Montant ------------------------------------------------------
       Mode test : s'applique uniquement a UN uuid precis, jamais
       globalement. Supprimer PLOPPLOP_TEST_USER_ID desactive tout. */
    let montant = Number(plan.price_htg);
    let modeTest = false;
    if (cfg.testUserId && cfg.testAmount > 0 && cfg.testUserId === uid) {
      montant = cfg.testAmount;
      modeTest = true;
    }
    if (!(montant >= C.MONTANT_MINIMUM_PRESTATAIRE)) {
      return C.reponseJson(400, {
        ok: false, code: 'MONTANT_TROP_FAIBLE', minimum: C.MONTANT_MINIMUM_PRESTATAIRE
      });
    }

    /* ---- Ecriture des lignes en attente -------------------------------
       Ecrites AVANT l'appel au prestataire : cela reserve le verrou unique
       et neutralise le double-clic / les deux onglets. Rollback juste
       apres si le prestataire refuse. */
    const referenceClient = C.genererReferenceClient();
    const referencePrestataire = C.genererReferencePrestataire();
    const maintenant = new Date();
    const expiration = new Date(maintenant.getTime() + cfg.dureeVieMinutes * 60000);

    const abos = await C.sbInsert(cfg, 'subscriptions', {
      user_id: uid,
      plan_id: plan.id,
      status: 'pending',
      starts_at: maintenant.toISOString(),
      expires_at: plan.duration_days
        ? new Date(maintenant.getTime() + plan.duration_days * 86400000).toISOString()
        : null
    });
    const abo = abos && abos[0];
    if (!abo) return C.reponseJson(500, { ok: false, code: 'ABONNEMENT_NON_CREE' });

    let paiement = null;
    try {
      const lignes = await C.sbInsert(cfg, 'payments', {
        user_id: uid,
        subscription_id: abo.id,
        plan_id: plan.id,
        amount_htg: montant,
        method: methode,
        status: 'pending',
        reference: referenceClient,
        provider: 'plopplop',
        provider_reference: referencePrestataire,
        expected_amount_htg: montant,
        expires_at: expiration.toISOString()
      });
      paiement = lignes && lignes[0];
    } catch (e) {
      await C.sbDelete(cfg, 'subscriptions', 'id=eq.' + abo.id);
      /* 23505 = violation d'unicite : une autre demande est passee entre
         notre controle et cette insertion (course reelle, deux onglets). */
      if (e.httpStatus === 409 || /duplicate key|23505/i.test(e.message || '')) {
        return C.reponseJson(409, { ok: false, code: 'PAIEMENT_DEJA_EN_ATTENTE' });
      }
      throw e;
    }
    if (!paiement) {
      await C.sbDelete(cfg, 'subscriptions', 'id=eq.' + abo.id);
      return C.reponseJson(500, { ok: false, code: 'PAIEMENT_NON_CREE' });
    }

    await C.journaliser(cfg, paiement.id, 'create_request', {
      payload: {
        montant: montant, methode: methode, plan_id: plan.id,
        mode_test: modeTest, refference_id: referencePrestataire
      }
    });

    /* ---- Appel au prestataire ----------------------------------------- */
    let rep;
    try {
      rep = await C.creerTransaction(cfg, referencePrestataire, montant, methode);
    } catch (e) {
      await C.journaliser(cfg, paiement.id, 'create_error', { message: e.message });
      await C.sbDelete(cfg, 'payments', 'id=eq.' + paiement.id);
      await C.sbDelete(cfg, 'subscriptions', 'id=eq.' + abo.id);
      return C.reponseJson(502, { ok: false, code: 'PRESTATAIRE_INJOIGNABLE' });
    }

    await C.journaliser(cfg, paiement.id, 'create_response', {
      httpStatus: rep.httpStatus,
      payload: rep.json || { brut: rep.texte }
    });

    const d = rep.json;
    if (!rep.ok || !d || d.status !== true || !d.url) {
      /* Rollback complet : aucune ligne 'pending' ne doit survivre a un
         echec de creation, sinon la personne reste bloquee 45 minutes
         pour une transaction qui n'existe pas. */
      await C.sbDelete(cfg, 'payments', 'id=eq.' + paiement.id);
      await C.sbDelete(cfg, 'subscriptions', 'id=eq.' + abo.id);
      const codes = {
        400: 'PARAMETRE_INVALIDE', 404: 'MARCHAND_OU_REFERENCE',
        405: 'METHODE_HTTP', 429: 'TROP_DE_REQUETES', 503: 'PRESTATAIRE_INDISPONIBLE'
      };
      return C.reponseJson(502, {
        ok: false,
        code: codes[rep.httpStatus] || 'CREATION_REFUSEE',
        message: (d && d.message) || null
      });
    }

    await C.sbUpdate(cfg, 'payments', 'id=eq.' + paiement.id, {
      provider_url: String(d.url),
      provider_transaction_id: d.transaction_id ? String(d.transaction_id) : null,
      provider_status: 'no'
    });

    /* provider_reference n'est JAMAIS renvoyee ici — voir le commentaire
       de genererReferencePrestataire dans le module commun. */
    return C.reponseJson(200, {
      ok: true,
      url: String(d.url),
      payment_id: paiement.id,
      reference: referenceClient,
      montant: montant,
      expire_a: expiration.toISOString()
    });

  } catch (e) {
    console.error('[paiement-create] echec :', e && e.message);
    return C.reponseJson(500, { ok: false, code: 'ERREUR_INTERNE' });
  }
};
