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

1. **Session** : RÈGLE DE L'UTILISATEUR — la session ne RESTE que si « Sonje m » est cochée (30 jours, `vb_sonje_mode`='long'). Sans la case : gardée sur l'appareil 2 h glissantes ('court'), pour survivre au sélecteur photo d'iOS pendant le paiement ; revenir plus tard redemande la connexion. Admin : toujours par onglet (`vb_sonje_onglet`='0'). Jamais tout le site en localStorage sans délai. Connexion : email seulement.
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
18. **Reçu de paiement manuel** : le dossier du fichier (`payment-proofs/{uid}/…`) vient TOUJOURS de la session réellement ouverte, jamais de `state.supabaseUserId` (sinon refus RLS quand un autre compte est connecté sur le même téléphone). Envoi par XMLHttpRequest avec progression %, délai 90 s, message « Echèk » ; le paiement n'est créé qu'après l'envoi réussi, et seulement au clic sur « Soumèt resi a ».
19. **Montée en charge** : Supabase en offre GRATUITE (200 connexions temps réel max). Le landing n'ouvre plus de temps réel pour les visiteurs anonymes ; aucune lecture périodique quand l'onglet est caché. Recommandé : Supabase Pro + vérifier la limite Resend (100 emails/jour en gratuit).
20. **Carte de partage** (`genererImageTicketGagnant`) : mise en page adaptative jusqu'à 14 matchs ; ne jamais revenir à des lignes fixes de 150 px.
21. **Icône écran d'accueil** : `assets/apple-touch-icon.png` (C1 : fond bleu ardoise #4A5570→#262E40, logo #2ED47F). Sert au raccourci écran d'accueil ET, depuis le 20/10, d'icône d'onglet/Google (`assets/favicon.ico`, `assets/favicon-512.png`, `/favicon.ico` à la racine) : l'icône doit TOUJOURS être l'icône app C1.
22. **Adresses directes (sitelinks Google)** : `/signup`, `/login`, `/winning-tickets`, `/pricing`, `/how-it-works`, `/faq` (+ `/plan`, `/plans`, `/abonnements`). Réécritures 200 vers index.html dans `netlify.toml` ; `app.js` (bloc « Routage simple ») ouvre la section, change titre/description/canonique. Menu et pied de page pointent vers ces adresses (le gestionnaire d'ancres les fait défiler sans rechargement). `domaine.js` retire la barre finale (`/login/` casserait les chemins relatifs). Listées dans `sitemap.xml`. Mots en ANGLAIS (choix de l'utilisateur).
23. **Bande du landing sous la barre Safari iOS** : quand une page plein écran est ouverte (`.authpage/.dash/.legalpage/.faqpage.open`), le landing est masqué en CSS (`body:has(...)`).
24. **Branches fusionnées le 20/10** : `fix/xss-admin-usernames` (escH sur nom/email/motif dans le panneau admin) et `fix/suspension-t-indefini` (vbTr pour le message de suspension). Ne plus les recréer.
25. **Notifications abonné** : horodatage RÉEL (publication = max(created_at, scheduled_publish_at), gain = settled_at, rappel = endDate − n jours), 50 max, défilement. « payment_pending » est créée PAR LA BASE (déclencheur `trg_notif_paiement_en_attente_user`, dépôts manuels moncash/natcash) : le site n'a pas le droit d'insérer dans notifications. Bouton « Rafrechi » à côté de chaque « Retounen » du Dashboard.
26. **Email de rappel** (`subscription-reminders.js`) : vrai nom du plan lu dans `plans` à chaque envoi, bouton « Renouveler mon plan » → https://vipbetcote.com/login, nom échappé.
27. **Carte TikTok** (admin seulement, toutes les fiches : bouton « Pataje TikTok » à droite de « Pataje kat la ») : modèle **FULL TIME** (`genererCarteFullTime`) — logo seul, « FULL TIME », Équipe A VS Équipe B + pastille du choix court (`choixCourt` : « Fluminense -1.5 », « 12 », « 2 ekip make », nom de l'équipe, « 1 - 0 »). Ni heure, ni cote, ni lien, ni nom du site, ni mention. 3 ambiances : en cours = nuit/cadre vert ; gagnée = fond vert/cadre or + ✓ ; perdue = ardoise/cadre corail + ✓/✗. « Pataje kat la » garde la carte habituelle. Légendes TikTok : jamais « lien an nan bio », jamais #paryajlakay/#paryajpam (sanction « Fraudes et escroqueries » le 21/10, 3 de plus = bannissement).
28. **Vert du logo = vert WhatsApp #25D366** partout (icônes C1, favicon, logo du site, `logo-vipbetcote.svg`, cartes de partage, images Telegram). Le fond des icônes ne change pas.
29. **Règlement** : un match (basket ou foot) n'est jamais voidé par la règle des 23h59 avant 12 h après son vrai coup d'envoi (`delaiVoidEcoule`). Les statuts officiels PST/CANC restent voidés tout de suite.
30. **Alerte Telegram « Nouvel abonné »** (`lib/alerte-nouvel-abonne.js`) : envoyée au chat d'alertes admin (TELEGRAM_CHAT_ID, garde anti-groupe VIP) à chaque paiement AUTOMATIQUE confirmé (MonCash/NatCash via `verifierEtConfirmer`, code CONFIRMED uniquement ; Stripe dans `stripe-webhook.js`). Texte : plan P1..P4, moyen, compte — jamais de prix. Ne bloque jamais le paiement.
31. **Landing « Fiches réussies »** (`chargerFichesGagnees`) : 30 fiches gagnées les plus récentes (09/11) ; les 15 plus récentes d'abord (par date), puis scores exacts, puis les autres, par cote affichée décroissante. 5 matchs par carte (classe `wf-dense` si 4-5). Sous-titre : SKÒ EGZAK / BASKETBÒL / FOUTBÒL.
32. **Paiements de test supprimés le 04/11** : 3 paiements de michellthe@yahoo.com (3 998 HTG), sauvegardés dans `bak_20261104_paiements_test`. Balance admin après : 1 059 HTG.
33. **Carte « Renouvèlman » (06/11)** : 5ᵉ carte de Revni (place vide à côté de « Ap tann validasyon »), clic → page `data-adview="renouvellement"` (Rezime, Pa plan, Chemen plan yo, Ap fini nan 7 jou, Pa renouvle ; périodes 7/30/90/Tout). Calcul dans `app.js` SEULEMENT, à partir des paiements CONFIRMÉS (jamais la table subscriptions, pleine de lignes « cancelled » de tests/abandons). Fin de plan = paiement + durée du plan (LIFETIME ne finit jamais) ; repayé = même plan / monte / descend ; sinon perdu après 3 jours de marge. **Paiements de test ignorés** : Stripe < 1 $, MonCash/NatCash < moitié du prix du plan.
34. **Globe « Kote kliyan yo peye » (06/11)** : section sous Revni (accueil admin) + page `data-adview="kat"` (« Wè kat la an gran »). Moteur + points de terre dans `assets/globe-admin.js` (chargé seulement pour l'admin). Couleurs : NatCash orange #F7A21B, MonCash rouge #E8352B, Stripe violet #A78BFA, dernier paiement épingle blanche. Lieu = colonnes `payments.geo_*` (migration `20261106120000_localisation_paiements.sql`, appliquée le 06/11 par l'utilisateur dans le SQL Editor) ; écrites UNIQUEMENT par le serveur (déclencheur `trg_payments_protect_geo_cols`). **L'IP n'est jamais enregistrée.** Source : en-têtes Cloudflare (Rules → Settings → Managed transforms → « Add visitor location headers » ACTIVÉ le 06/11), repli `x-nf-geo` Netlify (`lib/geo-requete.js`). MonCash/NatCash : `paiement-create` (réessaie SANS lieu si les colonnes manquent : le paiement ne dépend jamais du globe). Stripe (liens buy.stripe.com) : `stripe-geo` note le lieu au clic (table `stripe_geo_clic`, RLS sans politique), `stripe-webhook` le rattache APRÈS confirmation (sinon pays de la carte) dans un bloc protégé. **Dépôts manuels** (reçu, écrits par le navigateur) : après « Soumèt resi a », le site appelle `paiement-geo`, qui note le lieu sur le SEUL dépôt manuel en attente de la personne (< 15 min, sans lieu) ; visible sur le globe après validation admin (le déclencheur garde le lieu lors de la validation).

35. **Lissage de l'apprentissage des bots (06/11)** : `annoterPoolAvecFiabilite` (bot-generate-tickets-background.js, utilisé par TOUS les bots foot/basket/manuels) note chaque sélection 70 % × 1/cote + 30 % × taux lissé = (gagnés + 8 × 1/cote) / (résultats + 8). Les couples < 8 résultats (`carte.faibles`) servent désormais au score ; la carte principale (≥ 8), les étiquettes A-E, le repli historique du score exact, `real_sample_size` et `value_score` sont INCHANGÉS. Mesuré sur 980 résultats rejoués : tri 0,7334 → 0,7369 (gain léger). Constat : les sélections gagnent ~4 points de moins que la cote annoncée (marge bookmaker) dans chaque tranche de cote. Annulation : remettre `K_LISSAGE` à 0 n'annule PAS ; revenir au commit précédent.
36. **Rapport du jour (07/11)** : fonction planifiée `rapport-jour` (toutes les 30 min, déclarée dans `netlify.toml`) → table `rapports_jour` (migration `20261107120000_rapports_jour.sql`), une ligne par jour et par portée (`complet`, `p1`..`p4`). Pronostics publiés foot + basket, SANS score exact, void exclus, un même pronostic dans plusieurs fiches compté UNE fois, calcul seulement quand tout le jour est réglé, publié si ≥ 70 %, pas de minimum. Portée pN = fiches que le plan N reçoit (min_plan_rank ≤ N, basket > 15 masqué au rang 1). Telegram UNE fois (`telegram_statut`) : complet → canal public (jamais un groupe VIP), pN → groupe VIP du plan (3 groupes : G3 reçoit p4). Image `rendrePng(..., 'rapport')`. Landing : rapport complet en tête du carrousel (`chargerRapportsLanding`). Historique abonné : rapport du plan qu'il avait CE jour-là, seulement dans ses périodes de plan confirmées (`rapportsVisiblesUser`). Historique admin : carte complète + puces par plan. **Partage du rapport** (`genererCarteRapport`) : format « FULL PREDICTION SCORES » (fond clair, bandes bleu nuit/vert, équipe A | choix court `choixCourt` (« +1.5 », « INTER +1.5 », nom de l'équipe gagnante, « 1X », « 2 EKIP MAKE ») | équipe B, TOUS les matchs réussis jusqu'à 18). Jamais de cote ni le mot « pronostic ». Bouton « Pataje » du rapport (abonné + admin) = **même format que le groupe Telegram public** (« RAPÒ JOUNEN AN », tous les matchs, ✗ rouge, logo) avec le **lien de parrainage** de l'abonné dans l'image et le texte « Rapò jounen an : X/Y pwonostik reyisi (Z %) ak VIP BETCOTE 🎉 https://… » (09/11) ; SEUL « Pataje TikTok » (admin) garde FULL PREDICTION SCORES sans lien ni logo. `rapports_jour.matchs` garde TOUS les pronostics joués (max 60 : réussis d'abord, puis perdus), avec `result`, `pick` et `market` bruts. Carte de partage et **canal Telegram public** : format FULL PREDICTION SCORES avec TOUS les matchs, ✓ vert réussi / ✗ rouge perdu ; image du canal public (`rendrePng(..., 'public')`, `imagePublic`) : **format de la carte du landing « RAPÒ JOUNEN AN »** (fond vert, gros %, TOUS les matchs avec ✓ vert / ✗ ROUGE et leur cote, logo + vipbetcote.com, sans la mention « sans score exact ») (09/11) ; carte TikTok : **ni logo ni lien**. Groupes VIP : image verte « Rapport du jour », réussis seulement. Landing et historique : réussis seulement. ✗ de la MÊME couleur que le ✓ (vert #25D366). **Bouton « Pataje TikTok » de TOUTES les fiches** (en cours, gagnée, perdue, score exact « 1 - 0 ») : même format FULL PREDICTION SCORES (`genererCarteRapport` avec `entete`), plus la carte FULL TIME (gardée dans le code, non utilisée). En cours : seulement le choix, sans ✓/✗. **Rapports rétroactifs** : `rattrapage()` calcule les jours passés (180 j max, 40 jours par passage) avec `retroactif = true` → visibles UNIQUEMENT dans l'historique admin (RLS + filtres landing/abonné), jamais envoyés sur Telegram, jamais écrasés.
37. **07/11** : TikTok = **@thebetcote** (12/11, remplace @vipbetcote1 ; pied de page + JSON-LD ; empreinte sha256 recalculée dans `_headers` à chaque changement du JSON-LD). FAQ « 4 fich chak jou » (la table `faq` en base peut écraser ce texte : à vérifier). Note score exact : « Jwe pa 1 oswa pa 2 match ». Note `dash-tip` au-dessus des fiches en cours (« Ou pa oblije jwe yon fich antye chak jou… »).
38. **Statistiques « pronostics » (09/11)** : fenêtre en haut de Estatistik (abonné : `#dashPronosStats`, fiches de ses périodes de plan via `ficheEtaitAccessible`, masquée sans plan ; admin : onglet Fiches → Estatistik, tout le site, fiches publiées, filtre de période). Calcul unique `window.VB_statsPronos` : sans score exact, void exclus, seulement won/lost, un même pronostic (match + marché + choix) compté UNE fois. Pourcentage en grand + réussis / perdus / total. Admin : en dessous, liste **Jou pa jou** (date de jeu, %, réussis/total ; vert si ≥ 70 %), même calcul par date, filtre de période respecté.
39. **Avis des abonnés (09/11)** : migration `20261109120000_avis_abonnes.sql` (`fiche_joues`, `avis_abonnes`, vue `avis_publics`, RPC `avis_compteurs`, bucket PRIVÉ `avis`, déclencheur `avis_plan_reel`). Deux entrées : (1) **fenêtre FIXE dans l'Istorik** (`#dashAvisFixe`, sous les chiffres, avant les filtres), TOUJOURS là, même un jour sans fiche gagnée (« Menm si fich la pèdi… »), même règle que les Estatistik (plan actif OU plan passé ; jamais payé = cachée) ; (2) barre sous chaque fiche GAGNÉE (« 👍 Mwen te jwe l » + « 📸 Voye prèv gen mwen »). Formulaire : capture + étoiles + note 140 + consentement obligatoire ; **choix de la fiche OPTIONNEL** (« Mwen pa presize » par défaut ; fiches réglées gagnées OU perdues des 7 derniers jours ; présélectionnée depuis une fiche gagnée). Base : `ticket_id` facultatif, fiche gagnée ou perdue seulement, compte avec un abonnement `active` (en cours ou passé), un avis par fiche, **3 avis en attente maximum** (`avis_limite_attente`). Aucune récompense, aucun outil de flou : une capture avec des informations sensibles est refusée. Le **plan affiché est imposé par la base** (abonnement `active` le plus élevé), jamais la valeur du navigateur ; le nom de l'abonné n'est JAMAIS affiché. Admin : menu « Avi » (`renderAvisAdmin`), filtres En attente / Publiés / Refusés-retirés, compteurs. **Pibliye, Refize et Retire sur landing demandent TOUJOURS une confirmation Wi / Non** (`.av-conf`). Un avis publié va sur le landing (`chargerAvisLanding`, 6 au plus, après le dernier rapport du jour, avant les fiches) et dans le **canal Telegram public** (fonction `avis-telegram`, toutes les 10 min, une seule fois : réservation `telegram_statut`, `echec` si la capture a disparu). Retirer un avis l'enlève du landing seulement : le message Telegram reste.
40. **Alerte « Publications manquantes » du 10/11 (cause réelle, lue dans `bot_run_log`, colonne de date `ran_at`)** : pas une panne. Trêve internationale : 112 matchs reçus, 1 seul dans un championnat suivi → 1 essai de fiche refusé (< 3 matchs), 0 publié, API OK, pas d'anti-doublon. Correctifs (accord de James, sans toucher à la logique du bot) : (1) 12/11 : nouvelle liste `COMPETITIONS_ELARGIES_FOOT` (32 compétitions : amicaux internationaux A, Ligues des Nations UEFA/CONCACAF, CAN et qualifs, Coupe d'Asie, Gold Cup, qualifs Euro/CDM, coupes nationales Espagne/Angleterre/France/Allemagne/Italie/Portugal/Pays-Bas/Turquie/Belgique, supercoupes, coupes continentales de clubs, Ligue des champions féminine), servie EN DERNIER via `rangCompetition` (0 grands, 1 habituels, 2 élargies ; tri stable) : un jour normal, les matchs choisis sont EXACTEMENT ceux d'avant (testé). Exclus volontairement : amicaux de clubs, réserves, jeunes, divisions amateurs (EFL Trophy, Non League). IDs non marqués « vu » à confirmer via `stats.championnatsVus`. Les qualifications CDM 2026 (31/32/34) sont terminées : les matchs de sélections passent maintenant par ces compétitions. Règle AUTOMATIQUE (`competitionAutorisee`, utilisée aux 4 endroits : filtre, extraction des marchés, 2 générateurs manuels) : toute compétition de pays « World » est acceptée (ex. Jeux olympiques) sauf féminines (hors 525), jeunes, réserves, amateurs, futsal, beach, virtuels, vétérans, universitaires, amicaux de clubs (`EXCLUS_AUTO_FOOT`), rang 2. Le BASKET n'a AUCUNE liste : toutes les compétitions couvertes par les bookmakers ; (2) `alerte-watchdog.js` : pour la cause `AUCUN_ELEMENT`, lecture du dernier passage (`bot_run_log_prod`, repli `bot_run_log`, lecture seule, jamais bloquant) → message avec la VRAIE cause : jour pauvre (« X utilisables sur Y, API OK » + championnats non suivis), anti-doublon, ou « aucune fiche conforme aux règles ». L'alerte prioritaire « API suspendue » est inchangée. Remarque : `stats.matchsRejetes`/`raisonsRejet` ne comptent pas les refus de championnat (voir `championnatsVus`).
41. **Alertes = seulement les VRAIS problèmes (12/11, demande de James)** — `alerte-watchdog.js` uniquement (ni bot ni base) : (1) `jugerPublicationManquante` lit le dernier passage AVANT de prendre le verrou : si ce passage visait bien la date, sans erreur, sans panne d'API (relais BSD non déclenché), sans anti-doublon, et qu'il n'y avait pas assez de matchs (foot : des matchs reçus mais < 3 utilisables ; basket : < 2 sélections ou 0 match) → AUCUNE alerte. FOOT avec 0 match reçu = TOUJOURS une alerte (jamais normal). Le diagnostic lit le passage qui VISAIT la date de l'alerte (pas seulement le plus récent). Vérifié en base le 12/11 : `alert_sites` = betcote ; seuls des passages betcote ces 7 derniers jours ; 11/11 = 205 reçus / 0 utilisable (trêve, avant les nouvelles compétitions) ; 12/11 = fiche foot publiée à 18:30, passages suivants arrêtés par l'anti-doublon (normal) ; s'il visait la date → jamais « la tâche ne tourne plus » (le foot ne tourne que de 16h00 à 21h45 Haïti : 18 h sans passage la nuit est normal, l'ancienne règle des 12 h sonnait chaque nuit) ; résumé illisible → alerte gardée. (2) Seul le site de PRODUCTION envoie : la table `alert_sites` (doit contenir `betcote`) est lue au début ; autre site → aucun message. Table vide ou illisible → aucun filtre (on ne coupe jamais l'alerte API suspendue par erreur). L'alerte prioritaire « API suspendue » est inchangée.
42. **Écran blanc au lancement depuis l'écran d'accueil iPhone (12/11)** : iOS 26 ouvre tout raccourci en plein écran et affiche du blanc tant qu'aucune image de démarrage n'est déclarée. Ajout de 13 `apple-touch-startup-image` (`assets/splash/splash-LxH.png?v=20261112`) = première image EXACTE de l'animation `.vbsplash` (vérifié au pixel : aucune différence) → pas de transition visible. Pas de manifeste, pas de service worker, pas de mode hors ligne. **Android : décision de James = rien** (Chrome ne permet pas d'image de démarrage personnalisée ; un manifeste aurait réactivé « Installer l'application »). Si l'écran reste blanc sur iPhone après test, piste : ajouter `apple-mobile-web-app-capable`. Pour regénérer ces images si l'animation change : capture de `.vbsplash` figée (app.js bloqué, animations en pause) à chaque taille d'appareil.
43. **Audit sécurité des paiements (12/11)** — déjà solide : prix toujours lu en base (`paiement-create`, trigger `payments_controle_depot_client` qui IMPOSE le prix du plan aux dépôts manuels) ; identité par jeton Supabase (jamais un user_id envoyé) ; référence prestataire secrète ; webhook MonCash/NatCash signé HMAC en temps constant + revérification chez le prestataire ; Stripe signé + anti-rejeu 5 min + idempotence + contrôle montant/remise/anti-rétrogradation ; RPC sensibles (`confirmer_paiement_prestataire`, `expirer_…`, `rouvrir_…`, `consommer_quota`, `traiter_parrainages`) NON exécutables par anon/authenticated ; RLS : le client ne crée que du `pending`. **Corrigé** : (1) `stripe-webhook` : plan sans montant attendu → laissé EN ATTENTE (avant : activé quel que soit le montant) + prix de test p1 expiré retiré ; (2) `paiement-verify` : limite 20 appels/min/personne (échoue ouvert) ; (3) `alerte-paiement-manuel` : secret comparé en temps constant. **Si un nouveau plan est créé, ajouter son prix USD dans `MONTANTS_ATTENDUS` (stripe-webhook.js)**, sinon ses paiements carte restent en attente de validation manuelle.
44. **Match reporté = annulé tout de suite, sans alerte (13/11, demande de James)** — `bot-settle-results.js` (foot) : un match commencé depuis plus de 3 h, absent de la liste `/fixtures?date` ou encore NS/TBD, est vérifié par une relance ciblée `/fixtures?id` (au plus 6 par passage). S'il est marqué TBD ou déplacé d'au moins 12 h (autre jour) et non terminé → `void` immédiat, raison dans `validation_log` (« Match reporté au JJ/MM (prévu le JJ/MM) ») ; s'il est en fait terminé → réglé normalement. Jamais d'annulation si le fournisseur ne répond pas. Le calcul tourne toutes les heures : le match est annulé bien avant l'alerte « calcul bloqué » (6 h). Si le fournisseur n'a PAS encore mis à jour la date après 6 h, l'alerte reste (vrai manque d'information). Cas réel : Atlético Nacional — Once Caldas, prévu 12/11 16:00, déplacé au 14/11. Basket : statut POST déjà annulé immédiatement ; un match basket déplacé suit encore l'ancienne règle.
45. **RÈGLE DES ALERTES (13/11, James) : « une alerte seulement quand l'API a un problème ; pas d'alerte pour ce que le bot fait lui-même »** — `alerteUtile()` dans `alerte-watchdog.js` : API_* et QUOTA_* → toujours (API suspendue prioritaire) ; PUB_MANQUANTE → seulement causes `API`, `QUOTA_INTERNE` ou `AUCUN_PASSAGE` (le bot n'a pas tourné du tout, il ne peut pas se relancer seul) — jamais jour pauvre, anti-doublon, règles, erreur ponctuelle ; REGLEMENT_BLOQUE → seulement si un match reste sans résultat > 60 h après son début (le bot aurait dû régler/annuler : la tâche de calcul ne tourne plus). Ne JAMAIS rajouter d'alerte pour une situation que le bot gère seul.
46. **API surveillée aussi pendant le calcul des résultats (13/11)** — avant, seule la création des fiches (16:00–~18:30 Haïti) voyait une suspension : une panne à 22:00 n'était signalée que le lendemain à 16:00. `bot-settle-results.js` note dans `bot_run_log` (bot `reglement-foot` / `reglement-basket`, avec `stats.site`) UNIQUEMENT les vrais refus (suspendu, clé invalide/absente, accès refusé, HTTP 401/403 — jamais les limites minute/jour), et le retour à la normale seulement après un refus (aucune ligne en temps normal) ; aucun appel API en plus ; jamais bloquant (`handler` → `handlerInterne` + `noterEtatApi` dans un finally). `alerte-watchdog.js` (`ajouterApiVueParLeCalcul`) : 2 refus de suite sans succès entre (≤ 48 h) → même alerte prioritaire API_BLOQUEE_x ; si la création des fiches signale déjà la panne → un seul message ; succès noté → « Rétabli ». Les requêtes SQL existantes filtrent `bot = 'foot'/'basket'` : non concernées.
47. **Annonces du Dashboard (13/11, James)** — table `annonces` (migration `20261113120000_annonces.sql` : titre ≤ 90, texte ≤ 200, `public` abonne / non_abonne / tous, `actif`, `ordre` ; RLS : un compte connecté ne lit que les actives, seul l'admin écrit ; liste prête de 10 annonces, dont parrainage, avec seule l'ancienne note active). Elles remplacent la note au-dessus des fiches du jour (`#dashTipToday`, `majAnnonces()` dans `renderToday`) : abonné = même règle de plan actif que l'Istorik ; plusieurs actives → elles changent toutes les 30 s ; aucune → rien affiché ; table illisible → l'ancienne note fixe reste. Lecture au plus toutes les 5 min. Un seul texte (pas de traduction). Admin : menu « Anons » (`renderAnnoncesAdmin`) : Aktive/Dezaktive, Modifye, Efase (confirmation Wi/Non), « ＋ Nouvo anons ». Ne jamais inventer de promotion dans la liste prête. Plusieurs annonces : l'abonné peut aussi glisser du doigt (gauche = suivante, droite = précédente ; les 30 s repartent de zéro).
48. **RÈGLE (13/11, James) : TOUJOURS rappeler les migrations SQL à appliquer AVANT chaque « Met sur git »** — lister chaque fichier `supabase/migrations/…` du lot pas encore appliqué en base (vérifier en base), et dire s'il peut être appliqué tout de suite sans danger.
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
