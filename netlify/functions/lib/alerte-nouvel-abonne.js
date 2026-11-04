/* ============================================================
   VIP BETCOTE — Alerte Telegram « nouvel abonne » (admin)
   ------------------------------------------------------------
   04/11 : envoyee au chat d'alertes de l'admin (TELEGRAM_CHAT_ID, garde
   anti-groupe VIP de garde-telegram-alertes) des qu'un paiement
   AUTOMATIQUE est confirme (MonCash/NatCash via le prestataire, Stripe).
   Texte : plan (P1..P4), moyen, compte. Jamais de prix.
   Ne fait JAMAIS echouer le paiement : toute erreur est seulement tracee.
   ============================================================ */
'use strict';

const { chatAlerte } = require('./garde-telegram-alertes');

const NOMS_MOYENS = { moncash: 'MonCash', natcash: 'NatCash', stripe: 'Carte (Stripe)' };

async function lireCompte(userId) {
  const base = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  const cle = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!base || !cle || !userId) return null;
  try {
    const r = await fetch(base + '/rest/v1/profiles?id=eq.' + encodeURIComponent(userId) + '&select=username,email&limit=1', {
      headers: { apikey: cle, Authorization: 'Bearer ' + cle }
    });
    if (!r.ok) return null;
    const lignes = await r.json();
    return (lignes && lignes[0]) || null;
  } catch (e) {
    return null;
  }
}

async function alerterNouvelAbonne({ userId, planId, methode }) {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const garde = chatAlerte();
    if (!token || !garde.ok) return { ok: false, raison: garde.raison || 'TELEGRAM_BOT_TOKEN absent' };
    const compte = await lireCompte(userId);
    const nom = compte ? (compte.username || compte.email || '?') : '?';
    const texte = [
      '✅ Nouvel abonné — paiement automatique confirmé',
      '',
      'Plan : ' + String(planId || '?').toUpperCase(),
      'Moyen : ' + (NOMS_MOYENS[String(methode || '').toLowerCase()] || methode || '?'),
      'Compte : ' + nom + (compte && compte.email && compte.username ? ' (' + compte.email + ')' : '')
    ].join('\n');
    const ctrl = new AbortController();
    const minuteur = setTimeout(() => ctrl.abort(), 10000);
    try {
      const r = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: garde.chat, text: texte }),
        signal: ctrl.signal
      });
      return { ok: r.ok };
    } finally {
      clearTimeout(minuteur);
    }
  } catch (e) {
    console.error('[alerte-nouvel-abonne] envoi impossible :', e && e.message);
    return { ok: false, raison: e && e.message };
  }
}

module.exports = { alerterNouvelAbonne };
