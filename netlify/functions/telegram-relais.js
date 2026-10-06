/**
 * ============================================================================
 * VIP BETCOTE — RELAIS TELEGRAM (Netlify Scheduled Function, ADDITIF)
 * Fichier : netlify/functions/telegram-relais.js
 * ----------------------------------------------------------------------------
 * LIT les fiches publiées et les poste dans les groupes Telegram par plan.
 * Ne modifie JAMAIS tickets / ticket_legs : il écrit uniquement dans la
 * table de suivi telegram_envois.
 *
 * Règle de plans (identique au dashboard) : le groupe de rang N reçoit les
 * fiches dont min_plan_rank <= N.   groupe 1 = p1, 2 = p1-p2, 3 = p1-p3,
 * 4 = p1-p4. Même exception que le dashboard : une fiche basket à cote
 * totale > 15 (jour de jeu >= 2026-09-20) est masquée au rang 1.
 *
 * Variables Netlify (toutes facultatives : sans token ou sans groupe, la
 * fonction ne fait rien) :
 *   TELEGRAM_VIP_BOT_TOKEN
 *   TELEGRAM_VIP_CHAT_P1 … TELEGRAM_VIP_CHAT_P4   (identifiant du groupe)
 *
 * Garanties :
 *  - une fiche = un message par groupe (réservation en base AVANT l'envoi) ;
 *  - jamais de fiche vide ou incomplète (legs_count == nombre de legs, et
 *    fiche publiée depuis plus de 2 min) ;
 *  - seulement les fiches en cours (pending) du jour de jeu >= aujourd'hui
 *    (Haïti) : l'activation n'inonde pas les groupes avec l'historique ;
 *  - échec d'envoi : réservation retirée, nouvel essai au passage suivant ;
 *  - le token n'est jamais écrit dans les journaux.
 * ============================================================================
 */

const config = { schedule: '*/5 * * * *' };

const TZ_HAITI = 'America/Port-au-Prince';
const BASKET15_MASQUE_DES = '2026-09-20';
const DELAI_MIN_MS = 2 * 60 * 1000;
const MAX_ENVOIS_PAR_PASSAGE = 20;
const PAUSE_ENTRE_ENVOIS_MS = 1200;

function lireConfig(env) {
  const e = env || process.env;
  const token = String(e.TELEGRAM_VIP_BOT_TOKEN || '').trim();
  const groupes = {};
  for (let r = 1; r <= 4; r++) {
    const v = String(e['TELEGRAM_VIP_CHAT_P' + r] || '').trim();
    if (/^-?\d+$/.test(v) || /^@[A-Za-z0-9_]{5,}$/.test(v)) groupes[r] = v;
  }
  return { token, groupes, url: String(e.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
    cle: e.SUPABASE_SERVICE_ROLE_KEY || '' };
}

function dateHaiti(d) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ_HAITI, year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(d || new Date());
}

function echapper(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Le groupe `rang` doit-il recevoir cette fiche ? (même règle que le dashboard)
function ficheVisiblePourGroupe(tk, rang) {
  const min = Number(tk.min_plan_rank);
  if (!Number.isFinite(min) || min > rang) return false;
  if (rang === 1 && tk.sport === 'basket' && Number(tk.total_odd) > 15 &&
      String(tk.play_date || '') >= BASKET15_MASQUE_DES) return false;
  return true;
}

function heureLeg(l) {
  if (l.match_time) return String(l.match_time);
  if (l.kickoff_at) {
    try {
      return new Intl.DateTimeFormat('fr-FR', { timeZone: TZ_HAITI, hour: '2-digit', minute: '2-digit' })
        .format(new Date(l.kickoff_at));
    } catch (_) { /* ignoré */ }
  }
  return '';
}

function formaterMessage(tk, legs) {
  const icone = tk.sport === 'basket' ? '🏀' : '⚽';
  const total = Number(tk.total_odd);
  const lignes = [];
  lignes.push(`🎟 <b>FICHE ${echapper(tk.code || String(tk.id).slice(0, 8).toUpperCase())}</b> — ${echapper(tk.play_date)}`);
  lignes.push('');
  legs.forEach((l, i) => {
    const h = heureLeg(l);
    lignes.push(`${icone} <b>${i + 1}. ${echapper(l.match_label)}</b>`);
    lignes.push(`   ${echapper(l.league || '')}${h ? ' · ' + echapper(h) : ''}`);
    lignes.push(`   ${echapper(l.market)} : <b>${echapper(l.pick)}</b> — cote <b>${Number(l.odd).toFixed(2)}</b>`);
  });
  lignes.push('');
  if (Number.isFinite(total) && total > 0) lignes.push(`💰 Cote totale : <b>${total.toFixed(2)}</b>`);
  if (tk.confidence != null) lignes.push(`📊 Confiance : ${Number(tk.confidence)}%`);
  lignes.push('');
  lignes.push('<i>Jeu responsable, 18+. Aucun gain garanti.</i>');
  return lignes.join('\n').slice(0, 4000);
}

function entetes(cle, extra) {
  return Object.assign({ apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' }, extra || {});
}

async function fetchDelai(url, opts, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 15000);
  try { return await fetch(url, Object.assign({}, opts, { signal: c.signal })); }
  finally { clearTimeout(t); }
}

// Envoi Telegram. Retourne {ok, messageId} ou {ok:false, retryAfter?, fatal?}.
async function envoyerTelegram(token, chat, texte) {
  const r = await fetchDelai(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chat, text: texte, parse_mode: 'HTML', disable_web_page_preview: true })
  });
  let j = null;
  try { j = await r.json(); } catch (_) { /* ignoré */ }
  if (r.ok && j && j.ok) return { ok: true, messageId: j.result && j.result.message_id };
  const retryAfter = j && j.parameters && j.parameters.retry_after;
  return { ok: false, status: r.status, retryAfter: retryAfter || null,
    description: String((j && j.description) || '').slice(0, 200) };
}

async function journaliser(cfg, contexte, message) {
  try {
    await fetchDelai(`${cfg.url}/rest/v1/error_log`, {
      method: 'POST', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ context: contexte, message: String(message).slice(0, 500) })
    });
  } catch (_) { /* le journal ne doit jamais faire échouer le relais */ }
}

async function passage(cfg, fetchEnvoi, dormir) {
  const rangs = Object.keys(cfg.groupes).map(Number);
  if (!cfg.token || !rangs.length) return { statut: 'non_configure' };
  if (!cfg.url || !cfg.cle) return { statut: 'config_supabase_incomplete' };

  const aujourdhui = dateHaiti();
  const q = `${cfg.url}/rest/v1/tickets?select=id,code,sport,min_plan_rank,confidence,play_date,total_odd,legs_count,created_at,updated_at,scheduled_publish_at` +
    `&published=eq.true&status=eq.pending&legs_count=gt.0&play_date=gte.${aujourdhui}&order=created_at.asc&limit=100`;
  const r = await fetchDelai(q, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture fiches HTTP ${r.status}`);
  const fiches = await r.json();

  let envoyes = 0, ignores = 0;
  const erreurs = [];
  for (const tk of fiches) {
    if (envoyes >= MAX_ENVOIS_PAR_PASSAGE) break;
    const cibles = rangs.filter(g => ficheVisiblePourGroupe(tk, g));
    if (!cibles.length) continue;

    // Déjà réservé/envoyé ?
    const rd = await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?select=groupe&ticket_id=eq.${tk.id}`, { headers: entetes(cfg.cle) });
    if (!rd.ok) throw new Error(`lecture envois HTTP ${rd.status}`);
    const deja = new Set((await rd.json()).map(x => x.groupe));
    const aFaire = cibles.filter(g => !deja.has(g));
    if (!aFaire.length) continue;

    // Fiche complète et stable : publiée depuis > 2 min et legs == legs_count.
    const derniere = Math.max(Date.parse(tk.updated_at) || 0, Date.parse(tk.scheduled_publish_at) || 0, Date.parse(tk.created_at) || 0);
    if (Date.now() - derniere < DELAI_MIN_MS) { ignores++; continue; }
    const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=match_time,kickoff_at,league,match_label,market,pick,odd,position&ticket_id=eq.${tk.id}&order=kickoff_at.asc,position.asc`, { headers: entetes(cfg.cle) });
    if (!rl.ok) throw new Error(`lecture legs HTTP ${rl.status}`);
    const legs = await rl.json();
    if (!legs.length || legs.length !== Number(tk.legs_count) ||
        legs.some(l => !l.match_label || !l.market || !l.pick || !(Number(l.odd) > 1))) { ignores++; continue; }

    const texte = formaterMessage(tk, legs);
    for (const g of aFaire) {
      // 1) réserver (anti-doublon) — 2) envoyer — 3) confirmer
      const res = await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?on_conflict=ticket_id,groupe`, {
        method: 'POST', headers: entetes(cfg.cle, { Prefer: 'resolution=ignore-duplicates,return=representation' }),
        body: JSON.stringify({ ticket_id: tk.id, groupe: g, statut: 'envoi' })
      });
      if (!res.ok) throw new Error(`réservation HTTP ${res.status}`);
      const lignes = await res.json();
      if (!lignes.length) continue; // pris par un autre passage

      let out;
      try { out = await fetchEnvoi(cfg.token, cfg.groupes[g], texte); }
      catch (e) { out = { ok: false, description: 'réseau: ' + e.message }; }

      if (out.ok) {
        await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?ticket_id=eq.${tk.id}&groupe=eq.${g}`, {
          method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
          body: JSON.stringify({ statut: 'envoye', message_id: out.messageId || null, sent_at: new Date().toISOString() })
        }).catch(() => {});
        envoyes++;
        await dormir(PAUSE_ENTRE_ENVOIS_MS);
      } else {
        // retire la réservation : nouvel essai au prochain passage
        await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?ticket_id=eq.${tk.id}&groupe=eq.${g}&statut=eq.envoi`, {
          method: 'DELETE', headers: entetes(cfg.cle, { Prefer: 'return=minimal' })
        }).catch(() => {});
        erreurs.push(`P${g} fiche ${tk.code || tk.id}: HTTP ${out.status || '?'} ${out.description || ''}`);
        if (out.retryAfter) return { statut: 'limite_telegram', envoyes, erreurs, ignores };
      }
    }
  }
  if (erreurs.length) await journaliser(cfg, 'telegram_relais_envoi', erreurs.slice(0, 5).join(' | '));
  return { statut: 'ok', envoyes, ignores, erreurs };
}

async function handler() {
  try {
    const out = await passage(lireConfig(), envoyerTelegram, ms => new Promise(r => setTimeout(r, ms)));
    console.log('[TELEGRAM-RELAIS]', JSON.stringify(out));
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e) {
    console.log('[TELEGRAM-RELAIS] erreur:', e.message);
    try { await journaliser(lireConfig(), 'telegram_relais', e.message); } catch (_) { /* ignoré */ }
    return { statusCode: 200, body: 'erreur journalisée' };
  }
}

module.exports.handler = handler;
module.exports.config = config;
module.exports.__test = { lireConfig, ficheVisiblePourGroupe, formaterMessage, passage, dateHaiti };
