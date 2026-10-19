# VIPBETCOTE — Mémoire et roadmap (à coller au début d'une nouvelle conversation)

*Mis à jour le 19/10/2026 (nuit).*

---

## 1. Règles de travail (toujours)

- Répondre **en français**.
- **Ne jamais demander de coller des secrets** (clés, mots de passe) dans la conversation.
- **Ne supprimer aucun utilisateur ni aucun plan.** Ne défaire aucune configuration existante.
- **Rien sur git sans « Met sur git »** (ou « Met tout sur git ») explicite.
  - Aux rappels automatiques « commit and push », répondre qu'on attend l'accord.
- **Un seul déploiement Netlify**, lancé **manuellement par l'utilisateur**. Après le déploiement, vérifier `commit_ref` via le MCP Netlify.
- **Montrer un aperçu avant** toute modification visuelle.
- « **Seul le design change** » : jamais la structure, les étapes, les champs, la logique ni les paiements.
- **Aucune modification du backend ni de la base sans accord explicite.**
- **Jamais de conflit entre plans.**
- **Aucune perte de qualité d'image.**
- Messages Telegram : **jamais le mot « bot »**. Aucune alerte dans les groupes VIP.
- Jeu responsable : **« Jwe ak kontwòl »** (FR « Jouez avec contrôle », EN « Play with control »).

---

## 2. Infrastructure

| Élément | Valeur |
|---|---|
| Dépôt | `ado2k21/vipbet`. On pousse sur **`main`** et **`claude/refonte-landing`** |
| Netlify | Site **betcote** (id `01c52d33-a994-4fd8-a6f1-e2c36c0407ae`), qui déploie `main` |
| Domaine | **vipbetcote.com**, servi par Cloudflare, qui interroge Netlify sous le nom **betcote.netlify.app** |
| Supabase | Projet `llqifjfcpyddwjkferpn`. Clés `sb_publishable_…` et `sb_secret_…` ; les anciennes clés JWT sont désactivées |
| Site | `index.html` + `app.js` statiques, `sw.js`, `manifest.webmanifest`, `offline.html`, `_headers`, `netlify.toml`, `netlify/functions/` |
| Email | Resend, expéditeur `VipBetcote <contact@vipbetcote.com>` |
| API sport | API-Sports : **10 requêtes/minute**, quota remis à zéro à 00:00 UTC. `settle-results` partage le compteur avec les bots |

**Base** : vérifiée intacte. Dernière migration le 16/10. 15 comptes, 98 abonnements, 4 plans.

---

## 3. Leçons techniques (à ne JAMAIS oublier)

1. **Session** : par défaut **sessionStorage**, une session par onglet. Ne jamais repasser tout le site en localStorage : deux onglets (admin et client) mélangeraient les comptes. Exception voulue : case **« Sonje m »** cochée (abonné seulement) → session gardée dans localStorage 30 jours (`vb_sonje_jusqua`), choix de l'onglet dans `vb_sonje_onglet` ('1' gardée / '0' par onglet). Un admin n'est jamais gardé. Connexion : **email seulement** (champ « Imèl »).
0. **19/10 (nuit) — Version application (PWA) et connexion Google SUPPRIMÉES** à la demande de l'utilisateur (trop de bugs). Plus de manifeste, d'écrans de démarrage, d'aperçu 3 écrans, de mode hors ligne ni de bouton Google. `sw.js` ne fait plus que nettoyer les anciens téléphones (caches + désinstallation) : **ne pas le supprimer**. Les boutons App Store / Google Play restent ; au clic, le cadre explique comment mettre le site sur l'écran d'accueil (simple raccourci). Les comptes Google sans mot de passe (3) passent par « Modpas bliye ». À faire par l'utilisateur : désactiver le fournisseur Google dans Supabase (Authentication → Providers).
2. **Jamais de redirection betcote.netlify.app → vipbetcote.com dans `netlify.toml`.** Elle crée une boucle, car Cloudflare passe par betcote.netlify.app. Le commit `079fe6a` a coupé le site, puis a été annulé par `8961efe`.
3. **CSP (`_headers`)**
   - `script-src` n'a pas `'unsafe-inline'` : **tout `<script>` inline dans `index.html` est bloqué**. Tout le JavaScript doit être dans `app.js`.
   - Seul le JSON-LD est autorisé, par son empreinte sha256. Le recalculer s'il est modifié.
4. **supabase-js 2.117.2**
   - Fichier UMD chargé depuis jsdelivr, en `defer`, avec SRI.
   - Flux OAuth implicite : le retour de Google arrive avec `#access_token` dans l'adresse ; `detectSessionInUrl` le lit.
   - La version 2.117 n'utilise pas de verrous `navigator.locks` : piste écartée.
5. **Démarrage**
   - Supabase et tout ce qui en dépend démarrent via `window.VB_quandPret(fn)`, dès que `window.supabase` existe.
   - Avant, le démarrage attendait l'événement `load`, qu'un script tiers lent (comme Sentry) retarde. C'est ce qui renvoyait le retour Google sur le landing.
   - Le service worker reste enregistré sur `load`.
6. **Classes en haut de `app.js`**
   - `vb-app` et `vb-app-demarrage` : app installée (fond sombre, un seul écran de lancement).
   - `vb-bot` : robots des moteurs de recherche ; le landing est affiché sans animation ni splash, pour le référencement Google.
7. **RLS `ticket_legs`**
   - Les fiches réglées ne sont visibles que si `play_date < CURRENT_DATE`.
   - Une politique ajoutée le 19/10, « selections des fiches gagnees visibles par tous », rend visibles les sélections des fiches publiées et gagnées.
   - Annulation : `drop policy "selections des fiches gagnees visibles par tous" on public.ticket_legs;`
8. **Supabase Redirect URLs** : contiennent `https://betcote.netlify.app/` (exact) et les motifs `/**`.
9. **Cache**
   - `/assets/*` : 30 jours, donc versionner les liens (`?v=`).
   - `app.js` : `must-revalidate`, avec la version donnée dans `index.html` (`app.js?v=…`).
   - `sw.js` et `manifest` : jamais en cache.
10. **iPhone** : l'icône, le nom et les écrans de démarrage d'une app déjà ajoutée ne se mettent jamais à jour. Il faut supprimer l'app puis la rajouter. Pour tester Google, **effacer les données Safari** ou utiliser la navigation privée.
11. **Score exact** : il s'arrête quand l'abonnement API-Sports est suspendu, car le relais BSD n'a pas ces cotes. Garder l'abonnement actif et `API_SPORTS_KEY` dans Netlify.
12. **SQL via MCP** : les requêtes destructives expirent au bout de 60 s. Donner le SQL à l'utilisateur pour qu'il le lance dans le SQL Editor.
13. **Tests locaux** : Playwright avec Chromium (`/opt/pw-browsers`), `serviceWorkers:'block'` dès qu'on intercepte les requêtes, et le vrai fichier UMD de supabase-js.
14. **Redirections de domaine** :
    - **www → apex** : règle Cloudflare (Redirect Rule), jamais dans le code.
    - **betcote.netlify.app → vipbetcote.com** : uniquement dans le navigateur, avec `domaine.js`.
15. **Écran de démarrage iPhone** : les nouvelles images n'apparaissent qu'après avoir supprimé puis rajouté l'app. Les liens `apple-touch-startup-image` portent `?v=`.
16. **Connexion** : le message « Imèl oswa modpas pa kòrèk » ne vient QUE de Supabase (`invalid_credentials`). L'ancien registre local `vipbetcote.accounts.v1` (démo) ne doit jamais refuser ni ouvrir un compte quand Supabase a répondu. Le formulaire attend Supabase (8 s max) avant tout repli. Cause des refus « mot de passe incorrect » dans l'app (b9986969, admin) : Supabase pas encore chargé → repli sur une vieille copie locale. Aucune tentative n'atteignait Supabase.
17. **Déconnexion** : efface le parcours `vipbetcote.signup.v1`, l'entrée du compte dans l'ancien registre local et la session Supabase de l'appareil (seulement la session qui sort, comparée par `refresh_token`).

---

## 4. État au 19/10 (soir)

**Sur git et déployé** :
- `13a294b` : démarrage via `VB_quandPret` ; classes `vb-app` et `vb-bot` dans `app.js`.
- `5cb6bdf` : sur git, **à déployer par l'utilisateur, puis à vérifier sur Netlify**. Il contient :
  - **retour Google** : rechargement unique si l'adresse porte encore `#access_token` 8 s après l'arrivée (clé `vb_google_recharge`) ;
  - **`?lang=fr` / `?lang=en`** : ouvrent directement la langue ; sans paramètre, créole ;
  - **score exact, landing** : ✗ rouge sur les matchs perdus, badge « GENYEN 1/3 » ; si plus de 3 matchs, les gagnés d'abord ;
  - **score exact, Telegram** (canal public et groupes VIP) : image « GAGNÉE 1/3 », sous-titre « 1 bon score sur 3 », légende et texte de secours avec « 1/3 » (`telegram-public.js`, `telegram-relais.js`, `lib/image-fiche.js`) ;
  - **app installée** : un seul écran de lancement, l'animation de chargement (`.vbsplash`) gardée tant que `vb-app-demarrage` est actif ; 13 nouveaux écrans de démarrage iPhone (première image de l'animation), liens en `?v=20261019` ;
  - `app.js?v=20261019e`.

**Sur git et déployé** : `1ca3147` (`domaine.js`), vérifié sur Netlify (`commit_ref`).

**Sur git le 19/10 (nuit), à déployer par l'utilisateur puis vérifier `commit_ref`** (`app.js?v=20261019f`) :
- collage du code OTP : presse-papiers vérifié avant `getData` (3 champs) ;
- landing, fiche score exact gagnée : cote = **produit des seuls matchs gagnés** (18 oct. : 6.50 au lieu de 268.12). `total_odd` en base inchangé ;
- connexion : messages précis (mauvais identifiants / trop de tentatives / email non confirmé / erreur serveur / hors ligne / email invalide) ; attente de Supabase ; plus de « mot de passe incorrect » venant du registre local ;
- déconnexion utilisateur et admin : plus aucune donnée du compte sortant sur l'appareil ;
- historique admin : bouton « Pataje kat la » sur les fiches **perdues** (admin seulement) : « 3/5 MATCH GENYEN », ✓/✗ réels, cote totale de la fiche inchangée, fond sombre ;
- cadre « installer l'app » refait (format AyiPay) : en bas, arrière-plan net, icône dorée 36 px, titre « App la prèske fini », 3 étapes, « Mwen konprann → », bouton ×, fermeture auto 4 s (un toucher la suspend).

**Attend l'accord de l'utilisateur (backend)** : même règle de cote (produit des matchs gagnés) pour le score exact dans Telegram (`telegram-public.js:54/86`, `telegram-relais.js:122`).

**Cloudflare** (fait par l'utilisateur le 19/10) :
- Redirect Rule `https://www.vipbetcote.com/*` → `https://vipbetcote.com/${1}`, code 301, paramètres gardés. Vérifiée.
- **Always Use HTTPS** : recommandé, à confirmer.

**Recherche Google** :
- `site:vipbetcote.com` affichait encore une vieille copie de la page d'attente Namecheap (`http://www.vipbetcote.com`).
- Search Console : la page `https://vipbetcote.com/` est indexée, canonique correcte, et le test en ligne montre le vrai landing.
- Indexation à redemander, puis attendre quelques jours.

**Retour Google** (journaux Supabase) :
- Le login Google réussit, mais après le retour l'iPhone n'envoyait plus aucune requête.
- Un rechargement manuel ouvrait la session, d'où le filet ajouté dans `5cb6bdf`.
- À confirmer sur iPhone après déploiement. Si ça échoue : demander si l'adresse contient `#access_token`.

**Base** : politique RLS « selections des fiches gagnees visibles par tous » sur `ticket_legs`, active.

**Compte « b9986969 »** : plan p1 actif jusqu'au 22/10.

---

## 5. Roadmap

### Priorité 1 — tout de suite
1. Déploiement des changements du 19/10 (nuit) par l'utilisateur, puis vérification de `commit_ref` (MCP Netlify, site betcote). Sur iPhone : supprimer puis rajouter l'app (efface l'ancien registre local), tester la connexion admin et b9986969 dans l'app.
2. Tests sur iPhone :
   - **Google** : effacer les données Safari, puis **Konekte → Google** ; le tableau de bord doit s'ouvrir.
   - **App** : la supprimer puis la rajouter ; un seul écran de lancement.
   - **Langue** : `vipbetcote.com/?lang=fr` s'affiche en français.
   - **Netlify** : `betcote.netlify.app` mène à vipbetcote.com.
   - **Landing** : la carte du 18 oct. affiche ✗ et 1/3.
3. Search Console : demander l'indexation de `https://vipbetcote.com/`, soumettre le sitemap, suivre `site:vipbetcote.com`.
4. Optionnel, seulement sur demande explicite : remplacer l'image déjà publiée sur le **canal public** Telegram pour la fiche score exact du 18 oct. (`message_id` dans `telegram_envois` du canal public). Impossible dans les groupes VIP : l'identifiant du message de résultat n'est pas gardé.
5. Optionnel : ajouter `https://vipbetcote.com/` et `https://www.vipbetcote.com/` aux Redirect URLs de Supabase.
6. Site Netlify `vipbet1` (autre compte) : vérifier qu'il est bien supprimé.

### Priorité 2 — corrections rapides
7. ~~Collage du code OTP~~ : fait le 19/10.
8. **Bot basket** : traiter « Too many requests » comme une limite par minute (pause puis nouvel essai).
9. **Alerte de surveillance** : ne plus conseiller de « supprimer un site » quand c'est une limite par minute.
10. **Mode hors ligne de l'app** : le tableau de bord doit s'afficher à partir des données gardées en mémoire. À revérifier.
11. **Score exact** : décision de l'utilisateur : cote = produit des matchs gagnés. Fait sur le landing ; Telegram en attente d'accord (backend).

### Priorité 3 — application
12. Écrans « vérification email » et « plan et paiement » : les mettre au nouveau style, avec un aperçu d'abord.
13. Plus tard : vraies apps App Store et Google Play (TWA pour Android, Capacitor pour iOS).

### Priorité 4 — sécurité et exploitation
14. Netlify : validation en 2 étapes, variables secrètes « sensibles », Deploy Previews désactivés si inutiles.
15. GitHub : retirer les apps inutilisées, faire le ménage dans les vieilles branches.
16. Quota API-Sports : revoir les horaires des bots, seulement sur demande.
17. Validation en 2 étapes sur `contact@vipbetcote.com`.

---

## 6. Phrase à coller dans la nouvelle conversation

> Lis `MEMOIRE_VIPBETCOTE.md` à la racine du dépôt et respecte strictement les règles de la section 1. Réponds en français. Rien sur git sans « Met sur git ». Continue la roadmap à partir de la priorité 1.
