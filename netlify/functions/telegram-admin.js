/* ============================================================
   VIP BETCOTE — Outils admin Telegram (reserve aux administrateurs)
   Corps : { "action": "etat" | "webhook" }
     etat    : groupes configures, droits du robot, effectifs, webhook
     webhook : (re)branche le webhook Telegram vers ce site
   ============================================================ */
const T = require('./lib/telegram-vip');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return T.reponse(405, { error: 'Méthode non autorisée' });
  const h = event.headers || {};
  const entete = h.authorization || h.Authorization;
  const u = await T.utilisateurDepuisJeton(entete);
  if (!u || !(await T.estAdminSite(u.id, entete))) return T.reponse(401, { error: 'non autorise' });
  let action = 'etat';
  try { action = JSON.parse(event.body || '{}').action || 'etat'; } catch (e) { /* defaut */ }
  if (!T.jeton()) return T.reponse(200, { configure: false, raison: 'jeton du robot absent' });

  try {
    if (action === 'webhook') {
      const secret = (process.env.TELEGRAM_WEBHOOK_SECRET || '').trim();
      if (!secret) return T.reponse(200, { ok: false, raison: 'TELEGRAM_WEBHOOK_SECRET absent dans Netlify' });
      const base = (process.env.URL || 'https://vipbetcote.com').replace(/\/$/, '');
      await T.tg('setWebhook', {
        url: base + '/.netlify/functions/telegram-webhook',
        secret_token: secret,
        allowed_updates: ['chat_member', 'message'],
        drop_pending_updates: false
      });
      return T.reponse(200, { ok: true, url: base + '/.netlify/functions/telegram-webhook' });
    }

    const moi = await T.tg('getMe');
    const groupes = [];
    for (const plan of T.PLANS) {
      const chatId = T.groupePourPlan(plan);
      const g = { plan, configure: !!chatId };
      if (chatId) {
        try {
          const chat = await T.tg('getChat', { chat_id: chatId });
          g.nom = chat.title;
          g.prive = !chat.username;
          const m = await T.tg('getChatMember', { chat_id: chatId, user_id: moi.id });
          g.robot_admin = m.status === 'administrator';
          g.droit_inviter = !!m.can_invite_users;
          g.droit_bannir = !!m.can_restrict_members;
          g.effectif = await T.tg('getChatMemberCount', { chat_id: chatId });
        } catch (e) { g.erreur = String(e.message || e).slice(0, 160); }
        const j = await T.sb('telegram_access?chat_id=eq.' + chatId + '&status=eq.joined&select=id');
        g.relies = Array.isArray(j) ? j.length : 0;
      }
      groupes.push(g);
    }
    let webhook = null;
    try {
      const w = await T.tg('getWebhookInfo');
      webhook = { url: w.url || '', erreur: w.last_error_message || '', en_attente: w.pending_update_count || 0 };
    } catch (e) { /* non bloquant */ }
    return T.reponse(200, {
      configure: true, robot: moi.username, retraits_actifs: T.retraitsActifs(),
      secret_webhook: !!(process.env.TELEGRAM_WEBHOOK_SECRET || '').trim(), webhook, groupes
    });
  } catch (e) {
    await T.journaliser('telegram_admin', e && e.message ? e.message : String(e));
    return T.reponse(500, { error: 'erreur_serveur', detail: String(e.message || e).slice(0, 200) });
  }
};
