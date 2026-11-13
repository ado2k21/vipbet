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

function construire(l) {
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

// Retourne { sujet, lignes, courtes } pour un lot d'alertes (ls = lignes de alert_check).
function grouperAlertes(ls) {
  const obsoletes = ls.filter(l => /^API_SITE_OBSOLETE_/.test(l.type));
  const autres = ls.filter(l => !/^API_SITE_OBSOLETE_/.test(l.type));
  const items = autres.map(construire);
  if (obsoletes.length >= 2) items.push(messageObsoleteFusionne(obsoletes));
  else if (obsoletes.length === 1) items.push(construire(obsoletes[0]));

  if (items.length === 1) {
    return { sujet: `🚨 Alerte système — ${items[0].titre}`, lignes: items[0].lignes, courtes: items[0].courtes };
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

  const bilan = [];
  const aEnvoyer = [];   // { cle, l } : alertes gagnées ce passage (verrou pris)
  const retablis = [];   // lignes "Rétabli"

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
      if (l.probleme && !alerteUtile(l)) {
        bilan.push(`${l.type}${l.cause ? ':' + l.cause : ''}: le bot s'en occupe seul, pas d'alerte`);
        continue;
      }
      if (l.probleme) {
        // Un CHANGEMENT de cause (ex. suspendu -> limite du jour) est un nouveau problème :
        // la clé du verrou inclut la cause pour qu'il soit signalé tout de suite.
        const cle = l.cause ? `${l.type}:${l.cause}` : l.type;
        const doitEnvoyer = await rpc('alert_claim', { p_type: cle, p_detail: l.detail });
        if (!doitEnvoyer) { bilan.push(`${cle}: actif (déjà signalé)`); continue; }
        aEnvoyer.push({ cle, l });
      } else {
        const etaitActif = await rpc('alert_resolve', { p_type: l.type });
        if (etaitActif) {
          const titre = TITRES[l.type] || 'Alerte système';
          const i = l.infos || {};
          let ligne = `${titre} : le problème n'est plus détecté.`;
          if (/^PUB_MANQUANTE_/.test(l.type) && i.date_cible) ligne = `${titre} : publications présentes pour le ${i.date_cible}.`;
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
