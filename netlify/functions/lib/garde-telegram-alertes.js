/* ============================================================
   GARDE : les ALERTES ne doivent jamais partir dans un groupe VIP.
   ------------------------------------------------------------
   Les alertes (paiement manuel, compte API suspendu, surveillance) lisent
   TELEGRAM_CHAT_ID. Si cette variable contenait par erreur l'identifiant
   d'un groupe de fiches (TELEGRAM_VIP_CHAT_P1..P4), des centaines d'abonnes
   verraient des alertes d'administration. Cette garde bloque l'envoi
   Telegram dans ce cas (les autres canaux, email etc., continuent).
   ============================================================ */

function normaliser(v) {
  return String(v == null ? '' : v).trim().toLowerCase();
}

function groupesVip() {
  const liste = [];
  for (let r = 1; r <= 4; r++) {
    const v = normaliser(process.env['TELEGRAM_VIP_CHAT_P' + r]);
    if (v) liste.push(v);
  }
  return liste;
}

/* Retourne { ok:true, chat } si TELEGRAM_CHAT_ID peut recevoir des alertes,
   sinon { ok:false, raison }. */
function chatAlerte() {
  const brut = String(process.env.TELEGRAM_CHAT_ID || '').trim();
  if (!brut) return { ok: false, raison: 'TELEGRAM_CHAT_ID absent' };
  const n = normaliser(brut);
  if (groupesVip().includes(n)) {
    return { ok: false, raison: 'TELEGRAM_CHAT_ID est identique a un groupe VIP : envoi Telegram des alertes BLOQUE' };
  }
  return { ok: true, chat: brut };
}

module.exports = { chatAlerte, groupesVip };
