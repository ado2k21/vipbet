/**
 * ============================================================================
 * VIP BETCOTE — SURVEILLANCE + ALERTES ADMIN (Netlify Function planifiée)
 * Fichier : netlify/functions/alerte-watchdog.js
 * ----------------------------------------------------------------------------
 * Toutes les 10 minutes, interroge la fonction SQL alert_check() (déjà créée
 * en base) et t'envoie un message dès qu'un problème apparaît, puis un
 * message "rétabli" quand il disparaît. Problèmes surveillés :
 *   - API_BLOQUEE_FOOT / _BASKET : API-Sports refuse les appels du bot
 *                                  (compte suspendu, clé invalide, limite)
 *   - QUOTA_FOOT_BAS / _BASKET_BAS : 10 requêtes ou moins restantes aujourd'hui
 *   - FICHES_MANQUANTES : aucune fiche football pour demain (dès 20h30 Haïti)
 *                         ou pour aujourd'hui (dès 6h00 Haïti)
 *   - REGLEMENT_BLOQUE : sélections sans résultat 6 h après le coup d'envoi
 *
 * ANTI-SPAM et ANTI-DOUBLON : la base (alert_claim / alert_resolve) décide
 * qui envoie, de façon atomique. Même si plusieurs sites Netlify font tourner
 * cette fonction en même temps, UN SEUL message part. Un problème qui dure est
 * rappelé toutes les 3 heures maximum.
 *
 * Variables Netlify requises :
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (déjà présentes)
 *   RESEND_API_KEY                            (déjà présente si c'est le nom
 *                                              utilisé par tes envois d'email)
 *   ALERT_EMAIL                               (NOUVELLE : ton adresse de réception)
 * Optionnelles :
 *   ALERT_FROM          (défaut : VIP BETCOTE Alertes <contact@mail.vipbetcote.com>)
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID    (notification instantanée sur téléphone)
 *   WHATSAPP_PHONE + WHATSAPP_APIKEY         (WhatsApp via le service gratuit
 *                                              CallMeBot, usage personnel ;
 *                                              PHONE au format +50912345678)
 *   BOT_TEST_TOKEN      (déjà présente : sert au test d'envoi via le relais)
 *
 * Planification : voir netlify.toml (seule vraie source de vérité).
 * Test manuel : alerte-watchdog-relais.js (jamais planifié) — ?token=...&test=1
 * ============================================================================
 */

const config = { schedule: '*/10 * * * *' };

const CONSEILS = {
  API_BLOQUEE_FOOT: [
    'Le bot football ne peut plus interroger API-Sports : plus de fiches ni de règlement tant que ce n\'est pas corrigé.',
    '1) dashboard.api-football.com : le compte est-il actif (pas suspendu) et la clé valide ?',
    '2) Netlify > chaque site qui fait tourner les bots > Environment variables : API_SPORTS_KEY à jour PARTOUT.',
    '3) Netlify > Deploys > Trigger deploy (une variable modifiée ne s\'applique qu\'après un redéploiement).'
  ],
  API_BLOQUEE_BASKET: [
    'Le bot basketball ne peut plus interroger API-Sports (même clé que le football).',
    '1) dashboard.api-football.com : compte actif, clé valide.',
    '2) Netlify : API_SPORTS_KEY à jour sur tous les sites, puis Trigger deploy.'
  ],
  QUOTA_FOOT_BAS: [
    'Le quota football du jour est presque épuisé (remise à zéro à minuit UTC = 20h00 Haïti).',
    'Évite les générations manuelles d\'ici là, pour garder des requêtes au règlement.'
  ],
  QUOTA_BASKET_BAS: [
    'Le quota basketball du jour est presque épuisé (remise à zéro à minuit UTC = 20h00 Haïti).'
  ],
  FICHES_MANQUANTES: [
    'Les abonnés risquent de ne pas avoir leurs fiches à l\'heure.',
    'Corrige d\'abord l\'API si une alerte API est aussi active, puis lance le relais de génération (bot-generate-tickets-trigger-background?token=...).'
  ],
  REGLEMENT_BLOQUE: [
    'Des résultats ne sont pas calculés. Le règlement repasse chaque heure ; une sélection n\'est annulée automatiquement qu\'après 2 jours.',
    'Regarde les logs Netlify de la fonction bot-settle-results (ligne "erreurs") et vérifie l\'alerte API.'
  ]
};

const TITRES = {
  API_BLOQUEE_FOOT: 'API-Sports bloquée (football)',      // repli si la cause n'est pas fournie
  API_BLOQUEE_BASKET: 'API-Sports bloquée (basketball)',
  QUOTA_FOOT_BAS: 'Quota API football presque épuisé',
  QUOTA_BASKET_BAS: 'Quota API basketball presque épuisé',
  FICHES_MANQUANTES: 'Fiches football manquantes',
  REGLEMENT_BLOQUE: 'Règlement des résultats bloqué'
};

// ----------------------------------------------------------------------------
// Blocage API-Sports : message PRÉCIS selon la cause réellement détectée par la
// base (texte exact renvoyé par API-Sports, jamais une supposition). Retourne
//   { titre, lignes (email, complet), courtes (WhatsApp/Telegram, ~600 car.) }
// ----------------------------------------------------------------------------
const CAUSES_API = {
  SUSPENDU: {
    titre: 'Compte API-Sports SUSPENDU',
    resume: 'API-Sports refuse tous les appels : le compte lié à la clé utilisée est suspendu.',
    actions: [
      'Ce n\'est pas une simple clé à remplacer : une nouvelle clé du MÊME compte reste suspendue.',
      '1) Ouvre dashboard.api-football.com et regarde l\'état du compte / contacte leur support pour lever la suspension, ou crée un compte avec une autre adresse email.',
      '2) Mets la clé valide dans API_SPORTS_KEY sur TOUS les sites Netlify qui font tourner les bots.',
      '3) Netlify > Deploys > Trigger deploy (une variable modifiée ne s\'applique qu\'après redéploiement).'
    ],
    court: 'Action : dashboard.api-football.com → lever la suspension (une nouvelle clé du même compte reste suspendue), puis clé valide sur tous les sites Netlify + redéploiement.'
  },
  LIMITE_JOUR: {
    titre: 'Limite quotidienne API-Sports atteinte',
    resume: 'Les 100 requêtes gratuites du jour sont épuisées : API-Sports refuse tout jusqu\'à la remise à zéro (minuit UTC = 20h00 Haïti).',
    actions: [
      'Rien à réparer : les appels reprendront après la remise à zéro.',
      'Évite les générations manuelles d\'ici là. Si ça se reproduit chaque jour, plusieurs sites Netlify consomment le même quota en parallèle : vérifie la liste de tes sites.'
    ],
    court: 'Action : attendre 20h00 Haïti (remise à zéro), pas de génération manuelle d\'ici là.'
  },
  LIMITE_MINUTE: {
    titre: 'API-Sports : trop de requêtes par minute',
    resume: 'La limite de 10 requêtes par minute est dépassée : API-Sports rejette des appels.',
    actions: [
      'Cause fréquente : plusieurs sites Netlify (ou plusieurs passages du bot) appellent l\'API en même temps. Vérifie que UN SEUL site fait tourner les bots planifiés.'
    ],
    court: 'Action : vérifier qu\'un seul site Netlify fait tourner les bots.'
  },
  CLE_INVALIDE: {
    titre: 'Clé API-Sports invalide ou absente',
    resume: 'API-Sports ne reconnaît pas la clé utilisée par le bot.',
    actions: [
      '1) Netlify > Environment variables : API_SPORTS_KEY est-elle bien renseignée, sans espace, sur CHAQUE site qui exécute les bots ?',
      '2) Compare avec la clé affichée sur dashboard.api-football.com, puis Trigger deploy.'
    ],
    court: 'Action : vérifier API_SPORTS_KEY sur chaque site Netlify (identique au dashboard API-Sports), puis redéployer.'
  },
  ACCES_REFUSE: {
    titre: 'API-Sports refuse l\'accès (erreur 401/403)',
    resume: 'API-Sports rejette les appels du bot (accès non autorisé).',
    actions: [
      'Vérifie sur dashboard.api-football.com que l\'abonnement est actif et que la clé correspond, puis redéploie.'
    ],
    court: 'Action : vérifier l\'abonnement et la clé sur dashboard.api-football.com, puis redéployer.'
  },
  AUTRE: {
    titre: 'API-Sports : erreur',
    resume: 'API-Sports a renvoyé une erreur que je ne sais pas classer (message exact ci-dessous).',
    actions: ['Regarde le message exact, puis dashboard.api-football.com et les logs Netlify du bot.'],
    court: 'Action : lire le message ci-dessus, vérifier dashboard.api-football.com et les logs Netlify.'
  }
};

function messageApi(l) {
  const c = CAUSES_API[l.cause] || CAUSES_API.AUTRE;
  const i = l.infos || {};
  const api = i.api ? ` (${i.api})` : '';
  const titre = c.titre + api;
  const nbRefus = i.nb_refus != null ? `${i.nb_refus} refus depuis` : '';
  const depuis = i.premier_refus ? `Bloqué depuis le ${i.premier_refus} (heure Haïti)${nbRefus ? ' — ' + nbRefus : ''}.` : '';
  const derniere = i.dernier_refus ? `Dernier refus : ${i.dernier_refus}.` : '';
  const fiches = i.date_fiches
    ? `fiches du ${i.date_fiches} : ${Number(i.fiches_publiees) > 0 ? 'déjà publiées (' + i.fiches_publiees + ')' : 'ABSENTES'}`
    : '';
  const impact = `Conséquences : ${Number(i.selections_attente) || 0} sélection(s) sans résultat` + (fiches ? ' ; ' + fiches : '') + '.';
  // On retire le préfixe technique du bot ("API-Sports v3.../fixtures: ") pour ne garder que la phrase d'API-Sports.
  const texteApi = String(i.message_api || '').replace(/^API-Sports[^:]*:\s*/i, '').trim();
  const msgApi = texteApi ? `Message exact d'API-Sports : « ${texteApi} »` : '';
  const lignes = [titre, '', c.resume, msgApi, depuis, derniere, impact, ''].filter((x, idx, a) => x !== '' || a[idx - 1] !== '')
    .concat(c.actions);
  const courtes = [c.resume, msgApi, depuis, impact, c.court].filter(Boolean);
  return { titre, lignes, courtes };
}

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

// Retourne { email, telegram, whatsapp } — chacun bool, ou null = canal non configuré.
async function envoyer(sujet, lignes, courtes) {
  const texte = lignes.join('\n');
  const texteCourt = (courtes && courtes.length) ? courtes.join('\n') : texte;
  const html = '<div style="font-family:Arial,sans-serif;font-size:15px;line-height:1.5;color:#111">' +
    lignes.map(l => `<p style="margin:0 0 10px">${echapper(l)}</p>`).join('') + '</div>';
  const res = { email: null, telegram: null, whatsapp: null };

  if (process.env.RESEND_API_KEY && process.env.ALERT_EMAIL) {
    try {
      const r = await fetchAvecDelai('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.ALERT_FROM || 'VIP BETCOTE Alertes <contact@mail.vipbetcote.com>',
          to: [process.env.ALERT_EMAIL],
          subject: sujet, html, text: texte
        })
      });
      res.email = r.ok;
      if (!r.ok) console.log('[ALERTE] Resend HTTP', r.status, (await r.text()).slice(0, 200));
    } catch (e) { res.email = false; console.log('[ALERTE] Resend erreur', e.message); }
  }

  if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
    try {
      const r = await fetchAvecDelai(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: process.env.TELEGRAM_CHAT_ID, text: `${sujet}\n\n${texteCourt}`.slice(0, 3900) })
      });
      res.telegram = r.ok;
    } catch (e) { res.telegram = false; console.log('[ALERTE] Telegram erreur', e.message); }
  }

  // WhatsApp via CallMeBot (service gratuit tiers, usage personnel) : requête GET,
  // texte court (l'URL est limitée en longueur) — le détail complet reste dans l'email.
  if (process.env.WHATSAPP_PHONE && process.env.WHATSAPP_APIKEY) {
    try {
      // CallMeBot supprime l'apostrophe droite (« qu'un » devient « quun ») : on la remplace par
      // l'apostrophe typographique, affichée correctement par WhatsApp.
      const court = `${sujet}\n\n${texteCourt}`.slice(0, 1000).replace(/'/g, '\u2019');
      const url = 'https://api.callmebot.com/whatsapp.php?phone=' + encodeURIComponent(process.env.WHATSAPP_PHONE) +
        '&text=' + encodeURIComponent(court) + '&apikey=' + encodeURIComponent(process.env.WHATSAPP_APIKEY);
      const r = await fetchAvecDelai(url, { method: 'GET' }, 15000);
      res.whatsapp = r.ok;
      if (!r.ok) console.log('[ALERTE] WhatsApp HTTP', r.status);
    } catch (e) { res.whatsapp = false; console.log('[ALERTE] WhatsApp erreur', e.message); }
  }
  return res;
}

const envoiReussi = r => r.email === true || r.telegram === true || r.whatsapp === true;

async function handler(event) {
  const qs = (event && event.queryStringParameters) || {};
  const manquantes = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ALERT_EMAIL', 'RESEND_API_KEY']
    .filter(k => !process.env[k]);
  const testAutorise = qs.test === '1' && process.env.BOT_TEST_TOKEN && qs.token === process.env.BOT_TEST_TOKEN;

  // Au moins UN canal doit être configuré : email (RESEND_API_KEY + ALERT_EMAIL),
  // Telegram ou WhatsApp. Un envoi est jugé réussi dès qu'UN canal a marché.
  const canalOk = (process.env.RESEND_API_KEY && process.env.ALERT_EMAIL) ||
                  (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) ||
                  (process.env.WHATSAPP_PHONE && process.env.WHATSAPP_APIKEY);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY || !canalOk) {
    const msg = 'Configuration incomplète. Variables manquantes : ' + manquantes.join(', ');
    console.log('[ALERTE]', msg);
    return { statusCode: 500, body: msg };
  }

  if (testAutorise) {
    const r = await envoyer('✅ VIP BETCOTE — test des alertes', [
      'Ce message confirme que les alertes admin fonctionnent.',
      'Tu recevras un message de ce type dès qu\'un problème (API-Sports bloquée, fiches manquantes, règlement bloqué...) sera détecté.'
    ]);
    return { statusCode: 200, body: JSON.stringify({ test: true, envoi: r }) };
  }

  let lignes;
  try { lignes = await rpc('alert_check'); }
  catch (e) {
    console.log('[ALERTE] alert_check impossible :', e.message);
    return { statusCode: 500, body: 'alert_check impossible : ' + e.message };
  }

  const bilan = [];
  for (const l of (lignes || [])) {
    const estApi = l.type.indexOf('API_BLOQUEE_') === 0;
    const precis = (estApi && l.probleme) ? messageApi(l) : null;
    const titre = precis ? precis.titre : (TITRES[l.type] || l.type);
    try {
      if (l.probleme) {
        // Un CHANGEMENT de cause (ex. suspendu -> limite du jour) est un nouveau problème :
        // la clé du verrou inclut la cause pour qu'il soit signalé tout de suite.
        const cle = (estApi && l.cause) ? `${l.type}:${l.cause}` : l.type;
        const doitEnvoyer = await rpc('alert_claim', { p_type: cle, p_detail: l.detail });
        if (!doitEnvoyer) { bilan.push(`${cle}: actif (déjà signalé)`); continue; }
        const r = precis
          ? await envoyer(`🚨 VIP BETCOTE — ${precis.titre}`, precis.lignes, precis.courtes)
          : await envoyer(`🚨 VIP BETCOTE — ${titre}`,
              [titre, '', l.detail, ''].concat(CONSEILS[l.type] || []),
              [l.detail].concat((CONSEILS[l.type] || []).slice(0, 1)));
        if (!envoiReussi(r)) {
          // Envoi raté : nouvel essai dans 30 minutes (jamais toutes les 10 min : on ne
          // martèle pas le service de messagerie). L'alerte reste marquée active.
          await rpc('alert_retry_later', { p_type: cle });
          bilan.push(`${cle}: ENVOI ÉCHOUÉ, nouvel essai dans 30 min`);
        } else bilan.push(`${l.type}: alerte envoyée`);
      } else {
        const etaitActif = await rpc('alert_resolve', { p_type: l.type });
        if (etaitActif) {
          await envoyer(`✅ VIP BETCOTE — Rétabli : ${titre}`, [`${titre} : le problème n'est plus détecté.`]);
          bilan.push(`${l.type}: rétabli`);
        }
      }
    } catch (e) {
      console.log(`[ALERTE] ${l.type} :`, e.message);
      bilan.push(`${l.type}: erreur ${e.message}`);
    }
  }
  console.log('[ALERTE] bilan :', bilan.join(' | ') || 'RAS');
  return { statusCode: 200, body: JSON.stringify({ ok: true, bilan }) };
}

module.exports.handler = handler;
module.exports.config = config;
