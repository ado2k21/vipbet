/* =====================================================================
   VIP BETCOTE — service worker de l'application installable
   ---------------------------------------------------------------------
   17/10 : page offline.html quand le telephone n'a pas de connexion.
   18/10 : mode hors ligne en LECTURE SEULE pour l'application installee.

   Regle d'or : EN LIGNE, RIEN NE CHANGE. Chaque requete part d'abord au
   reseau (« reseau d'abord ») : le site, app.js et les fiches affiches
   sont toujours la derniere version, exactement comme avant. Une copie
   de la reponse est seulement gardee sur le telephone, et n'est servie
   QUE si le reseau ne repond pas.

   Trois caches :
     - CACHE_BASE    : offline.html (dernier recours) ;
     - CACHE_APP     : le site lui-meme (page, app.js, polices, images,
                       bibliotheque Supabase) pour pouvoir s'ouvrir sans
                       reseau ;
     - CACHE_DONNEES : les dernieres donnees lues par l'abonne connecte
                       (fiches, plan, notifications). Active seulement
                       quand l'application installee ouvre le Dashboard
                       d'un utilisateur (jamais pour un admin), et efface
                       a la deconnexion. Chaque reponse n'est gardee que
                       si elle appartient bien a CET utilisateur.

   Jamais en cache : connexion/inscription (auth), paiements, fonctions
   Netlify, ecritures (POST/PATCH/DELETE) sauf deux lectures RPC
   explicitement listees.
   ===================================================================== */
'use strict';

const CACHE_BASE = 'vbc-hors-ligne-v3';
const CACHE_APP = 'vbc-app-v1';
const CACHE_DONNEES = 'vbc-donnees-v1';
const CACHE_CONFIG = 'vbc-config-v1';
const GARDER = [CACHE_BASE, CACHE_APP, CACHE_DONNEES, CACHE_CONFIG];

const PAGE_HORS_LIGNE = '/offline.html';
const CLE_UTILISATEUR = '/__vb_donnees_utilisateur';
const SUPABASE = 'https://llqifjfcpyddwjkferpn.supabase.co';
const CDN_OK = ['https://cdn.jsdelivr.net/npm/@supabase/'];
// Lectures RPC (POST) autorisees en cache : sans parametre sensible.
const RPC_LECTURE = ['/rest/v1/rpc/user_plan_rank', '/rest/v1/rpc/mon_parrainage'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_BASE)
      .then((c) => c.addAll([PAGE_HORS_LIGNE]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => !GARDER.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* ---- Utilisateur dont les donnees peuvent etre gardees ---- */
let uidMemo;
async function uidActif() {
  if (uidMemo !== undefined) return uidMemo;
  try {
    const r = await (await caches.open(CACHE_CONFIG)).match(CLE_UTILISATEUR);
    uidMemo = r ? ((await r.json()).uid || null) : null;
  } catch (e) { uidMemo = null; }
  return uidMemo;
}

self.addEventListener('message', (event) => {
  const m = event.data || {};
  if (m.type === 'vb-donnees-on' && m.uid) {
    event.waitUntil((async () => {
      const ancien = await uidActif();
      if (ancien && ancien !== m.uid) await caches.delete(CACHE_DONNEES);
      uidMemo = m.uid;
      await (await caches.open(CACHE_CONFIG)).put(CLE_UTILISATEUR,
        new Response(JSON.stringify({ uid: m.uid }), { headers: { 'Content-Type': 'application/json' } }));
    })());
  } else if (m.type === 'vb-donnees-off') {
    uidMemo = null;
    event.waitUntil(Promise.all([caches.delete(CACHE_DONNEES), caches.delete(CACHE_CONFIG)]));
  }
});

/* Identifiant (sub) du jeton envoye avec la requete : seules les reponses
   lues avec le jeton de l'utilisateur actif sont gardees. */
function subDuJeton(req) {
  const h = req.headers.get('Authorization') || '';
  const p = h.replace(/^Bearer\s+/i, '').split('.');
  if (p.length !== 3) return null;
  try {
    const json = atob(p[1].replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json).sub || null;
  } catch (e) { return null; }
}

/* Cle « derniere version » d'une lecture : les dates du jour et les listes
   d'identifiants changent d'un jour a l'autre ; sans reseau on veut la
   DERNIERE reponse de la meme requete, meme si elle date d'hier. */
function cleDerniere(url) {
  const u = new URL(url);
  const q = u.search
    .replace(/\d{4}-\d{2}-\d{2}(T[0-9:.]+(Z|%2B\d{2}(%3A)?\d{2}|\+\d{2}:?\d{2})?)?/g, 'D')
    .replace(/in\.\([^&]*\)/g, 'in.(*)');
  return u.origin + u.pathname + '?__derniere=' + encodeURIComponent(q);
}

async function reseauPuisCache(event, cacheNom, options) {
  const req = event.request;
  const o = options || {};
  try {
    const rep = await fetch(req);
    if (rep && rep.ok && (rep.type === 'basic' || rep.type === 'cors') && o.garder !== false) {
      const copie = rep.clone();
      event.waitUntil((async () => {
        const c = await caches.open(cacheNom);
        if (o.cleUnique) {
          await c.put(o.cleUnique, copie);
        } else {
          // Une seule copie par fichier : l'ancienne version (autre ?v=) est retiree.
          const anciennes = await c.keys();
          const chemin = new URL(req.url).pathname;
          await Promise.all(anciennes
            .filter((k) => k.url !== req.url && new URL(k.url).pathname === chemin && new URL(k.url).origin === new URL(req.url).origin)
            .map((k) => c.delete(k)));
          await c.put(req, copie);
        }
      })().catch(() => {}));
    }
    return rep;
  } catch (err) {
    const c = await caches.open(cacheNom);
    const trouve = (o.cleUnique && await c.match(o.cleUnique, { ignoreVary: true }))
      || await c.match(req, { ignoreVary: true })
      || await c.match(req, { ignoreSearch: true, ignoreVary: true });
    if (trouve) return trouve;
    throw err;
  }
}

async function donneesSupabase(event) {
  const req = event.request;
  const uid = await uidActif();
  const derniere = cleDerniere(req.url);
  const garder = !!uid && subDuJeton(req) === uid;
  try {
    const rep = await fetch(req.clone());
    if (garder && rep && rep.ok) {
      const a = rep.clone();
      const b = req.method === 'GET' ? rep.clone() : null;
      event.waitUntil((async () => {
        const c = await caches.open(CACHE_DONNEES);
        await c.put(derniere, a);
        if (b) await c.put(req, b);
      })().catch(() => {}));
    }
    return rep;
  } catch (err) {
    if (!uid) throw err;
    const c = await caches.open(CACHE_DONNEES);
    const trouve = (req.method === 'GET' && await c.match(req, { ignoreVary: true }))
      || await c.match(derniere, { ignoreVary: true });
    if (trouve) return trouve;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1) Ouverture d'une page : reseau d'abord, sinon derniere version du
  //    site gardee, sinon offline.html.
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const rep = await fetch(req);
        if (rep && rep.ok && url.origin === self.location.origin && (url.pathname === '/' || url.pathname === '/index.html')) {
          const copie = rep.clone();
          event.waitUntil(caches.open(CACHE_APP).then((c) => c.put('/', copie)).catch(() => {}));
        }
        return rep;
      } catch (e) {
        const c = await caches.open(CACHE_APP);
        return (await c.match('/', { ignoreVary: true })) || (await caches.match(PAGE_HORS_LIGNE));
      }
    })());
    return;
  }

  // 2) Donnees Supabase de l'abonne (lecture seule).
  if (url.origin === SUPABASE && url.pathname.startsWith('/rest/v1/')) {
    const lecture = req.method === 'GET' || (req.method === 'POST' && RPC_LECTURE.includes(url.pathname));
    if (lecture) event.respondWith(donneesSupabase(event));
    return; // ecritures : reseau direct, sans intervention
  }

  if (req.method !== 'GET') return;

  // 3) Fichiers du site (app.js, polices, images, manifest).
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/.netlify/') || url.pathname.startsWith('/api/') || url.pathname === '/sw.js') return;
    event.respondWith(reseauPuisCache(event, CACHE_APP));
    return;
  }

  // 4) Bibliotheque Supabase (CDN) : necessaire pour ouvrir l'app hors ligne.
  if (CDN_OK.some((p) => req.url.startsWith(p))) {
    event.respondWith(reseauPuisCache(event, CACHE_APP));
  }
  // Tout le reste (Sentry, autres domaines) : reseau direct.
});
