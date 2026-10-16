/* ============================================================
   VIP BETCOTE — Parrainage : recompenses (16/10, ADDITIF)
   ------------------------------------------------------------
   Toutes les 15 minutes : appelle traiter_parrainages() en base.
   Toute la regle vit en base (une seule source de verite) :
     - 1er paiement confirme du filleul -> jours au parrain selon le plan
       achete par le filleul (p1 2 j, p2 5 j, p3 7 j, p4 15 j) ;
     - les jours prolongent l'abonnement ACTIF du parrain (plan inchange),
       sinon ils attendent son prochain plan ;
     - idempotent : un second passage ne change rien.
   ============================================================ */
const config = { schedule: '*/15 * * * *' };

async function handler() {
  const url = String(process.env.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !cle) return { statusCode: 200, body: 'non configure' };
  const h = { apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' };
  try {
    const r = await fetch(`${url}/rest/v1/rpc/traiter_parrainages`, { method: 'POST', headers: h, body: '{}' });
    const corps = await r.text();
    if (!r.ok) throw new Error(`HTTP ${r.status} ${corps.slice(0, 300)}`);
    console.log('[PARRAINAGE]', corps);
    return { statusCode: 200, body: corps };
  } catch (e) {
    console.log('[PARRAINAGE] erreur:', e.message);
    try {
      await fetch(`${url}/rest/v1/error_log`, { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, h),
        body: JSON.stringify({ context: 'parrainage_recompenses', message: String(e.message).slice(0, 500) }) });
    } catch (_) { /* jamais bloquant */ }
    return { statusCode: 200, body: 'erreur journalisee' };
  }
}

module.exports.handler = handler;
module.exports.config = config;
