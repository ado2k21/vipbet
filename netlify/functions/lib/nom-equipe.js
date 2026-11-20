'use strict';
// 20/11 (James) — NOM COURT D'ÉQUIPE, sans jamais confondre les deux équipes d'un match.
// « Orlando Magic » contre « Philadelphia 76ers » -> « Orlando » / « Philadelphia » ; « New York Knicks »
// -> « Knicks » (3 mots ou plus : le surnom) ;
// « Los Angeles Lakers » contre « Los Angeles Clippers » -> « Lakers » / « Clippers » (les mots
// communs aux deux noms sont sautés). Un nom de 12 caractères ou moins reste entier. Si aucun mot
// ne distingue les deux équipes, ou si les deux noms courts se ressemblent : noms complets.
// MÊME règle dans app.js (window.VB_nomsCourts) — garder les deux identiques.

const MOTS_GENERIQUES = /^(fc|sc|bc|cf|kk|bk|ac|as|cd|cs|ud|sk|fk|club|basket|basketball|team|the|de|del|la|le|el|al|of|u\d+|w|women)$/i;

function nomsCourts(home, away) {
  const H = String(home || '').trim(), A = String(away || '').trim();
  const mots = n => n.split(/\s+/).filter(Boolean);
  const court = (nom, autre) => {
    if (nom.length <= 12) return nom;
    const motsAutre = new Set(mots(autre).map(x => x.toLowerCase()));
    const ok = mots(nom).filter(w => w.length >= 3 && !MOTS_GENERIQUES.test(w) && !motsAutre.has(w.toLowerCase()));
    if (!ok.length) return nom;
    // 3 mots ou plus (« New York Knicks », « Golden State Warriors ») : le surnom, dernier mot
    // distinctif ; 2 mots (« Orlando Magic », « Zalgiris Kaunas ») : le premier.
    return mots(nom).length >= 3 ? ok[ok.length - 1] : ok[0];
  };
  const h = court(H, A), a = court(A, H);
  if (!h || !a || h.toLowerCase() === a.toLowerCase()) return [H, A];
  return [h, a];
}

// « Orlando Magic — Philadelphia 76ers » -> ['Orlando Magic', 'Philadelphia 76ers']
function equipesDuMatch(matchLabel) {
  const p = String(matchLabel || '').split(/\s+[—–-]\s+/);
  return p.length >= 2 ? [p[0].trim(), p.slice(1).join(' - ').trim()] : null;
}

// Pari « points d'une équipe » au basket : « Domicile : Plus de 108.5 points » -> « Points Orlando Magic :
// Plus de 108.5 » (Telegram, en français ; le site traduit : « Pwen Orlando Magic : Plis pase 108.5 »).
// Affichage seulement (la base garde « Domicile / Extérieur » pour le calcul).
// Tout autre pari, ou un match illisible : texte inchangé.
function pickAvecEquipe(pick, market, matchLabel) {
  const p = String(pick || '');
  if (market !== 'mk_basket_total_domicile' && market !== 'mk_basket_total_exterieur') return p;
  const eq = equipesDuMatch(matchLabel);
  const m = /^(Domicile|Ext.rieur)\s*:\s*(Plus|Moins) de ([\d.]+)\s*points$/i.exec(p.trim());
  if (!eq || !m) return p;
  // 20/11 (James) : NOM COMPLET de l'équipe (« Points Orlando Magic : Plus de 108.5 »).
  return `Points ${/^Domicile/i.test(m[1]) ? eq[0] : eq[1]} : ${m[2]} ${m[3]}`;   // « Plus 108.5 » (sans « de »)
}

module.exports = { nomsCourts, equipesDuMatch, pickAvecEquipe };
