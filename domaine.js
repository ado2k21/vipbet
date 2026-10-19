/* 19/10 — Une seule adresse visible : le site ouvert sous betcote.netlify.app
   affiche la meme page sur https://vipbetcote.com (chemin, ?parametres et #suite
   gardes, donc aussi les retours de connexion).
   Redirection faite DANS LE NAVIGATEUR, jamais dans netlify.toml : vipbetcote.com
   passe par Cloudflare, qui interroge Netlify sous le nom betcote.netlify.app ;
   une redirection cote serveur tournait en boucle (18/10). Ici le navigateur voit
   « vipbetcote.com » dans ce cas, donc aucune boucle possible.
   L'application deja installee depuis betcote.netlify.app n'est pas touchee. */
(function(){
  try{
    if(location.hostname!=='betcote.netlify.app')return;
    if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)return;
    location.replace('https://vipbetcote.com'+location.pathname+location.search+location.hash);
  }catch(e){}
})();
