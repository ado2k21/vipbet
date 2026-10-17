/* =====================================================================
   VIP BETCOTE — service worker de l'application installable (17/10)
   ---------------------------------------------------------------------
   Volontairement MINIMAL : il ne met JAMAIS en cache le site, app.js,
   les fiches ni les paiements. Chaque ouverture charge la derniere
   version en ligne, exactement comme le navigateur.
   Son seul role : si le telephone n'a pas de connexion au moment
   d'ouvrir l'application, afficher la page offline.html au lieu de
   l'ecran d'erreur du navigateur.
   ===================================================================== */
'use strict';

const CACHE = 'vbc-hors-ligne-v1';
const PAGE_HORS_LIGNE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll([PAGE_HORS_LIGNE, '/assets/app/icon-192.png']))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Seules les ouvertures de page sont concernees ; tout le reste (app.js,
  // images, Supabase, fonctions Netlify, paiements) passe directement au
  // reseau, sans aucune intervention.
  if (req.mode !== 'navigate') return;
  event.respondWith(
    fetch(req).catch(() => caches.match(PAGE_HORS_LIGNE))
  );
});
