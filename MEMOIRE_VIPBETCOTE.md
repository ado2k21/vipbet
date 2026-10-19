# VIPBETCOTE — Mémoire et roadmap (à coller au début d'une nouvelle conversation)

*Mis à jour le 19/10/2026.*

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

1. **Session**
   - Dans le navigateur : **sessionStorage**, une session par onglet.
   - Dans l'app installée (PWA) : **localStorage**.
   - Ne jamais repasser le site en localStorage : deux onglets (admin et client) mélangeraient alors les comptes.
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

---

## 4. État au 19/10

**Dernier commit sur git et déployé : `f9f38ca`** (retour Google reconnu par l'adresse, landing visible par les robots).

À noter : la partie robots de `f9f38ca` était dans un script inline, **bloqué par la CSP**. Elle ne marche qu'avec la correction ci-dessous.

**Prêt en local, PAS encore sur git** (attend « Met sur git ») : `app.js` et `index.html`, version **`20261019b`**.
- Démarrage via `VB_quandPret`, sans attendre `load` : corrige « Google me renvoie sur le landing ».
- Classes `vb-app` et `vb-bot` déplacées des scripts inline (bloqués) vers le haut de `app.js` : corrige l'écran sombre que voit Google.

Testé en local, Sentry bloqué :
- un compte existant ouvre le tableau de bord ;
- un nouveau compte Google ouvre la fenêtre de profil ;
- la version déployée `f9f38ca`, elle, reste sur le landing.

Les tests de non-régression passent : rechargement, ouverture de l'app, aperçu au premier lancement, robots.

Commandes prévues après « Met sur git » :
```
git add app.js index.html
git commit -m "Demarrage sans attendre load (retour Google), classes vb-app/vb-bot dans app.js (CSP)"
git push origin HEAD:main
git push origin HEAD:claude/refonte-landing
```
Ajouter à la fin du message de commit les lignes d'attribution fournies dans la session.

**Fait récemment**
- Les fiches gagnées s'ajoutent automatiquement au carrousel « Tickets gagnants » du landing (`chargerFichesGagnees` : 30 derniers jours, 6 au maximum), grâce à la politique RLS ci-dessus.
- Aperçu en 3 écrans au premier lancement de l'app ; l'app ouvre la connexion ou le tableau de bord, jamais d'écran forcé.
- Nouveau design de la connexion et de la création de compte, QR MonCash, écrans de démarrage iPhone, logo « terrain » vert.

**Compte « b9986969… »** : plan p1 actif jusqu'au 22/10, confirmé par Stripe. Il s'affiche bien dans l'app ; sur le site, il devrait s'afficher après le déploiement de la correction et l'effacement des données Safari.

---

## 5. Roadmap

### Priorité 1 — tout de suite
1. « Met sur git » de la version `20261019b`, puis déploiement Netlify par l'utilisateur, puis vérification de `commit_ref`.
2. Sur l'iPhone : effacer les données Safari de vipbetcote, puis tester **Konekte → Google** sur vipbetcote.com. On doit arriver au tableau de bord.
3. Vérifier que le compte « b… » affiche son plan sur le site.
4. Search Console :
   - « Tester l'URL en ligne » : la capture doit montrer le landing, et non un écran sombre ;
   - « Demander l'indexation » ;
   - soumettre `sitemap.xml` sur la propriété **vipbetcote.com**.
5. Optionnel : ajouter `https://vipbetcote.com/` et `https://www.vipbetcote.com/` (exacts) aux Redirect URLs de Supabase.
6. Second site Netlify **`vipbet1`** (autre compte) : l'utilisateur le supprime. Avant, vérifier qu'il ne porte pas vipbetcote.com et qu'il ne reçoit aucun webhook.

### Priorité 2 — corrections rapides
7. **Collage du code OTP** (erreur Sentry `getData`) : vérifier que le presse-papiers existe avant de l'utiliser, aux endroits où le code est collé dans `app.js`.
8. **Bot basket** : traiter « Too many requests » comme une limite par minute (pause d'une minute puis nouvel essai) au lieu d'ignorer le match.
9. **Alerte de surveillance** : ne plus conseiller de « supprimer un site » quand c'est une limite par minute.
10. Mode hors ligne de l'app : le tableau de bord doit s'afficher à partir des données gardées en mémoire. À revérifier après le déploiement.

### Priorité 3 — application
11. Écrans « vérification email » et « plan et paiement » : les ajuster au nouveau style, avec un aperçu d'abord.
12. Plus tard : vraies apps App Store et Google Play (TWA pour Android, Capacitor pour iOS).

### Priorité 4 — sécurité et exploitation
13. Netlify :
    - validation en 2 étapes ;
    - variables secrètes marquées « sensibles » ;
    - Deploy Previews désactivés si inutiles.
14. GitHub : retirer les apps inutilisées (Vercel, Railway, Hostinger, Google AI Studio, Cloudflare Pages) et faire le ménage dans les vieilles branches.
15. Quota API-Sports : revoir les horaires des bots et de `settle-results`, seulement quand l'utilisateur le demandera.
16. Validation en 2 étapes sur `contact@vipbetcote.com` dès que Google le permettra.

---

## 6. Phrase à coller dans la nouvelle conversation

> Lis `MEMOIRE_VIPBETCOTE.md` à la racine du dépôt et respecte strictement les règles de la section 1. Réponds en français. Rien sur git sans « Met sur git ». Continue la roadmap à partir de la priorité 1.
