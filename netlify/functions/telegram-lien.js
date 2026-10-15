/* ============================================================
   VIP BETCOTE — Lien d'invitation au groupe Telegram du plan
   ------------------------------------------------------------
   Appelee par le Dashboard (bouton « Rejoindre mon groupe Telegram »).

   Securite :
     - le jeton de session est verifie aupres de Supabase Auth ;
     - le droit est relu EN BASE (abonnement actif, non expire, compte non
       suspendu) : le navigateur n'est jamais cru sur parole ;
     - le groupe est celui du plan REEL de la personne ;
     - lien a USAGE UNIQUE (member_limit=1), expire en 24 h ;
     - un seul acces actif par compte (index unique en base).

   Corps : { "action": "etat" }  -> etat sans rien creer
           { "action": "lien" }  -> cree (ou renvoie) le lien d'invitation
   ============================================================ */

const T = require('./lib/telegram-vip');

const DUREE_LIEN_MS = 24 * 3600 * 1000;
const REUTILISER_SI_RESTE_MS = 15 * 60 * 1000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return T.reponse(405, { error: 'Méthode non autorisée' });
  if (!T.jeton()) return T.reponse(500, { error: 'telegram_non_configure' });

  const user = await T.utilisateurDepuisJeton(event.headers && (event.headers.authorization || event.headers.Authorization));
  if (!user) return T.reponse(401, { error: 'session_invalide' });

  let action = 'lien';
  try { action = (JSON.parse(event.body || '{}').action) || 'lien'; } catch (e) { /* corps vide */ }

  if (!(await T.limiter('telegram_lien:' + user.id, 12, 60))) return T.reponse(429, { error: 'trop_de_demandes' });

  try {
    const droits = await T.eligibles();
    const plan = droits[user.id] || null;
    const lignes = await T.sb('telegram_access?user_id=eq.' + encodeURIComponent(user.id) +
      '&status=in.(issued,joined)&select=*');
    const actuel = Array.isArray(lignes) && lignes.length ? lignes[0] : null;

    // Pas de plan actif : aucun lien, et un acces eventuel est ferme par la reconciliation.
    if (!plan) return T.reponse(200, { etat: 'inactif' });

    const chatId = T.groupePourPlan(plan);
    if (!chatId) return T.reponse(200, { etat: 'indisponible', plan });

    // Deja dans le BON groupe.
    if (actuel && actuel.status === 'joined' && Number(actuel.chat_id) === chatId) {
      return T.reponse(200, { etat: 'membre', plan });
    }
    if (action === 'etat') {
      return T.reponse(200, { etat: actuel && actuel.status === 'issued' && Number(actuel.chat_id) === chatId ? 'lien' : 'a_rejoindre', plan });
    }

    // Acces existant sur un AUTRE groupe (changement de plan) : on le ferme d'abord.
    if (actuel && Number(actuel.chat_id) !== chatId) {
      if (actuel.status === 'joined' && actuel.telegram_user_id) {
        const r = await T.retirerDuGroupe(actuel.chat_id, Number(actuel.telegram_user_id), 'plan_change');
        if (r.simule) return T.reponse(200, { etat: 'en_attente', plan });
      } else if (actuel.status === 'issued') {
        await T.revoquerLien(actuel.chat_id, actuel.invite_link);
      }
      await T.terminerAcces(actuel, 'revoked', 'plan_change');
    } else if (actuel && actuel.status === 'issued') {
      // Lien deja emis pour ce groupe et encore valable assez longtemps : on le renvoie.
      const reste = actuel.expires_at ? new Date(actuel.expires_at).getTime() - Date.now() : 0;
      if (actuel.invite_link && reste > REUTILISER_SI_RESTE_MS) {
        return T.reponse(200, { etat: 'lien', url: actuel.invite_link, plan, expire: actuel.expires_at });
      }
      await T.revoquerLien(actuel.chat_id, actuel.invite_link);
      await T.terminerAcces(actuel, 'expired', 'lien_renouvele');
    }

    const expire = new Date(Date.now() + DUREE_LIEN_MS);
    const lien = await T.tg('createChatInviteLink', {
      chat_id: chatId,
      name: ('vb-' + user.id).slice(0, 32),
      expire_date: Math.floor(expire.getTime() / 1000),
      member_limit: 1,
      creates_join_request: false
    });
    await T.sb('telegram_access', {
      method: 'POST', prefer: 'return=minimal',
      body: [{
        user_id: user.id, plan_id: plan, chat_id: chatId,
        invite_link: lien.invite_link, status: 'issued', expires_at: expire.toISOString()
      }]
    });
    return T.reponse(200, { etat: 'lien', url: lien.invite_link, plan, expire: expire.toISOString() });
  } catch (e) {
    await T.journaliser('telegram_lien', 'user=' + user.id + ' — ' + (e && e.message ? e.message : e));
    return T.reponse(500, { error: 'erreur_serveur' });
  }
};
