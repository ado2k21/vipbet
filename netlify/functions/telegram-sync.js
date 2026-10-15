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
  let admin = false;
  try { planifie = !!JSON.parse((event && event.body) || '{}').next_run; } catch (e) { /* appel HTTP */ }
  if (!planifie) {
    const h = (event && event.headers) || {};
    const entete = h.authorization || h.Authorization;
    const u = await T.utilisateurDepuisJeton(entete);
    if (!u || !(await T.estAdminSite(u.id, entete))) return T.reponse(401, { error: 'non autorise' });
    admin = true;
  }
  // Une execution a la fois, toutes les 90 s au plus : un appel externe forge
  // (corps 'next_run' falsifie) ne peut pas marteler l'API Telegram.
  if (!(await T.limiter('telegram_sync', 1, 90))) return T.reponse(200, { ok: true, ignore: 'trop rapproche' });
  if (!T.jeton()) return T.reponse(200, { ok: false, raison: 'robot non configure' });
  try {
    const rapport = await T.reconcilier();
    // Seul un administrateur voit le detail ; l'execution planifiee n'a besoin de rien lire.
    return T.reponse(200, admin ? { ok: true, retraits_actifs: T.retraitsActifs(), rapport } : { ok: true });
  } catch (e) {
    await T.journaliser('telegram_sync', e && e.message ? e.message : String(e));
    return T.reponse(500, { ok: false });
  }
};
