/* ============================================================
   VIP BETCOTE — Alerte Telegram admin : envoi d'e-mail REFUSE (25/11, James)
   ------------------------------------------------------------
   Le 25/11, le plan gratuit de Resend (100 e-mails/jour) a ete depasse
   (114/100). Quand Resend refuse un e-mail (quota, cle, adresse...), les
   clients ne recoivent plus leur code d'inscription / « Modpas bliye » :
   l'admin doit le savoir AVANT les clients.

   - Chaque echec est note dans error_log (context 'email_echec').
   - Une alerte Telegram (chat d'alertes admin, garde anti-groupe VIP) au
     plus toutes les 30 minutes, avec le nombre d'echecs depuis la derniere
     alerte (jamais des centaines de messages quand le quota est atteint).
   - Ne fait JAMAIS echouer l'envoi appelant : toute erreur est seulement
     tracee, delai maximal 8 s.
   ============================================================ */
'use strict';

const { chatAlerte } = require('./garde-telegram-alertes');

const INTERVALLE_MIN = 30;

function configSb() {
  const base = String(process.env.SUPABASE_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1$/i, '');
  const cle = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  return (base && cle) ? { base, h: { apikey: cle, Authorization: 'Bearer ' + cle, 'Content-Type': 'application/json' } } : null;
}

async function fetchDelai(url, opts, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms || 8000);
  try { return await fetch(url, Object.assign({}, opts, { signal: ctrl.signal })); } finally { clearTimeout(t); }
}

/* Raison lisible a partir de la reponse de Resend (statut + corps). */
function raisonLisible(statut, detail) {
  const d = String(detail || '').toLowerCase();
  if (/daily_quota|daily limit|daily_limit/.test(d)) return 'Limite JOURNALIERE de Resend atteinte (plan gratuit : 100/jour)';
  if (/monthly_quota|monthly limit|monthly_limit/.test(d)) return 'Limite MENSUELLE de Resend atteinte (plan gratuit : 3 000/mois)';
  if (/quota/.test(d)) return 'Quota Resend atteint';
  if (statut === 429 || /rate_limit|too many/.test(d)) return 'Trop d\'envois a la fois (limite de debit Resend)';
  if (statut === 401 || statut === 403 || /api key|api_key|unauthorized|forbidden/.test(d)) return 'Cle Resend refusee (RESEND_API_KEY)';
  if (/domain/.test(d)) return 'Probleme de domaine expediteur (vipbetcote.com) chez Resend';
  if (statut === 422 || /validation|invalid/.test(d)) return 'Adresse ou contenu refuse par Resend';
  if (!statut) return 'Resend injoignable (reseau)';
  return 'Erreur Resend (HTTP ' + statut + ')';
}

/* 25/11 (James : « l'alerte c'est quand Resend est epuise et n'envoie pas d'e-mail ») :
   alerte Telegram SEULEMENT si Resend n'envoie plus RIEN (quota du jour/du mois epuise, trop
   d'envois, cle refusee, domaine expediteur bloque, Resend injoignable ou en panne).
   Le refus d'UNE adresse precise (mal tapee, refusee par Resend : HTTP 422/400) n'est qu'une
   trace dans error_log, jamais une alerte. */
function resendBloque(statut, detail) {
  const d = String(detail || '').toLowerCase();
  if (/quota|daily|monthly|rate_limit|too many/.test(d)) return true;   // epuise
  if (statut === 429) return true;
  if (statut === 401 || statut === 403) return true;                   // cle / compte bloque
  if (/api key|api_key|unauthorized|forbidden|domain/.test(d)) return true;
  if (!statut) return true;                                            // injoignable
  if (statut >= 500) return true;                                      // panne Resend
  return false;                                                        // 400/422 : une adresse
}

const SOURCES = {
  code_inscription: 'Code d\'inscription',
  modpas_bliye: 'Code « Modpas bliye »',
  rappel_expiration: 'Rappel d\'expiration',
  parrainage: 'E-mail de parrainage'
};

async function alerterEchecEmail({ source, email, statut, detail }) {
  try {
    const raison = raisonLisible(statut, detail);
    const bloque = resendBloque(statut, detail);
    const sb = configSb();
    let depuisDerniere = 1;
    if (sb) {
      // 1. trace de CET echec (toujours)
      await fetchDelai(sb.base + '/rest/v1/error_log', {
        method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, sb.h),
        body: JSON.stringify({ context: bloque ? 'email_echec' : 'email_refuse_adresse', email: email || null,
          message: (SOURCES[source] || source || '?') + ' — ' + raison + ' — ' + String(detail || '').slice(0, 200) })
      });
    }
    if (!bloque) return { ok: true, alerte: false };   // une seule adresse refusee : pas d'alerte
    if (sb) {
      // 2. une alerte deja envoyee dans les 30 dernieres minutes ? -> rien de plus
      const limite = new Date(Date.now() - INTERVALLE_MIN * 60000).toISOString();
      const r = await fetchDelai(sb.base + '/rest/v1/error_log?context=eq.alerte_email_echec&created_at=gte.' + encodeURIComponent(limite) + '&select=id&limit=1', { headers: sb.h });
      if (r.ok) { const l = await r.json(); if (l && l.length) return { ok: true, alerte: false }; }
      // 3. nombre d'echecs depuis la derniere alerte (au plus 24 h)
      const r2 = await fetchDelai(sb.base + '/rest/v1/error_log?context=eq.alerte_email_echec&select=created_at&order=created_at.desc&limit=1', { headers: sb.h });
      let depuis = new Date(Date.now() - 24 * 3600000).toISOString();
      if (r2.ok) { const l2 = await r2.json(); if (l2 && l2[0] && l2[0].created_at > depuis) depuis = l2[0].created_at; }
      const r3 = await fetchDelai(sb.base + '/rest/v1/error_log?context=eq.email_echec&created_at=gt.' + encodeURIComponent(depuis) + '&select=id', { headers: Object.assign({ Prefer: 'count=exact', Range: '0-0' }, sb.h) });
      const cr = r3.headers && r3.headers.get('content-range');
      if (cr && /\/(\d+)$/.test(cr)) depuisDerniere = Math.max(1, Number(cr.split('/')[1]));
      // 4. on note l'alerte AVANT de l'envoyer (deux echecs simultanes = une seule alerte au plus pres)
      await fetchDelai(sb.base + '/rest/v1/error_log', {
        method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, sb.h),
        body: JSON.stringify({ context: 'alerte_email_echec', message: raison })
      });
    }
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const garde = chatAlerte();
    if (!token || !garde.ok) return { ok: false, raison: garde.raison || 'TELEGRAM_BOT_TOKEN absent' };
    const texte = [
      '⚠️ Resend n\'envoie plus les e-mails',
      '',
      'Raison : ' + raison,
      'Type : ' + (SOURCES[source] || source || '?'),
      'Échecs depuis la dernière alerte : ' + depuisDerniere,
      '',
      'Conséquence : les clients ne reçoivent pas leur code (inscription / Modpas bliye).',
      'À vérifier : resend.com → Settings → Usage (ou Upgrade).',
      '(Prochaine alerte au plus tôt dans ' + INTERVALLE_MIN + ' min.)'
    ].join('\n');
    const rt = await fetchDelai('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: garde.chat, text: texte })
    });
    return { ok: rt.ok, alerte: true };
  } catch (e) {
    console.error('[alerte-email-echec] impossible :', e && e.message);
    return { ok: false, raison: e && e.message };
  }
}

module.exports = { alerterEchecEmail, raisonLisible, resendBloque };
