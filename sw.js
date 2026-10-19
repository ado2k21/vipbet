/* =====================================================================
   VIP BETCOTE — 19/10 (nuit) : la version application est supprimee.
   ---------------------------------------------------------------------
   Ce fichier ne sert plus qu'a NETTOYER les telephones qui avaient
   installe l'ancienne version : il efface toutes les donnees gardees
   (caches du site, des fiches et de la session hors ligne), puis se
   desinstalle. Aucune requete n'est jamais interceptee.
   Ne pas supprimer ce fichier : sans lui, l'ancien service worker
   resterait actif sur ces telephones.
   ===================================================================== */
'use strict';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const cles = await caches.keys();
      await Promise.all(cles.map((k) => caches.delete(k)));
    } catch (e) {}
    try { await self.registration.unregister(); } catch (e) {}
    try {
      const onglets = await self.clients.matchAll({ type: 'window' });
      onglets.forEach((c) => { try { c.navigate(c.url); } catch (e) {} });
    } catch (e) {}
  })());
});
