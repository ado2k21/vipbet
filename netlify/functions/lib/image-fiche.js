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

function logo(x, y) {
  return `<g transform="translate(${x},${y})">
    <rect width="64" height="64" rx="16" fill="url(#gLogo)"/>
    <rect x="9" y="17" width="46" height="30" rx="2" fill="none" stroke="#fff" stroke-width="2.6"/>
    <line x1="32" y1="17" x2="32" y2="47" stroke="#fff" stroke-width="2.6"/>
    <circle cx="32" cy="32" r="7" fill="none" stroke="#fff" stroke-width="2.6"/>
    <circle cx="32" cy="32" r="2.4" fill="#fff"/>
    <rect x="9" y="24" width="7" height="16" fill="none" stroke="#fff" stroke-width="2.2"/>
    <rect x="48" y="24" width="7" height="16" fill="none" stroke="#fff" stroke-width="2.2"/>
  </g>`;
}

function marque(res, cx, cy) {
  if (res === 'lost') return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(240,115,94,.16)" stroke="rgba(240,115,94,.5)" stroke-width="2"/>
    <path d="M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8} M${cx + 8} ${cy - 8} L${cx - 8} ${cy + 8}" stroke="${ROUGE}" stroke-width="4" stroke-linecap="round"/>`;
  if (res === 'void') return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(143,155,176,.14)" stroke="rgba(143,155,176,.4)" stroke-width="2"/>
    <path d="M${cx - 8} ${cy} L${cx + 8} ${cy}" stroke="${GRIS}" stroke-width="4" stroke-linecap="round"/>`;
  return `<circle cx="${cx}" cy="${cy}" r="22" fill="rgba(46,212,127,.16)" stroke="rgba(46,212,127,.5)" stroke-width="2"/>
    <path d="M${cx - 9} ${cy + 1} L${cx - 3} ${cy + 7} L${cx + 10} ${cy - 7}" fill="none" stroke="${VERT}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
}

/* legs : [{match_label, league, league_country, pick (deja lisible), odd, heure, result}] */
function svgFiche(info, legs, mode) {
  const gagnante = mode === 'gagnante';
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
    <linearGradient id="gLogo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B3E07A"/><stop offset="1" stop-color="#6FB848"/></linearGradient>
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
