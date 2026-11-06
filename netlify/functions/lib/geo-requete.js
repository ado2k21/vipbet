/* 06/11 : lieu approximatif de la personne qui fait la requete, pour le globe admin.
   Source : en-tetes de Cloudflare (regle « Add visitor location headers »), sinon
   l'en-tete de localisation de Netlify (acces direct a betcote.netlify.app).
   Ne lance JAMAIS d'exception et ne lit jamais l'adresse IP : un echec renvoie {}. */
'use strict';

function texte(v, max) {
  if (v == null) return null;
  let s = String(v).trim();
  try { if (/%[0-9A-F]{2}/i.test(s)) s = decodeURIComponent(s); } catch (e) { /* garde la valeur brute */ }
  s = s.replace(/[\u0000-\u001f<>]/g, '').slice(0, max || 80);
  return s || null;
}
function nombre(v, min, max) {
  const n = Number(v);
  return Number.isFinite(n) && n >= min && n <= max ? Math.round(n * 1000) / 1000 : null;
}

function lireGeo(entetes) {
  try {
    const h = {};
    Object.keys(entetes || {}).forEach(k => { h[k.toLowerCase()] = entetes[k]; });
    let pays = texte(h['cf-ipcountry'], 2);
    if (pays === 'XX' || pays === 'T1') pays = null;            // inconnu / Tor
    let geo = {
      geo_country: pays ? pays.toUpperCase() : null,
      geo_region: texte(h['cf-region']),
      geo_city: texte(h['cf-ipcity']),
      geo_lat: nombre(h['cf-iplatitude'], -90, 90),
      geo_lon: nombre(h['cf-iplongitude'], -180, 180)
    };
    if (geo.geo_lat == null && h['x-nf-geo']) {                  // repli Netlify (base64 JSON)
      const j = JSON.parse(Buffer.from(String(h['x-nf-geo']), 'base64').toString('utf8'));
      geo = {
        geo_country: texte(j.country && j.country.code, 2),
        geo_region: texte(j.subdivision && j.subdivision.name),
        geo_city: texte(j.city),
        geo_lat: nombre(j.latitude, -90, 90),
        geo_lon: nombre(j.longitude, -180, 180)
      };
    }
    if (!geo.geo_country && geo.geo_lat == null) return {};
    geo.geo_source = 'reseau';
    return geo;
  } catch (e) {
    return {};
  }
}

/* Repli Stripe : centre approximatif du pays de la carte quand aucun clic n'a ete note. */
const CENTRES = {
  HT: [18.97, -72.29], US: [39.5, -98.35], CA: [56.1, -106.3], FR: [46.6, 2.2], DO: [18.74, -70.16],
  CL: [-35.7, -71.5], BR: [-14.2, -51.9], MX: [23.6, -102.5], BS: [25.03, -77.4], GB: [54.0, -2.0],
  ES: [40.4, -3.7], BE: [50.5, 4.5], CH: [46.8, 8.2], DE: [51.2, 10.4], IT: [41.9, 12.6], CU: [21.5, -77.8],
  JM: [18.1, -77.3], PR: [18.2, -66.5], VE: [6.4, -66.6], CO: [4.6, -74.3], PA: [8.5, -80.8], TC: [21.7, -71.8],
  GP: [16.25, -61.55], MQ: [14.64, -61.02], GF: [3.93, -53.13]
};
function geoDepuisPays(code) {
  const c = texte(code, 2);
  if (!c) return {};
  const k = c.toUpperCase(), centre = CENTRES[k];
  return { geo_country: k, geo_region: null, geo_city: null,
           geo_lat: centre ? centre[0] : null, geo_lon: centre ? centre[1] : null, geo_source: 'stripe' };
}

module.exports = { lireGeo, geoDepuisPays };
