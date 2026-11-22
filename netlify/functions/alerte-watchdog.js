/**
 * ============================================================================
 * SURVEILLANCE + ALERTES ADMIN (Netlify Function planifiée)
 * Fichier : netlify/functions/alerte-watchdog.js
 * ----------------------------------------------------------------------------
 * Toutes les 10 minutes, interroge la fonction SQL alert_check() et t'envoie
 * un message dès qu'un problème apparaît, puis un message "Rétabli" quand il
 * disparaît. Problèmes surveillés :
 *   - API_BLOQUEE_FOOT / _BASKET : le fournisseur de données refuse les appels
 *   - QUOTA_FOOT_BAS / _BASKET_BAS : compteur interne presque plein OU 10 requêtes
 *                         ou moins restantes chez le fournisseur (par service)
 *   - PUB_MANQUANTE_A / _B : aucune publication du service pour demain (dès 20h30
 *                         Haïti) ou pour aujourd'hui (dès 6h00), avec la CAUSE
 *                         (aucun passage, compteur plein, API, erreur, rien trouvé)
 *   - REGLEMENT_BLOQUE_A / _B : éléments sans résultat 6 h après l'heure de début,
 *                         avec le plus ancien et la date d'annulation automatique
 * Un message "Rétabli" confirme la fin de chaque problème (ex. « publications
 * présentes pour le 21/09 »).
 *
 * TEXTES NEUTRES (demande explicite) : aucun message n'indique le domaine
 * d'activité. Vocabulaire employé : "API", "service A" (= premier service),
 * "service B" (= second service), "publications", "résultats". AUCUN LIEN
 * dans aucun message. Tout texte venu de l'extérieur (message d'erreur du
 * fournisseur, journal du bot) passe par assainir() qui retire les liens et
 * les noms du fournisseur/du domaine.
 *
 * ANTI-SPAM et ANTI-DOUBLON : la base (alert_claim / alert_resolve) décide
 * qui envoie, de façon atomique. Un problème qui dure est rappelé toutes les
 * 3 heures maximum (24 h pour « ancienne clé API »). Après un envoi raté :
 * nouvel essai dans 30 minutes.
 * ANTI-COPIES : (1) UN SEUL message par passage, même si plusieurs alertes se
 * déclenchent ensemble (les alertes « ancienne clé » A et B sont fusionnées) ;
 * (2) UN SEUL canal par message : Telegram, puis email si Telegram échoue, puis
 * WhatsApp (facultatif, quota CallMeBot limité). EXCEPTION : « compte API suspendu » est
 * PRIORITAIRE : préfixe « 🚨 PRIORITÉ », tous les canaux à la fois, rappel toutes les heures. Seul le test d'envoi (relais ?test=1) essaie tous les canaux.
 *
 * Variables Netlify :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (déjà présentes)
 *   Au moins UN canal :
 *     WHATSAPP_PHONE + WHATSAPP_APIKEY        (service CallMeBot, usage personnel)
 *     RESEND_API_KEY + ALERT_EMAIL            (email)
 *     TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID   (Telegram)
 *   Optionnelles : ALERT_FROM (défaut : "Alertes système <contact@vipbetcote.com>"),
 *   BOT_TEST_TOKEN (test d'envoi via le relais).
 *
 * Planification : voir netlify.toml. Test manuel : alerte-watchdog-relais.js
 * ============================================================================
 */

const { chatAlerte } = require('./lib/garde-telegram-alertes');

const config = { schedule: '*/10 * * * *' };

// ---------------------------------------------------------------------------
// Assainissement : retire liens, noms du fournisseur et mots du domaine d'un
// texte libre venant de l'extérieur avant de l'inclure dans un message.
// ---------------------------------------------------------------------------
function assainir(t) {
  return String(t == null ? '' : t)
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\bwww\.\S+/gi, '')
    .replace(/[\w.-]*api-?(?:sports?|football|basketball)[\w.-]*(?:\/\w+)?/gi, 'API')
    .replace(/\b(?:foot(?:ball)?|basket(?:ball)?|sports?|paris?|bet\w*|cotes?|match(?:es|s)?|pronostics?|fiches?|tickets?)\b/gi, '')
    .replace(/\s\/\w+(?=:)/g, '')
    .replace(/[\[\]"]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,.:;»])/g, '$1')
    .trim();
}

const svc = i => (i && i.service) ? ` (service ${i.service})` : '';

// Titres neutres (aussi utilisés dans le message "Rétabli").
const TITRES = {
  API_BLOQUEE_FOOT: 'Problème API (service A)',
  API_BLOQUEE_BASKET: 'Problème API (service B)',
  QUOTA_FOOT_BAS: 'Quota API (service A)',
  QUOTA_BASKET_BAS: 'Quota API (service B)',
  API_SITE_OBSOLETE_A: 'Site Netlify en échec (service A)',
  API_SITE_OBSOLETE_B: 'Site Netlify en échec (service B)',
  PUB_MANQUANTE_A: 'Publications (service A)',
  PUB_MANQUANTE_B: 'Publications (service B)',
  REGLEMENT_BLOQUE_A: 'Calcul des résultats (service A)',
  REGLEMENT_BLOQUE_B: 'Calcul des résultats (service B)',
  QUOTA_ODDS_API_B: 'Crédits The Odds API (service B)',
  BSD_RELAIS_A: 'Relais de secours BSD (service A)',
  BSD_REGLEMENT_A: 'Résultats via le relais BSD (service A)',
  // anciens noms (compatibilité)
  FICHES_MANQUANTES: 'Publications manquantes',
  REGLEMENT_BLOQUE: 'Calcul des résultats'
};

// ---------------------------------------------------------------------------
// Blocage du fournisseur de données : message PRÉCIS selon la cause détectée
// par la base. Retourne { titre, lignes (email, complet), courtes (WhatsApp) }.
// ---------------------------------------------------------------------------
const CAUSES_API = {
  SUSPENDU: {
    titre: 'Compte API suspendu',
    resume: 'Le fournisseur refuse tous les appels : le compte lié à la clé utilisée est suspendu.',
    actions: [
      'Une nouvelle clé du MÊME compte reste suspendue.',
      '1) Ouvre le tableau de bord de ton fournisseur API : vérifie l\'état du compte ou contacte son support pour lever la suspension, ou crée un compte avec une autre adresse email.',
      '2) Mets la clé valide dans la variable de clé API de Netlify, sur TOUS les sites qui font tourner les tâches automatiques.',
      '3) Netlify > Deploys > Trigger deploy (une variable modifiée ne s\'applique qu\'après un redéploiement).'
    ],
    court: 'Action : lever la suspension chez le fournisseur (une nouvelle clé du même compte reste suspendue), puis clé valide sur tous les sites Netlify + redéploiement.'
  },
  LIMITE_JOUR: {
    titre: 'Limite quotidienne API atteinte',
    resume: 'Les requêtes du jour sont épuisées : le fournisseur refuse tout jusqu\'à la remise à zéro (minuit UTC = 20h00 Haïti).',
    actions: [
      'Rien à réparer : les appels reprendront après la remise à zéro.',
      'Évite les traitements manuels d\'ici là. Si ça se répète chaque jour, plusieurs sites Netlify consomment le même quota : vérifie la liste de tes sites.'
    ],
    court: 'Action : attendre 20h00 Haïti (remise à zéro), pas de traitement manuel d\'ici là.'
  },
  LIMITE_MINUTE: {
    titre: 'API : trop de requêtes par minute',
    resume: 'La limite de requêtes par minute est dépassée : le fournisseur rejette des appels.',
    actions: [
      'Cause fréquente : plusieurs sites Netlify appellent l\'API en même temps. Vérifie qu\'UN SEUL site fait tourner les tâches automatiques.'
    ],
    court: 'Action : vérifier qu\'un seul site Netlify fait tourner les tâches automatiques.'
  },
  CLE_ABSENTE: {
    titre: 'Variable de clé API ABSENTE (aucune exécution ne fonctionne)',
    resume: 'La variable de clé API n\'existe pas dans Netlify : le fournisseur n\'est même pas appelé. Ce n\'est PAS un compte suspendu ni une clé refusée.',
    actions: [
      '1) Netlify > Project configuration > Environment variables : ajoute la variable de clé API (nom exact, sans espace) sur le site qui exécute les tâches.',
      '2) Netlify > Deploys > Trigger deploy (une variable ajoutée ne s\'applique qu\'après un redéploiement).'
    ],
    court: 'Action : ajouter la variable de clé API dans Netlify (nom exact), puis redéployer. Ce n\'est pas un compte suspendu.'
  },
  CLE_INVALIDE: {
    titre: 'Clé API invalide ou absente',
    resume: 'Le fournisseur ne reconnaît pas la clé utilisée.',
    actions: [
      '1) Netlify > Environment variables : la variable de clé API est-elle renseignée, sans espace, sur CHAQUE site qui exécute les tâches ?',
      '2) Compare avec la clé affichée sur le tableau de bord du fournisseur, puis Trigger deploy.'
    ],
    court: 'Action : vérifier la variable de clé API sur chaque site Netlify (identique au tableau de bord du fournisseur), puis redéployer.'
  },
  ACCES_REFUSE: {
    titre: 'API : accès refusé',
    resume: 'Le fournisseur rejette les appels (accès non autorisé).',
    actions: [
      'Vérifie sur le tableau de bord du fournisseur que l\'abonnement est actif et que la clé correspond, puis redéploie.'
    ],
    court: 'Action : vérifier l\'abonnement et la clé chez le fournisseur, puis redéployer.'
  },
  AUTRE: {
    titre: 'API : erreur',
    resume: 'Le fournisseur a renvoyé une erreur non classée (texte ci-dessous, nettoyé).',
    actions: ['Consulte le tableau de bord du fournisseur et les logs Netlify des tâches automatiques.'],
    court: 'Action : consulter le tableau de bord du fournisseur et les logs Netlify.'
  }
};

function messageApi(l) {
  const c = CAUSES_API[l.cause] || CAUSES_API.AUTRE;
  const i = l.infos || {};
  const titre = c.titre + svc(i);
  const nbRefus = i.nb_refus != null ? `${i.nb_refus} refus depuis` : '';
  const depuis = i.premier_refus ? `Bloqué depuis le ${i.premier_refus} (heure Haïti)${nbRefus ? ' — ' + nbRefus : ''}.` : '';
  const derniere = i.dernier_refus ? `Dernier refus : ${i.dernier_refus}.` : '';
  const pub = i.date_fiches
    ? `publications du ${i.date_fiches} : ${Number(i.fiches_publiees) > 0 ? 'déjà en place (' + i.fiches_publiees + ')' : 'ABSENTES'}`
    : '';
  const impact = `Conséquences : ${Number(i.selections_attente) || 0} résultat(s) en attente` + (pub ? ' ; ' + pub : '') + '.';
  // Le texte brut du fournisseur n'est repris (nettoyé) que si la cause n'est pas reconnue.
  const brut = (l.cause && CAUSES_API[l.cause] && l.cause !== 'AUTRE') ? '' : assainir(i.message_api);
  const msgBrut = brut ? `Réponse du fournisseur : « ${brut} »` : '';
  const lignes = [titre, '', c.resume, msgBrut, depuis, derniere, impact, ''].filter((x, idx, a) => x !== '' || a[idx - 1] !== '')
    .concat(c.actions);
  const courtes = [c.resume, msgBrut, depuis, impact, c.court].filter(Boolean);
  return { titre, lignes, courtes };
}

// Autres types : messages construits à partir des données structurées de la base.
function messageAutre(l) {
  const i = l.infos || {};
  const t = l.type;
  const S = i.service ? `service ${i.service}` : 'service';

  // --- Quota (par service) : compteur interne OU requêtes restantes chez le fournisseur ---
  if (t === 'QUOTA_FOOT_BAS' || t === 'QUOTA_BASKET_BAS') {
    if (l.cause === 'INTERNE') {
      const titre = `Compteur interne presque plein (${S})`;
      const c1 = `Le compteur interne du ${S} est à ${i.interne != null ? i.interne : '?'}/${i.interne_max != null ? i.interne_max : '?'} appels aujourd'hui.`;
      const c2 = `Arrivé au maximum, les publications automatiques de ce service s'arrêtent jusqu'à la remise à zéro (minuit UTC = 20h00 Haïti).`;
      const act = 'Si le compteur monte trop vite, plusieurs sites Netlify exécutent les mêmes tâches en parallèle : vérifie la liste de tes sites.';
      return { titre, lignes: [titre, '', c1, c2, '', act], courtes: [c1, c2, 'Action : vérifier qu\'un seul site Netlify exécute les tâches automatiques.'] };
    }
    const titre = `Quota API presque épuisé (${S})`;
    const corps = `Il reste ${i.restant != null ? i.restant : '?'} requête(s) sur ${i.limite || 100} chez le fournisseur (remise à zéro à minuit UTC = 20h00 Haïti).`;
    const act = 'Évite les traitements manuels d\'ici là, pour garder des requêtes au calcul des résultats.';
    return { titre, lignes: [titre, '', corps, act], courtes: [corps, act] };
  }

  // --- Un site en échec PENDANT QUE d'autres réussissent : le service marche, c'est un SITE Netlify en trop ---
  if (t === 'API_SITE_OBSOLETE_A' || t === 'API_SITE_OBSOLETE_B') {
    const absente = l.cause === 'CLE_ABSENTE';
    const titre = absente ? `Un site Netlify SANS clé API (${S})` : `Un site Netlify refusé par l'API (${S})`;
    const exact = assainir(i.message_api);
    const c0 = absente
      ? 'CE QUI SE PASSE : un site Netlify exécute les tâches automatiques SANS la variable de clé API. Ce n\'est PAS un compte suspendu, PAS une clé refusée : le service fonctionne.'
      : 'CE QUI SE PASSE : un site Netlify est refusé par le fournisseur alors que les autres fonctionnent au même moment. Le service lui-même fonctionne.';
    const c1 = `Preuve : à chaque passage (toutes les 15 min), ${i.succes_simultanes != null ? i.succes_simultanes : '?'} exécution(s) réussissent et ${i.refus_simultanes != null ? i.refus_simultanes : '?'} échouent au même moment. Dernier échec : ${i.dernier_refus || '?'} (heure Haïti), ${i.refus_30h != null ? i.refus_30h : '?'} échecs sur 30 h.`;
    const c2 = exact ? `Message exact de l'exécution en échec : « ${exact} »` : '';
    const c3 = 'Impact : aucune publication perdue tant que les autres exécutions réussissent. Mais plusieurs sites exécutent les mêmes tâches : chacun consomme le même quota du fournisseur.';
    const a1 = absente
      ? 'À FAIRE : trouver le site en trop (Netlify > Team > Sites : tout site relié à ce dépôt, y compris dans une AUTRE équipe) puis le supprimer ou désactiver ses tâches planifiées. Ajouter la variable sur ce site ne sert qu\'à garder un doublon inutile.'
      : 'À FAIRE : trouver le site en trop (Netlify > Team > Sites, y compris une autre équipe) et le supprimer, ou y mettre la même clé valide puis redéployer.';
    return { titre, lignes: [titre, '', c0, c1, c2, c3, '', a1].filter((x, idx, arr) => x !== '' || arr[idx - 1] !== ''),
      courtes: [c0, c1, c2, a1].filter(Boolean) };
  }

  // --- Publications manquantes (par service), avec la cause précise ---
  if (t === 'PUB_MANQUANTE_A' || t === 'PUB_MANQUANTE_B') {
    const titre = `Publications manquantes (${S})`;
    const base = `Aucune publication du ${S} pour le ${i.date_cible || '?'}.`;
    const dp = i.dernier_passage ? `dernier passage : ${i.dernier_passage}` : '';
    let cause, action, court;
    switch (l.cause) {
      case 'AUCUN_PASSAGE':
        cause = `Aucun passage automatique depuis plus de 12 h${dp ? ' (' + dp + ', heure Haïti)' : ''} : la tâche ne tourne plus.`;
        action = 'Vérifie dans Netlify > Functions que la tâche porte le badge « Scheduled », le dernier déploiement et le fichier netlify.toml.';
        court = 'Action : vérifier Netlify > Functions (Scheduled) et le dernier déploiement.';
        break;
      case 'QUOTA_INTERNE':
        cause = `Cause : le compteur interne est plein${i.interne != null ? ' (' + i.interne + '/' + i.interne_max + ')' : ''}, la génération s'est arrêtée pour protéger la limite du fournisseur.${dp ? ' Dernier passage : ' + i.dernier_passage + '.' : ''}`;
        action = 'Elle reprendra après la remise à zéro (minuit UTC = 20h00 Haïti). Si ça se répète, plusieurs sites Netlify consomment le même quota en parallèle.';
        court = 'Elle reprendra à 20h00 Haïti (remise à zéro).';
        break;
      case 'API':
        cause = `Cause : le fournisseur a refusé les appels${i.derniere_erreur_heure ? ' (dernier refus : ' + i.derniere_erreur_heure + ', heure Haïti)' : ''}. Voir l'alerte API.`;
        action = 'Corrige d\'abord l\'API, puis relance la génération depuis le relais habituel.';
        court = 'Action : corriger l\'API, puis relancer la génération.';
        break;
      case 'INCONNUE': {
        const err = assainir(i.derniere_erreur).slice(0, 120);
        cause = `Cause : le dernier passage a signalé une erreur non classée${i.derniere_erreur_heure ? ' (' + i.derniere_erreur_heure + ', heure Haïti)' : ''}${err ? ' : « ' + err + ' »' : ''}.`;
        action = 'Regarde les logs Netlify de la tâche de génération.';
        court = 'Action : regarder les logs Netlify de la tâche de génération.';
        break;
      }
      case 'AUCUN_ELEMENT': {
        cause = `Le dernier passage${i.dernier_passage ? ' (' + i.dernier_passage + ', heure Haïti)' : ''} n'a signalé aucune erreur mais n'a rien publié (éléments trouvés : ${i.matchs_trouves !== '' && i.matchs_trouves != null ? i.matchs_trouves : '0'}).`;
        action = 'Causes possibles : rien à publier ce jour-là, ou une protection anti-doublon qui croit qu\'une publication existe déjà. Regarde les logs Netlify du dernier passage.';
        court = 'Action : regarder les logs Netlify du dernier passage (rien à publier, ou protection anti-doublon ?).';
        // 10/11 : VRAIE cause lue dans le dernier résumé du passage (bot_run_log), si disponible.
        const d = l.diag;
        if (d && d.doublon) {
          cause = 'Cause : la protection anti-doublon a cru qu\'une publication existait déjà pour cette date.';
          action = 'Vérifie dans l\'admin qu\'aucune fiche n\'existe pour cette date ; si aucune n\'existe, signale-le.';
          court = 'Cause : protection anti-doublon. Action : vérifier les fiches de cette date dans l\'admin.';
        } else if (d && d.retenus != null && d.retenus < 3) {
          const refus = (d.refuses || []).map(x => `${x.nom} (${x.n})`).join(', ');
          cause = `Cause : seulement ${d.retenus} match(s) utilisable(s) sur ${d.trouves} reçu(s) — pas assez pour construire une fiche (minimum 3). L'API fonctionne normalement.`
            + (refus ? ` Les autres matchs viennent de championnats non suivis : ${refus}.` : '');
          action = 'Rien à réparer : jour pauvre en matchs (trêve internationale ou calendrier). Si un de ces championnats doit être couvert, demande son ajout.';
          court = `Cause : seulement ${d.retenus} match(s) utilisable(s) sur ${d.trouves} (jour pauvre, API OK). Rien à réparer.`;
        } else if (d && d.retenus != null) {
          cause = `Cause : ${d.retenus} match(s) utilisable(s) sur ${d.trouves}, ${d.generees} essai(s) de fiche, mais aucune fiche ne respectait les règles (cote cible des plans, matchs déjà commencés, répétitions). L'API fonctionne normalement.`;
          action = 'Regarde le détail du dernier passage (bot_run_log) : pool de sélections et raisons de rejet.';
          court = `Cause : ${d.retenus} match(s) utilisable(s) mais aucune fiche conforme aux règles. API OK.`;
        }
        break;
      }
      default:
        cause = `Dernier passage automatique : ${i.dernier_passage || 'inconnu'}.`;
        action = 'Regarde les logs Netlify de la tâche de génération.';
        court = 'Action : regarder les logs Netlify.';
    }
    return { titre, lignes: [titre, '', base, cause, '', action], courtes: [base, cause, court] };
  }

  // --- Calcul des résultats bloqué (par service) ---
  if (t === 'REGLEMENT_BLOQUE_A' || t === 'REGLEMENT_BLOQUE_B') {
    const titre = `Calcul des résultats bloqué (${S})`;
    const jours = Number(i.nb_jours) > 1 ? ` (sur ${i.nb_jours} jours)` : '';
    const c1 = `${i.nb != null ? i.nb : '?'} élément(s) sans résultat plus de 6 h après l'heure de début${jours}.`;
    const c2 = i.plus_ancien ? `Le plus ancien a débuté le ${i.plus_ancien} (heure Haïti).` : '';
    const c3 = i.echeance ? `Annulation automatique au plus tôt le ${i.echeance} si le fournisseur ne donne aucun résultat.` : '';
    const a1 = `Le bot aurait dû régler ou annuler ce match lui-même depuis longtemps (plus de ${REGLEMENT_SEUIL_HEURES} h) : la tâche de calcul des résultats ne tourne probablement plus. Vérifie Netlify > Functions (bot-settle-results, badge « Scheduled ») et le dernier déploiement.`;
    const a2 = 'Si le quota du fournisseur était épuisé, les résultats seront calculés après la remise à zéro (20h00 Haïti).';
    return {
      titre,
      lignes: [titre, '', c1, c2, c3, '', a1, a2].filter((x, idx, a) => x !== '' || a[idx - 1] !== ''),
      courtes: [c1, c2, c3, 'Action : vérifier l\'alerte API et les logs Netlify du calcul des résultats.'].filter(Boolean)
    };
  }

  // --- Anciens noms (compatibilité) ---
  if (t === 'FICHES_MANQUANTES') {
    const titre = 'Publications manquantes' + svc(i);
    const corps = `Aucune publication pour le ${i.date_cible || '?'}.`;
    const act = 'Corrige d\'abord l\'API si une alerte API est active, puis relance la génération depuis le relais habituel.';
    return { titre, lignes: [titre, '', corps, '', act], courtes: [corps, 'Action : corriger l\'API si besoin, puis relancer la génération.'] };
  }
  if (t === 'REGLEMENT_BLOQUE') {
    const titre = 'Calcul des résultats bloqué';
    const corps = `${i.nb != null ? i.nb : '?'} élément(s) sans résultat plus de 6 h après l'heure de début (le plus ancien : ${i.plus_ancien || '-'}, heure Haïti).`;
    const a1 = 'Le calcul repasse chaque heure ; une annulation automatique n\'a lieu qu\'après 2 jours.';
    return { titre, lignes: [titre, '', corps, '', a1], courtes: [corps, a1] };
  }
  const titre = TITRES[t] || 'Alerte système';
  const corps = assainir(l.detail);
  return { titre, lignes: [titre, '', corps], courtes: [corps] };
}

// 20/11 : « Usage quota has been reached » (OUT_OF_USAGE_CREDITS) de The Odds API était lu comme
// « site Netlify refusé » ou « API bloquée ». C'est en réalité le quota MENSUEL de cette source épuisé.
function estQuotaOddsApi(l) {
  const m = String((l.infos || {}).message_api || l.detail || '');
  return /odds-?api/i.test(m) && /quota has been reached|OUT_OF_USAGE_CREDITS/i.test(m);
}

// Ligne QUOTA_ODDS_API_B (ajouterQuotaOddsApi) : crédits restants lus dans api_quota_usage.
const SEUIL_CREDITS_ODDS_API = 50;
function messageQuotaOddsApi(l) {
  const i = l.infos || {};
  const epuise = l.cause === 'EPUISE';
  const reste = i.restant != null ? i.restant : '?';
  const limite = i.limite || 500;
  const titre = epuise ? 'Quota mensuel The Odds API épuisé (service B)' : 'Crédits The Odds API bientôt épuisés (service B)';
  const c0 = epuise
    ? 'CE QUI SE PASSE : la source prioritaire des cotes NBA (The Odds API) n\'a plus de crédits pour ce mois. Ce n\'est PAS un site Netlify en trop ni une clé refusée.'
    : `CE QUI SE PASSE : il reste ${reste} crédit(s) sur ${limite} ce mois-ci chez The Odds API (source prioritaire des cotes NBA).`;
  const c1 = epuise
    ? 'Conséquence : les fiches basket continuent avec la source de secours (API-Sports). Les sélections NBA déjà publiées depuis The Odds API ne peuvent pas être calculées tant que les crédits ne sont pas rechargés.'
    : 'Les appels sont déjà limités (cotes lues 1 fois par jour, scores gardés 3 h). Une fois à 0, les fiches basket passent sur API-Sports et les sélections NBA de The Odds API attendent la recharge.';
  const c2 = i.releve_le ? `Dernier relevé : ${i.releve_le} (heure Haïti).` : '';
  const a1 = 'À FAIRE : attendre la recharge mensuelle (date anniversaire de l\'inscription) ou prendre une formule payante sur the-odds-api.com. Inutile d\'ajouter ou supprimer un site Netlify.';
  return { titre, lignes: [titre, '', c0, c1, c2, '', a1].filter((x, idx, arr) => x !== '' || arr[idx - 1] !== ''),
    courtes: [c0, c1, 'Action : attendre la recharge mensuelle ou passer à une formule payante.'] };
}

// 21/11 (« OK alerte BSD » de James) : messages du relais de secours BSD (football seulement).
function messageBSD(l) {
  const i = l.infos || {};
  if (l.type === 'BSD_RELAIS_A') {
    const titre = '‼️‼️‼️ BSD : API-Sports ET le relais BSD ne répondent pas (service A)';
    const c0 = 'CE QUI SE PASSE : API-Sports n\'a pas répondu, le relais de secours BSD a été appelé, mais il n\'a fourni aucun match exploitable. AUCUNE fiche football ne peut être créée tant que l\'un des deux ne répond pas.';
    const c1 = `${i.echecs || 2} passages de suite sans aucun match, dernier à ${i.heure || '?'} (heure Haïti)${i.erreur ? ' — réponse de BSD : « ' + assainir(i.erreur) + ' »' : ''}${i.lus != null ? ` — évènements lus : ${i.lus}, matchs non commencés : ${i.nonCommences != null ? i.nonCommences : 0}` : ''}.`;
    const a1 = 'À FAIRE : vérifier le compte API-Sports (dashboard.api-football.com) ET le compte BSD (sports.bzzoiro.com) : clé, abonnement, quota. Les clés se mettent dans Netlify (API_SPORTS_KEY, BSD_API_KEY), jamais ailleurs.';
    return { titre, lignes: [titre, '', c0, c1, '', a1], courtes: [c0, c1, 'Action : vérifier les comptes API-Sports et BSD.'] };
  }
  const titre = '‼️‼️‼️ BSD : résultats bloqués (service A)';
  const c0 = `CE QUI SE PASSE : ${i.nb || '?'} sélection(s) football choisie(s) via le relais BSD n'ont toujours pas de résultat plus de ${i.heures || 8} h après le début du match. Elles ne peuvent être réglées QUE par BSD (BSD en panne, ou match reporté / abandonné chez BSD).`;
  const c1 = `Plus ancienne : ${i.plus_ancien || '?'} (heure Haïti). Ces sélections restent « en attente » (jamais annulées faute de données) : les fiches concernées ne se terminent pas.`;
  const a1 = 'À FAIRE : vérifier le compte BSD (sports.bzzoiro.com : clé BSD_API_KEY dans Netlify, abonnement, quota). Si BSD marche, le match a sans doute été reporté : donner le score (ou « annulé ») pour un règlement à la main. Rappel une seule fois par 24 h.';
  return { titre, lignes: [titre, '', c0, c1, '', a1], courtes: [c0, c1, 'Action : vérifier le compte BSD.'] };
}

function construire(l) {
  if (l.type === 'QUOTA_ODDS_API_B') return messageQuotaOddsApi(l);
  if (l.type === 'BSD_RELAIS_A' || l.type === 'BSD_REGLEMENT_A') return messageBSD(l);
  return (l.type.indexOf('API_BLOQUEE_') === 0) ? messageApi(l) : messageAutre(l);
}

// ---------------------------------------------------------------------------
// Regroupement : UN SEUL message par passage, même si plusieurs alertes se
// déclenchent ensemble. Les deux alertes "ancienne clé" (services A et B), qui
// disent la même chose, sont fusionnées en une seule.
// ---------------------------------------------------------------------------
function messageObsoleteFusionne(ls) {
  const tries = ls.slice().sort((a, b) => (a.type < b.type ? -1 : 1));
  const titre = 'Ancienne clé API sur un site (services A et B)';
  const c1 = 'Certaines exécutions automatiques sont refusées par le fournisseur alors que d\'autres fonctionnent au même moment : les services marchent, mais un ou plusieurs sites Netlify utilisent une ancienne clé (compte refusé ou clé absente).';
  const details = tries.map(l => {
    const i = l.infos || {};
    return `Service ${i.service || '?'} — dernier refus : ${i.dernier_refus || '?'} (heure Haïti) ; ${i.refus_30h != null ? i.refus_30h : '?'} refus sur 30 h ; ${i.succes_simultanes != null ? i.succes_simultanes : '?'} exécution(s) réussie(s) au même moment.`;
  });
  const a1 = 'Plusieurs sites Netlify exécutent les mêmes tâches (plusieurs exécutions à chaque passage), ce qui consomme aussi le quota plusieurs fois. Garde UN SEUL site actif et supprime les autres, ou mets la clé valide sur chacun puis redéploie.';
  return {
    titre,
    lignes: [titre, '', c1].concat(details, ['', a1]),
    courtes: [c1].concat(details, ['Action : garder un seul site Netlify actif (ou la clé valide partout), puis redéployer.'])
  };
}

// 21/11 (James : « des icônes différentes pour les différentes alertes ») : une icône par type.
// BSD garde ‼️‼️‼️ (déjà dans son titre) ; « Rétabli » garde ✅.
function iconeAlerte(l) {
  const t = String(l.type || ''), c = String(l.cause || '');
  if (/^BSD_/.test(t)) return '';
  if (/^API_BLOQUEE_/.test(t)) {
    if (c === 'SUSPENDU') return '⛔';
    if (c === 'CLE_ABSENTE' || c === 'CLE_INVALIDE') return '🔑';
    if (c === 'LIMITE_JOUR' || c === 'LIMITE_MINUTE') return '⏳';
    return '🚫';
  }
  if (/^API_SITE_OBSOLETE_/.test(t)) return '🌐';
  if (t === 'QUOTA_ODDS_API_B') return '💳';
  if (/^QUOTA_/.test(t)) return '📊';
  if (/^PUB_MANQUANTE/.test(t) || t === 'FICHES_MANQUANTES') return '📭';
  if (/^REGLEMENT_BLOQUE/.test(t)) return '⏱️';
  return '🚨';
}
function avecIcone(item, icone) {
  // 21/11 (James) : 🚨 devant chaque icône (« 🚨⛔ Compte API suspendu », « 🚨‼️‼️‼️ BSD : … »).
  const titre = /^‼️/.test(item.titre) ? `🚨${item.titre}` : `🚨${icone || ''} ${item.titre}`;
  const lignes = item.lignes.slice(); if (lignes[0] === item.titre) lignes[0] = titre;
  return Object.assign({}, item, { titre, lignes });
}

// Retourne { sujet, lignes, courtes } pour un lot d'alertes (ls = lignes de alert_check).
function grouperAlertes(ls) {
  const obsoletes = ls.filter(l => /^API_SITE_OBSOLETE_/.test(l.type));
  const autres = ls.filter(l => !/^API_SITE_OBSOLETE_/.test(l.type));
  const items = autres.map(l => avecIcone(construire(l), iconeAlerte(l)));
  if (obsoletes.length >= 2) items.push(avecIcone(messageObsoleteFusionne(obsoletes), '🌐'));
  else if (obsoletes.length === 1) items.push(avecIcone(construire(obsoletes[0]), iconeAlerte(obsoletes[0])));

  if (items.length === 1) {
    // 21/11 : le sujet commence par l'icône du type d'alerte (BSD : ‼️‼️‼️ ; autres : ⛔ 🔑 ⏳ 🌐 💳 📊 📭 ⏱️).
    return { sujet: items[0].titre, lignes: items[0].lignes, courtes: items[0].courtes };
  }
  const sujet = `🚨 Alertes système (${items.length})`;
  let lignes = [];
  items.forEach((m, k) => {
    if (k > 0) lignes.push('', '————————', '');
    lignes = lignes.concat(m.lignes);
  });
  // Version courte (WhatsApp, limitée en longueur) : blocs complets si ça tient, sinon résumés.
  let courtes = [];
  items.forEach((m, k) => { courtes.push(`${k + 1}) ${m.titre}`, ...m.courtes, ''); });
  if (`${sujet}\n\n${courtes.join('\n')}`.length > 950) {
    courtes = items.map((m, k) => `${k + 1}) ${m.titre} : ${String(m.courtes[0] || '').slice(0, 140)}`);
    courtes.push('Détails complets : email ou logs Netlify.');
  }
  return { sujet, lignes, courtes };
}

// ---------------------------------------------------------------------------
// Envoi
// ---------------------------------------------------------------------------
function echapper(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function fetchAvecDelai(url, options, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 10000);
  try { return await fetch(url, Object.assign({}, options, { signal: ctrl.signal })); }
  finally { clearTimeout(t); }
}

async function rpc(nom, args) {
  const base = process.env.SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const r = await fetchAvecDelai(`${base}/rest/v1/rpc/${nom}`, {
    method: 'POST',
    headers: { apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {})
  });
  if (!r.ok) throw new Error(`rpc ${nom} → HTTP ${r.status} ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

// 10/11 : dernier résumé de passage d'un service (vue bot_run_log_prod = site de production
// seulement ; repli sur bot_run_log). Retourne null si rien d'exploitable.
// dateJJMM (« 11/11 ») : on prend le dernier passage qui VISAIT cette date (sinon le plus récent).
async function dernierPassage(bot, dateJJMM) {
  const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let ligne = null;
  const jjmm = st => (st && typeof st.dateCible === 'string') ? st.dateCible.slice(8, 10) + '/' + st.dateCible.slice(5, 7) : '';
  for (const table of ['bot_run_log_prod', 'bot_run_log']) {
    const r = await fetchAvecDelai(`${base}/rest/v1/${table}?select=ran_at,stats&bot=eq.${bot}&order=ran_at.desc&limit=60`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } });
    if (!r.ok) continue;
    const j = await r.json();
    if (Array.isArray(j) && j.length) { ligne = (dateJJMM && j.find(x => jjmm(x.stats) === dateJJMM)) || j[0]; break; }
  }
  const st = ligne && ligne.stats;
  if (!st || typeof st !== 'object') return null;
  const nb = v => (v == null || v === '' || Number.isNaN(Number(v))) ? null : Number(v);
  const retenus = nb(st.matchsRetenus);
  const refuses = Object.entries(st.championnatsVus || {})
    .map(([nom, n]) => ({ nom: String(nom).replace(/^\d+\s*—\s*/, ''), n: Number(n) || 0 }))
    .sort((a, b) => b.n - a.n).slice(0, 5);
  const relais = st.relaisBSD && typeof st.relaisBSD === 'object' ? st.relaisBSD : null;
  return { trouves: nb(st.matchsTrouves) || 0, retenus, generees: nb(st.fichesGenerees) || 0,
    doublon: st.doublonsDetectes === true, refuses,
    dateCible: typeof st.dateCible === 'string' ? st.dateCible : null,
    erreurs: Array.isArray(st.erreurs) ? st.erreurs.length : 0,
    publiees: nb(st.fichesPubliees) || 0,
    pool: typeof st.poolFinal === 'number' ? st.poolFinal : null,
    // le relais de secours a dû prendre le relais = l'API n'a pas répondu (vrai problème)
    apiEnEchec: !!(relais && relais.declenche) };
}

// 12/11 (demande explicite de James : « aucune alerte si ce n'est pas un vrai problème ») :
// décide si une alerte « publications manquantes » est un VRAI problème, à partir du dernier
// passage du service. Retourne 'silence' (pas d'alerte), ou la cause à afficher.
//  - Le dernier passage visait bien cette date, sans erreur, sans panne d'API, mais il n'y avait
//    pas assez de matchs (jour pauvre, trêve, intersaison) → PAS un problème → aucune alerte.
//  - Le dernier passage visait bien cette date → la tâche tourne : jamais « la tâche ne tourne
//    plus » (le bot ne tourne que de 16h00 à 21h45 Haïti : 18 h sans passage chaque nuit est normal).
//  - Sinon (aucun passage pour cette date, erreur, panne d'API, anti-doublon) → alerte gardée.
function jugerPublicationManquante(l, d) {
  if (!d || !d.dateCible) return l.cause;
  const dc = String((l.infos || {}).date_cible || '');
  const dd = d.dateCible.slice(8, 10) + '/' + d.dateCible.slice(5, 7);
  if (!dc || dd !== dc) return l.cause;                  // le bot n'a pas tourné pour cette date : vrai problème
  if (d.erreurs > 0 || d.apiEnEchec || d.doublon) return l.cause === 'AUCUN_PASSAGE' ? 'AUCUN_ELEMENT' : l.cause;
  const foot = l.type === 'PUB_MANQUANTE_A';
  // Foot : 0 match reçu n'est JAMAIS un jour pauvre (il y a toujours des dizaines de matchs dans le
  // monde) → c'est un problème de l'API, du cache ou du plan : alerte. Jour pauvre = des matchs reçus,
  // mais moins de 3 utilisables. Basket : 0 match peut être normal (intersaison).
  const pauvre = foot ? (d.trouves > 0 && d.retenus != null && d.retenus < 3)
                      : (d.trouves === 0 || (d.pool != null && d.pool < 2));
  if (pauvre) return 'silence';
  return 'AUCUN_ELEMENT';                                 // assez de matchs mais aucune fiche : vrai problème, cause dite
}

// 13/11 (regle de James : « je dois recevoir une alerte seulement quand l'API a un probleme ;
// eviter les alertes inutiles pour des choses que le bot peut faire lui-meme ») :
//  - API et quota (API_*, QUOTA_*) : TOUJOURS (l'API suspendue reste prioritaire) ;
//  - publications manquantes : seulement si la cause est l'API, le quota, ou si le bot n'a PAS
//    tourne du tout (il ne peut pas se relancer seul) ; jamais pour un jour pauvre, l'anti-doublon,
//    les regles de construction ou une erreur ponctuelle ;
//  - calcul des resultats : si l'API va bien, le bot regle ou annule LUI-MEME (match reporte :
//    annule apres 3 h ; sinon regle des 23h59 + 12 h, 2 jours au plus). Alerte seulement si un
//    match reste sans resultat plus de 60 h apres son debut : le calcul ne tourne plus.
const CAUSES_PUB_URGENTES = ['AUCUN_PASSAGE', 'API', 'QUOTA_INTERNE'];
const REGLEMENT_SEUIL_HEURES = 60;
// « 12/11 16:00 » (heure Haiti, UTC-5 ; ecart d'une heure en ete sans importance a 60 h pres).
function heuresDepuisHaiti(jjmm, maintenant) {
  const m = /^(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?/.exec(String(jjmm || '').trim());
  if (!m) return null;
  const now = maintenant || Date.now();
  let an = new Date(now).getUTCFullYear();
  let t = Date.UTC(an, Number(m[2]) - 1, Number(m[1]), Number(m[3] || 0) + 5, Number(m[4] || 0));
  if (t > now + 86400000) t = Date.UTC(an - 1, Number(m[2]) - 1, Number(m[1]), Number(m[3] || 0) + 5, Number(m[4] || 0));
  return (now - t) / 3600000;
}
function alerteUtile(l, maintenant) {
  // 20/11 : « quota The Odds API épuisé » n'est ni un site en trop ni une API bloquée : l'alerte
  // dédiée QUOTA_ODDS_API_B (crédits restants) le dit clairement, une seule fois par jour.
  if (/^(API_BLOQUEE_|API_SITE_OBSOLETE_)/.test(l.type) && estQuotaOddsApi(l)) return false;
  if (/^PUB_MANQUANTE_[AB]$/.test(l.type)) return CAUSES_PUB_URGENTES.includes(l.cause);
  if (/^REGLEMENT_BLOQUE_[AB]$/.test(l.type) || l.type === 'REGLEMENT_BLOQUE') {
    const h = heuresDepuisHaiti((l.infos || {}).plus_ancien, maintenant);
    return h != null && h >= REGLEMENT_SEUIL_HEURES;   // date illisible : pas d'alerte (le bot regle seul)
  }
  return true;                                           // API, quota, site en echec, autres : toujours
}

// 13/11 — API surveillee AUSSI pendant le calcul des resultats (toutes les heures, toute la
// journee). Le calcul note ses VRAIS refus dans bot_run_log (bot « reglement-foot/basket »,
// voir bot-settle-results.js > noterEtatApi). Alerte si les 2 dernieres notes sont des refus
// (refus repete, sans succes entre les deux), tant qu'aucun succes n'a ete note depuis (48 h max). Meme message
// prioritaire que l'alerte API de la creation des fiches ; jamais deux messages pour la meme panne.
function causeRefusApi(msg) {
  const m = String(msg || '');
  if (/absente|présentes dans les variables/i.test(m)) return 'CLE_ABSENTE';
  if (/suspend/i.test(m)) return 'SUSPENDU';
  if (/application key|api key|api_sports_key/i.test(m)) return 'CLE_INVALIDE';
  if (/HTTP 40[13]|access denied|forbidden|unauthori/i.test(m)) return 'ACCES_REFUSE';
  return 'AUTRE';
}
function hhmmHaiti(iso) {
  const d = new Date(Date.parse(iso) - 5 * 3600000);
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
}
function jugerApiReglement(lignesNotes, maintenant) {
  const L = (lignesNotes || []).filter(x => x && x.stats);
  if (L.length < 2 || L[0].stats.refus !== true || L[1].stats.refus !== true) return null;
  const now = maintenant || Date.now();
  // La panne reste signalee tant qu'AUCUN succes n'a ete note apres (le calcul n'appelle l'API que
  // s'il a des matchs a regler : une nuit sans appel ne veut pas dire que l'API est revenue).
  // Au-dela de 48 h sans nouvelle note, on ne sait plus rien : pas d'alerte sur une donnee perimee.
  if (now - Date.parse(L[0].ran_at) > 48 * 3600000) return null;
  let n = 0; while (n < L.length && L[n].stats.refus === true) n++;
  const msg = (L[0].stats.erreurs || [])[0] || '';
  return { cause: causeRefusApi(msg), message_api: String(msg).slice(0, 200), nb_refus: n,
    dernier_refus: hhmmHaiti(L[0].ran_at), premier_refus: hhmmHaiti(L[n - 1].ran_at) };
}
async function apiVueParLeCalcul(sport) {
  const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: cle, Authorization: `Bearer ${cle}` };
  const r = await fetchAvecDelai(`${base}/rest/v1/bot_run_log_prod?select=ran_at,stats&bot=eq.reglement-${sport}&order=ran_at.desc&limit=10`, { headers: h });
  if (!r.ok) return null;
  const j = jugerApiReglement(await r.json());
  if (!j) return null;
  // Resultats en attente (pour le message), jamais bloquant.
  try {
    const depuis = new Date(Date.now() - 3 * 3600000).toISOString();
    const c = await fetchAvecDelai(`${base}/rest/v1/ticket_legs?select=id,tickets!inner(sport,status)&result=is.null&kickoff_at=lt.${encodeURIComponent(depuis)}&tickets.sport=eq.${sport}&tickets.status=eq.pending`,
      { headers: Object.assign({ Prefer: 'count=exact', Range: '0-0' }, h) });
    const cr = c.headers && c.headers.get && c.headers.get('content-range');
    if (cr && /\/(\d+)$/.test(cr)) j.selections_attente = Number(/\/(\d+)$/.exec(cr)[1]);
  } catch (_) { /* sans consequence */ }
  return j;
}
// Fusionne avec les lignes de alert_check : remplace la ligne API_BLOQUEE_x « ok » (sinon elle
// serait « resolue » au meme passage) ; ne fait rien si la base signale deja la panne.
async function ajouterApiVueParLeCalcul(lignes) {
  for (const [sport, svc] of [['foot', 'A'], ['basket', 'B']]) {
    let j = null;
    try { j = await apiVueParLeCalcul(sport); } catch (e) { console.log('[ALERTE] API vue par le calcul :', e.message); }
    if (!j) continue;
    const type = 'API_BLOQUEE_' + sport.toUpperCase();
    const i = lignes.findIndex(x => x && x.type === type);
    if (i >= 0 && lignes[i].probleme) continue;               // deja signale par la creation des fiches
    const ligne = { type, probleme: true, cause: j.cause, detail: 'API (' + svc + ') : ' + j.cause + ' (vu par le calcul des résultats)',
      infos: Object.assign({ service: svc, source: 'calcul des résultats' }, j) };
    if (i >= 0) lignes[i] = ligne; else lignes.push(ligne);
  }
  return lignes;
}

// 20/11 : crédits The Odds API (quota MENSUEL, 500). Lu dans api_quota_usage (relevé des en-têtes à
// chaque appel réel). Alerte sous 50 crédits, ou à 0 (épuisé) ; « Rétabli » après la recharge.
// Relevé de plus de 3 jours : rien (pas de ligne, donc ni alerte ni rétabli).
async function ajouterQuotaOddsApi(lignes) {
  const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const depuis = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  const r = await fetchAvecDelai(`${base}/rest/v1/api_quota_usage?select=date_utc,real_remaining,real_limit,real_captured_at&provider=eq.odds-api-basketball&date_utc=gte.${depuis}&real_remaining=not.is.null&order=date_utc.desc&limit=1`,
    { headers: { apikey: cle, Authorization: `Bearer ${cle}` } });
  if (!r.ok) return lignes;
  const j = await r.json();
  if (!Array.isArray(j) || !j.length) return lignes;
  const q = j[0], reste = Number(q.real_remaining);
  const probleme = Number.isFinite(reste) && reste < SEUIL_CREDITS_ODDS_API;
  lignes.push({ type: 'QUOTA_ODDS_API_B', probleme, cause: probleme ? (reste <= 0 ? 'EPUISE' : 'BAS') : null,
    detail: probleme ? `The Odds API : ${reste} crédit(s) restant(s)` : 'ok',
    infos: { service: 'B', restant: reste, limite: q.real_limit, releve_le: q.real_captured_at ? hhmmHaiti(q.real_captured_at) : null } });
  return lignes;
}
// Quota mensuel : un rappel par jour suffit (alert_claim rappelle toutes les 3 h). Lecture seule.
async function signaleDepuisMoinsDe24h(cleAlerte) {
  try {
    const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const r = await fetchAvecDelai(`${base}/rest/v1/alert_state?select=active,last_sent_at&type=eq.${encodeURIComponent(cleAlerte)}&limit=1`,
      { headers: { apikey: cle, Authorization: `Bearer ${cle}` } });
    if (!r.ok) return false;
    const j = await r.json();
    return !!(Array.isArray(j) && j.length && j[0].active && j[0].last_sent_at && Date.now() - Date.parse(j[0].last_sent_at) < 24 * 3600000);
  } catch (_) { return false; }
}

// 21/11 (« OK alerte BSD ») : relais de secours BSD (football). Deux VRAIS problèmes seulement :
//  (1) BSD_RELAIS_A : au dernier passage de création (moins de 3 h), API-Sports n'a pas répondu, le
//      relais a été déclenché (stats.relaisBSD.declenche) mais n'a fourni aucun match
//      (stats.relaisBSD.actif false) -> aucune fiche foot possible. Relais non déclenché (API-Sports
//      répond) ou réussi -> pas de problème (et « Rétabli » si l'alerte était active).
//  (2) BSD_REGLEMENT_A : sélections foot venant de BSD (fixture_id < 0) sans résultat plus de 8 h
//      après le début du match (le calcul les laisse en attente tant que BSD ne répond pas).
// Lecture seule ; lecture impossible -> aucune ligne (ni alerte ni « Rétabli »).
async function ajouterAlertesBSD(lignes) {
  const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: cle, Authorization: `Bearer ${cle}` };
  try {
    const depuis = new Date(Date.now() - 3 * 3600000).toISOString();
    const r = await fetchAvecDelai(`${base}/rest/v1/bot_run_log_prod?select=ran_at,stats&bot=eq.foot&ran_at=gte.${encodeURIComponent(depuis)}&order=ran_at.desc&limit=2`, { headers: h });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j) && j.length) {
        const rate = x => { const rr = (x && x.stats && x.stats.relaisBSD) || null; return !!(rr && rr.declenche === true && rr.actif !== true); };
        const rel = (j[0].stats && j[0].stats.relaisBSD) || null;
        // 21/11 (anti-répétition) : alerte seulement après 2 passages RATÉS DE SUITE (un raté isolé
        // suivi d'un passage réussi ne doit jamais faire « alerte -> Rétabli -> alerte »).
        // Un seul passage raté : ni alerte ni « Rétabli » (on attend le passage suivant).
        if (rate(j[0]) && !(j.length >= 2 && rate(j[1]))) throw new Error('un seul passage raté : on attend le suivant');
        const enEchec = rate(j[0]);
        lignes.push({ type: 'BSD_RELAIS_A', probleme: enEchec, cause: enEchec ? 'ECHEC' : null,
          detail: enEchec ? 'Relais BSD déclenché sans aucun match (API-Sports et BSD indisponibles)' : 'ok',
          infos: { service: 'A', echecs: 2, heure: hhmmHaiti(j[0].ran_at), erreur: rel && rel.erreur ? String(rel.erreur).slice(0, 200) : null,
            lus: rel && rel.evenementsLus != null ? rel.evenementsLus : null, nonCommences: rel && rel.matchsNonCommences != null ? rel.matchsNonCommences : null } });
      }
    }
  } catch (e) { console.log('[ALERTE] relais BSD (création) :', e.message); }   // dont « un seul passage raté »
  try {
    const HEURES = 8;
    const limite = new Date(Date.now() - HEURES * 3600000).toISOString();
    const r = await fetchAvecDelai(`${base}/rest/v1/ticket_legs?select=id,kickoff_at,tickets!inner(sport,published)&result=is.null&fixture_id=lt.0&kickoff_at=lt.${encodeURIComponent(limite)}&tickets.sport=eq.foot&tickets.published=eq.true&order=kickoff_at.asc&limit=50`, { headers: h });
    if (r.ok) {
      const j = await r.json();
      if (Array.isArray(j)) {
        const nb = j.length;
        lignes.push({ type: 'BSD_REGLEMENT_A', probleme: nb > 0, cause: nb > 0 ? 'ATTENTE' : null,
          detail: nb > 0 ? `${nb} sélection(s) BSD sans résultat plus de ${HEURES} h après le début` : 'ok',
          infos: { service: 'A', nb, heures: HEURES, plus_ancien: nb ? hhmmHaiti(j[0].kickoff_at) : null } });
      }
    }
  } catch (e) { console.log('[ALERTE] relais BSD (résultats) :', e.message); }
  return lignes;
}

// 21/11 (James : « éviter d'autres problèmes de ce genre ») : état RÉEL du dernier passage d'un
// service (création des fiches + calcul des résultats, site de production d'abord). Sert à :
//   - ne JAMAIS envoyer « Rétabli » pour une API tant que le dernier passage de ce service a été
//     refusé (cas réel du 21/11 : la base attend 12 min avant de compter un refus, et un refus de
//     moins de 12 min faisait croire la panne finie -> faux « Rétabli » puis nouvelle alerte) ;
//   - taire « site Netlify refusé » pendant une SUSPENSION du compte (simple conséquence).
// Lecture seule ; en cas d'échec de lecture : { refuse: false } (comportement d'avant).
const REFUS_API = /suspend|application key|api key|api_sports_key|access denied|unauthori|forbidden|HTTP 40[13]\b|\[COUPURE API\]/i;
async function etatDernierPassage(sport) {
  const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const h = { apikey: cle, Authorization: `Bearer ${cle}` };
  const depuis = new Date(Date.now() - 3 * 3600000).toISOString();
  for (const table of ['bot_run_log_prod', 'bot_run_log']) {
    try {
      const r = await fetchAvecDelai(`${base}/rest/v1/${table}?select=bot,ran_at,stats&bot=in.(${sport},reglement-${sport})&ran_at=gte.${encodeURIComponent(depuis)}&order=ran_at.desc&limit=1`, { headers: h });
      if (!r.ok) continue;
      const j = await r.json();
      if (!Array.isArray(j)) continue;
      if (!j.length) return { refuse: false, suspendu: false };
      const st = j[0].stats || {}, txt = JSON.stringify(st.erreurs || []);
      const refuse = st.refus === true || REFUS_API.test(txt);
      return { refuse, suspendu: refuse && /suspend/i.test(txt), bot: j[0].bot, a: j[0].ran_at };
    } catch (_) { /* table suivante */ }
  }
  return { refuse: false, suspendu: false };
}

// 12/11 : seules les alertes du site de PRODUCTION partent. Un autre site Netlify (autre équipe)
// qui exécute ce même code ne doit JAMAIS envoyer d'alerte. Liste = table alert_sites
// (la même que pour les passages des bots). Table vide ou illisible = aucun filtre (sécurité :
// on ne coupe jamais l'alerte « API suspendue » par erreur).
function siteCourant() {
  return String(process.env.SITE_NAME || String(process.env.URL || process.env.DEPLOY_URL || '').replace(/^https?:\/\//, '') || '').slice(0, 80);
}
async function sitesProduction() {
  try {
    const base = process.env.SUPABASE_URL, cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const r = await fetchAvecDelai(`${base}/rest/v1/alert_sites?select=site`, { headers: { apikey: cle, Authorization: `Bearer ${cle}` } });
    if (!r.ok) return [];
    const j = await r.json();
    return Array.isArray(j) ? j.map(x => String(x.site || '')).filter(Boolean) : [];
  } catch (_) { return []; }
}

// Canaux, dans l'ordre de priorité : Telegram (gratuit, sans quota), email, puis
// WhatsApp (CallMeBot, quota limité : dernier recours, facultatif).
// Chaque fonction retourne true/false (envoi réussi ou non) ; l'appelant sait
// déjà, via canalConfigure(), si le canal est configuré.
const CANAUX = [
  {
    nom: 'telegram',
    configure: () => {
      if (!process.env.TELEGRAM_BOT_TOKEN) return false;
      const g = chatAlerte();
      if (!g.ok && process.env.TELEGRAM_CHAT_ID) console.error('[ALERTE] Telegram desactive : ' + g.raison);
      return g.ok;
    },
    async envoyer(sujet, lignes, courtes) {
      const texteCourt = (courtes && courtes.length) ? courtes.join('\n') : lignes.join('\n');
      const r = await fetchAvecDelai(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatAlerte().chat, text: `${sujet}\n\n${texteCourt}`.slice(0, 3900) })
      });
      if (!r.ok) console.log('[ALERTE] Telegram HTTP', r.status, (await r.text()).slice(0, 200));
      return r.ok;
    }
  },
  {
    nom: 'email',
    configure: () => !!(process.env.RESEND_API_KEY && process.env.ALERT_EMAIL),
    async envoyer(sujet, lignes) {
      const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">' +
        lignes.map(l => `<p style="margin:0 0 10px">${echapper(l)}</p>`).join('') + '</div>';
      const r = await fetchAvecDelai('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.ALERT_FROM || 'Alertes système <contact@vipbetcote.com>',
          to: [process.env.ALERT_EMAIL],
          subject: sujet, html, text: lignes.join('\n')
        })
      });
      if (!r.ok) console.log('[ALERTE] email HTTP', r.status, (await r.text()).slice(0, 200));
      return r.ok;
    }
  },
  {
    nom: 'whatsapp',
    configure: () => !!(process.env.WHATSAPP_PHONE && process.env.WHATSAPP_APIKEY),
    async envoyer(sujet, lignes, courtes) {
      // CallMeBot : requête GET, texte court. Il supprime l'apostrophe droite : on la remplace.
      const texteCourt = (courtes && courtes.length) ? courtes.join('\n') : lignes.join('\n');
      const court = `${sujet}\n\n${texteCourt}`.slice(0, 1000).replace(/'/g, '\u2019');
      const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(process.env.WHATSAPP_PHONE) +
        '&text=' + encodeURIComponent(court) + '&apikey=' + encodeURIComponent(process.env.WHATSAPP_APIKEY);
      const r = await fetchAvecDelai(url, { method: 'GET' }, 15000);
      if (!r.ok) console.log('[ALERTE] WhatsApp HTTP', r.status);
      return r.ok;
    }
  }
];

// Retourne { email, telegram, whatsapp } : true = envoyé, false = échec,
// null = canal non configuré OU non essayé (un canal précédent avait réussi).
// ANTI-COPIES : par défaut on s'arrête au PREMIER canal qui réussit (les suivants
// ne servent que de secours). tousLesCanaux = true (test d'envoi) essaie tout.
async function envoyer(sujet, lignes, courtes, tousLesCanaux) {
  const res = { email: null, telegram: null, whatsapp: null };
  for (const c of CANAUX) {
    if (!c.configure()) continue;
    try { res[c.nom] = await c.envoyer(sujet, lignes, courtes); }
    catch (e) { res[c.nom] = false; console.log(`[ALERTE] ${c.nom} erreur`, e.message); }
    if (res[c.nom] === true && !tousLesCanaux) break;
  }
  return res;
}

const envoiReussi = r => r.email === true || r.telegram === true || r.whatsapp === true;

async function handler(event) {
  const qs = (event && event.queryStringParameters) || {};
  const manquantes = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter(k => !process.env[k]);
  const testAutorise = qs.test === '1' && process.env.BOT_TEST_TOKEN && qs.token === process.env.BOT_TEST_TOKEN;

  if (!CANAUX.some(c => c.configure())) manquantes.push('un canal d\'envoi (TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, ou ALERT_EMAIL + RESEND_API_KEY, ou WHATSAPP_*)');
  if (manquantes.length) {
    const msg = 'Configuration incomplète. Variables manquantes : ' + manquantes.join(', ');
    console.log('[ALERTE]', msg);
    return { statusCode: 500, body: msg };
  }

  if (testAutorise) {
    // Le test essaie TOUS les canaux configurés, pour vérifier chacun.
    const r = await envoyer('✅ test des alertes', [
      'Ce message confirme que les alertes admin fonctionnent.',
      'Tu recevras un message de ce type dès qu\'un problème (pai bloquée, bet manquantes, règlement bloqué...) sera détecté.'
    ], null, true);
    return { statusCode: 200, body: JSON.stringify({ test: true, envoi: r }) };
  }

  const prod = await sitesProduction();
  if (prod.length && !prod.includes(siteCourant())) {
    console.log(`[ALERTE] site « ${siteCourant()} » hors production (${prod.join(', ')}) : aucune alerte envoyée.`);
    return { statusCode: 200, body: 'site hors production : aucune alerte' };
  }

  let lignes;
  try { lignes = await rpc('alert_check'); }
  catch (e) {
    console.log('[ALERTE] alert_check impossible :', e.message);
    return { statusCode: 500, body: 'alert_check impossible : ' + e.message };
  }
  try { lignes = await ajouterApiVueParLeCalcul(Array.isArray(lignes) ? lignes : []); }
  catch (e) { console.log('[ALERTE] fusion API du calcul :', e.message); }
  try { lignes = await ajouterQuotaOddsApi(Array.isArray(lignes) ? lignes : []); }
  catch (e) { console.log('[ALERTE] crédits The Odds API :', e.message); }
  try { lignes = await ajouterAlertesBSD(Array.isArray(lignes) ? lignes : []); }
  catch (e) { console.log('[ALERTE] relais BSD :', e.message); }

  const bilan = [];
  const aEnvoyer = [];   // { cle, l } : alertes gagnées ce passage (verrou pris)
  const retablis = [];   // lignes "Rétabli"
  // 21/11 : état réel du dernier passage de chaque service (voir etatDernierPassage).
  const etat = { A: await etatDernierPassage('foot'), B: await etatDernierPassage('basket') };
  const svcDe = t => (/FOOT|_A$/.test(t) ? 'A' : (/BASKET|_B$/.test(t) ? 'B' : null));
  const suspendu = k => etat[k].suspendu || (lignes || []).some(x => x && x.probleme && x.cause === 'SUSPENDU' && svcDe(x.type) === k);

  for (const l of (lignes || [])) {
    try {
      if (l.probleme && /^PUB_MANQUANTE_[AB]$/.test(l.type)) {
        let d = null;
        try { d = await dernierPassage(l.type === 'PUB_MANQUANTE_A' ? 'foot' : 'basket', String((l.infos || {}).date_cible || '')); }
        catch (e) { console.log('[ALERTE] diagnostic du dernier passage :', e.message); }
        l.diag = d;
        const verdict = jugerPublicationManquante(l, d);
        if (verdict === 'silence') { bilan.push(`${l.type}: jour sans assez de matchs, pas un problème (aucune alerte)`); continue; }
        l.cause = verdict;
      }
      // 21/11 : pendant une suspension du compte, « site Netlify refusé » n'est qu'une conséquence.
      if (l.probleme && /^API_SITE_OBSOLETE_[AB]$/.test(l.type) && suspendu(svcDe(l.type))) {
        bilan.push(`${l.type}: compte suspendu (alerte prioritaire déjà envoyée), pas d'alerte « site »`);
        continue;
      }
      // 22/11 (fausse alerte reçue) : un « échec » dont le message est une SUSPENSION du compte n'est
      // jamais un site Netlify en trop — c'est la suspension elle-même (déjà signalée par ⛔), même
      // une fois finie (la base garde cet échec 30 h). Alerte « site » fermée sans message.
      if (l.probleme && /^API_SITE_OBSOLETE_[AB]$/.test(l.type) && /suspend/i.test(String((l.infos || {}).message_api || ''))) {
        try { await rpc('alert_resolve', { p_type: l.type }); } catch (_) { /* sans conséquence */ }
        bilan.push(`${l.type}: échec dû à une suspension du compte (pas un site en trop), fermée sans message`);
        continue;
      }
      if (l.probleme && !alerteUtile(l)) {
        bilan.push(`${l.type}${l.cause ? ':' + l.cause : ''}: le bot s'en occupe seul, pas d'alerte`);
        continue;
      }
      if (l.probleme) {
        // Un CHANGEMENT de cause (ex. suspendu -> limite du jour) est un nouveau problème :
        // la clé du verrou inclut la cause pour qu'il soit signalé tout de suite.
        const cle = l.cause ? `${l.type}:${l.cause}` : l.type;
        if ((l.type === 'QUOTA_ODDS_API_B' || l.type === 'BSD_REGLEMENT_A') && await signaleDepuisMoinsDe24h(cle)) { bilan.push(`${cle}: actif (signalé il y a moins de 24 h)`); continue; }
        const doitEnvoyer = await rpc('alert_claim', { p_type: cle, p_detail: l.detail });
        if (!doitEnvoyer) { bilan.push(`${cle}: actif (déjà signalé)`); continue; }
        aEnvoyer.push({ cle, l });
      } else {
        // 21/11 : jamais de « Rétabli » API tant que le dernier passage de ce service est refusé.
        if (/^(API_BLOQUEE_|API_SITE_OBSOLETE_)/.test(l.type) && svcDe(l.type) && etat[svcDe(l.type)].refuse) {
          bilan.push(`${l.type}: dernier passage encore refusé, pas de « Rétabli »`);
          continue;
        }
        const etaitActif = await rpc('alert_resolve', { p_type: l.type });
        if (etaitActif) {
          const titre = TITRES[l.type] || 'Alerte système';
          const i = l.infos || {};
          let ligne = `${titre} : le problème n'est plus détecté.`;
          if (/^PUB_MANQUANTE_/.test(l.type) && i.date_cible) ligne = `${titre} : publications présentes pour le ${i.date_cible}.`;
          if (l.type === 'QUOTA_ODDS_API_B') ligne = `${titre} : crédits rechargés (${(l.infos || {}).restant} restants).`;
          if (l.type === 'BSD_RELAIS_A') ligne = `${titre} : les matchs football sont de nouveau reçus.`;
          if (l.type === 'BSD_REGLEMENT_A') ligne = `${titre} : plus aucune sélection BSD bloquée.`;
          if (/^REGLEMENT_BLOQUE_/.test(l.type)) ligne = `${titre} : plus aucun élément en attente de résultat depuis plus de 6 h.`;
          retablis.push({ type: l.type, titre, ligne });
        }
      }
    } catch (e) {
      console.log(`[ALERTE] ${l.type} :`, e.message);
      bilan.push(`${l.type}: erreur ${e.message}`);
    }
  }

  // 10/11 : « rien publié sans erreur » -> on lit le dernier résumé du passage pour dire la VRAIE
  // cause (jour pauvre, anti-doublon, règles). Lecture seule, jamais bloquant ; l'alerte
  // prioritaire « API suspendue » n'est pas concernée.

  // --- UN SEUL message pour toutes les alertes de ce passage ---
  if (aEnvoyer.length) {
    try {
      const m = grouperAlertes(aEnvoyer.map(x => x.l));
      // ALERTE PRIORITAIRE (compte API suspendu) : préfixe + TOUS les canaux à la fois.
      const prioritaire = aEnvoyer.some(x => /:SUSPENDU$/.test(x.cle));
      const sujet = prioritaire ? '🚨 PRIORITÉ — ' + m.sujet : m.sujet;
      const r = await envoyer(sujet, m.lignes, m.courtes, prioritaire);
      if (!envoiReussi(r)) {
        // Envoi raté sur tous les canaux : nouvel essai dans 30 minutes (on ne martèle pas la messagerie).
        for (const x of aEnvoyer) {
          try { await rpc('alert_retry_later', { p_type: x.cle }); } catch (e) { console.log('[ALERTE] retry_later', e.message); }
        }
        bilan.push(`${aEnvoyer.map(x => x.cle).join(', ')}: ENVOI ÉCHOUÉ, nouvel essai dans 30 min`);
      } else bilan.push(`${aEnvoyer.map(x => x.cle).join(', ')}: alerte envoyée (1 message)`);
    } catch (e) {
      console.log('[ALERTE] envoi groupé :', e.message);
      for (const x of aEnvoyer) {
        try { await rpc('alert_retry_later', { p_type: x.cle }); } catch (_) { /* rien */ }
      }
      bilan.push(`envoi groupé erreur ${e.message}`);
    }
  }

  // --- UN SEUL message "Rétabli" pour tous les problèmes résolus de ce passage ---
  if (retablis.length) {
    try {
      const sujet = retablis.length === 1
        ? `✅ Alerte système — Rétabli : ${retablis[0].titre}`
        : `✅ Alertes système — Rétabli (${retablis.length})`;
      await envoyer(sujet, retablis.map(x => x.ligne));
      bilan.push(`${retablis.map(x => x.type).join(', ')}: rétabli`);
    } catch (e) {
      console.log('[ALERTE] envoi rétabli :', e.message);
      bilan.push(`rétabli erreur ${e.message}`);
    }
  }

  console.log('[ALERTE] bilan :', bilan.join(' | ') || 'RAS');
  return { statusCode: 200, body: JSON.stringify({ ok: true, bilan }) };
}

module.exports.handler = handler;
module.exports.config = config;
module.exports._interne = { assainir, construire, TITRES, grouperAlertes, envoyer, jugerPublicationManquante, dernierPassage, siteCourant, alerteUtile, heuresDepuisHaiti, jugerApiReglement, causeRefusApi };
