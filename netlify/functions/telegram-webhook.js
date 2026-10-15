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

async function traiterEntree(chatId, membre, lienUtilise) {
  const tgId = Number(membre.id);
  if (membre.is_bot) return 'bot ignore';
  if (await T.estAdminDuGroupe(chatId, tgId)) return 'admin ignore';

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
        // Ce compte Telegram est deja relie a un AUTRE compte du site : refuse.
        await T.journaliser('telegram_double_compte', 'tg=' + tgId + ' deja relie — ' + (e.message || e));
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
        if (!dedans(avant) && dedans(apres)) resultat = await traiterEntree(chatId, cm.new_chat_member.user, cm.invite_link);
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
