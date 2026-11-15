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

// 15/11 : fiche (tk) = avis SANS capture (« j'ai joué cette fiche ») -> image de la fiche gagnee.
// rp = avis sur un RAPPORT DU JOUR -> image du rapport (meme rendu que le canal public).
function legende(a, tk, rp) {
  const n = Math.max(1, Math.min(5, Number(a.etoiles) || 5));
  const fiche = rp ? `📊 A suivi le rapport du jour du ${rp.date} : ${rp.gagnes}/${rp.total} pronostics réussis` : !tk ? null : tk.perdue ? `🎟️ A joué la fiche ${tk.type} du ${tk.date}${a.capture_path ? ' : ' + tk.partiel + ' matchs gagnés' : ''}`
    : `🎟️ A joué la fiche ${tk.type} du ${tk.date} : GAGNÉE${tk.fraction || ''}${tk.cote ? ' — cote ' + tk.cote : ''}`;
  return [`${'⭐'.repeat(n)} <b>AVIS D'UN ABONNÉ${a.plan_libelle ? ' — ' + echapper(a.plan_libelle) : ''}</b>`, '',
    fiche, a.note ? `« ${echapper(a.note)} »` : '', a.note ? '' : null,
    a.capture_path ? '✅ Preuve vérifiée par l\'équipe' : rp ? `✅ Rapport vérifié : ${rp.gagnes}/${rp.total} réussis` : !tk ? '✅ Preuve vérifiée par l\'équipe' : tk.perdue ? `✅ Fiche vérifiée : ${tk.partiel} matchs gagnés` : '✅ Fiche vérifiée : gagnée', `🔓 Fiches VIP chaque jour : ${LIEN}`, '<i>Jeu responsable, 18+. Jouez avec contrôle.</i>']
    .filter(x => x !== null).join('\n').replace(/\n{3,}/g, '\n\n').slice(0, 1000);
}

async function journaliser(cfg, contexte, message) {
  try {
    await fetchDelai(`${cfg.url}/rest/v1/error_log`, { method: 'POST', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ context: contexte, message: String(message).slice(0, 500) }) });
  } catch (_) { /* jamais bloquant */ }
}

// 15/11 : contenu officiel de l'avis (fiche ou rapport choisi) : ligne de legende + image VIP BETCOTE
// avec TOUS les matchs. Fiche gagnee -> « FICHE GAGNÉE » ; fiche perdue (publiee par l'admin) ->
// « FICHE JOUÉE 12/13 » (jamais « gagnée ») ; rapport -> image du rapport (format du canal public).
async function lireRapport(cfg, a) {
  if (!a.rapport_date) return null;
  const r = await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?select=play_date,total,gagnes,taux,matchs&publie=eq.true` +
    `&play_date=eq.${a.rapport_date}&portee=eq.${encodeURIComponent(a.rapport_portee || '')}`, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture rapport HTTP ${r.status}`);
  const rp = (await r.json())[0];
  if (!rp) throw new Error('fiche rapport introuvable');
  return rp;
}

async function contenuOfficiel(cfg, a) {
  if (a.rapport_date) {
    const rp = await lireRapport(cfg, a);
    let png = null;
    try { png = await require('./rapport-jour').__test.imagePublic(rp, rp.play_date); }
    catch (e) { await journaliser(cfg, 'avis_telegram_image', e.message); }
    return { rp: { date: R.dateCourte(rp.play_date), gagnes: rp.gagnes, total: rp.total }, png };
  }
  if (!a.ticket_id) return null;
  const rt = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=id,sport,total_odd,legs_count,score_legs_count,play_date,status&id=eq.${a.ticket_id}`, { headers: entetes(cfg.cle) });
  if (!rt.ok) throw new Error(`lecture fiche HTTP ${rt.status}`);
  const tk = (await rt.json())[0];
  if (!tk || !['won', 'lost'].includes(tk.status)) throw new Error('fiche non reglee');
  const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=league,league_country,match_label,market,pick,odd,position,kickoff_at,result` +
    `&ticket_id=eq.${tk.id}&order=kickoff_at.asc,position.asc`, { headers: entetes(cfg.cle) });
  if (!rl.ok) throw new Error(`lecture matchs HTTP ${rl.status}`);
  const legs = await rl.json();
  const joues = legs.filter(l => l.result !== 'void');
  const ok = joues.filter(l => l.result === 'won').length;
  const exact = joues.length > 0 && joues.every(l => ['mk_score_l', 'mk_score_exact'].includes(String(l.market || '')));
  const info = { type: R.typeFiche(tk, legs), date: R.dateCourte(tk.play_date), cote: R.coteGagneeTexte(tk, legs),
    fraction: exact ? ` ${ok}/${joues.length}` : '', perdue: tk.status === 'lost', partiel: `${ok}/${joues.length}` };
  let png = null;
  try {
    if (!info.perdue) png = (await P.imageGagnante(tk, legs)).png;
    else {
      const { rendrePng } = require('./lib/image-fiche');
      png = await rendrePng({ type: info.type, cote: '', date: info.date, partiel: info.partiel,
        sousTitre: `${ok} match${ok > 1 ? 's' : ''} gagné${ok > 1 ? 's' : ''} sur ${joues.length} — résultats réels de chaque match` },
        legs.map(l => ({ match_label: l.match_label, league: l.league, league_country: l.league_country, pick: R.choixLeg(l), odd: l.odd, result: l.result })),
        'gagnante');
    }
  } catch (e) { await journaliser(cfg, 'avis_telegram_image', e.message); }
  return { tk: info, png };
}

// Album Telegram (2 images, legende sur la 1re) : capture de l'abonne + image officielle.
async function envoyerAlbum(token, chat, images, texte) {
  const fd = new FormData();
  fd.append('chat_id', String(chat));
  fd.append('media', JSON.stringify(images.map((im, k) => Object.assign({ type: 'photo', media: `attach://img${k}` },
    k === 0 ? { caption: texte, parse_mode: 'HTML' } : {}))));
  images.forEach((im, k) => fd.append(`img${k}`, new Blob([im.buf], { type: im.type }), `img${k}.${im.type === 'image/png' ? 'png' : 'jpg'}`));
  const r = await fetchDelai(`https://api.telegram.org/bot${token}/sendMediaGroup`, { method: 'POST', body: fd }, 40000);
  let j = null;
  try { j = await r.json(); } catch (_) { /* ignore */ }
  if (r.ok && j && j.ok) return { ok: true, messageId: j.result && j.result[0] && j.result[0].message_id };
  return { ok: false, status: r.status, description: j && j.description, retryAfter: j && j.parameters && j.parameters.retry_after };
}

// Un avis -> un message. Sans capture : image officielle seule. Avec capture + fiche/rapport :
// ALBUM (capture + image officielle) ; si l'album echoue (hors limite de debit), la capture seule
// part comme avant. Repli texte automatique (fetchEnvoi) si aucune image ne passe.
async function envoyerAvis(cfg, a, fetchEnvoi, fetchAlbum) {
  const c = await contenuOfficiel(cfg, a);
  if (!a.capture_path && !c) throw new Error('fiche absente');
  const texte = legende(a, c && c.tk, c && c.rp);
  if (!a.capture_path) return fetchEnvoi(cfg.token, cfg.chat, texte, null, c.png ? { png: c.png, legende: texte } : null);
  const img = await fetchDelai(`${cfg.url}/storage/v1/object/avis/${String(a.capture_path).split('/').map(encodeURIComponent).join('/')}`, { headers: { apikey: cfg.cle, Authorization: `Bearer ${cfg.cle}` } });
  if (!img.ok) throw new Error(`capture HTTP ${img.status}`);
  const capture = Buffer.from(await img.arrayBuffer());
  if (c && c.png) {
    let al;
    try { al = await fetchAlbum(cfg.token, cfg.chat, [{ buf: capture, type: img.headers.get('content-type') || 'image/jpeg' }, { buf: c.png, type: 'image/png' }], texte); }
    catch (e) { al = { ok: false, description: e.message }; }
    if (al.ok || al.retryAfter) return al;
    await journaliser(cfg, 'avis_telegram_album', `${a.id}: ${al.status || ''} ${al.description || ''}`);
  }
  return fetchEnvoi(cfg.token, cfg.chat, texte, null, { png: capture, legende: texte });
}

async function passage(cfg, fetchEnvoi, dormir, fetchAlbum) {
  if (!cfg.token || !cfg.chat) return { statut: 'non_configure' };
  if (cfg.chatEstVip) return { statut: 'bloque_groupe_vip' };
  if (!cfg.url || !cfg.cle) return { statut: 'config_supabase_incomplete' };
  const r = await fetchDelai(`${cfg.url}/rest/v1/avis_abonnes?select=id,etoiles,note,plan_libelle,capture_path,ticket_id,rapport_date,rapport_portee&statut=eq.publie&telegram_statut=is.null&order=decide_at.asc&limit=${MAX_PAR_PASSAGE}`, { headers: entetes(cfg.cle) });
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
      out = await envoyerAvis(cfg, a, fetchEnvoi, fetchAlbum || envoyerAlbum);   // 15/11 : capture et/ou fiche/rapport
    } catch (e) { out = { ok: false, description: e.message, definitif: /^(capture HTTP 4|fiche )/.test(e.message) }; }
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
module.exports.__test = { passage, legende, envoyerAvis, contenuOfficiel, envoyerAlbum };
