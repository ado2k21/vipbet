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
 * fiches dont min_plan_rank <= N.
 * Configuration prévue (4 groupes) : P1 = p1, P2 = p1-p2, P3 = p1 à p3,
 * P4 = p1 à p4. Repli à 3 groupes (P4 absent) : P3 reçoit alors p1 à p4.
 * Même exception que le dashboard : une fiche basket à cote totale > 15
 * (jour de jeu >= 2026-09-20) est masquée au rang 1.
 *
 * Variables Netlify (toutes facultatives : sans token ou sans groupe, la
 * fonction ne fait rien) :
 *   TELEGRAM_VIP_BOT_TOKEN
 *   TELEGRAM_VIP_CHAT_P1 … P4 (P4 facultatif)   (identifiant du groupe)
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

// Plafond de rang d'un groupe : avec 4 groupes (P1 à P4), chaque groupe g
// reçoit les plans p1 à pg. Repli à 3 groupes (P4 absent) : P3 reçoit tout
// (p1 à p4), pour que les abonnés LIFETIME ne soient jamais sans groupe.
function plafondGroupe(g, groupes) {
  return (g === 3 && !groupes[4]) ? 4 : g;
}

// Le groupe `g` doit-il recevoir cette fiche ? (même règle que le dashboard)
function ficheVisiblePourGroupe(tk, g, groupes) {
  const rang = plafondGroupe(g, groupes || {});
  const min = Number(tk.min_plan_rank);
  if (!Number.isFinite(min) || min > rang) return false;
  if (g === 1 && tk.sport === 'basket' && Number(tk.total_odd) > 15 &&
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

/* Libelles lisibles des marches (jamais de cle interne « mk_... » dans Telegram). */
const MARCHES = {
  mk_1x2: 'Victoire directe', mk_1x2_l: '1X2',
  mk_double_chance: 'Double chance', mk_dc_l: 'Double chance',
  mk_btts: 'Les deux équipes marquent', mk_btts_l: 'Les deux équipes marquent',
  mk_total_buts: 'Total buts', mk_total_domicile: 'Total buts domicile', mk_total_exterieur: 'Total buts extérieur',
  mk_over: 'Total points', mk_over_l: 'Plus / Moins de buts', mk_total_l: 'Total points',
  mk_score_exact: 'Score exact', mk_score_l: 'Score exact',
  mk_buteur: 'Buteur', mk_scorer_l: 'Buteur',
  mk_hand_l: 'Handicap', mk_corners_l: 'Corners', mk_team_goals_l: "Buts d'une équipe"
};
function libelleMarche(m) {
  const k = String(m || '');
  if (MARCHES[k]) return MARCHES[k];
  const t = k.replace(/^mk_/, '').replace(/_l$/, '').replace(/_/g, ' ').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
}
// Meme notation que le site : « Victoire : Home » -> « Victoire : 1 », « Away » -> « 2 ».
function libellePick(p) {
  return String(p || '').replace(/^Victoire\s*:\s*Home$/i, 'Victoire : 1').replace(/^Victoire\s*:\s*Away$/i, 'Victoire : 2');
}

const MARCHES_SCORE = ['mk_score_l', 'mk_score_exact'];
// Type affiche : SCORE EXACT, BASKETBALL ou FOOTBALL.
function typeFiche(tk, legs) {
  const n = Number(tk.legs_count) || (legs ? legs.length : 0);
  if (Number(tk.score_legs_count) > 0 && Number(tk.score_legs_count) === n) return 'SCORE EXACT';
  if (legs && legs.length && legs.every(l => MARCHES_SCORE.includes(String(l.market || '')))) return 'SCORE EXACT';
  if (tk.sport === 'basket' || tk.sport === 'nba') return 'BASKETBALL';
  return 'FOOTBALL';
}
function coteTexte(tk) {
  const total = Number(tk.total_odd);
  return Number.isFinite(total) && total > 0 ? total.toFixed(2) : '';
}

// Aucun code de fiche, aucun identifiant interne : titre = type + cote totale.
function formaterMessage(tk, legs) {
  const icone = tk.sport === 'basket' || tk.sport === 'nba' ? '🏀' : '⚽';
  const cote = coteTexte(tk);
  const lignes = [];
  lignes.push(`🎟 <b>FICHE ${typeFiche(tk, legs)}${cote ? ' — COTE ' + cote : ''}</b>`);
  lignes.push('');
  legs.forEach((l, i) => {
    const h = heureLeg(l);
    const pick = libellePick(l.pick);
    const marche = libelleMarche(l.market);
    // Le pick contient deja son libelle (« Les deux équipes marquent : Oui ») : pas de doublon.
    const choix = pick.includes(':') ? pick : (marche ? marche + ' : ' + pick : pick);
    lignes.push(`${icone} <b>${i + 1}. ${echapper(l.match_label)}</b>`);
    // Comme sur le site : « LIGA PROFESIONAL DE FÚTBOL (ARGENTINA) ».
    const ligue = (String(l.league || '') + (l.league_country ? ' (' + l.league_country + ')' : '')).toUpperCase();
    lignes.push(`   ${echapper(ligue)}${h ? ' · ' + echapper(h) : ''}`);
    lignes.push(`   ${echapper(choix)} — cote <b>${Number(l.odd).toFixed(2)}</b>`);
  });
  lignes.push('');
  if (cote) lignes.push(`💰 Cote totale : <b>${cote}</b>`);
  if (tk.confidence != null) lignes.push(`📊 Confiance : ${Number(tk.confidence)}%`);
  lignes.push('');
  lignes.push('<i>Jeu responsable, 18+. Jouez avec contrôle.</i>');
  return lignes.join('\n').slice(0, 4000);
}

// Message de RESULTAT, envoye en reponse a la fiche d'origine.
function formaterResultat(tk, legs, gagne) {
  const cote = coteTexte(tk);
  const titre = `FICHE ${typeFiche(tk, legs)}${cote ? ' — COTE ' + cote : ''}`;
  return gagne
    ? `✅ <b>${titre}</b>\n🏆 <b>GAGNÉE</b>`
    : `❌ <b>${titre}</b>\n<b>PERDUE</b>`;
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
async function envoyerTelegram(token, chat, texte, repondreA) {
  const corps = { chat_id: chat, text: texte, parse_mode: 'HTML', disable_web_page_preview: true };
  if (repondreA) { corps.reply_to_message_id = repondreA; corps.allow_sending_without_reply = true; }
  const r = await fetchDelai(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corps)
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
  const q = `${cfg.url}/rest/v1/tickets?select=id,code,sport,min_plan_rank,confidence,play_date,total_odd,legs_count,score_legs_count,created_at,updated_at,scheduled_publish_at` +
    `&published=eq.true&status=eq.pending&legs_count=gt.0&play_date=gte.${aujourdhui}&order=created_at.asc&limit=100`;
  const r = await fetchDelai(q, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture fiches HTTP ${r.status}`);
  const fiches = await r.json();

  let envoyes = 0, ignores = 0;
  const erreurs = [];
  for (const tk of fiches) {
    if (envoyes >= MAX_ENVOIS_PAR_PASSAGE) break;
    const cibles = rangs.filter(g => ficheVisiblePourGroupe(tk, g, cfg.groupes));
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
    const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=match_time,kickoff_at,league,league_country,match_label,market,pick,odd,position&ticket_id=eq.${tk.id}&order=kickoff_at.asc,position.asc`, { headers: entetes(cfg.cle) });
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

/* RESULTATS : une fiche deja postee dans un groupe, ensuite reglee (gagnee / perdue), recoit UN message
   de resultat en reponse a son message. Aucun resultat n'est publie pour une fiche jamais postee,
   ni plus de 48 h apres le reglement. Reservation en base avant l'envoi : jamais deux fois. */
async function passageResultats(cfg, fetchEnvoi, dormir) {
  const rangs = Object.keys(cfg.groupes).map(Number);
  if (!cfg.token || !rangs.length || !cfg.url || !cfg.cle) return { resultats: 0 };
  const depuis = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
  const r = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=id,sport,status,total_odd,legs_count,score_legs_count` +
    `&published=eq.true&status=in.(won,lost)&settled_at=gte.${depuis}&order=settled_at.asc&limit=60`, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture fiches reglees HTTP ${r.status}`);
  const fiches = await r.json();
  let resultats = 0;
  const erreurs = [];
  for (const tk of fiches) {
    if (resultats >= MAX_ENVOIS_PAR_PASSAGE) break;
    const re = await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?select=groupe,message_id&ticket_id=eq.${tk.id}&statut=eq.envoye&resultat=is.null`, { headers: entetes(cfg.cle) });
    if (!re.ok) throw new Error(`lecture envois HTTP ${re.status}`);
    const envois = await re.json();
    if (!envois.length) continue;
    const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=market&ticket_id=eq.${tk.id}`, { headers: entetes(cfg.cle) });
    const legs = rl.ok ? await rl.json() : [];
    const gagne = tk.status === 'won';
    const texte = formaterResultat(tk, legs, gagne);
    for (const e of envois) {
      if (!cfg.groupes[e.groupe]) continue;
      // reserver le resultat (une seule fois)
      const res = await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?ticket_id=eq.${tk.id}&groupe=eq.${e.groupe}&resultat=is.null`, {
        method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=representation' }),
        body: JSON.stringify({ resultat: 'envoi' })
      });
      if (!res.ok) throw new Error(`reservation resultat HTTP ${res.status}`);
      if (!(await res.json()).length) continue;
      let out;
      try { out = await fetchEnvoi(cfg.token, cfg.groupes[e.groupe], texte, e.message_id || null); }
      catch (err) { out = { ok: false, description: 'réseau: ' + err.message }; }
      if (out.ok) {
        await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?ticket_id=eq.${tk.id}&groupe=eq.${e.groupe}`, {
          method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
          body: JSON.stringify({ resultat: gagne ? 'gagne' : 'perdu', resultat_at: new Date().toISOString() })
        }).catch(() => {});
        resultats++;
        await dormir(PAUSE_ENTRE_ENVOIS_MS);
      } else {
        await fetchDelai(`${cfg.url}/rest/v1/telegram_envois?ticket_id=eq.${tk.id}&groupe=eq.${e.groupe}&resultat=eq.envoi`, {
          method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
          body: JSON.stringify({ resultat: null })
        }).catch(() => {});
        erreurs.push(`P${e.groupe} resultat ${tk.id}: HTTP ${out.status || '?'} ${out.description || ''}`);
        if (out.retryAfter) return { resultats, erreurs };
      }
    }
  }
  if (erreurs.length) await journaliser(cfg, 'telegram_relais_resultat', erreurs.slice(0, 5).join(' | '));
  return { resultats, erreurs };
}

async function handler() {
  try {
    const dormir = ms => new Promise(r => setTimeout(r, ms));
    const out = await passage(lireConfig(), envoyerTelegram, dormir);
    // Resultats : un incident ici ne doit jamais empecher l'envoi des nouvelles fiches (deja fait).
    try { out.resultats = await passageResultats(lireConfig(), envoyerTelegram, dormir); }
    catch (e) { try { await journaliser(lireConfig(), 'telegram_relais_resultat', e.message); } catch (_) { /* ignore */ } }
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
module.exports.__test = { plafondGroupe, lireConfig, ficheVisiblePourGroupe, formaterMessage, formaterResultat, typeFiche, libelleMarche, passage, passageResultats, dateHaiti };
