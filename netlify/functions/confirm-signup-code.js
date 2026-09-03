/* ============================================================
   VIP BETCOTE — confirm-signup-code
   ------------------------------------------------------------
   Version SANS dépendance npm — parle directement à l'API REST
   de Supabase via fetch. Même correctif que request-signup-code.js.

   CORRIGÉ (04/09, faille de sécurité réelle signalée par un audit
   externe — checkvibe.dev — et confirmée en base : Supabase confirme
   l'email de tout compte en 30-80ms à la création, bien avant que la
   personne ait pu recevoir/taper ce code. Rien ne marquait
   auparavant, de façon DURABLE, qu'un compte avait réellement
   complété cette vérification — signup_codes.consumed=true ne
   prouvait que la validité du code, jamais un état persistant sur le
   compte lui-même) : après validation réussie, ce fichier marque
   désormais profiles.email_verified=true pour ce compte, via la clé
   service_role (jamais modifiable par le frontend/l'utilisateur —
   voir la policy RLS "profil modifiable par proprietaire", qui
   verrouille explicitement cette colonne). Les actions sensibles
   (créer un paiement, donc s'abonner) exigent désormais cette colonne
   à true côté base — pas seulement un écran qu'on peut contourner en
   appelant l'API Supabase directement avec la clé anon publique.

   Variables d'environnement : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
   ============================================================ */

const crypto = require('crypto');

const MAX_ATTEMPTS = 5;

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function sbHeaders() {
  return {
    'Content-Type': 'application/json',
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY
  };
}

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method_not_allowed' }) };
  }

  let email, code;
  try {
    const body = JSON.parse(event.body || '{}');
    email = (body.email || '').trim().toLowerCase();
    code = String(body.code || '').trim();
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'bad_request' }) };
  }

  if (!email || !/^\d{6}$/.test(code)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'code_invalide' }) };
  }

  // Defensif : un '/' en trop en fin de SUPABASE_URL (variable
  // d'environnement recopiee/rechangee) provoque sinon une double barre
  // oblique dans le chemin et une erreur PostgREST 'PGRST125 Invalid
  // path specified in request URL' — on la retire systematiquement.
  const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
  const base = supabaseUrl + '/rest/v1';

  try {
    const getResp = await fetch(
      base + '/signup_codes?select=id,code_hash,expires_at,attempts,consumed' +
      '&email=eq.' + encodeURIComponent(email) + '&consumed=eq.false' +
      '&order=created_at.desc&limit=1',
      { headers: sbHeaders() }
    );

    const rows = getResp.ok ? await getResp.json() : [];
    if (!rows.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'code_invalide' }) };
    }

    const row = rows[0];

    if (new Date(row.expires_at).getTime() < Date.now()) {
      return { statusCode: 400, body: JSON.stringify({ error: 'code_expire' }) };
    }

    if (row.attempts >= MAX_ATTEMPTS) {
      return { statusCode: 429, body: JSON.stringify({ error: 'trop_de_tentatives' }) };
    }

    if (hashCode(code) !== row.code_hash) {
      // On compte la tentative ratee, sans jamais reveler la difference
      // entre "code inconnu" et "code expire" au-dela de ces deux cas.
      await fetch(base + '/signup_codes?id=eq.' + row.id, {
        method: 'PATCH',
        headers: { ...sbHeaders(), Prefer: 'return=minimal' },
        body: JSON.stringify({ attempts: row.attempts + 1 })
      });
      return { statusCode: 400, body: JSON.stringify({ error: 'code_invalide' }) };
    }

    await fetch(base + '/signup_codes?id=eq.' + row.id, {
      method: 'PATCH',
      headers: { ...sbHeaders(), Prefer: 'return=minimal' },
      body: JSON.stringify({ consumed: true })
    });

    // AJOUTÉ (04/09) : marque le compte comme réellement vérifié, côté
    // serveur, via service_role — jamais possible depuis le frontend
    // (RLS bloque explicitement cette colonne pour l'utilisateur lui-
    // même). Non bloquant si le profil n'existe pas encore à cet
    // instant précis (ordre d'appel jamais garanti à 100% côté
    // frontend) : on retente une seconde fois après un court délai
    // plutôt que d'échouer silencieusement — sans jamais faire échouer
    // la réponse ok:true déjà légitimement gagnée par le bon code.
    async function marquerEmailVerifie() {
      const resp = await fetch(
        base + '/profiles?email=eq.' + encodeURIComponent(email),
        {
          method: 'PATCH',
          headers: { ...sbHeaders(), Prefer: 'return=representation' },
          body: JSON.stringify({ email_verified: true })
        }
      );
      if (!resp.ok) return false;
      const rows2 = await resp.json().catch(() => []);
      return Array.isArray(rows2) && rows2.length > 0;
    }
    try {
      const ok1 = await marquerEmailVerifie();
      if (!ok1) {
        // Le profil n'existe pas encore (trigger on_auth_user_created
        // pas tout à fait terminé) — une seule retentative après 1,5s
        // suffit largement, jamais bloquant pour la réponse au client.
        await new Promise(r => setTimeout(r, 1500));
        await marquerEmailVerifie();
      }
    } catch (e) {
      // Non bloquant : le code est réellement valide, la réponse ok:true
      // doit partir quoi qu'il arrive. Si ceci échoue durablement, le
      // compte reste email_verified=false et ne pourra pas s'abonner —
      // visible et corrigeable manuellement en admin plutôt qu'un faux
      // sentiment de sécurité si on ignorait l'erreur en silence total.
      console.error('[confirm-signup-code] marquerEmailVerifie a échoué:', e && e.message);
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: (e && e.message) || 'erreur_inconnue' }) };
  }
};
