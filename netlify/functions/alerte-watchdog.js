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
 * (2) UN SEUL canal par message : WhatsApp, puis email si WhatsApp échoue, puis
 * Telegram. Seul le test d'envoi (relais ?test=1) essaie tous les canaux.
 *
 * Variables Netlify :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (déjà présentes)
 *   Au moins UN canal :
 *     WHATSAPP_PHONE + WHATSAPP_APIKEY        (service CallMeBot, usage personnel)
 *     RESEND_API_KEY + ALERT_EMAIL            (email)
 *     TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID   (Telegram)
 *   Optionnelles : ALERT_FROM (défaut : "Alertes système <contact@mail.vipbetcote.com>"),
 *   BOT_TEST_TOKEN (test d'envoi via le relais).
 *
 * Planification : voir netlify.toml. Test manuel : alerte-watchdog-relais.js
 * ============================================================================
 */

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
  API_SITE_OBSOLETE_A: 'Ancienne clé API (service A)',
  API_SITE_OBSOLETE_B: 'Ancienne clé API (service B)',
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

  // --- Site resté sur une ancienne clé : des exécutions refusées ALORS QUE d'autres réussissent ---
  if (t === 'API_SITE_OBSOLETE_A' || t === 'API_SITE_OBSOLETE_B') {
    const titre = `Ancienne clé API sur un site (${S})`;
    const c1 = 'Certaines exécutions automatiques sont refusées par le fournisseur alors que d\'autres fonctionnent au même moment : le service marche, mais un ou plusieurs sites Netlify utilisent une ancienne clé (compte refusé ou clé absente).';
    const c2 = `Dernier refus : ${i.dernier_refus || '?'} (heure Haïti) — ${i.refus_30h != null ? i.refus_30h : '?'} refus sur les dernières 30 h ; ${i.succes_simultanes != null ? i.succes_simultanes : '?'} exécution(s) réussie(s) au même moment.`;
    const a1 = 'Plusieurs sites Netlify exécutent les mêmes tâches (plusieurs exécutions à chaque passage), ce qui consomme aussi le quota plusieurs fois. Garde UN SEUL site actif et supprime les autres, ou mets la clé valide sur chacun puis redéploie.';
    return { titre, lignes: [titre, '', c1, c2, '', a1], courtes: [c1, c2, 'Action : garder un seul site Netlify actif (ou la clé valide partout), puis redéployer.'] };
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
      case 'AUCUN_ELEMENT':
        cause = `Le dernier passage${i.dernier_passage ? ' (' + i.dernier_passage + ', heure Haïti)' : ''} n'a signalé aucune erreur mais n'a rien publié (éléments trouvés : ${i.matchs_trouves !== '' && i.matchs_trouves != null ? i.matchs_trouves : '0'}).`;
        action = 'Causes possibles : rien à publier ce jour-là, ou une protection anti-doublon qui croit qu\'une publication existe déjà. Regarde les logs Netlify du dernier passage.';
        court = 'Action : regarder les logs Netlify du dernier passage (rien à publier, ou protection anti-doublon ?).';
        break;
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
    const a1 = 'Le calcul repasse chaque heure. Vérifie qu\'aucune alerte API n\'est active, puis regarde les logs Netlify de la fonction de calcul des résultats.';
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

// Canaux, dans l'ordre de priorité : WhatsApp, email, Telegram.
// Chaque fonction retourne true/false (envoi réussi ou non) ; l'appelant sait
// déjà, via canalConfigure(), si le canal est configuré.
const CANAUX = [
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
          from: process.env.ALERT_FROM || 'Alertes système <contact@mail.vipbetcote.com>',
          to: [process.env.ALERT_EMAIL],
          subject: sujet, html, text: lignes.join('\n')
        })
      });
      if (!r.ok) console.log('[ALERTE] email HTTP', r.status, (await r.text()).slice(0, 200));
      return r.ok;
    }
  },
  {
    nom: 'telegram',
    configure: () => !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID),
    async envoyer(sujet, lignes, courtes) {
      const texteCourt = (courtes && courtes.length) ? courtes.join('\n') : lignes.join('\n');
      const r = await fetchAvecDelai(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `${sujet}\n\n${texteCourt}`.slice(0, 3900) })
      });
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

  if (!CANAUX.some(c => c.configure())) manquantes.push('un canal d\'envoi (WHATSAPP_PHONE + WHATSAPP_APIKEY, ou ALERT_EMAIL + RESEND_API_KEY, ou TELEGRAM_*)');
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

  let lignes;
  try { lignes = await rpc('alert_check'); }
  catch (e) {
    console.log('[ALERTE] alert_check impossible :', e.message);
    return { statusCode: 500, body: 'alert_check impossible : ' + e.message };
  }

  const bilan = [];
  const aEnvoyer = [];   // { cle, l } : alertes gagnées ce passage (verrou pris)
  const retablis = [];   // lignes "Rétabli"

  for (const l of (lignes || [])) {
    try {
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

  // --- UN SEUL message pour toutes les alertes de ce passage ---
  if (aEnvoyer.length) {
    try {
      const m = grouperAlertes(aEnvoyer.map(x => x.l));
      const r = await envoyer(m.sujet, m.lignes, m.courtes);
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
module.exports._interne = { assainir, construire, TITRES, grouperAlertes, envoyer };
