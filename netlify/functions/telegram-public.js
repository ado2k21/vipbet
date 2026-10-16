/**
 * ============================================================================
 * VIP BETCOTE — CANAL TELEGRAM PUBLIC : fiches GAGNANTES (16/10, ADDITIF)
 * ----------------------------------------------------------------------------
 * Toutes les 10 minutes : chaque fiche publiee qui vient d'etre GAGNEE est
 * postee UNE fois dans le canal public (preuve + lien vers le site).
 *  - Lecture seule sur tickets / ticket_legs ; ecrit uniquement dans
 *    telegram_public_envois (reservation AVANT l'envoi : jamais de doublon).
 *  - Seulement les fiches reglees dans les 24 dernieres heures : l'activation
 *    n'inonde pas le canal avec l'historique.
 *  - Ne poste JAMAIS dans un groupe VIP : si le canal configure est identique
 *    a TELEGRAM_VIP_CHAT_P1..P4, rien n'est envoye.
 *
 * Variables Netlify :
 *   TELEGRAM_PUBLIC_CHAT   ex. @VipBetcote (sans elle, la fonction ne fait rien)
 *   TELEGRAM_VIP_BOT_TOKEN (existant) — le robot doit etre ADMINISTRATEUR du
 *                          canal avec le droit « Publier des messages ».
 * ============================================================================
 */
const R = require('./telegram-relais').__test;

const config = { schedule: '*/10 * * * *' };
const FENETRE_MS = 24 * 3600 * 1000;
const MAX_PAR_PASSAGE = 5;
const PAUSE_MS = 1500;
const LIEN = 'https://vipbetcote.com/?src=telegram';

const echapper = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const entetes = (cle, extra) => Object.assign({ apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' }, extra || {});

function lireConfig(env) {
  const e = env || process.env;
  const chat = String(e.TELEGRAM_PUBLIC_CHAT || '').trim();
  const vip = [];
  for (let r = 1; r <= 4; r++) { const v = String(e['TELEGRAM_VIP_CHAT_P' + r] || '').trim().toLowerCase(); if (v) vip.push(v); }
  return {
    token: String(e.TELEGRAM_VIP_BOT_TOKEN || '').trim(),
    chat: (/^-?\d+$/.test(chat) || /^@[A-Za-z0-9_]{5,}$/.test(chat)) ? chat : '',
    chatEstVip: !!chat && vip.includes(chat.toLowerCase()),
    url: String(e.SUPABASE_URL || '').replace(/\/rest\/v1\/?$/, '').replace(/\/$/, ''),
    cle: e.SUPABASE_SERVICE_ROLE_KEY || ''
  };
}

async function fetchDelai(url, opts, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 15000);
  try { return await fetch(url, Object.assign({}, opts, { signal: c.signal })); }
  finally { clearTimeout(t); }
}

function formaterGagnante(tk, legs) {
  const total = Number(tk.total_odd);
  const cote = Number.isFinite(total) && total > 0 ? total.toFixed(2) : '';
  const lignes = [`✅ <b>FICHE ${R.typeFiche(tk, legs)} GAGNANTE${cote ? ' — COTE ' + cote : ''}</b>`, ''];
  legs.forEach(l => {
    const pick = R.libellePick(l.pick);
    const marche = R.libelleMarche(l.market);
    const choix = pick.includes(':') ? pick : (marche ? marche + ' : ' + pick : pick);
    const ligue = (String(l.league || '') + (l.league_country ? ' (' + l.league_country + ')' : '')).toUpperCase();
    // Fiche score exact gagnee avec un seul bon score : chaque match garde SON vrai resultat
    // (✅ gagne, ❌ perdu) — jamais de faux resultat, la regle de la fiche ne change pas.
    const marque = l.result === 'lost' ? '❌' : l.result === 'void' ? '➖' : '✅';
    lignes.push(`${marque} <b>${echapper(l.match_label)}</b>`);
    if (ligue) lignes.push(`   ${echapper(ligue)}`);
    lignes.push(`   ${echapper(choix)} — cote <b>${Number(l.odd).toFixed(2)}</b>`);
  });
  lignes.push('');
  if (cote) lignes.push(`💰 Cote totale : <b>${cote}</b>`);
  lignes.push('');
  lignes.push(`🔓 Fiches VIP chaque jour : ${LIEN}`);
  lignes.push('<i>Jeu responsable, 18+. Jouez avec contrôle.</i>');
  return lignes.join('\n').slice(0, 4000);
}

// Envoi : image + legende, repli automatique sur le texte (meme fonction que le relais).
const envoyerTelegram = R.envoyerTelegram;

// Image « fiche gagnee » + legende courte (16/10). ✓/✗ = resultat REEL de chaque match.
async function imageGagnante(tk, legs) {
  const { rendrePng } = require('./lib/image-fiche');
  const total = Number(tk.total_odd);
  const cote = Number.isFinite(total) && total > 0 ? total.toFixed(2) : '';
  const type = R.typeFiche(tk, legs);
  const perdus = legs.filter(l => l.result === 'lost').length;
  const sousTitre = perdus ? 'Un seul bon score suffit — résultats réels de chaque match' : 'Tous les matchs gagnés';
  const png = await rendrePng({ type, cote, sousTitre },
    legs.map(l => ({ match_label: l.match_label, league: l.league, league_country: l.league_country, pick: R.choixLeg(l), odd: l.odd, result: l.result })),
    'gagnante');
  const legende = [`✅ <b>FICHE ${type} GAGNÉE${cote ? ' — COTE ' + cote : ''}</b>`, '',
    `🔓 Fiches VIP chaque jour : ${LIEN}`, '<i>Jeu responsable, 18+. Jouez avec contrôle.</i>'].join('\n');
  return { png, legende };
}

async function journaliser(cfg, contexte, message) {
  try {
    await fetchDelai(`${cfg.url}/rest/v1/error_log`, {
      method: 'POST', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ context: contexte, message: String(message).slice(0, 500) })
    });
  } catch (_) { /* jamais bloquant */ }
}

async function passage(cfg, fetchEnvoi, dormir, maintenant) {
  if (!cfg.token || !cfg.chat) return { statut: 'non_configure' };
  if (cfg.chatEstVip) { await journaliser(cfg, 'telegram_public', 'TELEGRAM_PUBLIC_CHAT est un groupe VIP : envoi BLOQUE'); return { statut: 'bloque_groupe_vip' }; }
  if (!cfg.url || !cfg.cle) return { statut: 'config_supabase_incomplete' };
  const depuis = new Date((maintenant || Date.now()) - FENETRE_MS).toISOString();
  const r = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=id,sport,total_odd,legs_count,score_legs_count` +
    `&published=eq.true&status=eq.won&settled_at=gte.${depuis}&order=settled_at.asc&limit=30`, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture fiches HTTP ${r.status}`);
  const fiches = await r.json();
  let envoyes = 0;
  const erreurs = [];
  for (const tk of fiches) {
    if (envoyes >= MAX_PAR_PASSAGE) break;
    // Reservation : la cle primaire (ticket_id) garantit un seul message par fiche.
    const res = await fetchDelai(`${cfg.url}/rest/v1/telegram_public_envois?on_conflict=ticket_id`, {
      method: 'POST', headers: entetes(cfg.cle, { Prefer: 'resolution=ignore-duplicates,return=representation' }),
      body: JSON.stringify([{ ticket_id: tk.id, statut: 'envoi' }])
    });
    if (!res.ok) throw new Error(`reservation HTTP ${res.status}`);
    if (!(await res.json()).length) continue;   // deja postee (ou en cours)
    const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=league,league_country,match_label,market,pick,odd,position,kickoff_at,result` +
      `&ticket_id=eq.${tk.id}&order=kickoff_at.asc,position.asc`, { headers: entetes(cfg.cle) });
    const legs = rl.ok ? await rl.json() : [];
    let out;
    if (!legs.length) out = { ok: false, description: 'fiche sans selections' };
    else {
      let image = null;
      try { image = await imageGagnante(tk, legs); } catch (e) { await journaliser(cfg, 'telegram_public_image', e.message); }
      try { out = await fetchEnvoi(cfg.token, cfg.chat, formaterGagnante(tk, legs), null, image); }
      catch (e) { out = { ok: false, description: 'reseau: ' + e.message }; }
    }
    if (out.ok) {
      await fetchDelai(`${cfg.url}/rest/v1/telegram_public_envois?ticket_id=eq.${tk.id}`, {
        method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
        body: JSON.stringify({ statut: 'envoye', message_id: out.messageId || null, envoye_at: new Date().toISOString() })
      }).catch(() => {});
      envoyes++;
      await dormir(PAUSE_MS);
    } else {
      // Echec : reservation retiree, nouvel essai au prochain passage.
      await fetchDelai(`${cfg.url}/rest/v1/telegram_public_envois?ticket_id=eq.${tk.id}&statut=eq.envoi`, {
        method: 'DELETE', headers: entetes(cfg.cle, { Prefer: 'return=minimal' })
      }).catch(() => {});
      erreurs.push(`${tk.id}: HTTP ${out.status || '?'} ${out.description || ''}`);
      if (out.retryAfter || out.status === 403 || out.status === 400) break;   // droits manquants : inutile d'insister
    }
  }
  if (erreurs.length) await journaliser(cfg, 'telegram_public', erreurs.slice(0, 5).join(' | '));
  return { envoyes, erreurs: erreurs.length };
}

async function handler() {
  const cfg = lireConfig();
  try {
    const out = await passage(cfg, envoyerTelegram, ms => new Promise(r => setTimeout(r, ms)));
    console.log('[TELEGRAM-PUBLIC]', JSON.stringify(out));
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e) {
    console.log('[TELEGRAM-PUBLIC] erreur:', e.message);
    await journaliser(cfg, 'telegram_public', e.message);
    return { statusCode: 200, body: 'erreur journalisee' };
  }
}

module.exports.handler = handler;
module.exports.config = config;
module.exports.__test = { lireConfig, formaterGagnante, imageGagnante, passage };
