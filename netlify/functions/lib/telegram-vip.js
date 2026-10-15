/* ============================================================
   VIP BETCOTE — Groupes Telegram VIP (bibliotheque partagee)
   ------------------------------------------------------------
   REGLE CENTRALE : la base de donnees decide, le robot execute.
   Qui a droit a quel groupe = abonnement actif (telegram_eligibles()).
   Le robot ne decide jamais de lui-meme d'ouvrir ou de fermer un acces.

   Variables Netlify :
     TELEGRAM_VIP_BOT_TOKEN   jeton du robot (a defaut TELEGRAM_BOT_TOKEN)
     TELEGRAM_VIP_CHAT_P1..P4 identifiant (-100...) du groupe de chaque plan
     TELEGRAM_WEBHOOK_SECRET  chaine aleatoire : authentifie les appels de Telegram
     TELEGRAM_VIP_ENFORCE     "1" pour AUTORISER les retraits reels. Sans elle,
                              le systeme observe et journalise mais ne retire
                              personne (mode essai, aucun risque).
     SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   ============================================================ */

const PLANS = ['p1', 'p2', 'p3', 'p4'];

const jeton = () => (process.env.TELEGRAM_VIP_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN || '').trim();
const retraitsActifs = () => String(process.env.TELEGRAM_VIP_ENFORCE || '').trim() === '1';

function baseSupabase() {
  let u = (process.env.SUPABASE_URL || '').trim();
  u = u.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  return u;
}
const cleService = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';

/* plan -> identifiant du groupe (nombre negatif) ou null si non configure */
function groupePourPlan(planId) {
  const v = process.env['TELEGRAM_VIP_CHAT_' + String(planId || '').toUpperCase()];
  if (!v) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) && n < 0 ? n : null;
}
/* groupe -> plan, ou null si ce n'est pas un de nos groupes */
function planPourGroupe(chatId) {
  for (const p of PLANS) if (groupePourPlan(p) === Number(chatId)) return p;
  return null;
}

/* ---- Supabase REST (cle service_role) ---- */
async function sb(chemin, opt) {
  opt = opt || {};
  const res = await fetch(baseSupabase() + '/rest/v1/' + chemin, {
    method: opt.method || 'GET',
    headers: Object.assign({
      apikey: cleService(),
      Authorization: 'Bearer ' + cleService(),
      'Content-Type': 'application/json',
      Prefer: opt.prefer || 'return=representation'
    }, opt.headers || {}),
    body: opt.body !== undefined ? JSON.stringify(opt.body) : undefined
  });
  const texte = await res.text();
  let donnees = null;
  if (texte) { try { donnees = JSON.parse(texte); } catch (e) { donnees = texte; } }
  if (!res.ok) {
    const err = new Error('Supabase ' + res.status + ' ' + chemin + ' : ' + texte);
    err.statut = res.status;
    throw err;
  }
  return donnees;
}
const rpc = (nom, args) => sb('rpc/' + nom, { method: 'POST', body: args || {} });

async function journaliser(contexte, message) {
  try {
    await sb('error_log', { method: 'POST', prefer: 'return=minimal',
      body: [{ context: contexte, message: String(message).slice(0, 2000) }] });
  } catch (e) { /* le journal ne doit jamais faire echouer le traitement */ }
}

/* ---- API Telegram ---- */
async function tg(methode, params) {
  const t = jeton();
  if (!t) throw new Error('Jeton du robot Telegram absent');
  const res = await fetch('https://api.telegram.org/bot' + t + '/' + methode, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params || {})
  });
  let j = null;
  try { j = await res.json(); } catch (e) { /* reponse illisible */ }
  if (!j || !j.ok) {
    const err = new Error('Telegram ' + methode + ' : ' + ((j && j.description) || res.status));
    err.code = j && j.error_code;
    throw err;
  }
  return j.result;
}

/* Retire quelqu'un du groupe SANS le bannir a vie : ban puis debannissement
   immediat. Il pourra revenir avec un nouveau lien s'il a de nouveau droit. */
async function retirerDuGroupe(chatId, tgUserId, raison) {
  if (!retraitsActifs()) {
    await journaliser('telegram_retrait_simule',
      '[mode essai] retrait de ' + tgUserId + ' du groupe ' + chatId + ' (' + raison + ')');
    return { fait: false, simule: true };
  }
  await tg('banChatMember', { chat_id: chatId, user_id: tgUserId, revoke_messages: false });
  try { await tg('unbanChatMember', { chat_id: chatId, user_id: tgUserId, only_if_banned: true }); }
  catch (e) { /* le retrait est deja effectif */ }
  return { fait: true };
}

async function revoquerLien(chatId, lien) {
  if (!lien) return;
  try { await tg('revokeChatInviteLink', { chat_id: chatId, invite_link: lien }); }
  catch (e) { /* deja revoque ou expire */ }
}

async function estAdminDuGroupe(chatId, tgUserId) {
  try {
    const m = await tg('getChatMember', { chat_id: chatId, user_id: tgUserId });
    return m.status === 'creator' || m.status === 'administrator';
  } catch (e) { return true; /* en cas de doute, ne JAMAIS retirer */ }
}

/* ---- Eligibilite (verite = base de donnees) ---- */
async function eligibles() {
  const lignes = await rpc('telegram_eligibles');
  const m = {};
  (Array.isArray(lignes) ? lignes : []).forEach(l => { m[l.user_id] = l.plan_id; });
  return m;
}

async function terminerAcces(ligne, statut, raison) {
  await sb('telegram_access?id=eq.' + encodeURIComponent(ligne.id), {
    method: 'PATCH', prefer: 'return=minimal',
    body: { status: statut, ended_at: new Date().toISOString(), ended_reason: raison }
  });
}

/* ---- Reconciliation : ramene Telegram a l'etat voulu par la base ----
   Idempotente : peut tourner autant de fois que voulu, ne cree jamais de
   doublon, ne touche que les acces enregistres par ce systeme. */
async function reconcilier() {
  const rapport = { examines: 0, retires: 0, liens_revoques: 0, expires: 0, simules: 0, erreurs: 0 };
  const droits = await eligibles();
  const actifs = await sb('telegram_access?status=in.(issued,joined)&select=*');
  const maintenant = Date.now();
  for (const l of (Array.isArray(actifs) ? actifs : [])) {
    rapport.examines++;
    try {
      const plan = droits[l.user_id] || null;
      const groupeVoulu = plan ? groupePourPlan(plan) : null;
      const raison = !plan ? 'plan_inactif' : 'plan_change';

      if (groupeVoulu !== Number(l.chat_id)) {
        // Plus de droit sur CE groupe (plan expire, retire, suspendu ou change).
        if (l.status === 'joined' && l.telegram_user_id) {
          const r = await retirerDuGroupe(l.chat_id, Number(l.telegram_user_id), raison);
          if (r.simule) { rapport.simules++; continue; }   // mode essai : on ne ferme rien en base
          rapport.retires++;
        } else if (l.status === 'issued') {
          if (!retraitsActifs()) { rapport.simules++; continue; }
          await revoquerLien(l.chat_id, l.invite_link);
          rapport.liens_revoques++;
        }
        await terminerAcces(l, 'revoked', raison);
        continue;
      }
      // Lien emis mais jamais utilise et expire : on le ferme proprement.
      if (l.status === 'issued' && l.expires_at && new Date(l.expires_at).getTime() < maintenant) {
        await revoquerLien(l.chat_id, l.invite_link);
        await terminerAcces(l, 'expired', 'lien_expire');
        rapport.expires++;
      }
    } catch (e) {
      rapport.erreurs++;
      await journaliser('telegram_reconciliation', 'acces=' + l.id + ' — ' + (e && e.message ? e.message : e));
    }
  }
  return rapport;
}

/* ---- Verification du jeton d'un utilisateur connecte ---- */
async function utilisateurDepuisJeton(entete) {
  const auth = entete || '';
  if (!auth.startsWith('Bearer ')) return null;
  const res = await fetch(baseSupabase() + '/auth/v1/user', {
    headers: { Authorization: auth, apikey: cleService() }
  });
  if (!res.ok) return null;
  const u = await res.json().catch(() => null);
  return u && u.id ? u : null;
}
async function estAdminSite(uid) {
  const p = await sb('profiles?select=role&id=eq.' + encodeURIComponent(uid) + '&limit=1');
  return !!(Array.isArray(p) && p[0] && p[0].role === 'admin');
}

const reponse = (statusCode, corps) => ({
  statusCode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps)
});

module.exports = {
  PLANS, jeton, retraitsActifs, groupePourPlan, planPourGroupe,
  sb, rpc, journaliser, tg, retirerDuGroupe, revoquerLien, estAdminDuGroupe,
  eligibles, terminerAcces, reconcilier, utilisateurDepuisJeton, estAdminSite, reponse
};
