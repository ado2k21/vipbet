/* 18/11 — Configuration Sentry (lue par le loader js.sentry-cdn.com, qui garde sa DSN).
   On ignore les erreurs qui ne viennent PAS du code du site : le script injecte par Netlify
   (/.netlify/scripts/hud, « Netlify Drawer » des comptes Netlify connectes) et les extensions
   de navigateur. Elles declenchaient de fausses alertes « TypeError: Illegal invocation ».
   Fichier separe (et non un <script> en ligne) : la CSP interdit le JavaScript en ligne. */
window.sentryOnLoad = function () {
  Sentry.init({
    denyUrls: [
      /\/\.netlify\/scripts\//i,
      /^(chrome|moz|safari|safari-web)-extension:\/\//i
    ]
  });
};
