/* 20/11 (James) — PIXEL META (Facebook) « VipBetCote », id 1119004030539833.
   Fichier séparé : la politique de sécurité du site (CSP, voir _headers) refuse tout script
   écrit directement dans la page. Domaines autorisés pour lui dans _headers :
   connect.facebook.net (script) et www.facebook.com (envoi des événements).
   - PageView : à chaque chargement du site.
   - Purchase : appelé par app.js (window.VB_metaAchat) quand le site constate qu'un paiement
     d'abonnement vient d'être CONFIRMÉ (passerelle ou validation admin). Montant réel payé :
     en dollars pour Stripe, en gourdes pour les autres moyens. Une seule fois par paiement (référence gardée dans le navigateur), et seulement
     pour un paiement confirmé depuis moins de 3 jours (jamais un vieux paiement recompté). */
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1119004030539833');
fbq('track', 'PageView');

window.VB_metaAchat = function (p) {
  try {
    if (!p || !p.ref || typeof window.fbq !== 'function') return;
    const montant = Number(p.montant);
    if (!(montant > 0)) return;
    const quand = p.confirmeLe ? Date.parse(p.confirmeLe) : Date.now();
    if (Number.isFinite(quand) && Date.now() - quand > 3 * 86400000) return;
    const cle = 'vb_meta_achat_' + String(p.ref);
    try { if (localStorage.getItem(cle)) return; localStorage.setItem(cle, '1'); } catch (e) { /* navigation privée : envoyé quand même */ }
    const devise = p.devise === 'USD' ? 'USD' : 'HTG';   // Stripe : dollars ; MonCash / NatCash / admin : gourdes
    window.fbq('track', 'Purchase', { value: Math.round(montant * 100) / 100, currency: devise, content_ids: [String(p.planId || '')], content_type: 'product' }, { eventID: String(p.ref) });
  } catch (e) { /* jamais bloquant */ }
};
