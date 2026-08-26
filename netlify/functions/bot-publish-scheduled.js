/**
 * ============================================================================
 * VIP BETCOTE — PUBLICATION DES FICHES PROGRAMMÉES (Netlify Scheduled Function)
 * Fichier : netlify/functions/bot-publish-scheduled.js
 * ----------------------------------------------------------------------------
 * Concerne UNIQUEMENT les fiches générées manuellement en admin avec
 * publication "programmée" (voir bot-generate-tickets-manual.js) : elles
 * sont insérées avec published=false et scheduled_publish_at rempli. Cette
 * tâche les fait passer à published=true dès que l'heure arrive.
 *
 * Le bot quotidien (bot-generate-tickets.js) n'est JAMAIS concerné : il
 * publie toujours immédiatement, scheduled_publish_at reste NULL pour lui.
 *
 * Se réveille toutes les 5 min — assez fréquent pour qu'une programmation
 * "à 14h00" sorte à 14h00-14h05, sans jamais surcharger Supabase.
 * ============================================================================
 */

const config = { schedule: '*/5 * * * *' };

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function sbHeaders(extra) {
  return Object.assign({
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  }, extra || {});
}

async function handler() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.log('[PUBLISH-SCHEDULED] Configuration Supabase incomplète.');
    return { statusCode: 500, body: 'Configuration incomplète.' };
  }

  const base = SUPABASE_URL.replace(/\/$/, '');
  const maintenant = new Date().toISOString();

  try {
    // Toute fiche pas encore publiée dont l'heure programmée est passée.
    const url = `${base}/rest/v1/tickets?select=id,code&published=eq.false&scheduled_publish_at=not.is.null&scheduled_publish_at=lte.${encodeURIComponent(maintenant)}`;
    const resp = await fetch(url, { headers: sbHeaders() });
    if (!resp.ok) throw new Error(`lecture: HTTP ${resp.status} — ${await resp.text()}`);
    const dues = await resp.json();

    if (!dues.length) {
      return { statusCode: 200, body: 'Rien à publier.' };
    }

    let publiees = 0;
    const erreurs = [];
    for (const tk of dues) {
      try {
        const upd = await fetch(`${base}/rest/v1/tickets?id=eq.${tk.id}`, {
          method: 'PATCH',
          headers: sbHeaders({ Prefer: 'return=minimal' }),
          body: JSON.stringify({ published: true })
        });
        if (!upd.ok) throw new Error(`HTTP ${upd.status} — ${await upd.text()}`);
        publiees++;
        console.log(`[PUBLISH-SCHEDULED] Publiée : ${tk.code}`);
      } catch (e) {
        erreurs.push(`${tk.code}: ${e.message}`);
      }
    }

    console.log(`[PUBLISH-SCHEDULED] ${publiees}/${dues.length} fiche(s) publiée(s).`, erreurs.length ? erreurs : '');
    return { statusCode: 200, body: `${publiees} fiche(s) publiée(s).` };
  } catch (e) {
    console.log('[PUBLISH-SCHEDULED] Erreur :', e.message);
    return { statusCode: 500, body: e.message };
  }
}

module.exports.handler = handler;
module.exports.config = config;
