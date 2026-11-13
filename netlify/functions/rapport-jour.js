/**
 * ============================================================================
 * VIP BETCOTE — RAPPORT DU JOUR (07/11, ADDITIF)
 * ----------------------------------------------------------------------------
 * Toutes les 30 minutes : pour les 3 derniers jours de jeu (heure d'Haiti), calcule
 * le taux de reussite des PRONOSTICS publies (foot + basket, SANS score exact),
 *   - « complet » : toutes les fiches publiees du jour (landing + canal public) ;
 *   - « p1 » a « p4 » : uniquement les fiches que CE plan recoit (meme regle que le
 *     dashboard et les groupes VIP : min_plan_rank <= rang ; basket > 15 masque au rang 1).
 * Regles (demande de l'utilisateur, 07/11) :
 *   - un meme pronostic present dans plusieurs fiches compte UNE seule fois ;
 *   - les matchs annules (void) sont exclus ; aucun minimum de pronostics ;
 *   - calcule seulement quand TOUS les pronostics du jour sont regles ;
 *   - publie si taux >= 70 % ; envoye UNE seule fois sur Telegram (complet -> canal
 *     public ; pN -> groupe VIP du plan N).
 * Lecture seule sur tickets / ticket_legs ; ecrit uniquement dans rapports_jour.
 * Aucune mention de « bot » dans les messages.
 * ============================================================================
 */
const R = require('./telegram-relais').__test;

const config = { schedule: '*/30 * * * *' };
const SEUIL = 70;
const JOURS = 3;
const RATTRAPAGE_JOURS = 180;   // jours passes calcules apres coup (admin seulement)
const RATTRAPAGE_MAX_PAR_PASSAGE = 40;
const MAX_MATCHS = 60;          // tous les pronostics joues (gagnes puis perdus)
const MAX_LIGNES_IMAGE = 12;
const PAUSE_MS = 1500;
const BASKET15_MASQUE_DES = '2026-09-20';
const MARCHES_SCORE = ['mk_score_l', 'mk_score_exact'];
const LIEN = 'https://vipbetcote.com/?src=telegram';

const entetes = (cle, extra) => Object.assign({ apikey: cle, Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' }, extra || {});
const echapper = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function lireConfig(env) {
  const e = env || process.env;
  const vip = R.lireConfig(e);
  const pub = String(e.TELEGRAM_PUBLIC_CHAT || '').trim();
  const vipIds = Object.values(vip.groupes).map(v => String(v).toLowerCase());
  return {
    token: vip.token, groupes: vip.groupes,
    public: (/^-?\d+$/.test(pub) || /^@[A-Za-z0-9_]{5,}$/.test(pub)) && !vipIds.includes(pub.toLowerCase()) ? pub : '',
    url: vip.url, cle: vip.cle
  };
}

async function fetchDelai(url, opts, ms) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms || 15000);
  try { return await fetch(url, Object.assign({}, opts, { signal: c.signal })); }
  finally { clearTimeout(t); }
}

// Meme regle que le dashboard (accessibleParRang) et les groupes VIP.
function visiblePourRang(tk, rang) {
  const min = Number(tk.min_plan_rank);
  if (!Number.isFinite(min) || min > rang) return false;
  if (rang === 1 && (tk.sport === 'basket' || tk.sport === 'nba') && Number(tk.total_odd) > 15 &&
      String(tk.play_date || '') >= BASKET15_MASQUE_DES) return false;
  return true;
}

/* Calcul pur (teste a part). tickets : fiches publiees d'UN jour ; legs : leurs selections.
   Retourne null si au moins un pronostic du jour n'est pas encore regle. */
function calculerJour(tickets, legs) {
  const parTicket = new Map();
  legs.forEach(l => { (parTicket.get(l.ticket_id) || parTicket.set(l.ticket_id, []).get(l.ticket_id)).push(l); });
  const utiles = legs.filter(l => !MARCHES_SCORE.includes(String(l.market || '')));
  if (!utiles.length) return null;
  if (utiles.some(l => !['won', 'lost', 'void'].includes(l.result))) return null;   // jour pas termine
  const sportDe = new Map(tickets.map(t => [t.id, t.sport]));
  const portees = { complet: () => true, p1: t => visiblePourRang(t, 1), p2: t => visiblePourRang(t, 2), p3: t => visiblePourRang(t, 3), p4: t => visiblePourRang(t, 4) };
  const out = {};
  for (const [nom, voit] of Object.entries(portees)) {
    const vus = new Map();   // cle de pronostic -> leg (un pronostic compte une seule fois)
    tickets.filter(voit).forEach(t => (parTicket.get(t.id) || []).forEach(l => {
      if (MARCHES_SCORE.includes(String(l.market || '')) || l.result === 'void') return;
      const cle = (l.fixture_id != null ? 'f' + l.fixture_id : 'm' + String(l.match_label || '').trim().toLowerCase()) +
        '|' + String(l.market || '') + '|' + String(l.pick || '').trim().toLowerCase();
      if (!vus.has(cle)) vus.set(cle, l);
    }));
    const liste = [...vus.values()];
    if (!liste.length) continue;
    const gagnes = liste.filter(l => l.result === 'won');
    const taux = Math.round(1000 * gagnes.length / liste.length) / 10;
    // 07/11 : TOUS les pronostics joues (gagnes d'abord, puis perdus ✗), chacun avec son vrai resultat.
    const parHeure = (a, b) => String(a.kickoff_at || '').localeCompare(String(b.kickoff_at || ''));
    const ordonnes = gagnes.slice().sort(parHeure).concat(liste.filter(l => l.result === 'lost').sort(parHeure));
    out[nom] = {
      total: liste.length, gagnes: gagnes.length, taux, publie: taux >= SEUIL,
      matchs: ordonnes.slice(0, MAX_MATCHS).map(l => ({ result: l.result,
          match_label: String(l.match_label || ''), choix: R.choixLeg(l), pick: R.libellePick(l.pick), market: String(l.market || ''), odd: Number(l.odd) || null,
          league: l.league || null, league_country: l.league_country || null, sport: sportDe.get(l.ticket_id) || null
        }))
    };
  }
  return out;
}

function sports(rp) {
  const s = new Set((rp.matchs || []).map(m => (m.sport === 'basket' || m.sport === 'nba') ? 'b' : 'f'));
  return s.size === 2 || !s.size ? 'FOOTBALL + BASKETBALL' : (s.has('b') ? 'BASKETBALL' : 'FOOTBALL');
}
function legende(rp, jour, publicCanal) {
  const pct = Math.round(rp.taux);
  return [`🏆 <b>RAPPORT DU JOUR — ${R.dateCourte(jour)}</b>`,
    `✅ <b>${rp.gagnes}/${rp.total} pronostics réussis (${pct} %)</b>`,
    `${sports(rp) === 'BASKETBALL' ? '🏀' : sports(rp) === 'FOOTBALL' ? '⚽' : '⚽🏀'} ${sports(rp)}${publicCanal ? '' : ' · sans score exact'}`,   // canal public : sans cette mention (09/11)
    '', publicCanal ? `🔓 Fiches VIP chaque jour : ${LIEN}` : '', '<i>Jeu responsable, 18+. Jouez avec contrôle.</i>']
    .filter((x, i) => x !== '' || i === 3).join('\n');
}
function texte(rp, jour, publicCanal) {
  const lignes = [`🏆 <b>RAPPORT DU JOUR — ${R.dateCourte(jour)}</b>`,
    `✅ <b>${rp.gagnes}/${rp.total} pronostics réussis (${Math.round(rp.taux)} %)</b>`, `${sports(rp)}${publicCanal ? '' : ' · sans score exact'}`, ''];
  // Canal public : tous les matchs (✅ / ❌) ; groupes VIP : les reussis seulement.
  const montres = publicCanal ? (rp.matchs || []) : gagnesSeuls(rp);
  montres.forEach(m => lignes.push(`${m.result === 'lost' ? '❌' : '✅'} <b>${echapper(m.match_label)}</b> · ${echapper(m.choix)}`));
  const reste = publicCanal ? 0 : rp.gagnes - montres.length;
  if (reste > 0) lignes.push(`… +${reste} autres pronostics réussis`);
  lignes.push('');
  if (publicCanal) lignes.push(`🔓 Fiches VIP chaque jour : ${LIEN}`);
  lignes.push('<i>Jeu responsable, 18+. Jouez avec contrôle.</i>');
  return lignes.join('\n').slice(0, 4000);
}
const gagnesSeuls = rp => (rp.matchs || []).filter(m => m.result !== 'lost');
/* Choix court (meme regle que la carte du site, choixCourt dans app.js) : « +1.5 »,
   « Inter +1.5 », nom de l'equipe gagnante, « 1X », « 2 ekip make », jamais de cote. */
function choixCourt(pick, home, away) {
  const p = String(pick || '').trim(); let m;
  if ((m = p.match(/^Score exact\s*:\s*(\d+)\s*[:\-]\s*(\d+)/i))) return m[1] + ' - ' + m[2];
  if (/^Victoire\s*:\s*(Home|1)$/i.test(p)) return home;
  if (/^Victoire\s*:\s*(Away|2)$/i.test(p)) return away;
  if ((m = p.match(/^Double chance\s*:\s*(\S+)/i))) return m[1].toUpperCase();
  if (/deux .quipes marquent\s*:\s*Oui/i.test(p)) return '2 ekip make';
  if (/deux .quipes marquent\s*:\s*Non/i.test(p)) return '2 ekip pa make';
  const sens = x => /^plus/i.test(x) ? '+' : '-';
  if ((m = p.match(/^Domicile\s*:\s*(Plus|Moins) de ([\d.,]+)/i))) return home + ' ' + sens(m[1]) + m[2];
  if ((m = p.match(/^Ext.rieur\s*:\s*(Plus|Moins) de ([\d.,]+)/i))) return away + ' ' + sens(m[1]) + m[2];
  if ((m = p.match(/^(Plus|Moins) de ([\d.,]+)/i))) return sens(m[1]) + m[2];
  return p;
}
async function imageScores(rp, jour) {
  const { rendrePng } = require('./lib/image-fiche');
  return rendrePng({ date: R.dateCourte(jour), gagnes: rp.gagnes, total: rp.total, taux: rp.taux },
    (rp.matchs || []).map(m => {
      const parts = String(m.match_label || '').split(/\s+[—–-]\s+/);
      const h = parts[0] || '', a = parts[1] || '';
      let choix = choixCourt(m.pick || m.choix, h, a);
      if (choix.length > 14) choix = choixCourt(m.pick || m.choix, h.split(' ')[0], a.split(' ')[0]);   // « ARGENTINOS »
      return { home: h, away: a, choix, result: m.result };
    }), 'scores');
}
/* 09/11 : canal public = format de la carte du landing, TOUS les matchs (sans la mention « sans score exact »). */
async function imagePublic(rp, jour) {
  const { rendrePng } = require('./lib/image-fiche');
  const s = new Set((rp.matchs || []).map(m => (m.sport === 'basket' || m.sport === 'nba') ? 'b' : 'f'));
  const sports = s.size === 1 ? (s.has('b') ? 'BASKETBÒL' : 'FOUTBÒL') : 'FOUTBÒL + BASKETBÒL';
  return rendrePng({ date: R.dateCourte(jour), gagnes: rp.gagnes, total: rp.total, taux: rp.taux, sports },
    (rp.matchs || []).map(m => ({ match_label: m.match_label, pick: m.choix, odd: m.odd, result: m.result })), 'public');
}
async function image(rp, jour) {
  const { rendrePng } = require('./lib/image-fiche');
  const g = gagnesSeuls(rp);
  const png = await rendrePng({ type: sports(rp), date: R.dateCourte(jour), gagnes: rp.gagnes, total: rp.total, taux: rp.taux,
    reste: Math.max(0, rp.gagnes - Math.min(MAX_LIGNES_IMAGE, g.length)) },
    g.slice(0, MAX_LIGNES_IMAGE).map(m => ({ match_label: m.match_label, league: m.league, league_country: m.league_country, pick: m.choix, odd: m.odd, result: 'won' })),
    'rapport');
  return png;
}

async function journaliser(cfg, contexte, message) {
  try {
    await fetchDelai(`${cfg.url}/rest/v1/error_log`, {
      method: 'POST', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
      body: JSON.stringify({ context: contexte, message: String(message).slice(0, 500) })
    });
  } catch (_) { /* jamais bloquant */ }
}

/* Destination Telegram de chaque portee : complet -> canal public ; pN -> groupe VIP qui
   recoit les fiches du rang N (avec 3 groupes seulement, le groupe 3 recoit le rang 4). */
function destinations(cfg) {
  const d = {};
  if (cfg.public) d.complet = cfg.public;
  Object.keys(cfg.groupes).map(Number).forEach(g => { d['p' + R.plafondGroupe(g, cfg.groupes)] = cfg.groupes[g]; });
  return d;
}

async function passage(cfg, fetchEnvoi, dormir, maintenant) {
  if (!cfg.url || !cfg.cle) return { statut: 'config_supabase_incomplete' };
  const now = maintenant || Date.now();
  const jours = [];
  for (let i = 0; i < JOURS; i++) jours.push(R.dateHaiti(new Date(now - i * 864e5)));
  const r = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=id,sport,min_plan_rank,total_odd,play_date` +
    `&published=eq.true&play_date=in.(${jours.join(',')})&limit=500`, { headers: entetes(cfg.cle) });
  if (!r.ok) throw new Error(`lecture fiches HTTP ${r.status}`);
  const tickets = await r.json();
  const bilan = { jours: {}, envoyes: 0, erreurs: [] };
  const dest = destinations(cfg);
  for (const jour of jours) {
    const tj = tickets.filter(t => t.play_date === jour);
    if (!tj.length) continue;
    const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=ticket_id,fixture_id,match_label,market,pick,odd,result,league,league_country,kickoff_at` +
      `&ticket_id=in.(${tj.map(t => t.id).join(',')})&limit=2000`, { headers: entetes(cfg.cle) });
    if (!rl.ok) throw new Error(`lecture selections HTTP ${rl.status}`);
    const calc = calculerJour(tj, await rl.json());
    if (!calc) { bilan.jours[jour] = 'pas_termine'; continue; }
    // Enregistre (ou met a jour) les chiffres ; les colonnes Telegram ne sont jamais ecrasees ici.
    const lignes = Object.entries(calc).map(([portee, rp]) => ({ play_date: jour, portee, total: rp.total, gagnes: rp.gagnes,
      taux: rp.taux, publie: rp.publie, matchs: rp.matchs, calcule_at: new Date(now).toISOString() }));
    const up = await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?on_conflict=play_date,portee`, {
      method: 'POST', headers: entetes(cfg.cle, { Prefer: 'resolution=merge-duplicates,return=minimal' }), body: JSON.stringify(lignes)
    });
    if (!up.ok) throw new Error(`enregistrement rapports HTTP ${up.status}`);
    bilan.jours[jour] = Object.fromEntries(Object.entries(calc).map(([k, v]) => [k, `${v.gagnes}/${v.total}`]));
    if (!cfg.token) continue;
    for (const [portee, rp] of Object.entries(calc)) {
      const chat = dest[portee];
      if (!chat || !rp.publie) continue;
      // Reservation (une seule fois) : seulement si aucun envoi n'est deja fait ou en cours.
      const res = await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?play_date=eq.${jour}&portee=eq.${portee}&publie=eq.true&retroactif=eq.false&telegram_statut=is.null`, {
        method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=representation' }), body: JSON.stringify({ telegram_statut: 'envoi' })
      });
      if (!res.ok) throw new Error(`reservation HTTP ${res.status}`);
      if (!(await res.json()).length) continue;
      const pub = portee === 'complet';
      let img = null;
      try { img = { png: await (pub ? imagePublic(rp, jour) : image(rp, jour)), legende: legende(rp, jour, pub) }; } catch (e) { await journaliser(cfg, 'rapport_jour_image', e.message); }
      let out;
      try { out = await fetchEnvoi(cfg.token, chat, texte(rp, jour, pub), null, img); }
      catch (e) { out = { ok: false, description: 'reseau: ' + e.message }; }
      await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?play_date=eq.${jour}&portee=eq.${portee}`, {
        method: 'PATCH', headers: entetes(cfg.cle, { Prefer: 'return=minimal' }),
        body: JSON.stringify(out.ok ? { telegram_statut: 'envoye', telegram_message_id: out.messageId || null, telegram_at: new Date().toISOString() }
          : { telegram_statut: null })
      }).catch(() => {});
      if (out.ok) { bilan.envoyes++; await dormir(PAUSE_MS); }
      else { bilan.erreurs.push(`${jour} ${portee}: HTTP ${out.status || '?'} ${out.description || ''}`); if (out.retryAfter) break; }
    }
  }
  if (bilan.erreurs.length) await journaliser(cfg, 'rapport_jour_envoi', bilan.erreurs.slice(0, 5).join(' | '));
  return bilan;
}

/* RATTRAPAGE (07/11, demande de l'utilisateur) : rapports des jours PASSES (avant la fenetre de
   3 jours), enregistres avec retroactif = true. Visibles SEULEMENT dans l'historique admin :
   jamais sur le landing, jamais chez les abonnes (RLS), jamais envoyes sur Telegram.
   Ne recalcule que les jours qui n'ont pas encore de rapport. */
async function rattrapage(cfg, maintenant) {
  const now = maintenant || Date.now();
  const debut = R.dateHaiti(new Date(now - RATTRAPAGE_JOURS * 864e5));
  const fin = R.dateHaiti(new Date(now - (JOURS - 1) * 864e5));    // exclu (et apres) : la fenetre normale s'en occupe
  const rt = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=play_date&published=eq.true&play_date=gte.${debut}&play_date=lte.${fin}&limit=10000`, { headers: entetes(cfg.cle) });
  if (!rt.ok) throw new Error(`rattrapage fiches HTTP ${rt.status}`);
  const joursFiches = [...new Set((await rt.json()).map(x => x.play_date))].filter(j => j < fin);
  if (!joursFiches.length) return { faits: 0, restants: 0 };
  const re = await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?select=play_date&portee=eq.complet&play_date=gte.${debut}&limit=10000`, { headers: entetes(cfg.cle) });
  if (!re.ok) throw new Error(`rattrapage rapports HTTP ${re.status}`);
  const deja = new Set((await re.json()).map(x => x.play_date));
  const manquants = joursFiches.filter(j => !deja.has(j)).sort().reverse();
  const lot = manquants.slice(0, RATTRAPAGE_MAX_PAR_PASSAGE);
  let faits = 0;
  for (let i = 0; i < lot.length; i += 10) {
    const dates = lot.slice(i, i + 10);
    const r = await fetchDelai(`${cfg.url}/rest/v1/tickets?select=id,sport,min_plan_rank,total_odd,play_date&published=eq.true&play_date=in.(${dates.join(',')})&limit=1000`, { headers: entetes(cfg.cle) });
    if (!r.ok) throw new Error(`rattrapage lot HTTP ${r.status}`);
    const tickets = await r.json();
    const legs = [];
    for (let k = 0; k < tickets.length; k += 40) {
      const ids = tickets.slice(k, k + 40).map(t => t.id).join(',');
      const rl = await fetchDelai(`${cfg.url}/rest/v1/ticket_legs?select=ticket_id,fixture_id,match_label,market,pick,odd,result,league,league_country,kickoff_at&ticket_id=in.(${ids})&limit=2000`, { headers: entetes(cfg.cle) });
      if (!rl.ok) throw new Error(`rattrapage selections HTTP ${rl.status}`);
      legs.push(...await rl.json());
    }
    const lignes = [];
    for (const jour of dates) {
      const tj = tickets.filter(t => t.play_date === jour);
      const ids = new Set(tj.map(t => t.id));
      const calc = calculerJour(tj, legs.filter(l => ids.has(l.ticket_id)));
      if (!calc) continue;
      Object.entries(calc).forEach(([portee, rp]) => lignes.push({ play_date: jour, portee, total: rp.total, gagnes: rp.gagnes,
        taux: rp.taux, publie: rp.publie, matchs: rp.matchs, retroactif: true, calcule_at: new Date(now).toISOString() }));
      faits++;
    }
    if (lignes.length) {
      // ignore-duplicates : un rapport deja existant n'est JAMAIS ecrase par le rattrapage.
      const up = await fetchDelai(`${cfg.url}/rest/v1/rapports_jour?on_conflict=play_date,portee`, {
        method: 'POST', headers: entetes(cfg.cle, { Prefer: 'resolution=ignore-duplicates,return=minimal' }), body: JSON.stringify(lignes)
      });
      if (!up.ok) throw new Error(`rattrapage enregistrement HTTP ${up.status}`);
    }
  }
  return { faits, restants: Math.max(0, manquants.length - lot.length) };
}

async function handler() {
  const cfg = lireConfig();
  try {
    const out = await passage(cfg, R.envoyerTelegram, ms => new Promise(r => setTimeout(r, ms)));
    // Rattrapage des jours passes : un incident ici n'empeche jamais le rapport du jour (deja fait).
    try { out.rattrapage = await rattrapage(cfg); } catch (e) { await journaliser(cfg, 'rapport_jour_rattrapage', e.message); }
    console.log('[RAPPORT-JOUR]', JSON.stringify(out));
    return { statusCode: 200, body: JSON.stringify(out) };
  } catch (e) {
    console.log('[RAPPORT-JOUR] erreur:', e.message);
    await journaliser(cfg, 'rapport_jour', e.message);
    return { statusCode: 200, body: 'erreur journalisee' };
  }
}

module.exports.handler = handler;
module.exports.config = config;
module.exports.__test = { imagePublic, rattrapage, calculerJour, visiblePourRang, destinations, lireConfig, texte, legende, image, imageScores, choixCourt, passage };
