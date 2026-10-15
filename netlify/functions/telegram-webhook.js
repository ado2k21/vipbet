/* ============================================================
   VIP BETCOTE — Webhook Telegram (qui entre, qui sort, qui ecrit)
   ------------------------------------------------------------
   Appelee par Telegram (et par personne d'autre) : chaque appel doit
   porter l'en-tete secret X-Telegram-Bot-Api-Secret-Token.

   Evenements traites (groupes VIP uniquement) :
     chat_member : quelqu'un entre ou sort d'un groupe
        - entree via NOTRE lien a usage unique + droit actif => relie au compte
        - toute autre entree (lien inconnu, ajout a la main...) => retire
     message     : quelqu'un ecrit dans un groupe
        - s'il n'est relie a aucun compte et n'est pas administrateur => retire
          (cas des membres d'avant la mise en service)

   Les administrateurs et le proprietaire du groupe ne sont JAMAIS retires.
   Sans TELEGRAM_VIP_ENFORCE=1, rien n'est retire (mode essai).
   ============================================================ */

const crypto = require('crypto');
const T = require('./lib/telegram-vip');

function secretValide(entete) {
  const attendu = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();
  if (!attendu || !entete) return false;
  const a = Buffer.from(attendu), b = Buffer.from(String(entete).trim());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const nomAffiche = u => [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || '';

/* Invite MANUEL : ajoute directement par un administrateur du groupe, ou entre avec un lien cree
   a la main par un administrateur (pas par le robot). Memorise, jamais retire par le robot. */
async function memoriserManuel(chatId, membre, origine) {
  try {
    await T.sb('telegram_manuels?on_conflict=chat_id,telegram_user_id', {
      method: 'POST', prefer: 'resolution=ignore-duplicates,return=minimal',
      body: [{ chat_id: chatId, telegram_user_id: Number(membre.id), telegram_name: nomAffiche(membre).slice(0, 120), origine }]
    });
  } catch (e) { throw e; }
}
async function estManuel(chatId, tgId) {
  const l = await T.sb('telegram_manuels?chat_id=eq.' + chatId + '&telegram_user_id=eq.' + tgId + '&select=chat_id&limit=1');
  return Array.isArray(l) && l.length > 0;
}

async function traiterEntree(chatId, membre, lienUtilise, acteur) {
  const tgId = Number(membre.id);
  if (membre.is_bot) return 'bot ignore';
  if (await T.estAdminDuGroupe(chatId, tgId)) return 'admin ignore';

  if (await estManuel(chatId, tgId)) return 'invite manuel (deja autorise)';
  // Ajoute DIRECTEMENT par un administrateur du groupe (l'acteur n'est pas la personne elle-meme).
  if (acteur && !acteur.is_bot && Number(acteur.id) !== tgId && await T.estAdminDuGroupe(chatId, Number(acteur.id))) {
    await memoriserManuel(chatId, membre, 'admin_groupe');
    return 'invite manuel (ajoute par un administrateur)';
  }
  // Entre avec un lien cree a la main par un administrateur (et non par le robot).
  // RESTRICTION : seul un lien a USAGE UNIQUE (limite de 1 membre) est accepte. Un lien
  // illimite ou a plusieurs usages pourrait etre partage : celui qui entre avec est retire.
  const createur = lienUtilise && lienUtilise.creator;
  if (createur && !createur.is_bot && Number(createur.id) !== tgId && await T.estAdminDuGroupe(chatId, Number(createur.id))) {
    if (Number(lienUtilise.member_limit) === 1) {
      await memoriserManuel(chatId, membre, 'lien_admin');
      return 'invite manuel (lien d\'administrateur a usage unique)';
    }
    await T.journaliser('telegram_lien_manuel_refuse',
      'Entree via un lien d\'administrateur NON a usage unique (member_limit=' + (lienUtilise.member_limit == null ? 'aucune' : lienUtilise.member_limit) + ') : refusee. tg=' + tgId + ' groupe=' + chatId);
  }

  const lienTexte = lienUtilise && lienUtilise.invite_link ? lienUtilise.invite_link : '';
  let ligne = null;
  if (lienTexte) {
    const l = await T.sb('telegram_access?invite_link=eq.' + encodeURIComponent(lienTexte) +
      '&status=eq.issued&select=*&limit=1');
    ligne = Array.isArray(l) && l.length ? l[0] : null;
  }
  if (ligne && Number(ligne.chat_id) === Number(chatId)) {
    // Le droit doit etre toujours valable AU MOMENT de l'entree.
    const droits = await T.eligibles();
    const plan = droits[ligne.user_id] || null;
    if (plan && T.groupePourPlan(plan) === Number(chatId)) {
      try {
        await T.sb('telegram_access?id=eq.' + encodeURIComponent(ligne.id) + '&status=eq.issued', {
          method: 'PATCH', prefer: 'return=minimal',
          body: { status: 'joined', telegram_user_id: tgId, telegram_name: nomAffiche(membre).slice(0, 120), joined_at: new Date().toISOString() }
        });
        await T.revoquerLien(chatId, ligne.invite_link);
        return 'relie';
      } catch (e) {
        // SEUL un conflit d'unicite (409 : ce compte Telegram est deja relie a un AUTRE compte du
        // site) justifie un retrait. Toute autre erreur (reseau, 5xx) est relancee : Telegram
        // rejouera l'evenement, un abonne legitime n'est jamais retire a cause d'un incident.
        if (e && e.statut === 409) {
          await T.journaliser('telegram_double_compte', 'tg=' + tgId + ' deja relie — ' + (e.message || e));
        } else {
          throw e;
        }
      }
    }
  }
  const r = await T.retirerDuGroupe(chatId, tgId, 'entree_non_autorisee');
  return r.simule ? 'retrait simule' : 'retire';
}

async function traiterSortie(chatId, membre) {
  const tgId = Number(membre.id);
  const l = await T.sb('telegram_access?telegram_user_id=eq.' + tgId + '&chat_id=eq.' + chatId + '&status=eq.joined&select=*');
  if (Array.isArray(l) && l.length) { await T.terminerAcces(l[0], 'left', 'sorti_du_groupe'); return 'sortie enregistree'; }
  return 'rien';
}

async function traiterMessage(chatId, expediteur) {
  if (!expediteur || expediteur.is_bot) return 'ignore';
  const tgId = Number(expediteur.id);
  const l = await T.sb('telegram_access?telegram_user_id=eq.' + tgId + '&chat_id=eq.' + chatId + '&status=eq.joined&select=id&limit=1');
  if (Array.isArray(l) && l.length) return 'membre relie';
  if (await estManuel(chatId, tgId)) return 'invite manuel';
  if (await T.estAdminDuGroupe(chatId, tgId)) return 'admin ignore';
  const r = await T.retirerDuGroupe(chatId, tgId, 'membre_non_relie');
  return r.simule ? 'retrait simule' : 'retire';
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const h = event.headers || {};
  if (!secretValide(h['x-telegram-bot-api-secret-token'] || h['X-Telegram-Bot-Api-Secret-Token'])) {
    return { statusCode: 401, body: 'secret invalide' };
  }
  let maj;
  try { maj = JSON.parse(event.body || '{}'); } catch (e) { return { statusCode: 400, body: 'illisible' }; }

  try {
    let resultat = 'ignore';
    if (maj.chat_member) {
      const cm = maj.chat_member;
      const chatId = cm.chat && cm.chat.id;
      if (T.planPourGroupe(chatId)) {
        const avant = cm.old_chat_member && cm.old_chat_member.status;
        const apres = cm.new_chat_member && cm.new_chat_member.status;
        const dedans = s => s === 'member' || s === 'restricted';
        if (!dedans(avant) && dedans(apres)) resultat = await traiterEntree(chatId, cm.new_chat_member.user, cm.invite_link, cm.from);
        else if (dedans(avant) && (apres === 'left' || apres === 'kicked')) resultat = await traiterSortie(chatId, cm.new_chat_member.user);
      }
    } else if (maj.message && maj.message.chat && T.planPourGroupe(maj.message.chat.id)) {
      // Les messages d'administrateurs anonymes (sender_chat) sont ignores.
      if (!maj.message.sender_chat) resultat = await traiterMessage(maj.message.chat.id, maj.message.from);
    }
    return { statusCode: 200, body: resultat };
  } catch (e) {
    await T.journaliser('telegram_webhook', e && e.message ? e.message : String(e));
    // Entree/sortie : 500 pour que Telegram REJOUE l'evenement (ne jamais perdre une entree
    // legitime). Simple message : 200, un message perdu est sans consequence.
    return { statusCode: maj.chat_member ? 500 : 200, body: 'erreur journalisee' };
  }
};
