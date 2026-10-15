/* ============================================================
   VIP BETCOTE — Reconciliation planifiee des groupes Telegram
   ------------------------------------------------------------
   Toutes les 2 minutes (voir netlify.toml) : ramene Telegram a l'etat
   voulu par la base — plan expire / retire / change / compte suspendu
   => la personne est retiree de son groupe, son lien est annule.
   Idempotente. Sans TELEGRAM_VIP_ENFORCE=1, elle ne retire personne.
   Declenchable aussi par un administrateur (jeton de session).
   ============================================================ */
const T = require('./lib/telegram-vip');

exports.handler = async (event) => {
  let planifie = false;
  try { planifie = !!JSON.parse((event && event.body) || '{}').next_run; } catch (e) { /* appel HTTP */ }
  if (!planifie) {
    const h = (event && event.headers) || {};
    const u = await T.utilisateurDepuisJeton(h.authorization || h.Authorization);
    if (!u || !(await T.estAdminSite(u.id))) return T.reponse(401, { error: 'non autorise' });
  }
  if (!T.jeton()) return T.reponse(200, { ok: false, raison: 'robot non configure' });
  try {
    const rapport = await T.reconcilier();
    return T.reponse(200, { ok: true, retraits_actifs: T.retraitsActifs(), rapport });
  } catch (e) {
    await T.journaliser('telegram_sync', e && e.message ? e.message : String(e));
    return T.reponse(500, { ok: false });
  }
};
