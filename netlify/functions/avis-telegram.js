/**
 * ============================================================================
 * VIP BETCOTE — AVIS PUBLIES -> GROUPE TELEGRAM PUBLIC (09/11, ADDITIF)
 * ----------------------------------------------------------------------------
 * Toutes les 10 minutes : chaque avis d'abonne PUBLIE par l'admin (avis_abonnes.statut
 * = 'publie') part UNE fois dans le canal public : la capture du ticket + note + etoiles.
 * Jamais le nom de l'abonne (seulement son plan), jamais dans un groupe VIP, jamais le mot
 * « bot ». Reservation en base avant l'envoi : jamais deux fois.
 * Lecture : avis_abonnes, tickets, storage « avis » ; ecriture : colonnes telegram_* seulement.
 * ============================================================================
 */
const R = require('./telegram-relais').__test;
const P = require('./telegram-public').__test;

const config = { schedule: '*/10 * * * *' };
const MAX_PAR_PASSAGE = 5;
const PAUSE_MS = 1500;
const LIEN = 'https://vipbetcote.com/?src=telegram';

const entetes = (cle, extra) => Object.assign({ apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' }, extra || {});
const echapper = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function fetchDelai(url, opts, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 20000);
  try { return await fetch(url, Object.assign({}, opts, { signal: c.signal })); }
  finally { clearTimeout(t); }
}

function legende(a) {
  const n = Math.max(1, Math.min(5, Number(a.etoiles) || 5));
  return [`${'⭐'.repeat(n)} <b>AVIS D'UN ABONNÉ${a.plan_libelle ? ' — ' + echapper(a.plan_libelle) : ''}</b>`, '',
    a.note ? `« ${echapper(a.note)} »` : '', a.note ? '' : null,
    '✅ Preuve vérifiée par l\'équipe', `🔓 Fiches VIP chaque jour : ${LIEN}`, '<i>Jeu responsable, 18+. Jouez avec contrôle.</i>']
    .filter(x => x !== null).join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 1000);
}

async function journaliser(cfg, contexte, message) {
  try {
    await fetchDelai(`${cfg.url}/rest/v1/error_log`, { method: 'POST', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ context: contexte, message: String(message).slice(0, 500) }) });
  } catch (_) { /* jamais bloquant */ }
}

async function passage(cfg, fetchEnvoi, dormir) {
  if (!cfg.token || !cfg.chat) return { statut: 'non_configure' };
  if (cfg.chatEstVip) return { statut: 'bloque_groupe_vip' };
  if (!cfg.url || !cfg.cle) return { statut: 'config_supabase_incomplete' };
  const r = await fetchDelai(`${cfg.url}/rest/v1/avis_abonnes?select=id,etoiles,note,plan_libelle,capture_path&statut=eq.publie&telegram_statut=is.null&order=decide_at.asc&limit=${MAX_PAR_PASSAGE}`, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture avis HTTP ${r.status}`);
  const avis = await r.json();
  let envoyes = 0; const erreurs = [];
  for (const a of avis) {
    const res = await fetchDelai(`${cfg.url}/rest/v1/avis_abonnes?id=eq.${a.id}&statut=eq.publie&telegram_statut=is.null`, {
      method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=representation' }), body: JSON.stringify({ telegram_statut: 'envoi' }) });
    if (!res.ok) throw new Error(`reservation HTTP ${res.status}`);
    if (!(await res.json()).length) continue;
    let out;
    try {
      const img = await fetchDelai(`${cfg.url}/storage/v1/object/avis/${String(a.capture_path).split('/').map(encodeURIComponent).join('/')}`, { headers: { apikey: cfg.cle, Authorization: `Bearer ${cfg.cle}` } });
      if (!img.ok) throw new Error(`capture HTTP ${img.status}`);
      const png = Buffer.from(await img.arrayBuffer());
      out = await fetchEnvoi(cfg.token, cfg.chat, legende(a), null, { png, legende: legende(a) });
    } catch (e) { out = { ok: false, description: e.message, definitif: /^capture HTTP 4/.test(e.message) }; }
    // Capture introuvable (supprimee) : 'echec', sinon on reessaiera au prochain passage.
    await fetchDelai(`${cfg.url}/rest/v1/avis_abonnes?id=eq.${a.id}`, { method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify(out.ok ? { telegram_statut: 'envoye', telegram_message_id: out.messageId || null, telegram_at: new Date().toISOString() } : { telegram_statut: out.definitif ? 'echec' : null }) }).catch(() => {});
    if (out.ok) { envoyes++; await dormir(PAUSE_MS); }
    else { erreurs.push(`${a.id}: HTTP ${out.status || '?'} ${out.description || ''}`); if (out.retryAfter || out.status === 403) break; }
  }
  if (erreurs.length) await journaliser(cfg, 'avis_telegram', erreurs.slice(0, 5).join(' | '));
  return { envoyes, erreurs: erreurs.length };
}

async function handler() {
  const cfg = P.lireConfig();
  try {
    const out = await passage(cfg, R.envoyerTelegram, ms => new Promise(r => setTimeout(r, ms)));
    console.log('[AVIS-TELEGRAM]', JSON.stringify(out));
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e) {
    console.log('[AVIS-TELEGRAM] erreur:', e.message);
    await journaliser(cfg, 'avis_telegram', e.message);
    return { statusCode: 200, body: 'erreur journalisee' };
  }
}

module.exports.handler = handler;
module.exports.config = config;
module.exports.__test = { passage, legende };
