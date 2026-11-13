/* ============================================================
   VIP BETCOTE — Image d'une fiche pour Telegram (16/10)
   ------------------------------------------------------------
   Modele SVG (police Inter) converti en PNG par resvg (WebAssembly,
   integre au projet : aucune installation, aucune dependance native).
   Deux modes :
     'fiche'    : fiche publiee dans les groupes VIP (heure de chaque match)
     'gagnante' : fiche gagnee postee sur le canal public (✓ / ✗ PAR MATCH :
                  une fiche score exact gagnee avec un seul bon score garde
                  ses vrais resultats — jamais de faux resultat)
   Aucune mention de « bot », aucun code interne de fiche.
   En cas d'echec, l'appelant envoie le message texte habituel.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const RACINES = [
  process.env.LAMBDA_TASK_ROOT, process.cwd(), path.join(__dirname, '..', '..', '..'), path.join(__dirname, '..', '..'), __dirname
].filter(Boolean);
function trouver(rel) {
  const candidats = [];
  RACINES.forEach(r => {
    candidats.push(path.join(r, 'netlify', 'functions', 'lib', rel));
    candidats.push(path.join(r, 'lib', rel));
    candidats.push(path.join(r, rel));
  });
  for (const c of candidats) { try { if (fs.existsSync(c)) return c; } catch (_) { /* suivant */ } }
  throw new Error('fichier introuvable : ' + rel);
}

let pret = null;
function moteur() {
  if (!pret) {
    pret = (async () => {
      const R = require('./resvg/index.js');
      await R.initWasm(fs.readFileSync(trouver('resvg/index_bg.wasm')));
      const polices = ['Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold']
        .map(p => new Uint8Array(fs.readFileSync(trouver('fonts/Inter-' + p + '.otf'))));
      return { Resvg: R.Resvg, polices };
    })().catch(e => { pret = null; throw e; });
  }
  return pret;
}

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const coupe = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

const W = 1080;
const VERT = '#2ED47F', OR = '#E8CE8A', ROUGE = '#F0735E', BLANC = '#F4F3ED', GRIS = '#8F9BB0';

// Logo VIPBETCOTE sans fond (18/10) : meme dessin que assets/logo-vipbetcote.svg,
// ramene a 64 px de large et centre dans l'ancien emplacement 64x64.
// 21/10 : toujours le vert WhatsApp (#25D366), y compris sur la carte « fiche gagnee ».
const LOGO_SVG = '<mask id="mLogo"><rect x="0" y="0" width="1254" height="1254" fill="#fff"/><g fill="#000"><rect x="673" y="450" width="34" height="200"/><rect x="627" y="706" width="210" height="34"/><rect x="547" y="670" width="34" height="200"/><rect x="417" y="580" width="200" height="34"/></g></mask><circle cx="627" cy="660" r="154" fill="none" stroke="#17A860" stroke-width="92" mask="url(#mLogo)"/><g fill="#17A860"><rect x="75" y="284" width="1104" height="92"/><rect x="75" y="945" width="1104" height="92"/><rect x="75" y="284" width="92" height="753"/><rect x="1087" y="284" width="92" height="753"/><rect x="75" y="440" width="276" height="92"/><rect x="75" y="788" width="276" height="92"/><rect x="259" y="440" width="92" height="440"/><rect x="903" y="440" width="276" height="92"/><rect x="903" y="788" width="276" height="92"/><rect x="903" y="440" width="92" height="440"/><rect x="581" y="284" width="92" height="76"/><rect x="581" y="960" width="92" height="77"/><rect x="581" y="394" width="92" height="158"/><rect x="581" y="768" width="92" height="158"/><rect x="361" y="614" width="158" height="92"/><rect x="735" y="614" width="158" height="92"/><circle cx="627" cy="660" r="74"/></g>';
function logo(x, y, couleur = '#25D366') {
  const k = 64 / 1104, dy = (64 - 753 * k) / 2;
  return `<g transform="translate(${x},${y + dy}) scale(${k}) translate(-75,-284)">${LOGO_SVG.split('#17A860').join(couleur)}</g>`;
}

function marque(res, cx, cy) {
  if (res === 'lost') return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(240,115,94,.16)" stroke="rgba(240,115,94,.5)" stroke-width="2"/>
    <path d="M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8} M${cx + 8} ${cy - 8} L${cx - 8} ${cy + 8}" stroke="${ROUGE}" stroke-width="4" stroke-linecap="round"/>`;
  if (res === 'void') return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(143,155,176,.14)" stroke="rgba(143,155,176,.4)" stroke-width="2"/>
    <path d="M${cx - 8} ${cy} L${cx + 8} ${cy}" stroke="${GRIS}" stroke-width="4" stroke-linecap="round"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(46,212,127,.16)" stroke="rgba(46,212,127,.5)" stroke-width="2"/>
    <path d="M${cx - 9} ${cy + 1} L${cx - 3} ${cy + 7} L${cx + 10} ${cy - 7}" fill="none" stroke="${VERT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* Confettis fixes (positions deterministes : meme image a chaque rendu). */
function confettis(largeur, yMax) {
  const couleurs = [OR, VERT, '#FFFFFF', '#FFE08A', '#7FF0B5'];
  let out = '';
  for (let i = 0; i < 46; i++) {
    const x = (i * 211 + 37) % largeur, y = 30 + ((i * 97 + 13) % yMax);
    if (x > 180 && x < largeur - 180 && y > 150 && y < 520) continue;   // jamais sur le trophee ni le titre
    const r = (i * 53) % 180, c = couleurs[i % couleurs.length], o = 0.35 + ((i * 7) % 5) / 10;
    out += i % 3 === 0
      ? `<circle cx="${x}" cy="${y}" r="${4 + (i % 4)}" fill="${c}" opacity="${o}"/>`
      : `<rect x="${x}" y="${y}" width="${8 + (i % 5) * 2}" height="${4 + (i % 3)}" rx="2" fill="${c}" opacity="${o}" transform="rotate(${r} ${x} ${y})"/>`;
  }
  return out;
}

/* Trophee dessine (aucune police emoji necessaire). */
function trophee(cx, cy) {
  return `<g transform="translate(${cx - 60},${cy - 62})">
    <path d="M24 10 H96 V44 C96 70 80 86 60 88 C40 86 24 70 24 44 Z" fill="url(#gTrophee)"/>
    <path d="M24 20 H8 V34 C8 50 18 60 30 62" fill="none" stroke="${OR}" stroke-width="7" stroke-linecap="round"/>
    <path d="M96 20 H112 V34 C112 50 102 60 90 62" fill="none" stroke="${OR}" stroke-width="7" stroke-linecap="round"/>
    <rect x="52" y="86" width="16" height="16" fill="${OR}"/>
    <rect x="34" y="100" width="52" height="14" rx="4" fill="url(#gTrophee)"/>
    <path d="M44 40 L55 51 L77 29" fill="none" stroke="#1A1405" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

/* 17/10 : carte FICHE GAGNEE volontairement tres differente de la carte publiee (fond VERT,
   cadre OR, trophee, confettis, bandeau GAGNEE) : reconnaissable au premier regard dans un groupe. */
function svgGagnante(info, legs) {
  const n = legs.length;
  const H_HAUT = 560, H_LIGNE = 132, H_BAS = 290;
  const H = H_HAUT + n * H_LIGNE + H_BAS;
  const type = esc(info.type || 'FOOTBALL');
  const cote = esc(info.cote || '');
  const lignes = legs.map((l, i) => {
    const y0 = H_HAUT + i * H_LIGNE;
    const ligue = coupe((String(l.league || '') + (l.league_country ? ' (' + l.league_country + ')' : '')).toUpperCase(), 44);
    return `<g>
      <rect x="44" y="${y0 + 8}" width="${W - 88}" height="${H_LIGNE - 16}" rx="22" fill="rgba(4,23,13,.55)" stroke="rgba(46,212,127,.35)" stroke-width="2"/>
      <rect x="44" y="${y0 + 8}" width="10" height="${H_LIGNE - 16}" rx="5" fill="${l.result === 'lost' ? ROUGE : l.result === 'void' ? GRIS : VERT}"/>
      ${marque(l.result, 108, y0 + 66)}
      <text x="172" y="${y0 + 52}" font-size="29" font-weight="700" fill="${BLANC}">${esc(coupe(l.match_label, 40))}</text>
      <text x="172" y="${y0 + 82}" font-size="17" font-weight="600" letter-spacing="1.2" fill="#8FD9AE">${esc(ligue)}</text>
      <text x="172" y="${y0 + 110}" font-size="22" font-weight="500" fill="#D9F5E5">${esc(coupe(l.pick, 46))}</text>
      <text x="${W - 74}" y="${y0 + 74}" text-anchor="end" font-size="36" font-weight="800" fill="${OR}">${Number(l.odd).toFixed(2)}</text>
    </g>`;
  }).join('');
  const yBas = H_HAUT + n * H_LIGNE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter">
  <defs>
    <linearGradient id="gFondG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F6B3A"/><stop offset=".45" stop-color="#0A4527"/><stop offset="1" stop-color="#05200F"/></linearGradient>
    <radialGradient id="gHalo" cx=".5" cy="0" r=".75"><stop offset="0" stop-color="#FFE08A" stop-opacity=".45"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>
    <linearGradient id="gTrophee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#D9A93C"/></linearGradient>
    <linearGradient id="gLogo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25D366"/><stop offset="1" stop-color="#25D366"/></linearGradient>
    <linearGradient id="gCote" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#E2B54E"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gFondG)"/>
  <rect width="${W}" height="${H}" fill="url(#gHalo)"/>
  ${confettis(W, 470)}
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="40" fill="none" stroke="${OR}" stroke-width="6"/>
  ${logo(48, 50)}
  <text x="130" y="94" font-size="34" font-weight="800" fill="#fff">VIP<tspan fill="${OR}">BETCOTE</tspan></text>
  ${(() => { /* 19/10 : score exact -> « GAGNÉE 1/3 » (bons scores / matchs), badge elargi */
    const fr = info.fraction ? ' ' + esc(info.fraction) : '';
    const lb = fr ? 312 : 232, x0 = W - 48 - lb;
    return `<rect x="${x0}" y="52" width="${lb}" height="60" rx="30" fill="${VERT}"/>
  <path d="M${x0 + 32} 82 L${x0 + 42} 92 L${x0 + 60} 72" fill="none" stroke="#06140C" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${x0 + 70 + (lb - 82) / 2}" y="93" text-anchor="middle" font-size="27" font-weight="800" fill="#06140C">GAGNÉE${fr}</text>`;
  })()}
  ${trophee(W / 2, 242)}
  <text x="${W / 2}" y="392" text-anchor="middle" font-size="78" font-weight="800" fill="#FFFFFF" letter-spacing="1">FICHE GAGNÉE</text>
  <text x="${W / 2}" y="446" text-anchor="middle" font-size="30" font-weight="700" fill="${OR}" letter-spacing="3">${type}${cote ? ' · COTE ' + cote : ''}${info.date ? ' · ' + esc(info.date) : ''}</text>
  <text x="${W / 2}" y="494" text-anchor="middle" font-size="22" font-weight="500" fill="#BDEFD3">${esc(info.sousTitre || '')}</text>
  ${lignes}
  <line x1="44" y1="${yBas + 24}" x2="${W - 44}" y2="${yBas + 24}" stroke="rgba(232,206,138,.35)" stroke-width="2"/>
  <text x="44" y="${yBas + 80}" font-size="20" font-weight="700" letter-spacing="4" fill="#BDEFD3">COTE TOTALE GAGNÉE</text>
  <text x="44" y="${yBas + 168}" font-size="100" font-weight="800" fill="url(#gCote)">${cote || '—'}</text>
  <rect x="${W - 424}" y="${yBas + 96}" width="380" height="76" rx="22" fill="${OR}"/>
  <text x="${W - 234}" y="${yBas + 144}" text-anchor="middle" font-size="28" font-weight="800" fill="#1A1405">vipbetcote.com</text>
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-size="19" font-weight="500" fill="#8FD9AE">Jeu responsable, 18+. Jouez avec contrôle.</text>
</svg>`;
}

/* legs : [{match_label, league, league_country, pick (deja lisible), odd, heure, result}] */
/* 07/11 : carte « RAPPORT DU JOUR » (meme univers vert/or que la fiche gagnee) : pourcentage en
   grand, X/Y pronostics reussis, quelques matchs gagnes. info : {type, date, gagnes, total, taux, reste}. */
function svgRapport(info, legs) {
  const n = legs.length;
  const H_HAUT = 640, H_LIGNE = 118, H_BAS = 250;
  const H = H_HAUT + n * H_LIGNE + (info.reste > 0 ? 50 : 0) + H_BAS;
  const pct = Math.round(Number(info.taux) || 0);
  const frac = esc((info.gagnes || 0) + '/' + (info.total || 0));
  const lignes = legs.map((l, i) => {
    const y0 = H_HAUT + i * H_LIGNE;
    return `<g>
      <rect x="44" y="${y0 + 8}" width="${W - 88}" height="${H_LIGNE - 16}" rx="22" fill="rgba(4,23,13,.55)" stroke="rgba(46,212,127,.35)" stroke-width="2"/>
      <rect x="44" y="${y0 + 8}" width="10" height="${H_LIGNE - 16}" rx="5" fill="${VERT}"/>
      ${marque('won', 108, y0 + 59)}
      <text x="172" y="${y0 + 54}" font-size="28" font-weight="700" fill="${BLANC}">${esc(coupe(l.match_label, 40))}</text>
      <text x="172" y="${y0 + 90}" font-size="22" font-weight="500" fill="#D9F5E5">${esc(coupe(l.pick, 46))}</text>
      ${l.odd ? `<text x="${W - 74}" y="${y0 + 70}" text-anchor="end" font-size="34" font-weight="800" fill="${OR}">${Number(l.odd).toFixed(2)}</text>` : ''}
    </g>`;
  }).join('');
  let yBas = H_HAUT + n * H_LIGNE;
  const reste = info.reste > 0 ? `<text x="${W / 2}" y="${yBas + 34}" text-anchor="middle" font-size="24" font-weight="600" fill="#BDEFD3">+${esc(info.reste)} autres pronostics réussis</text>` : '';
  if (info.reste > 0) yBas += 50;
  const barre = Math.max(0, Math.min(100, Number(info.taux) || 0)) / 100 * (W - 88);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter">
  <defs>
    <linearGradient id="gFondR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0F6B3A"/><stop offset=".45" stop-color="#0A4527"/><stop offset="1" stop-color="#05200F"/></linearGradient>
    <radialGradient id="gHaloR" cx=".5" cy="0" r=".75"><stop offset="0" stop-color="#FFE08A" stop-opacity=".40"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>
    <linearGradient id="gTrophee" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#D9A93C"/></linearGradient>
    <linearGradient id="gCoteR" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#E2B54E"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gFondR)"/>
  <rect width="${W}" height="${H}" fill="url(#gHaloR)"/>
  ${confettis(W, 420)}
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="40" fill="none" stroke="${OR}" stroke-width="6"/>
  ${logo(48, 50)}
  <text x="130" y="94" font-size="34" font-weight="800" fill="#fff">VIP<tspan fill="${OR}">BETCOTE</tspan></text>
  <rect x="${W - 48 - 300}" y="52" width="300" height="60" rx="30" fill="${OR}"/>
  <text x="${W - 48 - 150}" y="93" text-anchor="middle" font-size="26" font-weight="800" fill="#1A1405">RAPPORT DU JOUR</text>
  <text x="${W / 2}" y="214" text-anchor="middle" font-size="64" font-weight="800" fill="#FFFFFF" letter-spacing="1">PRONOSTICS RÉUSSIS</text>
  <text x="${W / 2}" y="268" text-anchor="middle" font-size="28" font-weight="700" fill="${OR}" letter-spacing="3">${esc(info.type || '')}${info.date ? ' · ' + esc(info.date) : ''}</text>
  <text x="${W / 2}" y="440" text-anchor="middle" font-size="170" font-weight="800" fill="url(#gCoteR)">${pct} %</text>
  <text x="${W / 2}" y="510" text-anchor="middle" font-size="40" font-weight="700" fill="#FFFFFF">${frac} pronostics réussis</text>
  <rect x="44" y="548" width="${W - 88}" height="18" rx="9" fill="rgba(255,255,255,.14)"/>
  <rect x="44" y="548" width="${barre}" height="18" rx="9" fill="${VERT}"/>
  <text x="${W / 2}" y="606" text-anchor="middle" font-size="22" font-weight="500" fill="#BDEFD3">Football et basketball, sans score exact — résultats réels</text>
  ${lignes}
  ${reste}
  <line x1="44" y1="${yBas + 24}" x2="${W - 44}" y2="${yBas + 24}" stroke="rgba(232,206,138,.35)" stroke-width="2"/>
  <rect x="${W / 2 - 190}" y="${yBas + 66}" width="380" height="76" rx="22" fill="${OR}"/>
  <text x="${W / 2}" y="${yBas + 114}" text-anchor="middle" font-size="28" font-weight="800" fill="#1A1405">vipbetcote.com</text>
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-size="19" font-weight="500" fill="#8FD9AE">Jeu responsable, 18+. Jouez avec contrôle.</text>
</svg>`;
}

/* 07/11 : canal public — rapport du jour au format « FULL PREDICTION SCORES » (modele fourni
   par l'utilisateur) : fond clair, bandes bleu nuit / vert, une ligne par match
   (equipe A | choix court | equipe B), ✓ vert si reussi, ✗ rouge si perdu.
   Jamais de cote. 09/11 : logo en haut et lien vipbetcote.com en bas (demande de l'utilisateur).
   legs : [{home, away, choix, result}] */
function svgScores(info, legs) {
  const NAVY = '#0B1F6B', BLEU = '#1636C8', VERDURE = '#25D366', CORAIL = '#F0735E';
  const n = Math.max(1, legs.length), HL = 150, GAP = 18, Y0 = 680;
  const H = Y0 + n * (HL + GAP) + 230;
  const X = 60, LW = W - 120, CW = Math.round(LW * 0.32), SW = Math.round((LW - CW) / 2);
  // Taille de police qui tient dans une largeur (estimation : Inter gras ~0,62 em par caractere)
  const taille = (txt, max, base) => Math.max(18, Math.min(base, Math.floor(max / (Math.max(1, String(txt).length) * 0.62))));
  const equipe = (txt, cx, cy) => {
    const t = String(txt || '').toUpperCase();
    const mots = t.split(/\s+/);
    if (t.length > 16 && mots.length > 1) {
      const k = Math.ceil(mots.length / 2), l1 = mots.slice(0, k).join(' '), l2 = mots.slice(k).join(' ');
      const f = taille(l1.length > l2.length ? l1 : l2, SW - 40, 34);
      return `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="${f}" font-weight="800" fill="${NAVY}">${esc(coupe(l1, 22))}</text>
        <text x="${cx}" y="${cy + f + 2}" text-anchor="middle" font-size="${f}" font-weight="800" fill="${NAVY}">${esc(coupe(l2, 22))}</text>`;
    }
    const f = taille(t, SW - 40, 36);
    return `<text x="${cx}" y="${cy + f * 0.36}" text-anchor="middle" font-size="${f}" font-weight="800" fill="${NAVY}">${esc(coupe(t, 26))}</text>`;
  };
  const lignes = legs.map((l, i) => {
    const y = Y0 + i * (HL + GAP), cy = y + HL / 2, perdu = l.result === 'lost';
    const choix = String(l.choix || '').toUpperCase(), fc = taille(choix, CW - 40, 52);
    return `<g>
      <rect x="${X}" y="${y + 6}" width="${LW}" height="${HL}" rx="26" fill="rgba(11,31,107,.10)"/>
      <rect x="${X}" y="${y}" width="${LW}" height="${HL}" rx="26" fill="#FFFFFF"/>
      <rect x="${X + SW}" y="${y}" width="${CW}" height="${HL}" fill="${BLEU}"/>
      ${equipe(l.home, X + SW / 2, cy)}
      ${equipe(l.away, X + SW + CW + SW / 2, cy)}
      <text x="${X + SW + CW / 2}" y="${cy + fc * 0.2}" text-anchor="middle" font-size="${fc}" font-weight="800" fill="#FFFFFF">${esc(coupe(choix, 24))}</text>
      <text x="${X + SW + CW / 2}" y="${cy + fc * 0.2 + 34}" text-anchor="middle" font-size="20" font-weight="800" fill="${VERDURE}">${perdu ? '✗' : '✓'} <tspan fill="#9FC1FF">FULL TIME</tspan></text>
    </g>`;
  }).join('');
  const pct = Math.round(Number(info.taux) || 0);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter">
  <rect width="${W}" height="${H}" fill="#EEF1F7"/>
  <path d="M0 0 L230 0 L0 150 Z" fill="${NAVY}"/><path d="M230 0 L280 0 L0 182 L0 150 Z" fill="${VERDURE}"/>
  <path d="M${W} ${H} L${W - 230} ${H} L${W} ${H - 150} Z" fill="${NAVY}"/><path d="M${W - 230} ${H} L${W - 280} ${H} L${W} ${H - 182} L${W} ${H - 150} Z" fill="${VERDURE}"/>
  <g transform="translate(${W / 2 - 96},70) scale(3)">${logo(0, 0)}</g>
  <text x="${W / 2}" y="370" text-anchor="middle" font-size="112" font-weight="800" fill="${NAVY}" letter-spacing="-2">FULL PREDICTION</text>
  <text x="${W / 2}" y="510" text-anchor="middle" font-size="150" font-weight="800" fill="${NAVY}" letter-spacing="-2">SCORES</text>
  <text x="${W / 2}" y="590" text-anchor="middle" font-size="38" font-weight="800" fill="#3B4A7A">${esc(String(info.date || '').toUpperCase())}  ·  ${esc(info.gagnes)}/${esc(info.total)} ✓  ·  ${pct} %</text>
  ${lignes}
  <rect x="${W / 2 - 230}" y="${H - 190}" width="460" height="92" rx="30" fill="${NAVY}"/>
  <text x="${W / 2}" y="${H - 130}" text-anchor="middle" font-size="42" font-weight="800" fill="#FFFFFF">vipbetcote.com</text>
</svg>`;
}

/* 09/11 : canal public — rapport du jour au format de la carte du landing (« RAPÒ JOUNEN AN »,
   demande de l'utilisateur) : fond vert, cadre or, gros pourcentage, TOUS les matchs (✓ reussi,
   ✗ ROUGE si perdu), cote de chaque match, logo + vipbetcote.com.
   info : {date, gagnes, total, taux, sports} ; legs : [{match_label, pick, odd, result}] */
function svgRapportPublic(info, legs) {
  const n = Math.max(1, legs.length), Y0 = 640, HL = 128, GAP = 14;
  const H = Y0 + n * (HL + GAP) + 300;
  const pct = Math.round(Number(info.taux) || 0);
  const barre = Math.max(0, Math.min(100, Number(info.taux) || 0)) / 100 * (W - 120);
  const lignes = legs.map((l, i) => {
    const y = Y0 + i * (HL + GAP), cy = y + HL / 2, perdu = l.result === 'lost';
    return `<g>
      <rect x="60" y="${y}" width="${W - 120}" height="${HL}" rx="26" fill="rgba(3,20,11,.55)" stroke="${perdu ? 'rgba(240,115,94,.35)' : 'rgba(46,212,127,.28)'}" stroke-width="2"/>
      <rect x="60" y="${y}" width="9" height="${HL}" rx="4" fill="${perdu ? ROUGE : VERT}"/>
      <circle cx="128" cy="${cy}" r="25" fill="none" stroke="${perdu ? ROUGE : VERT}" stroke-width="4"/>
      ${perdu ? `<path d="M${118} ${cy - 10} L${138} ${cy + 10} M${138} ${cy - 10} L${118} ${cy + 10}" stroke="${ROUGE}" stroke-width="5" stroke-linecap="round"/>`
              : `<path d="M${116} ${cy + 1} L${125} ${cy + 10} L${141} ${cy - 9}" fill="none" stroke="${VERT}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`}
      <text x="178" y="${cy - 8}" font-size="36" font-weight="700" fill="${perdu ? 'rgba(244,243,237,.75)' : BLANC}">${esc(coupe(l.match_label, 34))}</text>
      <text x="178" y="${cy + 34}" font-size="27" font-weight="500" fill="#9FB8A8">${esc(coupe(l.pick, 42))}</text>
      ${Number(l.odd) > 1 ? `<text x="${W - 92}" y="${cy + 14}" text-anchor="end" font-size="40" font-weight="800" fill="${perdu ? 'rgba(232,206,138,.5)' : OR}">${Number(l.odd).toFixed(2)}</text>` : ''}
    </g>`;
  }).join('');
  const yBas = Y0 + n * (HL + GAP) + 20;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter">
  <defs>
    <radialGradient id="gHaloP" cx=".5" cy="0" r=".7"><stop offset="0" stop-color="#6EAA64" stop-opacity=".55"/><stop offset="1" stop-color="#6EAA64" stop-opacity="0"/></radialGradient>
    <linearGradient id="gFondP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E5A33"/><stop offset=".7" stop-color="#0B2A18"/><stop offset="1" stop-color="#06200F"/></linearGradient>
    <linearGradient id="gOrP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE6A3"/><stop offset="1" stop-color="#D9B766"/></linearGradient>
    <linearGradient id="gGrosP" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#D9B766"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gFondP)"/>
  <rect width="${W}" height="${H}" fill="url(#gHaloP)"/>
  <rect x="16" y="16" width="${W - 32}" height="${H - 32}" rx="44" fill="none" stroke="rgba(232,206,138,.75)" stroke-width="5"/>
  ${logo(60, 58)}
  <text x="140" y="104" font-size="44" font-weight="800" fill="#fff">VIP<tspan fill="${OR}">BETCOTE</tspan></text>
  <rect x="${W - 60 - 290}" y="54" width="290" height="70" rx="35" fill="url(#gOrP)"/>
  <text x="${W - 60 - 145}" y="100" text-anchor="middle" font-size="30" font-weight="800" fill="#2A1C00" letter-spacing="1">RAPÒ JOU A</text>
  <text x="${W / 2}" y="250" text-anchor="middle" font-size="78" font-weight="800" fill="#FFFFFF">RAPÒ JOUNEN AN</text>
  <text x="${W / 2}" y="310" text-anchor="middle" font-size="30" font-weight="700" fill="${OR}" letter-spacing="5">${esc(info.sports || '')}${info.date ? ' · ' + esc(info.date) : ''}</text>
  <text x="60" y="490" font-size="170" font-weight="800" fill="${VERT}" letter-spacing="-4">${pct} %</text>
  <text x="${pct >= 100 ? 560 : 500}" y="480" font-size="40" font-weight="600" fill="#C5D0DC">${esc(info.gagnes)}/${esc(info.total)} pwonostik reyisi</text>
  <rect x="60" y="540" width="${W - 120}" height="18" rx="9" fill="rgba(244,243,237,.12)"/>
  <rect x="60" y="540" width="${barre}" height="18" rx="9" fill="${VERT}"/>
  ${lignes}
  <line x1="60" y1="${yBas}" x2="${W - 60}" y2="${yBas}" stroke="rgba(232,206,138,.35)" stroke-width="2"/>
  <rect x="60" y="${yBas + 50}" width="430" height="88" rx="28" fill="url(#gOrP)"/>
  <text x="275" y="${yBas + 107}" text-anchor="middle" font-size="40" font-weight="800" fill="#1A1405">vipbetcote.com</text>
  <text x="${W - 60}" y="${yBas + 140}" text-anchor="end" font-size="130" font-weight="800" fill="url(#gGrosP)">${esc(info.gagnes)}/${esc(info.total)}</text>
  <text x="${W / 2}" y="${H - 44}" text-anchor="middle" font-size="22" font-weight="500" fill="#8FD9AE">18+ · Jwe ak kontwòl</text>
</svg>`;
}

function svgFiche(info, legs, mode) {
  if (mode === 'public') return svgRapportPublic(info, legs);
  if (mode === 'scores') return svgScores(info, legs);
  if (mode === 'rapport') return svgRapport(info, legs);
  if (mode === 'gagnante') return svgGagnante(info, legs);
  const gagnante = false;
  const n = legs.length;
  const H_HAUT = gagnante ? 360 : 300, H_LIGNE = 132, H_BAS = 300;
  const H = H_HAUT + n * H_LIGNE + H_BAS;
  const type = esc(info.type || 'FOOTBALL');
  const cote = esc(info.cote || '');
  let y = H_HAUT;
  const lignes = legs.map((l, i) => {
    const y0 = y + i * H_LIGNE;
    const ligue = coupe((String(l.league || '') + (l.league_country ? ' (' + l.league_country + ')' : '')).toUpperCase(), 44);
    const gauche = gagnante
      ? marque(l.result, 104, y0 + 58)
      : `<rect x="62" y="${y0 + 32}" width="86" height="52" rx="12" fill="rgba(232,206,138,.10)" stroke="rgba(232,206,138,.28)"/>
         <text x="105" y="${y0 + 66}" text-anchor="middle" font-size="22" font-weight="700" fill="${OR}">${esc(l.heure || '—')}</text>`;
    return `<g>
      <rect x="40" y="${y0 + 8}" width="${W - 80}" height="${H_LIGNE - 16}" rx="22" fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.07)"/>
      ${gauche}
      <text x="172" y="${y0 + 50}" font-size="29" font-weight="700" fill="${BLANC}">${esc(coupe(l.match_label, 40))}</text>
      <text x="172" y="${y0 + 80}" font-size="17" font-weight="600" letter-spacing="1.2" fill="#6F7C92">${esc(ligue)}</text>
      <text x="172" y="${y0 + 108}" font-size="22" font-weight="500" fill="#C9CED8">${esc(coupe(l.pick, 46))}</text>
      <text x="${W - 70}" y="${y0 + 72}" text-anchor="end" font-size="36" font-weight="800" fill="${OR}">${Number(l.odd).toFixed(2)}</text>
    </g>`;
  }).join('');
  const yBas = H_HAUT + n * H_LIGNE;
  const bandeau = gagnante ? `
    <rect x="40" y="200" width="${W - 80}" height="120" rx="26" fill="rgba(46,212,127,.12)" stroke="rgba(46,212,127,.45)" stroke-width="2"/>
    <circle cx="112" cy="260" r="32" fill="${VERT}"/>
    <path d="M97 261 L108 272 L128 250" fill="none" stroke="#06140C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="164" y="250" font-size="40" font-weight="800" fill="${VERT}">FICHE ${type} GAGNÉE</text>
    <text x="164" y="290" font-size="22" font-weight="500" fill="#A8E8C4">${esc(info.sousTitre || '')}</text>` : `
    <text x="40" y="212" font-size="22" font-weight="700" letter-spacing="5" fill="${GRIS}">FICHE DU JOUR${info.date ? ' · ' + esc(info.date) : ''}</text>
    <text x="40" y="266" font-size="48" font-weight="800" fill="#fff">FICHE ${type}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Inter">
  <defs>
    <linearGradient id="gFond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#071022"/><stop offset="1" stop-color="#040811"/></linearGradient>
    <radialGradient id="gOr" cx="1" cy="0" r="0.9"><stop offset="0" stop-color="#C9A44C" stop-opacity=".30"/><stop offset="1" stop-color="#C9A44C" stop-opacity="0"/></radialGradient>
    <radialGradient id="gVert" cx="0" cy="1" r="0.8"><stop offset="0" stop-color="#2ED47F" stop-opacity=".16"/><stop offset="1" stop-color="#2ED47F" stop-opacity="0"/></radialGradient>
    <linearGradient id="gLogo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25D366"/><stop offset="1" stop-color="#25D366"/></linearGradient>
    <linearGradient id="gCote" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF1C9"/><stop offset="1" stop-color="#D9B766"/></linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#gFond)"/>
  <rect width="${W}" height="${H}" fill="url(#gOr)"/>
  <rect width="${W}" height="${H}" fill="url(#gVert)"/>
  ${logo(40, 52)}
  <text x="122" y="96" font-size="34" font-weight="800" fill="#fff">VIP<tspan fill="${OR}">BETCOTE</tspan></text>
  ${cote ? `<rect x="${W - 300}" y="54" width="260" height="60" rx="30" fill="rgba(232,206,138,.12)" stroke="rgba(232,206,138,.45)" stroke-width="2"/>
  <text x="${W - 170}" y="94" text-anchor="middle" font-size="26" font-weight="800" fill="${OR}">COTE ${cote}</text>` : ''}
  ${bandeau}
  ${lignes}
  <line x1="40" y1="${yBas + 24}" x2="${W - 40}" y2="${yBas + 24}" stroke="rgba(255,255,255,.08)" stroke-width="2"/>
  <text x="40" y="${yBas + 78}" font-size="20" font-weight="700" letter-spacing="4" fill="${GRIS}">COTE TOTALE</text>
  <text x="40" y="${yBas + 160}" font-size="92" font-weight="800" fill="url(#gCote)">${cote || '—'}</text>
  ${info.confiance != null && !gagnante ? `<text x="${W - 40}" y="${yBas + 78}" text-anchor="end" font-size="20" font-weight="700" letter-spacing="4" fill="${GRIS}">CONFIANCE</text>
  <text x="${W - 40}" y="${yBas + 150}" text-anchor="end" font-size="64" font-weight="800" fill="${VERT}">${esc(info.confiance)}%</text>` : ''}
  ${gagnante ? `<rect x="${W - 420}" y="${yBas + 92}" width="380" height="74" rx="20" fill="#C9A44C"/>
  <text x="${W - 230}" y="${yBas + 139}" text-anchor="middle" font-size="27" font-weight="800" fill="#1A1405">vipbetcote.com</text>` : ''}
  <text x="${W / 2}" y="${H - 34}" text-anchor="middle" font-size="19" font-weight="500" fill="#6F7C92">vipbetcote.com  ·  Jeu responsable, 18+. Jouez avec contrôle.</text>
</svg>`;
}

async function rendrePng(info, legs, mode) {
  const { Resvg, polices } = await moteur();
  const svg = svgFiche(info, legs, mode);
  const r = new Resvg(svg, { font: { fontBuffers: polices, defaultFontFamily: 'Inter', loadSystemFonts: false }, fitTo: { mode: 'width', value: W } });
  return Buffer.from(r.render().asPng());
}

module.exports = { rendrePng, svgFiche };
