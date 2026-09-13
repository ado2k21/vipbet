// ---------- Traduction (HT / FR / EN) ----------
const translations = {
fr: {
nav_tickets:"FICHES RÉUSSIES", nav_simulateur:"ESSAYER LA DÉMO", nav_abonnements:"Abonnements", nav_faq:"FAQ",
btn_connect:"Se connecter", btn_signup:"S'inscrire", btn_signup_free:"S'inscrire gratuitement",
tick_won:"GAGNÉ",
hero_badge:"EXPERTS EN LIGNE &nbsp;•&nbsp; +42 PRONOSTICS DU JOUR",
hero_t1:"L'EXCELLENCE", hero_t2:"DU", hero_t3:"PRONOSTIC", hero_t4:"PREMIUM",
hero_sub:"La plus grande plateforme de pronostics qui vous aide à gagner sur ParyajPam, ParyajLakay et 1xBet. Nous avons 6 ans d'expérience. Si vous voulez arrêter de perdre votre argent, choisissez un plan ci-dessous dès maintenant.",
hero_cta1:"DÉMARRER MAINTENANT",
rating_label:"Excellent sur Trustpilot",
stat_garanti:"GARANTI", stat_garanti_lab:"REMBOURSEMENT SI VOUS NE GAGNEZ PAS UNE FOIS",
stat_pronostiqueurs:"UTILISATEURS ACTIFS", stat_pronostics_jour:"PRONOSTICS RÉUSSIS", stat_gratuits:"PRONOSTICS GAGNANTS",
ticket_title:"TICKETS GAGNANTS",
mk_btts:"Les deux équipes marquent", mk_over:"Plus de 225.5",
mk_1x2:"Victoire directe", mk_double_chance:"Double chance", mk_total_buts:"Total buts",
mk_total_domicile:"Total buts domicile", mk_total_exterieur:"Total buts extérieur",
mk_score_exact:"Score exact", mk_buteur:"Buteur",
lbl_cote:"Cote", lbl_cote_totale:"COTE TOTALE", badge_valide:"VALIDÉ",
sim_title:"ESSAYEZ CETTE DÉMO ET VOYEZ CE QUE VOTRE ARGENT RAPPORTE",
sim_sub:"Choisissez un montant et choisissez un PLAN pour voir ce que vous gagnez sur ParyajPam.",
sim_step1:"1. CHOISIR LE MONTANT (Gdes HTG)", sim_step2:"2. CHOISIR UNE FORMULE D'ABONNEMENT VIP",
result_title:"CE QUE VOUS GAGNEZ",
lbl_gain_brut:"GAIN POTENTIEL", lbl_profit_net:"PROFIT NET", sim_cta:"ACTIVER L'ABONNEMENT",
word_formule:"FORMULE",
ab_populaire:"Le plus populaire",
faq6_q:"Comment vais-je recevoir les Cote ?",
faq6_a:"Vous recevez 2 fiches chaque jour dès que vous êtes abonné au VIP. Une fois le paiement effectué, vous obtenez un dashboard dans lequel les fiches sont publiées chaque jour. Vous les recevez également sur Telegram, dans le groupe VIP. Le lien du groupe vous est communiqué après votre inscription.",
faq7_q:"Comment est calculé le taux de réussite affiché ?",
faq7_a:"Chaque pronostic est enregistré avec son résultat réel, gagnant comme perdant. Le taux affiché est calculé à partir de cet historique complet — il n'est jamais saisi à la main.",
faq8_q:"Mes données et mon compte sont-ils protégés ?",
faq8_a:"Vos données sont protégées et vos sessions sécurisées. Vous pouvez consulter et révoquer vos sessions actives depuis vos paramètres, et notre équipe reste joignable à chaque étape.",
tg_tag:"Résultats vérifiés", tg_h2:"Les tickets gagnants d'hier",
tg_p:"Photos de tickets réels et gagnants, publiées telles quelles. Chaque résultat reste consultable dans l’historique complet.",
ab_tag:"Abonnements", ab_h2:"Choisissez un plan",
ab_p:"Un abonnement, des fiches chaque jour analysées par notre équipe d'experts. Payez en Gdes via MonCash, NatCash et Carte/PayPal.",
ab_btn_commencer:"Commencer",
ab_btn_vip:"Devenir VIP",
ab_btn_lifetime:"S&rsquo;ABONNER", ab_btn_sabonner:"S&rsquo;ABONNER",
faq_h2:"Questions fréquentes",
faq1_q:"Comment sont sélectionnés les pronostics ?", faq1_a:"Chaque pronostic est proposé et examiné par notre équipe d'experts. Nous étudions chaque jour les rencontres de football et de NBA disponibles, évaluons les marchés proposés et publions des sélections simples et combinées, chacune accompagnée d'un score de confiance déterminé par nos analystes.",
faq2_a:"Après analyse et selon nos statistiques, nous affichons un score de 83 % de fiches validées et plus de 8 390 fiches réussies. Notre historique complet reste consultable, fiches perdantes comprises.",
faq3_q:"Comment payer mon abonnement ?", faq3_a:"Via MonCash, NatCash, Carte/PayPal. Selon le mode choisi, l'abonnement est activé automatiquement ou après validation par l'administrateur.",
faq4_q:"Quels sports et quels types de paris sont couverts ?", faq4_a:"Football, NBA, etc. Marchés disponibles sur ParyajPam, ParyajLakay, 1xBet, etc. : 1X2, Double Chance, Les deux équipes marquent, Plus/Moins de buts, Handicap, Buteur, Total NBA, etc.",
faq5_q:"Puis-je annuler mon abonnement ?", faq5_a:"Oui. Les abonnements mensuels s'arrêtent simplement à leur date d'expiration si vous ne renouvelez pas. Le plan Lifetime est un paiement unique, sans renouvellement.",
ctaf_h2a:"Prêt à jouer", ctaf_h2b:"plus intelligemment&nbsp;?",
ctaf_p:"Créez votre compte gratuitement, consultez l'historique, puis choisissez l'abonnement qui vous correspond.",
ctaf_btn:"Créer mon compte",
foot_h_plateforme:"Plateforme",
foot_plans:"Plan yo", foot_rezilta:"Rezilta", foot_accueil:"Retounen nan Akèy",
foot_h_legal:"Légal", foot_cgu:"Conditions d'utilisation", foot_confid:"Confidentialité", foot_jeu_resp:"Jeu responsable",
pl1_name:"VIP 7 JOURS", pl1_per:"7 jours d’accès",
plan_per_days:"{n} jours d'accès", plan_name_days:"VIP {n} JOURS",
pl2_name:"VIP 21 JOURS", pl2_per:"21 jours d’accès",
pl3_name:"VIP 30 JOURS", pl3_per:"30 jours d’accès",
pl4_name:"LIFETIME VIP A VIE", pl4_sub:"FULL ACCESS", pl4_per:"Tout cotes yo disponib pou tout tan",
pl4_f1:"Score exact", pl4_f2:"Betcote 1xBet", pl4_f3:"Fich illimité", pl4_foot:"Aksè a tout fich yo pou tout tan",
pf_c515:"Cotes 5 / 10 / 15", pf_c1580:"Cotes 15 / 30 / 60 / 80",
pf_c1000:"Cotes 100 / 1000+", pf_c1000p:"Cotes 100 / 1000+", pf_c20:"Cotes 20 / 100 / 1000+",
pf_betcote:"Betcote ParyajPam &amp; Paryaj Lakay", pf_lien:"Liens &amp; captures des fiches",
pf_score:"Scores exacts &amp; Betcote 1xBet", pf_illim:"Fiches illimitées",
auth_tag:"ESPACE MEMBRE",
auth_brand_sub:"Football et NBA, chaque jour.",
auth_brand_f1:"Fiches quotidiennes avec score de confiance",
auth_brand_f2:"Historique complet — gains et pertes",
auth_brand_f3:"Paiement local : MonCash et NatCash",
auth_tab_login:"Se connecter", auth_tab_signup:"Créer un compte",
auth_login_h:"Content de vous revoir", auth_login_sub:"Connectez-vous pour retrouver vos fiches VIP.",
auth_lbl_login_id:"E-mail ou téléphone", auth_ph_login_id:"exemple@email.com",
auth_lbl_password:"Mot de passe", auth_ph_password_login:"Entrez votre mot de passe",
auth_remember:"Se souvenir de moi", auth_forgot:"Mot de passe oublié ?",
auth_btn_login:"Se connecter",
auth_switch_to_signup_txt:"Pas encore de compte ?", auth_switch_to_signup_link:"Créer un compte gratuit",
auth_signup_h:"Créez votre compte VIP", auth_signup_sub:"Cela prend moins d'une minute.",
auth_lbl_fullname:"Nom complet", auth_ph_fullname:"Votre nom et prénom",
auth_lbl_site:"Site préféré", auth_site_other:"Autre",
auth_lbl_phone:"Numéro de téléphone", auth_ph_phone:"3712 3456",
auth_lbl_email:"Adresse e-mail", auth_ph_email:"exemple@email.com",
auth_ph_password_signup:"8 caractères minimum",
auth_lbl_password_confirm:"Confirmer le mot de passe", auth_ph_password_confirm:"Ressaisissez le mot de passe",
auth_terms:"J'ai 18 ans ou plus et j'accepte les Conditions d'utilisation et la Politique de confidentialité.",
auth_btn_signup:"Créer mon compte",
auth_switch_to_login_txt:"Vous avez déjà un compte ?", auth_switch_to_login_link:"Connectez-vous",
auth_err_required:"Ce champ est requis",
auth_err_email:"Entrez une adresse e-mail valide",
auth_err_phone:"Entrez un numéro valide (8 chiffres)",
auth_err_password_len:"8 caractères minimum requis",
auth_err_password_match:"Les mots de passe ne correspondent pas",
auth_err_terms:"Vous devez cocher cette case pour continuer",
auth_success_login_h:"Connexion réussie", auth_success_login_sub:"Vous allez être redirigé vers votre tableau de bord.",
auth_success_signup_h:"Bienvenue chez VIP BETCOTE", auth_success_signup_sub:"Votre compte est créé. Choisissez un abonnement pour accéder aux fiches.",
auth_success_cta:"Voir les abonnements",
nav_dashboard:"Tableau de bord",
wiz_s1:"Compte", wiz_s2:"E-mail", wiz_s3:"Paiement", wiz_s4:"Accès",
wiz_btn_next1:"Continuer",
wiz_resume_h:"Inscription non terminée",
wiz_resume_at:"Reprenez à l'étape « {step} » — votre plan est conservé.",
wiz_v_h:"Vérifiez votre e-mail", wiz_v_sub:"Nous vous avons envoyé un code à 6 chiffres.",
wiz_v_err:"Le code est incorrect", wiz_v_demo:"Mode démonstration — votre code est",
wiz_v_noreceive:"Vous ne l'avez pas reçu ?", wiz_v_resend:"Renvoyer le code",
wiz_btn_verify:"Vérifier",
wiz_p_h:"Activez votre abonnement", wiz_p_sub:"Vérifiez votre plan puis choisissez votre moyen de paiement.",
wiz_p_total:"Total à payer", wiz_p_change:"Changer de plan",
wiz_p_method:"Moyen de paiement", wiz_p_err_method:"Choisissez un moyen de paiement",
wiz_p_phone:"Votre numéro de compte", wiz_p_pay:"Payer {amount} HTG",
wiz_p_secure:"Paiement sécurisé — aucune donnée bancaire n'est conservée",
wiz_d_h:"Votre abonnement est actif", wiz_d_sub:"Votre compte est prêt. Vous pouvez accéder aux fiches VIP.",
wiz_d_plan:"Plan", wiz_d_start:"Date de début", wiz_d_end:"Date d'expiration", wiz_d_ref:"Référence",
wiz_d_never:"Sans expiration", wiz_d_cta:"Accéder au tableau de bord", wiz_d_pending_dates:"Fixée après confirmation",
wiz_d_h_pending:"Paiement en cours de vérification", wiz_d_sub_pending:"Votre compte est prêt. Vos pronostics seront débloqués dès que notre équipe aura validé votre paiement.",
wiz_d_sub_pending_auto:"Votre compte est prêt. La confirmation est automatique et prend généralement moins d'une minute.",
wiz_auto_pending_note:"Vérification automatique en cours.",
wiz_auto_attente_p:"Vérification automatique en cours auprès du prestataire…",
wiz_auto_verif_p:"Vérification en cours…",
wiz_auto_erreur_p:"Connexion au prestataire impossible pour le moment. Nouvel essai automatique dans quelques instants.",
wiz_auto_confirme_p:"Votre paiement a été confirmé automatiquement.",
wiz_auto_echec_p:"Le paiement n'a pas pu être confirmé. Vous pouvez réessayer.",
wiz_auto_echec_changement_p:"Le changement de plan a échoué. Votre abonnement actuel reste actif.",
wiz_auto_open_cta:"Ouvrir la page de paiement",
wiz_auto_retry_cta:"J'ai terminé le paiement",
wiz_lock_h:"Tableau de bord verrouillé", wiz_lock_cta:"Continuer mon inscription",
wiz_lock_r1:"Vous devez d'abord créer un compte pour accéder au tableau de bord.",
wiz_lock_r2:"Votre adresse e-mail n'est pas encore vérifiée. Terminez la vérification pour continuer.",
wiz_lock_r3:"Aucun abonnement actif. Réglez votre abonnement pour débloquer le tableau de bord.",
dash_t_today:"Fiches du jour", dash_t_history:"Historique", dash_t_stats:"Statistiques", dash_t_sub:"Mon abonnement",
dash_t_subhistory:"Historique abonnement", dash_subhistory_h:"Historique abonnement", dash_subhistory_p:"Tous vos plans confirmés, anciens et actuel.",
dash_subh_actif:"Actif", dash_subh_expire:"Expiré", dash_subhistory_empty:"Aucun plan confirmé pour l'instant.",
dash_hello:"Bonjour {name}", dash_hello_p:"Voici les fiches publiées aujourd'hui par notre équipe d'experts.",
dash_notif_h:"Notifications", dash_notif_clear:"Tout marquer comme lu", dash_notif_empty:"Aucune notification.",
dash_n1:"Votre fiche F-2401 est gagnante", dash_n2:"4 nouvelles fiches publiées aujourd'hui", dash_n3:"Votre abonnement expire dans 12 jours",
dash_ago_2h:"Il y a 2 heures", dash_ago_5h:"Il y a 5 heures", dash_ago_1d:"Hier",
dash_f_all:"Tout", dash_f_foot:"Football", dash_f_nba:"Basketball",
dash_f_allres:"Tous les résultats", dash_f_won:"Gagnées", dash_f_lost:"Perdues",
dash_count:"{n} fiche(s)",
dash_st_won:"GAGNÉ", dash_st_lost:"PERDU", dash_st_pending:"EN COURS", dash_kind_normal:"Cote normal", dash_kind_exact:"Score exact", dash_kind_basket:"Basketball",
fiche_note_x2:"Jouer par deux matchs",
adm_fiche_gen_btn:"⚡ GÉNÉRER FICHE", adm_fiche_gen_h:"Générer une fiche", adm_fiche_gen_p:"Génère une fiche immédiatement pour la date choisie, sans attendre le bot du soir. N'est jamais bloquée par l'anti-doublon.",
adm_fiche_gen_exact_btn:"🎯 GÉNÉRER SCORE EXACT", adm_fiche_gen_exact_h:"Générer un score exact", adm_fiche_gen_exact_p:"Génère uniquement des fiches score exact pour la date choisie — choisissez le nombre de matchs, pas de cote à définir.",
adm_fiche_gen_basket_h:"Générer une fiche basketball",
adm_fiche_gen_nbmatchs:"Nombre de matchs",
adm_fiche_gen_date:"Date des matchs", adm_fiche_gen_hdebut:"Heure début (PAP)", adm_fiche_gen_hfin:"Heure fin (PAP)", adm_fiche_gen_sport:"Sport",
adm_fiche_gen_nba_note:"Non disponible pour l'instant — aucune source de cotes fiable branchée pour le basketball/NBA.",
adm_fiche_gen_plans:"Plans concernés", adm_fiche_gen_cotemax:"Cote max souhaitée", adm_fiche_gen_publish:"Publication",
adm_fiche_gen_now:"Immédiate", adm_fiche_gen_scheduled:"Programmée", adm_fiche_gen_scheduled_at:"Date/heure de publication (PAP)",
adm_fiche_gen_submit:"Générer", adm_fiche_gen_wait:"Génération…",
adm_fiche_gen_bg_lance:"Génération lancée", adm_fiche_gen_bg_attente:"Ça peut prendre jusqu'à 6-7 minutes (le système vérifie les cotes progressivement pour rester fiable). Reviens dans quelques minutes.", adm_fiche_gen_bg_verifier:"Vérifier maintenant",
adm_fiche_gen_err_champs:"Remplissez la date et la fenêtre horaire.", adm_fiche_gen_err_plans:"Choisissez au moins un plan pour continuer.",
adm_fiche_gen_confirm:"Confirmer la génération de cette fiche ?",
adm_fiche_gen_basket_confirm:"Confirmer la génération de la fiche basketball combinée pour demain ?",
adm_fiche_gen_err_prog:"Choisissez une date/heure de publication.", adm_fiche_gen_err_session:"Session admin introuvable — reconnectez-vous.",
adm_fiche_gen_echec:"Aucune fiche générée pour ce plan.", adm_fiche_gen_ok_now:"publiée immédiatement",
adm_fiche_gen_ok_prog:"programmée pour le {h}", adm_fiche_gen_clamped:"cote max ramenée au plafond du plan",
dash_conf:"Confiance moyenne par sélection", dash_totalodd:"Cote totale",
adm_quota_lbl:"Quota API-Sports · {used}/{max} utilisés · {left} restants aujourd'hui",
adm_quota_sport_foot:"Football", adm_quota_sport_basket:"Basketball",
adm_quota_gen_epuise:"⛔ Quota épuisé pour aujourd'hui — génération impossible avant le reset (minuit UTC).", adm_quota_gen_bas:"⚠️ Seulement {left} appels restants — la fiche générée aura un pool de matchs plus pauvre que d'habitude.",
adm_quota_lbl_reel:"Quota API-Sports · {used}/{max} utilisés · {remaining} restants (vérifié à {time})",
adm_quota_inconnu:"⚠️ Quota réel inconnu depuis minuit UTC — aucun appel API-Sports effectué aujourd'hui.",
adm_quota_gen_inconnu:"⚠️ Quota inconnu depuis minuit UTC. Lance un diagnostic (?diag=quota-status) avant de générer pour être sûr.",
adm_apprentissage_btn:"Rapport apprentissage",
adm_apprentissage_indispo:"Rapport indisponible pour le moment.",
adm_apprentissage_vide:"Pas encore assez de résultats réglés pour un rapport.",
adm_apprentissage_labels:"Par label de confiance (A-E)",
adm_apprentissage_marches:"Par championnat + marché",
adm_fiche_gen_basket_p:"Fiche basketball combinée — aucune cote minimale obligatoire, seule la cote max ci-dessus est un plafond strict. Visible par les plans cochés et tous les plans au-dessus (cascade d'accès).",
adm_fiche_gen_basket_submit:"🏀 GÉNÉRER FICHE BASKETBALL",
adm_fiche_gen_basket_bg_attente:"Ça peut prendre 1 à 2 minutes. Reviens dans quelques instants.",
dtk_niveau_haut:"Fiable", dtk_niveau_moyen:"Modéré", dtk_niveau_bas:"Prudence",
dtk_cd_min:"⏱ Premier match dans {n} min", dtk_cd_h:"⏱ Premier match dans {h}h{m}", dtk_cd_j:"⏱ Premier match dans {j} j", dtk_cd_bientot:"⏱ Premier match imminent", dtk_cd_encours:"⏱ Premier match en cours",
dtk_share_btn:"Partager sur WhatsApp", dtk_share_titre:"TICKET GAGNANT", dtk_share_plus:"+{n} autre(s) sélection(s)", dtk_share_mention:"18+ · Jouez de façon responsable", dtk_share_texte:"J'ai gagné avec VIP BETCOTE ! 🎉",
dash_locked_p:"Cette fiche fait partie d'un plan supérieur.", dash_locked_cta:"Voir le plan {plan}", dash_need_plan:"Plan requis",
dash_empty_h:"Rien à afficher", dash_empty_today:"Aucune fiche ne correspond à ce filtre pour aujourd'hui.",
dash_empty_err:"Impossible de lire les fiches pour le moment. Vérifiez votre connexion — elles réapparaîtront automatiquement.",
dash_empty_hist:"Aucune fiche ne correspond à ces filtres.", dash_hist_needs_plan:"Vous devez avoir un plan actif pour voir votre historique de fiches gagnées ou perdues.",
dash_stats_needs_plan:"Vous devez avoir un plan actif pour voir vos statistiques de performance.",
dash_k_avail:"Fiches disponibles", dash_k_legs:"Sélections du jour", dash_k_bestodd:"Meilleure cote", dash_k_locked:"Fiches verrouillées",
dash_k_played:"Fiches jouées", dash_k_won:"Gagnées", dash_k_lost:"Perdues", dash_k_rate:"Taux de réussite",
dash_k_avgodd:"Cote moyenne", dash_k_avgconf:"Confiance moyenne",
dash_k_footrate:"Réussite football", dash_k_footplayed:"Fiches football", dash_k_nbarate:"Réussite NBA", dash_k_nbaplayed:"Fiches NBA",
dash_hist_h:"Historique des fiches", dash_hist_p:"Toutes les fiches publiées avec leur résultat réel — gagnantes comme perdantes.",
dash_stats_h:"Statistiques", dash_stats_p:"Tous ces chiffres sont calculés à partir de l'historique — jamais écrits à la main.",
dash_stats_bysport:"Par discipline",
dash_stats_note:"Le taux de réussite porte sur les fiches ayant un résultat final. Les fiches en cours ne sont pas comptées. Les performances passées ne garantissent pas les résultats futurs.",
dash_note:"Les scores de confiance sont une évaluation de notre équipe d'experts, pas une garantie. Les résultats passés ne garantissent jamais les résultats futurs. Jouez de façon responsable.",
dash_sub_h:"Mon abonnement", dash_sub_p:"Détails de votre plan et de vos dates.",
dash_sub_active:"Actif", dash_sub_pending:"En attente de validation",
dash_sub_suspended:"Compte suspendu",
dash_sub_msg_suspended:"Votre compte est suspendu pour : {reason}. Veuillez contacter le service client !", dash_sub_holder:"Titulaire", dash_sub_email:"E-mail", dash_sub_method:"Moyen de paiement",
dash_pending_change_banner:"Vous avez un changement vers {plan} en attente de confirmation. Votre plan actuel reste actif jusqu'à cette confirmation.",
dash_sub_left:"Temps restant", dash_sub_days:"{n} jour(s)", dash_sub_upgrade:"Changer ou renouveler mon plan",
mk_btts_l:"Les deux équipes marquent", mk_over_l:"Plus / Moins de buts", mk_1x2_l:"1X2",
mk_dc_l:"Double chance", mk_total_l:"Total NBA", mk_hand_l:"Handicap", mk_score_l:"Score exact",
mk_scorer_l:"Buteur", mk_corners_l:"Corners", mk_team_goals_l:"Buts d'une équipe",
pick_oui:"Oui", pick_non:"Non", pick_1:"1 — Victoire domicile", pick_2:"2 — Victoire extérieur",
pick_1x:"1X — Domicile ou nul", pick_x2:"X2 — Nul ou extérieur", pick_12:"12 — Pas de nul",
pick_over15:"Plus de 1.5 buts", pick_over35:"Plus de 3.5 buts",
pick_under25:"Moins de 2.5 buts", pick_under35:"Moins de 3.5 buts",
pick_team_over05:"L'équipe marque", pick_team_over15:"L'équipe marque 2 buts ou plus",
pick_corners_over85:"Plus de 8.5 corners", pick_corners_over95:"Plus de 9.5 corners",
pick_corners_over105:"Plus de 10.5 corners",
pick_over25:"Plus de 2.5 buts", pick_over2255:"Plus de 225.5 points", pick_h45:"Handicap -4.5",
logo_baseline:"Gagnez à chaque fois",
auth_err_password_digit:"Le mot de passe doit contenir au moins un chiffre",
auth_pw_weak:"Faible", auth_pw_mid:"Moyen", auth_pw_strong:"Fort",
wiz_p_or:"ou", wiz_p_stripe:"Payer avec Stripe",
wiz_p_stripe_go_h:"Redirection vers Stripe",
wiz_p_stripe_go_p:"Vous allez être redirigé vers la page de paiement sécurisée.",
wiz_p_stripe_nosession:"Votre session a expiré. Reconnectez-vous avant de payer par carte.",
wiz_p_stripe_indispo:"Le paiement par carte n'est pas disponible pour ce plan pour le moment.",
stripe_back_h:"Paiement reçu",
stripe_back_p:"Votre paiement a bien été reçu. Votre abonnement s'active dans quelques instants.",
legal_updated:"Mise à jour : août 2026",
hero_why:"POUKISA'W DWE ENSKRI NAN VIPBETCOTE??",
auth_lbl_username:"Nom d'utilisateur", auth_ph_username:"Choisissez un nom d'utilisateur",
auth_optional:"(facultatif)",
auth_err_email_temp:"Les adresses e-mail temporaires ne sont pas acceptées",
dash_soon_h:"Votre abonnement expire dans {n} jour(s)",
dash_soon_sub:"Renouvelez maintenant pour ne pas perdre l'accès aux fiches.",
dash_change_pass:"Changer mon mot de passe",
pwr_h_mail:"Réinitialiser votre mot de passe", pwr_sub_mail:"Saisissez l'e-mail de votre compte, nous vous enverrons un code.",
pwr_h_code:"Saisissez le code reçu", pwr_sub_code:"Le code à 6 chiffres est valable quelques minutes.",
pwr_h_new:"Choisissez un nouveau mot de passe", pwr_sub_new:"8 caractères minimum, dont au moins un chiffre.",
pwr_lbl_new:"Nouveau mot de passe",
pwr_btn_send:"Envoyer le code", pwr_btn_save:"Enregistrer le nouveau mot de passe",
pwr_back_login:"Retour à la connexion",
pwr_err_nouser:"Aucun compte n'est associé à cet e-mail",
pwr_err_generic:"Une erreur est survenue. Réessayez dans un instant.",
pwr_toast_h:"Mot de passe modifié", pwr_toast_p:"Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
auth_back:"Retour",
toast_mail_h:"E-mail de vérification envoyé",
toast_mail_p:"Nous avons envoyé un code à {email}. Vérifiez votre boîte de réception, et le dossier spam si besoin.",
dash_brand_sub:"Dashboard",
dash_soon_cta:"Renouveler",
dash_back:"Retour", renew_err_inferieur:"Vous ne pouvez pas passer à un plan inférieur tant que votre plan actuel n'est pas dans sa période de fin.",
plan_changed_h:"Abonnement modifié", plan_changed_p:"Vous avez changé d'abonnement.",
notif_plan_change:"Vous avez changé d'abonnement : {plan}",
notif_renewed:"Votre abonnement {plan} a été renouvelé",
notif_expired:"Votre abonnement a expiré",
notif_soon:"Votre abonnement expire dans {n} jour(s)",
notif_today:"{n} fiche(s) disponible(s) aujourd'hui",
notif_won_foot:"Une de vos fiches Football est gagnante", notif_won_basket:"Une de vos fiches Basketball est gagnante", notif_won_exact:"Votre fiche Score Exact est gagnante",
notif_ago_min:"Il y a {n} min", notif_ago_h:"Il y a {n} h", notif_ago_d:"Il y a {n} j",
dash_badge_none:"Aucun plan",
err_action_unavailable_h:"Action indisponible", err_action_unavailable_p:"Cette action est temporairement indisponible. Veuillez réessayer dans quelques secondes.",
notif_pay_pending:"Votre paiement pour {plan} est en attente de validation", notif_pay_confirmed:"Votre paiement pour {plan} a été confirmé", notif_pay_rejected:"Votre paiement pour {plan} a été refusé : {raison}", notif_pay_rejected_defaut:"raison non précisée",
dash_f_other:"Fiches autres plans",
dash_empty_other:"Toutes les fiches du jour sont incluses dans votre plan.",
dash_sub_lifetime:"Lifetime — sans expiration",
wiz_v_sub2:"Nous avons envoyé un code à 6 chiffres à votre adresse.",
wiz_v_back:"Changer d'adresse e-mail",
dash_tag_pair:"À jouer par 2", dash_score_count:"{n} scores exacts",
plan_changed_carry:"Vos {n} jour(s) restant(s) ont été ajoutés.",
renew_err_pending:"Votre paiement précédent est encore en attente de validation par notre équipe. Vous pourrez changer ou renouveler votre plan une fois qu'il sera confirmé.", renew_err_email_non_verifie:"Votre email doit d'abord être vérifié (code reçu par email lors de l'inscription) avant de pouvoir vous abonner. Vérifiez votre boîte de réception, ou contactez le support si vous ne trouvez pas le code.",
pending_toast_h:"Paiement en attente",
renew_err_encours:"Ce plan est déjà en cours.",
renew_err_lifetime:"Vous possédez déjà l'abonnement à vie (Lifetime) — aucun changement n'est nécessaire.",
renew_toast_h:"Renouvellement impossible",
lifetime_toast_h:"Aucun changement nécessaire",
change_toast_h:"Changement de plan impossible",
renew_success_h:"Abonnement renouvelé",
renew_success_p:"Votre abonnement a été renouvelé avec succès.",
pay_pending_note:"Ce paiement est en attente de validation par notre équipe.",
pay_timeout_h:"Session de paiement expirée",
pay_timeout_p:"Par sécurité, veuillez recommencer.",
session_stale_h:"Compte ouvert ailleurs",
session_stale_p:"Ce compte est ouvert dans une autre fenêtre. Rafraîchissez la page pour continuer.",
dash_menu_lang:"Langue",
adm_role_badge:"ADMIN",
adm_nav_home:"Vue d'ensemble", adm_nav_users:"Utilisateurs", adm_nav_payments:"Paiements", adm_nav_revenus:"Revenus", adm_nav_plans:"Plans", adm_nav_fiches:"Fiches", adm_nav_faq:"FAQ", adm_nav_testimonials:"Témoignages", adm_nav_landing:"Stats accueil", adm_nav_settings:"Paramètres",
adm_rev_h:"Revenus", adm_rev_p:"Mêmes chiffres que l'accueil, toujours synchronisés — paiements confirmés uniquement.",
adm_rev_total:"Revenu total confirmé", adm_rev_total_note:"Tout historique, paiements validés uniquement.",
adm_rev_mois:"Revenu ce mois-ci", adm_rev_paiements:"Paiements confirmés ce mois-ci",
adm_rev_attente:"En attente de validation", adm_rev_attente_note:"{n} paiement(s) — jamais compté comme revenu tant que non validé.",
adm_rev_tx_h:"Historique des transactions", adm_rev_tx_more:"Charger les plus anciennes",
adm_settings_h:"Paramètres", adm_settings_p:"Votre mot de passe et la sécurité de votre compte admin.",
adm_settings_pw_h:"Changer le mot de passe",
adm_settings_pw_new:"Nouveau mot de passe", adm_settings_pw_confirm:"Confirmer le nouveau mot de passe",
adm_settings_pw_save:"Enregistrer le mot de passe",
adm_settings_pw_start_p:"Par sécurité, un code de vérification vous sera envoyé par e-mail avant de pouvoir changer votre mot de passe.",
adm_settings_pw_start_btn:"Changer le mot de passe",
adm_settings_pw_code_p:"Entrez le code envoyé à {email}.",
adm_settings_pw_err:"Le changement a échoué.",
adm_settings_pw_toast_h:"Mot de passe modifié", adm_settings_pw_toast_p:"Votre mot de passe a été changé avec succès.",
adm_settings_2fa_h:"Double authentification (2FA)",
adm_settings_2fa_on_p:"Le 2FA est activé sur ce compte. Un code sera demandé à chaque connexion.",
adm_settings_2fa_off_p:"Le 2FA n'est pas activé. Activez-le pour renforcer la sécurité de ce compte admin — totalement optionnel.",
adm_settings_2fa_enable:"Activer le 2FA", adm_settings_2fa_disable:"Désactiver le 2FA",
adm_settings_2fa_err:"L'action a échoué.",
adm_settings_2fa_on_h:"2FA activé", adm_settings_2fa_on_toast:"La double authentification est maintenant active sur ce compte.",
adm_settings_2fa_off_h:"2FA désactivé", adm_settings_2fa_off_toast:"La double authentification a été retirée de ce compte.",
adm_confirm_q_pw_change:"Confirmer le changement de mot de passe ?",
adm_confirm_q_2fa_disable:"Confirmer la désactivation du 2FA ? Votre compte sera moins protégé.",
adm_fiches_h:"Fiches", adm_fiches_p:"Fiches pour chaque jour, groupées par plan. L'historique reste toujours disponible.",
adm_fiches_date_lbl:"Date", adm_fiches_new:"+ Nouvelle fiche", adm_fiches_empty:"Aucune fiche pour cette date.", adm_fiches_tous_plans:"Tous",
adm_fiche_draft:"brouillon", adm_fiche_legs:"match(s)",
adm_fiche_st_pending:"En cours", adm_fiche_st_won:"Gagné", adm_fiche_st_lost:"Perdu",
adm_fiche_kind_normal:"Cote normal", adm_fiche_kind_exact:"Score exact", adm_fiche_kind_basket:"Basketball",
adm_fiche_src_bot:"BOT", adm_fiche_src_admin:"ADMIN",
adm_fiches_tab_day:"Du jour", adm_fiches_tab_hist:"Historique",
adm_fiches_f_all:"Tous", adm_fiches_f_pending:"En cours", adm_fiches_f_won:"Gagnés", adm_fiches_f_lost:"Perdus",
adm_fiches_hist_empty:"Aucune fiche dans l'historique pour ce filtre.",
adm_fiches_load_more:"Charger plus",
adm_fiches_sync_last:"Dernière synchronisation : {d}", adm_fiches_sync_never:"Aucune synchronisation enregistrée",
adm_fiches_sync_next:"Prochaine génération automatique : {d}",
adm_fiche_leg_locked:"Match terminé — résultat réglé, modification protégée",
adm_fiche_leg_unlock:"Modifier quand même", adm_fiche_leg_edit:"Modifier ce match",
adm_fiche_odds_total:"Cote totale : {n}", adm_fiche_odds_range:"plage autorisée {min} – {max}",
adm_fiche_odds_unlimited:"illimitée", adm_fiche_odds_risky:"{n} sélection(s) au-dessus de {max}",
adm_fiche_err_odds_range:"Cote totale {n} hors de la plage autorisée ({min} – {max}).",
adm_fiche_err_odds_plan:"Cote hors de la plage du plan",
adm_fiche_err_code_dup:"Cette référence est déjà utilisée par une autre fiche.",
adm_fiche_err_forbidden:"Action non autorisée.",
adm_fiche_code:"Référence", adm_fiche_code_ph:"Ex. : VB-2451 (optionnel)",
adm_fiche_plan:"Plan minimum requis", adm_fiche_sport:"Sport",
adm_fiche_sport_foot:"Football", adm_fiche_sport_nba:"Basketball",
adm_fiche_confidence:"Score de confiance (%)", adm_fiche_date:"Date de la fiche", adm_fiche_status:"Résultat",
adm_fiche_legs_h:"Matchs de la fiche",
adm_fiche_leg_match:"Équipes (ex. Chelsea - Liverpool)", adm_fiche_leg_time:"Heure",
adm_fiche_leg_league:"Championnat", adm_fiche_leg_market:"Marché (ex. Les 2 équipes marquent)",
adm_fiche_leg_pick:"Pronostic (ex. Oui)", adm_fiche_leg_odd:"Cote",
adm_fiche_leg_remove:"Retirer ce match", adm_fiche_leg_add:"+ Ajouter un match",
adm_fiche_leg_none:"Aucun match ajouté pour l'instant.",
adm_fiche_save:"Enregistrer la fiche", adm_fiche_delete:"Supprimer cette fiche",
adm_fiche_err_incomplete:"La date est obligatoire.",
adm_fiche_err_nolegs:"Ajoutez au moins un match.",
adm_fiche_err_leg_incomplete:"Chaque match doit avoir au moins les équipes, le pronostic et la cote.",
adm_fiche_err_save:"L'enregistrement a échoué.",
adm_fiche_toast_h:"Fiche enregistrée", adm_fiche_toast_p:"Visible immédiatement si publiée.",
adm_fiche_toast_del_h:"Fiche supprimée", adm_fiche_toast_del_p:"Elle n'apparaît plus nulle part.",
adm_menu_exit:"Déconnecter",
adm_home_h:"Vue d'ensemble", adm_home_p:"Chiffres réels, directement issus de la base de données.",
adm_refresh:"Rafraîchir", adm_updated_at:"Mis à jour à {t}",
adm_k_loading:"Chargement...", adm_k_offline:"Connexion indisponible", adm_k_error:"Erreur de lecture",
adm_activity_h:"Activité récente", adm_activity_empty:"Aucun paiement en attente pour l'instant.",
adm_activity_pending_pay:"Paiement en attente — {name}",
adm_k_users:"Utilisateurs", adm_k_subs_active:"Abonnements actifs", adm_k_pay_pending:"Paiements en attente", adm_k_tickets:"Fiches en cours",
adm_k_users_note:"Comptes enregistrés au total.", adm_k_subs_note:"Comptes uniques, hors suspendus.", adm_k_pay_note:"À valider maintenant.", adm_k_tickets_note:"En cours actuellement.",
adm_users_h:"Utilisateurs", adm_users_p:"Recherche et détail de chaque compte, directement depuis la base de données.",
adm_users_search_ph:"Chercher par e-mail...", adm_users_count:"{n} compte(s)", adm_users_empty:"Aucun compte trouvé.",
adm_badge_none:"Aucun plan", adm_badge_expired:"expiré", adm_no_name:"Sans nom", adm_badge_suspended:"Suspendu",
adm_confirm_yes:"Oui", adm_confirm_no:"Non", adm_role_admin:"Admin",
adm_confirm_q_valider:"Confirmer la validation de ce paiement ?",
adm_confirm_q_refuser:"Confirmer le refus de ce paiement ?",
adm_confirm_q_planchange:"Confirmer le changement de plan ?",
adm_confirm_q_suspend:"Confirmer la suspension de ce compte ?",
adm_confirm_q_reactivate:"Confirmer la réactivation de ce compte ?",
adm_confirm_q_plan_save:"Confirmer la modification de ce plan ? Le changement s'applique immédiatement sur tout le site.",
adm_plans_h:"Plans", adm_plans_p:"Modifiez le prix et la durée de chaque plan — les changements s'appliquent PARTOUT sur le site, immédiatement.",
adm_plans_empty:"Aucun plan trouvé.",
adm_plans_price_lbl:"Prix (HTG)",
adm_plans_price_before_lbl:"Prix barré (optionnel, argument marketing)",
adm_plans_price_before_ph:"Ex. : 999 (laisser vide pour ne rien afficher)",
adm_plans_err_price_before:"Entrez un prix barré valide ou laissez vide.",
adm_plans_days_lbl:"Durée (jours) — laisser vide pour Lifetime",
adm_plans_days_ph:"Ex. : 21 (vide = sans expiration)",
adm_plans_save:"Enregistrer", adm_plans_err_price:"Entrez un prix valide.", adm_plans_err_days:"Entrez un nombre de jours valide ou laissez vide.",
adm_plans_err_save:"L'enregistrement a échoué.",
adm_plans_toast_h:"Plan modifié", adm_plans_toast_p:"Le nouveau prix est actif immédiatement sur tout le site.",
adm_order_lbl:"Ordre d'affichage", adm_published_toggle:"Publié (visible sur le site)",
adm_published:"Publié", adm_draft:"Brouillon",
adm_confirm_q_save:"Confirmer l'enregistrement ?", adm_confirm_q_delete:"Confirmer la suppression ? Cette action est définitive.",
adm_faq_h:"FAQ", adm_faq_p:"Questions affichées dans le panneau FAQ dédié du site — publiées uniquement quand vous l'indiquez.",
adm_faq_new:"+ Nouvelle question", adm_faq_empty:"Aucune question pour l'instant.",
adm_faq_q_ht:"Question (Créole)", adm_faq_q_fr:"Question (Français)", adm_faq_q_en:"Question (Anglais)", adm_faq_q_ph:"Écrivez la question…",
adm_faq_a_ht:"Réponse (Créole)", adm_faq_a_fr:"Réponse (Français)", adm_faq_a_en:"Réponse (Anglais)", adm_faq_a_ph:"Écrivez la réponse…",
adm_faq_save:"Enregistrer", adm_faq_delete:"Supprimer cette question",
adm_faq_err_incomplete:"Remplissez la question et la réponse dans les 3 langues.",
adm_faq_err_save:"L'enregistrement a échoué.",
adm_faq_toast_h:"Question enregistrée", adm_faq_toast_p:"Visible immédiatement sur le site si publiée.",
adm_faq_toast_del_h:"Question supprimée", adm_faq_toast_del_p:"Elle n'apparaît plus sur le site.",
adm_testi_h:"Témoignages", adm_testi_p:"Témoignages clients, ajoutés manuellement et publiés quand vous le décidez.",
adm_testi_new:"+ Nouveau témoignage", adm_testi_empty:"Aucun témoignage pour l'instant.",
adm_landing_h:"Statistiques de la page d'accueil", adm_landing_p:"Ces chiffres apparaissent sur la page d'accueil — les changements s'appliquent PARTOUT sur le site immédiatement.",
adm_landing_users_lbl:"Utilisateurs actifs", adm_landing_tickets_lbl:"Fiches réussies", adm_landing_rate_lbl:"Taux de réussite (%)", adm_landing_trust_lbl:"Note Trustpilot (sur 5)",
adm_landing_err_users:"Entrez un nombre d'utilisateurs valide.", adm_landing_err_tickets:"Entrez un nombre de fiches valide.", adm_landing_err_rate:"Entrez un taux entre 0 et 100.", adm_landing_err_trust:"Entrez une note entre 0 et 5.",
adm_landing_err_save:"Échec de l'enregistrement",
adm_landing_toast_h:"Statistiques mises à jour", adm_landing_toast_p:"Les nouveaux chiffres sont actifs immédiatement sur la page d'accueil.",
adm_testi_author:"Nom de l'auteur",
adm_testi_content_ht:"Témoignage (Créole)", adm_testi_content_fr:"Témoignage (Français)", adm_testi_content_en:"Témoignage (Anglais)",
adm_testi_rating:"Note",
adm_testi_save:"Enregistrer", adm_testi_delete:"Supprimer ce témoignage",
adm_testi_err_incomplete:"Remplissez le nom et le témoignage dans les 3 langues.",
adm_testi_err_save:"L'enregistrement a échoué.",
adm_testi_toast_h:"Témoignage enregistré", adm_testi_toast_p:"Visible immédiatement sur le site si publié.",
adm_testi_toast_del_h:"Témoignage supprimé", adm_testi_toast_del_p:"Il n'apparaît plus sur le site.",
adm_user_pending_pay_h:"Paiement en attente",
adm_user_profile_h:"Profil", adm_user_role:"Rôle", adm_user_site:"Site préféré", adm_user_since:"Membre depuis",
adm_user_current_plan:"Plan actuel", adm_user_no_plan:"Aucun",
adm_user_change_plan_h:"Changer le plan", adm_user_change_plan_lbl:"Nouveau plan",
adm_user_change_plan_reason_lbl:"Note (optionnelle)", adm_user_change_plan_reason_ph:"Ex. : geste commercial, correction d'erreur...",
adm_user_change_plan_apply:"Appliquer le changement", adm_user_change_plan_same:"C'est déjà le plan actuel de cet utilisateur.",
adm_user_change_plan_err:"Le changement a échoué.",
adm_user_suspend_h:"Suspension du compte",
adm_user_suspend_reason_lbl:"Raison (obligatoire — visible par le service client)",
adm_user_suspend_reason_ph:"Ex. : paiement frauduleux signalé, abus des conditions d'utilisation...",
adm_user_suspend_btn:"Suspendre ce compte", adm_user_reactivate_btn:"Réactiver ce compte",
adm_user_suspend_reason_required:"Une raison est obligatoire pour suspendre un compte.",
adm_user_suspend_err:"L'action a échoué.", adm_user_suspended_since:"Suspendu le",
adm_user_plan_changed_h:"Plan modifié", adm_user_plan_changed_p:"Le nouveau plan est actif immédiatement.", adm_user_plan_removed_p:"Le plan a été retiré. Cet utilisateur n'a plus aucun plan actif.", adm_user_plan_none_option:"— Aucun plan (retirer) —",
adm_user_suspended_h:"Compte suspendu", adm_user_suspended_p:"L'utilisateur ne pourra plus se connecter.", adm_leg_result_lbl:"Résultat", adm_leg_result_none:"Pas encore joué", adm_leg_result_won:"Gagné", adm_leg_result_lost:"Perdu", adm_leg_result_void:"Annulé",
adm_user_reactivated_h:"Compte réactivé", adm_user_reactivated_p:"L'utilisateur peut de nouveau se connecter.",
adm_section_subs:"Abonnements", adm_section_pays:"Paiements", adm_none_yet:"Aucun pour l'instant.",
adm_pay_h:"Paiements", adm_pay_p:"Validez ou refusez les paiements soumis, directement depuis la base de données.",
adm_pay_f_pending:"En attente", adm_pay_f_confirmed:"Confirmés", adm_pay_f_rejected:"Refusés", adm_pay_f_refunded:"Remboursés",
adm_pay_count:"{n} paiement(s)", adm_pay_empty:"Aucun paiement dans cette catégorie.",
adm_pay_plan:"Plan", adm_pay_amount:"Montant", adm_pay_method:"Moyen de paiement", adm_pay_ref:"Référence",
adm_pay_date:"Date", adm_pay_status:"Statut", adm_pay_confirmed_at:"Validé le",
adm_pay_reason_h:"Raison du refus", adm_pay_action_h:"Décision",
adm_pay_reason_lbl:"Raison (obligatoire si refus)", adm_pay_reason_ph:"Ex. : référence introuvable, montant incorrect...",
adm_pay_valider:"Valider", adm_pay_refuser:"Refuser",
adm_pay_reason_required:"Une raison est obligatoire pour refuser un paiement.",
adm_pay_blocked_suspended:"Ce compte est suspendu : aucune décision (confirmer ou refuser) n'est possible tant que le compte reste suspendu. Réactivez d'abord le compte.",
adm_pay_action_error:"Action impossible. Vérifiez la connexion et réessayez.",
adm_pay_toast_confirmed_h:"Paiement validé", adm_pay_toast_confirmed_p:"L'abonnement est désormais actif.",
adm_pay_toast_rejected_h:"Paiement refusé", adm_pay_toast_rejected_p:"L'utilisateur verra la raison du refus.",
sb_sync_err_h:"Compte créé localement uniquement",
sb_sync_err_p:"La synchronisation avec le serveur a échoué. Réessayez plus tard depuis Mon abonnement.",
sb_pay_sync_err_p:"Le paiement n'a pas pu être enregistré côté serveur — il ne sera jamais visible dans l'espace admin en l'état.",
pwr_back_dash:"Retour au tableau de bord",
wiz_sending:"Voye...",
toast_mail_err_h:"Envoi impossible",
toast_mail_err_p:"L'e-mail n'a pas pu être envoyé. Réessayez dans un instant.",
plan_changed_lifetime:"Vous avez débloqué l'accès à vie !", dash_menu_exit:"Déconnecter",
wiz_p_moncash:"MonCash otomatik", wiz_p_natcash:"NatCash otomatik",
wiz_p_auto_badge:"Recommandé", wiz_p_auto_sub:"Confirmation automatique — moins d'une minute en général",
auth_err_email_taken:"Cette adresse e-mail est déjà enregistrée",
auth_err_badpass:"Mot de passe incorrect",
auth_err_nouser:"Aucun compte trouvé avec cet identifiant",
auth_taken_h:"Cette adresse e-mail est déjà enregistrée",
auth_taken_sub:"Un compte existe déjà avec cet e-mail. Rendez-vous sur la page de connexion pour y accéder.",
auth_suspended_h:"Compte suspendu",
auth_suspended_p:"Ce compte est actuellement suspendu. Contactez le service client pour plus d'informations.",
auth_suspended_reason_p:"Votre compte a été suspendu pour : {reason}. Veuillez contacter le service client !",
mfa_enroll_h:"Sécurisez votre compte admin",
mfa_enroll_p:"Scannez ce code QR avec Google Authenticator (ou une application similaire), puis entrez le code à 6 chiffres pour l'activer.",
mfa_challenge_h:"Vérification en 2 étapes",
mfa_challenge_p:"Entrez le code à 6 chiffres de votre application d'authentification.",
mfa_err_code:"Code incorrect", mfa_btn_activate:"Activer le 2FA", mfa_btn_verify:"Vérifier",
mfa_error_h:"Problème avec le 2FA", mfa_error_p:"Impossible de continuer pour le moment. Réessayez — l'accès au tableau de bord reste bloqué tant que le 2FA n'est pas vérifié.",
mfa_error_cleanup:"Impossible de nettoyer une inscription précédente.",
mfa_error_nofactor:"Aucun code d'authentification actif trouvé.",
mfa_btn_retry:"Réessayer",
mfa_copy:"Copier", mfa_copied:"Copié !",
mfa_remember:"Se souvenir de cet appareil pendant 30 jours",
mfa_use_backup:"Utiliser un code de secours",
mfa_backup_h:"Code de secours", mfa_backup_p:"Entrez un des codes de secours que vous avez téléchargés.",
mfa_backup_err:"Ce code est invalide ou déjà utilisé.",
mfa_back_to_code:"Revenir au code habituel",
mfa_codes_h:"Vos codes de secours",
mfa_codes_p:"Conservez ces codes dans un endroit sûr. Chaque code n'est utilisable qu'une seule fois, si jamais vous perdez l'accès à votre application d'authentification.",
mfa_codes_download:"Télécharger les codes",
mfa_codes_continue:"Continuer",
auth_taken_cta:"Aller à la connexion",
wiz_r_h:"Renouveler ou changer de plan", wiz_r_sub:"Choisissez votre plan et réglez — votre compte est déjà créé.",
wiz_r_active:"Votre abonnement en cours reste actif. Le nouveau plan démarre après le paiement.",
wiz_r_expired:"Votre abonnement a expiré. Réglez pour débloquer à nouveau les cotes.",
dash_expired_h:"Votre abonnement a expiré",
dash_expired_sub:"Vous gardez l'accès au tableau de bord, mais toutes les cotes sont verrouillées. Renouvelez ou choisissez un autre plan pour les débloquer.",
dash_expired_cta:"Renouveler mon plan",
dash_expired_p:"Votre abonnement a expiré. Renouvelez pour revoir les cotes.",
dash_sub_expired:"Expiré",
dash_activate_cta:"Activer mon plan", dash_rejected_ov_p:"Votre paiement n'a pas abouti. Activez un plan pour voir les cotes.", dash_sub_rejected:"Paiement non réussi", dash_sub_noplan:"Vous n'avez aucun plan actif pour le moment. Activez un plan pour débloquer les fiches et les cotes.",
dash_pending_h:"Paiement en cours de vérification",
dash_pending_sub:"Votre paiement est en attente de confirmation par notre équipe. Vos pronostics seront débloqués automatiquement dès validation.",
dash_pending_ov_p:"En attente de validation de votre paiement.", dash_sub_msg_pending_plan:"Votre demande d'abonnement {plan} est en attente de validation par notre équipe. Vous pourrez faire une nouvelle demande une fois qu'elle sera confirmée ou refusée.",
dash_sub_msg_rejected:"Votre changement de plan a échoué. Merci de réessayer.",
dash_sub_msg_expired:"Votre abonnement est expiré. Veuillez réactiver un abonnement maintenant !",
dash_sub_msg_renew_soon:"Veuillez renouveler votre abonnement avant le {date}.",
dash_sub_msg_active:"Votre nouveau plan {plan} est activé avec succès.",
faq2_q:"Garantissez-vous des gains ?",
legal_tag_cgu:"Légal", legal_tag_confid:"Légal", legal_tag_jeu:"Légal",
legal_note:"Ce document est une version générale. Avant publication officielle, il doit être relu par un conseiller juridique.",
legal_cgu_body:"<h3>1. Objet</h3><p>VIP BETCOTE est un service d'information qui publie des analyses et des sélections sportives à titre indicatif. La plateforme n'est ni un opérateur de paris, ni un intermédiaire de mise. Aucun pari n'est placé, encaissé ni reversé par VIP BETCOTE.</p><h3>2. Accès au service</h3><p>L'accès est réservé aux personnes âgées de <strong>18 ans ou plus</strong>. La création d'un compte nécessite une adresse e-mail valide et un numéro de téléphone. Vous êtes responsable de l'exactitude des informations fournies et de la confidentialité de votre mot de passe.</p><h3>3. Abonnements et paiement</h3><ul><li>Les tarifs sont affichés en gourdes (HTG) et payables via MonCash, NatCash ou carte bancaire.</li><li>L'abonnement démarre à la validation du paiement et prend fin à la date d'expiration indiquée dans votre tableau de bord.</li><li>Les abonnements à durée déterminée ne se renouvellent pas automatiquement.</li><li>Le plan à vie est un paiement unique, sans renouvellement.</li></ul><h3>4. Absence de garantie de gains</h3><p>Les paris sportifs comportent un risque de perte financière. <strong>Aucune sélection publiée ne constitue une garantie de gain.</strong> Les scores de confiance sont une évaluation subjective de notre équipe. Les performances passées ne préjugent pas des résultats futurs. Vous restez seul décideur de vos mises et seul responsable de vos pertes éventuelles.</p><h3>5. Utilisation du contenu</h3><p>Les sélections publiées sont réservées à votre usage personnel. Leur revente, rediffusion ou publication sur un autre support est interdite et peut entraîner la fermeture immédiate du compte, sans remboursement.</p><h3>6. Suspension et résiliation</h3><p>Nous pouvons suspendre un compte en cas de partage d'identifiants, de fraude au paiement, ou de non-respect des présentes conditions. Vous pouvez cesser d'utiliser le service à tout moment.</p><h3>7. Modifications</h3><p>Ces conditions peuvent évoluer. Les utilisateurs actifs sont informés des changements importants par e-mail ou via une notification dans le tableau de bord.</p>",
legal_confid_body:"<h3>1. Données collectées</h3><p>Nous collectons uniquement ce qui est nécessaire au fonctionnement du service :</p><ul><li><strong>Compte</strong> : nom, adresse e-mail, numéro de téléphone, mot de passe (stocké sous forme chiffrée, jamais en clair).</li><li><strong>Abonnement</strong> : plan choisi, dates de début et d'expiration, référence de transaction, moyen de paiement utilisé.</li><li><strong>Usage</strong> : date de dernière connexion et préférence de langue.</li></ul><h3>2. Données bancaires</h3><p>Les numéros de carte et identifiants de portefeuille mobile sont saisis directement chez le prestataire de paiement. <strong>Nous ne stockons aucune donnée bancaire</strong> sur nos serveurs.</p><h3>3. Utilisation</h3><p>Vos données servent à créer et sécuriser votre compte, activer et suivre votre abonnement, vous envoyer les notifications liées au service, et répondre à vos demandes de support. Elles ne sont pas utilisées à d'autres fins.</p><h3>4. Partage</h3><p>Nous ne vendons ni ne louons vos données. Elles ne sont transmises qu'aux prestataires strictement nécessaires — hébergement, envoi d'e-mails, traitement des paiements — et uniquement pour la part nécessaire à leur mission.</p><h3>5. Conservation</h3><p>Les données de compte sont conservées tant que le compte est actif. Après suppression, elles sont effacées sous 30 jours, à l'exception des justificatifs de paiement conservés pour obligation comptable.</p><h3>6. Vos droits</h3><p>Vous pouvez demander à consulter, corriger ou supprimer vos données, ainsi qu'à recevoir une copie de votre compte. Une demande envoyée depuis l'adresse e-mail enregistrée est traitée sous 30 jours.</p><h3>7. Sécurité</h3><p>Les mots de passe sont chiffrés, les échanges circulent en HTTPS, et l'accès aux données est limité aux personnes qui en ont besoin. Aucun système n'étant infaillible, nous vous recommandons un mot de passe unique et long.</p>",
legal_jeu_body:"<h3>Le pari doit rester un loisir</h3><p>Parier n'est pas une source de revenus et ne doit jamais être considéré comme un moyen de rembourser une dette ou de compenser une perte. <strong>Ne misez que ce que vous pouvez perdre sans que cela change votre quotidien.</strong></p><h3>Ce que nous ne promettons pas</h3><p>VIP BETCOTE publie des analyses, pas des certitudes. Aucune sélection n'est garantie. Notre historique affiche les fiches perdantes au même titre que les gagnantes, précisément parce que les pertes font partie de l'activité.</p><h3>Signaux qui doivent alerter</h3><ul><li>Vous misez des sommes de plus en plus élevées pour ressentir le même intérêt.</li><li>Vous rejouez immédiatement pour récupérer une perte.</li><li>Vous empruntez de l'argent, ou vous puisez dans un budget prévu pour autre chose.</li><li>Vous cachez vos mises à vos proches.</li><li>Vous jouez pour échapper au stress, à l'ennui ou à la tristesse.</li><li>Vous avez déjà essayé d'arrêter sans y parvenir.</li></ul><h3>Garder le contrôle</h3><ul><li>Fixez un budget mensuel avant de commencer, et n'en sortez pas.</li><li>Fixez aussi une limite de temps.</li><li>Ne jouez jamais sous l'effet de l'alcool, de la fatigue ou de la colère.</li><li>Après une perte, arrêtez la journée plutôt que de rejouer.</li><li>Vérifiez régulièrement le total réellement misé sur un mois.</li></ul><h3>Interdit aux mineurs</h3><p>Ce service est strictement réservé aux personnes de <strong>18 ans ou plus</strong>. Tout compte identifié comme appartenant à un mineur est fermé sans remboursement.</p><h3>Demander de l'aide</h3><p>Si le jeu prend une place qui vous inquiète, parlez-en à une personne de confiance, à un médecin ou à un psychologue. En parler tôt rend les choses beaucoup plus simples. Vous pouvez aussi nous écrire pour demander la fermeture définitive de votre compte : nous appliquons cette demande sans discussion.</p>",
},
en: {
nav_tickets:"WINNING SLIPS", nav_simulateur:"TRY THE DEMO", nav_abonnements:"Plans", nav_faq:"FAQ",
btn_connect:"Log in", btn_signup:"Sign up", btn_signup_free:"Sign up for free",
tick_won:"WON",
hero_badge:"EXPERTS ONLINE &nbsp;•&nbsp; +42 PICKS TODAY",
hero_t1:"PREMIUM", hero_t2:"BETTING", hero_t3:"PICKS", hero_t4:"EXCELLENCE",
hero_sub:"The biggest tipping platform helping you win on ParyajPam, ParyajLakay and 1xBet. We have 6 years of experience. If you want to stop losing your money, pick a plan below right now.",
hero_cta1:"GET STARTED NOW",
rating_label:"Excellent on Trustpilot",
stat_garanti:"GUARANTEED", stat_garanti_lab:"REFUND IF YOU DO NOT WIN ONCE",
stat_pronostiqueurs:"ACTIVE USERS", stat_pronostics_jour:"SUCCESSFUL PICKS", stat_gratuits:"WINNING PICKS",
ticket_title:"WINNING TICKETS",
mk_btts:"Both teams to score", mk_over:"Over 225.5",
mk_1x2:"Match winner", mk_double_chance:"Double chance", mk_total_buts:"Total goals",
mk_total_domicile:"Home team total goals", mk_total_exterieur:"Away team total goals",
mk_score_exact:"Correct score", mk_buteur:"Goalscorer",
lbl_cote:"Odds", lbl_cote_totale:"TOTAL ODDS", badge_valide:"VERIFIED",
sim_title:"TRY THIS DEMO AND SEE WHAT YOUR MONEY MAKES",
sim_sub:"Pick an amount and pick a PLAN to see what you make on ParyajPam.",
sim_step1:"1. CHOOSE THE AMOUNT (Gdes HTG)", sim_step2:"2. CHOOSE A VIP SUBSCRIPTION PLAN",
result_title:"WHAT YOU MAKE",
lbl_gain_brut:"GROSS POTENTIAL WINNINGS", lbl_profit_net:"NET PROFIT", sim_cta:"ACTIVATE SUBSCRIPTION",
word_formule:"PLAN",
ab_populaire:"Most popular",
faq6_q:"How will I receive the Cote?",
faq6_a:"You get 2 slips every day once you subscribe to VIP. After payment you get a dashboard where the slips are published daily. You also receive them on Telegram, in the VIP group. The group link is sent to you once you have signed up.",
faq7_q:"How is the displayed success rate calculated?",
faq7_a:"Every tip is recorded with its real outcome, winning or losing. The rate shown is computed from that complete history — it is never typed in by hand.",
faq8_q:"Are my data and my account protected?",
faq8_a:"Your data is protected and your sessions are secured. You can review and revoke your active sessions from your settings, and our team stays reachable at every step.",
tg_tag:"Verified results", tg_h2:"Yesterday's winning tickets",
tg_p:"Photos of real winning tickets, published exactly as they are. Every result stays available in the full history.",
ab_tag:"Plans", ab_h2:"Choose a plan",
ab_p:"One plan, daily slips analysed by our team of experts. Pay in Gdes via MonCash, NatCash and Card/PayPal.",
ab_btn_commencer:"Get started",
ab_btn_vip:"Go VIP",
ab_btn_lifetime:"S&rsquo;ABONNER", ab_btn_sabonner:"S&rsquo;ABONNER",
faq_h2:"Frequently asked questions",
faq1_q:"How are the picks selected?", faq1_a:"Every pick is proposed and reviewed by our team of experts. Every day we study the available football and NBA matches, evaluate the markets on offer, and publish single and combo picks, each with a confidence score set by our analysts.",
faq2_a:"After analysis and according to our statistics, we show a score of 83% validated slips and over 8,390 successful slips. Our full history stays open to view, losing slips included.",
faq3_q:"How do I pay for my subscription?", faq3_a:"Via MonCash, NatCash, Card/PayPal. Depending on the method chosen, the plan is activated automatically or after admin approval.",
faq4_q:"Which sports and bet types are covered?", faq4_a:"Football, NBA, and more. Markets available on ParyajPam, ParyajLakay, 1xBet, etc.: 1X2, Double Chance, Both teams to score, Over/Under goals, Handicap, Goalscorer, NBA Total, etc.",
faq5_q:"Can I cancel my subscription?", faq5_a:"Yes. Monthly subscriptions simply stop at their expiry date if you don't renew. The Lifetime plan is a one-time payment with no renewal.",
ctaf_h2a:"Ready to play", ctaf_h2b:"smarter&nbsp;?",
ctaf_p:"Create your free account, check the history, then choose the plan that fits you.",
ctaf_btn:"Create my account",
foot_h_plateforme:"Platform",
foot_plans:"Plans", foot_rezilta:"Results", foot_accueil:"Back to home",
foot_h_legal:"Legal", foot_cgu:"Terms of use", foot_confid:"Privacy", foot_jeu_resp:"Responsible gambling",
pl1_name:"VIP 7 DAYS", pl1_per:"7 days of access",
plan_per_days:"{n} days of access", plan_name_days:"VIP {n} DAYS",
pl2_name:"VIP 21 DAYS", pl2_per:"21 days of access",
pl3_name:"VIP 30 DAYS", pl3_per:"30 days of access",
pl4_name:"LIFETIME VIP A VIE", pl4_sub:"FULL ACCESS", pl4_per:"Tout cotes yo disponib pou tout tan",
pl4_f1:"Score exact", pl4_f2:"Betcote 1xBet", pl4_f3:"Fich illimité", pl4_foot:"Aksè a tout fich yo pou tout tan",
pf_c515:"Odds 5 / 10 / 15", pf_c1580:"Odds 15 / 30 / 60 / 80",
pf_c1000:"Odds 100 / 1000+", pf_c1000p:"Odds 100 / 1000+", pf_c20:"Odds 20 / 100 / 1000+",
pf_betcote:"Betcote ParyajPam &amp; Paryaj Lakay", pf_lien:"Links &amp; slip screenshots",
pf_score:"Correct scores &amp; Betcote 1xBet", pf_illim:"Unlimited slips",
auth_tag:"MEMBER AREA",
auth_brand_sub:"Football and NBA, every day.",
auth_brand_f1:"Daily picks with a confidence score",
auth_brand_f2:"Full history — wins and losses",
auth_brand_f3:"Local payment: MonCash and NatCash",
auth_tab_login:"Log in", auth_tab_signup:"Create account",
auth_login_h:"Welcome back", auth_login_sub:"Log in to access your VIP picks.",
auth_lbl_login_id:"Email or phone number", auth_ph_login_id:"example@email.com",
auth_lbl_password:"Password", auth_ph_password_login:"Enter your password",
auth_remember:"Remember me", auth_forgot:"Forgot password?",
auth_btn_login:"Log in",
auth_switch_to_signup_txt:"Don't have an account?", auth_switch_to_signup_link:"Create a free account",
auth_signup_h:"Create your VIP account", auth_signup_sub:"It takes less than a minute.",
auth_lbl_fullname:"Full name", auth_ph_fullname:"Your first and last name",
auth_lbl_site:"Preferred site", auth_site_other:"Other",
auth_lbl_phone:"Phone number", auth_ph_phone:"3712 3456",
auth_lbl_email:"Email address", auth_ph_email:"example@email.com",
auth_ph_password_signup:"At least 8 characters",
auth_lbl_password_confirm:"Confirm password", auth_ph_password_confirm:"Re-enter your password",
auth_terms:"I am 18 or older and I agree to the Terms of Service and Privacy Policy.",
auth_btn_signup:"Create my account",
auth_switch_to_login_txt:"Already have an account?", auth_switch_to_login_link:"Log in",
auth_err_required:"This field is required",
auth_err_email:"Enter a valid email address",
auth_err_phone:"Enter a valid number (8 digits)",
auth_err_password_len:"At least 8 characters required",
auth_err_password_match:"Passwords don't match",
auth_err_terms:"You must check this box to continue",
auth_success_login_h:"Login successful", auth_success_login_sub:"You're being redirected to your dashboard.",
auth_success_signup_h:"Welcome to VIP BETCOTE", auth_success_signup_sub:"Your account is created. Choose a plan to access the picks.",
auth_success_cta:"View the plans",
nav_dashboard:"Dashboard",
wiz_s1:"Account", wiz_s2:"Email", wiz_s3:"Payment", wiz_s4:"Access",
wiz_btn_next1:"Continue",
wiz_resume_h:"Sign-up not completed",
wiz_resume_at:"Resume at the \"{step}\" step — your plan has been saved.",
wiz_v_h:"Verify your email", wiz_v_sub:"We sent you a 6-digit code.",
wiz_v_err:"That code is incorrect", wiz_v_demo:"Demo mode — your code is",
wiz_v_noreceive:"Didn't get it?", wiz_v_resend:"Resend the code",
wiz_btn_verify:"Verify",
wiz_p_h:"Activate your plan", wiz_p_sub:"Check your plan, then choose a payment method.",
wiz_p_total:"Total due", wiz_p_change:"Change plan",
wiz_p_method:"Payment method", wiz_p_err_method:"Choose a payment method",
wiz_p_phone:"Your account number", wiz_p_pay:"Pay {amount} HTG",
wiz_p_secure:"Secure payment — no banking data is stored",
wiz_d_h:"Your plan is active", wiz_d_sub:"Your account is ready. You can now access the VIP picks.",
wiz_d_plan:"Plan", wiz_d_start:"Start date", wiz_d_end:"Expiry date", wiz_d_ref:"Reference",
wiz_d_never:"No expiry", wiz_d_cta:"Go to dashboard", wiz_d_pending_dates:"Set after confirmation",
wiz_d_h_pending:"Payment under verification", wiz_d_sub_pending:"Your account is ready. Your picks will unlock as soon as our team confirms your payment.",
wiz_d_sub_pending_auto:"Your account is ready. Confirmation is automatic and usually takes under a minute.",
wiz_auto_pending_note:"Automatic verification in progress.",
wiz_auto_attente_p:"Automatic verification with the payment provider in progress…",
wiz_auto_verif_p:"Checking…",
wiz_auto_erreur_p:"Could not reach the payment provider right now. Retrying automatically in a moment.",
wiz_auto_confirme_p:"Your payment has been confirmed automatically.",
wiz_auto_echec_p:"The payment could not be confirmed. You can try again.",
wiz_auto_echec_changement_p:"The plan change failed. Your current subscription remains active.",
wiz_auto_open_cta:"Open payment page",
wiz_auto_retry_cta:"I've completed the payment",
wiz_lock_h:"Dashboard locked", wiz_lock_cta:"Continue my sign-up",
wiz_lock_r1:"You need to create an account first to access the dashboard.",
wiz_lock_r2:"Your email address isn't verified yet. Complete verification to continue.",
wiz_lock_r3:"No active plan. Complete your payment to unlock the dashboard.",
dash_t_today:"Today's picks", dash_t_history:"History", dash_t_stats:"Statistics", dash_t_sub:"My plan",
dash_t_subhistory:"Plan history", dash_subhistory_h:"Plan history", dash_subhistory_p:"All your confirmed plans, past and current.",
dash_subh_actif:"Active", dash_subh_expire:"Expired", dash_subhistory_empty:"No confirmed plan yet.",
dash_hello:"Hello {name}", dash_hello_p:"Here are the slips published today by our expert team.",
dash_notif_h:"Notifications", dash_notif_clear:"Mark all as read", dash_notif_empty:"No notifications.",
dash_n1:"Your slip F-2401 is a winner", dash_n2:"4 new slips published today", dash_n3:"Your plan expires in 12 days",
dash_ago_2h:"2 hours ago", dash_ago_5h:"5 hours ago", dash_ago_1d:"Yesterday",
dash_f_all:"All", dash_f_foot:"Football", dash_f_nba:"Basketball",
dash_f_allres:"All results", dash_f_won:"Won", dash_f_lost:"Lost",
dash_count:"{n} slip(s)",
dash_st_won:"WON", dash_st_lost:"LOST", dash_st_pending:"PENDING", dash_kind_normal:"Standard odds", dash_kind_exact:"Correct score", dash_kind_basket:"Basketball",
fiche_note_x2:"Play two matches at a time",
adm_fiche_gen_btn:"⚡ GENERATE SLIP", adm_fiche_gen_h:"Generate a slip", adm_fiche_gen_p:"Generates a slip immediately for the chosen date, without waiting for the evening bot. Never blocked by the duplicate-check.",
adm_fiche_gen_exact_btn:"🎯 GENERATE EXACT SCORE", adm_fiche_gen_exact_h:"Generate an exact score slip", adm_fiche_gen_exact_p:"Generates exact-score slips only for the chosen date — pick the number of matches, no odds to set.",
adm_fiche_gen_basket_h:"Generate a basketball ticket",
adm_fiche_gen_nbmatchs:"Number of matches",
adm_fiche_gen_date:"Match date", adm_fiche_gen_hdebut:"Start time (PAP)", adm_fiche_gen_hfin:"End time (PAP)", adm_fiche_gen_sport:"Sport",
adm_fiche_gen_nba_note:"Not available yet — no reliable odds source wired for basketball/NBA.",
adm_fiche_gen_plans:"Plans concerned", adm_fiche_gen_cotemax:"Desired max odds", adm_fiche_gen_publish:"Publishing",
adm_fiche_gen_now:"Immediate", adm_fiche_gen_scheduled:"Scheduled", adm_fiche_gen_scheduled_at:"Publish date/time (PAP)",
adm_fiche_gen_submit:"Generate", adm_fiche_gen_wait:"Generating…",
adm_fiche_gen_bg_lance:"Generation started", adm_fiche_gen_bg_attente:"This can take up to 6-7 minutes (the system checks odds gradually to stay reliable). Check back in a few minutes.", adm_fiche_gen_bg_verifier:"Check now",
adm_fiche_gen_err_champs:"Fill in the date and time window.", adm_fiche_gen_err_plans:"Choose at least one plan to continue.",
adm_fiche_gen_confirm:"Confirm generation of this ticket?",
adm_fiche_gen_basket_confirm:"Confirm generation of tomorrow's combined basketball ticket?",
adm_fiche_gen_err_prog:"Choose a publish date/time.", adm_fiche_gen_err_session:"Admin session not found — please log in again.",
adm_fiche_gen_echec:"No slip generated for this plan.", adm_fiche_gen_ok_now:"published immediately",
adm_fiche_gen_ok_prog:"scheduled for {h}", adm_fiche_gen_clamped:"max odds capped to the plan's ceiling",
dash_conf:"Average confidence per selection", dash_totalodd:"Total odds",
adm_quota_lbl:"API-Sports quota · {used}/{max} used · {left} left today",
adm_quota_sport_foot:"Football", adm_quota_sport_basket:"Basketball",
adm_quota_gen_epuise:"⛔ Quota exhausted for today — generation impossible until reset (midnight UTC).", adm_quota_gen_bas:"⚠️ Only {left} calls left — the generated ticket will use a smaller match pool than usual.",
adm_quota_lbl_reel:"API-Sports quota · {used}/{max} used · {remaining} left (checked at {time})",
adm_quota_inconnu:"⚠️ Real quota unknown since midnight UTC — no API-Sports call made today.",
adm_quota_gen_inconnu:"⚠️ Quota unknown since midnight UTC. Run a diagnostic (?diag=quota-status) before generating to be sure.",
adm_apprentissage_btn:"Learning report",
adm_apprentissage_indispo:"Report unavailable right now.",
adm_apprentissage_vide:"Not enough settled results yet for a report.",
adm_apprentissage_labels:"By confidence label (A-E)",
adm_apprentissage_marches:"By league + market",
adm_fiche_gen_basket_p:"Combined basketball ticket — no mandatory minimum odd, only the max odd above is a strict cap. Visible to the checked plans and every plan above them (cascading access).",
adm_fiche_gen_basket_submit:"🏀 GENERATE BASKETBALL SLIP",
adm_fiche_gen_basket_bg_attente:"This can take 1 to 2 minutes. Check back shortly.",
dtk_niveau_haut:"Reliable", dtk_niveau_moyen:"Moderate", dtk_niveau_bas:"Caution",
dtk_cd_min:"⏱ First match in {n} min", dtk_cd_h:"⏱ First match in {h}h{m}", dtk_cd_j:"⏱ First match in {j} d", dtk_cd_bientot:"⏱ First match starting soon", dtk_cd_encours:"⏱ First match underway",
dtk_share_btn:"Share on WhatsApp", dtk_share_titre:"WINNING TICKET", dtk_share_plus:"+{n} more selection(s)", dtk_share_mention:"18+ · Play responsibly", dtk_share_texte:"I won with VIP BETCOTE! 🎉",
dash_locked_p:"This slip belongs to a higher plan.", dash_locked_cta:"See the {plan} plan", dash_need_plan:"Required plan",
dash_empty_h:"Nothing to show", dash_empty_today:"No slip matches this filter for today.",
dash_empty_err:"Slips can't be loaded right now. Check your connection — they will come back automatically.",
dash_empty_hist:"No slip matches these filters.", dash_hist_needs_plan:"You need an active plan to see your history of won or lost slips.",
dash_stats_needs_plan:"You need an active plan to see your performance statistics.",
dash_k_avail:"Slips available", dash_k_legs:"Selections today", dash_k_bestodd:"Best odds", dash_k_locked:"Locked slips",
dash_k_played:"Slips played", dash_k_won:"Won", dash_k_lost:"Lost", dash_k_rate:"Success rate",
dash_k_avgodd:"Average odds", dash_k_avgconf:"Average confidence",
dash_k_footrate:"Football success", dash_k_footplayed:"Football slips", dash_k_nbarate:"NBA success", dash_k_nbaplayed:"NBA slips",
dash_hist_h:"Slip history", dash_hist_p:"Every published slip with its real result — wins and losses alike.",
dash_stats_h:"Statistics", dash_stats_p:"All these figures are computed from the history — never hand-written.",
dash_stats_bysport:"By sport",
dash_stats_note:"The success rate covers slips with a final result. Pending slips aren't counted. Past performance does not guarantee future results.",
dash_note:"Confidence scores are an assessment by our expert team, not a guarantee. Past results never guarantee future ones. Please play responsibly.",
dash_sub_h:"My plan", dash_sub_p:"Your plan details and dates.",
dash_sub_active:"Active", dash_sub_pending:"Pending verification",
dash_sub_suspended:"Account suspended",
dash_sub_msg_suspended:"Your account is suspended for: {reason}. Please contact customer support!", dash_sub_holder:"Account holder", dash_sub_email:"Email", dash_sub_method:"Payment method",
dash_pending_change_banner:"You have a change to {plan} pending confirmation. Your current plan stays active until then.",
dash_sub_left:"Time remaining", dash_sub_days:"{n} day(s)", dash_sub_upgrade:"Change or renew my plan",
mk_btts_l:"Both teams to score", mk_over_l:"Over / Under goals", mk_1x2_l:"1X2",
mk_dc_l:"Double chance", mk_total_l:"NBA total", mk_hand_l:"Handicap", mk_score_l:"Correct score",
mk_scorer_l:"Goalscorer", mk_corners_l:"Corners", mk_team_goals_l:"Team goals",
pick_oui:"Yes", pick_non:"No", pick_1:"1 — Home win", pick_2:"2 — Away win",
pick_1x:"1X — Home or draw", pick_x2:"X2 — Draw or away", pick_12:"12 — No draw",
pick_over15:"Over 1.5 goals", pick_over35:"Over 3.5 goals",
pick_under25:"Under 2.5 goals", pick_under35:"Under 3.5 goals",
pick_team_over05:"Team to score", pick_team_over15:"Team to score 2 or more",
pick_corners_over85:"Over 8.5 corners", pick_corners_over95:"Over 9.5 corners",
pick_corners_over105:"Over 10.5 corners",
pick_over25:"Over 2.5 goals", pick_over2255:"Over 225.5 points", pick_h45:"Handicap -4.5",
logo_baseline:"Win every time you play",
auth_err_password_digit:"Password must contain at least one number",
auth_pw_weak:"Weak", auth_pw_mid:"Medium", auth_pw_strong:"Strong",
wiz_p_or:"or", wiz_p_stripe:"Pay with Stripe",
wiz_p_stripe_go_h:"Redirecting to Stripe",
wiz_p_stripe_go_p:"You are being redirected to the secure payment page.",
wiz_p_stripe_nosession:"Your session has expired. Please sign in again before paying by card.",
wiz_p_stripe_indispo:"Card payment is not available for this plan right now.",
stripe_back_h:"Payment received",
stripe_back_p:"Your payment has been received. Your plan will be activated in a few moments.",
legal_updated:"Updated: August 2026",
hero_why:"POUKISA'W DWE ENSKRI NAN VIPBETCOTE??",
auth_lbl_username:"Username", auth_ph_username:"Choose a username",
auth_optional:"(optional)",
auth_err_email_temp:"Temporary email addresses are not accepted",
dash_soon_h:"Your plan expires in {n} day(s)",
dash_soon_sub:"Renew now so you don't lose access to the slips.",
dash_change_pass:"Change my password",
pwr_h_mail:"Reset your password", pwr_sub_mail:"Enter your account email and we'll send you a code.",
pwr_h_code:"Enter the code you received", pwr_sub_code:"The 6-digit code is valid for a few minutes.",
pwr_h_new:"Choose a new password", pwr_sub_new:"At least 8 characters, including at least one number.",
pwr_lbl_new:"New password",
pwr_btn_send:"Send the code", pwr_btn_save:"Save new password",
pwr_back_login:"Back to login",
pwr_err_nouser:"No account is linked to this email",
pwr_err_generic:"Something went wrong. Please try again shortly.",
pwr_toast_h:"Password changed", pwr_toast_p:"You can now log in with your new password.",
auth_back:"Back",
toast_mail_h:"Verification email sent",
toast_mail_p:"We sent a code to {email}. Check your inbox, and your spam folder if needed.",
dash_brand_sub:"Dashboard",
dash_soon_cta:"Renew",
dash_back:"Back", renew_err_inferieur:"You can't move to a lower plan until your current plan reaches its end period.",
plan_changed_h:"Plan changed", plan_changed_p:"You have changed your plan.",
notif_plan_change:"You changed your plan: {plan}",
notif_renewed:"Your {plan} plan has been renewed",
notif_expired:"Your plan has expired",
notif_soon:"Your plan expires in {n} day(s)",
notif_today:"{n} slip(s) available today",
notif_won_foot:"One of your Football tickets is a winner", notif_won_basket:"One of your Basketball tickets is a winner", notif_won_exact:"Your Exact Score ticket is a winner",
notif_ago_min:"{n} min ago", notif_ago_h:"{n} h ago", notif_ago_d:"{n} d ago",
dash_badge_none:"No plan",
err_action_unavailable_h:"Action unavailable", err_action_unavailable_p:"This action is temporarily unavailable. Please try again in a few seconds.",
notif_pay_pending:"Your payment for {plan} is awaiting validation", notif_pay_confirmed:"Your payment for {plan} has been confirmed", notif_pay_rejected:"Your payment for {plan} was declined: {raison}", notif_pay_rejected_defaut:"no reason given",
dash_f_other:"Other plans' slips",
dash_empty_other:"Every slip today is already included in your plan.",
dash_sub_lifetime:"Lifetime — no expiry",
wiz_v_sub2:"We sent a 6-digit code to your address.",
wiz_v_back:"Change email address",
dash_tag_pair:"Play in pairs", dash_score_count:"{n} correct scores",
plan_changed_carry:"Your {n} remaining day(s) were added.",
renew_err_pending:"Your previous payment is still awaiting verification by our team. You'll be able to change or renew your plan once it's confirmed.", renew_err_email_non_verifie:"Your email must be verified first (code received by email at signup) before you can subscribe. Check your inbox, or contact support if you can't find the code.",
pending_toast_h:"Payment pending",
renew_err_encours:"This plan is already active.",
renew_err_lifetime:"You already own the Lifetime plan — no change is needed.",
renew_toast_h:"Renewal not possible",
lifetime_toast_h:"No change needed",
change_toast_h:"Plan change not possible",
renew_success_h:"Plan renewed",
renew_success_p:"Your subscription has been successfully renewed.",
pay_pending_note:"This payment is awaiting verification by our team.",
pay_timeout_h:"Payment session expired",
pay_timeout_p:"For security, please start again.",
session_stale_h:"Account open elsewhere",
session_stale_p:"This account is open in another window. Refresh the page to continue.",
dash_menu_lang:"Language",
adm_role_badge:"ADMIN",
adm_nav_home:"Overview", adm_nav_users:"Users", adm_nav_payments:"Payments", adm_nav_revenus:"Revenue", adm_nav_plans:"Plans", adm_nav_fiches:"Tickets", adm_nav_faq:"FAQ", adm_nav_testimonials:"Testimonials", adm_nav_landing:"Homepage stats", adm_nav_settings:"Settings",
adm_rev_h:"Revenue", adm_rev_p:"Same figures as the overview page, always in sync — confirmed payments only.",
adm_rev_total:"Total confirmed revenue", adm_rev_total_note:"All time, confirmed payments only.",
adm_rev_mois:"Revenue this month", adm_rev_paiements:"Confirmed payments this month",
adm_rev_attente:"Awaiting validation", adm_rev_attente_note:"{n} payment(s) — never counted as revenue until validated.",
adm_rev_tx_h:"Transaction history", adm_rev_tx_more:"Load older ones",
adm_settings_h:"Settings", adm_settings_p:"Your password and admin account security.",
adm_settings_pw_h:"Change password",
adm_settings_pw_new:"New password", adm_settings_pw_confirm:"Confirm new password",
adm_settings_pw_save:"Save password",
adm_settings_pw_start_p:"For security, a verification code will be emailed to you before you can change your password.",
adm_settings_pw_start_btn:"Change password",
adm_settings_pw_code_p:"Enter the code sent to {email}.",
adm_settings_pw_err:"The change failed.",
adm_settings_pw_toast_h:"Password changed", adm_settings_pw_toast_p:"Your password was updated successfully.",
adm_settings_2fa_h:"Two-factor authentication (2FA)",
adm_settings_2fa_on_p:"2FA is enabled on this account. A code will be required at every login.",
adm_settings_2fa_off_p:"2FA is not enabled. Turn it on to strengthen this admin account's security — fully optional.",
adm_settings_2fa_enable:"Enable 2FA", adm_settings_2fa_disable:"Disable 2FA",
adm_settings_2fa_err:"The action failed.",
adm_settings_2fa_on_h:"2FA enabled", adm_settings_2fa_on_toast:"Two-factor authentication is now active on this account.",
adm_settings_2fa_off_h:"2FA disabled", adm_settings_2fa_off_toast:"Two-factor authentication was removed from this account.",
adm_confirm_q_pw_change:"Confirm the password change?",
adm_confirm_q_2fa_disable:"Confirm disabling 2FA? Your account will be less protected.",
adm_fiches_h:"Tickets", adm_fiches_p:"Tickets for each day, grouped by plan. History always stays available.",
adm_fiches_date_lbl:"Date", adm_fiches_new:"+ New ticket", adm_fiches_empty:"No tickets for this date.", adm_fiches_tous_plans:"All",
adm_fiche_draft:"draft", adm_fiche_legs:"match(es)",
adm_fiche_st_pending:"In progress", adm_fiche_st_won:"Won", adm_fiche_st_lost:"Lost",
adm_fiche_kind_normal:"Standard odds", adm_fiche_kind_exact:"Correct score", adm_fiche_kind_basket:"Basketball",
adm_fiche_src_bot:"BOT", adm_fiche_src_admin:"ADMIN",
adm_fiches_tab_day:"Today", adm_fiches_tab_hist:"History",
adm_fiches_f_all:"All", adm_fiches_f_pending:"In progress", adm_fiches_f_won:"Won", adm_fiches_f_lost:"Lost",
adm_fiches_hist_empty:"No slips in history for this filter.",
adm_fiches_load_more:"Load more",
adm_fiches_sync_last:"Last sync: {d}", adm_fiches_sync_never:"No sync recorded yet",
adm_fiches_sync_next:"Next automatic generation: {d}",
adm_fiche_leg_locked:"Match finished — result settled, editing protected",
adm_fiche_leg_unlock:"Edit anyway", adm_fiche_leg_edit:"Edit this match",
adm_fiche_odds_total:"Total odds: {n}", adm_fiche_odds_range:"allowed range {min} – {max}",
adm_fiche_odds_unlimited:"unlimited", adm_fiche_odds_risky:"{n} selection(s) above {max}",
adm_fiche_err_odds_range:"Total odds {n} outside the allowed range ({min} – {max}).",
adm_fiche_err_odds_plan:"Odds outside the plan range",
adm_fiche_err_code_dup:"This reference is already used by another slip.",
adm_fiche_err_forbidden:"Action not allowed.",
adm_fiche_code:"Reference", adm_fiche_code_ph:"E.g.: VB-2451 (optional)",
adm_fiche_plan:"Minimum required plan", adm_fiche_sport:"Sport",
adm_fiche_sport_foot:"Football", adm_fiche_sport_nba:"Basketball",
adm_fiche_confidence:"Confidence score (%)", adm_fiche_date:"Ticket date", adm_fiche_status:"Result",
adm_fiche_legs_h:"Ticket matches",
adm_fiche_leg_match:"Teams (e.g. Chelsea - Liverpool)", adm_fiche_leg_time:"Time",
adm_fiche_leg_league:"League", adm_fiche_leg_market:"Market (e.g. Both teams to score)",
adm_fiche_leg_pick:"Pick (e.g. Yes)", adm_fiche_leg_odd:"Odds",
adm_fiche_leg_remove:"Remove this match", adm_fiche_leg_add:"+ Add a match",
adm_fiche_leg_none:"No matches added yet.",
adm_fiche_save:"Save ticket", adm_fiche_delete:"Delete this ticket",
adm_fiche_err_incomplete:"Date is required.",
adm_fiche_err_nolegs:"Add at least one match.",
adm_fiche_err_leg_incomplete:"Each match needs at least the teams, the pick, and the odds.",
adm_fiche_err_save:"Save failed.",
adm_fiche_toast_h:"Ticket saved", adm_fiche_toast_p:"Visible immediately if published.",
adm_fiche_toast_del_h:"Ticket deleted", adm_fiche_toast_del_p:"It no longer appears anywhere.",
adm_menu_exit:"Log out",
adm_home_h:"Overview", adm_home_p:"Real figures, taken directly from the database.",
adm_refresh:"Refresh", adm_updated_at:"Updated at {t}",
adm_k_loading:"Loading...", adm_k_offline:"Connection unavailable", adm_k_error:"Read error",
adm_activity_h:"Recent activity", adm_activity_empty:"No pending payments right now.",
adm_activity_pending_pay:"Pending payment — {name}",
adm_k_users:"Users", adm_k_subs_active:"Active subscriptions", adm_k_pay_pending:"Pending payments", adm_k_tickets:"Slips in progress",
adm_k_users_note:"Total registered accounts.", adm_k_subs_note:"Unique accounts, excluding suspended.", adm_k_pay_note:"Needs validation now.", adm_k_tickets_note:"Currently in progress.",
adm_users_h:"Users", adm_users_p:"Search and detail for each account, straight from the database.",
adm_users_search_ph:"Search by email...", adm_users_count:"{n} account(s)", adm_users_empty:"No accounts found.",
adm_badge_none:"No plan", adm_badge_expired:"expired", adm_no_name:"No name", adm_badge_suspended:"Suspended",
adm_confirm_yes:"Yes", adm_confirm_no:"No", adm_role_admin:"Admin",
adm_confirm_q_valider:"Confirm approval of this payment?",
adm_confirm_q_refuser:"Confirm rejection of this payment?",
adm_confirm_q_planchange:"Confirm the plan change?",
adm_confirm_q_suspend:"Confirm suspension of this account?",
adm_confirm_q_reactivate:"Confirm reactivation of this account?",
adm_confirm_q_plan_save:"Confirm this plan change? It applies immediately across the whole site.",
adm_plans_h:"Plans", adm_plans_p:"Edit the price and duration of each plan — changes apply EVERYWHERE on the site, immediately.",
adm_plans_empty:"No plans found.",
adm_plans_price_lbl:"Price (HTG)",
adm_plans_price_before_lbl:"Crossed-out price (optional, marketing)",
adm_plans_price_before_ph:"E.g.: 999 (leave blank to show nothing)",
adm_plans_err_price_before:"Enter a valid crossed-out price or leave blank.",
adm_plans_days_lbl:"Duration (days) — leave blank for Lifetime",
adm_plans_days_ph:"E.g.: 21 (blank = no expiry)",
adm_plans_save:"Save", adm_plans_err_price:"Enter a valid price.", adm_plans_err_days:"Enter a valid number of days or leave blank.",
adm_plans_err_save:"Save failed.",
adm_plans_toast_h:"Plan updated", adm_plans_toast_p:"The new price is active immediately across the site.",
adm_order_lbl:"Display order", adm_published_toggle:"Published (visible on the site)",
adm_published:"Published", adm_draft:"Draft",
adm_confirm_q_save:"Confirm saving?", adm_confirm_q_delete:"Confirm deletion? This action is permanent.",
adm_faq_h:"FAQ", adm_faq_p:"Questions shown in the site's dedicated FAQ panel — published only when you choose to.",
adm_faq_new:"+ New question", adm_faq_empty:"No questions yet.",
adm_faq_q_ht:"Question (Creole)", adm_faq_q_fr:"Question (French)", adm_faq_q_en:"Question (English)", adm_faq_q_ph:"Write the question…",
adm_faq_a_ht:"Answer (Creole)", adm_faq_a_fr:"Answer (French)", adm_faq_a_en:"Answer (English)", adm_faq_a_ph:"Write the answer…",
adm_faq_save:"Save", adm_faq_delete:"Delete this question",
adm_faq_err_incomplete:"Fill in the question and answer in all 3 languages.",
adm_faq_err_save:"Save failed.",
adm_faq_toast_h:"Question saved", adm_faq_toast_p:"Visible immediately on the site if published.",
adm_faq_toast_del_h:"Question deleted", adm_faq_toast_del_p:"It no longer appears on the site.",
adm_testi_h:"Testimonials", adm_testi_p:"Customer testimonials, added manually and published when you decide.",
adm_testi_new:"+ New testimonial", adm_testi_empty:"No testimonials yet.",
adm_landing_h:"Homepage statistics", adm_landing_p:"These numbers appear on the homepage — changes apply EVERYWHERE on the site immediately.",
adm_landing_users_lbl:"Active users", adm_landing_tickets_lbl:"Successful tickets", adm_landing_rate_lbl:"Win rate (%)", adm_landing_trust_lbl:"Trustpilot rating (out of 5)",
adm_landing_err_users:"Enter a valid number of users.", adm_landing_err_tickets:"Enter a valid number of tickets.", adm_landing_err_rate:"Enter a rate between 0 and 100.", adm_landing_err_trust:"Enter a rating between 0 and 5.",
adm_landing_err_save:"Failed to save",
adm_landing_toast_h:"Statistics updated", adm_landing_toast_p:"The new numbers are active immediately on the homepage.",
adm_testi_author:"Author name",
adm_testi_content_ht:"Testimonial (Creole)", adm_testi_content_fr:"Testimonial (French)", adm_testi_content_en:"Testimonial (English)",
adm_testi_rating:"Rating",
adm_testi_save:"Save", adm_testi_delete:"Delete this testimonial",
adm_testi_err_incomplete:"Fill in the author name and testimonial in all 3 languages.",
adm_testi_err_save:"Save failed.",
adm_testi_toast_h:"Testimonial saved", adm_testi_toast_p:"Visible immediately on the site if published.",
adm_testi_toast_del_h:"Testimonial deleted", adm_testi_toast_del_p:"It no longer appears on the site.",
adm_user_pending_pay_h:"Pending payment",
adm_user_profile_h:"Profile", adm_user_role:"Role", adm_user_site:"Preferred site", adm_user_since:"Member since",
adm_user_current_plan:"Current plan", adm_user_no_plan:"None",
adm_user_change_plan_h:"Change plan", adm_user_change_plan_lbl:"New plan",
adm_user_change_plan_reason_lbl:"Note (optional)", adm_user_change_plan_reason_ph:"E.g.: goodwill gesture, error correction...",
adm_user_change_plan_apply:"Apply change", adm_user_change_plan_same:"This is already the user's current plan.",
adm_user_change_plan_err:"The change failed.",
adm_user_suspend_h:"Account suspension",
adm_user_suspend_reason_lbl:"Reason (required — visible to customer support)",
adm_user_suspend_reason_ph:"E.g.: reported fraudulent payment, terms of service violation...",
adm_user_suspend_btn:"Suspend this account", adm_user_reactivate_btn:"Reactivate this account",
adm_user_suspend_reason_required:"A reason is required to suspend an account.",
adm_user_suspend_err:"The action failed.", adm_user_suspended_since:"Suspended on",
adm_user_plan_changed_h:"Plan changed", adm_user_plan_changed_p:"The new plan is active immediately.", adm_user_plan_removed_p:"The plan has been removed. This user no longer has an active plan.", adm_user_plan_none_option:"— No plan (remove) —",
adm_user_suspended_h:"Account suspended", adm_user_suspended_p:"The user will no longer be able to sign in.", adm_leg_result_lbl:"Result", adm_leg_result_none:"Not played yet", adm_leg_result_won:"Won", adm_leg_result_lost:"Lost", adm_leg_result_void:"Void",
adm_user_reactivated_h:"Account reactivated", adm_user_reactivated_p:"The user can sign in again.",
adm_section_subs:"Subscriptions", adm_section_pays:"Payments", adm_none_yet:"None yet.",
adm_pay_h:"Payments", adm_pay_p:"Approve or reject submitted payments, directly from the database.",
adm_pay_f_pending:"Pending", adm_pay_f_confirmed:"Confirmed", adm_pay_f_rejected:"Rejected", adm_pay_f_refunded:"Refunded",
adm_pay_count:"{n} payment(s)", adm_pay_empty:"No payments in this category.",
adm_pay_plan:"Plan", adm_pay_amount:"Amount", adm_pay_method:"Payment method", adm_pay_ref:"Reference",
adm_pay_date:"Date", adm_pay_status:"Status", adm_pay_confirmed_at:"Confirmed on",
adm_pay_reason_h:"Reason for rejection", adm_pay_action_h:"Decision",
adm_pay_reason_lbl:"Reason (required if rejecting)", adm_pay_reason_ph:"E.g.: reference not found, wrong amount...",
adm_pay_valider:"Approve", adm_pay_refuser:"Reject",
adm_pay_reason_required:"A reason is required to reject a payment.",
adm_pay_blocked_suspended:"This account is suspended: no decision (confirm or reject) is possible while the account remains suspended. Reactivate the account first.",
adm_pay_action_error:"Action failed. Check your connection and try again.",
adm_pay_toast_confirmed_h:"Payment approved", adm_pay_toast_confirmed_p:"The subscription is now active.",
adm_pay_toast_rejected_h:"Payment rejected", adm_pay_toast_rejected_p:"The user will see the rejection reason.",
sb_sync_err_h:"Account created locally only",
sb_sync_err_p:"Server sync failed. Try again later from My subscription.",
sb_pay_sync_err_p:"The payment could not be saved on the server — it won't be visible in the admin area as-is.",
pwr_back_dash:"Back to dashboard",
wiz_sending:"Sending...",
toast_mail_err_h:"Couldn't send email",
toast_mail_err_p:"The email couldn't be sent. Please try again in a moment.",
plan_changed_lifetime:"You have unlocked lifetime access!", dash_menu_exit:"Log out",
wiz_p_moncash:"MonCash automatic", wiz_p_natcash:"NatCash automatic",
wiz_p_auto_badge:"Recommended", wiz_p_auto_sub:"Automatic confirmation — usually under a minute",
auth_err_email_taken:"This email address is already registered",
auth_err_badpass:"Incorrect password",
auth_err_nouser:"No account found with these details",
auth_taken_h:"This email address is already registered",
auth_taken_sub:"An account already exists with this email. Head to the login page to sign in.",
auth_suspended_h:"Account suspended",
auth_suspended_p:"This account is currently suspended. Contact customer support for more information.",
auth_suspended_reason_p:"Your account has been suspended for: {reason}. Please contact customer support!",
mfa_enroll_h:"Secure your admin account",
mfa_enroll_p:"Scan this QR code with Google Authenticator (or a similar app), then enter the 6-digit code to activate it.",
mfa_challenge_h:"Two-step verification",
mfa_challenge_p:"Enter the 6-digit code from your authenticator app.",
mfa_err_code:"Incorrect code", mfa_btn_activate:"Activate 2FA", mfa_btn_verify:"Verify",
mfa_error_h:"2FA problem", mfa_error_p:"Can't continue right now. Try again — dashboard access stays blocked until 2FA is verified.",
mfa_error_cleanup:"Couldn't clean up a previous enrollment attempt.",
mfa_error_nofactor:"No active authenticator found.",
mfa_btn_retry:"Try again",
mfa_copy:"Copy", mfa_copied:"Copied!",
mfa_remember:"Remember this device for 30 days",
mfa_use_backup:"Use a backup code",
mfa_backup_h:"Backup code", mfa_backup_p:"Enter one of the backup codes you downloaded.",
mfa_backup_err:"This code is invalid or already used.",
mfa_back_to_code:"Back to the usual code",
mfa_codes_h:"Your backup codes",
mfa_codes_p:"Keep these codes somewhere safe. Each code works only once, in case you ever lose access to your authenticator app.",
mfa_codes_download:"Download codes",
mfa_codes_continue:"Continue",
auth_taken_cta:"Go to login",
wiz_r_h:"Renew or change plan", wiz_r_sub:"Pick your plan and pay — your account already exists.",
wiz_r_active:"Your current plan stays active. The new plan starts after payment.",
wiz_r_expired:"Your plan has expired. Pay to unlock the odds again.",
dash_expired_h:"Your plan has expired",
dash_expired_sub:"You keep access to the dashboard, but all odds are locked. Renew or choose another plan to unlock them.",
dash_expired_cta:"Renew my plan",
dash_expired_p:"Your plan has expired. Renew to see the odds again.",
dash_sub_expired:"Expired",
dash_activate_cta:"Activate my plan", dash_rejected_ov_p:"Your payment didn't go through. Activate a plan to see the odds.", dash_sub_rejected:"Payment unsuccessful", dash_sub_noplan:"You don't have any active plan right now. Activate a plan to unlock slips and odds.",
dash_pending_h:"Payment under verification",
dash_pending_sub:"Your payment is awaiting confirmation by our team. Your picks will unlock automatically once validated.",
dash_pending_ov_p:"Awaiting validation of your payment.", dash_sub_msg_pending_plan:"Your {plan} subscription request is awaiting validation by our team. You will be able to make a new request once it is confirmed or declined.",
dash_sub_msg_rejected:"Your plan change failed. Please try again.",
dash_sub_msg_expired:"Your subscription has expired. Please reactivate a plan now!",
dash_sub_msg_renew_soon:"Please renew your subscription before {date}.",
dash_sub_msg_active:"Your new {plan} plan is now successfully activated.",
faq2_q:"Do you guarantee winnings?",
legal_tag_cgu:"Legal", legal_tag_confid:"Legal", legal_tag_jeu:"Legal",
legal_note:"This document is a general version. Before official publication it must be reviewed by a legal adviser.",
legal_cgu_body:"<h3>1. Purpose</h3><p>VIP BETCOTE is an information service publishing sports analysis and selections for guidance only. The platform is neither a betting operator nor a stake intermediary. No bet is placed, collected or paid out by VIP BETCOTE.</p><h3>2. Access</h3><p>Access is restricted to people aged <strong>18 or over</strong>. Creating an account requires a valid email address and a phone number. You are responsible for the accuracy of the information provided and for keeping your password confidential.</p><h3>3. Plans and payment</h3><ul><li>Prices are shown in gourdes (HTG) and payable via MonCash, NatCash or bank card.</li><li>A plan starts once payment is confirmed and ends on the expiry date shown in your dashboard.</li><li>Fixed-term plans do not renew automatically.</li><li>The lifetime plan is a one-off payment with no renewal.</li></ul><h3>4. No guarantee of winnings</h3><p>Sports betting carries a risk of financial loss. <strong>No published selection is a guarantee of winning.</strong> Confidence scores are our team's subjective assessment. Past performance does not predict future results. You alone decide your stakes and bear any losses.</p><h3>5. Use of content</h3><p>Published selections are for your personal use. Reselling, redistributing or republishing them elsewhere is prohibited and may lead to immediate account closure without refund.</p><h3>6. Suspension and termination</h3><p>We may suspend an account for credential sharing, payment fraud, or breach of these terms. You may stop using the service at any time.</p><h3>7. Changes</h3><p>These terms may change. Active users are informed of significant changes by email or through a dashboard notification.</p>",
legal_confid_body:"<h3>1. Data collected</h3><p>We collect only what the service needs to work:</p><ul><li><strong>Account</strong>: name, email address, phone number, password (stored hashed, never in plain text).</li><li><strong>Plan</strong>: chosen plan, start and expiry dates, transaction reference, payment method used.</li><li><strong>Usage</strong>: last login date and language preference.</li></ul><h3>2. Banking data</h3><p>Card numbers and mobile wallet credentials are entered directly with the payment provider. <strong>We store no banking data</strong> on our servers.</p><h3>3. Use</h3><p>Your data is used to create and secure your account, activate and track your plan, send service notifications, and answer support requests. It is not used for anything else.</p><h3>4. Sharing</h3><p>We do not sell or rent your data. It is shared only with strictly necessary providers — hosting, email delivery, payment processing — and only to the extent their task requires.</p><h3>5. Retention</h3><p>Account data is kept while the account is active. After deletion it is erased within 30 days, except payment records kept for accounting obligations.</p><h3>6. Your rights</h3><p>You may request access to, correction or deletion of your data, and a copy of your account. A request sent from your registered email address is handled within 30 days.</p><h3>7. Security</h3><p>Passwords are hashed, traffic runs over HTTPS, and data access is limited to those who need it. As no system is infallible, we recommend a long and unique password.</p>",
legal_jeu_body:"<h3>Betting should stay a pastime</h3><p>Betting is not an income and should never be seen as a way to repay a debt or recover a loss. <strong>Only stake what you can lose without it changing your daily life.</strong></p><h3>What we do not promise</h3><p>VIP BETCOTE publishes analysis, not certainties. No selection is guaranteed. Our history shows losing slips alongside winning ones, precisely because losses are part of it.</p><h3>Warning signs</h3><ul><li>You stake more and more to feel the same interest.</li><li>You bet again immediately to recover a loss.</li><li>You borrow money, or dip into a budget meant for something else.</li><li>You hide your stakes from those close to you.</li><li>You play to escape stress, boredom or sadness.</li><li>You have tried to stop and could not.</li></ul><h3>Staying in control</h3><ul><li>Set a monthly budget before you start, and stick to it.</li><li>Set a time limit too.</li><li>Never play under the influence of alcohol, tiredness or anger.</li><li>After a loss, stop for the day rather than betting again.</li><li>Regularly check the real total staked over a month.</li></ul><h3>Strictly no minors</h3><p>This service is strictly for people aged <strong>18 or over</strong>. Any account identified as belonging to a minor is closed without refund.</p><h3>Getting help</h3><p>If betting is taking a place that worries you, talk to someone you trust, a doctor or a psychologist. Speaking up early makes things far easier. You can also write to us to request permanent closure of your account: we act on that request without argument.</p>",
},
ht: {
nav_tickets:"FICH REYISI", nav_simulateur:"ESEYE DEMO", nav_abonnements:"Abònman", nav_faq:"FAQ",
btn_connect:"Konekte", btn_signup:"Enskri", btn_signup_free:"Enskri gratis",
tick_won:"GENYEN",
hero_badge:"EKSPÈ AN LIY &nbsp;•&nbsp; +42 PRONOSTIK JODI A",
hero_t1:"EKSELANS", hero_t2:"NAN", hero_t3:"PRONOSTIK", hero_t4:"PREMIUM",
hero_sub:"Pi gwo platfòm pronostic kap ede w genyen sou ParyajPam, ParyajLakay ak 1xBet. Nou gen 6 an eksperyans. Si w vle sispann pèdi kòb ou, chwazi yon plan anba a kounye a.",
hero_cta1:"KÒMANSE KOUNYE A",
rating_label:"Excellent sur Trustpilot",
stat_garanti:"GARANTI", stat_garanti_lab:"RANBOUSMAN SIW PA GENYEN 1 FWA",
stat_pronostiqueurs:"ITILIZATÈ AKTIF", stat_pronostics_jour:"PRONOSTIK REYISI", stat_gratuits:"PRONOSTIC KI GENYEN",
ticket_title:"TIKÈ KI GENYEN YO",
mk_btts:"De ekip yo make", mk_over:"Plis pase 225.5",
mk_1x2:"Viktwa dirèk", mk_double_chance:"Doub chans", mk_total_buts:"Total gòl",
mk_total_domicile:"Total gòl lakay", mk_total_exterieur:"Total gòl deyò",
mk_score_exact:"Eskò egzak", mk_buteur:"Moun ki make",
lbl_cote:"Cote", lbl_cote_totale:"COTE TOTAL", badge_valide:"VALIDE",
sim_title:"ESEYE DEMO SA GAD VALÈ KOB OU K FÈ",
sim_sub:"Chwazi yon montan epi chwazi yon PLAN pou wè kòb wap fè sou ParyajPam.",
sim_step1:"1. CHWAZI MONTAN (Gdes HTG)", sim_step2:"2. CHWAZI YON FÒMIL ABÒNMAN VIP",
result_title:"KÒB OU K FÈ",
lbl_gain_brut:"GEN POTANSYÈL", lbl_profit_net:"PWOFI NÈT", sim_cta:"AKTIVE ABÒNMAN AN",
word_formule:"FÒMIL",
ab_populaire:"Pi popilè a",
faq6_q:"Kijan map resevwa Cote yo?",
faq6_a:"Wap jwenn 2 fich chak jou lè w abòne nan VIP la. Lè w fin peye, w ap jwenn yon dashboard kote chak jou w ap resevwa fich yo ladan l. W ap resevwa fich yo tou sou Telegram nan gwoup VIP la. Lè w fin enskri, w ap jwenn lyen gwoup la pou resevwa fich yo.",
faq7_q:"Kijan yo kalkile to reyisit ki afiche a?",
faq7_a:"Chak pwonostik anrejistre ak rezilta reyèl li, kit li genyen kit li pèdi. To ki afiche a kalkile apati istorik konplè sa a — yo pa janm ekri l alamen.",
faq8_q:"Èske done m ak kont mwen pwoteje?",
faq8_a:"Done ou yo pwoteje e sesyon ou yo sekirize. Ou ka gade epi revoke sesyon aktif ou yo nan paramèt ou yo, e ekip nou an rete disponib nan chak etap.",
tg_tag:"Rezilta verifye", tg_h2:"Tikè ki genyen yè",
tg_p:"Foto tikè reyèl ki reyisi, nou pibliye yo jan yo ye. Chak rezilta rete disponib nan istorik konplè a.",
ab_tag:"Abònman", ab_h2:"Chwazi yon plan",
ab_p:"Yon abònman, resevwa fich chak jou analize pa ekip ekspè nou an. Peye an Gdes ak MonCash, NatCash ak Carte/PayPal.",
ab_btn_commencer:"Kòmanse",
ab_btn_vip:"Vin VIP",
ab_btn_lifetime:"S&rsquo;ABONNER", ab_btn_sabonner:"S&rsquo;ABONNER",
faq_h2:"Kesyon yo poze souvan",
faq1_q:"Kijan pronostik yo seleksyone?", faq1_a:"Chak pronostik pwopoze epi egzamine pa ekip ekspè nou an. Chak jou nou etidye match foutbòl ak NBA ki disponib yo, nou evalye mache yo pwopoze yo, epi nou pibliye seleksyon senp ak kombine, chak youn ak yon nòt konfyans analis nou yo detèmine.",
faq2_a:"Apre analiz ak estatistik yo, nou gen yon score 83% fich valide, plis pase 8 390 fich reyisi. Istorik konplè nou an rete disponib, ak fich ki pèdi yo tou.",
faq3_q:"Kijan pou m peye abònman m?", faq3_a:"Ak MonCash, NatCash, Carte/PayPal. Selon metòd ou chwazi a, abònman an aktive otomatikman oswa apre validasyon administratè a.",
faq4_q:"Ki espò ak ki kalite paryaj ki kouvri?", faq4_a:"Foutbòl, NBA, elatriye. Mache yo disponib sou ParyajPam, ParyajLakay, 1xBet, elatriye: 1X2, Doub Chans, Tou de ekip make, Plus/Mwens Gòl, Andikap, Bitè, Total NBA, elatriye.",
faq5_q:"Èske m ka anile abònman m?", faq5_a:"Wi. Abònman chak mwa yo senpleman fini nan dat ekspirasyon yo si ou pa renouvle. Plan Lifetime a se yon sèl peman, san renouvèlman.",
ctaf_h2a:"Ou pare pou jwe", ctaf_h2b:"pi entelijan&nbsp;?",
ctaf_p:"Kreye kont ou gratis, gade istorik la, epi chwazi abònman ki fè pou ou.",
ctaf_btn:"Kreye kont mwen",
foot_h_plateforme:"Platfòm",
foot_plans:"Plan yo", foot_rezilta:"Rezilta", foot_accueil:"Retounen nan Akèy",
foot_h_legal:"Legal", foot_cgu:"Kondisyon itilizasyon", foot_confid:"Konfidansyalite", foot_jeu_resp:"Jwe responsab",
pl1_name:"VIP 7 JOU", pl1_per:"7 jou aksè",
plan_per_days:"{n} jou aksè", plan_name_days:"VIP {n} JOU",
pl2_name:"VIP 21 JOU", pl2_per:"21 jou aksè",
pl3_name:"VIP 30 JOU", pl3_per:"30 jou aksè",
pl4_name:"LIFETIME VIP A VIE", pl4_sub:"FULL ACCESS", pl4_per:"Tout cotes yo disponib pou tout tan",
pl4_f1:"Score exact", pl4_f2:"Betcote 1xBet", pl4_f3:"Fich illimité", pl4_foot:"Aksè a tout fich yo pou tout tan",
pf_c515:"Cote 5 / 10 / 15", pf_c1580:"Cote 15 / 30 / 60 / 80",
pf_c1000:"Cote 100 / 1000+", pf_c1000p:"Cote 100 / 1000+", pf_c20:"Cote 20 / 100 / 1000+",
pf_betcote:"Betcote ParyajPam &amp; Paryaj Lakay", pf_lien:"Lyen &amp; foto fich yo",
pf_score:"Eskò egzak &amp; Betcote 1xBet", pf_illim:"Fich ilimite",
auth_tag:"ESPAS MANM",
auth_brand_sub:"Foutbòl ak NBA, chak jou.",
auth_brand_f1:"Fich chak jou ak nòt konfyans",
auth_brand_f2:"Istorik konplè — genyen kou pèdi",
auth_brand_f3:"Peman lokal : MonCash ak NatCash",
auth_tab_login:"Konekte", auth_tab_signup:"Kreye kont",
auth_login_h:"Byenveni ankò", auth_login_sub:"Konekte pou jwenn fich VIP ou yo.",
auth_lbl_login_id:"Imèl oswa telefòn", auth_ph_login_id:"egzanp@imel.com",
auth_lbl_password:"Modpas", auth_ph_password_login:"Antre modpas ou",
auth_remember:"Sonje m", auth_forgot:"Modpas bliye?",
auth_btn_login:"Konekte",
auth_switch_to_signup_txt:"Ou pa gen kont?", auth_switch_to_signup_link:"Kreye kont gratis",
auth_signup_h:"Kreye kont VIP ou", auth_signup_sub:"Sa pran mwens pase 1 minit.",
auth_lbl_fullname:"Non konplè", auth_ph_fullname:"Non ak siyati ou",
auth_lbl_site:"Sit prefere", auth_site_other:"Lòt",
auth_lbl_phone:"Nimewo telefòn", auth_ph_phone:"3712 3456",
auth_lbl_email:"Imèl", auth_ph_email:"egzanp@imel.com",
auth_ph_password_signup:"Omwen 8 karaktè",
auth_lbl_password_confirm:"Konfime modpas", auth_ph_password_confirm:"Ekri modpas la ankò",
auth_terms:"Mwen gen 18 an oswa plis, e mwen dakò ak Kondisyon Sèvis yo ak Règleman sou Vi Prive a.",
auth_btn_signup:"Kreye kont mwen",
auth_switch_to_login_txt:"Ou gen deja yon kont?", auth_switch_to_login_link:"Konekte",
auth_err_required:"Ranpli chan sa a",
auth_err_email:"Antre yon imèl valid",
auth_err_phone:"Antre yon nimewo valid (8 chif)",
auth_err_password_len:"Omwen 8 karaktè mande",
auth_err_password_match:"Modpas yo pa menm",
auth_err_terms:"Ou dwe koche kaz sa a pou kontinye",
auth_success_login_h:"Ou konekte", auth_success_login_sub:"N ap voye w nan dashboard ou.",
auth_success_signup_h:"Byenveni nan VIP BETCOTE", auth_success_signup_sub:"Kont ou kreye. Chwazi yon abònman pou jwenn fich yo.",
auth_success_cta:"Wè abònman yo",
nav_dashboard:"Dashboard",
wiz_s1:"Kont", wiz_s2:"Imèl", wiz_s3:"Peman", wiz_s4:"Aksè",
wiz_btn_next1:"Kontinye",
wiz_resume_h:"Enskripsyon ou pa fini",
wiz_resume_at:"Kontinye nan etap « {step} » — plan ou an konsève.",
wiz_v_h:"Verifye imèl ou", wiz_v_sub:"Nou voye yon kòd 6 chif ba ou.",
wiz_v_err:"Kòd la pa kòrèk", wiz_v_demo:"Mòd demonstrasyon — kòd ou a se",
wiz_v_noreceive:"Ou pa resevwa l?", wiz_v_resend:"Voye l ankò",
wiz_btn_verify:"Verifye",
wiz_p_h:"Aktive abònman ou", wiz_p_sub:"Verifye plan ou epi chwazi mwayen peman an.",
wiz_p_total:"Total a peye", wiz_p_change:"Chanje plan",
wiz_p_method:"Mwayen peman", wiz_p_err_method:"Chwazi yon mwayen peman",
wiz_p_phone:"Nimewo kont ou", wiz_p_pay:"Peye {amount} HTG",
wiz_p_secure:"Peman sekirize — nou pa konsève okenn done bankè",
wiz_d_h:"Abònman ou aktive", wiz_d_sub:"Kont ou prè. Ou ka jwenn fich VIP yo kounye a.",
wiz_d_plan:"Plan", wiz_d_start:"Dat kòmansman", wiz_d_end:"Dat ekspirasyon", wiz_d_ref:"Referans",
wiz_d_never:"San ekspirasyon", wiz_d_cta:"Ale nan dashboard la", wiz_d_pending_dates:"Fikse apre konfimasyon",
wiz_d_h_pending:"Peman an ap verifye", wiz_d_sub_pending:"Kont ou pare. Pronostik ou yo ap debloke depi ekip nou konfime peman an.",
wiz_d_sub_pending_auto:"Kont ou pare. Konfimasyon an otomatik, li pran mwens pase yon minit anjeneral.",
wiz_auto_pending_note:"Verifikasyon otomatik ap fèt.",
wiz_auto_attente_p:"Verifikasyon otomatik ap fèt avèk prestatè peman an…",
wiz_auto_verif_p:"Ap verifye…",
wiz_auto_erreur_p:"Nou pa ka jwenn prestatè peman an kounye a. N ap eseye ankò otomatikman talè.",
wiz_auto_confirme_p:"Peman ou konfime otomatikman.",
wiz_auto_echec_p:"Nou pa t kapab konfime peman an. Ou ka eseye ankò.",
wiz_auto_echec_changement_p:"Chanjman plan an echwe. Abònman aktyèl ou rete aktif.",
wiz_auto_open_cta:"Ouvri paj peman an",
wiz_auto_retry_cta:"Mwen fin peye a",
wiz_lock_h:"Dashboard la fèmen", wiz_lock_cta:"Kontinye enskripsyon m",
wiz_lock_r1:"Ou dwe kreye yon kont anvan pou w jwenn dashboard la.",
wiz_lock_r2:"Imèl ou poko verifye. Fini verifikasyon an pou w kontinye.",
wiz_lock_r3:"Pa gen abònman aktif. Peye abònman ou pou w debloke dashboard la.",
dash_t_today:"Fich jodi a", dash_t_history:"Istorik", dash_t_stats:"Estatistik", dash_t_sub:"Abònman m",
dash_t_subhistory:"Istorik abònman", dash_subhistory_h:"Istorik abònman", dash_subhistory_p:"Tout plan konfime ou yo, ansyen kou aktyèl.",
dash_subh_actif:"Aktif", dash_subh_expire:"Ekspire", dash_subhistory_empty:"Pa gen plan konfime pou kounye a.",
dash_hello:"Bonjou {name}", dash_hello_p:"Men fich ekip ekspè nou an pibliye jodi a.",
dash_notif_h:"Notifikasyon", dash_notif_clear:"Make tout kòm li", dash_notif_empty:"Pa gen notifikasyon.",
dash_n1:"Fich F-2401 ou an genyen", dash_n2:"4 nouvo fich pibliye jodi a", dash_n3:"Abònman ou ap ekspire nan 12 jou",
dash_ago_2h:"Gen 2 èdtan", dash_ago_5h:"Gen 5 èdtan", dash_ago_1d:"Yè",
dash_f_all:"Tout", dash_f_foot:"Foutbòl", dash_f_nba:"Basketball",
dash_f_allres:"Tout rezilta", dash_f_won:"Genyen", dash_f_lost:"Pèdi",
dash_count:"{n} fich",
dash_st_won:"GENYEN", dash_st_lost:"PÈDI", dash_st_pending:"KAP TANN", dash_kind_normal:"Kòt nòmal", dash_kind_exact:"Eskò egzak", dash_kind_basket:"Basketball",
fiche_note_x2:"Jwe pa de match",
adm_fiche_gen_btn:"⚡ JENERE FICH", adm_fiche_gen_h:"Jenere yon fich", adm_fiche_gen_p:"Jenere yon fich imedyatman pou dat la ou chwazi a, san w pa tann bot aswè a. Anti-doub la pa janm bloke l.",
adm_fiche_gen_exact_btn:"🎯 JENERE SKÒ EGZAK", adm_fiche_gen_exact_h:"Jenere yon skò egzak", adm_fiche_gen_exact_p:"Jenere sèlman fich skò egzak pou dat la ou chwazi a — chwazi konbyen match, pa gen kòt pou defini.",
adm_fiche_gen_basket_h:"Jenere yon fich basketball",
adm_fiche_gen_nbmatchs:"Konbyen match",
adm_fiche_gen_date:"Dat match yo", adm_fiche_gen_hdebut:"Lè kòmanse (PAP)", adm_fiche_gen_hfin:"Lè fini (PAP)", adm_fiche_gen_sport:"Espò",
adm_fiche_gen_nba_note:"Pa disponib pou kounye a — pa gen sous kòt serye konekte pou basketball/NBA.",
adm_fiche_gen_plans:"Plan konsène", adm_fiche_gen_cotemax:"Kòt maksimòm ou vle a", adm_fiche_gen_publish:"Piblikasyon",
adm_fiche_gen_now:"Imedya", adm_fiche_gen_scheduled:"Pwograme", adm_fiche_gen_scheduled_at:"Dat/lè piblikasyon (PAP)",
adm_fiche_gen_submit:"Jenere", adm_fiche_gen_wait:"L ap jenere…",
adm_fiche_gen_bg_lance:"Jenerasyon lanse", adm_fiche_gen_bg_attente:"Sa ka pran jiska 6-7 minit (sistèm nan verifye kòt yo piti piti pou l rete fyab). Tounen vin gade nan kèk minit.", adm_fiche_gen_bg_verifier:"Verifye kounye a",
adm_fiche_gen_err_champs:"Ranpli dat la ak fenèt orè a.", adm_fiche_gen_err_plans:"Chwazi omwen yon plan pou w ka kontinye.",
adm_fiche_gen_confirm:"Konfime jenerasyon fich sa a?",
adm_fiche_gen_basket_confirm:"Konfime jenerasyon fich basketball konbine pou demen an?",
adm_fiche_gen_err_prog:"Chwazi yon dat/lè piblikasyon.", adm_fiche_gen_err_session:"Pa jwenn sesyon admin — konekte ankò.",
adm_fiche_gen_echec:"Pa gen fich ki jenere pou plan sa a.", adm_fiche_gen_ok_now:"pibliye imedyatman",
adm_fiche_gen_ok_prog:"pwograme pou {h}", adm_fiche_gen_clamped:"kòt max redwi jiska plafon plan an",
dash_conf:"Konfyans mwayèn pou chak seleksyon", dash_totalodd:"Cote total",
adm_quota_lbl:"Quota API-Sports · {used}/{max} itilize · {left} rete jodi a",
adm_quota_sport_foot:"Foutbòl", adm_quota_sport_basket:"Basketbòl",
adm_quota_gen_epuise:"⛔ Quota fini pou jodi a — jenerasyon pa posib jiskaske li reset (minwi UTC).", adm_quota_gen_bas:"⚠️ Se sèlman {left} apèl ki rete — fich la pral genyen mwens match pase dabitid.",
adm_quota_lbl_reel:"Quota API-Sports · {used}/{max} itilize · {remaining} rete (verifye a {time})",
adm_quota_inconnu:"⚠️ Vrè quota pa konnen depi minwi UTC — pa gen okenn apèl API-Sports jodi a.",
adm_quota_gen_inconnu:"⚠️ Quota pa konnen depi minwi UTC. Lanse yon dyagnostik (?diag=quota-status) anvan ou jenere pou w sèten.",
adm_apprentissage_btn:"Rapò aprantisaj",
adm_apprentissage_indispo:"Rapò a pa disponib kounye a.",
adm_apprentissage_vide:"Poko gen ase rezilta regle pou yon rapò.",
adm_apprentissage_labels:"Pa etikèt konfyans (A-E)",
adm_apprentissage_marches:"Pa chanpyona + mache",
adm_fiche_gen_basket_p:"Fich basketball konbine — pa gen kòt minimòm obligatwa, se sèlman kòt maks anwo a ki yon plafon strik. Vizib pou plan yo ou koche ak tout plan ki pi wo (kaskad aksè).",
adm_fiche_gen_basket_submit:"🏀 JENERE FICH BASKETBALL",
adm_fiche_gen_basket_bg_attente:"Sa ka pran 1 a 2 minit. Retounen gade nan yon ti moman.",
dtk_niveau_haut:"Fyab", dtk_niveau_moyen:"Modere", dtk_niveau_bas:"Prekosyon",
dtk_cd_min:"⏱ Premye match nan {n} min", dtk_cd_h:"⏱ Premye match nan {h}è{m}", dtk_cd_j:"⏱ Premye match nan {j} jou", dtk_cd_bientot:"⏱ Premye match pral kòmanse", dtk_cd_encours:"⏱ Premye match ap jwe",
dtk_share_btn:"Pataje sou WhatsApp", dtk_share_titre:"TIKÈT GENYEN", dtk_share_plus:"+{n} lòt seleksyon", dtk_share_mention:"18+ · Jwe yon fason responsab", dtk_share_texte:"Mwen genyen ak VIP BETCOTE! 🎉",
dash_locked_p:"Fich sa a nan yon plan ki pi wo.", dash_locked_cta:"Wè plan {plan} an", dash_need_plan:"Plan ki mande",
dash_empty_h:"Pa gen anyen pou montre", dash_empty_today:"Pa gen fich ki matche ak filtè sa a pou jodi a.",
dash_empty_err:"Nou pa ka li fich yo kounye a. Tcheke koneksyon w — y ap retounen otomatikman.",
dash_empty_hist:"Pa gen fich ki matche ak filtè sa yo.", dash_hist_needs_plan:"Ou dwe gen yon plan aktif pou w wè istorik fich ou genyen oswa pèdi yo.",
dash_stats_needs_plan:"Ou dwe gen yon plan aktif pou w wè estatistik pèfòmans ou yo.",
dash_k_avail:"Fich disponib", dash_k_legs:"Seleksyon jodi a", dash_k_bestodd:"Pi bon cote", dash_k_locked:"Fich fèmen",
dash_k_played:"Fich jwe", dash_k_won:"Genyen", dash_k_lost:"Pèdi", dash_k_rate:"To reyisit",
dash_k_avgodd:"Cote mwayèn", dash_k_avgconf:"Konfyans mwayèn",
dash_k_footrate:"Reyisit foutbòl", dash_k_footplayed:"Fich foutbòl", dash_k_nbarate:"Reyisit NBA", dash_k_nbaplayed:"Fich NBA",
dash_hist_h:"Istorik fich yo", dash_hist_p:"Tout fich ki pibliye yo ak rezilta reyèl yo — sa ki genyen kou sa ki pèdi.",
dash_stats_h:"Estatistik", dash_stats_p:"Tout chif sa yo kalkile apati istorik la — yo pa ekri alamen.",
dash_stats_bysport:"Pa disiplin",
dash_stats_note:"To reyisit la kalkile sou fich ki gen yon rezilta final. Fich kap tann yo pa konte. Pèfòmans ki pase pa garanti rezilta kap vini.",
dash_note:"Nòt konfyans yo se yon evalyasyon ekip ekspè nou an, se pa yon garanti. Rezilta ki pase pa janm garanti rezilta kap vini. Jwe ak responsablite.",
dash_sub_h:"Abònman m", dash_sub_p:"Detay plan ou ak dat yo.",
dash_sub_active:"Aktif", dash_sub_pending:"Ap tann validasyon",
dash_sub_suspended:"Kont sispann",
dash_sub_msg_suspended:"Kont ou sispann pou: {reason}. Tanpri kontakte sèvis kliyan!", dash_sub_holder:"Titilè", dash_sub_email:"Imèl", dash_sub_method:"Mwayen peman",
dash_pending_change_banner:"Ou gen yon chanjman pou {plan} k ap tann konfimasyon. Plan aktyèl ou rete aktif jiskaske sa konfime.",
dash_sub_left:"Tan ki rete", dash_sub_days:"{n} jou", dash_sub_upgrade:"Chanje oswa renouvle plan an",
mk_btts_l:"De ekip yo make", mk_over_l:"Plis / Mwens gòl", mk_1x2_l:"1X2",
mk_dc_l:"Doub chans", mk_total_l:"Total NBA", mk_hand_l:"Andikap", mk_score_l:"Eskò egzak",
mk_scorer_l:"Moun ki make", mk_corners_l:"Kònè", mk_team_goals_l:"Gòl yon ekip",
pick_oui:"Wi", pick_non:"Non", pick_1:"1 — Ekip lakay genyen", pick_2:"2 — Ekip vizitè genyen",
pick_1x:"1X — Lakay oswa nul", pick_x2:"X2 — Nul oswa vizitè", pick_12:"12 — Pa gen nul",
pick_over15:"Plis pase 1.5 gòl", pick_over35:"Plis pase 3.5 gòl",
pick_under25:"Mwens pase 2.5 gòl", pick_under35:"Mwens pase 3.5 gòl",
pick_team_over05:"Ekip la make", pick_team_over15:"Ekip la make 2 gòl oswa plis",
pick_corners_over85:"Plis pase 8.5 kònè", pick_corners_over95:"Plis pase 9.5 kònè",
pick_corners_over105:"Plis pase 10.5 kònè",
pick_over25:"Plis pase 2.5 gòl", pick_over2255:"Plis pase 225.5 pwen", pick_h45:"Andikap -4.5",
logo_baseline:"Genyen chak lè w jwe",
auth_err_password_digit:"Modpas la dwe gen omwen yon chif",
auth_pw_weak:"Fèb", auth_pw_mid:"Mwayen", auth_pw_strong:"Fò",
wiz_p_or:"oswa", wiz_p_stripe:"Peye ak Stripe",
wiz_p_stripe_go_h:"N ap voye w sou Stripe",
wiz_p_stripe_go_p:"Nou pral voye w sou paj peman sekirize a.",
wiz_p_stripe_nosession:"Sesyon ou fini. Konekte ankò anvan ou peye ak kat.",
wiz_p_stripe_indispo:"Peman ak kat pa disponib pou plan sa a kounye a.",
stripe_back_h:"Nou resevwa peman an",
stripe_back_p:"Nou byen resevwa peman ou. Abònman ou ap aktive nan kèk segond.",
legal_updated:"Mizajou : out 2026",
hero_why:"POUKISA'W DWE ENSKRI NAN VIPBETCOTE??",
auth_lbl_username:"Non itilizatè", auth_ph_username:"Chwazi yon non itilizatè",
auth_optional:"(fakiltatif)",
auth_err_email_temp:"Nou pa aksepte imèl tanporè",
dash_soon_h:"Abònman ou ap ekspire nan {n} jou",
dash_soon_sub:"Renouvle kounye a pou w pa pèdi aksè a fich yo.",
dash_change_pass:"Chanje modpas",
pwr_h_mail:"Chanje modpas ou", pwr_sub_mail:"Antre imèl kont ou, n ap voye yon kòd ba ou.",
pwr_h_code:"Antre kòd ou resevwa a", pwr_sub_code:"Kòd 6 chif la valab pou kèk minit.",
pwr_h_new:"Chwazi yon nouvo modpas", pwr_sub_new:"Omwen 8 karaktè, ak omwen yon chif.",
pwr_lbl_new:"Nouvo modpas",
pwr_btn_send:"Voye kòd la", pwr_btn_save:"Anrejistre nouvo modpas la",
pwr_back_login:"Retounen nan koneksyon",
pwr_err_nouser:"Pa gen okenn kont ki gen imèl sa a",
pwr_err_generic:"Yon erè fèt. Eseye ankò yon ti moman.",
pwr_toast_h:"Modpas la chanje", pwr_toast_p:"Ou ka konekte kounye a ak nouvo modpas ou.",
auth_back:"Retounen",
toast_mail_h:"Imèl verifikasyon an voye",
toast_mail_p:"Nou voye yon kòd nan {email}. Tcheke bwat resepsyon ou, ak dosye spam nan si sa nesesè.",
dash_brand_sub:"Dashboard",
dash_soon_cta:"Renouvle",
dash_back:"Retounen", renew_err_inferieur:"Ou pa ka desann nan yon plan pi ba toutotan plan ou an poko nan peryòd fen li.",
plan_changed_h:"Abònman chanje", plan_changed_p:"Ou chanje abònman ou.",
notif_plan_change:"Ou chanje abònman ou : {plan}",
notif_renewed:"Abònman {plan} ou an renouvle",
notif_expired:"Abònman ou ekspire",
notif_soon:"Abònman ou ap ekspire nan {n} jou",
notif_today:"{n} fich disponib jodi a",
notif_won_foot:"Youn nan fich Foutbòl ou yo genyen", notif_won_basket:"Youn nan fich Basketball ou yo genyen", notif_won_exact:"Fich Score Egzat ou an genyen",
notif_ago_min:"Gen {n} min", notif_ago_h:"Gen {n} è", notif_ago_d:"Gen {n} jou",
dash_badge_none:"Okenn plan",
err_action_unavailable_h:"Aksyon pa disponib", err_action_unavailable_p:"Aksyon sa a pa disponib pou kounye a. Tanpri eseye ankò nan kèk segond.",
notif_pay_pending:"Peman ou pou {plan} ap tann validasyon", notif_pay_confirmed:"Peman ou pou {plan} konfime", notif_pay_rejected:"Peman ou pou {plan} refize : {raison}", notif_pay_rejected_defaut:"pa gen rezon presize",
dash_f_other:"Fich lòt plan",
dash_empty_other:"Tout fich jodi a deja nan plan ou.",
dash_sub_lifetime:"Lifetime — san ekspirasyon",
wiz_v_sub2:"Nou voye yon kòd 6 chif nan imèl ou.",
wiz_v_back:"Chanje imèl la",
dash_tag_pair:"Jwe pa de", dash_score_count:"{n} eskò egzak",
plan_changed_carry:"{n} jou ki te rete ou yo ajoute.",
renew_err_pending:"Peman anvan ou an toujou ap tann ekip nou an verifye li. W ap ka chanje oswa renouvle plan ou depi li konfime.", renew_err_email_non_verifie:"Fòk imèl ou verifye anvan (kòd ou te resevwa nan imèl lè w te enskri) anvan ou ka abòne. Tcheke bwat imèl ou, oswa kontakte sipò si ou pa jwenn kòd la.",
pending_toast_h:"Peman ap tann",
renew_err_encours:"Plan sa a deja an kou.",
renew_err_lifetime:"Ou gen deja abònman Lifetime a — pa gen chanjman ki nesesè.",
renew_toast_h:"Nou pa ka renouvle",
lifetime_toast_h:"Pa gen chanjman ki nesesè",
change_toast_h:"Pa ka chanje plan",
renew_success_h:"Abònman renouvle",
renew_success_p:"Abònman ou renouvle avèk siksè.",
pay_pending_note:"Peman sa a ap tann verifikasyon ekip nou an.",
pay_timeout_h:"Sesyon peman ekspire",
pay_timeout_p:"Pou sekirite, tanpri rekòmanse.",
session_stale_h:"Kont ouvri yon lòt kote",
session_stale_p:"Kont sa a ouvri nan yon lòt fenèt. Rafrechi paj la pou kontinye.",
dash_menu_lang:"Lang",
adm_role_badge:"ADMIN",
adm_nav_home:"Vi jeneral", adm_nav_users:"Itilizatè", adm_nav_payments:"Peman", adm_nav_revenus:"Revni", adm_nav_plans:"Plan", adm_nav_fiches:"Fich", adm_nav_faq:"FAQ", adm_nav_testimonials:"Temwayaj", adm_nav_landing:"Estatistik akèy", adm_nav_settings:"Paramèt",
adm_rev_h:"Revni", adm_rev_p:"Menm chif ak akèy la, toujou senkwonize — sèlman peman ki konfime.",
adm_rev_total:"Total revni konfime", adm_rev_total_note:"Tout istorik, sèlman peman ki valide.",
adm_rev_mois:"Revni mwa sa a", adm_rev_paiements:"Peman konfime mwa sa a",
adm_rev_attente:"Ap tann validasyon", adm_rev_attente_note:"{n} peman — pa janm konte kòm revni jiskaske li valide.",
adm_rev_tx_h:"Istorik tranzaksyon", adm_rev_tx_more:"Chaje pi ansyen yo",
adm_settings_h:"Paramèt", adm_settings_p:"Modpas ou ak sekirite kont admin ou.",
adm_settings_pw_h:"Chanje modpas",
adm_settings_pw_new:"Nouvo modpas", adm_settings_pw_confirm:"Konfime nouvo modpas la",
adm_settings_pw_save:"Anrejistre modpas la",
adm_settings_pw_start_p:"Pou sekirite, y ap voye yon kòd verifikasyon nan imèl ou anvan ou ka chanje modpas ou.",
adm_settings_pw_start_btn:"Chanje modpas",
adm_settings_pw_code_p:"Antre kòd yo voye nan {email} la.",
adm_settings_pw_err:"Chanjman an echwe.",
adm_settings_pw_toast_h:"Modpas chanje", adm_settings_pw_toast_p:"Modpas ou chanje avèk siksè.",
adm_settings_2fa_h:"Doub otantifikasyon (2FA)",
adm_settings_2fa_on_p:"2FA aktif sou kont sa a. Y ap mande yon kòd chak fwa ou konekte.",
adm_settings_2fa_off_p:"2FA pa aktif. Aktive li pou ranfòse sekirite kont admin sa a — se opsyonèl nèt.",
adm_settings_2fa_enable:"Aktive 2FA", adm_settings_2fa_disable:"Dezaktive 2FA",
adm_settings_2fa_err:"Aksyon an echwe.",
adm_settings_2fa_on_h:"2FA aktif", adm_settings_2fa_on_toast:"Doub otantifikasyon aktif kounye a sou kont sa a.",
adm_settings_2fa_off_h:"2FA dezaktive", adm_settings_2fa_off_toast:"Doub otantifikasyon retire nan kont sa a.",
adm_confirm_q_pw_change:"Konfime chanjman modpas la ?",
adm_confirm_q_2fa_disable:"Konfime dezaktivasyon 2FA a ? Kont ou ap mwen pwoteje.",
adm_fiches_h:"Fich", adm_fiches_p:"Fich pou chak jou, gwoupe pa plan. Istorik la toujou disponib.",
adm_fiches_date_lbl:"Dat", adm_fiches_new:"+ Nouvo fich", adm_fiches_empty:"Pa gen fich pou dat sa a.", adm_fiches_tous_plans:"Tout",
adm_fiche_draft:"bouyon", adm_fiche_legs:"match",
adm_fiche_st_pending:"An kou", adm_fiche_st_won:"Genyen", adm_fiche_st_lost:"Pèdi",
adm_fiche_kind_normal:"Kòt nòmal", adm_fiche_kind_exact:"Eskò egzak", adm_fiche_kind_basket:"Basketball",
adm_fiche_src_bot:"BOT", adm_fiche_src_admin:"ADMIN",
adm_fiches_tab_day:"Jodi a", adm_fiches_tab_hist:"Istorik",
adm_fiches_f_all:"Tout", adm_fiches_f_pending:"An kou", adm_fiches_f_won:"Genyen", adm_fiches_f_lost:"Pèdi",
adm_fiches_hist_empty:"Pa gen fich nan istorik la pou filt sa a.",
adm_fiches_load_more:"Chaje plis",
adm_fiches_sync_last:"Dènye senkronizasyon : {d}", adm_fiches_sync_never:"Pa gen senkronizasyon anrejistre",
adm_fiches_sync_next:"Pwochen jenerasyon otomatik : {d}",
adm_fiche_leg_locked:"Match fini — rezilta regle, modifikasyon pwoteje",
adm_fiche_leg_unlock:"Modifye kanmenm", adm_fiche_leg_edit:"Modifye match sa a",
adm_fiche_odds_total:"Kòt total : {n}", adm_fiche_odds_range:"plaj otorize {min} – {max}",
adm_fiche_odds_unlimited:"san limit", adm_fiche_odds_risky:"{n} seleksyon pi wo pase {max}",
adm_fiche_err_odds_range:"Kòt total {n} deyò plaj otorize a ({min} – {max}).",
adm_fiche_err_odds_plan:"Kòt deyò plaj plan an",
adm_fiche_err_code_dup:"Referans sa a deja itilize pa yon lòt fich.",
adm_fiche_err_forbidden:"Aksyon pa otorize.",
adm_fiche_code:"Referans", adm_fiche_code_ph:"Egz. : VB-2451 (opsyonèl)",
adm_fiche_plan:"Plan minimòm ki mande", adm_fiche_sport:"Espò",
adm_fiche_sport_foot:"Foutbòl", adm_fiche_sport_nba:"Basketball",
adm_fiche_confidence:"Nòt konfyans (%)", adm_fiche_date:"Dat fich la", adm_fiche_status:"Rezilta",
adm_fiche_legs_h:"Match fich la",
adm_fiche_leg_match:"Ekip yo (egz. Chelsea - Liverpool)", adm_fiche_leg_time:"Lè",
adm_fiche_leg_league:"Chanpyona", adm_fiche_leg_market:"Mache (egz. Tou de ekip make)",
adm_fiche_leg_pick:"Pronostik (egz. Wi)", adm_fiche_leg_odd:"Kòt",
adm_fiche_leg_remove:"Retire match sa a", adm_fiche_leg_add:"+ Ajoute yon match",
adm_fiche_leg_none:"Pa gen match ajoute toujou.",
adm_fiche_save:"Anrejistre fich la", adm_fiche_delete:"Efase fich sa a",
adm_fiche_err_incomplete:"Dat la obligatwa.",
adm_fiche_err_nolegs:"Ajoute omwen yon match.",
adm_fiche_err_leg_incomplete:"Chak match dwe gen omwen ekip yo, pronostik la, ak kòt la.",
adm_fiche_err_save:"Anrejistreman echwe.",
adm_fiche_toast_h:"Fich anrejistre", adm_fiche_toast_p:"Vizib imedyatman si li pibliye.",
adm_fiche_toast_del_h:"Fich efase", adm_fiche_toast_del_p:"Li pa parèt okenn kote ankò.",
adm_menu_exit:"Dekonekte",
adm_home_h:"Vi jeneral", adm_home_p:"Chif reyèl, dirèkteman soti nan baz done a.",
adm_refresh:"Rafrechi", adm_updated_at:"Mizajou a {t}",
adm_k_loading:"Chajman...", adm_k_offline:"Koneksyon pa disponib", adm_k_error:"Erè lekti",
adm_activity_h:"Aktivite resan", adm_activity_empty:"Pa gen peman ki ap tann kounye a.",
adm_activity_pending_pay:"Peman ap tann — {name}",
adm_k_users:"Itilizatè", adm_k_subs_active:"Abònman aktif", adm_k_pay_pending:"Peman ki ap tann", adm_k_tickets:"Fich an kou",
adm_k_users_note:"Total kont anrejistre.", adm_k_subs_note:"Kont inik, san moun ki sispann.", adm_k_pay_note:"Bezwen valide kounye a.", adm_k_tickets_note:"An kou kounye a.",
adm_users_h:"Itilizatè", adm_users_p:"Rechèch ak detay chak kont, dirèkteman soti nan baz done a.",
adm_users_search_ph:"Chèche pa imèl...", adm_users_count:"{n} kont", adm_users_empty:"Pa gen okenn kont.",
adm_badge_none:"Pa gen plan", adm_badge_expired:"ekspire", adm_no_name:"San non", adm_badge_suspended:"Sispann",
adm_confirm_yes:"Wi", adm_confirm_no:"Non", adm_role_admin:"Admin",
adm_confirm_q_valider:"Konfime validasyon peman sa a ?",
adm_confirm_q_refuser:"Konfime refi peman sa a ?",
adm_confirm_q_planchange:"Konfime chanjman plan an ?",
adm_confirm_q_suspend:"Konfime sispansyon kont sa a ?",
adm_confirm_q_reactivate:"Konfime reyaktivasyon kont sa a ?",
adm_confirm_q_plan_save:"Konfime chanjman plan sa a ? Chanjman an aplike imedyatman sou tout sit la.",
adm_plans_h:"Plan", adm_plans_p:"Modifye pri ak dire chak plan — chanjman yo aplike PATOUT sou sit la imedyatman.",
adm_plans_empty:"Pa gen plan.",
adm_plans_price_lbl:"Pri (HTG)",
adm_plans_price_before_lbl:"Ansyen pri baré (opsyonèl, marketing)",
adm_plans_price_before_ph:"Egz. : 999 (kite vid pou pa afiche anyen)",
adm_plans_err_price_before:"Antre yon ansyen pri ki valid oswa kite vid.",
adm_plans_days_lbl:"Dire (jou) — kite vid pou Lifetime",
adm_plans_days_ph:"Egz. : 21 (vid = san ekspirasyon)",
adm_plans_save:"Anrejistre", adm_plans_err_price:"Antre yon pri ki valid.", adm_plans_err_days:"Antre yon kantite jou ki valid oswa kite vid.",
adm_plans_err_save:"Anrejistreman echwe.",
adm_plans_toast_h:"Plan modifye", adm_plans_toast_p:"Nouvo pri a aktif imedyatman sou tout sit la.",
adm_order_lbl:"Lòd afichaj", adm_published_toggle:"Pibliye (vizib sou sit la)",
adm_published:"Pibliye", adm_draft:"Bouyon",
adm_confirm_q_save:"Konfime anrejistreman an ?", adm_confirm_q_delete:"Konfime sipresyon an ? Aksyon sa a definitif.",
adm_faq_h:"FAQ", adm_faq_p:"Kesyon ki parèt nan panèl FAQ dedye sit la — pibliye sèlman lè ou deside.",
adm_faq_new:"+ Nouvo kesyon", adm_faq_empty:"Pa gen kesyon pou kounye a.",
adm_faq_q_ht:"Kesyon (Kreyòl)", adm_faq_q_fr:"Kesyon (Fransè)", adm_faq_q_en:"Kesyon (Anglè)", adm_faq_q_ph:"Ekri kesyon an…",
adm_faq_a_ht:"Repons (Kreyòl)", adm_faq_a_fr:"Repons (Fransè)", adm_faq_a_en:"Repons (Anglè)", adm_faq_a_ph:"Ekri repons lan…",
adm_faq_save:"Anrejistre", adm_faq_delete:"Efase kesyon sa a",
adm_faq_err_incomplete:"Ranpli kesyon an ak repons lan nan 3 lang yo.",
adm_faq_err_save:"Anrejistreman echwe.",
adm_faq_toast_h:"Kesyon anrejistre", adm_faq_toast_p:"Vizib imedyatman sou sit la si li pibliye.",
adm_faq_toast_del_h:"Kesyon efase", adm_faq_toast_del_p:"Li pa parèt sou sit la ankò.",
adm_testi_h:"Temwayaj", adm_testi_p:"Temwayaj kliyan yo, ajoute manyèlman epi pibliye lè ou deside.",
adm_testi_new:"+ Nouvo temwayaj", adm_testi_empty:"Pa gen temwayaj pou kounye a.",
adm_landing_h:"Estatistik paj akèy la", adm_landing_p:"Chif sa yo parèt sou paj akèy la — chanjman yo aplike PATOUT sou sit la imedyatman.",
adm_landing_users_lbl:"Itilizatè aktif", adm_landing_tickets_lbl:"Fich ki reyisi", adm_landing_rate_lbl:"To reyisit (%)", adm_landing_trust_lbl:"Nòt Trustpilot (sou 5)",
adm_landing_err_users:"Antre yon kantite itilizatè ki valid.", adm_landing_err_tickets:"Antre yon kantite fich ki valid.", adm_landing_err_rate:"Antre yon to ant 0 ak 100.", adm_landing_err_trust:"Antre yon nòt ant 0 ak 5.",
adm_landing_err_save:"Echèk anrejistreman an",
adm_landing_toast_h:"Estatistik mete ajou", adm_landing_toast_p:"Nouvo chif yo aktif imedyatman sou paj akèy la.",
adm_testi_author:"Non oto a",
adm_testi_content_ht:"Temwayaj (Kreyòl)", adm_testi_content_fr:"Temwayaj (Fransè)", adm_testi_content_en:"Temwayaj (Anglè)",
adm_testi_rating:"Nòt",
adm_testi_save:"Anrejistre", adm_testi_delete:"Efase temwayaj sa a",
adm_testi_err_incomplete:"Ranpli non an ak temwayaj la nan 3 lang yo.",
adm_testi_err_save:"Anrejistreman echwe.",
adm_testi_toast_h:"Temwayaj anrejistre", adm_testi_toast_p:"Vizib imedyatman sou sit la si li pibliye.",
adm_testi_toast_del_h:"Temwayaj efase", adm_testi_toast_del_p:"Li pa parèt sou sit la ankò.",
adm_user_pending_pay_h:"Peman ap tann",
adm_user_profile_h:"Pwofil", adm_user_role:"Wòl", adm_user_site:"Sit prefere", adm_user_since:"Manm depi",
adm_user_current_plan:"Plan aktyèl", adm_user_no_plan:"Okenn",
adm_user_change_plan_h:"Chanje plan", adm_user_change_plan_lbl:"Nouvo plan",
adm_user_change_plan_reason_lbl:"Nòt (opsyonèl)", adm_user_change_plan_reason_ph:"Egz. : jès komèsyal, korije yon erè...",
adm_user_change_plan_apply:"Aplike chanjman an", adm_user_change_plan_same:"Se deja plan aktyèl itilizatè a.",
adm_user_change_plan_err:"Chanjman an echwe.",
adm_user_suspend_h:"Sispansyon kont lan",
adm_user_suspend_reason_lbl:"Rezon (obligatwa — sèvis kliyan ap wè li)",
adm_user_suspend_reason_ph:"Egz. : peman fwod rapòte, vyolasyon kondisyon itilizasyon...",
adm_user_suspend_btn:"Sispann kont sa a", adm_user_reactivate_btn:"Reaktive kont sa a",
adm_user_suspend_reason_required:"Yon rezon obligatwa pou sispann yon kont.",
adm_user_suspend_err:"Aksyon an echwe.", adm_user_suspended_since:"Sispann nan",
adm_user_plan_changed_h:"Plan chanje", adm_user_plan_changed_p:"Nouvo plan an aktif imedyatman.", adm_user_plan_removed_p:"Plan an retire. Itilizatè sa a pa gen okenn plan aktif ankò.", adm_user_plan_none_option:"— Okenn plan (retire) —",
adm_user_suspended_h:"Kont sispann", adm_user_suspended_p:"Itilizatè a pap ka konekte ankò.", adm_leg_result_lbl:"Rezilta", adm_leg_result_none:"Poko jwe", adm_leg_result_won:"Genyen", adm_leg_result_lost:"Pèdi", adm_leg_result_void:"Anile",
adm_user_reactivated_h:"Kont reaktive", adm_user_reactivated_p:"Itilizatè a ka konekte ankò.",
adm_section_subs:"Abònman", adm_section_pays:"Peman", adm_none_yet:"Pa gen ankò.",
adm_pay_h:"Peman", adm_pay_p:"Valide oswa refize peman ki soumèt yo, dirèkteman soti nan baz done a.",
adm_pay_f_pending:"An atant", adm_pay_f_confirmed:"Konfime", adm_pay_f_rejected:"Refize", adm_pay_f_refunded:"Ranbouse",
adm_pay_count:"{n} peman", adm_pay_empty:"Pa gen peman nan kategori sa a.",
adm_pay_plan:"Plan", adm_pay_amount:"Montan", adm_pay_method:"Mwayen peman", adm_pay_ref:"Referans",
adm_pay_date:"Dat", adm_pay_status:"Estati", adm_pay_confirmed_at:"Valide nan",
adm_pay_reason_h:"Rezon refi a", adm_pay_action_h:"Desizyon",
adm_pay_reason_lbl:"Rezon (obligatwa si refi)", adm_pay_reason_ph:"Egz. : referans pa jwenn, move montan...",
adm_pay_valider:"Valide", adm_pay_refuser:"Refize",
adm_pay_reason_required:"Yon rezon obligatwa pou refize yon peman.",
adm_pay_blocked_suspended:"Kont sa a sispann : pa gen okenn desizyon (konfime oswa refize) posib pandan kont lan sispann. Reyaktive kont lan anvan.",
adm_pay_action_error:"Aksyon an echwe. Verifye koneksyon an epi eseye ankò.",
adm_pay_toast_confirmed_h:"Peman valide", adm_pay_toast_confirmed_p:"Abònman an aktif kounye a.",
adm_pay_toast_rejected_h:"Peman refize", adm_pay_toast_rejected_p:"Itilizatè a ap wè rezon refi a.",
sb_sync_err_h:"Kont kreye sèlman lokalman",
sb_sync_err_p:"Senkronizasyon ak sèvè a echwe. Eseye ankò pita.",
sb_pay_sync_err_p:"Peman an pa t kapab anrejistre kote sèvè a — li pap parèt nan espas admin lan konsa.",
pwr_back_dash:"Retounen nan Dashboard la",
wiz_sending:"Ap voye...",
toast_mail_err_h:"Nou pa ka voye imèl la",
toast_mail_err_p:"Imèl la pa t kapab voye. Tanpri eseye ankò nan yon ti moman.",
plan_changed_lifetime:"Ou debloke aksè a vi a !", dash_menu_exit:"Dekonekte",
wiz_p_moncash:"MonCash otomatik", wiz_p_natcash:"NatCash otomatik",
wiz_p_auto_badge:"Rekòmande", wiz_p_auto_sub:"Konfimasyon otomatik — anjeneral mwens pase yon minit",
auth_err_email_taken:"Imèl sa a deja anrejistre",
auth_err_badpass:"Modpas la pa kòrèk",
auth_err_nouser:"Nou pa jwenn okenn kont ak idantifyan sa a",
auth_taken_h:"Imèl sa a deja anrejistre",
auth_taken_sub:"Gen yon kont ki deja gen imèl sa a. Ale nan paj koneksyon an pou w antre.",
auth_suspended_h:"Kont sispann",
auth_suspended_p:"Kont sa a sispann pou kounye a. Kontakte sèvis kliyan pou plis enfòmasyon.",
auth_suspended_reason_p:"Kont ou sispann pou: {reason}. Tanpri kontakte sèvis kliyan!",
mfa_enroll_h:"Sekirize kont admin ou",
mfa_enroll_p:"Eskane kòd QR sa a ak Google Authenticator (oswa yon app similè), epi antre kòd 6 chif la pou aktive li.",
mfa_challenge_h:"Verifikasyon an 2 etap",
mfa_challenge_p:"Antre kòd 6 chif ki nan app otantifikasyon ou a.",
mfa_err_code:"Kòd la pa kòrèk", mfa_btn_activate:"Aktive 2FA", mfa_btn_verify:"Verifye",
mfa_error_h:"Pwoblèm ak 2FA", mfa_error_p:"Nou pa ka kontinye kounye a. Eseye ankò — aksè nan dashboard la rete bloke jiskaske 2FA verifye.",
mfa_error_cleanup:"Nou pa t kapab netwaye yon ansyen tantativ enskripsyon.",
mfa_error_nofactor:"Pa gen okenn kòd otantifikasyon aktif.",
mfa_btn_retry:"Eseye ankò",
mfa_copy:"Kopye", mfa_copied:"Kopye!",
mfa_remember:"Sonje aparèy sa a pandan 30 jou",
mfa_use_backup:"Sèvi ak yon kòd sekou",
mfa_backup_h:"Kòd sekou", mfa_backup_p:"Antre youn nan kòd sekou ou te telechaje yo.",
mfa_backup_err:"Kòd sa a envalid oswa deja itilize.",
mfa_back_to_code:"Retounen nan kòd la",
mfa_codes_h:"Kòd sekou ou yo",
mfa_codes_p:"Konsève kòd sa yo yon kote ki an sekirite. Chak kòd sèlman itilizab yon sèl fwa, si w pèdi aksè a app otantifikasyon ou a.",
mfa_codes_download:"Telechaje kòd yo",
mfa_codes_continue:"Kontinye",
auth_taken_cta:"Ale nan koneksyon",
wiz_r_h:"Renouvle oswa chanje plan", wiz_r_sub:"Chwazi plan ou epi peye — kont ou deja kreye.",
wiz_r_active:"Abònman ou genyen an rete aktif. Nouvo plan an kòmanse apre peman an.",
wiz_r_expired:"Abònman ou ekspire. Peye pou debloke cotes yo ankò.",
dash_expired_h:"Abònman ou ekspire",
dash_expired_sub:"Ou toujou gen aksè nan dashboard la, men tout cotes yo fèmen. Renouvle oswa chwazi yon lòt plan pou debloke yo.",
dash_expired_cta:"Renouvle plan an",
dash_expired_p:"Abònman ou ekspire. Renouvle pou w wè cotes yo ankò.",
dash_sub_expired:"Ekspire",
dash_activate_cta:"Aktive plan mwen", dash_rejected_ov_p:"Peman ou pa t pase. Aktive yon plan pou w wè cotes yo.", dash_sub_rejected:"Peman pa reyisi", dash_sub_noplan:"Ou pa gen okenn plan aktif kounye a. Aktive yon plan pou w debloke fich ak cotes yo.",
dash_pending_h:"Peman ap tann verifikasyon",
dash_pending_sub:"Peman ou an ap tann yon admin konfime li. Pronostik yo ap debloke otomatikman apre sa.",
dash_pending_ov_p:"Ap tann validasyon peman ou.", dash_sub_msg_pending_plan:"Demann abònman {plan} ou an ap tann validasyon ekip nou an. W ap ka fè yon nouvo demann lè li konfime oswa refize.",
dash_sub_msg_rejected:"Chanjman plan ou echwe. Tanpri eseye ankò.",
dash_sub_msg_expired:"Abònman ou ekspire. Tanpri reyaktive yon plan kounye a !",
dash_sub_msg_renew_soon:"Tanpri renouvle abònman ou anvan {date}.",
dash_sub_msg_active:"Nouvo plan {plan} ou aktive avèk siksè.",
faq2_q:"Èske nou garanti benefis?",
legal_tag_cgu:"Legal", legal_tag_confid:"Legal", legal_tag_jeu:"Legal",
legal_note:"Dokiman sa a se yon vèsyon jeneral. Anvan piblikasyon ofisyèl la, li dwe reli pa yon konseye jiridik.",
legal_cgu_body:"<h3>1. Objè</h3><p>VIP BETCOTE se yon sèvis enfòmasyon ki pibliye analiz ak seleksyon espòtif kòm endikasyon sèlman. Platfòm nan pa yon operatè paryaj, ni yon entèmedyè mizè. VIP BETCOTE pa plase, pa kolekte epi pa peye okenn paryaj.</p><h3>2. Aksè</h3><p>Aksè a rezève pou moun ki gen <strong>18 an oswa plis</strong>. Pou kreye yon kont, ou bezwen yon imèl valid ak yon nimewo telefòn. Se ou ki responsab enfòmasyon ou bay yo ak konfidansyalite modpas ou.</p><h3>3. Abònman ak peman</h3><ul><li>Pri yo an goud (HTG), peyab ak MonCash, NatCash oswa kat bankè.</li><li>Abònman an kòmanse lè peman an valide epi li fini nan dat ekspirasyon ki nan dashboard ou.</li><li>Abònman ki gen yon dire fiks pa renouvle otomatikman.</li><li>Plan a vi a se yon sèl peman, san renouvèlman.</li></ul><h3>4. Pa gen garanti benefis</h3><p>Paryaj espòtif gen yon risk pou pèdi lajan. <strong>Okenn seleksyon nou pibliye pa yon garanti pou genyen.</strong> Nòt konfyans yo se yon evalyasyon ekip nou an fè. Rezilta ki pase pa di sa k ap vini. Se ou menm ki deside mizè ou epi ki responsab pèt ou ka fè.</p><h3>5. Itilizasyon kontni an</h3><p>Seleksyon nou pibliye yo se pou itilizasyon pèsonèl ou. Revann yo, redistribiye yo oswa pibliye yo lòt kote entèdi epi sa ka fè kont ou fèmen imedyatman, san ranbousman.</p><h3>6. Sispansyon ak fèmti</h3><p>Nou ka sispann yon kont si gen pataj idantifyan, fwod nan peman, oswa si kondisyon sa yo pa respekte. Ou ka sispann itilize sèvis la nenpòt kilè.</p><h3>7. Chanjman</h3><p>Kondisyon sa yo ka chanje. Itilizatè aktif yo resevwa enfòmasyon sou chanjman enpòtan pa imèl oswa nan yon notifikasyon nan dashboard la.</p>",
legal_confid_body:"<h3>1. Done nou kolekte</h3><p>Nou kolekte sèlman sa sèvis la bezwen pou fonksyone :</p><ul><li><strong>Kont</strong> : non, imèl, nimewo telefòn, modpas (konsève chiffre, pa janm an klè).</li><li><strong>Abònman</strong> : plan ou chwazi, dat kòmansman ak dat ekspirasyon, referans tranzaksyon, mwayen peman.</li><li><strong>Itilizasyon</strong> : dènye dat koneksyon ak lang ou pi renmen.</li></ul><h3>2. Done bankè</h3><p>Nimewo kat ak idantifyan pòtfèy mobil yo antre dirèkteman kay prestatè peman an. <strong>Nou pa konsève okenn done bankè</strong> sou sèvè nou yo.</p><h3>3. Itilizasyon</h3><p>Done ou yo sèvi pou kreye ak sekirize kont ou, aktive epi swiv abònman ou, voye notifikasyon sèvis la, epi reponn demann sipò ou. Yo pa sèvi pou lòt bagay.</p><h3>4. Pataj</h3><p>Nou pa vann ni lwe done ou. Yo pataje sèlman ak prestatè ki estriktèman nesesè yo — ebèjman, voye imèl, tretman peman — epi sèlman pou pati misyon yo mande a.</p><h3>5. Konsèvasyon</h3><p>Done kont yo konsève toutotan kont la aktif. Apre siprime, yo efase nan 30 jou, eksepte prèv peman yo ki konsève pou obligasyon kontabilite.</p><h3>6. Dwa ou</h3><p>Ou ka mande pou wè, korije oswa siprime done ou, epi resevwa yon kopi kont ou. Yon demann ki soti nan imèl anrejistre a trete nan 30 jou.</p><h3>7. Sekirite</h3><p>Modpas yo chiffre, echanj yo sikile an HTTPS, epi aksè a done yo limite ak moun ki bezwen yo. Kòm okenn sistèm pa enfayib, nou rekòmande yon modpas long epi inik.</p>",
legal_jeu_body:"<h3>Paryaj dwe rete yon lwazi</h3><p>Paryaj se pa yon sous revni epi li pa dwe janm konsidere kòm yon mwayen pou peye yon dèt oswa ranplase yon pèt. <strong>Mize sèlman sa ou ka pèdi san sa chanje lavi ou chak jou.</strong></p><h3>Sa nou pa pwomèt</h3><p>VIP BETCOTE pibliye analiz, se pa sètitid. Okenn seleksyon pa garanti. Istorik nou an montre fich ki pèdi yo menm jan ak sa ki genyen yo, jistman paske pèt fè pati aktivite a.</p><h3>Siy ki dwe alèsèt ou</h3><ul><li>Ou mize plis chak fwa pou santi menm enterè a.</li><li>Ou rejwe imedyatman pou ranplase yon pèt.</li><li>Ou prete lajan, oswa ou pran nan yon bidjè ki te pou lòt bagay.</li><li>Ou kache mizè ou bay moun pre ou yo.</li><li>Ou jwe pou chape anba estrès, raz oswa tristès.</li><li>Ou deja eseye kanpe san ou pa rive.</li></ul><h3>Kenbe kontwòl</h3><ul><li>Fikse yon bidjè chak mwa anvan ou kòmanse, epi rete ladan l.</li><li>Fikse yon limit tan tou.</li><li>Pa janm jwe lè ou bwè, lè ou fatige oswa lè ou fache.</li><li>Apre yon pèt, kanpe pou jounen an olye ou rejwe.</li><li>Tcheke regilyèman total ou reyèlman mize sou yon mwa.</li></ul><h3>Entèdi pou minè</h3><p>Sèvis sa a estriktèman rezève pou moun ki gen <strong>18 an oswa plis</strong>. Nenpòt kont yo idantifye kòm pou yon minè fèmen san ranbousman.</p><h3>Mande èd</h3><p>Si jwèt la ap pran yon plas ki enkyete ou, pale sou sa ak yon moun ou fè konfyans, yon doktè oswa yon sikològ. Pale bonè fè bagay yo pi fasil anpil. Ou ka ekri nou tou pou mande fèmti definitif kont ou : nou aplike demann sa a san diskisyon.</p>",
},
};

let currentLang='ht';

const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=window.matchMedia('(hover:hover) and (pointer:fine)').matches;

// Duplique le ticker pour une boucle fluide
const tick=document.getElementById('tick');
tick.innerHTML+=tick.innerHTML;

// ---------- Menu mobile ----------
const burger=document.getElementById('burger');
const mnav=document.getElementById('mnav');
const closeMenu=()=>{mnav.classList.remove('on');burger.classList.remove('open');burger.setAttribute('aria-expanded','false');document.body.style.overflow=''};
burger.addEventListener('click',()=>{
  const on=mnav.classList.toggle('on');
  burger.classList.toggle('open',on);
  burger.setAttribute('aria-expanded',on);
  document.body.style.overflow=on?'hidden':'';
});
mnav.querySelectorAll('a,button').forEach(el=>el.addEventListener('click',closeMenu));

// ---------- Ancres du menu : fermeture puis defilement vers la section ----------
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  const id=a.getAttribute('href');
  if(!id||id.length<2)return;                 // le logo (href="#") est ignore
  const target=document.querySelector(id);
  if(!target)return;
  a.addEventListener('click',ev=>{
    ev.preventDefault();
    if(mnav.classList.contains('on'))closeMenu();
    requestAnimationFrame(()=>{
      target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'});
      if(history.replaceState)history.replaceState(null,'',id);
    });
  });
});

// ---------- Compteurs animés ----------
const io=new IntersectionObserver(es=>{
  es.forEach(e=>{
    if(!e.isIntersecting)return;
    const el=e.target,end=+el.dataset.count,dur=1600,t0=performance.now();
    const suffix=el.dataset.suffix||'';
    const sep=el.dataset.sep||'';
    const loc=sep==='comma'?'en-US':'fr-FR';
    const step=t=>{
      const p=Math.min((t-t0)/dur,1),v=Math.floor(end*(1-Math.pow(1-p,3)));
      el.textContent=(sep==='none'?String(v):v.toLocaleString(loc))+suffix;
      if(p<1)requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    io.unobserve(el);
  });
},{threshold:.5});
document.querySelectorAll('[data-count]').forEach(el=>io.observe(el));

// ---------- Reveal 3D au scroll ----------
const rio=new IntersectionObserver(es=>{
  es.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>e.target.classList.add('in'), (i%3)*90);
      rio.unobserve(e.target);
    }
  });
},{threshold:.12});
document.querySelectorAll('.rev').forEach(el=>rio.observe(el));

// ---------- Tilt 3D des cartes (desktop uniquement) ----------
if(!reduced&&finePointer){
  document.querySelectorAll('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${(-y*7).toFixed(2)}deg) rotateY(${(x*9).toFixed(2)}deg) translateZ(6px)`;
    });
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });
}

// ---------- Simulateur (maquette) ----------
let s2mise=250, s2cote=45.65, s2formule='VIP 21 JOU';
const nf=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');

const s2El={
  cote:document.getElementById('s2-cote'),
  mise:document.getElementById('s2-mise'),
  gain:document.getElementById('s2-gain'),
  profit:document.getElementById('s2-profit'),
  formule:document.getElementById('s2-formule'),
};

function updateSim2(){
  const gain=Math.round(s2mise*s2cote);
  if(s2El.cote)s2El.cote.textContent=s2cote.toFixed(2);
  if(s2El.mise)s2El.mise.textContent=nf(s2mise)+' HTG';
  if(s2El.gain)s2El.gain.textContent=nf(gain);
  if(s2El.profit)s2El.profit.textContent='+'+nf(gain-s2mise)+' HTG';
  const wf=(translations[currentLang]&&translations[currentLang].word_formule)||'FORMULE';
  s2El.formule.textContent=wf+' '+s2formule;
}

const s2Mises=document.getElementById('sim2-mises');
if(s2Mises){
  s2Mises.addEventListener('click',ev=>{
    const b=ev.target.closest('.sim2-mise');if(!b)return;
    s2Mises.querySelectorAll('.sim2-mise').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    s2mise=+b.dataset.mise;
    updateSim2();
  });
}

const s2Formules=document.getElementById('sim2-formules');
if(s2Formules){
  s2Formules.addEventListener('click',ev=>{
    const b=ev.target.closest('.sim2-formule');if(!b)return;
    s2Formules.querySelectorAll('.sim2-formule').forEach(x=>x.classList.remove('on'));
    b.classList.add('on');
    s2cote=+b.dataset.cote;
    s2formule=b.dataset.formule;
    updateSim2();
  });
}

updateSim2();

function applyLang(lang){
  if(!translations[lang])return;
  currentLang=lang;
  document.documentElement.lang=(lang==='ht'?'ht':lang);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key=el.dataset.i18n;
    const val=translations[lang][key];
    if(val!=null)el.innerHTML=val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{
    const key=el.dataset.i18nPh;
    const val=translations[lang][key];
    if(val!=null)el.setAttribute('placeholder',val);
  });
  document.querySelectorAll('.mnav-lang-opt').forEach(b=>b.classList.toggle('on',b.dataset.lang===lang));
  const flags={ht:'\uD83C\uDDED\uD83C\uDDF9',fr:'\uD83C\uDDEB\uD83C\uDDF7',en:'\uD83C\uDDFA\uD83C\uDDF8'};
  document.querySelectorAll('.langdd-flag').forEach(fl=>{fl.textContent=flags[lang]||flags.ht;});
  document.documentElement.setAttribute('lang',lang);
  document.querySelectorAll('.langdd-opt').forEach(o=>{o.hidden=(o.dataset.lang===lang)});
  updateSim2();
  document.dispatchEvent(new CustomEvent('vb:langchange',{detail:{lang}}));
}

document.querySelectorAll('.mnav-lang-opt').forEach(b=>{
  b.addEventListener('click',()=>applyLang(b.dataset.lang));
});

// Langue par defaut du site : creole haitien
applyLang('ht');

// ---------- Carrousels (Tickets gagnants + Témoignages) ----------
function makeCarousel(trackId,prevSel,nextSel,dotsId,labelFn){
  const track=document.getElementById(trackId);
  if(!track)return;
  const cards=[...track.children];
  const prevBtn=document.querySelector(prevSel);
  const nextBtn=document.querySelector(nextSel);
  const dotsWrap=dotsId?document.getElementById(dotsId):null;
  if(!cards.length||!prevBtn||!nextBtn)return;

  let dots=[];
  if(dotsWrap){
    dotsWrap.innerHTML='';
    cards.forEach((_,i)=>{
      const d=document.createElement('button');
      d.type='button';
      d.className='win-dot'+(i===0?' on':'');
      d.setAttribute('aria-label',labelFn(i+1));
      d.addEventListener('click',()=>scrollToCard(i));
      dotsWrap.appendChild(d);
    });
    dots=[...dotsWrap.children];
  }

  function step(){
    const gap=parseFloat(getComputedStyle(track).columnGap)||20;
    return cards[0].getBoundingClientRect().width+gap;
  }
  function currentIndex(){return Math.round(track.scrollLeft/step());}
  function scrollToCard(i){
    i=Math.max(0,Math.min(cards.length-1,i));
    track.scrollTo({left:i*step(),behavior:'smooth'});
  }
  function updateUI(){
    const i=Math.max(0,Math.min(cards.length-1,currentIndex()));
    dots.forEach((d,idx)=>d.classList.toggle('on',idx===i));
    const maxScroll=track.scrollWidth-track.clientWidth-2;
    prevBtn.disabled=track.scrollLeft<=2;
    nextBtn.disabled=track.scrollLeft>=maxScroll;
  }

  prevBtn.addEventListener('click',()=>scrollToCard(currentIndex()-1));
  nextBtn.addEventListener('click',()=>scrollToCard(currentIndex()+1));
  track.addEventListener('scroll',()=>{
    clearTimeout(track._t);
    track._t=setTimeout(updateUI,60);
  },{passive:true});
  track.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();scrollToCard(currentIndex()+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();scrollToCard(currentIndex()-1);}
  });
  window.addEventListener('resize',updateUI);
  updateUI();
}
makeCarousel('winTrack','.win-prev','.win-next',null,n=>'Aller au ticket '+n);

// ---------- Visionneuse des preuves ----------
(function(){
  const lbx=document.getElementById('lbx'), lbxImg=document.getElementById('lbxImg');
  if(!lbx||!lbxImg)return;
  let opener=null;
  function open(img){
    opener=img.closest('.proof-shot');
    lbxImg.src=img.currentSrc||img.src;
    lbxImg.alt=img.alt;
    lbx.classList.add('open');
    document.body.style.overflow='hidden';
    document.getElementById('lbxClose').focus();
  }
  function close(){
    lbx.classList.remove('open');
    lbxImg.src='';
    document.body.style.overflow='';
    if(opener){opener.focus();opener=null;}
  }
  document.querySelectorAll('.proof-shot').forEach(btn=>{
    btn.addEventListener('click',()=>{const im=btn.querySelector('img'); if(im)open(im);});
  });
  document.getElementById('lbxClose').addEventListener('click',close);
  lbx.addEventListener('click',ev=>{ if(ev.target===lbx)close(); });
  document.addEventListener('keydown',ev=>{ if(ev.key==='Escape'&&lbx.classList.contains('open'))close(); });
})();

// ---------- Carrousel Cover Flow des abonnements ----------
(function(){
  const track=document.getElementById('pcarTrack');
  if(!track)return;
  const cards=[...track.children];
  const prev=document.querySelector('.pcar-prev');
  const next=document.querySelector('.pcar-next');
  const dotsWrap=document.getElementById('pcarDots');
  if(!cards.length)return;

  const dots=cards.map((_,i)=>{
    const b=document.createElement('button');
    b.type='button';b.className='pcar-dot'+(i===1?' on':'');
    b.setAttribute('aria-label','Plan '+(i+1));
    b.addEventListener('click',()=>goTo(i));
    dotsWrap.appendChild(b);
    return b;
  });

  let raf=0;
  function layout(){
    raf=0;
    const r=track.getBoundingClientRect();
    const cx=r.left+r.width/2;
    let best=0,bestD=Infinity;
    cards.forEach((c,i)=>{
      const cr=c.getBoundingClientRect();
      const d=((cr.left+cr.width/2)-cx)/cr.width;      // ecart en largeurs de carte
      const a=Math.min(Math.abs(d),1);
      if(Math.abs(d)<bestD){bestD=Math.abs(d);best=i;}
      const s=1-a*0.30;                                 // centre ~43 % plus grand
      const tx=-d*(cr.width*0.13);                      // rapprochement lateral
      const ry=Math.max(-14,Math.min(14,-d*13));
      c.style.transform='translateX('+tx.toFixed(1)+'px) scale('+s.toFixed(3)+') rotateY('+ry.toFixed(1)+'deg)';
      c.style.opacity=(1-a*0.22).toFixed(3);
      c.style.zIndex=String(20-Math.round(a*10));
      c.classList.toggle('is-center',a<0.35);
    });
    dots.forEach((b,i)=>b.classList.toggle('on',i===best));
    if(prev)prev.disabled=track.scrollLeft<=2;
    if(next)next.disabled=track.scrollLeft>=track.scrollWidth-track.clientWidth-2;
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(layout);}
  function centerIndex(){
    const r=track.getBoundingClientRect(),cx=r.left+r.width/2;
    let best=0,bd=Infinity;
    cards.forEach((c,i)=>{const cr=c.getBoundingClientRect();const d=Math.abs(cr.left+cr.width/2-cx);if(d<bd){bd=d;best=i;}});
    return best;
  }
  function goTo(i){
    i=Math.max(0,Math.min(cards.length-1,i));
    const c=cards[i];
    track.scrollTo({left:c.offsetLeft-(track.clientWidth-c.offsetWidth)/2,behavior:reduced?'auto':'smooth'});
  }
  if(prev)prev.addEventListener('click',()=>goTo(centerIndex()-1));
  if(next)next.addEventListener('click',()=>goTo(centerIndex()+1));
  track.addEventListener('scroll',schedule,{passive:true});
  track.addEventListener('keydown',e=>{
    if(e.key==='ArrowRight'){e.preventDefault();goTo(centerIndex()+1);}
    if(e.key==='ArrowLeft'){e.preventDefault();goTo(centerIndex()-1);}
  });
  window.addEventListener('resize',()=>{goTo(centerIndex());schedule();});
  // demarrage sur le plan mis en avant
  requestAnimationFrame(()=>{
    const c=cards[1]||cards[0];
    track.scrollLeft=c.offsetLeft-(track.clientWidth-c.offsetWidth)/2;
    layout();
  });
})();

// ---------- Boutons internes : defilement doux vers une section ----------
document.querySelectorAll('[data-goto]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const t=document.querySelector(btn.dataset.goto);
    if(!t)return;
    if(mnav.classList.contains('on'))closeMenu();
    requestAnimationFrame(()=>t.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'}));
  });
});

// ---------- Page FAQ ----------
(function(){
  const page=document.getElementById('faqpage');
  if(!page)return;
  let opener=null;
  function openFaq(from){
    opener=from||null;
    page.classList.add('open');
    page.scrollTop=0;
    document.body.style.overflow='hidden';
    const c=document.getElementById('faqpageClose');
    if(c)c.focus();
  }
  function closeFaq(){
    page.classList.remove('open');
    document.body.style.overflow='';
    if(opener){opener.focus();opener=null;}
  }
  document.querySelectorAll('[data-faq-open]').forEach(a=>{
    a.addEventListener('click',ev=>{
      ev.preventDefault();
      ev.stopPropagation();
      if(mnav.classList.contains('on'))closeMenu();
      openFaq(a);
    });
  });
  document.querySelectorAll('[data-faq-close]').forEach(b=>b.addEventListener('click',closeFaq));
  const cl=document.getElementById('faqpageClose');
  if(cl)cl.addEventListener('click',closeFaq);
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&page.classList.contains('open'))closeFaq();
  });
})();

// ---------- Wizard d'inscription : etat, garde d'acces, 4 etapes ----------
(function(){
  const page=document.getElementById('authpage');
  if(!page)return;

  /* ---- Catalogue des plans (source unique de verite) ---- */
  const PLANS=[
    {id:'p1', nameKey:'pl1_name', perKey:'pl1_per', prix:249,  days:7,    feats:['pf_c515','pf_betcote']},
    {id:'p2', nameKey:'pl2_name', perKey:'pl2_per', prix:499,  days:21,   feats:['pf_c1580','pf_betcote','pf_lien'], popular:true},
    {id:'p3', nameKey:'pl3_name', perKey:'pl3_per', prix:999,  days:30,   feats:['pf_c1000','pf_betcote','pf_lien','pf_score']},
    {id:'p4', nameKey:'pl4_name', perKey:'pl4_per', prix:2500, days:null, feats:['pf_c1000p','pf_betcote','pf_lien','pf_score','pf_illim']}
  ];

  /* Liens de paiement Stripe (Payment Links), un par plan, dans l'ordre
     p1 -> p4. Regle de securite inchangee : Stripe encaisse, mais le
     paiement reste TOUJOURS ecrit en 'pending' cote base — seul un
     admin peut faire passer un abonnement a 'active', jamais le site
     lui-meme ni un retour de Stripe. */
  const STRIPE_LINKS={
    p1:'https://buy.stripe.com/4gM14ngfD0PSesRe2c9MY01',
    p2:'https://buy.stripe.com/bJe9AT3sR7eg5Wl7DO9MY02',
    p3:'https://buy.stripe.com/28E3cvfbzbuw70pf6g9MY03',
    p4:'https://buy.stripe.com/4gMaEXd3rbuwckJe2c9MY04'
  };
  const planById=id=>PLANS.find(p=>p.id===id)||null;
  const T=()=>translations[currentLang]||translations.fr;
  const t=k=>(T()[k]!=null?T()[k]:(translations.fr[k]||''));
  const stripTags=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent||'';};
  const money=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');

  /* ---- Persistance : localStorage, repli en memoire si indisponible ---- */
  const KEY='vipbetcote.signup.v1';
  let mem=null;
  const store={
    read(){
      try{const raw=localStorage.getItem(KEY);return raw?JSON.parse(raw):null;}
      catch(e){return mem;}
    },
    write(v){
      mem=v;
      try{localStorage.setItem(KEY,JSON.stringify(v));}catch(e){}
    },
    clear(){
      mem=null;
      try{localStorage.removeItem(KEY);}catch(e){}
    }
  };

  /* ---- Empreinte de session (horodatage + jeton) ----
     Chaque onglet ouvert genere un jeton aleatoire et l'ecrit dans
     localStorage : le dernier onglet ouvert ou actif "possede" la session.
     Si un AUTRE onglet/fenetre modifie les donnees du compte, cet onglet
     le detecte (evenement 'storage') et se marque perime : il bloque la
     validation d'un paiement tant que la page n'a pas ete rafraichie.
     Limite assumee : contournable par quelqu'un qui edite localStorage
     directement. Une protection reelle exige une session cote serveur. */
  const SKEY='vipbetcote.session.v1';
  const mySessionToken=Date.now().toString(36)+'.'+Math.random().toString(36).slice(2);
  let sessionPerimee=false;
  try{localStorage.setItem(SKEY,JSON.stringify({token:mySessionToken,ts:Date.now()}));}catch(e){}
  window.addEventListener('storage',ev=>{
    if(ev.key!==SKEY||!ev.newValue)return;
    try{
      const v=JSON.parse(ev.newValue);
      if(v.token!==mySessionToken){
        sessionPerimee=true;
        if(window.VB_toast)window.VB_toast('session_stale_h',t('session_stale_p'));
      }
    }catch(e){}
  });
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState!=='visible'||!sessionPerimee)return;
    // reprend la main silencieusement si l'onglet redevient actif
  });

  /* ---- Registre des comptes ----
     Demonstration uniquement. Un vrai backend stocke le mot de passe
     hache avec Argon2id cote serveur ; ici on ne garde qu'une empreinte
     non lisible pour comparer, jamais le mot de passe en clair. */
  const AKEY='vipbetcote.accounts.v1';
  let memAcc=null;
  function fingerprint(str){
    let h1=0x811c9dc5,h2=0x1000193;
    for(let i=0;i<str.length;i++){
      h1=(h1^str.charCodeAt(i))>>>0; h1=Math.imul(h1,0x01000193)>>>0;
      h2=(h2+str.charCodeAt(i)*(i+7))>>>0; h2=Math.imul(h2,0x85ebca6b)>>>0;
    }
    return h1.toString(36)+'.'+h2.toString(36);
  }
  const accounts={
    all(){
      try{const r=localStorage.getItem(AKEY);return r?JSON.parse(r):{};}
      catch(e){return memAcc||{};}
    },
    save(map){memAcc=map;try{localStorage.setItem(AKEY,JSON.stringify(map));}catch(e){}},
    find(id){
      const map=this.all();
      const key=String(id||'').trim().toLowerCase();
      if(map[key])return map[key];
      return null;
    },
    put(acc){
      const map=this.all();
      map[acc.email.trim().toLowerCase()]=acc;
      this.save(map);
    }
  };
  // Un compte est "complet" quand l'e-mail est verifie ET qu'un paiement a eu lieu
  const isComplete=a=>!!(a&&a.emailVerified&&a.paid);

  /* ---- Etat du parcours ---- */
  /* payStatus : etat REEL du paiement, distinct de "paid" qui ne veut dire
     que "a termine le parcours de paiement" (donne acces au Dashboard).
     'none' = jamais paye ; 'pending' = paiement soumis, en attente de
     validation admin ; 'confirmed' = valide par un admin (ou passerelle
     automatique) ; 'rejected' = refuse par un admin, raison obligatoire. */
  const blank=()=>({step:1,started:false,fullname:'',email:'',site:'paryajpam',pass:null,planId:null,pendingPlanId:null,pendingRef:null,emailVerified:false,paid:false,payStatus:'none',payMethod:null,code:null,startedAt:null,ref:null,startDate:null,endDate:null});
  let state=store.read()||blank();
  const save=()=>store.write(state);

  /*
    GARDE D'ACCES — logique de reference.
    Cette fonction retourne l'etape a laquelle l'utilisateur doit etre envoye.
    C'est exactement la regle que le middleware serveur devra appliquer
    sur toute route /dashboard : compte cree -> email verifie -> abonnement actif.
  */
  function requiredStep(st){
    if(!st||!st.email)return 1;      // pas de compte
    if(!st.emailVerified)return 1;   // email non verifie : on reste a l'etape Kont
    if(!st.paid)return 3;            // n'a jamais tente de paiement : dashboard interdit
    return 4;                        // parcours de paiement termine : entree Dashboard autorisee
                                      // (le CONTENU reste verrouille tant que payStatus n'est pas 'confirmed' — voir isPending())
  }

  /*
    Abonnement expire : l'utilisateur GARDE l'acces au dashboard
    (il a deja paye au moins une fois) mais toutes les cotes sont
    verrouillees jusqu'au renouvellement. C'est different de
    requiredStep, qui ne gouverne que l'entree dans le dashboard.
  */
  /* ---- Regles de renouvellement ----
     Un plan ne peut etre renouvele que lorsqu'il approche de sa fin.
     Seuils (jours restants) par plan ; le Lifetime n'est jamais renouvelable. */
  const RENEW_SEUIL={p1:1,p2:3,p3:7};
  const RANG={p1:1,p2:2,p3:3,p4:4};

  function joursRestants(st){
    if(!st||!st.endDate)return null;                 // aucune echeance (Lifetime)
    return Math.ceil((new Date(st.endDate).getTime()-Date.now())/86400000);
  }

  /* Le plan actif est-il dans sa periode de fin (ou deja termine) ? */
  function enPeriodeDeFin(st){
    if(!st||!st.paid)return false;
    if(st.planId==='p4')return false;              // Lifetime : jamais
    const seuil=RENEW_SEUIL[st.planId];
    if(seuil==null)return false;
    const reste=joursRestants(st);
    if(reste===null)return false;
    return reste<=seuil;                           // inclut les plans expires
  }

  /*
    DEUX REGLES DISTINCTES, a ne jamais confondre :

    - RENOUVELLEMENT (meme plan) : autorise uniquement en periode de fin.
    - CHANGEMENT DE PLAN ACTIF   : monter en gamme est libre a tout moment ;
      descendre en gamme exige d'etre en periode de fin.

    Retourne {ok:true} ou {ok:false,raison:'cle_i18n'}.
  */
  function renouvellementPermis(st,planVise){
    if(!st)return {ok:true};
    // CORRIGÉ (31/08, bug signalé par James) : ce contrôle était placé
    // APRÈS le retour anticipé `!st.paid` ci-dessous, donc jamais atteint
    // par un utilisateur expiré (ni par une 1re souscription) — d'où
    // plusieurs paiements 'pending' empilés pour la même personne. Il
    // s'applique désormais à TOUS les cas, sans exception : tant qu'une
    // demande est en attente, aucune nouvelle transaction n'est possible
    // avant que l'admin l'ait confirmée OU refusée. Seule décision de
    // l'admin débloque la situation, jamais l'utilisateur lui-même.
    if(st.payStatus==='pending'||st.pendingRef)return {ok:false,raison:'renew_err_pending'};
    if(!st.paid)return {ok:true};                            // 1re souscription
    if(st.planId==='p4')return {ok:false,raison:'renew_err_lifetime'};

    const fin=enPeriodeDeFin(st);

    if(planVise===st.planId){                                // RENOUVELLEMENT
      return fin?{ok:true}:{ok:false,raison:'renew_err_encours'};
    }
    // CHANGEMENT DE PLAN ACTIF
    if(fin)return {ok:true};                                 // en periode de fin : tout est permis
    const monte=(RANG[planVise]||0)>(RANG[st.planId]||0);
    return monte?{ok:true}:{ok:false,raison:'renew_err_inferieur'};
  }
  window.VB_renewAllowed=planVise=>renouvellementPermis(state,planVise||state.planId);
  window.VB_isLifetime=()=>!!(state&&state.paid&&state.planId==='p4');

  function subscriptionExpired(st){
    if(!st||!st.paid)return false;
    if(!st.endDate)return false;               // plan a vie : jamais expire
    return new Date(st.endDate).getTime()<=Date.now();
  }
  const dashboardUnlocked=()=>requiredStep(state)===4;

  /* ---- Elements ---- */
  const modeLogin=document.getElementById('authModeLogin');
  const modeWizard=document.getElementById('authModeWizard');
  const tabs={login:document.getElementById('authTabLogin'),signup:document.getElementById('authTabSignup')};
  const barFill=document.getElementById('wizBarFill');
  const bar=document.getElementById('wizBar');
  const nodes=[...document.querySelectorAll('.wiz-node')];
  const panels=[...document.querySelectorAll('.wiz-panel')];
  const resume=document.getElementById('authResume');
  const resumeTxt=document.getElementById('authResumeTxt');
  let opener=null;

  /* Page de paiement : expiration apres inactivite. Un lien partage vers
     cette page ne reste donc utile que quelques minutes. Mesure cote
     interface uniquement — une vraie protection exige une session serveur. */
  const PAYMENT_IDLE_MS=8*60*1000;
  let paymentTimer=null;
  function disarmPaymentTimeout(){
    if(paymentTimer){clearTimeout(paymentTimer);paymentTimer=null;}
  }
  function armPaymentTimeout(){
    disarmPaymentTimeout();
    paymentTimer=setTimeout(()=>{
      if(!page.classList.contains('open'))return;
      const onStep3=f3.closest('.wiz-panel').classList.contains('on');
      if(!onStep3)return;
      if(window.VB_toast)window.VB_toast('pay_timeout_h',t('pay_timeout_p'));
      closeAuth();
    },PAYMENT_IDLE_MS);
  }

  /* ---- Affichage d'une etape ---- */
  function showStep(n){
    panels.forEach(p=>p.classList.toggle('on',p.dataset.step===String(n)));
    if(n==='lock'||n==='pwreset'){bar.style.visibility='hidden';return;}
    // 'verify' est une page de l'etape 1 : la barre reste sur le noeud 1
    const noeud=(n==='verify')?1:n;
    bar.style.visibility='';
    // 3 etapes : Kont (1) / Peman (3) / Aksè (4)
    const order=[1,3,4];
    const pos=Math.max(0,order.indexOf(noeud));
    bar.setAttribute('aria-valuenow',pos+1);
    barFill.style.width=(pos/(nodes.length-1)*100)+'%';
    nodes.forEach(nd=>{
      const k=+nd.dataset.node;
      nd.classList.toggle('done',order.indexOf(k)<pos);
      nd.classList.toggle('on',k===noeud);
    });
    if(n===1&&submitBtn)submitBtn.textContent=t('wiz_btn_next1');
    if(n===3){renderStep3();armPaymentTimeout();demarrerSyncPlansWizard();}
    else{disarmPaymentTimeout();arreterSyncPlansWizard();}
    if(n===4)renderStep4();
    const first=panels.find(p=>p.dataset.step===String(n)).querySelector('input,button');
    if(first&&window.innerWidth>860)first.focus({preventScroll:true});
  }

  function showMode(mode){
    const wiz=mode!=='login';
    modeLogin.classList.toggle('on',!wiz);
    modeWizard.classList.toggle('on',wiz);
    tabs.login.classList.toggle('on',!wiz);
    tabs.signup.classList.toggle('on',wiz);
    if(!wiz)renderResume();
  }

  /* ---- Bandeau de reprise sur l'ecran de connexion ----
     Affiche uniquement si une inscription a REELLEMENT ete commencee
     (state.started) et n'est pas terminee. Remis a zero des la
     finalisation, donc invisible pour un nouveau visiteur. */
  function renderResume(){
    const need=requiredStep(state);
    if(state.started&&state.email&&need<4){
      resume.hidden=false;
      const labels={1:t('wiz_s1'),3:t('wiz_s3')};
      resumeTxt.textContent=t('wiz_resume_at').replace('{step}',labels[need]||'');
      /* CORRECTIF : 'started' est un marqueur local qui, jusqu'ici, ne
         retombait jamais si la personne abandonnait avant l'etape 3 — le
         bandeau restait donc affiche indefiniment, y compris pour
         quelqu'un dont l'inscription est en realite deja terminee (compte
         cree depuis un autre appareil, ou paiement finalise ailleurs).
         On verifie donc l'etat REEL en base : si un abonnement existe
         deja pour cette adresse, l'inscription est terminee et le
         bandeau n'a plus lieu d'etre. */
      verifierInscriptionTerminee();
    }else{
      resume.hidden=true;
    }
  }
  /* Verification serveur, asynchrone et non bloquante : masque le bandeau
     de reprise si l'inscription s'avere deja terminee cote base. */
  let resumeVerifEnCours=false;
  async function verifierInscriptionTerminee(){
    if(resumeVerifEnCours)return;
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const email=(state.email||'').trim().toLowerCase();
    if(!sb||!email)return;
    resumeVerifEnCours=true;
    try{
      const {data:profs}=await sb.from('profiles').select('id').eq('email',email).limit(1);
      if(profs&&profs.length){
        const {data:subs}=await sb.from('subscriptions')
          .select('id').eq('user_id',profs[0].id)
          .in('status',['active','pending']).limit(1);
        if(subs&&subs.length){
          // Inscription reellement terminee : on retire le marqueur local
          // perime pour de bon, le bandeau ne reviendra plus.
          state.started=false;
          save();
          resume.hidden=true;
        }
      }
    }catch(e){ /* injoignable : on laisse le bandeau tel quel, jamais bloquant */ }
    finally{ resumeVerifEnCours=false; }
  }

  /* ================= ETAPE 1 : creation du compte ================= */
  const f1=document.getElementById('wizStep1');
  let pendingPlainPassword=null;   // en memoire uniquement, jamais persiste
  const fVerify=document.getElementById('wizVerify');  // declare tot : utilise par le submit de l'etape 1
  function setErr(field,key){
    field.classList.toggle('invalid',!!key);
    if(key){const e=field.querySelector('.field-err');if(e)e.textContent=t(key);}
  }
  /* Domaines d'e-mails temporaires les plus courants : refuses. */
  const DISPOSABLE=['mailinator.com','yopmail.com','yopmail.fr','guerrillamail.com','guerrillamail.info',
    'sharklasers.com','10minutemail.com','10minutemail.net','tempmail.com','temp-mail.org','tempmailo.com',
    'trashmail.com','trashmail.de','throwawaymail.com','getnada.com','nada.email','maildrop.cc','dispostable.com',
    'fakeinbox.com','mytemp.email','moakt.com','emailondeck.com','mailnesia.com','spamgourmet.com','mintemail.com',
    'burnermail.io','anonaddy.me','mohmal.com','tmpmail.org','tmpmail.net','discard.email','inboxbear.com',
    'jetable.org','spam4.me','grr.la','tempr.email','minuteinbox.com','emltmp.com','luxusmail.org'];
  function isEmail(v){
    const val=String(v||'').trim().toLowerCase();
    // format classique : pas de point en debut/fin, extension de 2 lettres minimum
    if(!/^[a-z0-9]([a-z0-9._%+-]*[a-z0-9])?@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(val))return false;
    if(val.indexOf('..')>-1)return false;
    return true;
  }
  function isDisposable(v){
    const dom=String(v||'').trim().toLowerCase().split('@')[1]||'';
    return DISPOSABLE.some(d=>dom===d||dom.endsWith('.'+d));
  }
  /* Telephone facultatif.
     - local haitien : exactement 8 chiffres commencant par 3, 4 ou 5
     - international : indicatif + 7 a 15 chiffres (E.164), ex. +1 pour les USA */
  function isPhone(v){
    const raw=String(v||'').trim();
    if(!raw)return true;                       // champ facultatif
    const digits=raw.replace(/[^0-9]/g,'');
    // Format international : uniquement avec un indicatif explicite (+ ou 00)
    if(/^\+/.test(raw)||/^00/.test(digits)){
      const d=digits.replace(/^00/,'');
      return d.length>=8&&d.length<=15;
    }
    return /^[345][0-9]{7}$/.test(digits);     // numero local : 8 chiffres, 3/4/5
  }

  f1.addEventListener('submit',ev=>{
    ev.preventDefault();
    const g=n=>f1.querySelector('[name='+n+']');
    const fn=g('fullname'),em=g('email'),pw=g('password'),pwc=g('passwordConfirm'),tc=g('terms');
    const termsErr=f1.querySelector('.field-err-terms');
    let ok=true;
    if(!fn.value.trim()){setErr(fn.closest('.field'),'auth_err_required');ok=false}else setErr(fn.closest('.field'),null);
    if(!isEmail(em.value.trim())){setErr(em.closest('.field'),'auth_err_email');ok=false}
    else if(isDisposable(em.value.trim())){setErr(em.closest('.field'),'auth_err_email_temp');ok=false}
    else setErr(em.closest('.field'),null);
    if(pw.value.length<8){setErr(pw.closest('.field'),'auth_err_password_len');ok=false}
    else if(!/\d/.test(pw.value)){setErr(pw.closest('.field'),'auth_err_password_digit');ok=false}
    else setErr(pw.closest('.field'),null);
    if(!pwc.value||pwc.value!==pw.value){setErr(pwc.closest('.field'),'auth_err_password_match');ok=false}else setErr(pwc.closest('.field'),null);
    if(!tc.checked){termsErr.classList.add('show');ok=false}else termsErr.classList.remove('show');

    // E-mail deja rattache a un compte verifie et paye : on renvoie vers la connexion
    const existing=accounts.find(em.value.trim().toLowerCase());
    if(ok&&isComplete(existing)){
      setErr(em.closest('.field'),'auth_err_email_taken');
      showTakenNotice();
      return;
    }
    if(!ok)return;

    state.fullname=fn.value.trim();
    state.site=sitePickValue();          // site prefere, facultatif
    state.email=em.value.trim().toLowerCase();   // normalisee : jamais de casse imprevisible
    state.pass=fingerprint(pw.value);
    // Le mot de passe REEL ne reste qu'en memoire (jamais dans localStorage/state),
    // le temps strictement necessaire pour creer le compte Supabase apres
    // verification du code. Efface des utilisation ou en cas d'abandon.
    pendingPlainPassword=pw.value;
    state.started=true;                       // inscription reellement commencee
    state.startedAt=state.startedAt||Date.now();

    // 1er envoi : on affiche le bloc de verification sous le formulaire
    if(!state.emailVerified){
      // Le code n'est plus genere ici : il est genere, stocke et envoye
      // entierement cote serveur (voir VB_requestSignupCode).
      state.codeFor=state.email;
      save();
      closeInlineOtp();
      openInlineOtp();
      window.VB_requestSignupCode(state.email,submitBtn).then(res=>{
        if(res.ok&&window.VB_toast)window.VB_toast('toast_mail_h',t('toast_mail_p').replace('{email}',state.email));
        else if(!res.ok){
          if(window.VB_logErreurTechnique)window.VB_logErreurTechnique('envoi_code_signup',res.erreur);
          if(window.VB_toast)window.VB_toast('toast_mail_err_h',t('toast_mail_err_p'));
        }
      });
      return;
    }
    state.step=3;
    save();
    showStep(3);
  });

  /* Page de verification : controle du code */
  /* Creation du compte reel dans Supabase, juste apres verification du
     code. C'est le moment ou l'on a prouve que l'utilisateur possede
     reellement cette adresse — le point de confiance naturel pour
     enregistrer un compte durable, visible depuis n'importe quel appareil. */
  async function creerCompteSupabase(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const motdepasse=pendingPlainPassword;
    pendingPlainPassword=null;              // efface de la memoire aussitot utilise
    if(!sb||!motdepasse)return {ok:true,hors_ligne:true};  // degrade sans jamais bloquer
    try{
      const {data,error}=await sb.auth.signUp({
        email:state.email,
        password:motdepasse,
        options:{data:{username:state.fullname,preferred_site:state.site||'paryajpam'}}
      });
      if(error){
        // Email deja enregistre cote Supabase : verification REELLE,
        // plus fiable que l'ancien registre local.
        if(/already|existe|registered/i.test(error.message||''))
          return {ok:false,raison:'existe_deja'};
        return {ok:true,hors_ligne:true,erreur:error.message};  // ne bloque pas l'inscription locale
      }
      state.supabaseUserId=data&&data.user?data.user.id:null;
      // Ecriture explicite du nom dans profiles.username : la routine
      // automatique qui cree la fiche profil ne recopie pas forcement le
      // nom depuis les metadonnees du compte — on ne depend pas d'elle
      // pour ce champ precis, on l'ecrit nous-memes, sans jamais bloquer
      // l'inscription si cette seule ecriture echoue.
      if(state.supabaseUserId){
        try{
          await sb.from('profiles').update({username:state.fullname}).eq('id',state.supabaseUserId);
        }catch(e){}
      }
      return {ok:true};
    }catch(e){
      return {ok:true,hors_ligne:true,erreur:e.message};  // reseau indisponible : on degrade, jamais on ne bloque
    }
  }

  fVerify.addEventListener('submit',async ev=>{
    ev.preventDefault();
    // Animation en cascade au clic sur Vérifier (02/09, demande explicite
    // de James : jouer aussi au clic, pas seulement a chaque chiffre tape)
    // — meme decalage progressif que la demo d'origine qu'il a partagee.
    otpInputs.forEach((inp,i)=>{
      setTimeout(()=>{
        inp.classList.remove('otp-pop');
        void inp.offsetWidth;
        inp.classList.add('otp-pop');
      },i*45);
    });
    const entered=otpInputs.map(i=>i.value).join('');
    if(entered.length!==6){
      otp.classList.add('invalid');
      otpErr.textContent=t('wiz_v_err');
      otpErr.style.display='block';
      otpInputs[0].focus();
      return;
    }
    const submitBtnVerify=fVerify.querySelector('button[type=submit]');
    submitBtnVerify.disabled=true;
    // Le VRAI code n'est plus verifie que cote serveur — jamais de
    // comparaison locale a une valeur connue du navigateur.
    const codeRes=await window.VB_confirmSignupCode(state.email,entered);
    if(!codeRes.ok){
      submitBtnVerify.disabled=false;
      otp.classList.add('invalid');
      otpErr.textContent=t('wiz_v_err');
      otpErr.style.display='block';
      otpInputs[0].focus();
      return;
    }
    creerCompteSupabase().then(res=>{
      submitBtnVerify.disabled=false;
      if(!res.ok&&res.raison==='existe_deja'){
        // Compte reellement deja existant : meme traitement que l'ancienne
        // detection locale, mais fiable sur tous les appareils.
        showMode('login');
        if(window.VB_toast)window.VB_toast('auth_taken_h',t('auth_taken_sub'));
        return;
      }
      /* Le compte local avance toujours (jamais bloque), mais si la
         synchronisation avec le serveur a echoue, on le dit clairement —
         plutot que de laisser croire a tort que le compte existe partout.
         CORRECTIF : plus jamais de detail technique brut affiche a
         l'utilisateur ("subscriptions: ...", "auth.uid() est null", etc.) —
         message generique cote utilisateur, detail reel enregistre pour
         l'admin (voir VB_logErreurTechnique). */
      if(res.hors_ligne){
        if(window.VB_logErreurTechnique)window.VB_logErreurTechnique('creation_compte',res.erreur);
        if(window.VB_toast)window.VB_toast('err_action_unavailable_h',t('err_action_unavailable_p'));
      }
      state.emailVerified=true;
      state.step=3;
      save();
      showStep(3);
    });
  });
  document.getElementById('wizVerifyBack').addEventListener('click',()=>{
    pendingPlainPassword=null;   // on quitte la verification : plus besoin, on efface
    closeInlineOtp();
    showStep(1);
  });

  /* ---- Selecteur de site prefere : choix unique, facultatif ----
     ParyajPam est preselectionne ; l'utilisateur peut changer a tout moment. */
  const sitePick=document.getElementById('sitePick');
  function sitePickValue(){
    const on=sitePick?sitePick.querySelector('.sitepick-opt.on'):null;
    return on?on.dataset.site:'paryajpam';
  }
  function sitePickSet(val){
    if(!sitePick)return;
    let trouve=false;
    sitePick.querySelectorAll('.sitepick-opt').forEach(b=>{
      const actif=b.dataset.site===val;
      if(actif)trouve=true;
      b.classList.toggle('on',actif);
      b.setAttribute('aria-checked',actif?'true':'false');
    });
    if(!trouve)sitePickSet('paryajpam');
  }
  if(sitePick){
    sitePick.querySelectorAll('.sitepick-opt').forEach(b=>{
      b.addEventListener('click',()=>{
        sitePickSet(b.dataset.site);
        state.site=b.dataset.site;save();
      });
    });
  }

  const takenBox=document.getElementById('wizTaken');
  function showTakenNotice(){
    takenBox.hidden=false;
    takenBox.scrollIntoView({block:'nearest'});
  }
  document.getElementById('wizTakenCta').addEventListener('click',()=>{
    takenBox.hidden=true;
    showMode('login');
  });
  f1.querySelector('[name=email]').addEventListener('input',()=>{takenBox.hidden=true;});

  /* ---- Indicateur de robustesse du mot de passe (temps reel) ---- */
  (function(){
    const input=f1.querySelector('[name=password]');
    const meter=document.getElementById('pwMeter');
    const bars=[...meter.querySelectorAll('.pwmeter-bar')];
    const lbl=document.getElementById('pwMeterLbl');
    function score(v){
      // Regles minimales : 8 caracteres ET au moins un chiffre.
      // Tant qu'elles ne sont pas remplies, le mot de passe est Faible.
      if(v.length<8||!/\d/.test(v))return 1;
      // A partir d'ici le mot de passe est accepte : au moins Moyen.
      let pts=0;
      if(v.length>=12)pts++;
      if(/[a-z]/.test(v)&&/[A-Z]/.test(v))pts++;
      if(/[^A-Za-z0-9]/.test(v))pts++;
      return pts>=2?3:2;
    }
    function paint(){
      const v=input.value;
      if(!v){meter.hidden=true;return;}
      meter.hidden=false;
      const sc=score(v);
      const tone=['','weak','mid','strong'][sc];
      bars.forEach((b,i)=>{
        b.className='pwmeter-bar'+(i<sc?' on-'+tone:'');
      });
      lbl.className='pwmeter-lbl '+tone;
      lbl.textContent=t(['','auth_pw_weak','auth_pw_mid','auth_pw_strong'][sc]);
    }
    input.addEventListener('input',paint);
    document.addEventListener('vb:langchange',()=>{if(!meter.hidden)paint();});
    window.VB_pwPaint=paint;
  })();

  /* ---- Verification e-mail, integree a l'etape Kont ---- */
  const otp=document.getElementById('wizOtp');
  const otpInputs=[...otp.querySelectorAll('input')];
  const otpErr=document.getElementById('wizOtpErr');
  const submitBtn=f1.querySelector('button[type=submit]');

  function openInlineOtp(){
    document.getElementById('wizInlineMail').textContent=state.email||'';
    otpInputs.forEach(i=>i.value='');
    otp.classList.remove('invalid');
    otpErr.style.display='none';
    showStep('verify');
    otpInputs[0].focus({preventScroll:true});
  }
  function closeInlineOtp(){
    otp.classList.remove('invalid');
    otpErr.style.display='none';
    otpInputs.forEach(i=>i.value='');
  }
  window.VB_closeInlineOtp=closeInlineOtp;

  otpInputs.forEach((inp,i)=>{
    inp.addEventListener('input',()=>{
      inp.value=inp.value.replace(/\D/g,'').slice(0,1);
      otp.classList.remove('invalid');otpErr.style.display='none';
      // Animation "pop" (02/09) : jouee uniquement quand un chiffre est
      // reellement rentre (jamais sur un backspace qui vide la case) —
      // classe retiree juste apres pour pouvoir se rejouer sur la meme
      // case si l'utilisateur corrige un chiffre.
      if(inp.value){
        inp.classList.remove('otp-pop');
        void inp.offsetWidth; // force le reflow pour rejouer l'animation
        inp.classList.add('otp-pop');
      }
      if(inp.value&&i<otpInputs.length-1)otpInputs[i+1].focus();
    });
    inp.addEventListener('keydown',ev=>{
      if(ev.key==='Backspace'&&!inp.value&&i>0)otpInputs[i-1].focus();
    });
    inp.addEventListener('paste',ev=>{
      const d=(ev.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
      if(!d)return;
      ev.preventDefault();
      d.split('').slice(0,6).forEach((c,k)=>{if(otpInputs[k])otpInputs[k].value=c});
      otpInputs[Math.min(d.length,5)].focus();
    });
  });
  document.getElementById('wizResend').addEventListener('click',ev=>{
    state.codeFor=state.email;
    save();
    openInlineOtp();
    window.VB_requestSignupCode(state.email,ev.currentTarget).then(res=>{
      if(res.ok&&window.VB_toast)window.VB_toast('toast_mail_h',t('toast_mail_p').replace('{email}',state.email));
      else if(!res.ok){
        if(window.VB_logErreurTechnique)window.VB_logErreurTechnique('renvoi_code_signup',res.erreur);
        if(window.VB_toast)window.VB_toast('toast_mail_err_h',t('toast_mail_err_p'));
      }
    });
  });
  // toute modification de l'e-mail invalide le code deja envoye
  f1.querySelector('[name=email]').addEventListener('input',()=>{
    if(state.codeFor&&state.codeFor!==f1.querySelector('[name=email]').value.trim())closeInlineOtp();
  });

  /* ================= ETAPE 3 : plan + paiement ================= */
  const f3=document.getElementById('wizStep3');
  ['click','input','keydown'].forEach(evt=>{
    f3.addEventListener(evt,()=>{if(paymentTimer)armPaymentTimeout();});
  });
  const planPick=document.getElementById('wizPlanPick');
  const payWrap=document.getElementById('wizPayMethods');
  const payErr=document.getElementById('wizPayErr');
  const paySubmit=document.getElementById('wizPaySubmit');
  const METHODS=[{id:'moncash',labelKey:'wiz_p_moncash',sel:'.pay-moncash img'},{id:'natcash',labelKey:'wiz_p_natcash',sel:'.pay-natcash img'}];
  /* MonCash et NatCash sont en paiement automatique reel (prestataire
     PLOP PLOP, cote serveur) : cette liste pilote a la fois le rendu des
     boutons ci-dessus ET tout le nouveau flux automatique plus bas
     (completePayment, renderStep4). Stripe n'y figure jamais : son bouton
     est separe (wizStripeBtn) et reste sur le flux manuel existant. */
  const PAIEMENT_AUTO_METHODS=METHODS.map(m=>m.id);
  const PAIEMENT_CREATE_URL='/.netlify/functions/paiement-create';
  const PAIEMENT_VERIFY_URL='/.netlify/functions/paiement-verify';

  function renderRecap(){
    /* Le plan PREVISUALISE (avant paiement) ne doit jamais ecraser le plan
       ACTIF (state.planId), qui ne change qu'a un paiement reellement reussi. */
    const pl=planById(state.pendingPlanId)||planById(state.planId)||PLANS[1];
    state.pendingPlanId=pl.id;save();
    document.getElementById('wizRecapName').textContent=stripTags(window.VB_planLabel(pl));
    document.getElementById('wizRecapPer').textContent=stripTags(pl.days!=null?t('plan_per_days').replace('{n}',pl.days):t(pl.perKey));
    document.getElementById('wizRecapPrix').innerHTML=money(pl.prix)+' <small>HTG</small>';
    document.getElementById('wizRecapTotal').textContent=money(pl.prix)+' HTG';
    const ul=document.getElementById('wizRecapFeats');
    ul.innerHTML='';
    pl.feats.forEach(k=>{
      const li=document.createElement('li');
      li.innerHTML='<svg class="ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg><span>'+t(k)+'</span>';
      ul.appendChild(li);
    });
    paySubmit.textContent=t('wiz_p_pay').replace('{amount}',money(pl.prix));
  }

  function renderPlanPick(){
    planPick.innerHTML='';
    PLANS.forEach(pl=>{
      const b=document.createElement('button');
      b.type='button';
      b.className='wiz-planopt'+(pl.id===state.pendingPlanId?' on':'');
      b.innerHTML='<span class="wiz-planopt-rad"></span>'+
        '<span class="wiz-planopt-txt"><b>'+stripTags(window.VB_planLabel(pl))+'</b><span>'+stripTags(pl.days!=null?t('plan_per_days').replace('{n}',pl.days):t(pl.perKey))+'</span></span>'+
        (pl.popular?'<span class="wiz-planopt-tag">'+stripTags(t('ab_populaire')).toUpperCase()+'</span>':'')+
        '<span class="wiz-planopt-prix">'+money(pl.prix)+'</span>';
      b.addEventListener('click',()=>{
        state.pendingPlanId=pl.id;save();
        payErr.style.display='none';       // le refus ne concerne plus ce plan
        renderRecap();
        planPick.classList.remove('on');
        document.getElementById('wizRecap').style.display='';
      });
      planPick.appendChild(b);
    });
  }

  /* CHEVRON reutilise tel quel par les deux cartes — defini une fois. */
  const PAYM_CHEVRON='<svg class="wiz-paym-chev" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>';

  function renderPayMethods(){
    /* Mise a jour des libelles au changement de langue : la carte contient
       maintenant plusieurs <span>, donc on vise chaque element par sa
       classe (avant : querySelector('span'), qui attrapait le premier et
       aurait ecrase la pastille du logo). */
    if(payWrap.children.length){
      [...payWrap.children].forEach(c=>{
        const m=METHODS.find(x=>x.id===c.dataset.method);
        if(!m)return;
        const nom=c.querySelector('.wiz-paym-name');
        const badge=c.querySelector('.wiz-paym-badge');
        const sub=c.querySelector('.wiz-paym-sub');
        const img=c.querySelector('.wiz-paym-ic img');
        if(nom)nom.textContent=t(m.labelKey);
        if(badge)badge.textContent=t('wiz_p_auto_badge');
        if(sub)sub.textContent=t('wiz_p_auto_sub');
        if(img)img.alt=t(m.labelKey);
      });
      return;
    }
    METHODS.forEach(m=>{
      const src=document.querySelector(m.sel);
      const b=document.createElement('button');
      b.type='button';
      b.className='wiz-paym';
      b.dataset.method=m.id;
      b.innerHTML=
        '<span class="wiz-paym-ic">'+(src?'<img src="'+src.src+'" alt="'+t(m.labelKey)+'">':'')+'</span>'+
        '<span class="wiz-paym-txt">'+
          '<span class="wiz-paym-line">'+
            '<span class="wiz-paym-name"></span>'+
            '<span class="wiz-paym-badge"></span>'+
          '</span>'+
          '<span class="wiz-paym-sub"></span>'+
        '</span>'+PAYM_CHEVRON;
      /* textContent plutot que de l'interpolation dans innerHTML : les
         libelles viennent des traductions, jamais injectes en HTML brut. */
      b.querySelector('.wiz-paym-name').textContent=t(m.labelKey);
      b.querySelector('.wiz-paym-badge').textContent=t('wiz_p_auto_badge');
      b.querySelector('.wiz-paym-sub').textContent=t('wiz_p_auto_sub');
      b.addEventListener('click',()=>{
        state.payMethod=m.id;save();
        [...payWrap.children].forEach(c=>c.classList.toggle('on',c.dataset.method===m.id));
        payErr.style.display='none';
      });
      payWrap.appendChild(b);
    });
  }

  function renderStep3(){
    // Le message de refus ne survit jamais a une visite : il est efface
    // a chaque ouverture de la page de paiement.
    payErr.style.display='none';
    const h=f3.querySelector('h3'), sub=f3.querySelector('.authpage-form-sub');
    h.textContent=t(renewMode?'wiz_r_h':'wiz_p_h');
    sub.textContent=t(renewMode?'wiz_r_sub':'wiz_p_sub');
    const banner=document.getElementById('wizRenewBanner');
    banner.hidden=!renewMode;
    if(renewMode){
      const exp=subscriptionExpired(state);
      document.getElementById('wizRenewTxt').textContent=t(exp?'wiz_r_expired':'wiz_r_active');
    }
    renderRecap();
    renderPlanPick();
    renderPayMethods();
    renderStripeLogos();
    planPick.classList.remove('on');
    document.getElementById('wizRecap').style.display='';
    [...payWrap.children].forEach(c=>c.classList.toggle('on',c.dataset.method===state.payMethod));
  }

  /* Logos affiches sous le bouton Stripe : Stripe, Carte bancaire, PayPal */
  function renderStripeLogos(){
    const box=document.getElementById('wizStripeLogos');
    if(box.dataset.done)return;
    const add=sel=>{
      const src=document.querySelector(sel);
      if(!src)return;
      const sp=document.createElement('span');
      sp.className='pay';
      sp.innerHTML='<img src="'+src.src+'" alt="'+src.alt+'">';
      box.appendChild(sp);
    };
    add('.pay-visa img');
    add('.pay-mastercard img');
    add('.foot-pay-list .pay-paypal img');
    box.dataset.done='1';
  }

  document.getElementById('wizChangePlan').addEventListener('click',()=>{
    const opening=!planPick.classList.contains('on');
    if(opening)renderPlanPick();   // toujours resynchronise sur le dernier choix
    planPick.classList.toggle('on',opening);
    document.getElementById('wizRecap').style.display=opening?'none':'';
    if(opening)planPick.scrollIntoView({block:'nearest'});
  });

  /* MonCash et NatCash sont en paiement automatique : aucun numero n'est
     demande avant le clic sur "Payer". Le prestataire collecte le numero
     sur sa propre page, ce qui evite de le saisir deux fois. */
  /* Enregistrement reel de l'abonnement et du paiement dans Supabase.
     Jamais bloquant : le parcours local (deja engage de facon synchrone
     juste avant) ne depend jamais du reseau. Le paiement est toujours
     ecrit avec le statut "pending" — seul un admin pourra le confirmer,
     jamais le site lui-meme (regle de securite ecrite dans la base). */
  /* Meme principe que creerCompteSupabase() : ne JAMAIS bloquer le
     parcours local, mais ne JAMAIS cacher un echec non plus. Renvoie
     {ok:true} en cas de succes reel, ou {ok:true, hors_ligne:true,
     erreur:'...'} si l'ecriture cote serveur a echoue — pour affichage
     honnete a l'ecran, au lieu d'un "succes" silencieux mensonger. */
  async function syncAbonnementSupabase(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return {ok:true,hors_ligne:true,erreur:'Supabase indisponible (script non charge)'};
    try{
      let uid=state.supabaseUserId;
      if(!uid){
        const {data:sessionData}=await sb.auth.getSession();
        uid=(sessionData&&sessionData.session&&sessionData.session.user)?sessionData.session.user.id:null;
      }
      if(!uid)return {ok:true,hors_ligne:true,erreur:'Aucune session Supabase active (auth.uid() est null)'};
      /* Dernier rempart AVANT insertion (31/08, bug signalé par James) :
         on relit l'état RÉEL en base au lieu de se fier au seul état
         client, qui peut être périmé (onglet resté ouvert, retour arrière,
         double-clic, session rechargée depuis un cache local). Si une
         demande est déjà en attente, on refuse ici — jamais de deuxième
         ligne 'pending' pour la même personne. L'index unique partiel
         idx_un_seul_paiement_pending_par_user posé en base reste la
         garantie de fond si malgré tout la course était perdue. */
      try{
        const {data:dejaPending}=await sb.from('payments')
          .select('reference').eq('user_id',uid).eq('status','pending').limit(1);
        if(dejaPending&&dejaPending.length){
          return {ok:false,dejaEnAttente:true,reference:dejaPending[0].reference||null,
                  erreur:'Un paiement est deja en attente pour ce compte.'};
        }
      }catch(e){}
      /* IMPORTANT : on ne ferme PLUS l'ancien abonnement actif ici.
         Tant que le nouveau paiement n'est pas confirme par l'admin, la
         personne garde son abonnement actif en cours — elle continue de
         payer pour quelque chose de valide, elle ne doit jamais perdre
         l'acces pendant l'attente. La fermeture de l'ancien abonnement se
         fait desormais UNIQUEMENT au moment de la confirmation reelle
         (voir traiterPaiement, module admin), jamais avant.
         Si un changement est demande pendant qu'un plan valide est deja
         actif, c'est le plan/reference EN ATTENTE (pendingPlanId/pendingRef)
         qu'il faut ecrire — jamais celui reellement actif, qui ne bouge
         pas encore. */
      const planAEcrire=state.pendingPlanId||state.planId;
      const refAEcrire=state.pendingRef||state.ref;
      const pl=planById(planAEcrire);
      // status:'pending' — jamais 'active' ici : seul un admin (module Paiements)
      // pourra faire passer un abonnement a 'active', jamais ce parcours client.
      // Les dates ecrites ici sont provisoires : traiterPaiement les
      // recalcule et les ECRASE au moment de la vraie confirmation.
      const {data:subData,error:subErr}=await sb.from('subscriptions').insert({
        user_id:uid, plan_id:planAEcrire, status:'pending',
        starts_at:state.startDate, expires_at:state.endDate
      }).select('id').single();
      if(subErr)return {ok:true,hors_ligne:true,erreur:'subscriptions: '+(subErr.message||JSON.stringify(subErr))};
      const {error:payErr}=await sb.from('payments').insert({
        user_id:uid, subscription_id:subData?subData.id:null, plan_id:planAEcrire,
        amount_htg:pl?pl.prix:0, method:state.payMethod,
        status:'pending', reference:refAEcrire
      });
      if(payErr){
        // L'index unique partiel en base a refusé un second paiement
        // 'pending' pour ce compte (course concurrente : deux onglets, ou
        // état client périmé). On supprime la ligne subscriptions qu'on
        // venait de créer juste au-dessus, sinon elle resterait orpheline
        // en 'pending' sans paiement associé.
        const estDoublon=(payErr.code==='23505')||/duplicate key|idx_un_seul_paiement_pending_par_user/i.test(payErr.message||'');
        // AJOUTÉ (04/09, correctif de sécurité email_verified) : la policy
        // RLS bloque désormais l'insertion tant que profiles.email_verified
        // n'est pas true. Sans cette détection, l'erreur brute Postgres
        // (code 42501, "row-level security policy") tombait dans le repli
        // générique ci-dessous — traité à tort comme "hors ligne, sera
        // réessayé plus tard", alors que rien ne se résout tout seul ici :
        // l'utilisateur doit d'abord terminer la vérification par code.
        const estNonVerifie=(payErr.code==='42501')||/row-level security|policy/i.test(payErr.message||'');
        if(subData&&subData.id){
          try{ await sb.from('subscriptions').delete().eq('id',subData.id); }catch(e){}
        }
        if(estDoublon)return {ok:false,dejaEnAttente:true,erreur:'Un paiement est deja en attente pour ce compte.'};
        if(estNonVerifie)return {ok:false,emailNonVerifie:true,erreur:'Votre email doit d\'abord etre verifie (code recu par email) avant de pouvoir vous abonner.'};
        return {ok:true,hors_ligne:true,erreur:'payments: '+(payErr.message||JSON.stringify(payErr))};
      }
      // Notification "paiement en attente" : l'evenement existe des
      // maintenant cote base, et sera suivi plus tard d'une notification
      // DISTINCTE de validation ou de refus emise par l'admin — jamais
      // d'un simple remplacement de celle-ci.
      try{
        await sb.from('notifications').insert({
          user_id:uid, type:'payment_pending', plan_id:planAEcrire, reason:null
        });
      }catch(e){}
      return {ok:true,hors_ligne:false};
    }catch(e){
      return {ok:true,hors_ligne:true,erreur:(e&&e.message)?e.message:String(e)};
    }
  }

  /* 1 raison reelle = 1 message ; jamais de texte generique. Partage
     par le parcours MonCash/NatCash et par le parcours Stripe, pour que
     les deux affichent exactement le meme refus au meme endroit. */
  function afficherRefusPaiement(raison){
    const TITRE={
      renew_err_encours:'renew_toast_h', renew_err_lifetime:'lifetime_toast_h',
      renew_err_inferieur:'change_toast_h', renew_err_pending:'pending_toast_h',
      renew_err_email_non_verifie:'err_action_unavailable_h',
      wiz_p_stripe_nosession:'err_action_unavailable_h',
      wiz_p_stripe_indispo:'err_action_unavailable_h'
    };
    payErr.textContent=t(raison);
    payErr.style.display='block';
    payErr.scrollIntoView({block:'nearest'});
    if(window.VB_toast)window.VB_toast(TITRE[raison]||'renew_toast_h',t(raison));
  }

  /* ================= PAIEMENT AUTOMATIQUE MonCash/NatCash =================
     Le prestataire (PLOP PLOP) n'offre aucun webhook : la seule verite est
     l'appel serveur paiement-verify, relance ici periodiquement tant que
     cette page reste ouverte. Le filet reel, qui fonctionne meme si la
     personne ferme son navigateur, est la fonction planifiee cote serveur
     paiement-poll-background (toutes les 3 min) — ce sondage cote client
     n'est qu'un confort pour un retour plus rapide a l'ecran. */
  let pollAutoTimer=null, pollAutoTries=0;
  let fenetrePaiementActive=null, checkFenetreFermeeTimer=null;
  const POLL_AUTO_INTERVAL_MS=6000;      // depart : reactif (un vrai paiement mobile confirme en general en quelques secondes)
  const POLL_AUTO_INTERVAL_MAX_MS=25000; // plateau : n'ecrase jamais l'API du prestataire pendant tout le delai d'expiration
  const POLL_AUTO_BACKOFF=1.3;
  // Filet de securite ABSOLU si jamais autoExpiresAt est absent (ancienne
  // session locale sauvegardee avant l'ajout de ce champ) : sans lui, une
  // session orpheline sonderait indefiniment. Largement au-dessus de tout
  // PLOPPLOP_PENDING_TTL_MIN raisonnable cote serveur.
  const POLL_AUTO_MAX_TRIES=200;

  function prochainDelaiPollAuto(){
    return Math.min(POLL_AUTO_INTERVAL_MS*Math.pow(POLL_AUTO_BACKOFF,pollAutoTries),POLL_AUTO_INTERVAL_MAX_MS);
  }

  /* Le paiement peut-il ENCORE, en toute logique, changer de statut ?
     L'API du prestataire ne renvoie que trans_status="no" (en attente) ou
     "ok" (confirme) — aucun etat "annule"/"echoue" distinct n'existe cote
     prestataire. La SEULE facon de considerer un paiement abandonne (reseau
     coupe en cours de route, page de paiement jamais remplie) comme un
     echec est donc l'expiration reelle (expires_at, fixee par le serveur a
     la creation). On continue de sonder un peu APRES cette echeance —
     jamais pile dessus — pour laisser le prochain appel a paiement-verify
     constater lui-meme le depassement et renvoyer 'expire' proprement. */
  function paiementEncorePossible(){
    if(!state.autoExpiresAt)return true; // ancienne session sans cette info : le compteur d'essais reste le seul garde-fou
    return Date.now()<new Date(state.autoExpiresAt).getTime()+20000;
  }

  function arreterPollAuto(){
    if(pollAutoTimer){clearTimeout(pollAutoTimer);pollAutoTimer=null;}
    pollAutoTries=0;
  }

  async function getAccessTokenWizard(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return null;
    try{
      const {data}=await sb.auth.getSession();
      return (data&&data.session&&data.session.access_token)||null;
    }catch(e){return null;}
  }

  function fermerFenetreAuto(w){
    try{if(w&&!w.closed)w.close();}catch(e){}
  }

  /* AJOUTE : filet complementaire a 'focus'/'visibilitychange'. Ces deux
     evenements couvrent le retour normal sur cet onglet, mais certains
     navigateurs integres (WebView Android, navigateurs in-app) ne les
     declenchent pas toujours de facon fiable a la fermeture d'un onglet
     enfant. On verifie donc aussi, en parallele, si la fenetre de paiement
     MonCash/NatCash a ete fermee, ce qui est un acces cross-origin toujours
     autorise (w.closed) meme si le CONTENU de cette fenetre reste
     inaccessible. Des que la fermeture est detectee, on declenche la meme
     verification immediate que verifierAuRetourSurOnglet — jamais une
     verification en double : cette derniere a deja son propre anti-rebond. */
  function arreterSurveillanceFenetre(){
    if(checkFenetreFermeeTimer){clearInterval(checkFenetreFermeeTimer);checkFenetreFermeeTimer=null;}
    fenetrePaiementActive=null;
  }
  function surveillerFermetureFenetre(w){
    arreterSurveillanceFenetre();
    if(!w)return;
    fenetrePaiementActive=w;
    checkFenetreFermeeTimer=setInterval(()=>{
      if(!state.autoPaymentId){arreterSurveillanceFenetre();return;}
      let ferme=false;
      try{ferme=!fenetrePaiementActive||fenetrePaiementActive.closed;}catch(e){ferme=false;}
      if(ferme){
        arreterSurveillanceFenetre();
        if(typeof verifierAuRetourSurOnglet==='function')verifierAuRetourSurOnglet();
      }
    },1500);
  }

  function renderStatutPaiementAuto(etat){
    const txt=document.getElementById('wizAutoTxt');
    if(!txt)return;
    const CLES={attente:'wiz_auto_attente_p',verification_manuelle:'wiz_auto_verif_p',erreur:'wiz_auto_erreur_p'};
    txt.textContent=t(CLES[etat]||'wiz_auto_attente_p');
  }

  async function verifierPaiementAutoUneFois(){
    if(!state.autoPaymentId)return null;
    const token=await getAccessTokenWizard();
    if(!token)return {ok:false,etat:'erreur'};
    try{
      const rep=await fetch(PAIEMENT_VERIFY_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        body:JSON.stringify({payment_id:state.autoPaymentId})
      });
      return await rep.json().catch(()=>null);
    }catch(e){return {ok:false,etat:'erreur'};}
  }

  /* Applique le resultat d'UNE verification. N'est jamais appele en
     parallele avec elle-meme (toujours via planifierPollAuto ou le bouton
     de relance manuelle, jamais les deux a la fois — voir leurs gardes). */
  async function appliquerResultatVerifAuto(res){
    if(!res)return;
    if(res.etat==='confirme'){
      state.autoPaymentId=null;state.autoProviderUrl=null;state.autoExpiresAt=null;save();
      // Reconstruit l'etat local depuis la VRAIE ligne subscriptions —
      // fonction deja existante et eprouvee (utilisee au retour de
      // connexion apres une action admin), qui gere aussi la fusion
      // pendingPlanId/plan actif exactement comme ici. Aucune date ni
      // aucun champ n'est donc jamais reconstruit "a la main" ici.
      let sessionUser=null;
      try{
        const sb=window.VB_getSupabase&&window.VB_getSupabase();
        if(sb){const {data:sd}=await sb.auth.getSession();sessionUser=(sd&&sd.session&&sd.session.user)||null;}
      }catch(e){}
      if(sessionUser&&window.VB_reprendreApresAdmin){
        await window.VB_reprendreApresAdmin(sessionUser);
      }else{
        renderStep4();
      }
      if(window.VB_toast)window.VB_toast('renew_success_h',t('wiz_auto_confirme_p'));
      return;
    }
    if(res.etat==='erreur'||res.etat==='attente'){
      renderStatutPaiementAuto(res.etat);
      return;
    }
    // expire / refuse / clos / manuel : tentative definitivement close,
    // sans succes. Deux cas, jamais confondus :
    const etaitChangement=!!state.pendingPlanId;
    state.autoPaymentId=null;state.autoProviderUrl=null;state.autoExpiresAt=null;
    if(etaitChangement){
      // Le plan ACTIF n'a jamais ete touche par cette tentative : la
      // personne garde un acces plein, seul le changement est annule.
      state.pendingPlanId=null;state.pendingRef=null;save();
      if(window.VB_toast)window.VB_toast('renew_toast_h',t('wiz_auto_echec_changement_p'));
      renderStep4();
    }else{
      // Premiere souscription (ou renouvellement d'un plan expire) qui
      // echoue : rien de reel n'a jamais ete active pour cette personne.
      state.paid=false;state.payStatus=null;state.planId=null;state.ref=null;
      state.startDate=null;state.endDate=null;save();
      if(window.VB_toast)window.VB_toast('renew_toast_h',t('wiz_auto_echec_p'));
      showStep(3);
    }
  }

  function demarrerPollAuto(){
    arreterPollAuto();
    planifierPollAuto();
  }

  function planifierPollAuto(){
    pollAutoTimer=setTimeout(async()=>{
      pollAutoTries++;
      const res=await verifierPaiementAutoUneFois();
      await appliquerResultatVerifAuto(res);
      const enCours=res&&(res.etat==='attente'||res.etat==='erreur');
      if(enCours&&paiementEncorePossible()&&pollAutoTries<POLL_AUTO_MAX_TRIES&&state.step===4&&state.autoPaymentId){
        planifierPollAuto();
      }else{
        arreterPollAuto();
      }
    },prochainDelaiPollAuto());
  }

  /* Creation reelle de la transaction chez le prestataire. Contrairement
     a syncAbonnementSupabase() (utilisee par Stripe/manuel), cette
     fonction n'ecrit RIEN directement dans Supabase depuis ce navigateur :
     subscriptions ET payments sont crees cote serveur (service_role), avec
     le VRAI montant et une reference prestataire jamais exposee ici — voir
     netlify/functions/paiement-create.js. */
  async function lancerPaiementAutomatique({method,pl,planCible,planEnCoursValide,ancienPlan,wasRenew,fenetreAuto}){
    const token=await getAccessTokenWizard();
    if(!token){
      fermerFenetreAuto(fenetreAuto);
      if(window.VB_toast)window.VB_toast('err_action_unavailable_h',t('err_action_unavailable_p'));
      return;
    }
    let data=null;
    try{
      const rep=await fetch(PAIEMENT_CREATE_URL,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        body:JSON.stringify({plan_id:planCible,method:method})
      });
      data=await rep.json().catch(()=>null);
    }catch(e){data=null;}

    if(!data||data.ok!==true||!data.url){
      fermerFenetreAuto(fenetreAuto);
      const code=data&&data.code;
      if(code==='PAIEMENT_DEJA_EN_ATTENTE'){
        state.payStatus='pending';
        if(data.reference)state.pendingRef=data.reference;
        save();
        afficherRefusPaiement('renew_err_pending');
        if(window.VB_refreshPlansUI)window.VB_refreshPlansUI();
        return;
      }
      if(code==='EMAIL_NON_VERIFIE'){afficherRefusPaiement('renew_err_email_non_verifie');return;}
      if(window.VB_toast)window.VB_toast('err_action_unavailable_h',t('err_action_unavailable_p'));
      return;
    }

    // Succes : la ligne pending existe deja cote serveur, avec le VRAI
    // montant protege par le trigger de base (jamais ecrit ni lisible
    // depuis ce navigateur). On redirige vers la page du prestataire dans
    // la fenetre deja ouverte au moment du clic (voir l'ecouteur 'submit'
    // plus bas) — sinon, un window.open() ici serait bloque sur mobile
    // puisqu'on est apres un 'await'.
    if(fenetreAuto){
      try{fenetreAuto.location.href=data.url;}catch(e){}
      surveillerFermetureFenetre(fenetreAuto);
    }
    else{try{window.open(data.url,'_blank','noopener');}catch(e){}}

    state.payMethod=method;
    state.autoPaymentId=data.payment_id;
    state.autoExpiresAt=data.expire_a||null;
    state.autoProviderUrl=data.url;
    if(planEnCoursValide){
      state.pendingPlanId=pl.id;
      state.pendingRef=data.reference;
    }else{
      state.ref=data.reference;
      state.planId=pl.id;
      state.pendingPlanId=null;
      state.pendingRef=null;
      state.paid=true;
      state.payStatus='pending';
      state.startDate=new Date().toISOString();
      state.endDate=pl.days?new Date(Date.now()+pl.days*86400000).toISOString():null;
    }
    state.step=4;
    state.started=false;
    save();
    accounts.put({
      email:state.email.trim().toLowerCase(),
      pass:state.pass,
      fullname:state.fullname,site:state.site,
      emailVerified:true,paid:true,
      payStatus:planEnCoursValide?state.payStatus:'pending',
      planId:state.planId,payMethod:state.payMethod,
      startDate:state.startDate,endDate:state.endDate,
      ref:state.ref
    });
    if(!wasRenew&&window.VB_countSignup)window.VB_countSignup();
    if(ancienPlan&&ancienPlan!==pl.id){
      if(window.VB_toast)window.VB_toast('plan_changed_h',t(pl.id==='p4'?'plan_changed_lifetime':'plan_changed_p')+' '+t('wiz_auto_pending_note'));
    }else if(ancienPlan){
      if(window.VB_toast)window.VB_toast('renew_success_h',t('renew_success_p')+' '+t('wiz_auto_pending_note'));
    }
    showStep(4);
  }

  async function completePayment(method,fenetreAuto){
    if(sessionPerimee){
      // CORRIGE (bug signale par James, capture d'ecran about:blank) :
      // pour MonCash/NatCash, l'onglet vide est deja ouvert (geste de clic,
      // avant tout await) au moment ou ce controle s'execute. Sans cette
      // fermeture, la personne se retrouvait avec un onglet bloque sur
      // about:blank qui donnait l'illusion d'une redirection alors que le
      // paiement etait en realite bloque.
      fermerFenetreAuto(fenetreAuto);
      if(window.VB_toast)window.VB_toast('session_stale_h',t('session_stale_p'));
      return;
    }
    const ancienPlan=state.paid?state.planId:null;      // plan reellement actif avant cette transaction
    const planCible=state.pendingPlanId||state.planId;  // plan que l'utilisateur a choisi d'acheter
    // Refus si le plan vise est deja en cours et hors periode de renouvellement/changement
    const permis=renouvellementPermis(state,planCible);
    if(!permis.ok){fermerFenetreAuto(fenetreAuto);afficherRefusPaiement(permis.raison);return;}
    /* Vérification en BASE avant toute mutation d'état (31/08, bug signalé
       par James) : le contrôle ci-dessus s'appuie sur l'état client, qui
       peut être périmé (onglet resté ouvert, retour arrière, second
       appareil). On relit donc la vérité en base AVANT d'écrire quoi que
       ce soit et AVANT d'afficher le moindre message de succès — sinon la
       personne verrait "renouvellement enregistré" alors que l'insertion
       sera refusée juste après. */
    try{
      const sbChk=window.VB_getSupabase&&window.VB_getSupabase();
      let uidChk=state.supabaseUserId;
      if(sbChk&&!uidChk){
        const {data:sd}=await sbChk.auth.getSession();
        uidChk=(sd&&sd.session&&sd.session.user)?sd.session.user.id:null;
      }
      if(sbChk&&uidChk){
        const {data:pend}=await sbChk.from('payments')
          .select('reference').eq('user_id',uidChk).eq('status','pending').limit(1);
        if(pend&&pend.length){
          // On resynchronise l'état local sur la vérité base, pour que
          // l'interface (bouton renouveler, message de la page plans)
          // reflète immédiatement l'attente réelle.
          state.payStatus='pending';
          if(!state.pendingRef)state.pendingRef=pend[0].reference||null;
          save();
          fermerFenetreAuto(fenetreAuto);
          afficherRefusPaiement('renew_err_pending');
          if(window.VB_refreshPlansUI)window.VB_refreshPlansUI();
          return;
        }
      }
    }catch(e){}
    const wasRenew=renewMode;
    state.payMethod=method;
    const pl=planById(planCible);
    const now=new Date();
    /* Un abonnement deja actif et CONFIRME, pas encore termine, reste
       tel quel pendant toute l'attente : la personne ne doit jamais
       perdre l'acces a ce qu'elle paie deja pour un changement pas
       encore valide par l'admin. Seul ce cas precis differe le
       remplacement de planId/startDate/endDate — une premiere
       souscription, ou un changement demande alors que le plan en
       cours est deja termine, continue d'agir immediatement comme
       avant. */
    const planEnCoursValide=state.paid&&state.payStatus==='confirmed'&&state.endDate&&new Date(state.endDate).getTime()>now.getTime();

    /* MonCash et NatCash sont en paiement automatique REEL, entierement
       gere cote serveur (creation chez le prestataire + verification +
       activation) : ce chemin n'ecrit jamais rien lui-meme dans Supabase
       et ne genere jamais de reference localement, contrairement au bloc
       Stripe/manuel ci-dessous. Voir lancerPaiementAutomatique(). */
    if(PAIEMENT_AUTO_METHODS.includes(method)){
      await lancerPaiementAutomatique({method,pl,planCible,planEnCoursValide,ancienPlan,wasRenew,fenetreAuto});
      return;
    }

    // CORRECTIF MAJEUR : 'state.ref' doit TOUJOURS pointer sur le paiement
    // du plan ACTIF et CONFIRME, jamais sur une demande de changement en
    // attente. Avant ce correctif, la nouvelle reference etait ecrite
    // dans state.ref ET state.pendingRef en meme temps, meme pendant un
    // simple changement de plan — donc des qu'un admin refusait CE
    // changement, la lecture basee sur state.ref retrouvait le paiement
    // REFUSE (pas celui du plan pourtant toujours actif), et effacait a
    // tort le statut confirme du plan actif. C'est la cause exacte du
    // bug "plan actif perdu apres un refus". La reference n'est ecrite
    // dans state.ref que dans le cas SANS plan actif en cours — sinon
    // elle ne va que dans pendingRef.
    const nouvelleRef='VB-'+now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+'-'+Math.floor(1000+Math.random()*9000);

    if(planEnCoursValide){
      // Le plan actif ne bouge pas : seul le CHANGEMENT est enregistre,
      // separement, en attente de confirmation. state.ref reste intact,
      // toujours celui du plan actif.
      state.pendingPlanId=pl.id;
      state.pendingRef=nouvelleRef;
    }else{
      // Le plan choisi est engage ici, mais son CONTENU reste verrouille
      // (payStatus='pending') tant qu'un admin ne l'a pas confirme.
      // paid=true ouvre seulement la porte du Dashboard (voir requiredStep) ;
      // ce n'est jamais une preuve de paiement reel.
      state.ref=nouvelleRef;
      state.planId=pl.id;
      state.pendingPlanId=null;
      state.pendingRef=null;
      state.paid=true;
      state.payStatus='pending';
      state.startDate=now.toISOString();
      state.endDate=pl.days?new Date(now.getTime()+pl.days*86400000).toISOString():null;
    }
    state.step=4;
    state.started=false;                      // inscription terminee : plus de reprise
    save();
    // Le compte devient utilisable pour se connecter (identite verifiee),
    // meme si le paiement, lui, reste en attente de validation admin.
    accounts.put({
      email:state.email.trim().toLowerCase(),
      pass:state.pass,
      fullname:state.fullname, site:state.site,
      emailVerified:true, paid:true,
      payStatus:planEnCoursValide?state.payStatus:'pending',
      planId:state.planId, payMethod:state.payMethod,
      startDate:state.startDate, endDate:state.endDate,
      ref:state.ref
    });
    // Le compteur d'utilisateurs actifs ne compte QUE les premieres
    // inscriptions, pas les renouvellements.
    if(!wasRenew&&window.VB_countSignup)window.VB_countSignup();

    /* CORRECTIF : la personne n'a PAS "change d'abonnement" a cet
       instant — elle vient seulement de le DEMANDER, et ca reste en
       attente jusqu'a validation admin. L'ancien toast/notification
       disait "Vous avez change d'abonnement" au passe, comme si
       c'etait deja fait : trompeur, et en contradiction directe avec
       la vraie notification "paiement en attente" desormais creee en
       base (voir syncAbonnementSupabase). On ne garde donc qu'un seul
       message, honnete, au moment de la soumission — la confirmation
       reelle n'arrive que via la notification serveur, au moment ou
       l'admin valide reellement. */
    if(ancienPlan&&ancienPlan!==pl.id){
      if(pl.id==='p4'){
        if(window.VB_toast)window.VB_toast('plan_changed_h',t('plan_changed_lifetime')+' '+t('pay_pending_note'));
      }else{
        if(window.VB_toast)window.VB_toast('plan_changed_h',t('plan_changed_p')+' '+t('pay_pending_note'));
      }
    }else if(ancienPlan){
      if(window.VB_toast)window.VB_toast('renew_success_h',t('renew_success_p')+' '+t('pay_pending_note'));
    }
    /* CORRECTIF (course de timing) : on ATTEND que l'ecriture reelle en
       base soit terminee avant d'ouvrir le Dashboard. Avant ce correctif,
       le Dashboard pouvait s'ouvrir et relire Supabase AVANT que cette
       ecriture soit terminee — la lecture ne trouvait alors aucune ligne
       "pending", et effacait a tort le changement pourtant bien demande.
       Attendre ici (quelques centaines de ms tout au plus) elimine cette
       course a la racine, plutot que de la contourner. */
    const resSync=await syncAbonnementSupabase();
    if(resSync&&resSync.dejaEnAttente){
      // L'insertion a été refusée en base (index unique partiel) : une
      // demande était déjà en attente. On aligne l'état local sur cette
      // vérité et on affiche le vrai motif, jamais un succès trompeur.
      state.payStatus='pending';
      if(!state.pendingRef&&resSync.reference)state.pendingRef=resSync.reference;
      save();
      afficherRefusPaiement('renew_err_pending');
      if(window.VB_refreshPlansUI)window.VB_refreshPlansUI();
      return;
    }
    if(resSync&&resSync.emailNonVerifie){
      // AJOUTÉ (04/09, correctif de sécurité email_verified) : la policy
      // RLS a bloqué l'insertion car ce compte n'a pas réellement complété
      // la vérification par code — message clair, jamais un simple
      // "hors ligne, réessayez plus tard" qui n'aurait jamais résolu quoi
      // que ce soit tout seul ici.
      afficherRefusPaiement('renew_err_email_non_verifie');
      return;
    }
    if(resSync&&resSync.hors_ligne){
      if(window.VB_logErreurTechnique)window.VB_logErreurTechnique('paiement_sync',resSync.erreur);
      if(window.VB_toast)window.VB_toast('err_action_unavailable_h',t('err_action_unavailable_p'));
    }
    showStep(4);
  }

  f3.addEventListener('submit',ev=>{
    ev.preventDefault();
    if(!state.payMethod){payErr.textContent=t('wiz_p_err_method');payErr.style.display='block';return;}
    payErr.style.display='none';
    /* MonCash/NatCash : l'URL du prestataire n'est connue qu'apres un
       appel serveur (async). La fenetre doit donc s'ouvrir ICI, de facon
       synchrone dans le geste de soumission — un window.open() place
       apres un 'await' est bloque par les navigateurs mobiles (meme regle
       deja appliquee au bouton Stripe juste en dessous). */
    let fenetreAuto=null;
    if(PAIEMENT_AUTO_METHODS.includes(state.payMethod)){
      try{fenetreAuto=window.open('','_blank');}catch(e){fenetreAuto=null;}
    }
    completePayment(state.payMethod,fenetreAuto);
  });

  /* ===== Paiement par carte (Stripe) — flux v134 restaure (choix explicite
     de James, 23/08) =====
     Comportement IDENTIQUE a MonCash/NatCash : le clic ouvre la page Stripe
     dans un nouvel onglet ET enregistre immediatement un paiement 'pending'
     via completePayment('stripe') (meme chemin que les methodes manuelles).
     La confirmation reste 100% manuelle par l'admin — le webhook automatique
     stripe-webhook.js N'EST PAS utilise dans ce flux et reste non deploye. */
  document.getElementById('wizStripeBtn').addEventListener('click',()=>{
    payErr.style.display='none';
    const planCible=state.pendingPlanId||state.planId;
    const lien=STRIPE_LINKS[planCible]||null;
    /* L'ouverture de la page Stripe doit rester DANS le geste de clic :
       un window.open place apres un 'await' est bloque par les
       navigateurs mobiles. On ne l'ouvre que si le paiement est
       reellement permis — sinon completePayment affiche le refus et
       aucune page de paiement ne doit s'ouvrir pour rien. Si le
       navigateur bloque quand meme l'onglet, l'etape 4 propose un lien
       de secours (voir renderStep4). */
    const permis=renouvellementPermis(state,planCible);
    if(lien&&permis&&permis.ok){
      try{window.open(lien,'_blank','noopener');}catch(e){}
    }
    completePayment('stripe');
  });

  /* ================= ETAPE 4 : acces ================= */
  function renderStep4(){
    // Si un changement est en attente pendant qu'un plan reste actif,
    // l'ecran de confirmation doit montrer CE qui vient d'etre paye
    // (le nouveau plan en attente), pas le plan qui reste actif en
    // arriere-plan.
    const enAttenteChangement=!!state.pendingPlanId;
    const pl=planById(enAttenteChangement?state.pendingPlanId:state.planId);
    const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';
    const pend=enAttenteChangement||state.payStatus==='pending';
    const methodeAuto=PAIEMENT_AUTO_METHODS.includes(state.payMethod);
    const ic=document.getElementById('wizDoneIc');
    ic.classList.toggle('is-pending',pend);
    ic.innerHTML=pend
      ?'<svg class="ic" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
      :'<svg class="ic" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg>';
    document.getElementById('wizDoneH').textContent=t(pend?'wiz_d_h_pending':'wiz_d_h');
    // La copie "notre equipe va valider" ne convient qu'au flux
    // manuel/admin : pour MonCash/NatCash, la verification est reellement
    // automatique et le panneau de statut ci-dessous donne le detail.
    document.getElementById('wizDoneSub').textContent=t(pend?(methodeAuto?'wiz_d_sub_pending_auto':'wiz_d_sub_pending'):'wiz_d_sub');
    document.getElementById('wizDonePlan').textContent=pl?stripTags(window.VB_planLabel(pl)):'—';
    // Tant que ce n'est pas confirme, on ne peut pas encore montrer de
    // vraies dates (elles ne sont fixees qu'a la confirmation admin) —
    // on l'indique clairement plutot que d'afficher une date provisoire
    // qui ne sera pas la vraie.
    document.getElementById('wizDoneStart').textContent=enAttenteChangement?t('wiz_d_pending_dates'):fmt(state.startDate);
    document.getElementById('wizDoneEnd').textContent=enAttenteChangement?t('wiz_d_pending_dates'):(state.endDate?fmt(state.endDate):t('wiz_d_never'));
    document.getElementById('wizDoneRef').textContent=(enAttenteChangement?state.pendingRef:state.ref)||'—';

    /* Paiement automatique MonCash/NatCash en attente : panneau de statut
       + reprise du sondage si cette page est rouverte (F5, retour sur
       l'onglet) pendant qu'une verification reste en cours. Le filet
       serveur (paiement-poll-background, toutes les 3 min) continue de
       toute facon meme si cette page n'est jamais rouverte. */
    const boxAuto=document.getElementById('wizAutoStatus');
    if(boxAuto){
      const auto=pend&&methodeAuto&&!!state.autoPaymentId;
      boxAuto.hidden=!auto;
      if(auto){
        const lien=document.getElementById('wizAutoOpenLink');
        if(lien)lien.href=state.autoProviderUrl||'#';
        renderStatutPaiementAuto('attente');
        if(!pollAutoTimer)demarrerPollAuto();
      }else{
        arreterPollAuto();
      }
    }
  }

  /* Relance manuelle : utile si la personne revient sur cet onglet apres
     avoir paye pendant que le sondage automatique est justement entre
     deux passages (jusqu'a 6s d'attente sinon). N'interfere jamais avec
     le sondage en cours : appliquerResultatVerifAuto() est idempotente,
     et un resultat 'confirme' arrete de toute facon tout sondage a venir
     (state.autoPaymentId est remis a null). */
  const wizAutoRetryBtn=document.getElementById('wizAutoRetryBtn');
  if(wizAutoRetryBtn){
    wizAutoRetryBtn.addEventListener('click',async()=>{
      if(!state.autoPaymentId)return;
      wizAutoRetryBtn.disabled=true;
      renderStatutPaiementAuto('verification_manuelle');
      try{
        const res=await verifierPaiementAutoUneFois();
        await appliquerResultatVerifAuto(res);
      }finally{
        wizAutoRetryBtn.disabled=false;
      }
    });
  }

  /* Retour sur cet onglet (la personne revient de la page MonCash/NatCash,
     ouverte dans un autre onglet) : on verifie tout de suite plutot que
     d'attendre le prochain passage du backoff (jusqu'a 25s). Couvre
     exactement le cas "entre sur la page de paiement, ne remplit rien,
     revient sur le site" — le sondage normal aurait fini par le detecter
     de toute facon (voir paiementEncorePossible), ceci ne fait qu'accelerer
     le retour d'information a l'ecran. Anti-rebond : 'visibilitychange' et
     'focus' peuvent se declencher tous les deux pour un seul retour. */
  let dernierePriseDeRetour=0;
  async function verifierAuRetourSurOnglet(){
    if(!state.autoPaymentId||state.step!==4)return;
    const maintenant=Date.now();
    if(maintenant-dernierePriseDeRetour<4000)return;
    dernierePriseDeRetour=maintenant;
    const res=await verifierPaiementAutoUneFois();
    await appliquerResultatVerifAuto(res);
  }
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')verifierAuRetourSurOnglet();
  });
  window.addEventListener('focus',verifierAuRetourSurOnglet);

  /* ================= REINITIALISATION DU MOT DE PASSE =================
     Un seul processus, utilise a la fois par "Modpas bliye?" (page de
     connexion) et par "Chanje modpas" (dashboard). Meme systeme de code
     par e-mail que l'inscription : aucun second mecanisme. */
  const fPwr=document.getElementById('wizPwReset');
  const pwrStages=[...fPwr.querySelectorAll('.pwr-stage')];
  const pwrOtp=document.getElementById('pwrOtp');
  const pwrOtpInputs=[...pwrOtp.querySelectorAll('input')];
  const pwrOtpErr=document.getElementById('pwrOtpErr');
  const pwrSubmit=document.getElementById('pwrSubmit');
  let pwr={stage:'mail',email:'',code:null,verified:false,origin:'login'};

  function pwrShow(stage){
    pwr.stage=stage;
    if(pwr.origin==='dashboard'){
      const lbl=backBtn.querySelector('span');
      lbl.removeAttribute('data-i18n');
      lbl.textContent=t('pwr_back_dash');
    }
    pwrStages.forEach(x=>x.classList.toggle('on',x.dataset.pwr===stage));
    const titles={mail:'pwr_h_mail',code:'pwr_h_code',newpass:'pwr_h_new'};
    const subs={mail:'pwr_sub_mail',code:'pwr_sub_code',newpass:'pwr_sub_new'};
    const btns={mail:'pwr_btn_send',code:'wiz_btn_verify',newpass:'pwr_btn_save'};
    document.getElementById('pwrH').textContent=t(titles[stage]);
    document.getElementById('pwrSub').textContent=t(subs[stage]);
    pwrSubmit.textContent=t(btns[stage]);
    const first=pwrStages.find(x=>x.dataset.pwr===stage).querySelector('input');
    if(first&&window.innerWidth>860)first.focus({preventScroll:true});
  }

  function openPwReset(origin,prefill){
    fillLogos();
    renewMode=false;
    /* Ouvert depuis le Dashboard : seul un bouton "Retour au Dashboard"
       est visible, jamais le X qui menerait vers la page d'accueil. */
    const depuisDash=(origin==='dashboard');
    setChrome(depuisDash);
    modeWizard.classList.remove('renew');
    modeWizard.classList.add('pwreset');
    pwr={stage:'mail',email:'',code:null,verified:false,origin:origin||'login'};
    fPwr.reset();
    fPwr.querySelectorAll('.field').forEach(x=>x.classList.remove('invalid'));
    pwrOtpInputs.forEach(i=>i.value='');
    pwrOtpErr.style.display='none';
    pwrOtp.classList.remove('invalid');
    if(prefill)fPwr.querySelector('[name=pwrEmail]').value=prefill;
    page.classList.add('open');
    page.scrollTop=0;
    document.body.style.overflow='hidden';
    showMode('wizard');
    showStep('pwreset');
    pwrShow('mail');
  }
  function leavePwReset(){
    modeWizard.classList.remove('pwreset');
  }

  // saisie du code (meme comportement que l'inscription)
  pwrOtpInputs.forEach((inp,i)=>{
    inp.addEventListener('input',()=>{
      inp.value=inp.value.replace(/\D/g,'').slice(0,1);
      pwrOtp.classList.remove('invalid');pwrOtpErr.style.display='none';
      // Animation "pop" (02/09), meme principe que wizOtp — voir CSS/JS
      // de wizOtp pour le detail du raisonnement, jamais duplique ici.
      if(inp.value){
        inp.classList.remove('otp-pop');
        void inp.offsetWidth;
        inp.classList.add('otp-pop');
      }
      if(inp.value&&i<pwrOtpInputs.length-1)pwrOtpInputs[i+1].focus();
    });
    inp.addEventListener('keydown',ev=>{
      if(ev.key==='Backspace'&&!inp.value&&i>0)pwrOtpInputs[i-1].focus();
    });
    inp.addEventListener('paste',ev=>{
      const dd=(ev.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
      if(!dd)return;
      ev.preventDefault();
      dd.split('').slice(0,6).forEach((c,k)=>{if(pwrOtpInputs[k])pwrOtpInputs[k].value=c});
      pwrOtpInputs[Math.min(dd.length,5)].focus();
    });
  });

  /* Reinitialisation REELLE (Supabase Auth), jamais seulement locale :
     le code n'est plus genere ni verifie dans le navigateur — c'est la
     fonction Netlify request-password-reset qui s'en charge entierement
     cote serveur (generation, stockage, envoi). */
  async function pwrRequestReset(btn){
    pwr.verified=false;
    if(btn)btn.disabled=true;
    try{
      const resp=await fetch('/.netlify/functions/request-password-reset',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:pwr.email})
      });
      const data=await resp.json().catch(()=>({}));
      if(btn)btn.disabled=false;
      if(!resp.ok)return {ok:false, erreur:(data&&data.error)||'erreur'};
      if(window.VB_toast)window.VB_toast('toast_mail_h',t('toast_mail_p').replace('{email}',pwr.email));
      return {ok:true};
    }catch(e){
      if(btn)btn.disabled=false;
      return {ok:false, erreur:e.message};
    }
  }
  document.getElementById('pwrResend').addEventListener('click',async ev=>{
    await pwrRequestReset(ev.currentTarget);
    pwrShow('code');
  });

  fPwr.addEventListener('submit',async ev=>{
    ev.preventDefault();

    if(pwr.stage==='mail'){
      const em=fPwr.querySelector('[name=pwrEmail]');
      const val=em.value.trim().toLowerCase();   // normalisee : jamais de casse imprevisible
      if(!isEmail(val)){setErr(em.closest('.field'),'auth_err_email');return;}
      setErr(em.closest('.field'),null);
      pwr.email=val;
      const res=await pwrRequestReset(pwrSubmit);
      if(!res.ok){
        setErr(em.closest('.field'),res.erreur==='compte introuvable'?'pwr_err_nouser':'pwr_err_generic');
        return;
      }
      pwrShow('code');
      return;
    }

    if(pwr.stage==='code'){
      // Animation en cascade au clic (02/09), meme principe que wizOtp.
      pwrOtpInputs.forEach((inp,i)=>{
        setTimeout(()=>{
          inp.classList.remove('otp-pop');
          void inp.offsetWidth;
          inp.classList.add('otp-pop');
        },i*45);
      });
      const entered=pwrOtpInputs.map(i=>i.value).join('');
      if(entered.length!==6){
        pwrOtp.classList.add('invalid');
        pwrOtpErr.textContent=t('wiz_v_err');
        pwrOtpErr.style.display='block';
        return;
      }
      // Le VRAI code n'est verifie que cote serveur, a l'etape finale —
      // on se contente ici de le recueillir.
      pwr.code=entered;
      pwrOtp.classList.remove('invalid');
      pwrOtpErr.style.display='none';
      pwrShow('newpass');
      return;
    }

    const np=fPwr.querySelector('[name=pwrNew]');
    const nc=fPwr.querySelector('[name=pwrConfirm]');
    let ok=true;
    if(np.value.length<8){setErr(np.closest('.field'),'auth_err_password_len');ok=false}
    else if(!/\d/.test(np.value)){setErr(np.closest('.field'),'auth_err_password_digit');ok=false}
    else setErr(np.closest('.field'),null);
    if(!nc.value||nc.value!==np.value){setErr(nc.closest('.field'),'auth_err_password_match');ok=false}
    else setErr(nc.closest('.field'),null);
    if(!ok)return;

    pwrSubmit.disabled=true;
    let confirmRes;
    try{
      const resp=await fetch('/.netlify/functions/confirm-password-reset',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:pwr.email, code:pwr.code, newPassword:np.value})
      });
      const data=await resp.json().catch(()=>({}));
      confirmRes=resp.ok
        ?{ok:true, suspended:!!(data&&data.suspended), suspendedReason:(data&&data.suspendedReason)||null}
        :{ok:false, erreur:(data&&data.error)||'erreur'};
    }catch(e){
      confirmRes={ok:false, erreur:e.message};
    }
    pwrSubmit.disabled=false;

    if(!confirmRes.ok){
      if(confirmRes.erreur==='code_invalide'||confirmRes.erreur==='code_expire'){
        pwrOtp.classList.add('invalid');
        pwrOtpErr.textContent=t('wiz_v_err');
        pwrOtpErr.style.display='block';
        pwrShow('code');   // renvoyer corriger le code, jamais bloquer sans explication
      }else{
        setErr(nc.closest('.field'),'pwr_err_generic');
      }
      return;
    }

    // Le vrai mot de passe Supabase est deja change (appel ci-dessus) —
    // ce bloc met seulement a jour le repli local, pour rester coherent
    // si jamais Supabase redevient injoignable plus tard.
    const acc=accounts.find(pwr.email.toLowerCase());
    if(acc){
      acc.pass=fingerprint(np.value);
      accounts.put(acc);
      if(state.email&&state.email.toLowerCase()===pwr.email.toLowerCase())
        {state.pass=acc.pass;save();}
    }
    const emailReset=pwr.email, mdpReset=np.value;
    pwr={stage:'mail',email:'',code:null,verified:false,origin:'login'};
    leavePwReset();

    /* Compte suspendu : le mot de passe est bien change (utile pour plus
       tard), mais jamais de dashboard, jamais de session ouverte — la
       suspension est prioritaire sur tout, meme juste apres une preuve
       d'identite reussie. Verification faite CE SERVEUR au moment de
       confirm-password-reset (jamais devinee cote client). */
    if(confirmRes.suspended){
      if(window.VB_toast)window.VB_toast('auth_suspended_h', confirmRes.suspendedReason?t('auth_suspended_reason_p').replace('{reason}',confirmRes.suspendedReason):t('auth_suspended_p'));
      showMode('login');
      return;
    }

    if(window.VB_toast)window.VB_toast('pwr_toast_h',t('pwr_toast_p'));

    /* Plus jamais d'ouverture de dashboard a partir du seul cache local :
       une VRAIE session Supabase est etablie ici, avec le mot de passe
       qui vient d'etre prouve. Sans cette vraie session, les donnees
       protegees par la RLS (abonnement, fiches) ne se chargeraient de
       toute facon jamais correctement — ce correctif est donc aussi une
       correction fonctionnelle, pas seulement une correction de securite. */
    const acc2=accounts.find(emailReset.toLowerCase());
    const compteComplet=isComplete(acc2);
    if(!compteComplet){
      showMode('login');
      return;
    }
    const sbReset=window.VB_getSupabase&&window.VB_getSupabase();
    let sessionOk=false;
    if(sbReset){
      try{
        const {data:sdata,error:serr}=await sbReset.auth.signInWithPassword({email:emailReset, password:mdpReset});
        sessionOk=!serr&&sdata&&sdata.user;
        if(sessionOk&&window.VB_demarrerSurveillanceSuspension)window.VB_demarrerSurveillanceSuspension(sdata.user.id);
      }catch(e){}
    }
    if(!sessionOk){
      // Reseau indisponible au moment precis de la reconnexion : on
      // n'ouvre jamais le dashboard sans session reelle, on renvoie
      // simplement vers l'ecran de connexion avec le nouveau mot de passe.
      showMode('login');
      return;
    }
    state=Object.assign(blank(),{
      step:4, started:false, fullname:acc2.fullname, email:acc2.email, pass:acc2.pass,
      site:acc2.site||'paryajpam',
      planId:acc2.planId, emailVerified:true, paid:true, payMethod:acc2.payMethod,
      startDate:acc2.startDate, endDate:acc2.endDate, ref:acc2.ref
    });
    save();
    closeAuth();
    requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
  });

  document.getElementById('pwrCancel').addEventListener('click',()=>{
    const backToDash=pwr.origin==='dashboard';
    leavePwReset();
    if(backToDash){
      closeAuth();
      requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
    }else{
      showMode('login');
      showStep(1);
    }
  });

  // point d'entree 1 : "Modpas bliye?" sur la page de connexion
  document.querySelector('.authpage-forgot').addEventListener('click',()=>{
    const id=fL.querySelector('[name=loginId]').value.trim();
    openPwReset('login',isEmail(id)?id:'');
  });
  // point d'entree 2 : "Chanje modpas" dans le dashboard
  window.VB_openPwReset=function(){
    openPwReset('dashboard',state.email||'');
  };

  /* ================= GARDE DU DASHBOARD ================= */
  const lockTxt=document.getElementById('wizLockTxt');
  function guardDashboard(from){
    fillLogos();
    const need=requiredStep(state);
    if(need===4){
      if(window.VB_openDash){window.VB_openDash();return true;}
      openAuth('wizard',from,4);
      return true;
    }
    const reasons={1:state.email?'wiz_lock_r2':'wiz_lock_r1',3:'wiz_lock_r3'};
    lockTxt.textContent=t(reasons[need]);
    opener=from||null;
    page.classList.add('open');
    document.body.style.overflow='hidden';
    showMode('wizard');
    showStep('lock');
    return false;
  }
  document.getElementById('wizLockCta').addEventListener('click',()=>{
    showStep(pageDe(requiredStep(state)));
  });
  document.getElementById('wizDoneCta').addEventListener('click',()=>{
    renewMode=false;renewFrom=false;
    setChrome(false);
    modeWizard.classList.remove('renew');
    closeAuth();
    requestAnimationFrame(()=>{
      if(window.VB_openDash)window.VB_openDash();
    });
  });
  document.querySelectorAll('[data-dashboard]').forEach(b=>{
    b.addEventListener('click',ev=>{ev.preventDefault();guardDashboard(b);});
  });

  /* ================= CONNEXION ================= */
  const fL=document.getElementById('authFormLogin');
  fL.addEventListener('submit',async ev=>{
    ev.preventDefault();
    const id=fL.querySelector('[name=loginId]'),pw=fL.querySelector('[name=loginPassword]');
    const seSouvenir=fL.querySelector('[name=remember]');
    const veutSeSouvenir=!!(seSouvenir&&seSouvenir.checked);
    let ok=true;
    if(!id.value.trim()){setErr(id.closest('.field'),'auth_err_required');ok=false}else setErr(id.closest('.field'),null);
    if(!pw.value){setErr(pw.closest('.field'),'auth_err_required');ok=false}else setErr(pw.closest('.field'),null);
    if(!ok)return;

    /* Connexion reelle via Supabase, en priorite. Si Supabase est
       injoignable (reseau, CDN), on se replie sur l'ancien registre local
       ci-dessous, sans jamais laisser l'utilisateur bloque. */
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(sb&&isEmail(id.value.trim())){
      const loginBtn=fL.querySelector('button[type=submit]');
      loginBtn.disabled=true;
      try{
        const {data,error}=await sb.auth.signInWithPassword({
          email:id.value.trim().toLowerCase(),
          password:pw.value
        });
        loginBtn.disabled=false;
        if(!error&&data&&data.user){
          /* Verification du role, toujours cote serveur : c'est la table
             "profiles" (protegee par les regles de securite ecrites dans
             la base) qui decide, jamais une donnee modifiable depuis le
             navigateur. Un compte normal ne peut jamais s'attribuer le
             role admin en trafiquant l'appareil. */
          let role='user';
          let profil=null;
          try{
            const {data:prof}=await sb.from('profiles')
              .select('role,username,suspended_at,suspended_reason').eq('id',data.user.id).single();
            profil=prof;
            if(prof&&prof.role)role=prof.role;
          }catch(e){}
          /* Compte suspendu : la connexion s'arrete ici, quel que soit le
             role. On ferme immediatement la session Supabase qui vient de
             s'ouvrir — un compte suspendu ne doit garder AUCUNE session
             active, meme brievement. */
          if(profil&&profil.suspended_at){
            try{await sb.auth.signOut();}catch(e){}
            if(window.VB_toast)window.VB_toast('auth_suspended_h', profil.suspended_reason?t('auth_suspended_reason_p').replace('{reason}',profil.suspended_reason):t('auth_suspended_p'));
            return;
          }
          if(window.VB_demarrerSurveillanceSuspension)window.VB_demarrerSurveillanceSuspension(data.user.id);
          if(role==='admin'){
            // Le 2FA est OBLIGATOIRE pour un compte admin : jamais
            // contourne, jamais facultatif. L'ouverture du tableau de
            // bord n'a lieu qu'apres verification reussie.
            if(window.VB_handleAdminMFA){
              window.VB_handleAdminMFA(()=>{
                closeAuth();
                requestAnimationFrame(()=>{if(window.VB_openAdminDash)window.VB_openAdminDash(data.user);});
              },data.user.email,data.user.id,veutSeSouvenir);
            }else{
              closeAuth();
              requestAnimationFrame(()=>{if(window.VB_openAdminDash)window.VB_openAdminDash(data.user);});
            }
            return;
          }
          const localAcc=accounts.find(data.user.email);
          /* CORRECTIF SYNCHRONISATION (prioritaire) : Supabase est desormais
             TOUJOURS consulte ici, meme si un compte local complet existe
             deja sur cet appareil. Un instantane local (ecrit par ce meme
             appareil a sa derniere transaction) devient perime des qu'un
             admin agit depuis un autre appareil — changement de plan
             (changerPlanAdmin), validation ou refus de paiement
             (traiterPaiement). Le local ne sert plus que de repli si
             Supabase est REELLEMENT injoignable : aucun etat temporaire du
             navigateur ne doit pouvoir remplacer l'etat reel en base. */
          const meta=data.user.user_metadata||{};
          const identite={
            email:data.user.email,
            fullname:(localAcc&&localAcc.fullname)||meta.username||'',
            site:(localAcc&&localAcc.site)||meta.preferred_site||'paryajpam',
            supabaseUserId:data.user.id
          };
          let abonnementActif=null, abonnementPendant=null, supabaseJoignable=true;
          let aDejaEuUnAbonnement=false;
          try{
            // On lit 'active' ET 'pending' pour cette personne, toutes les
            // lignes (pas juste la plus recente) : un plan actif et un
            // changement en attente peuvent coexister, et doivent etre
            // distingues plutot que confondus en une seule ligne.
            const {data:subs}=await sb.from('subscriptions')
              .select('plan_id,status,starts_at,expires_at')
              .eq('user_id',data.user.id).in('status',['active','pending'])
              .order('starts_at',{ascending:false});
            if(subs&&subs.length){
              aDejaEuUnAbonnement=true;
              abonnementActif=subs.find(x=>x.status==='active')||null;
              const p=subs.find(x=>x.status==='pending')||null;
              // Un "pending" n'est un CHANGEMENT en attente que s'il existe
              // deja un plan actif different ; sinon c'est la toute premiere
              // souscription, encore en attente de validation admin.
              if(abonnementActif&&p&&p.plan_id!==abonnementActif.plan_id)abonnementPendant=p;
              else if(!abonnementActif&&p)abonnementActif={...p,__pending:true};
            }
            if(!aDejaEuUnAbonnement){
              /* REGLE : l'inscription terminee et le plan actif sont deux
                 choses distinctes. Un paiement refuse passe l'abonnement
                 en 'cancelled', et une expiration le sort aussi de la
                 liste ci-dessus — sans cette verification, la personne
                 serait renvoyee vers le parcours de paiement comme un
                 nouveau visiteur, et perdrait l'acces a son Dashboard.
                 Des qu'un abonnement a EXISTE, quel que soit son statut,
                 l'inscription est terminee : le Dashboard reste ouvert,
                 seuls les contenus lies a un plan restent verrouilles. */
              const {data:histo}=await sb.from('subscriptions')
                .select('id').eq('user_id',data.user.id).limit(1);
              if(histo&&histo.length)aDejaEuUnAbonnement=true;
            }
          }catch(e){ supabaseJoignable=false; /* Supabase injoignable pour cette lecture */ }

          if(abonnementActif){
            /* "paid" signifie "a deja paye au moins une fois" — jamais remis
               a false a l'expiration. C'est isExpired()/subscriptionExpired()
               qui verrouille les cotes DANS le dashboard ; l'acces au
               dashboard lui-meme reste ouvert, exactement comme pour un
               compte cree localement. Ne pas confondre les deux notions. */
            state=Object.assign(blank(),{
              step:4, started:false, ...identite,
              pass:(localAcc&&localAcc.pass)||null,
              emailVerified:true,
              planId:abonnementActif.plan_id, paid:true,
              payStatus:abonnementActif.__pending?'pending':'confirmed',
              startDate:abonnementActif.starts_at, endDate:abonnementActif.expires_at,
              pendingPlanId:abonnementPendant?abonnementPendant.plan_id:null,
              payMethod:(localAcc&&localAcc.payMethod)||null,
              ref:(localAcc&&!abonnementActif.__pending)?localAcc.ref:null
            });
            save();
            closeAuth();
            requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
          }else if(aDejaEuUnAbonnement){
            /* Inscription terminee, mais aucun plan actif ni en attente
               (refuse, annule, ou confirme puis arrive a echeance).
               Dashboard ACCESSIBLE ; fiches/cotes verrouillees dans les
               deux cas, mais le MESSAGE affiche doit differer :
               - dernier paiement 'confirmed' => plan reellement expire
                 ("Expire", CTA "Renouveler") ;
               - dernier paiement 'failed' (ou aucun) => jamais confirme
                 ("Paiement non reussi", CTA "Activer").
               On distingue les deux via le dernier PAIEMENT (pas le
               statut de l'abonnement, qui vaut 'cancelled' dans les deux
               cas et ne permet pas de les differencier). */
            let dernierPaiementConfirme=false, dateFinReelle=null;
            // CORRIGÉ (31/08, bug signalé par James) : ne distinguait AVANT
            // que 'confirmed' vs "tout le reste", écrasant donc un paiement
            // réellement 'pending' en payStatus:'rejected'. Conséquence : un
            // utilisateur expiré ayant déjà une demande en attente repartait
            // avec un état "refusé", et TOUS les contrôles en aval
            // (renouvellementPermis, bouton renouveler, message de la page
            // plans) le laissaient passer — d'où plusieurs paiements
            // 'pending' empilés pour la même personne. On lit désormais le
            // vrai statut du dernier paiement, et on conserve sa référence.
            let paiementEnAttente=false, refEnAttente=null, planEnAttente=null;
            try{
              const {data:dpays}=await sb.from('payments')
                .select('status,subscription_id,reference,plan_id').eq('user_id',data.user.id)
                .order('created_at',{ascending:false}).limit(1);
              if(dpays&&dpays.length){
                if(dpays[0].status==='confirmed'){
                  dernierPaiementConfirme=true;
                  if(dpays[0].subscription_id){
                    const {data:dsub}=await sb.from('subscriptions')
                      .select('expires_at').eq('id',dpays[0].subscription_id).single();
                    if(dsub)dateFinReelle=dsub.expires_at;
                  }
                }else if(dpays[0].status==='pending'){
                  paiementEnAttente=true;
                  refEnAttente=dpays[0].reference||null;
                  planEnAttente=dpays[0].plan_id||null;
                }
              }
            }catch(e){}
            state=Object.assign(blank(),{
              step:4, started:false, ...identite,
              pass:(localAcc&&localAcc.pass)||null,
              emailVerified:true,
              planId:null, paid:true,
              payStatus:dernierPaiementConfirme?'confirmed':(paiementEnAttente?'pending':'rejected'),
              startDate:null,
              // Un plan confirme puis cancelled a forcement une date de fin
              // reelle dans le passe (sinon il serait encore 'active') ; on
              // l'utilise telle quelle plutot qu'une date inventee.
              endDate:dernierPaiementConfirme?(dateFinReelle||new Date(Date.now()-1000).toISOString()):null,
              // Conserves pour que l'interface puisse afficher "en attente
              // de validation" (plan visé + référence) au lieu du message
              // generique d'expiration, et masquer le bouton renouveler.
              pendingPlanId:paiementEnAttente?planEnAttente:null,
              pendingRef:paiementEnAttente?refEnAttente:null, ref:null
            });
            save();
            closeAuth();
            requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
          }else if(!supabaseJoignable&&localAcc&&isComplete(localAcc)){
            // Repli degrade UNIQUEMENT si Supabase est reellement
            // injoignable (panne reseau) : on ne bloque jamais l'acces,
            // mais des que la connexion revient, VB_syncPayStatus corrige
            // silencieusement tout ecart avec l'etat reel en base.
            state=Object.assign(blank(),{
              step:4, started:false, fullname:localAcc.fullname, email:localAcc.email, pass:localAcc.pass,
              site:localAcc.site||'paryajpam', supabaseUserId:data.user.id,
              planId:localAcc.planId, emailVerified:true, paid:true, payStatus:localAcc.payStatus||'pending',
              payMethod:localAcc.payMethod,
              startDate:localAcc.startDate, endDate:localAcc.endDate, ref:localAcc.ref
            });
            save();
            closeAuth();
            requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
          }else{
            // Aucun abonnement, ni en base ni en repli local : parcours de
            // paiement, avec l'identite reelle deja restauree.
            state=Object.assign(blank(),{...identite, emailVerified:true, started:false});
            save();
            showMode('wizard');
            showStep(pageDe(requiredStep(state)));
          }
          return;
        }
        /* Supabase renvoie EXACTEMENT le meme message "Invalid login
           credentials" que l'email n'existe pas du tout chez lui OU que
           le mot de passe soit faux (choix delibere de Supabase, pour
           qu'on ne puisse pas deviner quels emails sont enregistres).
           On ne peut donc PAS conclure "mauvais mot de passe" ici : un
           compte cree avant la migration vers Supabase (ex. un ancien
           compte enregistre uniquement dans le registre local)
           n'existe simplement pas encore chez Supabase, et doit continuer
           a fonctionner via l'ancien registre local ci-dessous. */
      }catch(e){
        loginBtn.disabled=false;
      }
    }

    const acc=accounts.find(id.value);
    if(acc&&isComplete(acc)){
      if(acc.pass&&acc.pass!==fingerprint(pw.value)){
        setErr(pw.closest('.field'),'auth_err_badpass');
        return;
      }
      // Inscription terminee : on restaure la session et on ouvre le dashboard.
      state=Object.assign(blank(),{
        step:4, started:false, fullname:acc.fullname, email:acc.email, pass:acc.pass,
        site:acc.site||'paryajpam',
        planId:acc.planId, emailVerified:true, paid:true, payMethod:acc.payMethod,
        startDate:acc.startDate, endDate:acc.endDate, ref:acc.ref
      });
      save();
      closeAuth();
      requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
      return;
    }

    // Parcours en cours sur cet appareil : on reprend a l'etape manquante.
    if(state.email&&state.email.trim().toLowerCase()===id.value.trim().toLowerCase()){
      showMode('wizard');
      showStep(pageDe(requiredStep(state)));
      return;
    }
    setErr(id.closest('.field'),'auth_err_nouser');
  });

  /* ================= OUVERTURE / FERMETURE ================= */
  function fillLogos(){
    const src=document.querySelector('.logo-mark-img img');
    if(!src||!src.src)return;
    document.querySelectorAll('.auth-logo-img').forEach(i=>{if(!i.getAttribute('src'))i.src=src.src;});
  }

  /* Mode renouvellement : la barre de progression est masquee et
     l'etape 3 est affichee seule, comme une simple page de paiement. */
  let renewMode=false,renewFrom=false;
  const backBtn=document.getElementById('authpageBack');
  const closeBtn=document.getElementById('authpageClose');
  function setChrome(renew){
    backBtn.hidden=!renew;
    closeBtn.hidden=!!renew;
  }

  function openRenew(from){
    fillLogos();
    modeWizard.classList.remove('pwreset');
    renewMode=true;
    // Le libelle du bouton peut avoir ete change par la reinitialisation
    // de mot de passe (Retour au Dashboard) : toujours le remettre a "Retounen".
    backBtn.querySelector('span').setAttribute('data-i18n','auth_back');
    backBtn.querySelector('span').textContent=t('auth_back');
    setChrome(true);
    opener=from||null;
    // Premiere ouverture d'un renouvellement : on part du plan actif.
    // Un choix deja en cours (non paye) est conserve tel quel.
    if(state.pendingPlanId==null)state.pendingPlanId=state.planId;
    save();
    page.classList.add('open');
    page.scrollTop=0;
    document.body.style.overflow='hidden';
    showMode('wizard');
    modeWizard.classList.add('renew');
    showStep(3);
    const c=document.getElementById('authpageClose');
    if(c)c.focus();
  }

  /* Si le parcours en memoire est deja complet, l'onglet "Creer un compte"
     repart d'un formulaire vierge (creation d'un NOUVEAU compte).
     Si le parcours est incomplet, on reprend a l'etape manquante. */
  /* Page a afficher pour une etape donnee : l'etape 1 comporte deux pages,
     le formulaire puis la verification e-mail. requiredStep reste numerique. */
  function pageDe(step){
    if(step===1&&!state.emailVerified&&state.codeFor&&state.codeFor===state.email)return 'verify';
    return step;
  }

  function signupEntry(){
    if(requiredStep(state)===4){
      pendingPlainPassword=null;   // nouvelle inscription : on repart propre
      state=blank();
      save();
      f1.reset();
      f1.querySelectorAll('.field').forEach(x=>x.classList.remove('invalid'));
      const te=f1.querySelector('.field-err-terms'); if(te)te.classList.remove('show');
      takenBox.hidden=true;
      sitePickSet('paryajpam');            // valeur par defaut retablie
      const pm=document.getElementById('pwMeter'); if(pm)pm.hidden=true;
      if(window.VB_closeInlineOtp)window.VB_closeInlineOtp();
      return 1;
    }
    return state.step||1;
  }

  function openAuth(mode,from,forceStep){
    fillLogos();
    renewMode=false;
    setChrome(false);
    modeWizard.classList.remove('renew');
    modeWizard.classList.remove('pwreset');
    opener=from||null;
    page.classList.add('open');
    page.scrollTop=0;
    document.body.style.overflow='hidden';
    if(mode==='login'){showMode('login');}
    else{
      showMode('wizard');
      showStep(pageDe(forceStep||signupEntry()));
    }
    const c=document.getElementById('authpageClose');
    if(c)c.focus();
  }
  function closeAuth(){
    page.classList.remove('open');
    document.body.style.overflow='';
    if(opener){opener.focus();opener=null;}
    // Fermeture complete du parcours (pas juste un changement d'etape) :
    // arrete la sync live des plans, sinon le canal Realtime/le polling
    //20s tournerait indefiniment en arriere-plan meme le wizard ferme.
    arreterSyncPlansWizard();
  }

  document.querySelectorAll('[data-auth-open]').forEach(a=>{
    a.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      if(mnav.classList.contains('on'))closeMenu();
      openAuth(a.dataset.authOpen==='login'?'login':'wizard',a);
    });
  });
  // "Commencer" sur un plan : le plan est memorise puis le wizard s'ouvre
  document.querySelectorAll('[data-plan]').forEach(b=>{
    b.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      if(mnav.classList.contains('on'))closeMenu();
      /* Utilisateur deja inscrit et paye : le clic ne modifie JAMAIS le plan
         actif directement. Il ouvre le parcours de paiement pour CE plan ;
         seul un paiement reellement reussi peut changer l'abonnement actif. */
      if(requiredStep(state)===4){
        state.pendingPlanId=b.dataset.plan;save();
        if(window.VB_openWizardPay)window.VB_openWizardPay(b);
        return;
      }
      state.pendingPlanId=b.dataset.plan;
      save();
      openAuth('wizard',b,requiredStep(state));
    });
  });

  document.getElementById('authpageClose').addEventListener('click',closeAuth);
  backBtn.addEventListener('click',()=>{
    // Reinitialisation du mot de passe ouverte depuis le Dashboard : le
    // bouton ramene UNIQUEMENT a l'interface principale du Dashboard.
    if(modeWizard.classList.contains('pwreset')&&pwr.origin==='dashboard'){
      leavePwReset();
      backBtn.querySelector('span').setAttribute('data-i18n','auth_back');
      backBtn.querySelector('span').textContent=t('auth_back');
      setChrome(false);
      closeAuth();
      requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
      return;
    }
    // 1er retour : si la liste des plans est ouverte, on la replie
    if(planPick.classList.contains('on')){
      planPick.classList.remove('on');
      document.getElementById('wizRecap').style.display='';
      return;
    }
    // sinon on revient a l'ecran d'ou l'on vient (dashboard le plus souvent)
    const cameFromDash=!!renewFrom;
    renewMode=false;
    setChrome(false);
    modeWizard.classList.remove('renew');
    closeAuth();
    if(cameFromDash){
      renewFrom=false;
      requestAnimationFrame(()=>{if(window.VB_openDash)window.VB_openDash();});
    }
  });
  page.addEventListener('click',ev=>{
    if(ev.target!==page)return;
    if(modeWizard.classList.contains('pwreset')&&pwr.origin==='dashboard'){backBtn.click();return;}
    closeAuth();
  });
  document.addEventListener('keydown',ev=>{
    if(ev.key!=='Escape'||!page.classList.contains('open'))return;
    // Meme regle que le bouton : Echap ne doit jamais sortir directement
    // vers la page d'accueil depuis la reinitialisation de mot de passe
    // ouverte depuis le Dashboard.
    if(modeWizard.classList.contains('pwreset')&&pwr.origin==='dashboard'){
      backBtn.click();
      return;
    }
    closeAuth();
  });
  document.querySelectorAll('[data-auth-tab],[data-auth-switch]').forEach(b=>{
    const target=b.dataset.authTab||b.dataset.authSwitch;
    b.addEventListener('click',()=>{
      if(target==='login'){showMode('login')}
      else{showMode('wizard');showStep(pageDe(signupEntry()))}
    });
  });
  document.querySelectorAll('.field-eye').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const input=btn.previousElementSibling;
      input.type=input.type==='password'?'text':'password';
    });
  });

  // Reafficher les libelles dynamiques apres un changement de langue
  document.addEventListener('vb:langchange',()=>{
    renderResume();
    if(document.getElementById('wizStep3').classList.contains('on'))renderStep3();
    if(document.getElementById('wizStep4').classList.contains('on'))renderStep4();
  });

  window.VB_getState=()=>state;
  window.VB_planById=planById;
  // CORRIGÉ (31/08 v8, cause racine du "reste toujours 7 jours") : le nom
  // affiché d'un plan ("VIP 7 JOU") était un texte de traduction STATIQUE
  // (pl.nameKey), totalement déconnecté du vrai duration_days en base —
  // changer le nombre de jours ne changeait donc JAMAIS ce texte, nulle
  // part sur le site, même une fois la synchronisation prix/durée en place.
  // Cette fonction devient l'UNIQUE source de vérité pour le nom affiché :
  // calculée depuis la vraie valeur pl.days pour les plans à durée (jamais
  // du texte fige), sauf le Lifetime (days=null), dont le nom reste fixe
  // car il n'a pas de decompte de jours a refleter. Exposee globalement
  // car utilisee par plusieurs IIFE distincts (wizard, dashboard, admin —
  // chacun a son propre "t" local mais partage translations/currentLang).
  window.VB_planLabel=pl=>{
    if(!pl)return '';
    if(pl.days==null)return t(pl.nameKey);        // Lifetime : nom fixe
    return t('plan_name_days').replace('{n}',pl.days);
  };
  window.VB_allPlans=()=>PLANS;
  // Utilise par le bootstrap de restauration au chargement de la page :
  // vrai uniquement si le parcours est reellement termine (email verifie,
  // paiement au moins tente) — jamais base sur une simple presence de
  // donnees locales sans verification.
  window.VB_dashboardReady=()=>requiredStep(state)===4;
  /* CORRECTIF (acces automatique apres action admin) : au chargement de
     la page (F5, pas une nouvelle connexion), quelqu'un dont l'inscription
     est terminee mais qui n'a localement jamais eu de plan (paid=false)
     reste bloque hors du Dashboard meme si un admin vient de lui activer
     un plan directement (changerPlanAdmin). Cette fonction verifie une
     seule fois aupres de Supabase si un abonnement actif/en attente existe
     REELLEMENT pour cette session, et ouvre le Dashboard automatiquement
     si c'est le cas — jamais autrement, jamais en devinant. */
  window.VB_reprendreApresAdmin=async function(sessionUser){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!sessionUser)return;
    try{
      const {data:subs}=await sb.from('subscriptions')
        .select('plan_id,status,starts_at,expires_at')
        .eq('user_id',sessionUser.id).in('status',['active','pending'])
        .order('starts_at',{ascending:false});
      if(!subs||!subs.length)return;   // rien de reel : la page d'accueil normale reste correcte
      const actif=subs.find(x=>x.status==='active')||null;
      const pendant=subs.find(x=>x.status==='pending')||null;
      const retenu=actif||pendant;
      if(!retenu)return;
      const meta=sessionUser.user_metadata||{};
      state=Object.assign(blank(),{
        step:4, started:false,
        email:sessionUser.email, fullname:(state&&state.fullname)||meta.username||'',
        site:(state&&state.site)||meta.preferred_site||'paryajpam',
        supabaseUserId:sessionUser.id, emailVerified:true,
        planId:retenu.plan_id, paid:true,
        payStatus:actif?'confirmed':'pending',
        startDate:retenu.starts_at, endDate:retenu.expires_at,
        pendingPlanId:(actif&&pendant&&pendant.plan_id!==actif.plan_id)?pendant.plan_id:null
      });
      save();
      if(window.VB_openDash)window.VB_openDash();
    }catch(e){ /* injoignable : la personne reste sur la page d'accueil, rien de casse */ }
  };
  /* Synchronise prix/duree REELS depuis Supabase au demarrage. Ne touche
     jamais nameKey/perKey/feats/popular (purement presentation, pas en
     base) — seulement prix et days, qui pilotent l'argent reel partout
     (recap paiement, montant ecrit dans payments, tableau de bord,
     editeur admin). Si Supabase est injoignable, les valeurs locales
     integrees au fichier servent de repli automatique, sans jamais
     bloquer l'affichage. */
  window.VB_syncPlansFromSupabase=async function(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return false;
    try{
      const {data,error}=await sb.from('plans').select('id,name,price_htg,price_before_htg,duration_days,rank');
      if(error||!data)return false;
      let changed=false;
      data.forEach(row=>{
        const local=PLANS.find(p=>p.id===row.id);
        if(local&&(local.prix!==row.price_htg||local.days!==row.duration_days||local.prixAvant!==row.price_before_htg)){
          local.prix=row.price_htg;
          local.days=row.duration_days;
          local.prixAvant=row.price_before_htg!=null?row.price_before_htg:local.prixAvant;
          changed=true;
        }
      });
      if(changed){
        syncerCartesTarifsLanding();syncerSimulateurFormules();
        // CHANGÉ (31/08 v7, demande explicite de James : "lorsque admin
        // modifie les jours/prix des plans, sur la page de paiement où
        // l'utilisateur choisit son plan, ça doit aussi se synchroniser,
        // et ainsi de suite pour chaque changement") — AVANT, seules les
        // cartes tarifaires de la landing page et le simulateur étaient
        // rafraîchis ; l'étape 3 de l'inscription/renouvellement (choix du
        // plan à payer) et le récapitulatif final (étape 4) ne l'étaient
        // JAMAIS, même si la personne les avait déjà sous les yeux au
        // moment du changement admin.
        if(document.getElementById('wizStep3')&&document.getElementById('wizStep3').classList.contains('on'))renderStep3();
        if(document.getElementById('wizStep4')&&document.getElementById('wizStep4').classList.contains('on'))renderStep4();
      }
      return changed;
    }catch(e){return false;}
  };
  /* Synchronisation EN DIRECT pendant que la personne est sur la page de
     paiement (etape 3) — sans ca, un changement admin fait PENDANT
     qu'elle regarde deja cette page ne serait visible qu'au prochain
     chargement. Meme principe que le Dashboard (Realtime + polling de
     secours, voir demarrerRealtime/demarrerResyncPeriodique) : Realtime
     est reactif immediatement, le polling 20s garantit qu'on ne reste
     jamais desynchronise plus longtemps meme si Realtime tombe en
     arriere-plan mobile. Demarre a l'entree de l'etape 3, stoppe des
     qu'on la quitte (change d'etape ou ferme le parcours) — jamais actif
     ailleurs, pour ne rien consommer inutilement. */
  let wizPlansChannel=null, wizPlansPollTimer=null;
  function demarrerSyncPlansWizard(){
    arreterSyncPlansWizard();
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(sb&&sb.channel){
      try{
        wizPlansChannel=sb.channel('wiz-plans-'+Date.now())
          .on('postgres_changes',{event:'UPDATE',schema:'public',table:'plans'},()=>{
            window.VB_syncPlansFromSupabase();
          })
          .subscribe();
      }catch(e){}
    }
    wizPlansPollTimer=setInterval(()=>{window.VB_syncPlansFromSupabase();},20000);
  }
  function arreterSyncPlansWizard(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(wizPlansChannel&&sb&&sb.removeChannel){try{sb.removeChannel(wizPlansChannel);}catch(e){}}
    wizPlansChannel=null;
    if(wizPlansPollTimer){clearInterval(wizPlansPollTimer);wizPlansPollTimer=null;}
  }
  /* Met a jour le prix REEL, le prix barre (si defini par l'admin) et la
     duree affiches sur les cartes de la page d'accueil. Le prix barre
     n'est touche QUE si l'admin en a explicitement defini un — sinon le
     texte deja integre au fichier reste affiche tel quel (repli). Le
     selecteur est volontairement limite a la section #abonnements : le
     simulateur, plus haut sur la page, utilise desormais lui aussi
     data-plan, il ne faut jamais confondre les deux. */
  function syncerCartesTarifsLanding(){
    (window.VB_allPlans?window.VB_allPlans():[]).forEach(pl=>{
      const btn=document.querySelector('#abonnements [data-plan="'+pl.id+'"]');
      const carte=btn&&btn.closest('.plan');
      if(!carte)return;
      // CORRIGÉ (31/08 v8) : le TITRE de la carte ("VIP 7 JOURS") n'était
      // jamais mis à jour ici — seuls le prix et la ligne "X jours d'accès"
      // l'étaient, laissant un titre figé en contradiction directe avec le
      // reste de la carte des qu'un admin changeait la durée.
      if(pl.days){
        const titreEl=carte.querySelector('.plan-top h3');
        if(titreEl){
          titreEl.removeAttribute('data-i18n');
          titreEl.textContent=window.VB_planLabel(pl);
        }
      }
      const prixEl=carte.querySelector('.prix');
      if(prixEl){
        const old=prixEl.querySelector('.prix-old');
        if(old&&pl.prixAvant){
          old.innerHTML=money(pl.prixAvant)+' <small>Gdes</small>';
        }
        prixEl.innerHTML='';
        if(old)prixEl.appendChild(old);
        prixEl.appendChild(document.createTextNode(money(pl.prix)+' '));
        const small=document.createElement('small');
        small.textContent='HTG';
        prixEl.appendChild(small);
      }
      // La duree n'est reecrite QUE pour les plans avec un nombre de
      // jours reel — le texte du Lifetime ("acces a vie") est qualitatif,
      // jamais un decompte de jours, donc jamais touche ici.
      if(pl.days){
        const perEl=carte.querySelector('.per');
        if(perEl){
          perEl.removeAttribute('data-i18n');
          perEl.textContent=t('plan_per_days').replace('{n}',pl.days);
        }
      }
    });
  }
  /* Synchronise le simulateur ("Essayer la demo") : le nom de chaque
     formule (ex. "VIP 7 JOU") reflete la VRAIE duree du plan. La cote
     illustrative (data-cote) n'a pas de formule mathematique reliee au
     prix/duree — elle reste telle quelle, c'est un exemple, pas un vrai
     calcul. Le Lifetime n'apparait jamais ici : la formule "X JOU" n'a
     pas de sens pour un acces a vie. */
  function syncerSimulateurFormules(){
    (window.VB_allPlans?window.VB_allPlans():[]).forEach(pl=>{
      if(!pl.days)return;   // exclut Lifetime automatiquement
      const btn=document.querySelector('.sim2-formule[data-plan="'+pl.id+'"]');
      if(!btn)return;
      const nomEl=btn.querySelector('.f2-name');
      const nouveauNom='VIP '+pl.days+' JOU';
      if(nomEl)nomEl.textContent=nouveauNom;
      btn.dataset.formule=nouveauNom;
      // Si cette formule est actuellement affichee dans le resultat, on
      // rafraichit aussi son libelle la-bas — sinon elle resterait perimee
      // jusqu'au prochain clic.
      const badge=document.getElementById('s2-formule');
      if(badge&&btn.classList.contains('on'))badge.textContent=nouveauNom;
    });
  }
  // Lancement au chargement : discret, jamais bloquant. Reessaie aussi
  // apres le chargement complet de la page (le script Supabase, differe,
  // peut ne pas etre pret au tout premier appel) — sans ce filet, un
  // premier echec silencieux ne se corrigeait plus jamais tout seul.
  window.VB_syncPlansFromSupabase();
  window.addEventListener('load',()=>{window.VB_syncPlansFromSupabase();});
  // Le simulateur doit refleter les vraies durees des le premier
  // affichage, pas seulement apres un changement ulterieur.
  syncerSimulateurFormules();
  // Reappliquer au changement de langue (le texte de duree, genere
  // dynamiquement, ne beneficie plus de la traduction automatique du DOM
  // une fois son attribut data-i18n retire).
  document.addEventListener('vb:langchange',()=>{syncerCartesTarifsLanding();});

  /* Panneau FAQ dedie : remplace le contenu par les entrees reelles de
     Supabase, UNIQUEMENT si la lecture reussit et renvoie au moins une
     ligne. En cas d'echec ou d'absence de donnees, le contenu statique
     deja present dans le HTML reste affiche tel quel — jamais de panneau
     vide. */
  window.VB_renderFAQ=async function(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const list=document.getElementById('faqpageList');
    if(!sb||!list)return;
    try{
      const {data,error}=await sb.from('faq')
        .select('question_ht,question_fr,question_en,answer_ht,answer_fr,answer_en,display_order,is_published')
        .eq('is_published',true).order('display_order',{ascending:true});
      if(error||!data||!data.length)return;
      const lang=(currentLang==='en'||currentLang==='ht')?currentLang:'fr';
      list.innerHTML=data.map((f,i)=>{
        const q=stripTags(f['question_'+lang]||f.question_fr||'');
        const a=stripTags(f['answer_'+lang]||f.answer_fr||'');
        return '<details'+(i===0?' open':'')+'>'+
          '<summary><span>'+q+'</span>'+
          '<span class="pl"><svg class="ic" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></span>'+
          '</summary><p>'+a+'</p></details>';
      }).join('');
    }catch(e){ /* le contenu statique deja present reste affiche */ }
  };
  window.VB_renderFAQ();
  window.addEventListener('load',()=>{window.VB_renderFAQ();});
  document.addEventListener('vb:langchange',()=>{window.VB_renderFAQ();});

  window.VB_isExpired=()=>subscriptionExpired(state);
  window.VB_isPending=()=>!!(state&&state.paid&&state.payStatus==='pending');
  // "Bientot expire" = dans la fenetre de rappel de renouvellement (memes
  // seuils que RENEW_SEUIL/enPeriodeDeFin), mais PAS encore reellement
  // expire — utilise uniquement pour choisir le bon message sur la page
  // Mon Abonnement (voir renderSub), sans dupliquer la logique de seuils.
  window.VB_inRenewWindow=()=>enPeriodeDeFin(state)&&!subscriptionExpired(state);
  // 'rejected' = un paiement a existe mais n'a jamais ete confirme (refuse
  // par l'admin, ou plus aucun paiement confirme en base). Distinct d'une
  // veritable expiration (plan qui A ete confirme, puis dont la date est
  // depassee) — les deux verrouillent le contenu, mais le message montre a
  // la personne doit etre different (voir renderSub / dash_sub_rejected).
  window.VB_isRejected=()=>!!(state&&state.paid&&state.payStatus==='rejected');
  /* Rafraichissement silencieux : verifie si un admin a valide/refuse le
     paiement depuis la derniere visite, sans jamais bloquer l'affichage.
     Ne fait rien si le compte n'est pas rattache a Supabase (compte
     pre-migration, ou hors ligne) — degrade proprement dans ce cas. */
  /* CORRECTIF IMPORTANT : cette fonction ne doit JAMAIS se fier au
     "dernier abonnement" de la personne — une ancienne ligne orpheline
     (ex. un test anterieur, ou une ecriture qui a echoue puis reussi
     plus tard) pourrait alors etre confondue avec le paiement EN COURS
     et debloquer le contenu a tort. On va chercher, via la reference
     unique de CE paiement precis (state.ref), le paiement qui lui
     correspond exactement — jamais un autre. */
  window.VB_syncPayStatus=async function(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!state.paid)return false;
    let changed=false;
    try{
      /* CORRECTIF SYNCHRONISATION (prioritaire) : avant tout le reste, on
         relit l'etat REEL des abonnements de cette personne directement
         par son identifiant Supabase. C'est la seule maniere de detecter
         un changement fait par un admin SANS paiement associe
         (changerPlanAdmin) — un tel changement n'est rattache a aucune
         reference locale (ref/pendingRef) et ne serait donc jamais vu par
         les blocs bases sur les references, plus bas. Cette lecture fait
         TOUJOURS autorite sur planId/dates/payStatus/pendingPlanId :
         aucun etat local ne doit pouvoir la remplacer. */
      if(state.supabaseUserId){
        const {data:subsUid}=await sb.from('subscriptions')
          .select('plan_id,status,starts_at,expires_at')
          .eq('user_id',state.supabaseUserId).in('status',['active','pending'])
          .order('starts_at',{ascending:false});
        if(subsUid&&subsUid.length){
          const actifUid=subsUid.find(x=>x.status==='active')||null;
          const pendUid=subsUid.find(x=>x.status==='pending')||null;
          if(actifUid){
            // Le plan actif reel fait toujours foi. Un "pending" ne
            // compte comme changement en attente que s'il differe du
            // plan actif — sinon (meme plan) on l'ignore ici.
            let changementUid=null;
            if(pendUid&&pendUid.plan_id!==actifUid.plan_id){
              // CORRECTIF : le statut de l'abonnement seul ne suffit jamais a
              // decider d'afficher ce message — seul un PAIEMENT reellement
              // 'pending' en base, pour ce meme plan, l'autorise. Sans cette
              // verification, un abonnement reste "pending" alors que son
              // paiement a deja ete confirme/refuse (incoherence deja
              // rencontree) ferait reapparaitre ce message a tort, meme
              // apres un refresh.
              try{
                const {data:payPendUid}=await sb.from('payments')
                  .select('id').eq('user_id',state.supabaseUserId)
                  .eq('status','pending').eq('plan_id',pendUid.plan_id).limit(1);
                if(payPendUid&&payPendUid.length)changementUid=pendUid.plan_id;
              }catch(e){}
            }
            if(actifUid.plan_id!==state.planId||actifUid.starts_at!==state.startDate||
               actifUid.expires_at!==state.endDate||state.payStatus!=='confirmed'||
               state.pendingPlanId!==changementUid){
              state.planId=actifUid.plan_id;
              state.startDate=actifUid.starts_at;
              state.endDate=actifUid.expires_at;
              state.paid=true;
              state.payStatus='confirmed';
              state.pendingPlanId=changementUid;
              if(!changementUid){state.pendingRef=null;}
              changed=true;
            }
          }else if(pendUid&&(!state.paid||state.payStatus!=='pending'||pendUid.plan_id!==state.planId)){
            // Aucun plan actif : seule une premiere souscription encore en
            // attente de validation admin existe pour cette personne.
            state.planId=pendUid.plan_id;
            state.startDate=pendUid.starts_at;
            state.endDate=pendUid.expires_at;
            state.paid=true;
            state.payStatus='pending';
            state.pendingPlanId=null;
            changed=true;
          }
        }else if(state.planId||state.pendingPlanId){
          /* Plus AUCUN abonnement actif ni en attente en base, alors que
             l'etat local en affiche encore un : l'admin vient d'annuler
             ou de refuser, ou l'abonnement est arrive a son terme.
             L'acces au Dashboard reste ouvert (paid inchange), mais le
             badge repasse a "Aucun plan" et les contenus lies au plan se
             verrouillent — l'etat local ne doit jamais survivre a la base.
             CORRECTIF : on distingue ici aussi "vraiment expire" (dernier
             paiement confirme) de "jamais confirme / refuse" (dernier
             paiement failed) — jamais de date inventee pour forcer une
             fausse expiration, voir le meme correctif au login. */
          let dernierPaiementConfirme=false, dateFinReelle=null;
          try{
            const {data:dpays}=await sb.from('payments')
              .select('status,subscription_id').eq('user_id',state.supabaseUserId)
              .order('created_at',{ascending:false}).limit(1);
            if(dpays&&dpays.length&&dpays[0].status==='confirmed'){
              dernierPaiementConfirme=true;
              if(dpays[0].subscription_id){
                const {data:dsub}=await sb.from('subscriptions')
                  .select('expires_at').eq('id',dpays[0].subscription_id).single();
                if(dsub)dateFinReelle=dsub.expires_at;
              }
            }
          }catch(e){}
          state.planId=null;
          state.pendingPlanId=null;
          state.pendingRef=null;
          state.payStatus=dernierPaiementConfirme?'confirmed':'rejected';
          state.startDate=null;
          state.endDate=dernierPaiementConfirme?(dateFinReelle||new Date(Date.now()-1000).toISOString()):null;
          changed=true;
        }
      }else{
        /* CORRECTIF (empeche l'ecrasement du resultat ci-dessus) : ces deux
           blocs bases sur state.ref/state.pendingRef ne s'executent
           desormais QUE si l'identifiant Supabase est absent (cas rare,
           quasiment jamais en pratique). Auparavant ils s'executaient
           TOUJOURS, meme apres le bloc ci-dessus — et state.ref pouvait
           pointer sur un paiement DEJA REFUSE (ancien changement de plan
           rejete), ce qui repassait a tort payStatus a 'rejected' et
           faisait perdre l'acces a un plan pourtant toujours actif et
           confirme. Le bloc ci-dessus est deja la source de verite
           complete (plan actif, changement en attente, ou aucun des deux) :
           le refaire via des references locales, potentiellement perimees,
           ne peut plus qu'introduire des incoherences. */
        // Cas normal : le paiement du plan reellement actif (premiere
        // souscription, ou renouvellement direct sans changement en cours).
        if(state.ref&&!state.pendingRef){
          const {data:pays}=await sb.from('payments')
            .select('status,subscription_id,plan_id')
            .eq('reference',state.ref).limit(1);
          if(pays&&pays.length){
            const pay=pays[0];
            const nouveau=pay.status==='confirmed'?'confirmed':(pay.status==='failed'||pay.status==='refunded'?'rejected':'pending');
            if(nouveau!==state.payStatus){
              state.payStatus=nouveau;
              if(nouveau==='confirmed'&&pay.subscription_id){
                try{
                  const {data:sub}=await sb.from('subscriptions')
                    .select('plan_id,starts_at,expires_at')
                    .eq('id',pay.subscription_id).single();
                  if(sub){state.planId=sub.plan_id;state.startDate=sub.starts_at;state.endDate=sub.expires_at;}
                }catch(e){}
              }
              changed=true;
            }
          }
        }
        // Cas changement en attente : le plan actif ne bouge pas tant que
        // CE paiement-la (separe) n'est pas confirme.
        if(state.pendingRef){
          const {data:pays2}=await sb.from('payments')
            .select('status,subscription_id,plan_id')
            .eq('reference',state.pendingRef).limit(1);
          if(pays2&&pays2.length){
            const pay2=pays2[0];
            if(pay2.status==='confirmed'&&pay2.subscription_id){
              try{
                const {data:sub2}=await sb.from('subscriptions')
                  .select('plan_id,starts_at,expires_at')
                  .eq('id',pay2.subscription_id).single();
                if(sub2){
                  state.planId=sub2.plan_id;
                  state.startDate=sub2.starts_at;
                  state.endDate=sub2.expires_at;
                  state.payStatus='confirmed';
                  state.ref=state.pendingRef;
                  state.pendingPlanId=null;
                  state.pendingRef=null;
                  changed=true;
                }
              }catch(e){}
            }else if(pay2.status==='failed'||pay2.status==='refunded'){
              state.pendingPlanId=null;
              state.pendingRef=null;
              changed=true;
            }
          }
        }
      }
      if(changed)save();
      return changed;
    }catch(e){return false;}
  };
  /* Renouvellement / changement de plan : on ouvre DIRECTEMENT la page
     de paiement. Aucun retour par la creation de compte ni la
     verification e-mail, qui sont deja faites. */
  window.VB_openWizardPay=function(from,fromDashboard){
    const need=requiredStep(state);
    if(need<3){openAuth('wizard',from,need);return;}   // parcours encore incomplet
    // Aucun deuxieme paiement tant que le premier attend confirmation admin.
    if(state.paid&&state.payStatus==='pending'){
      if(window.VB_toast)window.VB_toast('pending_toast_h',t('renew_err_pending'));
      return;
    }
    // Le Lifetime ne se renouvelle jamais
    if(state.paid&&state.planId==='p4'){
      if(window.VB_toast)window.VB_toast('renew_toast_h',t('renew_err_lifetime'));
      return;
    }
    renewFrom=fromDashboard!==false;
    openRenew(from);
  };

  renderResume();
})();

// ---------- Selecteur de langue du pied de page ----------
(function(){
  // Un seul systeme pour tous les selecteurs : pied de page, pages
  // d'authentification et dashboard. Tous appellent le meme applyLang.
  const list=[...document.querySelectorAll('.langdd')];
  if(!list.length)return;
  const closeAll=()=>list.forEach(dd=>{
    dd.classList.remove('on');
    const b=dd.querySelector('.langdd-btn');
    if(b)b.setAttribute('aria-expanded','false');
  });
  list.forEach(dd=>{
    const btn=dd.querySelector('.langdd-btn');
    if(!btn)return;
    btn.addEventListener('click',ev=>{
      ev.stopPropagation();
      const wasOn=dd.classList.contains('on');
      closeAll();
      if(!wasOn){dd.classList.add('on');btn.setAttribute('aria-expanded','true');}
    });
    dd.querySelectorAll('.langdd-opt').forEach(o=>{
      o.addEventListener('click',()=>{applyLang(o.dataset.lang);closeAll();});
    });
  });
  document.addEventListener('click',ev=>{
    if(!list.some(dd=>dd.contains(ev.target)))closeAll();
  });
  document.addEventListener('keydown',ev=>{if(ev.key==='Escape')closeAll();});
})();

// ---------- Dashboard ----------
(function(){
  const dash=document.getElementById('dash');
  if(!dash)return;

  const T=()=>translations[currentLang]||translations.fr;
  const t=k=>(T()[k]!=null?T()[k]:(translations.fr[k]||''));
  const money=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');
  const rank={p1:1,p2:2,p3:3,p4:4};

  /* ============================================================
     SOURCE DE DONNEES — la base Supabase, et elle seule.
     Toute la vue ne lit que DATA.tickets, rempli uniquement par
     chargerFichesReelles() a partir des fiches PUBLIEES en base.
     Aucune fiche, aucune cote, aucun horaire n'est ecrit en dur ici :
     si la base ne repond pas, le Dashboard le dit — il n'invente rien.
     ============================================================ */
  const DATA={
    tickets:[],
    notifications:[]   // alimente dynamiquement, voir construireNotifs()
  };
  /* Etat du dernier chargement : 'attente' | 'ok' | 'erreur'. Permet de
     distinguer "aucune fiche publiee" (normal) de "la base n'a pas
     repondu" (anormal) — deux messages differents, jamais un ecran vide
     sans explication. */
  let etatFiches='attente';

  /* ============================================================
     FUSEAU HORAIRE OFFICIEL DU SITE : HAITI (America/Port-au-Prince)
     ------------------------------------------------------------
     Toutes les heures et toutes les dates du Dashboard sont celles
     d'Haiti, JAMAIS celles de l'appareil : une personne qui ouvre le
     site depuis Montreal, Paris ou Miami doit lire exactement les
     memes horaires qu'a Port-au-Prince.
     L'instant reel du coup d'envoi est stocke en base
     (ticket_legs.kickoff_at) : on ne fait que le reexprimer ici.
     ============================================================ */
  const TZ_HAITI='America/Port-au-Prince';
  /* Repli si le navigateur ne connait pas les fuseaux IANA (tres ancien) :
     Haiti applique l'heure d'ete du 2e dimanche de mars au 1er dimanche
     de novembre (UTC-4), et UTC-5 le reste de l'annee. */
  function decalageHaitiSecours(d){
    const a=d.getUTCFullYear();
    const dim=(an,mois,n)=>{const x=new Date(Date.UTC(an,mois,1));
      const dec=(7-x.getUTCDay())%7;return new Date(Date.UTC(an,mois,1+dec+(n-1)*7,7,0,0));};
    return (d>=dim(a,2,2)&&d<dim(a,10,1))?-4:-5;
  }
  /* Date ('AAAA-MM-JJ') et heure ('HH:MM') haitiennes d'un instant donne. */
  function partsHaiti(d){
    try{
      const f=new Intl.DateTimeFormat('en-CA',{timeZone:TZ_HAITI,year:'numeric',month:'2-digit',
        day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
      const o={};f.formatToParts(d).forEach(p=>{o[p.type]=p.value;});
      if(!o.year)throw new Error('tz');
      return {iso:o.year+'-'+o.month+'-'+o.day,heure:(o.hour==='24'?'00':o.hour)+':'+o.minute};
    }catch(e){
      const x=new Date(d.getTime()+decalageHaitiSecours(d)*3600000);
      const p2=n=>String(n).padStart(2,'0');
      return {iso:x.getUTCFullYear()+'-'+p2(x.getUTCMonth()+1)+'-'+p2(x.getUTCDate()),
              heure:p2(x.getUTCHours())+':'+p2(x.getUTCMinutes())};
    }
  }
  const aujourdHuiHaiti=()=>partsHaiti(new Date()).iso;
  // Partagee avec le reste de la page (bandeau de preuves de l'accueil) :
  // une seule definition du "jour", celui d'Haiti.
  window.VB_dateHaiti=aujourdHuiHaiti;
  const minuitHaitiMs=iso=>Date.parse(iso+'T00:00:00Z');
  /* Nombre de jours (haitiens) entre une date de jeu et aujourd'hui. */
  function ecartJoursHaiti(isoJour){
    const a=minuitHaitiMs(isoJour),b=minuitHaitiMs(aujourdHuiHaiti());
    if(isNaN(a)||isNaN(b))return 0;
    return Math.round((b-a)/86400000);
  }
  /* La base renvoie l'instant au format ISO ('...T20:30:00+00:00'). On
     tolere aussi les variantes ('... 20:30:00+00') pour ne jamais perdre
     une heure a cause d'un simple ecart de format. */
  function instantDeLeg(v){
    if(!v)return null;
    let d=new Date(v);
    if(!isNaN(d.getTime()))return d;
    d=new Date(String(v).replace(' ','T').replace(/([+-]\d{2})$/,'$1:00'));
    return isNaN(d.getTime())?null:d;
  }
  // Compte à rebours (29/08) : texte court avant le coup d'envoi du
  // prochain match d'une fiche. jamais de precision a la seconde (inutile,
  // ne fait que forcer des re-rendus frequents) -- granularite en minutes,
  // puis en heures au-dela d'1h, puis en jours au-dela de 24h.
  function texteCompteARebours(iso){
    const d=instantDeLeg(iso);
    if(!d)return '';
    const ms=d.getTime()-Date.now();
    if(ms<=0)return t('dtk_cd_encours');
    const minutes=Math.round(ms/60000);
    if(minutes<1)return t('dtk_cd_bientot');
    if(minutes<60)return t('dtk_cd_min').replace('{n}',minutes);
    const heures=Math.floor(minutes/60);
    if(heures<24)return t('dtk_cd_h').replace('{h}',heures).replace('{m}',minutes%60);
    const jours=Math.floor(heures/24);
    return t('dtk_cd_j').replace('{j}',jours);
  }

  // ============================================================
  // PARTAGE WHATSAPP D'UN TICKET GAGNANT (29/08)
  // ------------------------------------------------------------
  // Genere une image (canvas 2D, aucune librairie externe) puis ouvre le
  // partage natif du telephone (Web Share API, niveau 2 -- fichiers) : la
  // liste d'apps proposee par le systeme inclut WhatsApp sans qu'on ait a
  // le cibler nous-memes. Repli propre si le navigateur ne sait pas
  // partager de fichier (rare sur mobile recent, plus frequent sur
  // desktop) : telechargement direct de l'image a la place.
  // ============================================================
  async function genererImageTicketGagnant(tk){
    const W=1080,H=1350;
    const cv=document.createElement('canvas');
    cv.width=W;cv.height=H;
    const ctx=cv.getContext('2d');

    // Fond degrade sombre, meme esprit que la charte (noir/vert/or).
    const grad=ctx.createLinearGradient(0,0,0,H);
    grad.addColorStop(0,'#030617');grad.addColorStop(1,'#0A1224');
    ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);

    // Bandeau superieur.
    ctx.fillStyle='#C9A44C';
    ctx.font='700 30px sans-serif';
    ctx.textAlign='center';
    ctx.fillText('VIP BETCOTE',W/2,90);
    ctx.fillStyle='#2ED47F';
    ctx.font='800 54px sans-serif';
    ctx.fillText('✅ '+t('dtk_share_titre'),W/2,160);

    // Liste des selections (jusqu'a 8 lignes, puis "+N autres" pour ne
    // jamais deborder du cadre quel que soit le nombre de legs).
    const legs=(tk.legs||[]).filter(l=>l.result!=='void');
    const MAX=8;
    let y=250;
    ctx.textAlign='left';
    legs.slice(0,MAX).forEach(lg=>{
      ctx.fillStyle='rgba(255,255,255,.05)';
      ctx.fillRect(60,y-38,W-120,74);
      ctx.fillStyle='#F4F3ED';
      ctx.font='700 26px sans-serif';
      ctx.fillText(tronqueTexte(lg.match||'',44),85,y-4);
      ctx.fillStyle='#9AA7BD';
      ctx.font='400 22px sans-serif';
      const pickTxt=String(lg.pick||'').replace(/^Victoire\s*:\s*Home$/i,'Victoire : 1').replace(/^Victoire\s*:\s*Away$/i,'Victoire : 2');
      ctx.fillText(tronqueTexte(pickTxt,40),85,y+26);
      ctx.fillStyle='#E8CE8A';
      ctx.font='800 26px sans-serif';
      ctx.textAlign='right';
      ctx.fillText(Number(lg.odd).toFixed(2),W-85,y+2);
      ctx.textAlign='left';
      y+=92;
    });
    if(legs.length>MAX){
      ctx.fillStyle='#9AA7BD';
      ctx.font='400 22px sans-serif';
      ctx.textAlign='center';
      ctx.fillText(t('dtk_share_plus').replace('{n}',legs.length-MAX),W/2,y+10);
      ctx.textAlign='left';
      y+=50;
    }

    // Cote totale, en grand.
    y+=40;
    ctx.textAlign='center';
    ctx.fillStyle='#9AA7BD';
    ctx.font='700 24px sans-serif';
    ctx.fillText(t('dash_totalodd').toUpperCase(),W/2,y);
    ctx.fillStyle='#2ED47F';
    ctx.font='800 96px sans-serif';
    ctx.fillText(totalOdd(tk).toFixed(2),W/2,y+110);

    // Pied : mention responsable, jamais omise meme sur une image de partage.
    ctx.fillStyle='#7C8CA0';
    ctx.font='400 20px sans-serif';
    ctx.fillText(t('dtk_share_mention'),W/2,H-60);

    return new Promise(resolve=>cv.toBlob(resolve,'image/png',0.95));
  }
  function tronqueTexte(s,max){
    return s.length>max?s.slice(0,max-1)+'…':s;
  }
  async function partagerTicketGagnant(tk){
    try{
      const blob=await genererImageTicketGagnant(tk);
      if(!blob)throw new Error('image');
      const fichier=new File([blob],'vip-betcote-ticket.png',{type:'image/png'});
      if(navigator.canShare&&navigator.canShare({files:[fichier]})){
        await navigator.share({files:[fichier],title:'VIP BETCOTE',text:t('dtk_share_texte')});
      }else{
        // Repli (29/08) : navigateur sans partage de fichier (surtout
        // desktop) -- telechargement direct plutot que rien.
        const url=URL.createObjectURL(blob);
        const a=document.createElement('a');
        a.href=url;a.download='vip-betcote-ticket.png';
        document.body.appendChild(a);a.click();a.remove();
        setTimeout(()=>URL.revokeObjectURL(url),4000);
      }
    }catch(e){
      // L'utilisateur a simplement annule le partage (AbortError) --
      // jamais une erreur a signaler. Toute autre erreur reste silencieuse
      // ici (generation d'image cote client, rien de critique en jeu).
    }
  }

  /* Heure d'un match, toujours a l'heure d'Haiti. 'jour' reste vide quand
     le match tombe bien le jour de la fiche, et porte la date (JJ/MM)
     quand l'heure haitienne tombe la veille ou le lendemain — sans ca,
     un match du samedi soir range dans la fiche du dimanche (heure UTC)
     serait illisible. */
  function heureAffichee(l,playDate){
    let d=instantDeLeg(l.kickoff_at);
    if((!d||isNaN(d.getTime()))&&l.match_time&&/^\d{1,2}:\d{2}$/.test(l.match_time)){
      d=new Date(playDate+'T'+(l.match_time.length===4?'0':'')+l.match_time+':00Z');
    }
    if(!d||isNaN(d.getTime()))return {heure:l.match_time||'\u2014',jour:''};
    const p=partsHaiti(d);
    return {heure:p.heure,jour:(p.iso===playDate?'':p.iso.slice(8,10)+'/'+p.iso.slice(5,7))};
  }

  /* Cote totale : le produit des selections quand elles sont lisibles,
     sinon l'agregat calcule par la base (fiche verrouillee par le plan,
     dont les selections ne descendent jamais jusqu'ici). */
  const totalOdd=tk=>(tk.legs&&tk.legs.length)?tk.legs.reduce((a,l)=>a*l.odd,1):(tk.totalOdd||0);
  /* Indice de confiance affiche au Dashboard client (regle du 31/08, v2,
     demande explicite de James) : derive de la COTE TOTALE de la fiche,
     jamais du champ interne "confidence" saisi par l'admin/le bot — un
     combine a petite cote reste statistiquement plus fiable qu'un combine
     a cote tres elevee, quelle que soit la note interne. Bareme fixe :
       cote  1  a 30 : vert  (haut)  -- pourcentage affiche 80% a 90%
       cote  30 a 80 : jaune (moyen) -- pourcentage affiche 60% a 79%
       cote  80 a x  : rouge (bas, precaution) -- pourcentage 30% a 58%
     Interpolation lineaire a l'interieur de chaque palier (cote basse =
     pourcentage haut du palier, cote haute = pourcentage bas du palier) ;
     le palier rouge plafonne vers cote ~260 (pourcentage jamais sous 30%,
     jamais invente au hasard, toujours une fonction pure et deterministe
     de la cote reelle, identique a chaque rendu).
     Reutilise les memes cles de traduction que l'ancien systeme
     (dtk_niveau_haut/moyen/bas) -- aucun texte nouveau a ajouter. */
  function niveauSelonCote(cote){
    cote=Number(cote)||1;
    let niveau,pct;
    if(cote<=30){
      niveau='haut';
      const p=Math.max(0,Math.min(1,(cote-1)/29));
      pct=Math.round(90-p*10);
    }else if(cote<=80){
      niveau='moyen';
      const p=(cote-30)/50;
      pct=Math.round(79-p*19);
    }else{
      niveau='bas';
      const p=Math.max(0,Math.min(1,(cote-80)/180));
      pct=Math.round(58-p*28);
    }
    return {niveau:niveau,pct:pct};
  }
  /* 'day' = nombre de jours haitiens ecoules depuis la date de jeu.
     Negatif pour une fiche publiee a l'avance. */
  const dayDate=d=>new Date(minuitHaitiMs(aujourdHuiHaiti())-d*86400000);
  /* Une fiche reste dans la vue "du jour" tant qu'elle n'est pas reglee,
     et des que sa date de jeu est atteinte ou a venir.
     POURQUOI : le bot publie ses fiches sur la journee UTC, qui commence
     le soir en Haiti. Avec une simple egalite de date, une fiche publiee
     pour la journee UTC suivante restait invisible plusieurs heures, et
     une fiche de la veille encore en cours disparaissait des deux vues.
     Combinee a la vue Historique (qui prend tout ce qui est regle), cette
     regle garantit qu'aucune fiche publiee n'est jamais introuvable. */
  // 27/08 : une fiche REGLEE (won/lost) ne doit JAMAIS apparaitre a la fois
  // dans "Jodi a" et dans "Istorik" (demande explicite de James — "cela
  // devrait etre impossible"). L'ancien `|| k.day<=0` faisait qu'une fiche
  // d'aujourd'hui deja reglee restait visible ici EN PLUS de l'Historique
  // (qui prend tout ce qui n'est plus 'pending'). Desormais "Jodi a" =
  // strictement les fiches encore en attente, quelle que soit leur date —
  // et l'Historique = strictement les fiches reglees. Mutuellement
  // exclusif par construction, plus jamais de chevauchement possible.
  const estDuJour=k=>k.status==='pending';
  const fmtDate=d=>d.toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',timeZone:'UTC'});
  /* Format long "25 août 2026" pour les titres de fiche (25/08, demande
     explicite de James d'appliquer le meme format que le panneau Admin
     dans le Dashboard utilisateur — remplace l'ancien "25 août · CODE"). */
  function dateLongueDash(iso){
    if(!iso)return '';
    const d=new Date(iso+'T12:00:00Z');
    if(isNaN(d.getTime()))return iso;
    const loc={fr:'fr-FR',en:'en-GB',ht:'fr-FR'}[currentLang]||'fr-FR';
    try{
      return new Intl.DateTimeFormat(loc,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d);
    }catch(e){return iso;}
  }
  /* Deux valeurs de marché coexistent reellement en base (meme constat que
     MARCHES_SCORE_EXACT cote Admin, verifie le 25/08) : 'mk_score_l' ecrit
     par le panneau admin, et 'mk_score_exact' ecrit par le bot. */
  const MARCHES_SCORE_EXACT_DASH=['mk_score_l','mk_score_exact'];
  /* Trois genres possibles, meme logique que titreFiche() cote Admin :
     Basketball prime, sinon Score exact si toutes les selections en sont
     (scoreCount===legsCount), sinon Cote normal. */
  function titreFicheDash(tk){
    let genre;
    if(tk.sport==='nba'||tk.sport==='basket')genre='dash_kind_basket';
    else if(tk.scoreCount>0&&tk.legsCount>0&&tk.scoreCount===tk.legsCount)genre='dash_kind_exact';
    else genre='dash_kind_normal';
    return dateLongueDash(tk.playDate)+' — '+t(genre);
  }
  /* Badge V / X / — par selection dans le Dashboard utilisateur (25/08,
     demande explicite de James — meme indicateurs que le panneau Admin).
     won -> V vert, lost -> X rouge, void -> — (match reporte/annule,
     neutre), null -> point discret (match pas encore joue). */
  function marqueLegDash(result){
    if(result==='won') return '<span class="dtk-leg-mark won">V</span>';
    if(result==='lost')return '<span class="dtk-leg-mark lost">X</span>';
    if(result==='void')return '<span class="dtk-leg-mark void">—</span>';
    return '<span class="dtk-leg-mark none">·</span>';
  }
  const fmtLong=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'long',year:'numeric',timeZone:TZ_HAITI}):'—';
  // CORRIGÉ (02/09, bug signalé par James : "Istorik abònman" toujours vide
  // malgré des donnees confirmees en base) — stripTags etait utilisee dans
  // renderSubHistory() mais jamais definie dans cette IIFE (elle n'existe
  // que dans deux AUTRES IIFE separees du fichier, qui ne partagent pas
  // leur scope). Consequence : ReferenceError silencieusement attrape par
  // le catch(e) de renderSubHistory, affichant l'etat d'erreur generique
  // meme quand les requetes Supabase reussissaient (200 OK, vraies
  // donnees recues) — jamais un probleme de donnees ni de RLS.
  const stripTags=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent||'';};

  /* ---- Chargement des fiches : la base est la SEULE source ----
     On lit les fiches publiees (90 derniers jours) et leurs selections.
     C'est la base qui filtre elle-meme, par RLS, les selections que le
     plan actif ne couvre pas : une cote reservee ne descend JAMAIS
     jusqu'au navigateur d'une personne qui n'y a pas droit — meme en
     inspectant le reseau ou le code de la page.
     Pour ces fiches verrouillees, la base fournit quand meme les
     agregats publics (nombre de selections, cote totale) : la carte
     verrouillee reste donc fidele au design, sans exposer un seul
     pronostic.
     Retourne true des que l'affichage doit etre refait. */
  function signatureFiches(){
    return etatFiches+'|'+DATA.tickets.map(k=>[k.uid,k.status,k.legs.length,k.legsCount,
      k.totalOdd,k.conf,k.minPlan,k.playDate,k.scoreCount].join(':')).join(',');
  }
  async function chargerFichesReelles(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const avant=signatureFiches();
    if(!sb){DATA.tickets=[];etatFiches='erreur';return signatureFiches()!==avant;}
    try{
      const limiteISO=new Date(minuitHaitiMs(aujourdHuiHaiti())-90*86400000).toISOString().slice(0,10);
      const {data:fiches,error}=await sb.from('tickets')
        .select('id,code,sport,min_plan_rank,status,confidence,play_date,published,legs_count,total_odd,score_legs_count')
        .eq('published',true).gte('play_date',limiteISO)
        .order('play_date',{ascending:false}).order('min_plan_rank',{ascending:true});
      if(error)throw error;

      // Anti-doublon : une meme fiche ne doit jamais apparaitre deux fois,
      // quoi qu'il arrive cote reseau ou cote base.
      // Anti-doublon, et mise a l'ecart des fiches publiees SANS aucune
      // selection : elles n'ont rien a montrer (fiche en cours de saisie,
      // ou ecriture interrompue). Mieux vaut ne rien afficher qu'une
      // carte vide.
      const vues={},uniques=[];
      (fiches||[]).forEach(tk=>{
        if(!tk||!tk.id||vues[tk.id])return;
        if((tk.legs_count||0)===0)return;
        vues[tk.id]=1;uniques.push(tk);
      });

      let selections=[];
      if(uniques.length){
        const {data:legs,error:errLegs}=await sb.from('ticket_legs')
          .select('ticket_id,match_time,kickoff_at,league,league_country,match_label,market,pick,odd,position,result')
          .in('ticket_id',uniques.map(tk=>tk.id))
          .order('kickoff_at',{ascending:true}).order('position',{ascending:true});
        if(errLegs)throw errLegs;
        selections=legs||[];
      }
      const parFiche={};
      selections.forEach(l=>{(parFiche[l.ticket_id]=parFiche[l.ticket_id]||[]).push(l);});

      DATA.tickets=uniques.map(tk=>{
        const brut=parFiche[tk.id]||[];
        return {
          uid:tk.id,
          id:tk.code||String(tk.id).slice(0,8).toUpperCase(),
          playDate:tk.play_date,
          day:ecartJoursHaiti(tk.play_date),
          sport:tk.sport,
          minPlan:tk.min_plan_rank,
          status:tk.status,
          conf:tk.confidence!=null?tk.confidence:0,
          // Agregats publics — servent aux cartes verrouillees.
          legsCount:tk.legs_count!=null?tk.legs_count:brut.length,
          // CORRIGÉ (session suivante) : score_legs_count peut être resté à
          // 0 en base sur d'anciennes fiches pourtant 100% score exact
          // (bug identifié le 30/08 sur au moins 3 fiches déjà publiées,
          // corrigé ponctuellement en base mais ne doit plus jamais
          // ré-afficher "Cote normal" à tort même si ça se reproduit) —
          // repli sur les vrais marchés des légs, même principe défensif
          // que estFicheScoreExact() côté Admin (MARCHES_SCORE_EXACT_DASH).
          scoreCount:tk.score_legs_count>0?tk.score_legs_count
            :(brut.length&&brut.every(l=>MARCHES_SCORE_EXACT_DASH.indexOf(String(l.market||''))>-1)?brut.length:0),
          totalOdd:Number(tk.total_odd)||0,
          legs:brut.map(l=>{
            const h=heureAffichee(l,tk.play_date);
            // league_country (Phase 2, section 2, 27/08) : pays tel que
            // retourne par API-Sports, jamais invente -- null/'' pour les
            // fiches generees avant ce correctif, gere silencieusement a
            // l'affichage (pas de "(undefined)" ni de valeur inventee).
            return {time:h.heure,jour:h.jour,league:l.league||'',leagueCountry:l.league_country||'',match:l.match_label||'',
                    market:l.market||'',pick:l.pick||'',odd:Number(l.odd)||0,result:l.result||null,kickoffAt:l.kickoff_at||null};
          })
        };
      });
      etatFiches='ok';
    }catch(e){
      // Jamais de contenu invente en cas de panne : la vue le dit clairement.
      DATA.tickets=[];
      etatFiches='erreur';
    }
    return signatureFiches()!==avant;
  }

  /* ---- Regles des plans, lues en base ----
     Le rang minimum qui donne droit aux scores exacts est une donnee du
     catalogue (plans.includes_exact_score), pas une constante ecrite ici :
     changer l'offre se fait en base, jamais dans le code. */
  let rangScoreMin=null;
  async function chargerReglesPlans(){
    if(rangScoreMin!=null)return false;          // catalogue stable, lu une fois
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return false;
    try{
      const {data,error}=await sb.from('plans').select('rank,includes_exact_score');
      if(error||!data)return false;
      const avec=data.filter(p=>p.includes_exact_score).map(p=>p.rank);
      rangScoreMin=avec.length?Math.min.apply(null,avec):null;
      return true;
    }catch(e){
      // Panne reseau ou base injoignable. On n'invente rien pour autant :
      // mieux vaut un ecran vide qu'un faux resultat presente comme vrai.
      DATA.tickets=[];
      return true;
    }
  }

  /* ---- Rang de plan REEL, calcule par la base ----
     C'est exactement la valeur qui gouverne les regles de visibilite
     cote serveur (fonction user_plan_rank). L'utiliser ici garantit que
     ce que l'interface montre comme accessible est exactement ce que la
     base accepte de livrer : jamais une carte "ouverte" mais vide, jamais
     une cote reservee affichee a quelqu'un sans plan actif. */
  let rangServeur=null;
  async function chargerRangServeur(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return false;
    try{
      const {data,error}=await sb.rpc('user_plan_rank');
      if(error)return false;
      const n=Number(data);
      const val=isNaN(n)?0:n;
      if(val!==rangServeur){rangServeur=val;return true;}
    }catch(e){}
    return false;
  }

  /* ---- Date d'inscription REELLE (session diagnostic, demande explicite
     de James : "un nouvel utilisateur ne voit pas l'historique des
     anciennes fiches, son historique commence apres son inscription") ----
     Les fiches publiees AVANT la creation du compte ne lui appartiennent
     jamais, meme une fois abonne. Chargee UNE SEULE fois par session
     (meme principe que rangScoreMin ci-dessus : catalogue/etat personnel
     stable, jamais relu inutilement), depuis profiles.created_at — jamais
     invente, jamais approxime. Repli sur auth.getSession().user.created_at
     (date de creation du compte AUTH lui-meme, deja presente cote client,
     sans appel reseau supplementaire) uniquement si la ligne profiles est
     introuvable ou la lecture echoue — jamais bloquant pour autant : en
     cas de double echec, dateInscriptionUser reste null et AUCUN filtre
     de date n'est applique (voir renderHistory/renderStats), jamais un
     ecran vide affiche comme si l'utilisateur n'avait aucun historique. */
  let dateInscriptionUser=null;
  async function chargerDateInscription(){
    if(dateInscriptionUser!=null)return false;   // deja charge, jamais relu
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return false;
    try{
      let uid=(getState()&&getState().supabaseUserId)||null;
      if(!uid){
        const {data:sessionData}=await sb.auth.getSession();
        uid=(sessionData&&sessionData.session&&sessionData.session.user)?sessionData.session.user.id:null;
      }
      if(!uid)return false;
      let brut=null;
      try{
        const {data,error}=await sb.from('profiles').select('created_at').eq('id',uid).single();
        if(!error&&data&&data.created_at)brut=data.created_at;
      }catch(e){}
      if(!brut){
        const {data:sessionData}=await sb.auth.getSession();
        brut=(sessionData&&sessionData.session&&sessionData.session.user)?sessionData.session.user.created_at:null;
      }
      if(!brut)return false;
      dateInscriptionUser=partsHaiti(new Date(brut)).iso;
      return true;
    }catch(e){return false;}
  }

  /* Rechargement complet : rang de plan reel PUIS fiches. Utilise a
     l'ouverture du Dashboard, toutes les 45 s tant qu'il reste ouvert, et
     immediatement apres tout changement d'abonnement — un plan qui change
     modifie ce que la base accepte de livrer, les fiches doivent donc
     etre relues, pas seulement re-affichees. */
  async function rafraichirFiches(forcer){
    let bouge=false;
    try{
      const g=await chargerReglesPlans();
      const r=await chargerRangServeur();
      const d=await chargerDateInscription();
      const f=await chargerFichesReelles();
      bouge=!!(g||r||d||f);
    }catch(e){}
    if(bouge||forcer)renderAll();
    return bouge;
  }

  /* ---- Chargement des VRAIES notifications (Supabase) ----
     Meme principe que chargerFichesReelles() : un evenement survenu cote
     admin (paiement confirme/refuse, changement de plan force) doit
     atteindre l'utilisateur, sur n'importe quel appareil — jamais
     seulement sur celui d'ou l'action a ete faite. Sans cette lecture,
     'pushed' (voir plus bas) ne contient QUE les evenements declenches
     depuis CE navigateur. */
  let notifsReels=[];
  async function chargerNotifsReelles(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const st=getState();
    if(!sb||!st||!st.supabaseUserId)return false;
    try{
      const {data:rows,error}=await sb.from('notifications')
        .select('id,type,plan_id,reason,read,created_at')
        .eq('user_id',st.supabaseUserId)
        .order('created_at',{ascending:false}).limit(20);
      if(error||!rows)return false;
      const avant=JSON.stringify(notifsReels);
      notifsReels=rows;
      return JSON.stringify(notifsReels)!==avant;
    }catch(e){return false;}
  }
  window.VB_chargerNotifsReelles=chargerNotifsReelles;

  /* ---- Etat de la vue ---- */
  let view='today';
  const filters={today:{sport:'all'},history:{sport:'all',status:'all'}};
  /* ---- Notifications : construites a partir de l'etat REEL du compte ----
     Les evenements poussees (changement de plan) sont conserves ;
     les evenements deductibles (fin de plan, rappel, fiches du jour,
     resultats) sont recalcules a chaque affichage.
     CORRECTIF IMPORTANT : la cle de stockage locale doit etre PROPRE A
     CHAQUE COMPTE. Avant ce correctif, une seule cle globale etait
     partagee par tous les comptes utilises sur le meme appareil — un
     nouvel inscrit voyait donc l'historique de notifications de tous
     les comptes testes precedemment sur ce meme telephone/navigateur.
     La cle inclut maintenant l'identifiant reel du compte (supabaseUserId,
     ou l'e-mail avant connexion). pushed/lus sont rechargees a chaque
     ouverture du Dashboard (voir rechargerNotifsLocales), jamais lues
     une seule fois au chargement de la page. */
  function nkeyPourCompte(){
    // Appelle directement window.VB_getState (et non le 'getState' local,
    // defini plus bas dans ce meme fichier) : cette fonction est invoquee
    // des l'initialisation du module, avant que la constante locale
    // 'getState' n'existe encore.
    const st=window.VB_getState?window.VB_getState():null;
    const id=(st&&(st.supabaseUserId||st.email))||'anon';
    return 'vipbetcote.notifs.v1.'+String(id).toLowerCase();
  }
  let NKEY=nkeyPourCompte();
  let pushed=[];
  try{pushed=JSON.parse(localStorage.getItem(NKEY))||[];}catch(e){pushed=[];}
  const savePushed=()=>{try{localStorage.setItem(NKEY,JSON.stringify(pushed.slice(0,20)));}catch(e){}};
  let lus={};
  try{lus=JSON.parse(localStorage.getItem(NKEY+'.lus'))||{};}catch(e){lus={};}
  const saveLus=()=>{try{localStorage.setItem(NKEY+'.lus',JSON.stringify(lus));}catch(e){}};
  // Recharge pushed/lus depuis la cle du compte REELLEMENT connecte a cet
  // instant — a appeler a chaque ouverture du Dashboard (les comptes
  // peuvent changer sans recharger la page).
  function rechargerNotifsLocales(){
    const nouvelleCle=nkeyPourCompte();
    if(nouvelleCle===NKEY)return;
    NKEY=nouvelleCle;
    try{pushed=JSON.parse(localStorage.getItem(NKEY))||[];}catch(e){pushed=[];}
    try{lus=JSON.parse(localStorage.getItem(NKEY+'.lus'))||{};}catch(e){lus={};}
  }

  function ilYA(ts){
    const min=Math.floor((Date.now()-ts)/60000);
    if(min<60)return t('notif_ago_min').replace('{n}',Math.max(1,min));
    const h=Math.floor(min/60);
    if(h<24)return t('notif_ago_h').replace('{n}',h);
    return t('notif_ago_d').replace('{n}',Math.floor(h/24));
  }

  window.VB_notify=function(type,texte){
    pushed.unshift({id:'p'+Date.now(),type:type,texte:texte,ts:Date.now()});
    savePushed();
    if(dash.classList.contains('open'))renderNotifs();
  };

  function construireNotifs(){
    const st=getState()||{};
    const out=[];
    const RAPPEL={p1:1,p2:3,p3:7};

    // 1. Evenements pousses (changement de plan, renouvellement) —
    //    generes localement par CE navigateur au moment de l'action.
    pushed.forEach(n=>out.push({id:n.id,type:n.type,texte:n.texte,ts:n.ts}));

    // 1bis. Evenements REELS survenus cote serveur (paiement confirme ou
    //       refuse par un admin, changement de plan force par un admin) —
    //       visibles sur N'IMPORTE QUEL appareil, contrairement aux
    //       evenements "pousses" ci-dessus. Voir chargerNotifsReelles().
    notifsReels.forEach(n=>{
      const plObj=(n.plan_id&&window.VB_planById)?window.VB_planById(n.plan_id):null;
      const plNom=plObj?String(t(plObj.nameKey||'')).replace(/<[^>]*>/g,''):'—';
      let texte='', type='sub';
      if(n.type==='payment_confirmed'){
        texte=t('notif_pay_confirmed').replace('{plan}',plNom); type='plan';
      }else if(n.type==='payment_rejected'){
        texte=t('notif_pay_rejected').replace('{plan}',plNom)
          .replace('{raison}',n.reason||t('notif_pay_rejected_defaut')); type='sub';
      }else if(n.type==='admin_plan_change'){
        texte=t('notif_plan_change').replace('{plan}',plNom); type='plan';
      }else if(n.type==='payment_pending'){
        texte=t('notif_pay_pending').replace('{plan}',plNom); type='sub';
      }else return;
      out.push({id:'sb'+n.id, sbId:n.id, type:type, texte:texte,
        ts:new Date(n.created_at).getTime(), sbRead:!!n.read});
    });

    if(st.paid){
      const d=st.endDate?Math.ceil((new Date(st.endDate).getTime()-Date.now())/86400000):null;
      // 2. Plan termine
      if(d!==null&&d<=0){
        out.push({id:'exp',type:'sub',texte:t('notif_expired'),ts:new Date(st.endDate).getTime()});
      }
      // 3. Rappel de fin de plan
      else if(d!==null&&RAPPEL[st.planId]!=null&&d<=RAPPEL[st.planId]){
        out.push({id:'soon'+d,type:'sub',texte:t('notif_soon').replace('{n}',d),ts:Date.now()});
      }
    }

    // 4. Fiches du jour reellement accessibles avec le plan actif
    const dispo=DATA.tickets.filter(k=>estDuJour(k)&&k.minPlan<=userRank()).length;
    if(dispo>0)out.push({id:'today'+dispo,type:'new',texte:t('notif_today').replace('{n}',dispo),ts:Date.now()});

    // 5. Dernier resultat gagnant de l'historique
    const won=DATA.tickets.filter(k=>k.status==='won'&&k.minPlan<=userRank())
                          .sort((a,b)=>a.day-b.day)[0];
    // CORRIGÉ (retour explicite de James, 04/09) : affichait auparavant le
    // code technique brut de la fiche (ex. "BOT-2026-09-02-FOOT-R3-EXACT")
    // directement dans la notification — en plus d'être un mauvais format,
    // ce code contient littéralement "BOT", ce qui viole la règle absolue
    // "zéro mention d'IA/algorithme". Remplacé par un libellé générique
    // selon le type réel de fiche, jamais le code interne.
    if(won){
      const estExact=won.scoreCount>0&&won.scoreCount>=won.legsCount;
      const cle=estExact?'notif_won_exact':((won.sport==='basket'||won.sport==='nba')?'notif_won_basket':'notif_won_foot');
      out.push({id:'won'+won.uid,type:'won',texte:t(cle),
                     ts:Date.now()-won.day*86400000});
    }

    out.sort((a,b)=>b.ts-a.ts);
    // Une notification issue du serveur (prefixe 'sb') se base sur son
    // propre statut 'read' en base, jamais sur le seul marqueur local —
    // sinon deux appareils du meme compte se desynchroniseraient l'un
    // l'autre sur ce qui est deja lu ou non.
    return out.slice(0,12).map(n=>({...n,unread:n.sbId!=null?!n.sbRead:!lus[n.id]}));
  }
  let notifs=[];

  const getState=()=>(window.VB_getState?window.VB_getState():null);
  const userPlan=()=>{const st=getState();return st&&st.planId?st.planId:null;};
  /* Rang du plan ACTIF. La base fait autorite des qu'elle a repondu
     (chargerRangServeur) : l'interface montre alors exactement ce que la
     base accepte de livrer. Sinon on retombe sur l'etat local, avec la
     meme regle stricte — aucun plan actif = rang 0.
     CORRECTIF : auparavant l'absence de plan valait 'p1' par defaut. Une
     personne sans abonnement voyait donc les fiches du plan 1 comme
     deverrouillees, alors que la base ne lui livre aucune cote. */
  const userRank=()=>{
    if(window.VB_estSuspendu&&window.VB_estSuspendu())return 0;
    if(rangServeur!=null)return rangServeur;
    const pl=userPlan();
    if(!pl)return 0;
    if(isExpired()||isPending()||isRejected())return 0;
    return rank[pl]||0;
  };

  /* ---- Rendu d'une fiche ---- */
  const isExpired=()=>!!(window.VB_isExpired&&window.VB_isExpired());
  const isPending=()=>!!(window.VB_isPending&&window.VB_isPending());
  const isRejected=()=>!!(window.VB_isRejected&&window.VB_isRejected());

  function ticketEl(tk){
    // Abonnement expire : TOUTES les fiches sont verrouillees,
    // quel que soit le plan detenu.
    const locked=isExpired()||isPending()||isRejected()||tk.minPlan>userRank();
    const el=document.createElement('article');
    el.className='dtk'+(locked?' locked':'');

    const statusKey={won:'dash_st_won',lost:'dash_st_lost',pending:'dash_st_pending'}[tk.status];
    const head=document.createElement('div');
    head.className='dtk-head';
    head.innerHTML='<span class="dtk-sport '+tk.sport+'">'+((tk.sport==='basket'||tk.sport==='nba')?t('dash_f_nba').toUpperCase():t('dash_f_foot').toUpperCase())+'</span>'+
      '<span class="dtk-date">'+titreFicheDash(tk)+'</span>'+
      '<span class="dtk-res '+tk.status+'">'+t(statusKey)+'</span>';
    el.appendChild(head);

    // Compte à rebours avant le prochain coup d'envoi (29/08) : uniquement
    // sur une fiche encore en cours (won/lost = tous les matchs déjà
    // joués, un compte à rebours n'a plus de sens). data-kickoff porte le
    // timestamp ISO brut ; un seul setInterval global (voir plus bas,
    // majComptesARebours) met à jour tous les badges de la page ensemble
    // plutôt qu'un timer par carte.
    if(!locked&&tk.status==='pending'){
      const prochainISO=(tk.legs||[]).map(l=>l.kickoffAt).filter(Boolean).sort()[0];
      if(prochainISO){
        const cd=document.createElement('div');
        cd.className='dtk-countdown';
        cd.dataset.kickoff=prochainISO;
        cd.textContent=texteCompteARebours(prochainISO);
        el.appendChild(cd);
      }
    }

    // Note "a jouer en 2 tickets separes" (25/08) : meme detection que
    // titreFicheDash pour le genre "Score exact" — jamais sur une fiche
    // a marches melanges.
    const estScoreExact=tk.scoreCount>0&&tk.legsCount>0&&tk.scoreCount===tk.legsCount;
    if(estScoreExact){
      const noteEl=document.createElement('div');
      noteEl.className='dtk-note-x2';
      noteEl.textContent=t('fiche_note_x2');
      el.appendChild(noteEl);
    }

    const ul=document.createElement('ul');
    ul.className='dtk-legs';
    /* IMPORTANT : on se base sur l'etat verrouille, pas sur la presence
       de selections. La base peut livrer une partie des selections d'une
       fiche verrouillee (les scores exacts, inclus des le plan 30 jours,
       peuvent figurer dans une fiche reservee au plan a vie) : ces
       selections-la ont leur propre carte, elles ne doivent jamais
       apparaitre dans une carte verrouillee. */
    if(!locked&&tk.legs.length){
      tk.legs.forEach(lg=>{
        const li=document.createElement('li');
        li.className='dtk-leg';
        // Le bot et l'admin peuvent ecrire soit une CLE i18n (mk_btts_l,
        // pick_oui...), soit du texte libre : on ne traduit que ce qui est
        // reconnu comme une cle, le reste s'affiche tel quel.
        // Notation 1/2 (28/08, demande explicite de James) : "Victoire :
        // Home/Away" -> "Victoire : 1/2" -- affichage uniquement, ne
        // touche jamais aux donnees stockees ni au reglement du bot.
        const pickRaw=String(lg.pick||'').replace(/^Victoire\s*:\s*Home$/i,'Victoire : 1').replace(/^Victoire\s*:\s*Away$/i,'Victoire : 2');
        const pick=(pickRaw.indexOf(' — ')>-1||!translations.fr[pickRaw])?pickRaw:t(pickRaw);
        const marketTxt=translations.fr[lg.market]?t(lg.market):(lg.market||'');
        // Heure d'Haiti ; la date n'apparait que si le match tombe un
        // autre jour que celui de la fiche (voir heureAffichee).
        li.innerHTML=marqueLegDash(lg.result)+
          '<div class="dtk-leg-body"><div class="dtk-leg-top"><span class="dtk-leg-time">'+lg.time+
          (lg.jour?' · '+lg.jour:'')+'</span>'+
          '<span class="dtk-leg-league">'+lg.league+(lg.leagueCountry?' ('+lg.leagueCountry+')':'')+'</span></div>'+
          '<div class="dtk-leg-match">'+lg.match+'</div>'+
          '<div class="dtk-leg-bot"><span class="dtk-leg-pick"><em>'+marketTxt+'</em>'+pick+'</span>'+
          '<span class="dtk-leg-odd">'+lg.odd.toFixed(2)+'</span></div></div>';
        ul.appendChild(li);
      });
    }else{
      /* Fiche verrouillee : la base n'a livre AUCUNE selection (le plan
         actif ne la couvre pas). On garde la silhouette de la carte —
         autant de lignes que la fiche en compte reellement — avec un
         contenu masque : aucune donnee inventee, aucune cote exposee. */
      for(let i=0;i<tk.legsCount;i++){
        const li=document.createElement('li');
        li.className='dtk-leg';
        li.innerHTML='<span class="dtk-leg-mark none">·</span>'+
          '<div class="dtk-leg-body"><div class="dtk-leg-top"><span class="dtk-leg-time">--:--</span>'+
          '<span class="dtk-leg-league">•••••</span></div>'+
          '<div class="dtk-leg-match">••••••••• — •••••••••</div>'+
          '<div class="dtk-leg-bot"><span class="dtk-leg-pick"><em>•••</em>••••</span>'+
          '<span class="dtk-leg-odd">•.••</span></div></div>';
        ul.appendChild(li);
      }
    }
    el.appendChild(ul);

    const conf=document.createElement('div');
    conf.className='dtk-conf';
    // CHANGÉ (31/08 v2, demande explicite de James) : le badge/barre de
    // confiance côté Dashboard client ne lit plus tk.conf (le score
    // interne saisi par l'admin/bot) — il est désormais calculé UNIQUEMENT
    // à partir de la cote totale réelle de la fiche, via niveauSelonCote()
    // (barème fixe 1-30 vert / 30-80 jaune / 80+ rouge, voir sa définition
    // pour le détail). tk.conf reste écrit en base et lu ailleurs (stats
    // admin, moyenne 30 jours) mais n'influence plus jamais ce qui est
    // montré ici.
    const niveauInfo=niveauSelonCote(totalOdd(tk));
    const lvl=niveauInfo.niveau==='haut'?'':(niveauInfo.niveau==='moyen'?' mid':' low');
    const niveauCle=niveauInfo.niveau;
    const niveauEmoji=niveauInfo.niveau==='haut'?'🟢':(niveauInfo.niveau==='moyen'?'🟡':'🔴');
    conf.innerHTML='<div class="dtk-conf-top"><span class="dtk-conf-lbl">'+t('dash_conf')+'</span>'+
      '<span style="display:flex;align-items:center;gap:6px"><span class="dtk-conf-val">'+niveauInfo.pct+'%</span>'+
      '<span class="dtk-badge-niveau '+niveauCle+'">'+niveauEmoji+' '+t('dtk_niveau_'+niveauCle)+'</span></span></div>'+
      '<div class="dtk-conf-bar"><span class="dtk-conf-fill'+lvl+'" style="width:'+niveauInfo.pct+'%"></span></div>';
    el.appendChild(conf);

    const foot=document.createElement('div');
    foot.className='dtk-foot';
    foot.innerHTML='<span class="dtk-foot-lbl">'+t('dash_totalodd')+'</span>'+
      '<span class="dtk-foot-odd">'+totalOdd(tk).toFixed(2)+'</span>';
    el.appendChild(foot);

    // Partage WhatsApp (29/08) — uniquement sur un ticket GAGNÉ, jamais sur
    // pending/lost/verrouillé (rien à célébrer, et une fiche verrouillée
    // n'a pas ses vraies sélections chargées côté client de toute façon).
    if(!locked&&tk.status==='won'){
      const btnPartage=document.createElement('button');
      btnPartage.type='button';
      btnPartage.className='dtk-share-btn';
      btnPartage.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.41-1.42a9.9 9.9 0 0 0 4.63 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2m0 18.1h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.55-3.7 8.24-8.24 8.24m4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.4-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.84-.86 2.05 0 1.21.88 2.38 1 2.54.12.17 1.73 2.64 4.2 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.28"/></svg>'+
        '<span>'+t('dtk_share_btn')+'</span>';
      btnPartage.addEventListener('click',()=>partagerTicketGagnant(tk));
      el.appendChild(btnPartage);
    }

    if(locked){
      const ov=document.createElement('div');
      ov.className='dtk-lockover';
      const exp=isExpired();
      const pend=isPending();
      // Nom du plan requis, lu depuis le catalogue existant (aucune duplication)
      const needPlan=(window.VB_planById?window.VB_planById('p'+tk.minPlan):null);
      const needName=needPlan?String(window.VB_planLabel(needPlan)).replace(/<[^>]*>/g,''):'';
      const icon=pend
        ?'<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
        :'<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
      ov.innerHTML=icon+
        (pend||exp?'':'<span class="dtk-need">'+t('dash_need_plan')+' <b>'+needName+'</b></span>')+
        '<p>'+t(pend?'dash_pending_ov_p':(exp?'dash_expired_p':'dash_locked_p'))+'</p>';
      if(!pend){
        // Rien a cliquer pendant l'attente de validation : aucun bouton.
        const b=document.createElement('button');
        b.type='button';b.className='btn btn-or';
        b.textContent=exp?t('dash_expired_cta'):t('dash_locked_cta').replace('{plan}',needName);
        b.addEventListener('click',()=>{closeDash();if(window.VB_openWizardPay)window.VB_openWizardPay();});
        ov.appendChild(b);
      }
      el.appendChild(ov);
    }
    return el;
  }

  /* ---- Scores exacts du jour ----
     Plus aucun tirage de demonstration : ce sont les selections "score
     exact" (market mk_score_l) des fiches reellement publiees pour
     aujourd'hui. Comme pour tout le reste, c'est la base qui decide si
     la personne a le droit de les lire. */
  const fichesScoreDuJour=()=>DATA.tickets.filter(k=>estDuJour(k)&&k.scoreCount>0);
  /* Une fiche composee UNIQUEMENT de scores exacts est le produit
     "scores exacts" : elle s'affiche dans sa carte dediee, jamais deux
     fois (une fois dans la liste, une fois dans la carte). */
  const estFicheScore=k=>k.scoreCount>0&&k.scoreCount===k.legsCount;
  /* Plan minimum exige pour les scores exacts : c'est l'offre du plan qui
     decide (plans.includes_exact_score), pas le plan de la fiche qui les
     porte — le bot peut tres bien les publier dans la fiche du plan a vie
     alors qu'ils sont inclus des le plan 30 jours.
     Retourne null quand aucun score exact n'est publie pour aujourd'hui. */
  function rangScoresDuJour(){
    if(!fichesScoreDuJour().length)return null;
    if(rangScoreMin!=null)return rangScoreMin;
    // Catalogue pas encore lu : on reste prudent, la carte reste fermee
    // jusqu'a ce que la regle reelle soit connue.
    return Math.min.apply(null,fichesScoreDuJour().map(k=>k.minPlan));
  }
  // CORRIGÉ (12/09, retour explicite : "il combine la fiche hier et les
  // scores exact publié aujourd'hui — c'est critique"). estDuJour ne teste
  // QUE le statut ('pending'), jamais la date — c'est voulu ailleurs (voir
  // son commentaire, correctif du 27/08 : une fiche encore en attente ne
  // doit jamais devenir invisible, quel que soit son jour de jeu). Mais
  // scoresDuJour() APLATISSAIT les legs de TOUTES les fiches "pending"
  // trouvées par fichesScoreDuJour() dans UNE SEULE liste, puis scoreCardEl
  // n'affichait qu'UNE SEULE date (la plus récente) en en-tête : une fiche
  // score-exact d'hier encore non réglée (règlement en retard, cas déjà vu
  // avec les 7 "void" du 8 septembre) se retrouvait donc mélangée sous la
  // date d'aujourd'hui, sans aucune distinction visuelle.
  // Chaque leg garde MAINTENANT le jour (k.day) de SA fiche d'origine ;
  // scoresDuJour(jour) et nbScoresDuJour(jour) filtrent sur ce jour précis,
  // et une carte est générée PAR JOUR DISTINCT (scoreCardEls, plus bas) —
  // jamais plus une fiche fusionnée avec une autre.
  function scoresDuJour(jour){
    const out=[];
    // CORRIGÉ (session suivante) : ne filtrait que 'mk_score_l' (l'ancienne
    // valeur écrite par le panneau admin), jamais 'mk_score_exact' (celle
    // écrite par le bot) — la liste restait donc TOUJOURS vide pour une
    // fiche générée par le bot, déclenchant le rendu "verrouillé masqué"
    // même pour un compte Lifetime pleinement autorisé. MARCHES_SCORE_EXACT_DASH
    // (ligne ~8737) existe déjà pour ce cas précis, jamais utilisée ici.
    fichesScoreDuJour().filter(k=>k.day===jour).forEach(k=>{k.legs.forEach(lg=>{if(MARCHES_SCORE_EXACT_DASH.indexOf(lg.market)>-1)out.push(lg);});});
    return out;
  }
  const nbScoresDuJour=jour=>fichesScoreDuJour().filter(k=>k.day===jour).reduce((a,k)=>a+k.scoreCount,0);
  // Un jour distinct par fiche score-exact encore en attente, triés du plus
  // récent au plus ancien (day croissant = plus ancien, voir dayDate ci-dessus).
  const joursScoreDuJour=()=>Array.from(new Set(fichesScoreDuJour().map(k=>k.day))).sort((a,b)=>a-b);

  function scoreCardEl(jourSc){
    const besoin=rangScoresDuJour();
    const locked=isExpired()||isPending()||isRejected()||besoin==null||besoin>userRank();
    const liste=scoresDuJour(jourSc);
    const total=nbScoresDuJour(jourSc);
    // Date affichee = celle des fiches concernees en base, pas la date
    // de l'appareil ni une date supposee.
    const el=document.createElement('article');
    el.className='dtk'+(locked?' locked':'');

    const head=document.createElement('div');
    head.className='dtk-head';
    head.innerHTML='<span class="dtk-sport foot">'+t('mk_score_l').toUpperCase()+'</span>'+
      '<span class="dtk-date">'+dateLongueDash(dayDate(jourSc).toISOString().slice(0,10))+' — '+t('dash_kind_exact')+'</span>'+
      '<span class="dtk-res pending">'+t('dash_st_pending')+'</span>';
    el.appendChild(head);

    const ul=document.createElement('ul');
    ul.className='dtk-legs';
    if(liste.length){
      liste.forEach(sc=>{
        const li=document.createElement('li');
        li.className='dtk-leg';
        li.innerHTML=marqueLegDash(sc.result)+
          '<div class="dtk-leg-body"><div class="dtk-leg-top"><span class="dtk-leg-time">'+sc.time+
          (sc.jour?' · '+sc.jour:'')+'</span>'+
          '<span class="dtk-leg-league">'+sc.league+(sc.leagueCountry?' ('+sc.leagueCountry+')':'')+'</span></div>'+
          '<div class="dtk-leg-match">'+sc.match+'</div>'+
          '<div class="dtk-leg-bot"><span class="dtk-leg-pick"><em>'+t('mk_score_l')+'</em>'+sc.pick+'</span>'+
          '<span class="dtk-leg-odd">'+sc.odd.toFixed(2)+'</span></div></div>';
        ul.appendChild(li);
      });
    }else{
      // Verrouille : la base n'a livre aucun score exact. Meme silhouette,
      // contenu masque — rien d'invente, rien d'expose.
      for(let i=0;i<total;i++){
        const li=document.createElement('li');
        li.className='dtk-leg';
        li.innerHTML='<span class="dtk-leg-mark none">·</span>'+
          '<div class="dtk-leg-body"><div class="dtk-leg-top"><span class="dtk-leg-time">--:--</span>'+
          '<span class="dtk-leg-league">•••••</span></div>'+
          '<div class="dtk-leg-match">••••••••• — •••••••••</div>'+
          '<div class="dtk-leg-bot"><span class="dtk-leg-pick"><em>'+t('mk_score_l')+'</em>• — •</span>'+
          '<span class="dtk-leg-odd">•.••</span></div></div>';
        ul.appendChild(li);
      }
    }
    el.appendChild(ul);

    const foot=document.createElement('div');
    foot.className='dtk-foot';
    foot.innerHTML='<span class="dtk-foot-lbl">'+t('dash_score_count').replace('{n}',total)+'</span>'+
      '<span class="dtk-tag-pair">'+t('dash_tag_pair')+'</span>';
    el.appendChild(foot);

    if(locked){
      const ov=document.createElement('div');
      ov.className='dtk-lockover';
      const needPlan=(window.VB_planById?window.VB_planById('p'+(besoin||4)):null);
      const needName=needPlan?String(window.VB_planLabel(needPlan)).replace(/<[^>]*>/g,''):'';
      const exp=isExpired();
      const pend=isPending();
      const rej=isRejected();
      const icon=pend
        ?'<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'
        :'<svg class="ic" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>';
      ov.innerHTML=icon+
        (pend||exp||rej?'':'<span class="dtk-need">'+t('dash_need_plan')+' <b>'+needName+'</b></span>')+
        '<p>'+t(pend?'dash_pending_ov_p':(rej?'dash_rejected_ov_p':(exp?'dash_expired_p':'dash_locked_p')))+'</p>';
      if(!pend){
        const b=document.createElement('button');
        b.type='button';b.className='btn btn-or';
        b.textContent=rej?t('dash_activate_cta'):(exp?t('dash_expired_cta'):t('dash_locked_cta').replace('{plan}',needName));
        b.addEventListener('click',()=>{closeDash();if(window.VB_openWizardPay)window.VB_openWizardPay();});
        ov.appendChild(b);
      }
      el.appendChild(ov);
    }
    return el;
  }
  // Une carte par jour distinct trouvé — jamais un seul bloc fusionné.
  // Cas normal (un seul jour en attente) : renvoie un tableau à un élément,
  // rendu identique à avant ce correctif.
  const scoreCardEls=()=>joursScoreDuJour().map(j=>scoreCardEl(j));

  function emptyEl(key){
    const d=document.createElement('div');
    d.className='dash-empty';
    d.innerHTML='<svg class="ic" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 10h8M8 14h5"/></svg>'+
      '<h4>'+t('dash_empty_h')+'</h4><p>'+t(key)+'</p>';
    return d;
  }

  function kpi(val,labelKey,tone){
    return '<div class="dash-kpi"><b'+(tone?' class="'+tone+'"':'')+'>'+val+'</b><span>'+t(labelKey)+'</span></div>';
  }

  /* ---- Vue : fiches du jour ---- */
  /* Rappel d'expiration : affiche a partir de J-5 pour le plan 30 jours.
     Reutilise le parcours de renouvellement existant, sans en creer un autre. */
  const RAPPEL_JOURS=5;
  function daysLeft(){
    const st=getState();
    if(!st||!st.endDate)return null;
    return Math.ceil((new Date(st.endDate).getTime()-Date.now())/86400000);
  }
  function renderSoon(){
    const box=document.getElementById('dashSoon');
    const st=getState();
    const d=daysLeft();
    const is30=!!(st&&st.planId==='p3');
    if(!is30||isExpired()||d===null||d>RAPPEL_JOURS||d<0){box.hidden=true;return;}
    box.hidden=false;
    document.getElementById('dashSoonH').textContent=t('dash_soon_h').replace('{n}',d);
  }

  function renderToday(){
    const life=!!(window.VB_isLifetime&&window.VB_isLifetime());
    const pend=isPending();
    const pendBox=document.getElementById('dashPending');
    pendBox.hidden=!pend;
    if(pend){
      const st=getState()||{};
      document.getElementById('dashPendingSub').textContent=
        t('dash_pending_sub')+(st.ref?' · '+st.ref:'');
    }
    // Bandeau "expire" sans objet tant que le paiement n'a jamais ete
    // confirme : on ne montre jamais les deux bandeaux a la fois.
    document.getElementById('dashExpired').hidden=pend||life||!isExpired();
    renderSoon();
    const st=getState();
    const name=(st&&st.fullname?st.fullname.split(' ')[0]:'');
    document.getElementById('dashHiH').textContent=t('dash_hello').replace('{name}',name).trim();
    document.getElementById('dashHiP').textContent=t('dash_hello_p');

    // Les fiches 100 % "score exact" ont leur propre carte : on ne les
    // compte pas deux fois dans la LISTE affichee des fiches du jour.
    const todays=DATA.tickets.filter(k=>estDuJour(k)&&!estFicheScore(k));
    const visible=todays.filter(k=>k.minPlan<=userRank());
    const legs=visible.reduce((a,k)=>a+k.legs.length,0);
    const best=visible.length?Math.max.apply(null,visible.map(totalOdd)):0;
    // CHANGÉ (31/08 v2, demande explicite de James) : le CHIFFRE des KPI
    // "Fiches disponibles"/"Fiches verrouillées", lui, doit compter TOUTE
    // fiche en cours du jour sans exception -- fiche normale + score exact
    // (auto ou manuelle) + basketball (auto ou manuelle) -- même si la
    // fiche score exact garde sa propre carte plus bas et n'apparaît donc
    // qu'une fois dans la liste elle-même. Ce comptage-ci est distinct de
    // "todays"/"visible" (qui restent, eux, la base de la liste rendue).
    const todaysTout=DATA.tickets.filter(k=>estDuJour(k));
    const visibleTout=todaysTout.filter(k=>k.minPlan<=userRank());
    // CHANGÉ (31/08, demande explicite de James : "le nombre de fiches
    // disponibles reste toujours affiché, toujours synchronisé avec le
    // nombre total de fiches disponibles, mais les fiches restent
    // masquées pour les users sans plan activé") : ce compteur montre
    // désormais le TOTAL réel des fiches en cours du jour, quel que soit
    // le plan de la personne (0 pour un compte sans plan actif avant ce
    // correctif, ce qui laissait croire qu'il n'y avait rien à voir).
    // Le verrouillage du CONTENU reste entier et inchangé (ticketEl) —
    // seul le nombre est visible, jamais les sélections.
    document.getElementById('dashKpisToday').innerHTML=
      kpi(todaysTout.length,'dash_k_avail','green')+
      kpi(legs,'dash_k_legs')+
      kpi(best?best.toFixed(2):'—','dash_k_bestodd','gold')+
      kpi(todaysTout.length-visibleTout.length,'dash_k_locked');

    const f=filters.today;
    /* "Fich lòt plan" : les fiches que le plan ACTIF ne couvre pas.
       Elles restent masquees (le verrouillage est gere par ticketEl),
       avec le nom du plan requis affiche dessous.
       CHANGÉ (31/08, demande explicite de James : "les fiches masquées
       sont seulement dans 'autre plan', elles doivent être aussi dans
       'tout' sur l'accueil user mais masquées avec le même principe") :
       les onglets "Tout" et par sport n'excluent plus les fiches hors
       plan — elles sont affichées comme partout ailleurs, verrouillées
       par ticketEl (contenu jamais révélé, nom du plan requis affiché).
       L'onglet "Fich lòt plan" reste inchangé : il ne montre QUE les
       fiches hors plan, c'est sa raison d'être. */
    const list=(f.sport==='other')
      ? todays.filter(k=>k.minPlan>userRank())
      : todays.filter(k=>(f.sport==='all'||k.sport===f.sport));
    // Le Lifetime couvre tout : la categorie n'a plus d'objet pour lui
    const btnOther=document.getElementById('dashFbtnOther');
    const rienDAutre=todays.every(k=>k.minPlan<=userRank())&&
      (rangScoresDuJour()==null||rangScoresDuJour()<=userRank());
    btnOther.hidden=rienDAutre;
    if(rienDAutre&&f.sport==='other'){
      f.sport='all';
      document.querySelectorAll('[data-dfilter="sport"]').forEach(g=>{
        if(g.closest('.dash-view').dataset.dview==='today')
          g.querySelectorAll('.dash-fbtn').forEach(x=>x.classList.toggle('on',x.dataset.val==='all'));
      });
      return renderToday();
    }
    const wrap=document.getElementById('dashListToday');
    wrap.innerHTML='';
    const rangScores=rangScoresDuJour();
    const ilYaScores=rangScores!=null;
    const scoresVisibles=ilYaScores&&rangScores<=userRank();
    const montreScores=ilYaScores&&((f.sport==='all'&&scoresVisibles)||(f.sport==='other'&&!scoresVisibles));
    if(!list.length&&!montreScores){
      // Une panne de lecture ne doit jamais ressembler a "aucune fiche".
      wrap.appendChild(emptyEl(etatFiches==='erreur'?'dash_empty_err'
        :(f.sport==='other'?'dash_empty_other':'dash_empty_today')));
    }
    else{
      list.forEach(k=>wrap.appendChild(ticketEl(k)));
      // CHANGÉ (12/09) : une carte par jour distinct (voir scoreCardEls),
      // plus un seul appendChild — sinon les scores de plusieurs jours en
      // attente resteraient fusionnés dans une carte unique.
      const cartesScore=montreScores?scoreCardEls():[];
      cartesScore.forEach(c=>wrap.appendChild(c));
    }
    document.getElementById('dashCountToday').textContent=t('dash_count').replace('{n}',list.length+(montreScores?joursScoreDuJour().length:0));
  }

  /* ---- Vue : historique ---- */
  function renderHistory(){
    // Sans plan actif (jamais confirmé, refusé, OU confirmé mais expiré) :
    // l'historique gagné/perdu est totalement inaccessible — pas de cartes
    // verrouillées, pas de KPI de performance, seulement un message
    // demandant un plan actif (demande explicite de James, 31/08 v6,
    // distincte de la règle "Aujourd'hui" : cette dernière montre bien le
    // nombre de fiches + des cartes verrouillées pour donner envie de
    // s'abonner, mais l'historique de résultats, lui, doit rester
    // entièrement caché tant qu'aucun plan n'est actif — jamais de
    // KPI/chiffres partiels qui révéleraient une performance sans payer).
    const stH=getState();
    const life=!!(window.VB_isLifetime&&window.VB_isLifetime());
    const planActif=life||!!(stH&&stH.paid&&stH.payStatus==='confirmed'&&stH.planId&&!isExpired());
    if(!planActif){
      document.getElementById('dashKpisHist').innerHTML=
        kpi('—','dash_k_played')+kpi('—','dash_k_won','green')+
        kpi('—','dash_k_lost')+kpi('—%','dash_k_rate','gold');
      const wrapN=document.getElementById('dashListHist');
      wrapN.innerHTML='';
      wrapN.appendChild(emptyEl('dash_hist_needs_plan'));
      document.getElementById('dashCountHist').textContent=t('dash_count').replace('{n}',0);
      return;
    }
    // Jamais l'historique d'avant l'inscription (voir chargerDateInscription
    // ci-dessus) — si la date n'a pas pu etre determinee, aucun filtre
    // n'est applique plutot que de risquer un historique tronque a tort.
    const done=DATA.tickets.filter(k=>k.status!=='pending'
      &&(dateInscriptionUser==null||k.playDate>=dateInscriptionUser));
    const won=done.filter(k=>k.status==='won').length;
    const rate=done.length?Math.round(won/done.length*100):0;
    document.getElementById('dashKpisHist').innerHTML=
      kpi(done.length,'dash_k_played')+
      kpi(won,'dash_k_won','green')+
      kpi(done.length-won,'dash_k_lost')+
      kpi(rate+'%','dash_k_rate','gold');

    const f=filters.history;
    const list=done.filter(k=>(f.sport==='all'||k.sport===f.sport)&&(f.status==='all'||k.status===f.status));
    const wrap=document.getElementById('dashListHist');
    wrap.innerHTML='';
    if(!list.length){wrap.appendChild(emptyEl(etatFiches==='erreur'?'dash_empty_err':'dash_empty_hist'));}
    else list.forEach(k=>wrap.appendChild(ticketEl(k)));
    document.getElementById('dashCountHist').textContent=t('dash_count').replace('{n}',list.length);
  }

  /* ---- Vue : statistiques (calculees, jamais ecrites en dur) ---- */
  function renderStats(){
    // CORRIGÉ (01/09, risque signalé dans le mémoire du 01/09) : même
    // règle que renderHistory ci-dessus — sans plan actif (jamais
    // confirmé, refusé, OU confirmé mais expiré), aucun chiffre de
    // performance (taux de réussite, cote moyenne, confiance moyenne,
    // stats par discipline) n'est calculé ni affiché. Seul un message
    // demandant un plan actif est montré, jamais de KPI partiel.
    const stStats=getState();
    const lifeStats=!!(window.VB_isLifetime&&window.VB_isLifetime());
    const planActifStats=lifeStats||!!(stStats&&stStats.paid&&stStats.payStatus==='confirmed'&&stStats.planId&&!isExpired());
    const bySportWrap=document.getElementById('dashStatsBySportWrap');
    const msgWrap=document.getElementById('dashStatsMsgWrap');
    if(!planActifStats){
      document.getElementById('dashKpisStats').innerHTML=
        kpi('—%','dash_k_rate','green')+kpi('—','dash_k_played')+
        kpi('—','dash_k_avgodd','gold')+kpi('—%','dash_k_avgconf');
      document.getElementById('dashKpisSport').innerHTML='';
      if(bySportWrap)bySportWrap.style.display='none';
      if(msgWrap){msgWrap.innerHTML='';msgWrap.appendChild(emptyEl('dash_stats_needs_plan'));}
      return;
    }
    if(bySportWrap)bySportWrap.style.display='';
    if(msgWrap)msgWrap.innerHTML='';
    // Meme regle que renderHistory : jamais de performance calculee sur
    // des fiches publiees avant l'inscription de l'utilisateur.
    const done=DATA.tickets.filter(k=>k.status!=='pending'
      &&(dateInscriptionUser==null||k.playDate>=dateInscriptionUser));
    const won=done.filter(k=>k.status==='won');
    const rate=done.length?Math.round(won.length/done.length*100):0;
    const avgOdd=done.length?(done.reduce((a,k)=>a+totalOdd(k),0)/done.length):0;
    const avgConf=done.length?Math.round(done.reduce((a,k)=>a+k.conf,0)/done.length):0;
    let streak=0;
    for(const k of done){if(k.status==='won')streak++;else break;}
    document.getElementById('dashKpisStats').innerHTML=
      kpi(rate+'%','dash_k_rate','green')+
      kpi(done.length,'dash_k_played')+
      kpi(avgOdd.toFixed(2),'dash_k_avgodd','gold')+
      kpi(avgConf+'%','dash_k_avgconf');

    const bySport=s=>{
      const d=done.filter(k=>k.sport===s);
      const w=d.filter(k=>k.status==='won').length;
      return {n:d.length,w:w,r:d.length?Math.round(w/d.length*100):0};
    };
    const fo=bySport('foot'),nb=bySport('nba');
    document.getElementById('dashKpisSport').innerHTML=
      kpi(fo.r+'%','dash_k_footrate','green')+
      kpi(fo.n,'dash_k_footplayed')+
      kpi(nb.r+'%','dash_k_nbarate','green')+
      kpi(nb.n,'dash_k_nbaplayed');
  }

  /* ---- Vue : abonnement ---- */
  /* ---- Vue : historique abonnement (01/09, demande explicite de James) ----
     Liste TOUS les plans passés et présents de l'utilisateur — mais
     UNIQUEMENT ceux confirmés par un admin.
     CORRIGÉ (session suivante, bug signalé par James : "pas synchronisé
     avec les anciens plans") : la première version filtrait sur
     subscriptions.status='active', mais la base ne garde qu'UNE SEULE
     ligne 'active' par utilisateur à la fois — dès qu'un plan est
     remplacé (renouvellement, changement), l'ancienne ligne bascule à
     'cancelled', MÊME si elle avait été réellement confirmée par un
     admin en son temps. Filtrer sur 'active' faisait donc disparaître
     tout l'historique réel, ne laissant que le plan courant.
     La vraie source de vérité pour "confirmé par admin", c'est
     payments.status='confirmed' (jamais 'pending' ni 'failed'/'refunded')
     — chaque paiement confirmé est relié à sa ligne subscriptions via
     subscription_id, qui donne les vraies dates de la période
     (starts_at/expires_at). Un paiement sans subscription_id lié, ou
     dont la ligne subscriptions correspondante est introuvable, est
     silencieusement ignoré plutôt que de risquer d'afficher une ligne
     à moitié vide — jamais d'erreur visible pour l'utilisateur.
     Le plan actif reste TOUJOURS en haut (badge vert), le reste trié du
     plus récent au plus ancien (badge rouge "Expiré"). "Actif" est
     recalculé à CHAQUE affichage à partir de la vraie date d'expiration
     (jamais un statut figé) : un plan bascule donc automatiquement en
     "Expiré" tout seul dès que sa date passe, et un nouveau plan
     confirmé après renouvellement apparaît en haut au prochain rendu —
     sans aucune action manuelle nécessaire. */
  async function renderSubHistory(){
    const box=document.getElementById('dashSubHistoryList');
    if(!box)return;
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){box.innerHTML='';box.appendChild(emptyEl('dash_empty_err'));return;}
    try{
      let uid=(getState()&&getState().supabaseUserId)||null;
      if(!uid){
        const {data:sessionData}=await sb.auth.getSession();
        uid=(sessionData&&sessionData.session&&sessionData.session.user)?sessionData.session.user.id:null;
      }
      if(!uid){box.innerHTML='';box.appendChild(emptyEl('dash_empty_err'));return;}

      const {data:paysData,error:errPays}=await sb.from('payments')
        .select('subscription_id,plan_id,confirmed_at')
        .eq('user_id',uid).eq('status','confirmed')
        .order('confirmed_at',{ascending:false});
      if(errPays)throw errPays;
      // Un paiement confirmé sans subscription_id ne correspond a aucune
      // periode reelle a afficher — ignore, jamais affiche a moitie.
      const paysConfirmes=(paysData||[]).filter(p=>p.subscription_id);
      if(!paysConfirmes.length){
        box.innerHTML='';
        box.appendChild(emptyEl('dash_subhistory_empty'));
        return;
      }
      // Un meme abonnement peut, en theorie, avoir plusieurs paiements
      // confirmes (correction admin) — on ne garde qu'une seule ligne par
      // subscription_id, la plus recente (deja en tete grace au tri ci-dessus).
      const parSubscription={};
      paysConfirmes.forEach(p=>{
        if(!parSubscription[p.subscription_id])parSubscription[p.subscription_id]=p;
      });
      const subIds=Object.keys(parSubscription);
      const {data:subsData,error:errSubs}=await sb.from('subscriptions')
        .select('id,plan_id,starts_at,expires_at')
        .in('id',subIds);
      if(errSubs)throw errSubs;
      const subsById={};
      (subsData||[]).forEach(s=>{subsById[s.id]=s;});

      const maintenant=Date.now();
      const lignes=[];
      subIds.forEach(sid=>{
        const s=subsById[sid];
        // Ligne subscriptions introuvable (cas limite) : jamais affichee
        // a moitie, silencieusement ignoree plutot qu'une erreur visible.
        if(!s)return;
        lignes.push({
          planId:s.plan_id||parSubscription[sid].plan_id,
          startsAt:s.starts_at,
          expiresAt:s.expires_at,
          actif: !s.expires_at || new Date(s.expires_at).getTime()>maintenant
        });
      });
      if(!lignes.length){
        box.innerHTML='';
        box.appendChild(emptyEl('dash_subhistory_empty'));
        return;
      }
      // Tri du plus recent au plus ancien par date de debut.
      lignes.sort((a,b)=>new Date(b.startsAt||0)-new Date(a.startsAt||0));
      // Le badge "Actif" ne peut JAMAIS porter que sur le plan le plus
      // recent (cas limite reel trouve en base : un compte ayant confirme
      // plusieurs plans Lifetime successifs aurait, sans cette regle,
      // plusieurs expires_at=null en meme temps -> plusieurs badges
      // "Actif" simultanes, ce qui n'a pas de sens). Tous les autres,
      // meme sans date d'expiration, sont affiches comme "Expire" des
      // qu'un plan plus recent existe.
      lignes.forEach((l,i)=>{
        l.actif = i===0 && (!l.expiresAt || new Date(l.expiresAt).getTime()>maintenant);
      });
      lignes.sort((a,b)=>{
        if(a.actif!==b.actif)return a.actif?-1:1;
        return new Date(b.startsAt||0)-new Date(a.startsAt||0);
      });
      box.innerHTML='';
      lignes.forEach(l=>{
        const pl=window.VB_planById?window.VB_planById(l.planId):null;
        const nom=pl?stripTags(window.VB_planLabel(pl)):l.planId;
        const debut=fmtLong(l.startsAt);
        const fin=l.expiresAt?fmtLong(l.expiresAt):t('wiz_d_never');
        const div=document.createElement('div');
        div.className='subh-item'+(l.actif?' is-actif':'');
        div.innerHTML=
          '<div><div class="subh-item-name"></div>'+
          '<div class="subh-item-dates"></div></div>'+
          '<span class="subh-badge '+(l.actif?'actif':'expire')+'"></span>';
        div.querySelector('.subh-item-name').textContent=nom;
        div.querySelector('.subh-item-dates').textContent=debut+' \u2192 '+fin;
        div.querySelector('.subh-badge').textContent=t(l.actif?'dash_subh_actif':'dash_subh_expire');
        box.appendChild(div);
      });
    }catch(e){
      box.innerHTML='';
      box.appendChild(emptyEl('dash_empty_err'));
    }
  }
  function renderSub(){
    const st=getState()||{};
    const stateEl=document.getElementById('dashSubState');
    const exp=isExpired();
    const pend=isPending();
    const rej=isRejected();
    const susp=!!(window.VB_estSuspendu&&window.VB_estSuspendu());
    stateEl.textContent=t(susp?'dash_sub_suspended':(pend?'dash_sub_pending':(rej?'dash_sub_rejected':(exp?'dash_sub_expired':'dash_sub_active'))));
    stateEl.classList.toggle('is-expired',(exp||rej)&&!pend&&!susp);
    stateEl.classList.toggle('is-pending',pend&&!susp);
    stateEl.classList.toggle('is-suspended',susp);
    // Compte suspendu : etat prioritaire sur tout le reste. Aucune action
    // de souscription/renouvellement/changement de plan n'est proposee,
    // aucune information de plan n'est affichee comme active — jamais,
    // meme si un plan etait actif au moment de la suspension (il est mis
    // en pause cote serveur, voir admin_suspend_user).
    if(susp){
      document.getElementById('dashSubUpgrade').hidden=true;
      document.querySelectorAll('.dash-sub-planblock').forEach(elB=>{elB.hidden=true;});
      document.getElementById('dashSubNoPlan').hidden=true;
      const bannerS=document.getElementById('dashPendingBanner');
      const motif=(window.VB_suspensionMotif&&window.VB_suspensionMotif())||'';
      document.getElementById('dashPendingBannerTxt').textContent=
        motif?t('dash_sub_msg_suspended').replace('{reason}',motif):t('auth_suspended_p');
      bannerS.hidden=false;
      document.getElementById('dashSubHolder').textContent=st.fullname||'—';
      document.getElementById('dashSubEmail').textContent=st.email||'—';
      const wrapS=document.getElementById('dashSubProgWrap');
      if(wrapS)wrapS.style.display='none';
      return;
    }
    // Lifetime : aucune option de renouvellement n'apparait.
    // Pendant l'attente de validation : rien a payer de plus non plus.
    const life=!!(window.VB_isLifetime&&window.VB_isLifetime());
    const changementEnAttente=!!st.pendingPlanId;
    // Plan actif, confirme, pas encore expire, mais dans sa fenetre de
    // rappel de renouvellement — pour le message dedie ci-dessous.
    const bientotExpire=!changementEnAttente&&!pend&&!rej&&!exp&&
      !!(window.VB_inRenewWindow&&window.VB_inRenewWindow());
    const upg=document.getElementById('dashSubUpgrade');
    upg.hidden=life||pend||changementEnAttente;
    // CORRECTIF : "Activer mon plan" pour qui n'a jamais ete confirme,
    // "Renouveler" seulement pour un plan reellement expire.
    upg.textContent=t(rej?'dash_activate_cta':(exp?'dash_expired_cta':'dash_sub_upgrade'));
    const pl=(window.VB_planById?window.VB_planById(st.planId):null);
    // CORRECTIF : sans AUCUN plan (jamais confirme/refuse, planId nul), on
    // n'affiche plus de fausses informations de "plan" (nom, prix, dates,
    // moyen de paiement, reference, barre de progression) — seules les
    // informations de COMPTE (titulaire, e-mail) restent visibles, avec un
    // message clair et le bouton pour activer un premier plan.
    const aUnPlan=!!pl;
    document.querySelectorAll('.dash-sub-planblock').forEach(elB=>{elB.hidden=!aUnPlan;});
    document.getElementById('dashSubNoPlan').hidden=aUnPlan;
    document.getElementById('dashSubName').textContent=pl?String(window.VB_planLabel(pl)).replace(/<[^>]*>/g,''):'';
    document.getElementById('dashSubPrix').textContent=pl?money(pl.prix)+' HTG':'';

    // Message unique, pilote par l'etat REEL de l'abonnement — un seul
    // visible a la fois, qui change automatiquement des que l'etat change
    // (validation, refus, expiration, periode de fin, ou plan sain) :
    // 1. changement en attente (plan actif + nouvelle demande en cours) ;
    // 2. premiere souscription en attente (aucun plan actif encore) ;
    // 3. paiement echoue/refuse (aucun plan actif) ;
    // 4. plan reellement expire ;
    // 5. plan actif mais dans sa fenetre de rappel de renouvellement ;
    // 6. plan actif et sain (aucun rappel a faire).
    const banner=document.getElementById('dashPendingBanner');
    let msgTxt='';
    // CORRIGÉ (31/08 v5, remarque de James persistante) : le premier
    // correctif ne nommait le plan que pour le cas "changement pendant
    // qu'un plan actif existe encore" (state.pendingPlanId). Mais un user
    // EXPIRÉ qui relance un renouvellement écrit directement
    // state.planId (voir completePayment : planEnCoursValide est faux
    // pour un expiré, donc c'est la branche "else" qui s'exécute, jamais
    // pendingPlanId) — ce cas retombait donc sur le message générique
    // "en attente de validation" SANS jamais nommer le plan. Le plan visé
    // est maintenant résolu depuis pendingPlanId EN PRIORITÉ, sinon
    // planId — couvre les deux chemins d'écriture identiquement.
    // Le message disparaît de lui-même dès que l'admin confirme (pend
    // repasse à false, payStatus='confirmed') ou refuse (payStatus=
    // 'rejected', pend passe à false) — aucune action cote client requise.
    const nomPlanAttendu=(()=>{
      const p=window.VB_planById?window.VB_planById(st.pendingPlanId||st.planId):null;
      return p?String(window.VB_planLabel(p)).replace(/<[^>]*>/g,''):'—';
    })();
    if(changementEnAttente&&aUnPlan){
      msgTxt=t('dash_pending_change_banner').replace('{plan}',nomPlanAttendu);
    }else if(changementEnAttente||pend){
      msgTxt=t('dash_sub_msg_pending_plan').replace('{plan}',nomPlanAttendu);
    }else if(rej){
      msgTxt=t('dash_sub_msg_rejected');
    }else if(exp){
      msgTxt=t('dash_sub_msg_expired');
    }else if(bientotExpire){
      msgTxt=t('dash_sub_msg_renew_soon').replace('{date}',fmtLong(st.endDate));
    }else if(aUnPlan){
      msgTxt=t('dash_sub_msg_active').replace('{plan}',pl?String(window.VB_planLabel(pl)).replace(/<[^>]*>/g,''):'');
    }
    document.getElementById('dashPendingBannerTxt').textContent=msgTxt;
    banner.hidden=!msgTxt;

    document.getElementById('dashSubHolder').textContent=st.fullname||'—';
    document.getElementById('dashSubEmail').textContent=st.email||'—';
    document.getElementById('dashSubStart').textContent=fmtLong(st.startDate);
    document.getElementById('dashSubEnd').textContent=st.endDate?fmtLong(st.endDate):t('wiz_d_never');
    const methodLbl={moncash:'MonCash',natcash:'NatCash',stripe:'Stripe (Carte/PayPal)'};
    document.getElementById('dashSubMethod').textContent=methodLbl[st.payMethod]||'—';
    document.getElementById('dashSubRef').textContent=st.ref||'—';

    /* Duree restante : calculee sur les vraies dates du plan ACTIF.
       Elle suit donc automatiquement tout changement ou renouvellement. */
    const wrap=document.getElementById('dashSubProgWrap');
    const fill=document.getElementById('dashSubProgFill');
    const left=document.getElementById('dashSubLeft');
    const ROUGE={p1:1,p2:3,p3:7};                 // seuil d'alerte par plan

    if(st.paid&&st.planId==='p4'){
      // Lifetime : barre pleine, sans expiration
      wrap.style.display='';
      fill.style.width='100%';
      fill.classList.remove('is-low');
      fill.classList.add('is-life');
      left.textContent=t('dash_sub_lifetime');
    }else if(st.startDate&&st.endDate){
      wrap.style.display='';
      const s0=new Date(st.startDate).getTime(),s1=new Date(st.endDate).getTime(),now=Date.now();
      const total=Math.max(1,s1-s0);
      const restePct=Math.max(0,Math.min(100,(s1-now)/total*100));
      const daysLeft=Math.max(0,Math.ceil((s1-now)/86400000));
      fill.style.width=restePct+'%';              // la barre represente ce qui RESTE
      fill.classList.remove('is-life');
      const seuil=ROUGE[st.planId];
      fill.classList.toggle('is-low',seuil!=null&&daysLeft<=seuil);
      left.textContent=t('dash_sub_days').replace('{n}',daysLeft);
    }else{
      wrap.style.display='none';
    }
  }

  /* ---- Notifications ---- */
  function renderNotifs(){
    notifs=construireNotifs();
    const list=document.getElementById('dashNotifList');
    list.innerHTML='';
    if(!notifs.length){
      list.innerHTML='<div class="dash-notif-empty">'+t('dash_notif_empty')+'</div>';
    }else{
      const tone={won:'',new:'gold',sub:'red',plan:'gold'};
      const ico={
        won:'<path d="M5 12l4 4 10-10"/>',
        new:'<path d="M12 5v14M5 12h14"/>',
        sub:'<path d="M12 8v5M12 16.5v.5"/><circle cx="12" cy="12" r="9"/>',
        plan:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/>'
      };
      notifs.forEach(n=>{
        const d=document.createElement('div');
        d.className='dash-notif-item'+(n.unread?' unread':'');
        d.innerHTML='<span class="dash-notif-ic '+(tone[n.type]||'')+'"><svg class="ic" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">'+(ico[n.type]||'')+'</svg></span>'+
          '<span class="dash-notif-tx"><b></b><span>'+ilYA(n.ts)+'</span></span>';
        d.querySelector('.dash-notif-tx b').textContent=n.texte;
        list.appendChild(d);
      });
    }
    document.getElementById('dashBellDot').hidden=!notifs.some(n=>n.unread);
  }

  /* ---- Bascule de vue ---- */
  function renderAll(){
    document.getElementById('dashPlanName').textContent=(function(){
      // CORRECTIF : le badge doit refleter le plan CONFIRME, jamais un
      // plan encore 'pending' — sinon un premier paiement pas encore
      // valide par l'admin s'affiche comme s'il etait deja actif. Regle
      // explicite : tant que rien n'est confirme, le badge dit "Aucun
      // plan", meme si state.planId est deja rempli en local.
      // CORRIGÉ (31/08 v5, bug signalé par James) : un plan CONFIRME mais
      // dont la date de fin est deja passee restait affiche au badge
      // (payStatus reste 'confirmed' pour toujours — seule endDate change
      // avec le temps, rien ne remet jamais payStatus a autre chose tant
      // qu'aucun nouveau paiement n'est traite). Le badge doit repasser a
      // "Aucun plan" des l'expiration reelle, meme si l'utilisateur n'a
      // rien fait — et y rester tant qu'aucun RENOUVELLEMENT COMPLET
      // (nouvelle demande + confirmation admin) n'a eu lieu. Lifetime
      // (endDate null) n'expire jamais.
      const stB=getState();
      const nonExpire=stB&&(!stB.endDate||new Date(stB.endDate).getTime()>Date.now());
      const pl=(stB&&stB.paid&&stB.payStatus==='confirmed'&&nonExpire&&stB.planId&&window.VB_planById)?window.VB_planById(stB.planId):null;
      if(!pl)return t('dash_badge_none');
      // Libelle court reserve au badge du header (les cartes de plan gardent le nom complet)
      const court={p4:'LIFETIME'};
      return court[pl.id]||String(window.VB_planLabel(pl)).replace(/<[^>]*>/g,'');
    })();
    if(view==='today')renderToday();
    else if(view==='history')renderHistory();
    else if(view==='stats')renderStats();
    else if(view==='subhistory')renderSubHistory();
    else renderSub();
    renderNotifs();
  }
  /* Exposé (31/08) pour que le parcours de paiement puisse rafraîchir
     immédiatement l'affichage (bouton renouveler masqué, message "en
     attente" nommant le plan) dès qu'il détecte en base une demande déjà
     en attente — sans attendre un rechargement de page. */
  window.VB_refreshPlansUI=()=>{ try{ renderAll(); }catch(e){} };

  /* Historique de navigation interne : le bouton "Retounen" revient a la
     page precedente ; s'il n'y en a pas, il ferme le dashboard. */
  let viewStack=[];

  function setView(next,fromBack){
    if(next===view)return;
    if(!fromBack)viewStack.push(view);
    view=next;
    document.querySelectorAll('.dash-tab').forEach(x=>x.classList.toggle('on',x.dataset.dview===view));
    document.querySelectorAll('.dash-view').forEach(v=>v.classList.toggle('on',v.dataset.dview===view));
    document.querySelectorAll('.dash-menu-item[data-dmenu]').forEach(x=>x.classList.toggle('on',x.dataset.dmenu===view));
    dash.scrollTop=0;
    renderAll();
  }

  document.querySelectorAll('.dash-tab').forEach(b=>{
    b.addEventListener('click',()=>setView(b.dataset.dview));
  });

  /* Le bouton "Retour" navigue UNIQUEMENT a l'interieur du dashboard.
     S'il n'y a pas de page precedente, il ramene a la vue d'accueil
     (fiches du jour) et ne ferme jamais le dashboard.
     Seul "Quitter le dashboard" permet d'en sortir. */
  document.querySelectorAll('[data-dback]').forEach(b=>{
    b.addEventListener('click',()=>{
      if(viewStack.length){setView(viewStack.pop(),true);return;}
      if(view!=='today'){setView('today',true);return;}
      // deja sur la vue d'accueil : le bouton ne fait rien
    });
  });

  /* Menu du dashboard */
  const menuBtn=document.getElementById('dashMenuBtn');
  const menuBox=document.getElementById('dashMenu');
  function closeMenuBox(){menuBox.classList.remove('on');menuBtn.setAttribute('aria-expanded','false');}
  menuBtn.addEventListener('click',ev=>{
    ev.stopPropagation();
    const on=menuBox.classList.toggle('on');
    menuBtn.setAttribute('aria-expanded',on);
    if(on){
      notifBox.classList.remove('on');bell.setAttribute('aria-expanded','false');
      const st=getState();
      document.getElementById('dashMenuUser').textContent=(st&&st.fullname)?st.fullname:(st&&st.email?st.email:'');
      document.querySelectorAll('.dash-menu-item[data-dmenu]').forEach(x=>x.classList.toggle('on',x.dataset.dmenu===view));
    }
  });
  document.addEventListener('click',ev=>{
    if(!menuBox.contains(ev.target)&&ev.target!==menuBtn)closeMenuBox();
  });
  document.querySelectorAll('.dash-menu-item[data-dmenu]').forEach(b=>{
    b.addEventListener('click',()=>{closeMenuBox();setView(b.dataset.dmenu);});
  });
  document.getElementById('dashMenuExit').addEventListener('click',()=>{
    closeMenuBox();
    closeDash();
    // Deconnexion reelle, pas seulement visuelle : sans ca, la
    // restauration automatique au prochain chargement rouvrirait le
    // Dashboard malgre la demande explicite de sortie.
    try{
      if(window.VB_getSupabase){
        const sb=window.VB_getSupabase();
        if(sb&&sb.auth&&typeof sb.auth.signOut==='function')sb.auth.signOut().catch(()=>{});
      }
    }catch(e){ /* la sortie visuelle ne doit jamais dependre de ca */ }
  });

  document.querySelectorAll('[data-dfilter]').forEach(g=>{
    const scope=g.closest('.dash-view').dataset.dview;
    const kind=g.dataset.dfilter;
    g.querySelectorAll('.dash-fbtn').forEach(b=>{
      b.addEventListener('click',()=>{
        filters[scope][kind]=b.dataset.val;
        g.querySelectorAll('.dash-fbtn').forEach(x=>x.classList.toggle('on',x===b));
        renderAll();
      });
    });
  });

  /* ---- Notifications : ouverture ---- */
  const bell=document.getElementById('dashBell');
  const notifBox=document.getElementById('dashNotif');
  bell.addEventListener('click',ev=>{
    ev.stopPropagation();
    const on=notifBox.classList.toggle('on');
    bell.setAttribute('aria-expanded',on);
  });
  document.addEventListener('click',ev=>{
    if(!notifBox.contains(ev.target)&&ev.target!==bell){
      notifBox.classList.remove('on');bell.setAttribute('aria-expanded','false');
    }
  });
  document.getElementById('dashNotifClear').addEventListener('click',()=>{
    notifs.forEach(n=>{lus[n.id]=1;});
    saveLus();
    // Les notifications REELLES (issues du serveur) doivent aussi passer
    // 'read' en base — sinon elles reapparaitraient comme non lues sur un
    // autre appareil du meme compte, ou au prochain chargement des
    // qu'elles sont relues depuis Supabase.
    const idsAMarquer=notifs.filter(n=>n.sbId!=null&&!n.sbRead).map(n=>n.sbId);
    if(idsAMarquer.length){
      const sb=window.VB_getSupabase&&window.VB_getSupabase();
      if(sb){
        sb.from('notifications').update({read:true}).in('id',idsAMarquer)
          .then(()=>{ notifsReels.forEach(n=>{if(idsAMarquer.includes(n.id))n.read=true;}); })
          .catch(()=>{});
      }
    }
    renderNotifs();
  });

  /* ---- Ouverture / fermeture ---- */
  function openDash(){
    // le logo du dashboard reprend exactement celui de la page d'accueil
    const logo=document.querySelector('.logo-mark-img img');
    const dl=document.getElementById('dashLogo');
    if(logo&&logo.src&&!dl.getAttribute('src'))dl.src=logo.src;
    // CORRECTIF : recharger les notifications locales AVANT tout rendu,
    // au cas ou le compte connecte a change depuis le dernier chargement
    // de la page (sinon la liste du compte precedent resterait affichee).
    rechargerNotifsLocales();
    dash.classList.add('open');
    dash.scrollTop=0;
    document.body.style.overflow='hidden';
    viewStack=[];
    renderAll();
    document.getElementById('dashMenuBtn').focus();
    // Rafraichissement silencieux : un admin a peut-etre valide/refuse
    // le paiement depuis la derniere visite. Ne bloque jamais l'ouverture.
    if(window.VB_syncPayStatus){
      window.VB_syncPayStatus().then(changed=>{
        // Un plan qui vient de changer donne acces a d'autres fiches :
        // on relit la base, on ne se contente pas de re-afficher.
        if(changed)rafraichirFiches(true);
      });
    }
    // Fiches : toujours relues depuis la base a l'ouverture (elles sont
    // la seule source de verite), sans jamais bloquer l'affichage.
    rafraichirFiches(true);
    // Meme principe pour les notifications reelles (paiement confirme ou
    // refuse, changement de plan admin) : elles doivent apparaitre des
    // l'ouverture, meme si l'action admin a eu lieu depuis un autre appareil.
    chargerNotifsReelles().then(changed=>{ if(changed)renderNotifs(); });
    demarrerResyncPeriodique();
    demarrerRealtime();
  }
  /* Re-synchronisation automatique en arriere-plan, tant que le Dashboard
     reste ouvert : sans ca, une confirmation admin ne serait visible
     qu'apres avoir ferme puis rouvert le Dashboard (ou rafraichi la
     page). Toutes les 45 secondes suffit largement — jamais agressif,
     jamais bloquant, s'arrete des que le Dashboard se ferme. */
  /* ---- Phase 4 roadmap (27/08, section 17) : synchronisation temps reel ----
     Complement du polling 45s ci-dessous (jamais un remplacement — un
     canal Realtime peut se deconnecter silencieusement en arriere-plan
     mobile ; le polling reste le filet de securite qui garantit qu'on ne
     reste jamais desynchronise plus de 45s meme si Realtime tombe). Des
     qu'une fiche est inseree ou son statut change (nouvelle publication,
     reglement won/lost), rafraichirFiches(true) est appele immediatement
     au lieu d'attendre le prochain cycle de polling. */
  let rtChannel=null;
  function demarrerRealtime(){
    arreterRealtime();
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!sb.channel)return; // navigateur hors-ligne ou client non pret : le polling 45s prend deja le relais
    try{
      rtChannel=sb.channel('dash-tickets-'+Date.now())
        .on('postgres_changes',{event:'*',schema:'public',table:'tickets'},()=>{
          // On ne lit jamais le payload directement (RLS deja filtre ce
          // que ce canal recoit, mais on relit quand meme via la voie
          // normale chargerFichesReelles — jamais de contenu construit a
          // partir d'un evenement brut, meme methode que le reste du site).
          rafraichirFiches(true);
        })
        .subscribe();
    }catch(e){} // jamais bloquant : le polling 45s suffit si Realtime echoue
  }
  function arreterRealtime(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(rtChannel&&sb&&sb.removeChannel){try{sb.removeChannel(rtChannel);}catch(e){}}
    rtChannel=null;
  }

  // Un seul timer pour TOUS les badges compte à rebours de la page (29/08) —
  // jamais un setInterval par carte, inutilement coûteux si plusieurs
  // fiches sont affichées en même temps. Se contente de retexter chaque
  // badge deja present dans le DOM ; ne re-rend jamais les cartes elles-
  // memes (rafraichirFiches/le polling existant s'en charge deja).
  setInterval(()=>{
    document.querySelectorAll('.dtk-countdown[data-kickoff]').forEach(elCd=>{
      elCd.textContent=texteCompteARebours(elCd.dataset.kickoff);
    });
  },30000);

  let resyncTimer=null;
  function demarrerResyncPeriodique(){
    arreterResyncPeriodique();
    resyncTimer=setInterval(()=>{
      if(!dash.classList.contains('open')){arreterResyncPeriodique();return;}
      if(window.VB_syncPayStatus){
        window.VB_syncPayStatus().then(changed=>{ if(changed)rafraichirFiches(true); });
      }
      // Publication, modification, suppression ou changement de statut
      // d'une fiche cote Admin : visible ici sans rien fermer ni recharger.
      rafraichirFiches();
      chargerNotifsReelles().then(changed=>{ if(changed)renderNotifs(); });
    },45000);
  }
  function arreterResyncPeriodique(){
    if(resyncTimer){clearInterval(resyncTimer);resyncTimer=null;}
  }
  function closeDash(){
    dash.classList.remove('open');
    notifBox.classList.remove('on');
    document.getElementById('dashMenu').classList.remove('on');
    document.getElementById('dashMenuBtn').setAttribute('aria-expanded','false');
    document.body.style.overflow='';
    arreterResyncPeriodique();
    arreterRealtime();
  }
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&dash.classList.contains('open')){
      if(notifBox.classList.contains('on')){notifBox.classList.remove('on');return;}
      if(menuBox.classList.contains('on')){closeMenuBox();return;}
      if(viewStack.length){setView(viewStack.pop(),true);return;}
      if(view!=='today'){setView('today',true);return;}
      // Echap ne ferme pas le dashboard : seul "Quitter le dashboard" le fait.
    }
  });
  document.getElementById('dashSubUpgrade').addEventListener('click',()=>{
    closeDash();
    if(window.VB_openWizardPay)window.VB_openWizardPay();
  });
  document.getElementById('dashExpiredCta').addEventListener('click',()=>{
    closeDash();
    if(window.VB_openWizardPay)window.VB_openWizardPay();
  });
  document.getElementById('dashSoonCta').addEventListener('click',()=>{
    closeDash();
    if(window.VB_openWizardPay)window.VB_openWizardPay();
  });
  document.getElementById('dashChangePass').addEventListener('click',()=>{
    closeDash();
    if(window.VB_openPwReset)window.VB_openPwReset();
  });

  document.addEventListener('vb:langchange',()=>{
    if(dash.classList.contains('open'))renderAll();
  });

  window.VB_openDash=openDash;
  window.VB_renderAll=renderAll;
})();

/* ================= DASHBOARD ADMIN ================= */
(function(){
  const dash=document.getElementById('admDash');
  if(!dash)return;
  const T=()=>translations[currentLang]||translations.fr;
  const t=k=>(T()[k]!=null?T()[k]:(translations.fr[k]||''));
  const stripTags=h=>{const d=document.createElement('div');d.innerHTML=h;return d.textContent||'';};
  const money=n=>n.toLocaleString('fr-FR').replace(/\u202f|\u00a0/g,' ');
  const rank={p1:1,p2:2,p3:3,p4:4};

  let view='home';
  let viewStack=[];
  let currentUser=null;   // { id, email, username }
  let selectedUserId=null;

  function setView(next,fromBack){
    if(next===view)return;
    if(!fromBack)viewStack.push(view);
    view=next;
    document.querySelectorAll('#admDash .dash-menu-item[data-adm]').forEach(x=>x.classList.toggle('on',x.dataset.adm===view));
    document.querySelectorAll('#admDash .dash-view').forEach(v=>v.classList.toggle('on',v.dataset.adview===view));
    dash.scrollTop=0;
    if(view==='home')renderHome();
    if(view==='users')renderUsers();
    if(view==='payments')renderPayments();
    if(view==='revenus'){renderRevenue();renderRevenueTransactions(true);}
    if(view==='plans')renderPlans();
    if(view==='fiches'){majFiltresJodiA();renderFiches();}
    if(view==='faq')renderFaqList();
    if(view==='testimonials')renderTestiList();
    if(view==='landing')renderLandingStatsAdmin();
    if(view==='settings')renderSettings();
  }
  document.querySelectorAll('#admDash [data-adback]').forEach(b=>{
    b.addEventListener('click',()=>{
      if(viewStack.length)setView(viewStack.pop(),true);
      else setView('home',true);
      // Regle stricte : un bouton "Retour" ne fait jamais sortir du
      // Dashboard Admin — au pire il ramene a l'accueil admin.
    });
  });
  document.querySelectorAll('#admDash .dash-menu-item[data-adm]').forEach(b=>{
    b.addEventListener('click',()=>{closeAdmMenu();setView(b.dataset.adm);});
  });

  /* ---- Menu ---- */
  const menuBtn=document.getElementById('admMenuBtn');
  const menuBox=document.getElementById('admMenu');
  function closeAdmMenu(){menuBox.classList.remove('on');menuBtn.setAttribute('aria-expanded','false');}
  menuBtn.addEventListener('click',ev=>{
    ev.stopPropagation();
    const on=menuBox.classList.toggle('on');
    menuBtn.setAttribute('aria-expanded',on);
    if(on){
      document.getElementById('admMenuUser').textContent=(currentUser&&(currentUser.username||currentUser.email))||'';
    }
  });
  document.addEventListener('click',ev=>{
    if(!menuBox.contains(ev.target)&&ev.target!==menuBtn)closeAdmMenu();
  });

  /* ---- Ouverture / fermeture ----
     Seul "Quitter le Dashboard Admin" peut fermer completement. Tout le
     reste (Echap, clic hors-carte, bouton retour du navigateur) reste
     confine a l'interieur, sur le meme principe deja valide et teste
     pour le Dashboard utilisateur. */
  function openAdminDash(user){
    currentUser={id:user.id,email:user.email,username:(user.user_metadata&&user.user_metadata.username)||''};
    const logo=document.querySelector('.logo-mark-img img');
    const al=document.getElementById('admLogo');
    if(logo&&logo.src&&!al.getAttribute('src'))al.src=logo.src;
    viewStack=[];
    dash.classList.add('open');
    dash.scrollTop=0;
    document.body.style.overflow='hidden';
    history.pushState({admDash:true},'');
    view='home';
    viewStack=[];
    document.querySelectorAll('#admDash .dash-menu-item[data-adm]').forEach(x=>x.classList.toggle('on',x.dataset.adm==='home'));
    document.querySelectorAll('#admDash .dash-view').forEach(v=>v.classList.toggle('on',v.dataset.adview==='home'));
    renderHome();
  }
  function closeAdminDash(){
    dash.classList.remove('open');
    closeAdmMenu();
    document.body.style.overflow='';
    currentUser=null;
  }
  document.getElementById('admMenuExit').addEventListener('click',()=>{
    closeAdmMenu();
    // Deconnexion explicite : oublier cet appareil, la prochaine
    // connexion redemandera le code 2FA meme s'il avait ete "retenu".
    if(window.VB_mfaOublierAppareil&&currentUser&&currentUser.email)window.VB_mfaOublierAppareil(currentUser.email);
    closeAdminDash();
    try{
      if(window.VB_getSupabase){
        const sb=window.VB_getSupabase();
        if(sb&&sb.auth&&typeof sb.auth.signOut==='function')sb.auth.signOut().catch(()=>{});
      }
    }catch(e){ /* la sortie du dashboard ne doit jamais dependre de ca */ }
    // Redirection securisee vers la page de connexion du site.
    if(document.querySelector('[data-auth-open=login]'))document.querySelector('[data-auth-open=login]').click();
  });
  document.addEventListener('keydown',ev=>{
    if(ev.key!=='Escape'||!dash.classList.contains('open'))return;
    if(menuBox.classList.contains('on')){closeAdmMenu();return;}
    if(viewStack.length){setView(viewStack.pop(),true);return;}
    // Jamais de fermeture complete via Echap : seule la vue s'en va vers l'accueil.
  });
  window.addEventListener('popstate',()=>{
    if(!dash.classList.contains('open'))return;
    // Le bouton "retour" du navigateur ne doit jamais faire sortir de
    // l'admin : on reste dedans et on avance simplement dans l'historique interne.
    if(viewStack.length)setView(viewStack.pop(),true);
    history.pushState({admDash:true},'');
  });

  /* ---- Donnees reelles : accueil ---- */
  function kpi(val,label,tone,nav){
    return '<div class="dash-kpi'+(nav?' dash-kpi-clickable':'')+'"'+(nav?' data-nav="'+nav+'" role="button" tabindex="0"':'')+
      '><b'+(tone?' class="'+tone+'"':'')+'>'+val+'</b><span>'+label+'</span></div>';
  }
  async function renderHome(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    const box=document.getElementById('admKpisHome');
    if(!sb){box.innerHTML='<div class="rev-card"><span class="admdash-empty">'+t('adm_k_offline')+'</span></div>';return;}
    box.innerHTML='<div class="rev-card"><span class="admdash-empty">'+t('adm_k_loading')+'</span></div>';
    try{
      // Compteur "Fich" (28/08, demande explicite de James) : uniquement
      // les fiches EN COURS (status='pending'), pas le total historique
      // toutes-confondues -- une fiche reglee (won/lost/void) doit sortir
      // du compte des qu'elle bascule dans l'Historique, une fiche
      // supprimee sort naturellement du compte (simple COUNT sur l'etat
      // actuel de la base). Synchronise automatiquement quelle que soit
      // l'origine (bot automatique ou generation manuelle admin) -- le
      // filtre porte sur status, jamais sur la colonne source.
      // CHANGÉ (31/08 v6, demande explicite de James : "un seul compte
      // peut compter comme actif, pas deux fois" + "user sans plan/plan
      // expiré/admin supprime son plan doit changer le contrôle" + "les
      // plans actifs concernent les vrais comptes actifs, pas les
      // suspendus") — l'ancien COUNT(*) brut sur subscriptions
      // where status='active' pouvait compter deux lignes pour la même
      // personne, ne vérifiait jamais expires_at (une ligne restée à tort
      // 'active' après sa fin comptait indéfiniment), et incluait les
      // comptes suspendus (la suspension ne touche jamais
      // subscriptions.status, voir admin_suspend_user). Remplacé par
      // get_active_subscriptions_count(), qui applique les trois
      // corrections côté base — voir sa définition SQL pour le détail.
      // Croissance des inscriptions (nouveau, demande explicite de James :
      // "tableau plus beau" avec badges de variation comme le modèle
      // fourni). Seule la card Utilisateurs a une comparaison de période
      // qui a un vrai sens (nombre d'inscriptions) ; les 3 autres sont des
      // instantanés (compte actuel), pas des cumuls mensuels — un
      // pourcentage y serait fabriqué, pas une vraie donnée. Elles gardent
      // donc le même format visuel (icône + gros chiffre) mais avec une
      // note contextuelle à la place d'un badge inventé.
      const nowD=new Date();
      const debutMoisISO=new Date(Date.UTC(nowD.getUTCFullYear(),nowD.getUTCMonth(),1)).toISOString();
      const debutMoisPrecISO=new Date(Date.UTC(nowD.getUTCFullYear(),nowD.getUTCMonth()-1,1)).toISOString();
      const [{count:users},{data:subsActivesData},{count:paysPending},{count:tickets},{count:usersMois},{count:usersMoisPrec}]=await Promise.all([
        sb.from('profiles').select('id',{count:'exact',head:true}),
        sb.rpc('get_active_subscriptions_count'),
        sb.from('payments').select('id',{count:'exact',head:true}).eq('status','pending'),
        sb.from('tickets').select('id',{count:'exact',head:true}).eq('status','pending'),
        sb.from('profiles').select('id',{count:'exact',head:true}).gte('created_at',debutMoisISO),
        sb.from('profiles').select('id',{count:'exact',head:true}).gte('created_at',debutMoisPrecISO).lt('created_at',debutMoisISO)
      ]);
      const subsActives=(typeof subsActivesData==='number')?subsActivesData:null;
      box.innerHTML=
        revCard(IC_USERS,null,badgeVariation(usersMois||0,usersMoisPrec||0),t('adm_k_users'),(users!=null?String(users):'—'),null,t('adm_k_users_note'),'users') +
        revCard(IC_CHECK,'green','',t('adm_k_subs_active'),(subsActives!=null?String(subsActives):'—'),'green',t('adm_k_subs_note'),'users') +
        revCard(IC_CLOCK,null,'',t('adm_k_pay_pending'),(paysPending!=null?String(paysPending):'—'),'gold',t('adm_k_pay_note'),'payments') +
        revCard(IC_TICKET,null,'',t('adm_k_tickets'),(tickets!=null?String(tickets):'—'),null,t('adm_k_tickets_note'),'fiches');
      document.getElementById('admHomeUpdated').textContent=t('adm_updated_at').replace('{t}',new Date().toLocaleTimeString(currentLang==='en'?'en-US':'fr-FR',{hour:'2-digit',minute:'2-digit'}));
      box.querySelectorAll('[data-nav]').forEach(card=>{
        const aller=()=>setView(card.dataset.nav);
        card.addEventListener('click',aller);
        card.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();aller();}});
      });
      renderActiviteRecente();
      // RETIRE DEFINITIVEMENT (session diagnostic, 04/09, demande explicite
      // de James apres preuve concrete : badge desynchronise du vrai tableau
      // API-Sports -- plusieurs modes ?diag=... consomment du vrai quota sans
      // jamais passer par enregistrerQuotaReel, donc le badge sous-estime
      // toujours l'usage reel et l'ecart s'accumule. Deja reactive puis retire
      // une fois avant -- cette fois-ci, renderQuotaBadge() n'est plus appele
      // du tout depuis l'accueil admin. La fonction reste definie plus bas
      // (jamais supprimee) au cas ou une vraie source fiable soit branchee un
      // jour ; le suivi interne (verifierEtIncrementerQuota, qui bloque
      // reellement la generation si le quota est epuise) n'est jamais touche
      // par ce retrait -- uniquement l'affichage disparait.
      renderRevenue();
    }catch(e){
      box.innerHTML='<div class="rev-card"><span class="admdash-empty">'+t('adm_k_error')+'</span></div>';
    }
  }
  document.getElementById('admHomeRefresh').addEventListener('click',renderHome);

  // ============================================================
  // BADGE DE QUOTA API-SPORTS (29/08)
  // ------------------------------------------------------------
  // Lit get_api_quota_today (RPC Supabase, lecture seule, jamais
  // d'incrementation ici) -- synchronise avec le vrai compteur alimente
  // par le bot a chaque appel reel. Couleur : vert <60%, or 60-85%,
  // rouge >85% (zone ou le bot risque de s'arreter en cours de route).
  // Reutilisee aussi par la page de generation manuelle (voir plus bas).
  // ============================================================
  async function chargerQuotaApi(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return null;
    try{
      const {data,error}=await sb.rpc('get_api_quota_today',{p_provider:'api-sports-football',p_max:95});
      if(error)throw error;
      return Array.isArray(data)?data[0]:data;
    }catch(e){return null;}
  }
  // VRAI quota (session suivante) : lit get_real_api_quota_today, alimenté
  // par les en-têtes x-ratelimit-* d'API-Sports sur chaque appel réel des
  // bots (bot-generate-tickets-background.js, -manual-background.js,
  // bot-diagnostics.js) — remplace le compteur interne ci-dessus comme
  // seule source affichée. est_du_jour=false = aucun appel réel depuis
  // minuit UTC : on ne devine jamais, on l'affiche clairement.
  // CHANGÉ (31/08 v2, demande explicite de James : "quota restant séparé
  // foot/basket en temps réel") : accepte désormais un provider explicite
  // — football et basketball sont deux abonnements API-Sports RÉELLEMENT
  // distincts (même clé d'API, deux produits séparés, chacun son propre
  // plafond de 100/jour) — jamais le même compteur. 'api-sports-football'
  // reste la valeur par défaut pour tout appelant existant non modifié.
  async function chargerQuotaReelApi(provider){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return null;
    try{
      const {data,error}=await sb.rpc('get_real_api_quota_today',{p_provider:provider||'api-sports-football'});
      if(error)throw error;
      return Array.isArray(data)?data[0]:data;
    }catch(e){return null;}
  }
  function classeQuota(pct){
    if(pct>=85)return 'rouge';
    if(pct>=60)return 'or';
    return 'vert';
  }
  // Un badge pour UN provider (foot OU basket) — factorisé (31/08 v2) pour
  // être réutilisé à la fois par le badge double de l'accueil
  // (renderQuotaBadge) et par le badge simple, contextuel au mode choisi,
  // de la page de génération manuelle (renderQuotaBadgeGen).
  function htmlBadgeQuota(q,labelSport){
    if(!q || !q.est_du_jour){
      return '<div class="adm-quota-badge or"><span class="adm-quota-badge-txt">'+
        (labelSport?'<b>'+stripTags(labelSport)+'</b> — ':'')+t('adm_quota_inconnu')+'</span></div>';
    }
    const pct=q.real_limit?Math.round((q.real_limit-q.real_remaining)/q.real_limit*100):0;
    const cls=classeQuota(pct);
    const heure=new Date(q.real_captured_at).toLocaleTimeString(currentLang==='en'?'en-US':'fr-FR',{hour:'2-digit',minute:'2-digit'});
    // Affichage en CHIFFRES (demande explicite de James, 31/08 v3 :
    // "afficher en chiffre, quota utilisé 80/100, toujours synchronisé") —
    // {used} calculé à chaque rendu à partir de la donnée FRAÎCHE renvoyée
    // par get_real_api_quota_today (jamais mis en cache côté client), donc
    // toujours à jour au moment où l'admin ouvre la page ou clique
    // Actualiser — jamais une valeur figée.
    const used=q.real_limit!=null&&q.real_remaining!=null?Math.max(0,q.real_limit-q.real_remaining):null;
    return '<div class="adm-quota-badge '+cls+'">'+
      '<span class="adm-quota-badge-pct">'+pct+'%</span>'+
      '<span class="adm-quota-badge-txt">'+(labelSport?'<b>'+stripTags(labelSport)+'</b> — ':'')+
      t('adm_quota_lbl_reel')
        .replace('{used}',used!=null?used:'—')
        .replace('{remaining}',q.real_remaining)
        .replace('{max}',q.real_limit)
        .replace('{time}',heure)+'</span></div>';
  }
  // Badge de l'accueil admin (CHANGÉ 31/08 v2 puis 04/09, demande explicite
  // de James : "quota restant séparé foot/basket en temps réel", puis
  // "juste les chiffres... si pas possible de savoir exactement supprime
  // cette partie") — CHANGÉ 04/09 : affiche uniquement le badge compact
  // "used/max" quand le vrai quota est connu aujourd'hui (est_du_jour) ;
  // sinon la ligne de ce sport est simplement OMISE (jamais le long
  // avertissement affiché ici auparavant — celui-ci reste utile sur la
  // page de génération manuelle, renderQuotaBadgeGen, jamais touché ici,
  // car il y sert un vrai but actionnable). Si les deux sports sont
  // inconnus, le conteneur entier reste vide plutôt que d'afficher quoi
  // que ce soit — jamais une valeur devinée pour combler le vide.
  async function renderQuotaBadge(){
    const wrap=document.getElementById('admQuotaBadgeWrap');
    if(!wrap)return;
    const [qFoot,qBasket]=await Promise.all([
      chargerQuotaReelApi('api-sports-football'),
      chargerQuotaReelApi('api-sports-basketball')
    ]);
    const morceaux=[];
    if(qFoot&&qFoot.est_du_jour)morceaux.push(htmlBadgeQuota(qFoot,t('adm_quota_sport_foot')));
    if(qBasket&&qBasket.est_du_jour)morceaux.push(htmlBadgeQuota(qBasket,t('adm_quota_sport_basket')));
    wrap.innerHTML=morceaux.map((h,i)=>i===0?h:'<div style="margin-top:6px">'+h+'</div>').join('');
  }
  // Version "page de génération manuelle" (29/08, rebranchée sur le vrai
  // quota session suivante) : même badge, plus un avertissement clair si
  // le quota restant est trop bas pour générer correctement (voire
  // désactive carrément le bouton si réellement épuisé). Un appel manuel
  // consomme jusqu'à 60 requêtes (1 fixtures + jusqu'à 59 odds) — sous
  // PLAFOND_MANUEL_ALERTE, la génération reste possible mais avec un pool
  // forcément plus pauvre. Si aucune vraie donnée du jour n'existe encore,
  // le bouton reste actif (on ne bloque jamais sur une inconnue) mais un
  // avertissement invite à lancer ?diag=quota-status d'abord.
  const PLAFOND_MANUEL_ALERTE=15;
  // CHANGÉ (31/08 v2, demande explicite de James : "synchroniser avec
  // indice quota dans admin pour suivre en temps réel le nombre de quota
  // restant si je veux générer manuellement une fiche") : lisait AVANT
  // toujours le quota FOOTBALL, même quand admGenMode==='basket' (l'admin
  // regardait un quota qui n'était pas celui réellement consommé par le
  // formulaire ouvert). Lit désormais le bon provider selon le mode
  // ouvert — 'exact' consomme le même quota que 'normal' (même produit
  // API-Sports football, seul le marché diffère), seul 'basket' consomme
  // le quota basketball, réellement séparé.
  // CHANGÉ (04/09 v3, demande explicite de James : "les quota étaient
  // aussi sur la page création de fiche manuel, il faut enlever là
  // aussi") — le badge visuel disparaît complètement de cette page
  // (jamais de texte de quota affiché ici, connu ou non). La SÉCURITÉ qui
  // désactive le bouton de génération quand le vrai quota du jour est
  // réellement épuisé (real_remaining<=0) reste active en silence — ce
  // n'est pas un affichage, jamais retiré, uniquement le texte visible.
  async function renderQuotaBadgeGen(){
    const wrap=document.getElementById('admGenQuotaWrap');
    const btn=document.getElementById('admGenSubmit');
    if(wrap)wrap.innerHTML='';
    if(!btn)return;
    const provider=admGenMode==='basket'?'api-sports-basketball':'api-sports-football';
    const q=await chargerQuotaReelApi(provider);
    btn.disabled=!!(q&&q.est_du_jour&&q.real_remaining<=0);
  }

  // ============================================================================
  // CARDS DE STATISTIQUES REVENUS (01/09, demande explicite de James) — lit
  // get_revenue_stats() (RPC dediee, protegee is_admin(), meme migration
  // que ce correctif, deja en ligne). Regle absolue, jamais contournee :
  // un revenu n'est compte que si le paiement est 'confirmed' (valide par
  // un admin) — un paiement 'pending' n'est JAMAIS affiche comme du
  // revenu. Toutes les valeurs viennent de vraies lignes de la table
  // payments, jamais de donnees inventees. Meme palette que le reste du
  // site (voir CSS .rev-card). Synchronisation stricte : la carte de
  // l'accueil ET la vue dediee du menu affichent TOUJOURS exactement les
  // memes chiffres, puisque c'est le meme appel RPC qui remplit les deux
  // conteneurs a chaque fois.
  // ============================================================================
  function icRev(path){
    return '<svg class="ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+path+'</svg>';
  }
  const IC_TREND='<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
  const IC_CALENDAR='<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>';
  const IC_CHECK='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>';
  const IC_CLOCK='<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  const IC_USERS='<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>';
  const IC_TICKET='<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>';
  function badgeVariation(actuel,precedent){
    if(!precedent||precedent<=0)return '';
    const pct=Math.round((actuel-precedent)/precedent*100);
    const sens=pct>=0?'up':'down';
    const fleche=pct>=0?'↑':'↓';
    return '<span class="rev-card-badge '+sens+'">'+fleche+' '+(pct>=0?'+':'')+pct+'%</span>';
  }
  function revCard(iconPath,iconTone,badgeHtml,label,valeurHtml,valueClass,note,nav){
    return '<div class="rev-card'+(nav?' dash-kpi-clickable':'')+'"'+(nav?' data-nav="'+nav+'" role="button" tabindex="0"':'')+'>'+
      '<div class="rev-card-top">'+
        '<span class="rev-card-ic'+(iconTone?' '+iconTone:'')+'">'+icRev(iconPath)+'</span>'+
        (badgeHtml||'')+
      '</div>'+
      '<div class="rev-card-lbl">'+label+'</div>'+
      '<div class="rev-card-val'+(valueClass?' '+valueClass:'')+'">'+valeurHtml+'</div>'+
      (note?'<div class="rev-card-note">'+note+'</div>':'')+
    '</div>';
  }
  async function renderRevenue(){
    const boxes=[document.getElementById('admRevCards'),document.getElementById('admRevCardsFull')].filter(Boolean);
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!boxes.length)return;
    if(!sb){boxes.forEach(b=>{b.innerHTML='<div class="rev-card"><span class="admdash-empty">'+t('adm_k_offline')+'</span></div>';});return;}
    try{
      const {data,error}=await sb.rpc('get_revenue_stats');
      if(error)throw error;
      const r=(Array.isArray(data)?data[0]:data)||{};
      const totalConfirme=r.total_confirmed!=null?r.total_confirmed:0;
      const moisConfirme=r.month_confirmed!=null?r.month_confirmed:0;
      const moisPrecConfirme=r.month_prev_confirmed!=null?r.month_prev_confirmed:0;
      const moisCount=r.month_confirmed_count!=null?r.month_confirmed_count:0;
      const moisPrecCount=r.month_prev_confirmed_count!=null?r.month_prev_confirmed_count:0;
      const enAttenteMontant=r.pending_amount!=null?r.pending_amount:0;
      const enAttenteCount=r.pending_count!=null?r.pending_count:0;
      const html=
        revCard(IC_TREND,null,'',t('adm_rev_total'),money(totalConfirme)+' <small>HTG</small>','gold',t('adm_rev_total_note'))+
        revCard(IC_CALENDAR,'green',badgeVariation(moisConfirme,moisPrecConfirme),t('adm_rev_mois'),money(moisConfirme)+' <small>HTG</small>')+
        revCard(IC_CHECK,'green',badgeVariation(moisCount,moisPrecCount),t('adm_rev_paiements'),String(moisCount))+
        revCard(IC_CLOCK,'neutre','',t('adm_rev_attente'),money(enAttenteMontant)+' <small>HTG</small>',null,t('adm_rev_attente_note').replace('{n}',enAttenteCount));
      boxes.forEach(b=>{b.innerHTML=html;});
      const heureMaj=t('adm_updated_at').replace('{t}',new Date().toLocaleTimeString(currentLang==='en'?'en-US':'fr-FR',{hour:'2-digit',minute:'2-digit'}));
      const updEl=document.getElementById('admRevUpdated');
      if(updEl)updEl.textContent=heureMaj;
    }catch(e){
      boxes.forEach(b=>{b.innerHTML='<div class="rev-card"><span class="admdash-empty">'+t('adm_k_error')+'</span></div>';});
    }
  }

  // ============================================================================
  // HISTORIQUE COMPLET DES TRANSACTIONS (01/09, demande explicite de James) —
  // sous les cards Revenus : CHAQUE transaction, echouee ou reussie
  // ('failed','pending','confirmed','refunded' — jamais de filtre de
  // statut ici, contrairement a l'onglet Paiements). Reutilise
  // chargerPaiements()/chargerUsers() (meme cache, meme source que
  // l'onglet Paiements — jamais deux logiques de lecture differentes qui
  // pourraient diverger) et exactement le meme rendu de ligne
  // (.admdash-row / badges) pour rester visuellement identique au reste
  // du site. Toujours les plus recentes en premier (created_at desc, deja
  // l'ordre de chargerPaiements). Pagination cote client par lots de 15
  // via le bouton "Charger plus anciens" — le jeu de donnees (paiements
  // du site) reste modeste, un vrai .range() cote serveur n'apporterait
  // rien de plus fiable ici.
  // ============================================================================
  let admRevTxOffset=0;
  const REV_TX_PAGE=15;
  async function renderRevenueTransactions(reset){
    const list=document.getElementById('admRevTxList');
    const moreBtn=document.getElementById('admRevTxMore');
    if(!list)return;
    if(reset){admRevTxOffset=0;}
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';if(moreBtn)moreBtn.style.display='none';return;}
    if(admRevTxOffset===0)list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    try{
      const [pays,users]=await Promise.all([chargerPaiements(),chargerUsers()]);
      const usersById={};users.forEach(u=>{usersById[u.id]=u;});
      if(admRevTxOffset===0)list.innerHTML='';
      if(!pays.length){
        list.innerHTML='<div class="admdash-empty">'+t('adm_pay_empty')+'</div>';
        if(moreBtn)moreBtn.style.display='none';
        return;
      }
      const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
      const badgeCls={pending:'pending',confirmed:'actif',failed:'expire',refunded:'aucun'};
      const badgeLbl={pending:'adm_pay_f_pending',confirmed:'adm_pay_f_confirmed',failed:'adm_pay_f_rejected',refunded:'adm_pay_f_refunded'};
      const page=pays.slice(admRevTxOffset,admRevTxOffset+REV_TX_PAGE);
      const html=page.map(p=>{
        const u=usersById[p.user_id];
        const nom=u?(u.username||u.email):p.user_id;
        return '<button type="button" class="admdash-row" data-pid="'+p.id+'">'+
          '<span class="admdash-row-av">'+(p.plan_id||'?').toUpperCase().slice(0,2)+'</span>'+
          '<span class="admdash-row-tx"><b>'+nom+'</b><span>'+(p.amount_htg||0)+' HTG · '+
          (p.method||'—')+' · '+fmt(p.created_at)+'</span></span>'+
          '<span class="admdash-row-badge '+(badgeCls[p.status]||'aucun')+'">'+t(badgeLbl[p.status]||'adm_badge_none')+'</span>'+
          '</button>';
      }).join('');
      list.insertAdjacentHTML('beforeend',html);
      const nouvelles=list.querySelectorAll('button.admdash-row:not([data-bound])');
      nouvelles.forEach(btn=>{
        btn.setAttribute('data-bound','1');
        btn.addEventListener('click',()=>{selectedPayId=btn.dataset.pid;setView('paydetail');renderPayDetail();});
      });
      admRevTxOffset+=page.length;
      if(moreBtn)moreBtn.style.display=(admRevTxOffset<pays.length)?'':'none';
    }catch(e){
      if(admRevTxOffset===0)list.innerHTML='<div class="admdash-empty">'+t('adm_k_error')+'</div>';
      if(moreBtn)moreBtn.style.display='none';
    }
  }
  const admRevTxMoreBtn=document.getElementById('admRevTxMore');
  if(admRevTxMoreBtn)admRevTxMoreBtn.addEventListener('click',()=>renderRevenueTransactions(false));

  const admRevRefreshBtn=document.getElementById('admRevRefresh');
  if(admRevRefreshBtn)admRevRefreshBtn.addEventListener('click',()=>{
    renderRevenue();
    paysCache=null; // rafraichissement manuel : relit vraiment la base, jamais le cache
    renderRevenueTransactions(true);
  });

  // ============================================================================
  // RAPPORT APPRENTISSAGE CONTINU (session suivante, roadmap "amélioration
  // continue") — lecture seule, réservée admin (get_rapport_apprentissage,
  // migration du même jour). Deux sections : (1) taux de réussite réel par
  // championnat+marché (identique à market_reliability) ; (2) taux de
  // réussite réel par label de confiance A-E — permet de vérifier dans le
  // temps si les seuils de classerConfiance (bot) sont bien calibrés,
  // jamais supposés corrects définitivement. N'affecte AUCUNE génération —
  // purement informatif pour l'admin.
  // ============================================================================
  async function chargerRapportApprentissage(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return null;
    try{
      const {data,error}=await sb.rpc('get_rapport_apprentissage');
      if(error)throw error;
      return data||[];
    }catch(e){return null;}
  }
  function formaterLigneApprentissage(l){
    const pct=(l.taux_reussite!=null)?Math.round(l.taux_reussite*100)+'%':'—';
    return '<div class="admdash-updated" style="display:flex;justify-content:space-between;gap:8px;padding:3px 0">'+
      '<span>'+l.cle+'</span><span>'+l.gagnes+'/'+l.echantillon+' · '+pct+'</span></div>';
  }
  async function afficherRapportApprentissage(){
    const zone=document.getElementById('admApprentissageResultat');
    if(!zone)return;
    zone.innerHTML='<span class="admdash-updated">'+t('adm_k_loading')+'</span>';
    const lignes=await chargerRapportApprentissage();
    if(!lignes){zone.innerHTML='<span class="admdash-updated">'+t('adm_apprentissage_indispo')+'</span>';return;}
    if(!lignes.length){zone.innerHTML='<span class="admdash-updated">'+t('adm_apprentissage_vide')+'</span>';return;}
    const parMarche=lignes.filter(l=>l.section==='championnat_marche');
    const parLabel=lignes.filter(l=>l.section==='label_confiance');
    let html='';
    if(parLabel.length){
      html+='<b class="admdash-updated">'+t('adm_apprentissage_labels')+'</b>'+parLabel.map(formaterLigneApprentissage).join('');
    }
    if(parMarche.length){
      html+='<b class="admdash-updated" style="display:block;margin-top:8px">'+t('adm_apprentissage_marches')+'</b>'+parMarche.map(formaterLigneApprentissage).join('');
    }
    zone.innerHTML=html;
  }
  const admApprentissageBtn=document.getElementById('admApprentissageBtn');
  if(admApprentissageBtn) admApprentissageBtn.addEventListener('click', afficherRapportApprentissage);

  /* Fil d'activite recente : montre les paiements en attente d'action.
     Aucune liste separee a maintenir — une fois un paiement valide ou
     refuse, il n'est simplement plus 'pending' et disparait de lui-meme
     au prochain rendu (celui-ci se re-declenche a chaque retour sur
     l'accueil, jamais besoin de le faire disparaitre manuellement). */
  async function renderActiviteRecente(){
    const box=document.getElementById('admActiviteRecente');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!box)return;
    try{
      const {data:pays}=await sb.from('payments')
        .select('id,user_id,plan_id,amount_htg,method,created_at')
        .eq('status','pending').order('created_at',{ascending:false}).limit(8);
      if(!pays||!pays.length){
        box.innerHTML='<div class="admdash-empty">'+t('adm_activity_empty')+'</div>';
        return;
      }
      const users=await chargerUsers();
      const usersById={};users.forEach(u=>{usersById[u.id]=u;});
      const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}):'—';
      box.innerHTML=pays.map(p=>{
        const u=usersById[p.user_id];
        const nom=u?(u.username||u.email):p.user_id;
        return '<button type="button" class="admdash-row" data-pid="'+p.id+'">'+
          '<span class="admdash-row-av">'+(p.plan_id||'?').toUpperCase().slice(0,2)+'</span>'+
          '<span class="admdash-row-tx"><b>'+t('adm_activity_pending_pay').replace('{name}',nom)+'</b>'+
          '<span>'+(p.amount_htg||0)+' HTG · '+(p.method||'—')+' · '+fmt(p.created_at)+'</span></span>'+
          '<span class="admdash-row-badge pending">'+t('adm_pay_f_pending')+'</span>'+
          '</button>';
      }).join('');
      // Clic sur un paiement en attente : ouvre exactement la meme
      // interface de validation/refus que depuis le menu Paiements
      // (25/08, demande explicite de James).
      box.querySelectorAll('[data-pid]').forEach(b=>{
        b.addEventListener('click',()=>{selectedPayId=b.dataset.pid;setView('paydetail');renderPayDetail();});
      });
    }catch(e){
      box.innerHTML='<div class="admdash-empty">'+t('adm_k_error')+'</div>';
    }
  }

  /* ---- Donnees reelles : utilisateurs ---- */
  function initiales(txt){
    return (txt||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase()||'?';
  }
  /* Double confirmation obligatoire pour TOUTE action admin sensible
     (valider/refuser un paiement, changer un plan, suspendre un compte).
     Affiche une page de confirmation en plein ecran avec une question
     explicite et deux boutons "Oui"/"Non". Seul "Oui" declenche
     reellement l'action ; "Non" ferme la page sans rien faire. */
  // Bibliotheque d'icones (04/09 v2, demande explicite de James : "il ne
  // suffit pas toujours de mettre une icone de poubelle... pour chaque
  // action une note... selon action que admin lance") — CHAQUE action a
  // desormais sa propre icone semantique, jamais un binaire poubelle/coche
  // generique. La poubelle rouge reste STRICTEMENT reservee aux vraies
  // suppressions (FAQ/temoignage/fiche) ; les autres actions bloquantes
  // (refus, suspension, 2FA) ont leur propre icone rouge distincte ;
  // toutes les actions positives (paiement valide, plan, fiche, mot de
  // passe, reactivation) ont une icone verte propre a leur nature.
  const ICONES_CONFIRM={
    trash:{tone:'danger',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>'},
    refus:{tone:'danger',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'},
    suspend:{tone:'danger',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="22" y2="13"/><line x1="22" y1="8" x2="17" y2="13"/></svg>'},
    shield:{tone:'danger',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 4 6v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V6z"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/></svg>'},
    payment:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5.5" width="19" height="14" rx="2.3"/><line x1="2.5" y1="10" x2="21.5" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>'},
    fiche:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>'},
    plan:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>'},
    reactivate:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>'},
    key:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4.5"/><path d="M11.3 11.7 20 3M16.5 6.5l3 3M13.3 9.7l2.6 2.6"/></svg>'},
    check:{tone:'default',svg:'<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>'}
  };
  // "icone" (04/09 v2) : cle explicite dans ICONES_CONFIRM ci-dessus,
  // determinee a chaque appel selon la VRAIE nature de l'action — jamais
  // devinee depuis le texte. 'check' par defaut si non precise (action
  // neutre/positive generique : enregistrement FAQ/temoignage par ex.).
  function demanderConfirmation(btn,texteQuestion,executer,icone){
    if(document.querySelector('.vb-confirm-overlay'))return;   // jamais deux a la fois
    const def=ICONES_CONFIRM[icone]||ICONES_CONFIRM.check;
    // Titre/sous-titre extraits du MEME texte deja fourni par chaque appel
    // (coupe au premier "?") — jamais une nouvelle cle i18n a traduire.
    const qMark=texteQuestion.indexOf('?');
    let titre=texteQuestion,sousTitre='';
    if(qMark!==-1){
      titre=texteQuestion.slice(0,qMark+1).trim();
      sousTitre=texteQuestion.slice(qMark+1).trim();
    }
    const overlay=document.createElement('div');
    overlay.className='vb-confirm-overlay';
    overlay.innerHTML=
      '<div class="vb-confirm-modal">'+
        '<div class="vb-confirm-icon '+def.tone+'">'+def.svg+'</div>'+
        '<p class="vb-confirm-title"></p>'+
        (sousTitre?'<p class="vb-confirm-sub"></p>':'')+
        '<div class="vb-confirm-btns">'+
          '<button type="button" class="btn vb-confirm-no">'+t('adm_confirm_no')+'</button>'+
          '<button type="button" class="btn vb-confirm-yes '+def.tone+'">'+t('adm_confirm_yes')+'</button>'+
        '</div>'+
      '</div>';
    // textContent (jamais innerHTML) pour le titre/sous-titre : ce sont des
    // chaines i18n de confiance, mais reflexe systematique contre l'injection.
    overlay.querySelector('.vb-confirm-title').textContent=titre;
    const subEl=overlay.querySelector('.vb-confirm-sub');
    if(subEl)subEl.textContent=sousTitre;
    document.body.appendChild(overlay);
    overlay.querySelector('.vb-confirm-no').addEventListener('click',()=>overlay.remove());
    overlay.querySelector('.vb-confirm-yes').addEventListener('click',()=>{
      overlay.remove();
      executer();
    });
  }
  let usersCache=null;
  async function chargerUsers(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return [];
    if(usersCache)return usersCache;
    try{
      const {data,error}=await sb.from('profiles')
        .select('id,email,username,role,preferred_site,created_at,suspended_at,suspended_by,suspended_reason')
        .order('created_at',{ascending:false})
        .limit(200);
      usersCache=(!error&&data)?data:[];
    }catch(e){
      usersCache=[];   // jamais d'exception non interceptee : on degrade proprement
    }
    return usersCache;
  }
  async function renderUsers(){
    const list=document.getElementById('admUserList');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    const users=await chargerUsers();
    const q=(document.getElementById('admUserSearch').value||'').trim().toLowerCase();
    const filtres=q?users.filter(u=>(u.email||'').toLowerCase().includes(q)):users;
    document.getElementById('admUserCount').textContent=t('adm_users_count').replace('{n}',filtres.length);
    if(!filtres.length){list.innerHTML='<div class="admdash-empty">'+t('adm_users_empty')+'</div>';return;}

    // Abonnement actif de chacun, en un seul aller-retour.
    let subsByUser={};
    try{
      const ids=filtres.map(u=>u.id);
      const {data:subs}=await sb.from('subscriptions').select('user_id,plan_id,status,expires_at').in('user_id',ids).eq('status','active');
      (subs||[]).forEach(s=>{subsByUser[s.user_id]=s;});
    }catch(e){}

    list.innerHTML=filtres.map(u=>{
      const sub=subsByUser[u.id];
      let badge='<span class="admdash-row-badge aucun">'+t('adm_badge_none')+'</span>';
      if(sub){
        const expire=sub.expires_at&&new Date(sub.expires_at).getTime()<=Date.now();
        badge='<span class="admdash-row-badge '+(expire?'expire':'actif')+'">'+
          (sub.plan_id||'').toUpperCase()+(expire?' · '+t('adm_badge_expired'):'')+'</span>';
      }
      // La suspension prime sur tout le reste : un compte suspendu doit
      // rester visible immediatement dans la liste, peu importe son plan.
      if(u.suspended_at)badge='<span class="admdash-row-badge suspendu">'+t('adm_badge_suspended')+'</span>';
      // Le badge Admin prime sur tout : un compte admin n'a ni plan ni
      // statut de suspension pertinent a afficher ici.
      if(u.role==='admin')badge='<span class="admdash-row-badge actif">'+t('adm_role_admin')+'</span>';
      return '<button type="button" class="admdash-row" data-uid="'+u.id+'">'+
        '<span class="admdash-row-av">'+initiales(u.username||u.email)+'</span>'+
        '<span class="admdash-row-tx"><b>'+(u.username||t('adm_no_name'))+'</b><span>'+u.email+'</span></span>'+
        badge+
        '</button>';
    }).join('');
    list.querySelectorAll('[data-uid]').forEach(b=>{
      b.addEventListener('click',()=>{selectedUserId=b.dataset.uid;setView('userdetail');renderUserDetail();});
    });
  }
  document.getElementById('admUserSearch').addEventListener('input',()=>{renderUsers();});

  async function renderUserDetail(){
    const box=document.getElementById('admUserDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb||!selectedUserId)return;
    const users=await chargerUsers();
    const u=users.find(x=>x.id===selectedUserId);
    if(!u){box.innerHTML='<div class="admdash-empty">'+t('adm_users_empty')+'</div>';return;}

    // Un compte admin n'est pas un "utilisateur" au sens metier : ni plan,
    // ni abonnement, ni suspension n'ont de sens pour lui. Fiche minimale,
    // volontairement sans aucune action, pour eviter toute confusion.
    if(u.role==='admin'){
      box.innerHTML=
        '<div class="admdash-detail-h">'+
          '<span class="admdash-detail-av">'+initiales(u.username||u.email)+'</span>'+
          '<span><span class="admdash-detail-name">'+(u.username||t('adm_no_name'))+'</span>'+
          '<br><span class="admdash-detail-email">'+u.email+'</span></span>'+
        '</div>'+
        '<span class="admdash-row-badge actif" style="margin-top:14px;display:inline-block">'+t('adm_role_admin')+'</span>';
      return;
    }

    let subs=[],pays=[];
    try{
      const [{data:s},{data:p}]=await Promise.all([
        sb.from('subscriptions').select('id,plan_id,status,starts_at,expires_at').eq('user_id',u.id).order('starts_at',{ascending:false}),
        sb.from('payments').select('id,subscription_id,plan_id,amount_htg,method,status,reference,created_at').eq('user_id',u.id).order('created_at',{ascending:false})
      ]);
      subs=s||[];pays=p||[];
    }catch(e){}

    const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';
    const fmtH=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
    const subsHtml=subs.length?subs.map(s=>
      '<div class="admdash-hist-row"><dt>'+s.plan_id.toUpperCase()+' · '+s.status+'</dt>'+
      '<dd>'+fmt(s.starts_at)+' → '+(s.expires_at?fmt(s.expires_at):t('wiz_d_never'))+'</dd></div>'
    ).join('') : '<div class="admdash-hist-empty">'+t('adm_none_yet')+'</div>';

    const paysHtml=pays.length?pays.map(p=>
      '<div class="admdash-hist-row"><dt>'+p.plan_id.toUpperCase()+' · '+p.method+' · '+p.status+'</dt>'+
      '<dd>'+p.amount_htg+' HTG · '+fmt(p.created_at)+'</dd></div>'
    ).join('') : '<div class="admdash-hist-empty">'+t('adm_none_yet')+'</div>';

    // Plan reellement actif aujourd'hui, jamais devine : la premiere
    // ligne 'active' de l'historique (deja trie du plus recent au plus
    // ancien), ou aucun si l'utilisateur n'en a jamais eu.
    const planActif=subs.find(s=>s.status==='active')||null;
    const planActifObj=planActif?(window.VB_planById?window.VB_planById(planActif.plan_id):null):null;
    const estSuspendu=!!u.suspended_at;
    // Un paiement en attente doit pouvoir etre traite DIRECTEMENT depuis
    // cette fiche, exactement comme sur la page Paiements — jamais une
    // deuxieme facon de faire, juste un deuxieme endroit d'ou la
    // declencher (traiterPaiement() est la seule fonction qui ecrit).
    const paiementEnAttente=pays.find(p=>p.status==='pending')||null;

    // CHANGÉ (31/08 v6, demande explicite de James : le contrôle "plan
    // actif" doit aussi refléter le cas où l'admin RETIRE le plan, sans
    // en assigner un nouveau — ce cas n'existait pas avant, seul un
    // CHANGEMENT vers un autre plan était possible). Option supplémentaire
    // en tête de liste, valeur vide = "aucun plan" — gérée explicitement
    // dans changerPlanAdmin ci-dessous (ferme la ligne active, n'en insère
    // aucune nouvelle).
    const optionsPlans='<option value="">'+t('adm_user_plan_none_option')+'</option>'+
      (window.VB_allPlans?window.VB_allPlans():[]).map(pl=>
      '<option value="'+pl.id+'"'+(planActif&&planActif.plan_id===pl.id?' selected':'')+'>'+
      stripTags(window.VB_planLabel(pl))+' — '+money(pl.prix)+' HTG</option>'
    ).join('');

    box.innerHTML=
      '<div class="admdash-detail-h">'+
        '<span class="admdash-detail-av">'+initiales(u.username||u.email)+'</span>'+
        '<span><span class="admdash-detail-name">'+(u.username||t('adm_no_name'))+'</span>'+
        '<br><span class="admdash-detail-email">'+u.email+'</span></span>'+
      '</div>'+
      (estSuspendu?
        '<div class="dash-pending" style="border-color:rgba(226,99,79,.4);background:linear-gradient(140deg,rgba(226,99,79,.13),rgba(11,20,37,0) 62%),#100E18">'+
          '<span class="dash-pending-ic" style="background:rgba(226,99,79,.14);color:#E2634F;border-color:rgba(226,99,79,.32)">'+
            '<svg class="ic" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></svg>'+
          '</span>'+
          '<span class="dash-pending-tx"><b>'+t('adm_badge_suspended')+'</b>'+
          '<span>'+t('adm_user_suspended_since')+' '+fmtH(u.suspended_at)+(u.suspended_reason?' — '+u.suspended_reason:'')+'</span></span>'+
        '</div>'
        :'')+
      (paiementEnAttente?
        '<div class="admdash-section-h">'+t('adm_user_pending_pay_h')+'</div>'+
        '<div class="dash-pending">'+
          '<span class="dash-pending-ic">'+
            '<svg class="ic" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>'+
          '</span>'+
          '<span class="dash-pending-tx"><b>'+(paiementEnAttente.plan_id||'').toUpperCase()+' — '+(paiementEnAttente.amount_htg||0)+' HTG</b>'+
          '<span>'+(paiementEnAttente.method||'—')+' · '+t('adm_pay_ref')+' '+(paiementEnAttente.reference||'—')+'</span></span>'+
        '</div>'+
        '<label class="field" style="margin-top:12px"><span class="field-lbl">'+t('adm_pay_reason_lbl')+'</span>'+
        '<textarea id="admUserPayReason" placeholder="'+t('adm_pay_reason_ph')+'"></textarea></label>'+
        '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">'+
        '<button type="button" class="btn btn-confirm" id="admUserPayValider" style="flex:1">'+t('adm_pay_valider')+'</button>'+
        '<button type="button" class="btn btn-reject" id="admUserPayRefuser" style="flex:1">'+t('adm_pay_refuser')+'</button>'+
        '</div><div id="admUserPayActionErr" class="field-err" style="display:none;margin-top:8px"></div>'
        :'')+
      '<div class="admdash-section-h">'+t('adm_user_profile_h')+'</div>'+
      '<dl class="wiz-done-sum">'+
        '<div><dt>'+t('adm_user_role')+'</dt><dd>'+(u.role||'user')+'</dd></div>'+
        '<div><dt>'+t('adm_user_site')+'</dt><dd>'+(u.preferred_site||'—')+'</dd></div>'+
        '<div><dt>'+t('adm_user_since')+'</dt><dd>'+fmt(u.created_at)+'</dd></div>'+
        '<div><dt>'+t('adm_user_current_plan')+'</dt><dd>'+(planActifObj?stripTags(window.VB_planLabel(planActifObj)):t('adm_user_no_plan'))+'</dd></div>'+
      '</dl>'+

      '<div class="admdash-section-h">'+t('adm_user_change_plan_h')+'</div>'+
      '<label class="field"><span class="field-lbl">'+t('adm_user_change_plan_lbl')+'</span>'+
      '<select id="admUserPlanSelect">'+optionsPlans+'</select></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_user_change_plan_reason_lbl')+'</span>'+
      '<textarea id="admUserPlanReason" placeholder="'+t('adm_user_change_plan_reason_ph')+'"></textarea></label>'+
      '<button type="button" class="btn btn-confirm" id="admUserPlanApply" style="width:100%;margin-top:12px">'+t('adm_user_change_plan_apply')+'</button>'+
      '<div id="admUserPlanErr" class="field-err" style="display:none;margin-top:8px"></div>'+

      '<div class="admdash-section-h">'+t('adm_user_suspend_h')+'</div>'+
      (estSuspendu?
        '<button type="button" class="btn btn-confirm" id="admUserSuspendBtn" style="width:100%">'+t('adm_user_reactivate_btn')+'</button>'
        :
        '<label class="field"><span class="field-lbl">'+t('adm_user_suspend_reason_lbl')+'</span>'+
        '<textarea id="admUserSuspendReason" placeholder="'+t('adm_user_suspend_reason_ph')+'"></textarea></label>'+
        '<button type="button" class="btn btn-reject" id="admUserSuspendBtn" style="width:100%;margin-top:12px">'+t('adm_user_suspend_btn')+'</button>')+
      '<div id="admUserSuspendErr" class="field-err" style="display:none;margin-top:8px"></div>'+

      '<div class="admdash-section-h">'+t('adm_section_subs')+'</div>'+
      '<div class="admdash-hist">'+subsHtml+'</div>'+
      '<div class="admdash-section-h">'+t('adm_section_pays')+'</div>'+
      '<div class="admdash-hist">'+paysHtml+'</div>';

    if(paiementEnAttente){
      document.getElementById('admUserPayValider').addEventListener('click',function(){
        demanderConfirmation(this,t('adm_confirm_q_valider'),()=>
          traiterPaiement(paiementEnAttente,'confirmed',null,{
            btnV:document.getElementById('admUserPayValider'),
            btnR:document.getElementById('admUserPayRefuser'),
            errBox:document.getElementById('admUserPayActionErr'),
            onSuccess:()=>renderUserDetail()   // reste sur la fiche, ne navigue jamais vers Paiements
          }),'payment'
        );
      });
      document.getElementById('admUserPayRefuser').addEventListener('click',function(){
        const raison=(document.getElementById('admUserPayReason').value||'').trim();
        const err=document.getElementById('admUserPayActionErr');
        if(!raison){err.textContent=t('adm_pay_reason_required');err.style.display='block';return;}
        err.style.display='none';
        demanderConfirmation(this,t('adm_confirm_q_refuser'),()=>
          traiterPaiement(paiementEnAttente,'rejected',raison,{
            btnV:document.getElementById('admUserPayValider'),
            btnR:document.getElementById('admUserPayRefuser'),
            errBox:document.getElementById('admUserPayActionErr'),
            onSuccess:()=>renderUserDetail()
          }),'refus'
        );
      });
    }

    document.getElementById('admUserPlanApply').addEventListener('click',function(){
      const nouveauPlan=document.getElementById('admUserPlanSelect').value;
      const raison=(document.getElementById('admUserPlanReason').value||'').trim();
      const err=document.getElementById('admUserPlanErr');
      // CORRECTIF : le meme plan ne peut etre re-selectionne QUE si le
      // plan actif arrive reellement a sa date de fin (meme seuil de
      // rappel que celui deja utilise pour les notifications d'expiration
      // proche : 1/3/7 jours selon le plan). Empeche une re-activation
      // inutile d'un plan qui vient tout juste d'etre confirme, tout en
      // autorisant le renouvellement legitime d'un plan qui se termine.
      const RAPPEL_ADM={p1:1,p2:3,p3:7};
      let arriveAEcheance=false;
      if(planActif&&planActif.expires_at){
        const seuil=(RAPPEL_ADM[planActif.plan_id]||3)*86400000;
        arriveAEcheance=(new Date(planActif.expires_at).getTime()-Date.now())<=seuil;
      }
      if(planActif&&nouveauPlan&&planActif.plan_id===nouveauPlan&&!arriveAEcheance){
        err.textContent=t('adm_user_change_plan_same');err.style.display='block';return;
      }
      if(!nouveauPlan&&!planActif){
        // Rien a retirer : deja sans plan actif.
        err.textContent=t('adm_user_change_plan_same');err.style.display='block';return;
      }
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_planchange'),()=>changerPlanAdmin(u,planActif,nouveauPlan,raison),'plan');
    });

    document.getElementById('admUserSuspendBtn').addEventListener('click',function(){
      const err=document.getElementById('admUserSuspendErr');
      if(!estSuspendu){
        const raison=(document.getElementById('admUserSuspendReason').value||'').trim();
        if(!raison){err.textContent=t('adm_user_suspend_reason_required');err.style.display='block';return;}
        err.style.display='none';
        demanderConfirmation(this,t('adm_confirm_q_suspend'),()=>suspendreUtilisateur(u,true,raison),'suspend');
      }else{
        err.style.display='none';
        demanderConfirmation(this,t('adm_confirm_q_reactivate'),()=>suspendreUtilisateur(u,false,null),'reactivate');
      }
    });
  }

  /* Changement de plan force par un admin : effet IMMEDIAT, jamais une
     nouvelle ligne 'pending' — c'est une decision manuelle admin, pas un
     paiement client. On cloture l'abonnement actif existant (s'il y en a
     un) puis on cree le nouveau, deja 'active'. Aucune ligne payments
     n'est creee : aucun argent n'a transite par le site pour ce geste. */
  async function changerPlanAdmin(u,ancienSub,nouveauPlanId,raison){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admUserPlanApply');
    if(btn)btn.disabled=true;
    // Retrait explicite du plan (31/08 v6) : nouveauPlanId vide = admin
    // choisit "Aucun plan". On ferme les lignes 'active' existantes et on
    // s'ARRETE LA — jamais d'insertion d'une ligne fantôme avec
    // plan_id=null, qui aurait pu fausser à nouveau le compte "abonnements
    // actifs" (voir get_active_subscriptions_count, qui exige déjà
    // status='active' ET une vraie ligne, mais autant ne jamais créer une
    // ligne inutile en premier lieu).
    if(!nouveauPlanId){
      try{
        await sb.from('subscriptions').update({status:'cancelled'})
          .eq('user_id',u.id).eq('status','active');
        try{
          await sb.from('audit_log').insert({
            admin_id:(currentUser&&currentUser.id)||null,
            action:'admin_plan_remove',
            target_user_id:u.id,
            old_value:{plan_id:ancienSub?ancienSub.plan_id:null},
            new_value:{plan_id:null},
            reason:raison||null
          });
        }catch(e){}
        try{
          await sb.from('notifications').insert({
            user_id:u.id, type:'admin_plan_change', plan_id:null, reason:raison||null
          });
        }catch(e){}
        if(window.VB_toast)window.VB_toast('adm_user_plan_changed_h',t('adm_user_plan_removed_p'));
        renderUserDetail();
      }catch(e){
        const err=document.getElementById('admUserPlanErr');
        if(err){err.textContent=t('adm_user_change_plan_err')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
        if(btn)btn.disabled=false;
      }
      return;
    }
    try{
      const pl=window.VB_planById?window.VB_planById(nouveauPlanId):null;
      const maintenant=new Date();
      const fin=pl&&pl.days?new Date(maintenant.getTime()+pl.days*86400000).toISOString():null;
      // Ferme TOUS les abonnements encore 'active' de cette personne —
      // pas seulement celui identifie comme le plan actuel — au cas ou
      // plusieurs seraient restes actifs par erreur.
      try{
        await sb.from('subscriptions').update({status:'cancelled'})
          .eq('user_id',u.id).eq('status','active');
      }catch(e){}
      const {error:insErr}=await sb.from('subscriptions').insert({
        user_id:u.id, plan_id:nouveauPlanId, status:'active',
        starts_at:maintenant.toISOString(), expires_at:fin
      });
      if(insErr)throw insErr;
      try{
        await sb.from('audit_log').insert({
          admin_id:(currentUser&&currentUser.id)||null,
          action:'admin_plan_change',
          target_user_id:u.id,
          old_value:{plan_id:ancienSub?ancienSub.plan_id:null},
          new_value:{plan_id:nouveauPlanId},
          reason:raison||null
        });
      }catch(e){}
      // Notification REELLE pour l'utilisateur concerne : sans cette
      // ligne, un changement de plan fait depuis l'admin ne serait
      // jamais signale a la personne (voir table 'notifications').
      try{
        await sb.from('notifications').insert({
          user_id:u.id, type:'admin_plan_change', plan_id:nouveauPlanId, reason:raison||null
        });
      }catch(e){}
      if(window.VB_toast)window.VB_toast('adm_user_plan_changed_h',t('adm_user_plan_changed_p'));
      renderUserDetail();
    }catch(e){
      const err=document.getElementById('admUserPlanErr');
      if(err){err.textContent=t('adm_user_change_plan_err')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }

  /* Suspension / reactivation : appelle une fonction serveur atomique
     (admin_suspend_user / admin_reactivate_user) plutot que d'ecrire
     directement dans 'profiles'. Cette fonction, cote base de donnees :
       - verifie elle-meme que l'appelant est admin (jamais confiance au
         client) ;
       - met a jour profiles ET met en pause / reprend l'abonnement actif
         dans la MEME operation, pour qu'aucun etat intermediaire
         incoherent ne soit jamais visible (jamais un profil suspendu
         avec un abonnement encore 'active', meme une fraction de
         seconde) ;
       - a la reactivation, recalcule expires_at en ajoutant le temps de
         pause ecoule, pour ne jamais faire perdre un seul jour paye.
     Le blocage reel de connexion vient desormais de la RLS + de l'ecoute
     Realtime (voir tenterRestaurationSession et l'abonnement Realtime
     plus bas), plus seulement d'une verification au moment du login. */
  async function suspendreUtilisateur(u,suspendre,raison){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admUserSuspendBtn');
    if(btn)btn.disabled=true;
    try{
      const {error:rpcErr}=suspendre
        ?await sb.rpc('admin_suspend_user',{target_id:u.id, reason:raison||null})
        :await sb.rpc('admin_reactivate_user',{target_id:u.id});
      if(rpcErr)throw rpcErr;
      try{
        await sb.from('audit_log').insert({
          admin_id:(currentUser&&currentUser.id)||null,
          action:suspendre?'account_suspended':'account_reactivated',
          target_user_id:u.id,
          old_value:{suspended:!suspendre},
          new_value:{suspended:suspendre},
          reason:suspendre?(raison||null):null
        });
      }catch(e){}
      usersCache=null;   // le badge de la liste doit refleter le changement
      if(window.VB_toast)window.VB_toast(
        suspendre?'adm_user_suspended_h':'adm_user_reactivated_h',
        t(suspendre?'adm_user_suspended_p':'adm_user_reactivated_p')
      );
      renderUserDetail();
    }catch(e){
      const err=document.getElementById('admUserSuspendErr');
      if(err){err.textContent=t('adm_user_suspend_err')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }

  /* ---- Donnees reelles : paiements ----
     Le statut 'confirmed'/'rejected' d'un paiement ne peut JAMAIS etre
     atteint autrement que par cette action admin (regle de securite
     ecrite dans les policies Supabase, pas seulement ici). */
  let payFilter='pending';
  let paysCache=null;
  let selectedPayId=null;
  async function chargerPaiements(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return [];
    if(paysCache)return paysCache;
    try{
      const {data,error}=await sb.from('payments')
        .select('id,user_id,subscription_id,plan_id,amount_htg,method,status,reference,confirmed_at,confirmed_by,created_at')
        .order('created_at',{ascending:false}).limit(300);
      paysCache=(!error&&data)?data:[];
    }catch(e){
      paysCache=[];   // jamais d'exception non interceptee : on degrade proprement
    }
    return paysCache;
  }
  async function renderPayments(){
    const list=document.getElementById('admPayList');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    const [pays,users]=await Promise.all([chargerPaiements(),chargerUsers()]);
    const usersById={};users.forEach(u=>{usersById[u.id]=u;});
    // Le filtre "Refuses" (concept interne) correspond au statut reel
    // 'failed' en base — la contrainte SQL n'accepte pas 'rejected'.
    const DB_STATUT_FILTRE={pending:'pending',confirmed:'confirmed',rejected:'failed'};
    const filtres=payFilter==='all'?pays:pays.filter(p=>p.status===(DB_STATUT_FILTRE[payFilter]||payFilter));
    document.getElementById('admPayCount').textContent=t('adm_pay_count').replace('{n}',filtres.length);
    if(!filtres.length){list.innerHTML='<div class="admdash-empty">'+t('adm_pay_empty')+'</div>';return;}
    const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric'}):'—';
    const badgeCls={pending:'pending',confirmed:'actif',failed:'expire',refunded:'aucun'};
    const badgeLbl={pending:'adm_pay_f_pending',confirmed:'adm_pay_f_confirmed',failed:'adm_pay_f_rejected',refunded:'adm_pay_f_refunded'};
    list.innerHTML=filtres.map(p=>{
      const u=usersById[p.user_id];
      const nom=u?(u.username||u.email):p.user_id;
      return '<button type="button" class="admdash-row" data-pid="'+p.id+'">'+
        '<span class="admdash-row-av">'+(p.plan_id||'?').toUpperCase().slice(0,2)+'</span>'+
        '<span class="admdash-row-tx"><b>'+nom+'</b><span>'+(p.amount_htg||0)+' HTG · '+
        (p.method||'—')+' · '+fmt(p.created_at)+'</span></span>'+
        '<span class="admdash-row-badge '+(badgeCls[p.status]||'aucun')+'">'+t(badgeLbl[p.status]||'adm_badge_none')+'</span>'+
        '</button>';
    }).join('');
    list.querySelectorAll('[data-pid]').forEach(b=>{
      b.addEventListener('click',()=>{selectedPayId=b.dataset.pid;setView('paydetail');renderPayDetail();});
    });
  }
  document.querySelectorAll('#admPayFilter .dash-fbtn').forEach(b=>{
    b.addEventListener('click',()=>{
      payFilter=b.dataset.val;
      document.querySelectorAll('#admPayFilter .dash-fbtn').forEach(x=>x.classList.toggle('on',x===b));
      renderPayments();
    });
  });

  async function renderPayDetail(){
    const box=document.getElementById('admPayDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb||!selectedPayId)return;
    const [pays,users]=await Promise.all([chargerPaiements(),chargerUsers()]);
    const p=pays.find(x=>x.id===selectedPayId);
    if(!p){box.innerHTML='<div class="admdash-empty">'+t('adm_pay_empty')+'</div>';return;}
    const u=users.find(x=>x.id===p.user_id);
    const fmt=iso=>iso?new Date(iso).toLocaleDateString(currentLang==='en'?'en-US':'fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}):'—';
    const methodLbl={moncash:'MonCash',natcash:'NatCash',stripe:'Stripe (Carte/PayPal)'};
    const statusLbl={pending:t('adm_pay_f_pending'),confirmed:t('adm_pay_f_confirmed'),failed:t('adm_pay_f_rejected'),refunded:t('adm_pay_f_refunded')};

    // Il n'existe pas de colonne "raison du refus" sur payments : elle vit
    // uniquement dans audit_log.reason. On la retrouve en cherchant, parmi
    // les decisions recentes, celle dont new_value.payment_id correspond
    // exactement a ce paiement (jamais une simple coincidence de date).
    let raisonRefus=null;
    if(p.status==='failed'){
      try{
        const {data:logs}=await sb.from('audit_log')
          .select('reason,new_value,created_at')
          .eq('action','payment_rejected')
          .order('created_at',{ascending:false}).limit(100);
        const match=(logs||[]).find(l=>l.new_value&&l.new_value.payment_id===p.id);
        if(match)raisonRefus=match.reason;
      }catch(e){ /* si l'audit est illisible, on affiche le reste sans bloquer */ }
    }

    box.innerHTML=
      '<div class="admdash-detail-h">'+
        '<span class="admdash-detail-av">'+(p.plan_id||'?').toUpperCase().slice(0,2)+'</span>'+
        '<span><span class="admdash-detail-name">'+(u?(u.username||t('adm_no_name')):t('adm_no_name'))+'</span>'+
        '<br><span class="admdash-detail-email">'+(u?u.email:'—')+'</span></span>'+
      '</div>'+
      '<dl class="wiz-done-sum" style="margin-top:16px">'+
        '<div><dt>'+t('adm_pay_plan')+'</dt><dd>'+(p.plan_id||'—').toUpperCase()+'</dd></div>'+
        '<div><dt>'+t('adm_pay_amount')+'</dt><dd>'+(p.amount_htg||0)+' HTG</dd></div>'+
        '<div><dt>'+t('adm_pay_method')+'</dt><dd>'+(methodLbl[p.method]||p.method||'—')+'</dd></div>'+
        '<div><dt>'+t('adm_pay_ref')+'</dt><dd>'+(p.reference||'—')+'</dd></div>'+
        '<div><dt>'+t('adm_pay_date')+'</dt><dd>'+fmt(p.created_at)+'</dd></div>'+
        '<div><dt>'+t('adm_pay_status')+'</dt><dd>'+statusLbl[p.status]+'</dd></div>'+
        (p.status==='confirmed'&&p.confirmed_at?
          '<div><dt>'+t('adm_pay_confirmed_at')+'</dt><dd>'+fmt(p.confirmed_at)+'</dd></div>':'')+
      '</dl>'+
      (p.status==='failed'&&raisonRefus?
        '<div class="admdash-section-h">'+t('adm_pay_reason_h')+'</div>'+
        '<div class="admdash-hist"><div class="admdash-hist-row"><dd>'+raisonRefus+'</dd></div></div>'
        :'')+
      (p.status==='pending'?
        '<div class="admdash-section-h">'+t('adm_pay_action_h')+'</div>'+
        (u&&u.suspended_at?
          '<div class="field-err" style="display:block;margin-bottom:12px">'+t('adm_pay_blocked_suspended')+'</div>'
          :'')+
        '<label class="field"><span class="field-lbl">'+t('adm_pay_reason_lbl')+'</span>'+
        '<textarea id="admPayReason" placeholder="'+t('adm_pay_reason_ph')+'"'+(u&&u.suspended_at?' disabled':'')+'></textarea></label>'+
        '<div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">'+
        '<button type="button" class="btn btn-confirm" id="admPayValider" style="flex:1"'+(u&&u.suspended_at?' disabled':'')+'>'+t('adm_pay_valider')+'</button>'+
        '<button type="button" class="btn btn-reject" id="admPayRefuser" style="flex:1"'+(u&&u.suspended_at?' disabled':'')+'>'+t('adm_pay_refuser')+'</button>'+
        '</div><div id="admPayActionErr" class="field-err" style="display:none;margin-top:8px"></div>'
        :'');

    if(p.status==='pending'&&!(u&&u.suspended_at)){
      document.getElementById('admPayValider').addEventListener('click',async function(){
        // Verification fraiche, au moment du clic : le bouton peut etre
        // reste actif si la fiche a ete ouverte AVANT la suspension du
        // compte. Sans ca, le clic finirait par heurter le garde-fou de
        // l'abonnement (guard 'plus en attente') avec un message
        // trompeur, au lieu du vrai motif (compte suspendu). La boite de
        // confirmation oui/non ne doit meme pas apparaitre dans ce cas.
        const encoreSuspendu=await (async()=>{
          try{
            const sbFresh=window.VB_getSupabase&&window.VB_getSupabase();
            if(!sbFresh)return false;
            const {data:profFresh}=await sbFresh.from('profiles')
              .select('suspended_at').eq('id',p.user_id).single();
            return !!(profFresh&&profFresh.suspended_at);
          }catch(e){return false;}
        })();
        if(encoreSuspendu){
          const errS=document.getElementById('admPayActionErr');
          errS.textContent=t('adm_pay_blocked_suspended');
          errS.style.display='block';
          return;
        }
        demanderConfirmation(this,t('adm_confirm_q_valider'),()=>traiterPaiement(p,'confirmed'),'payment');
      });
      document.getElementById('admPayRefuser').addEventListener('click',async function(){
        const raison=(document.getElementById('admPayReason').value||'').trim();
        const err=document.getElementById('admPayActionErr');
        if(!raison){err.textContent=t('adm_pay_reason_required');err.style.display='block';return;}
        err.style.display='none';
        // Meme verification fraiche que pour "Confirmer", voir ci-dessus.
        const encoreSuspendu=await (async()=>{
          try{
            const sbFresh=window.VB_getSupabase&&window.VB_getSupabase();
            if(!sbFresh)return false;
            const {data:profFresh}=await sbFresh.from('profiles')
              .select('suspended_at').eq('id',p.user_id).single();
            return !!(profFresh&&profFresh.suspended_at);
          }catch(e){return false;}
        })();
        if(encoreSuspendu){
          err.textContent=t('adm_pay_blocked_suspended');
          err.style.display='block';
          return;
        }
        demanderConfirmation(this,t('adm_confirm_q_refuser'),()=>traiterPaiement(p,'rejected',raison),'refus');
      });
    }
  }

  /* 1 raison reelle = 1 action. La validation/refus est TOUJOURS ecrite
     cote serveur (jamais reproductible depuis le navigateur d'un
     utilisateur normal) — c'est cette fonction, et elle seule, qui fait
     passer un paiement a 'confirmed'/'rejected' et l'abonnement associe
     a 'active'/'cancelled'.
     'opts' permet de reutiliser EXACTEMENT cette meme fonction depuis un
     autre contexte (la fiche utilisateur) sans dupliquer la logique :
     btnV/btnR/errBox pointent vers les boutons/zone d'erreur reellement
     affiches a l'ecran a cet endroit-la, et onSuccess remplace la
     navigation par defaut (utile pour rester sur la fiche utilisateur au
     lieu d'etre renvoye vers la page Paiements). Aucun parametre fourni =
     comportement historique inchange. */
  async function traiterPaiement(p,newStatus,raison,opts){
    opts=opts||{};
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btnV=opts.btnV||document.getElementById('admPayValider');
    const btnR=opts.btnR||document.getElementById('admPayRefuser');
    if(btnV)btnV.disabled=true;
    if(btnR)btnR.disabled=true;
    try{
      // 'newStatus' est le concept interne (confirmed/rejected) utilise dans
      // toute l'UI admin. La colonne reelle 'payments.status' n'accepte que
      // pending/confirmed/failed/refunded (contrainte SQL du projet) — on
      // traduit donc ici, au seul endroit qui ecrit vraiment en base.
      // Il n'existe PAS de colonne reject_reason sur payments : la raison
      // du refus vit uniquement dans audit_log.reason (ecrit plus bas).
      const statutReel=newStatus==='confirmed'?'confirmed':'failed';
      const payUpdate={status:statutReel, confirmed_by:(currentUser&&currentUser.id)||null};
      if(newStatus==='confirmed')payUpdate.confirmed_at=new Date().toISOString();
      const {error:payErr}=await sb.from('payments').update(payUpdate).eq('id',p.id);
      if(payErr)throw payErr;
      if(p.subscription_id){
        const subStatus=newStatus==='confirmed'?'active':'cancelled';
        // Garde-fou absolu : avant d'activer ce nouvel abonnement, on
        // ferme TOUT autre abonnement encore marque 'active' pour cette
        // meme personne — c'est ICI, au moment de la vraie confirmation,
        // que l'ancien plan (garde actif pendant toute l'attente) doit
        // ceder la place au nouveau. Jamais avant. Si cette fermeture
        // echoue, on N'ACTIVE PAS le nouveau — jamais deux abonnements
        // actifs en meme temps, meme temporairement.
        if(subStatus==='active'&&p.user_id){
          const {error:closeErr}=await sb.from('subscriptions').update({status:'cancelled'})
            .eq('user_id',p.user_id).eq('status','active').neq('id',p.subscription_id);
          if(closeErr)throw closeErr;
        }
        const subUpdate={status:subStatus};
        if(subStatus==='active'){
          // Les vraies dates ne sont fixees qu'ici, au moment reel de la
          // confirmation — jamais a la soumission du paiement, qui peut
          // dater de plusieurs jours plus tot.
          const plConfirme=window.VB_planById?window.VB_planById(p.plan_id):null;
          const debut=new Date();
          subUpdate.starts_at=debut.toISOString();
          if(plConfirme&&plConfirme.days){
            const fin=new Date(debut);
            fin.setDate(fin.getDate()+plConfirme.days);
            subUpdate.expires_at=fin.toISOString();
          }else{
            subUpdate.expires_at=null;   // plan Lifetime : jamais d'expiration
          }
        }
        // CORRECTIF IMPORTANT : cette ecriture n'etait auparavant jamais
        // verifiee — un echec silencieux ici affichait quand meme "plan
        // actif" a l'admin alors que rien n'avait reellement change.
        // GARDE-FOU ABSOLU : cette ecriture ne doit JAMAIS pouvoir toucher
        // une ligne deja 'active' — que ce soit au moment d'un refus ou
        // d'une confirmation. Elle ne peut s'appliquer qu'a une ligne
        // encore 'pending' (celle de CETTE demande precise, valider ou
        // refuser). C'est la garantie, au niveau base de donnees, qu'un
        // paiement pending/refuse pour un NOUVEAU plan ne peut jamais
        // modifier, annuler ou desactiver le plan DEJA ACTIF d'une
        // personne — meme en cas d'incoherence sur p.subscription_id
        // (cache admin perime, double-clic, etc.).
        const {error:subErr,count:subCount}=await sb.from('subscriptions')
          .update(subUpdate,{count:'exact'})
          .eq('id',p.subscription_id).eq('status','pending');
        if(subErr)throw subErr;
        if(!subCount){
          // La ligne n'etait deja plus 'pending' (deja traitee ailleurs,
          // ou incoherence de donnees) : le garde-fou a bloque l'ecriture
          // a raison — on le dit clairement a l'admin plutot que de
          // laisser croire que l'abonnement a ete mis a jour.
          throw new Error('Abonnement deja modifie ailleurs (plus en attente) : aucune ecriture appliquee, par securite.');
        }
      }
      // Journal d'audit — schema reel : id, admin_id, action, target_user_id,
      // old_value (jsonb), new_value (jsonb), reason, created_at.
      // Degrade silencieusement si l'ecriture echoue (ne bloque jamais
      // l'action principale, deja ecrite ci-dessus).
      try{
        await sb.from('audit_log').insert({
          admin_id:(currentUser&&currentUser.id)||null,
          action:newStatus==='confirmed'?'payment_confirmed':'payment_rejected',
          target_user_id:p.user_id||null,
          old_value:{payment_id:p.id, status:'pending'},
          new_value:{payment_id:p.id, status:newStatus, subscription_id:p.subscription_id||null},
          reason:newStatus==='rejected'?(raison||null):null
        });
      }catch(e){}
      // Notification REELLE pour l'utilisateur concerne : c'est ce qui
      // manquait pour que "paiement pending -> reussi/refuse" declenche
      // effectivement quelque chose cote utilisateur (voir table
      // 'notifications' + construireNotifs/chargerNotifsReelles cote client).
      if(p.user_id){
        try{
          await sb.from('notifications').insert({
            user_id:p.user_id,
            type:newStatus==='confirmed'?'payment_confirmed':'payment_rejected',
            plan_id:p.plan_id||null,
            reason:newStatus==='rejected'?(raison||null):null
          });
        }catch(e){}
      }
      paysCache=null;   // le prochain affichage relira l'etat reel — quel que soit l'endroit d'ou on relit
      if(window.VB_toast)window.VB_toast(
        newStatus==='confirmed'?'adm_pay_toast_confirmed_h':'adm_pay_toast_rejected_h',
        t(newStatus==='confirmed'?'adm_pay_toast_confirmed_p':'adm_pay_toast_rejected_p')
      );
      if(opts.onSuccess)opts.onSuccess();
      else if(viewStack.length)setView(viewStack.pop(),true);
      else setView('payments',true);
    }catch(e){
      const err=opts.errBox||document.getElementById('admPayActionErr');
      if(err){
        const detail=(e&&e.message)?(' — '+e.message):'';
        err.textContent=t('adm_pay_action_error')+detail;
        err.style.display='block';
      }
      if(btnV)btnV.disabled=false;
      if(btnR)btnR.disabled=false;
    }
  }

  /* ---- Donnees reelles : plans ----
     Editer ici change le prix/duree REEL, partout sur le site,
     immediatement (recap paiement, montant ecrit dans payments,
     tableau de bord, cette meme page) — jamais un aperçu isole. */
  let selectedPlanId=null;
  let plansCache=null;
  async function chargerPlansAdmin(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return [];
    if(plansCache)return plansCache;
    try{
      const {data,error}=await sb.from('plans').select('id,name,price_htg,price_before_htg,duration_days,rank').order('rank',{ascending:true});
      plansCache=(!error&&data)?data:[];
    }catch(e){plansCache=[];}
    return plansCache;
  }
  async function renderPlans(){
    const list=document.getElementById('admPlansList');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    const plans=await chargerPlansAdmin();
    if(!plans.length){list.innerHTML='<div class="admdash-empty">'+t('adm_plans_empty')+'</div>';return;}
    list.innerHTML=plans.map(p=>{
      const local=window.VB_planById?window.VB_planById(p.id):null;
      const nom=local?stripTags(window.VB_planLabel(local)):(p.name||p.id);
      return '<button type="button" class="admdash-row" data-plid="'+p.id+'">'+
        '<span class="admdash-row-av">'+p.id.toUpperCase().slice(0,2)+'</span>'+
        '<span class="admdash-row-tx"><b>'+nom+'</b><span>'+
        (p.price_before_htg?'<s style="opacity:.6">'+money(p.price_before_htg)+'</s> ':'')+
        money(p.price_htg)+' HTG · '+
        (p.duration_days?p.duration_days+' j':t('wiz_d_never'))+'</span></span>'+
        '</button>';
    }).join('');
    list.querySelectorAll('[data-plid]').forEach(b=>{
      b.addEventListener('click',()=>{selectedPlanId=b.dataset.plid;setView('plandetail');renderPlanDetail();});
    });
  }
  async function renderPlanDetail(){
    const box=document.getElementById('admPlanDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb||!selectedPlanId)return;
    const plans=await chargerPlansAdmin();
    const p=plans.find(x=>x.id===selectedPlanId);
    if(!p){box.innerHTML='<div class="admdash-empty">'+t('adm_plans_empty')+'</div>';return;}
    const local=window.VB_planById?window.VB_planById(p.id):null;
    const nom=local?stripTags(window.VB_planLabel(local)):(p.name||p.id);
    box.innerHTML=
      '<div class="admdash-detail-h">'+
        '<span class="admdash-detail-av">'+p.id.toUpperCase().slice(0,2)+'</span>'+
        '<span><span class="admdash-detail-name">'+nom+'</span>'+
        '<br><span class="admdash-detail-email">'+p.id+'</span></span>'+
      '</div>'+
      '<label class="field" style="margin-top:16px"><span class="field-lbl">'+t('adm_plans_price_lbl')+'</span>'+
      '<input type="number" min="0" step="1" id="admPlanPrice" value="'+p.price_htg+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_plans_price_before_lbl')+'</span>'+
      '<input type="number" min="0" step="1" id="admPlanPriceBefore" value="'+(p.price_before_htg!=null?p.price_before_htg:'')+'" placeholder="'+t('adm_plans_price_before_ph')+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_plans_days_lbl')+'</span>'+
      '<input type="number" min="0" step="1" id="admPlanDays" value="'+(p.duration_days||'')+'" placeholder="'+t('adm_plans_days_ph')+'"></label>'+
      '<button type="button" class="btn btn-confirm" id="admPlanSave" style="width:100%;margin-top:14px">'+t('adm_plans_save')+'</button>'+
      '<div id="admPlanErr" class="field-err" style="display:none;margin-top:8px"></div>';

    document.getElementById('admPlanSave').addEventListener('click',function(){
      const prixSaisi=parseInt(document.getElementById('admPlanPrice').value,10);
      const prixAvantSaisi=document.getElementById('admPlanPriceBefore').value.trim();
      const joursSaisis=document.getElementById('admPlanDays').value.trim();
      const err=document.getElementById('admPlanErr');
      if(isNaN(prixSaisi)||prixSaisi<0){err.textContent=t('adm_plans_err_price');err.style.display='block';return;}
      const prixAvant=prixAvantSaisi===''?null:parseInt(prixAvantSaisi,10);
      if(prixAvantSaisi!==''&&(isNaN(prixAvant)||prixAvant<0)){err.textContent=t('adm_plans_err_price_before');err.style.display='block';return;}
      const jours=joursSaisis===''?null:parseInt(joursSaisis,10);
      if(joursSaisis!==''&&(isNaN(jours)||jours<0)){err.textContent=t('adm_plans_err_days');err.style.display='block';return;}
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_plan_save'),()=>sauvegarderPlan(p,prixSaisi,jours,prixAvant),'plan');
    });
  }

  async function sauvegarderPlan(p,prix,jours,prixAvant){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admPlanSave');
    if(btn)btn.disabled=true;
    try{
      const {error}=await sb.from('plans').update({price_htg:prix, price_before_htg:prixAvant, duration_days:jours}).eq('id',p.id);
      if(error)throw error;
      try{
        await sb.from('audit_log').insert({
          admin_id:(currentUser&&currentUser.id)||null,
          action:'plan_updated',
          target_user_id:null,
          old_value:{plan_id:p.id, price_htg:p.price_htg, price_before_htg:p.price_before_htg, duration_days:p.duration_days},
          new_value:{plan_id:p.id, price_htg:prix, price_before_htg:prixAvant, duration_days:jours},
          reason:null
        });
      }catch(e){}
      plansCache=null;
      // Repercuter IMMEDIATEMENT sur le reste du site (assistant de
      // paiement, tableau de bord, etc.) — pas seulement dans cette page.
      if(window.VB_syncPlansFromSupabase)await window.VB_syncPlansFromSupabase();
      if(window.VB_toast)window.VB_toast('adm_plans_toast_h',t('adm_plans_toast_p'));
      if(viewStack.length)setView(viewStack.pop(),true);else setView('plans',true);
    }catch(e){
      const err=document.getElementById('admPlanErr');
      if(err){err.textContent=t('adm_plans_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }

  /* ---- Statistiques de la page d'accueil (chiffres marketing modifiables
     par l'admin, table landing_stats, une seule ligne) — meme principe que
     renderPlanDetail/sauvegarderPlan ci-dessus : lecture directe, saisie
     validee, confirmation avant ecriture, propagation immediate au reste
     du site via VB_chargerLandingStats (Realtime deja actif cote landing,
     ceci force en plus un rafraichissement immediat si l'admin lui-meme a
     la landing ouverte dans un autre onglet). */
  async function renderLandingStatsAdmin(){
    const box=document.getElementById('admLandingBody');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!box)return;
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb)return;
    let row=null;
    try{
      const {data,error}=await sb.from('landing_stats').select('*').eq('id',1).single();
      if(!error)row=data;
    }catch(e){}
    if(!row){box.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}

    box.innerHTML=
      '<label class="field"><span class="field-lbl">'+t('adm_landing_users_lbl')+'</span>'+
      '<input type="number" min="0" step="1" id="admLandUsers" value="'+row.active_users+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_landing_tickets_lbl')+'</span>'+
      '<input type="number" min="0" step="1" id="admLandTickets" value="'+row.successful_tickets+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_landing_rate_lbl')+'</span>'+
      '<input type="number" min="0" max="100" step="1" id="admLandRate" value="'+row.win_rate_pct+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_landing_trust_lbl')+'</span>'+
      '<input type="number" min="0" max="5" step="0.1" id="admLandTrust" value="'+row.trustpilot_rating+'"></label>'+
      '<button type="button" class="btn btn-confirm" id="admLandSave" style="width:100%;margin-top:14px">'+t('adm_plans_save')+'</button>'+
      '<div id="admLandErr" class="field-err" style="display:none;margin-top:8px"></div>';

    document.getElementById('admLandSave').addEventListener('click',function(){
      const err=document.getElementById('admLandErr');
      const usersV=parseInt(document.getElementById('admLandUsers').value,10);
      const ticketsV=parseInt(document.getElementById('admLandTickets').value,10);
      const rateV=parseInt(document.getElementById('admLandRate').value,10);
      const trustV=parseFloat(document.getElementById('admLandTrust').value);
      if(isNaN(usersV)||usersV<0){err.textContent=t('adm_landing_err_users');err.style.display='block';return;}
      if(isNaN(ticketsV)||ticketsV<0){err.textContent=t('adm_landing_err_tickets');err.style.display='block';return;}
      if(isNaN(rateV)||rateV<0||rateV>100){err.textContent=t('adm_landing_err_rate');err.style.display='block';return;}
      if(isNaN(trustV)||trustV<0||trustV>5){err.textContent=t('adm_landing_err_trust');err.style.display='block';return;}
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_save'),()=>sauvegarderLandingStats(row,usersV,ticketsV,rateV,trustV));
    });
  }

  async function sauvegarderLandingStats(ancien,usersV,ticketsV,rateV,trustV){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admLandSave');
    if(btn)btn.disabled=true;
    try{
      const {error}=await sb.from('landing_stats').update({
        active_users:usersV, successful_tickets:ticketsV, win_rate_pct:rateV, trustpilot_rating:trustV,
        updated_at:new Date().toISOString(), updated_by:(currentUser&&currentUser.id)||null
      }).eq('id',1);
      if(error)throw error;
      try{
        await sb.from('audit_log').insert({
          admin_id:(currentUser&&currentUser.id)||null,
          action:'landing_stats_updated',
          target_user_id:null,
          old_value:{active_users:ancien.active_users, successful_tickets:ancien.successful_tickets, win_rate_pct:ancien.win_rate_pct, trustpilot_rating:ancien.trustpilot_rating},
          new_value:{active_users:usersV, successful_tickets:ticketsV, win_rate_pct:rateV, trustpilot_rating:trustV},
          reason:null
        });
      }catch(e){}
      // Repercuter IMMEDIATEMENT sur la landing page (Realtime la mettra
      // aussi a jour de son cote, mais ceci evite d'attendre si l'admin
      // regarde deja sa propre landing dans un autre onglet du meme appareil).
      if(window.VB_chargerLandingStats)await window.VB_chargerLandingStats();
      if(window.VB_toast)window.VB_toast('adm_landing_toast_h',t('adm_landing_toast_p'));
      if(viewStack.length)setView(viewStack.pop(),true);else setView('landing',true);
    }catch(e){
      const err=document.getElementById('admLandErr');
      if(err){err.textContent=t('adm_landing_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }

  /* ---- Donnees reelles : FAQ ----
     Le panneau FAQ dedie du site lit ces memes lignes (voir
     window.VB_renderFAQ, module wizard) — une seule source de verite. */
  let selectedFaqId=null;
  let faqCache=null;
  async function chargerFaqAdmin(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return [];
    if(faqCache)return faqCache;
    try{
      const {data,error}=await sb.from('faq').select('*').order('display_order',{ascending:true});
      faqCache=(!error&&data)?data:[];
    }catch(e){faqCache=[];}
    return faqCache;
  }
  async function renderFaqList(){
    const list=document.getElementById('admFaqList');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    const items=await chargerFaqAdmin();
    if(!items.length){list.innerHTML='<div class="admdash-empty">'+t('adm_faq_empty')+'</div>';return;}
    list.innerHTML=items.map(f=>{
      const badge=f.is_published
        ?'<span class="admdash-row-badge actif">'+t('adm_published')+'</span>'
        :'<span class="admdash-row-badge aucun">'+t('adm_draft')+'</span>';
      return '<button type="button" class="admdash-row" data-faqid="'+f.id+'">'+
        '<span class="admdash-row-av">'+(f.display_order!=null?f.display_order:'—')+'</span>'+
        '<span class="admdash-row-tx"><b>'+(f.question_fr||f.question_ht||'—')+'</b></span>'+
        badge+
        '</button>';
    }).join('');
    list.querySelectorAll('[data-faqid]').forEach(b=>{
      b.addEventListener('click',()=>{selectedFaqId=b.dataset.faqid;setView('faqdetail');renderFaqDetail();});
    });
  }
  document.getElementById('admFaqNew').addEventListener('click',()=>{
    selectedFaqId=null;setView('faqdetail');renderFaqDetail();
  });

  async function renderFaqDetail(){
    const box=document.getElementById('admFaqDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb)return;
    let f={question_ht:'',question_fr:'',question_en:'',answer_ht:'',answer_fr:'',answer_en:'',display_order:0,is_published:true};
    if(selectedFaqId){
      const items=await chargerFaqAdmin();
      const found=items.find(x=>x.id===selectedFaqId);
      if(found)f=found;
    }
    box.innerHTML=
      '<div class="admdash-section-h">'+t('adm_faq_q_ht')+'</div>'+
      '<label class="field"><textarea id="admFaqQHt" placeholder="'+t('adm_faq_q_ph')+'">'+(f.question_ht||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_faq_q_fr')+'</div>'+
      '<label class="field"><textarea id="admFaqQFr" placeholder="'+t('adm_faq_q_ph')+'">'+(f.question_fr||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_faq_q_en')+'</div>'+
      '<label class="field"><textarea id="admFaqQEn" placeholder="'+t('adm_faq_q_ph')+'">'+(f.question_en||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_faq_a_ht')+'</div>'+
      '<label class="field"><textarea id="admFaqAHt" placeholder="'+t('adm_faq_a_ph')+'" style="min-height:110px">'+(f.answer_ht||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_faq_a_fr')+'</div>'+
      '<label class="field"><textarea id="admFaqAFr" placeholder="'+t('adm_faq_a_ph')+'" style="min-height:110px">'+(f.answer_fr||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_faq_a_en')+'</div>'+
      '<label class="field"><textarea id="admFaqAEn" placeholder="'+t('adm_faq_a_ph')+'" style="min-height:110px">'+(f.answer_en||'')+'</textarea></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_order_lbl')+'</span>'+
      '<input type="number" step="1" id="admFaqOrder" value="'+(f.display_order!=null?f.display_order:0)+'"></label>'+
      '<label style="display:flex;align-items:center;gap:9px;margin-top:12px;font-size:13.5px;color:#F4F3ED">'+
      '<input type="checkbox" id="admFaqPub" style="width:17px;height:17px"'+(f.is_published?' checked':'')+'> '+t('adm_published_toggle')+
      '</label>'+
      '<button type="button" class="btn btn-confirm" id="admFaqSave" style="width:100%;margin-top:16px">'+t('adm_faq_save')+'</button>'+
      (selectedFaqId?'<button type="button" class="btn btn-reject" id="admFaqDelete" style="width:100%;margin-top:10px">'+t('adm_faq_delete')+'</button>':'')+
      '<div id="admFaqErr" class="field-err" style="display:none;margin-top:8px"></div>';

    document.getElementById('admFaqSave').addEventListener('click',function(){
      const payload={
        question_ht:document.getElementById('admFaqQHt').value.trim(),
        question_fr:document.getElementById('admFaqQFr').value.trim(),
        question_en:document.getElementById('admFaqQEn').value.trim(),
        answer_ht:document.getElementById('admFaqAHt').value.trim(),
        answer_fr:document.getElementById('admFaqAFr').value.trim(),
        answer_en:document.getElementById('admFaqAEn').value.trim(),
        display_order:parseInt(document.getElementById('admFaqOrder').value,10)||0,
        is_published:document.getElementById('admFaqPub').checked
      };
      const err=document.getElementById('admFaqErr');
      if(!payload.question_ht||!payload.question_fr||!payload.question_en||!payload.answer_ht||!payload.answer_fr||!payload.answer_en){
        err.textContent=t('adm_faq_err_incomplete');err.style.display='block';return;
      }
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_save'),()=>sauvegarderFaq(payload));
    });
    if(selectedFaqId){
      document.getElementById('admFaqDelete').addEventListener('click',function(){
        demanderConfirmation(this,t('adm_confirm_q_delete'),()=>supprimerFaq(selectedFaqId),'trash');
      });
    }
  }

  async function sauvegarderFaq(payload){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admFaqSave');
    if(btn)btn.disabled=true;
    try{
      const {error}=selectedFaqId
        ?await sb.from('faq').update(payload).eq('id',selectedFaqId)
        :await sb.from('faq').insert(payload);
      if(error)throw error;
      faqCache=null;
      if(window.VB_renderFAQ)window.VB_renderFAQ();   // reflete sur le vrai site immediatement
      if(window.VB_toast)window.VB_toast('adm_faq_toast_h',t('adm_faq_toast_p'));
      if(viewStack.length)setView(viewStack.pop(),true);else setView('faq',true);
    }catch(e){
      const err=document.getElementById('admFaqErr');
      if(err){err.textContent=t('adm_faq_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }
  async function supprimerFaq(id){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    try{
      const {error}=await sb.from('faq').delete().eq('id',id);
      if(error)throw error;
      faqCache=null;
      if(window.VB_renderFAQ)window.VB_renderFAQ();
      if(window.VB_toast)window.VB_toast('adm_faq_toast_del_h',t('adm_faq_toast_del_p'));
      setView('faq',true);
    }catch(e){
      const err=document.getElementById('admFaqErr');
      if(err){err.textContent=t('adm_faq_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
    }
  }

  /* ---- Donnees reelles : Temoignages ---- */
  let selectedTestiId=null;
  let testiCache=null;
  async function chargerTestiAdmin(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return [];
    if(testiCache)return testiCache;
    try{
      const {data,error}=await sb.from('testimonials').select('*').order('display_order',{ascending:true});
      testiCache=(!error&&data)?data:[];
    }catch(e){testiCache=[];}
    return testiCache;
  }
  async function renderTestiList(){
    const list=document.getElementById('admTestiList');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){list.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    list.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    const items=await chargerTestiAdmin();
    if(!items.length){list.innerHTML='<div class="admdash-empty">'+t('adm_testi_empty')+'</div>';return;}
    list.innerHTML=items.map(x=>{
      const badge=x.is_published
        ?'<span class="admdash-row-badge actif">'+t('adm_published')+'</span>'
        :'<span class="admdash-row-badge aucun">'+t('adm_draft')+'</span>';
      return '<button type="button" class="admdash-row" data-testiid="'+x.id+'">'+
        '<span class="admdash-row-av">'+initiales(x.author_name||'?')+'</span>'+
        '<span class="admdash-row-tx"><b>'+(x.author_name||'—')+'</b><span>'+('★'.repeat(x.rating||0))+'</span></span>'+
        badge+
        '</button>';
    }).join('');
    list.querySelectorAll('[data-testiid]').forEach(b=>{
      b.addEventListener('click',()=>{selectedTestiId=b.dataset.testiid;setView('testidetail');renderTestiDetail();});
    });
  }
  document.getElementById('admTestiNew').addEventListener('click',()=>{
    selectedTestiId=null;setView('testidetail');renderTestiDetail();
  });

  async function renderTestiDetail(){
    const box=document.getElementById('admTestiDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb)return;
    let x={author_name:'',content_ht:'',content_fr:'',content_en:'',rating:5,display_order:0,is_published:true};
    if(selectedTestiId){
      const items=await chargerTestiAdmin();
      const found=items.find(i=>i.id===selectedTestiId);
      if(found)x=found;
    }
    const optionsNote=[1,2,3,4,5].map(n=>'<option value="'+n+'"'+(x.rating===n?' selected':'')+'>'+'★'.repeat(n)+'</option>').join('');
    box.innerHTML=
      '<label class="field"><span class="field-lbl">'+t('adm_testi_author')+'</span>'+
      '<input type="text" id="admTestiAuthor" value="'+(x.author_name||'').replace(/"/g,'&quot;')+'"></label>'+
      '<div class="admdash-section-h">'+t('adm_testi_content_ht')+'</div>'+
      '<label class="field"><textarea id="admTestiCHt" style="min-height:90px">'+(x.content_ht||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_testi_content_fr')+'</div>'+
      '<label class="field"><textarea id="admTestiCFr" style="min-height:90px">'+(x.content_fr||'')+'</textarea></label>'+
      '<div class="admdash-section-h">'+t('adm_testi_content_en')+'</div>'+
      '<label class="field"><textarea id="admTestiCEn" style="min-height:90px">'+(x.content_en||'')+'</textarea></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_testi_rating')+'</span>'+
      '<select id="admTestiRating">'+optionsNote+'</select></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_order_lbl')+'</span>'+
      '<input type="number" step="1" id="admTestiOrder" value="'+(x.display_order!=null?x.display_order:0)+'"></label>'+
      '<label style="display:flex;align-items:center;gap:9px;margin-top:12px;font-size:13.5px;color:#F4F3ED">'+
      '<input type="checkbox" id="admTestiPub" style="width:17px;height:17px"'+(x.is_published?' checked':'')+'> '+t('adm_published_toggle')+
      '</label>'+
      '<button type="button" class="btn btn-confirm" id="admTestiSave" style="width:100%;margin-top:16px">'+t('adm_testi_save')+'</button>'+
      (selectedTestiId?'<button type="button" class="btn btn-reject" id="admTestiDelete" style="width:100%;margin-top:10px">'+t('adm_testi_delete')+'</button>':'')+
      '<div id="admTestiErr" class="field-err" style="display:none;margin-top:8px"></div>';

    document.getElementById('admTestiSave').addEventListener('click',function(){
      const payload={
        author_name:document.getElementById('admTestiAuthor').value.trim(),
        content_ht:document.getElementById('admTestiCHt').value.trim(),
        content_fr:document.getElementById('admTestiCFr').value.trim(),
        content_en:document.getElementById('admTestiCEn').value.trim(),
        rating:parseInt(document.getElementById('admTestiRating').value,10),
        display_order:parseInt(document.getElementById('admTestiOrder').value,10)||0,
        is_published:document.getElementById('admTestiPub').checked
      };
      const err=document.getElementById('admTestiErr');
      if(!payload.author_name||!payload.content_ht||!payload.content_fr||!payload.content_en){
        err.textContent=t('adm_testi_err_incomplete');err.style.display='block';return;
      }
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_save'),()=>sauvegarderTesti(payload));
    });
    if(selectedTestiId){
      document.getElementById('admTestiDelete').addEventListener('click',function(){
        demanderConfirmation(this,t('adm_confirm_q_delete'),()=>supprimerTesti(selectedTestiId),'trash');
      });
    }
  }

  async function sauvegarderTesti(payload){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admTestiSave');
    if(btn)btn.disabled=true;
    try{
      const {error}=selectedTestiId
        ?await sb.from('testimonials').update(payload).eq('id',selectedTestiId)
        :await sb.from('testimonials').insert(payload);
      if(error)throw error;
      testiCache=null;
      if(window.VB_toast)window.VB_toast('adm_testi_toast_h',t('adm_testi_toast_p'));
      if(viewStack.length)setView(viewStack.pop(),true);else setView('testimonials',true);
    }catch(e){
      const err=document.getElementById('admTestiErr');
      if(err){err.textContent=t('adm_testi_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }
  async function supprimerTesti(id){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    try{
      const {error}=await sb.from('testimonials').delete().eq('id',id);
      if(error)throw error;
      testiCache=null;
      if(window.VB_toast)window.VB_toast('adm_testi_toast_del_h',t('adm_testi_toast_del_p'));
      setView('testimonials',true);
    }catch(e){
      const err=document.getElementById('admTestiErr');
      if(err){err.textContent=t('adm_testi_err_save')+' — '+((e&&e.message)?e.message:String(e)).slice(0,140);err.style.display='block';}
    }
  }

  /* ---- Parametres admin : mot de passe + 2FA (toujours optionnel) ---- */
  let admPwStage='start';   // start | code | newpass
  let admPwCode='';

  async function renderSettings(){
    const box=document.getElementById('admSettingsBody');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){box.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    const mfaStatus=window.VB_mfaStatus?await window.VB_mfaStatus():{actif:false};

    box.innerHTML=
      '<div class="admdash-section-h">'+t('adm_settings_pw_h')+'</div>'+
      '<div id="admSetPwBox"></div>'+

      '<div class="admdash-section-h">'+t('adm_settings_2fa_h')+'</div>'+
      '<p style="font-size:13px;color:var(--gris);margin-bottom:14px;line-height:1.5">'+
        (mfaStatus.actif?t('adm_settings_2fa_on_p'):t('adm_settings_2fa_off_p'))+
      '</p>'+
      (mfaStatus.actif?
        '<button type="button" class="btn btn-reject" id="admSet2faToggle" style="width:100%">'+t('adm_settings_2fa_disable')+'</button>'
        :
        '<button type="button" class="btn btn-confirm" id="admSet2faToggle" style="width:100%">'+t('adm_settings_2fa_enable')+'</button>')+
      '<div id="admSet2faErr" class="field-err" style="display:none;margin-top:8px"></div>';

    admPwStage='start';admPwCode='';
    renderAdmPwSection();

    document.getElementById('admSet2faToggle').addEventListener('click',function(){
      if(mfaStatus.actif){
        // Desactiver une protection existante est la seule des deux
        // actions assez sensible pour meriter une confirmation Oui/Non —
        // l'activation, elle, a deja sa propre etape de verification
        // (le QR code + le code a 6 chiffres).
        demanderConfirmation(this,t('adm_confirm_q_2fa_disable'),async()=>{
          const res=await window.VB_disableMfa();
          if(!res||!res.ok){
            const err=document.getElementById('admSet2faErr');
            if(err){err.textContent=t('adm_settings_2fa_err')+' — '+((res&&res.erreur)||'');err.style.display='block';}
            return;
          }
          if(window.VB_toast)window.VB_toast('adm_settings_2fa_off_h',t('adm_settings_2fa_off_toast'));
          renderSettings();
        },'shield');
      }else{
        window.VB_startMfaEnrollment(()=>{
          if(window.VB_toast)window.VB_toast('adm_settings_2fa_on_h',t('adm_settings_2fa_on_toast'));
          renderSettings();
        },(currentUser&&currentUser.id)||null);
      }
    });
  }

  /* Changement de mot de passe admin : MEME methode que "mot de passe
     oublie" cote client — email, code, nouveau mot de passe — jamais un
     changement direct sans re-verification, meme pour un admin deja
     connecte. Reutilise EXACTEMENT les 2 memes fonctions Netlify. */
  function renderAdmPwSection(){
    const box=document.getElementById('admSetPwBox');
    const email=(currentUser&&currentUser.email)||'';

    if(admPwStage==='start'){
      box.innerHTML=
        '<p style="font-size:13px;color:var(--gris);margin-bottom:14px;line-height:1.5">'+t('adm_settings_pw_start_p')+'</p>'+
        '<button type="button" class="btn btn-confirm" id="admPwStartBtn" style="width:100%">'+t('adm_settings_pw_start_btn')+'</button>'+
        '<div id="admSetPwErr" class="field-err" style="display:none;margin-top:8px"></div>';
      document.getElementById('admPwStartBtn').addEventListener('click',async function(){
        this.disabled=true;
        const err=document.getElementById('admSetPwErr');
        err.style.display='none';
        try{
          const resp=await fetch('/.netlify/functions/request-password-reset',{
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({email})
          });
          const data=await resp.json().catch(()=>({}));
          this.disabled=false;
          if(!resp.ok){
            err.textContent=t('adm_settings_pw_err')+' — '+((data&&data.error)||'');err.style.display='block';
            return;
          }
          if(window.VB_toast)window.VB_toast('toast_mail_h',t('toast_mail_p').replace('{email}',email));
          admPwStage='code';
          renderAdmPwSection();
        }catch(e){
          this.disabled=false;
          err.textContent=t('adm_settings_pw_err')+' — '+((e&&e.message)||'');err.style.display='block';
        }
      });
      return;
    }

    if(admPwStage==='code'){
      box.innerHTML=
        '<p style="font-size:13px;color:var(--gris);margin-bottom:14px;line-height:1.5">'+t('adm_settings_pw_code_p').replace('{email}',email)+'</p>'+
        '<div class="wiz-otp" id="admPwOtp">'+
          Array.from({length:6}).map((_,i)=>'<input type="text" inputmode="numeric" maxlength="1" aria-label="'+(i+1)+'" autocomplete="one-time-code">').join('')+
        '</div>'+
        '<span class="field-err" id="admPwOtpErr" style="display:none;text-align:center;margin:8px 0"></span>'+
        '<button type="button" class="btn btn-confirm" id="admPwCodeNext" style="width:100%;margin-top:10px">'+t('wiz_btn_verify')+'</button>'+
        '<button type="button" class="btn-link" id="admPwCancel" style="width:100%;margin-top:4px">'+t('dash_back')+'</button>';
      const inputs=[...document.querySelectorAll('#admPwOtp input')];
      const errBox=document.getElementById('admPwOtpErr');
      inputs.forEach((inp,i)=>{
        inp.addEventListener('input',()=>{
          inp.value=inp.value.replace(/\D/g,'').slice(0,1);
          errBox.style.display='none';
          // Animation "pop" (02/09), meme principe que wizOtp — ce
          // composant est genere dynamiquement (renderAdmPwSection),
          // donc le listener est recree a chaque affichage, jamais un
          // souci puisque la classe CSS .wiz-otp est deja partagee.
          if(inp.value){
            inp.classList.remove('otp-pop');
            void inp.offsetWidth;
            inp.classList.add('otp-pop');
          }
          if(inp.value&&i<inputs.length-1)inputs[i+1].focus();
        });
        inp.addEventListener('keydown',ev=>{
          if(ev.key==='Backspace'&&!inp.value&&i>0)inputs[i-1].focus();
        });
      });
      document.getElementById('admPwCodeNext').addEventListener('click',()=>{
        // Animation en cascade au clic (02/09), meme principe que wizOtp.
        inputs.forEach((inp,i)=>{
          setTimeout(()=>{
            inp.classList.remove('otp-pop');
            void inp.offsetWidth;
            inp.classList.add('otp-pop');
          },i*45);
        });
        const code=inputs.map(i=>i.value.trim()).join('');
        if(code.length!==6){errBox.textContent=t('wiz_v_err');errBox.style.display='block';return;}
        admPwCode=code;
        admPwStage='newpass';
        renderAdmPwSection();
      });
      document.getElementById('admPwCancel').addEventListener('click',()=>{
        admPwStage='start';admPwCode='';renderAdmPwSection();
      });
      return;
    }

    // admPwStage==='newpass'
    box.innerHTML=
      '<label class="field"><span class="field-lbl">'+t('adm_settings_pw_new')+'</span>'+
      '<input type="password" id="admSetPwNew" autocomplete="new-password"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_settings_pw_confirm')+'</span>'+
      '<input type="password" id="admSetPwConfirm" autocomplete="new-password"></label>'+
      '<button type="button" class="btn btn-confirm" id="admSetPwSave" style="width:100%;margin-top:14px">'+t('adm_settings_pw_save')+'</button>'+
      '<div id="admSetPwErr" class="field-err" style="display:none;margin-top:8px"></div>';

    document.getElementById('admSetPwSave').addEventListener('click',function(){
      const np=document.getElementById('admSetPwNew').value;
      const nc=document.getElementById('admSetPwConfirm').value;
      const err=document.getElementById('admSetPwErr');
      if(np.length<8){err.textContent=t('auth_err_password_len');err.style.display='block';return;}
      if(!/\d/.test(np)){err.textContent=t('auth_err_password_digit');err.style.display='block';return;}
      if(np!==nc){err.textContent=t('auth_err_password_match');err.style.display='block';return;}
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_pw_change'),()=>sauvegarderMotDePasseAdmin(np,email),'key');
    });
  }

  async function sauvegarderMotDePasseAdmin(nouveauMdp,email){
    const btn=document.getElementById('admSetPwSave');
    if(btn)btn.disabled=true;
    try{
      // Meme fonction serveur que "mot de passe oublie" cote client :
      // le code est verifie CE SERVEUR, jamais localement, meme ici.
      const resp=await fetch('/.netlify/functions/confirm-password-reset',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email, code:admPwCode, newPassword:nouveauMdp})
      });
      const data=await resp.json().catch(()=>({}));
      if(!resp.ok)throw new Error((data&&data.error)||'erreur');
      if(window.VB_toast)window.VB_toast('adm_settings_pw_toast_h',t('adm_settings_pw_toast_p'));
      admPwStage='start';admPwCode='';
      renderAdmPwSection();
    }catch(e){
      const err=document.getElementById('admSetPwErr');
      const msg=(e&&e.message)||'';
      if(msg==='code_invalide'||msg==='code_expire'){
        // Le code saisi ne colle plus : retour a l'etape code, jamais
        // bloquant sans explication.
        admPwStage='code';
        renderAdmPwSection();
        const errBox=document.getElementById('admPwOtpErr');
        if(errBox){errBox.textContent=t('wiz_v_err');errBox.style.display='block';}
        return;
      }
      if(err){err.textContent=t('adm_settings_pw_err')+' — '+msg.slice(0,140);err.style.display='block';}
    }
    if(btn)btn.disabled=false;
  }

  /* ---- Donnees reelles : Fiches (tickets + ticket_legs) ----
     Une seule source de verite pour tout le site : c'est cette table
     que le Dashboard client lira aussi (etape suivante). Rien n'est
     jamais supprime automatiquement : chaque jour reste consultable
     via le selecteur de date — c'est la "memoire" demandee. */
  let selectedFicheId=null;
  let fbLegsCourantes=[];   // manches en cours d'edition (pas encore enregistrees)
  /* Les DEUX valeurs de marche "score exact" reellement presentes en base
     (verifie le 25/08) : 'mk_score_l' ecrit par le panneau admin,
     'mk_score_exact' ecrit par bot-generate-tickets.js. Declaree ici, avant
     tout usage, car utilisee aussi bien par majResumeCote que par
     estFicheScoreExact. */
  const MARCHES_SCORE_EXACT=['mk_score_l','mk_score_exact'];

  /* ============================================================
     FUSEAU HORAIRE OFFICIEL : HAITI (America/Port-au-Prince)
     ------------------------------------------------------------
     L'admin saisit et relit TOUJOURS des heures d'Haiti, quel que soit
     le fuseau de son appareil. En base, l'instant exact du coup d'envoi
     est stocke dans ticket_legs.kickoff_at ; match_time reste renseigne
     en UTC, comme l'ecrit le bot.
     ============================================================ */
  const TZ_HAITI='America/Port-au-Prince';
  function decalageHaitiSecours(d){
    const a=d.getUTCFullYear();
    const dim=(an,mois,n)=>{const x=new Date(Date.UTC(an,mois,1));
      const dec=(7-x.getUTCDay())%7;return new Date(Date.UTC(an,mois,1+dec+(n-1)*7,7,0,0));};
    return (d>=dim(a,2,2)&&d<dim(a,10,1))?-4:-5;
  }
  function partsHaiti(d){
    try{
      const f=new Intl.DateTimeFormat('en-CA',{timeZone:TZ_HAITI,year:'numeric',month:'2-digit',
        day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false});
      const o={};f.formatToParts(d).forEach(p=>{o[p.type]=p.value;});
      if(!o.year)throw new Error('tz');
      return {iso:o.year+'-'+o.month+'-'+o.day,heure:(o.hour==='24'?'00':o.hour)+':'+o.minute};
    }catch(e){
      const x=new Date(d.getTime()+decalageHaitiSecours(d)*3600000);
      const p2=n=>String(n).padStart(2,'0');
      return {iso:x.getUTCFullYear()+'-'+p2(x.getUTCMonth()+1)+'-'+p2(x.getUTCDate()),
              heure:p2(x.getUTCHours())+':'+p2(x.getUTCMinutes())};
    }
  }
  const heureValide=v=>/^[0-9]{1,2}:[0-9]{2}$/.test(String(v||'').trim());
  /* Heure d'Haiti affichee dans le formulaire, a partir de ce que
     contient la base (instant exact, ou heure UTC posee sur la date). */
  function instantDeLeg(v){
    if(!v)return null;
    let d=new Date(v);
    if(!isNaN(d.getTime()))return d;
    d=new Date(String(v).replace(' ','T').replace(/([+-][0-9]{2})$/,'$1:00'));
    return isNaN(d.getTime())?null:d;
  }
  function heureHaitiDeLeg(l,playDate){
    let d=instantDeLeg(l.kickoff_at);
    if((!d||isNaN(d.getTime()))&&heureValide(l.match_time)){
      const hm=String(l.match_time).trim();
      d=new Date(playDate+'T'+(hm.length===4?'0':'')+hm+':00Z');
    }
    if(!d||isNaN(d.getTime()))return l.match_time||'';
    return partsHaiti(d).heure;
  }
  /* Instant reel a partir d'une heure d'Haiti saisie pour une date de jeu.
     Deux passes suffisent, y compris au changement d'heure d'ete. */
  function instantDepuisHaiti(isoJour,hhmm){
    if(!heureValide(hhmm)||!isoJour)return null;
    const hm=String(hhmm).trim();
    const vise=Date.parse(isoJour+'T'+(hm.length===4?'0':'')+hm+':00Z');
    if(isNaN(vise))return null;
    let t=vise;
    for(let i=0;i<2;i++){
      const p=partsHaiti(new Date(t));
      const vu=Date.parse(p.iso+'T'+p.heure+':00Z');
      if(isNaN(vu))return null;
      t=t+(vise-vu);
    }
    return new Date(t);
  }
  // Date du jour en Haiti — jamais celle de l'appareil de l'admin.
  function dateAujourdhui(){
    return partsHaiti(new Date()).iso;
  }

  /* ---- Plage de cote totale imposee a chaque plan ----
     Lue dans le catalogue (table plans), jamais ecrite en dur : c'est la
     meme reference que celle appliquee par la base, qui REFUSE toute
     fiche publiee dont la cote totale sort de la plage de son plan. */
  let plagesCotes=null;
  async function chargerPlagesCotes(){
    if(plagesCotes)return plagesCotes;
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return null;
    try{
      const {data,error}=await sb.from('plans').select('rank,min_total_odd,max_total_odd,max_leg_odd');
      if(error||!data)return null;
      plagesCotes={};
      data.forEach(p=>{plagesCotes[p.rank]={min:p.min_total_odd!=null?Number(p.min_total_odd):null,
                                           max:p.max_total_odd!=null?Number(p.max_total_odd):null,
                                           maxLeg:p.max_leg_odd!=null?Number(p.max_leg_odd):null};});
      return plagesCotes;
    }catch(e){return null;}
  }
  // Produit des cotes saisies (0 si aucune cote valable)
  function coteTotaleSaisie(){
    let n=0,prod=1;
    fbLegsCourantes.forEach(l=>{const o=parseFloat(l.odd);if(o>0){prod*=o;n++;}});
    return n?Math.round(prod*100)/100:0;
  }
  function plagePlanCourant(){
    const sel=document.getElementById('admFichePlan');
    const rk=sel?parseInt(sel.value,10):null;
    return (plagesCotes&&rk&&plagesCotes[rk])?plagesCotes[rk]:null;
  }
  // Rappel visible sous la liste des matchs : cote totale + plage autorisee
  function majResumeCote(){
    const box=document.getElementById('admFicheCoteResume');
    if(!box)return;
    const total=coteTotaleSaisie();
    const pl=plagePlanCourant();
    let txt=t('adm_fiche_odds_total').replace('{n}',total.toFixed(2));
    let hors=false;
    if(pl){
      const maxTxt=pl.max!=null?pl.max.toFixed(2):t('adm_fiche_odds_unlimited');
      txt+=' · '+t('adm_fiche_odds_range')
        .replace('{min}',pl.min!=null?pl.min.toFixed(2):'0')
        .replace('{max}',maxTxt);
      hors=total>0&&((pl.min!=null&&total<pl.min)||(pl.max!=null&&total>pl.max));
    }
    /* Alerte de risque : une fiche qui empile les selections au-dessus du
       plafond conseille (1,90 par defaut, hors score exact) a beaucoup
       moins de chances de passer, meme si sa cote totale est correcte.
       On le signale a l'admin avant publication — sans jamais bloquer. */
    let risque='';
    if(pl&&pl.maxLeg!=null){
      const risquees=fbLegsCourantes.filter(l=>{
        const o=parseFloat(l.odd);
        // Les deux valeurs de marche score exact sont exclues de l'alerte :
        // une cote elevee y est normale et encadree par les regles du plan.
        return o>pl.maxLeg&&MARCHES_SCORE_EXACT.indexOf(String(l.market||''))===-1;
      }).length;
      if(risquees>0){
        risque=' · '+t('adm_fiche_odds_risky')
          .replace('{n}',risquees).replace('{max}',pl.maxLeg.toFixed(2));
      }
    }
    box.textContent=txt+risque;
    box.style.color=hors?'#E4574C':(risque?'#E0A32E':'#9FB0C4');
  }
  /* ============================================================
     MODULE FICHES (refonte 25/08)
     ------------------------------------------------------------
     Objectifs :
       - titre lisible "25 août 2026 — Cote normal / Score exact"
         au lieu du code technique BOT-2026-08-25-FOOT-R3
       - meme presentation que le Dashboard client : matchs, heures,
         marches, cotes, badges V/X, resultat du ticket
       - clic sur un match => ouvre l'editeur existant sur ce match
       - onglet Historique avec filtres Tous/En cours/Gagnes/Perdus
       - origine BOT/ADMIN et derniere synchronisation du bot
     ============================================================ */
  let admFichesTab='day';          // 'day' | 'hist'
  let admFichesStatut='all';       // 'all' | 'pending' | 'won' | 'lost' (les 2 onglets, 27/08)
  // Filtre "Tout" retiré de l'onglet "Jodi a" (28/08, demande explicite de
  // James) : sur le jour courant, seuls "An kou"/"Genyen"/"Pèdi" ont un
  // sens ; "Tout" reste utile UNIQUEMENT sur l'Historique. Si "all" etait
  // le filtre actif au moment de passer sur "Jodi a", on retombe sur
  // "An kou" (pending) plutot que de laisser un filtre invisible actif.
  function majFiltresJodiA(){
    const chipTout=document.querySelector('#admFichesFilters [data-fstatus="all"]');
    if(!chipTout)return;
    const estJodiA=admFichesTab==='day';
    chipTout.style.display=estJodiA?'none':'';
    if(estJodiA && admFichesStatut==='all'){
      admFichesStatut='pending';
      document.querySelectorAll('#admFichesFilters [data-fstatus]').forEach(x=>
        x.classList.toggle('is-on',x.dataset.fstatus==='pending'));
    }
  }
  // Pagination "Charger plus" (Phase 3 roadmap, 27/08) — Historique
  // uniquement (le jour courant reste petit par nature, jamais paginé).
  // Repart à 30 à chaque changement d'onglet/filtre, jamais conservée
  // entre deux contextes différents (éviterait un "Charger plus" fantôme
  // qui semble ne rien faire après un changement de filtre).
  let admFichesHistLimit=30;
  const ADMF_HIST_PAGE=30;
  let admFicheLegCible=null;       // index du match a ouvrir a l'ouverture du detail
  // Récap horizontal cliquable (31/08 v2, demande explicite de James) :
  // rang du plan actuellement sélectionné dans le récap "Du jour"
  // (VIP 7 JOU — n, VIP 21 JOU — n, ...) — null = tous les plans affichés
  // (comportement par défaut, inchangé). Reposé à null à chaque
  // changement de date/onglet (voir changerDateFiches/setAdmFichesTab)
  // pour ne jamais laisser un filtre invisible actif sur un autre jour.
  let admFichesFiltrePlanRang=null;

  /* Une fiche "score exact" est identifiee par son contenu reel (toutes ses
     selections sont des scores exacts), jamais par le suffixe du code : une
     fiche saisie a la main n'a pas de code normalise.
     DEUX valeurs de marche coexistent reellement en base (verifie le 25/08) :
     'mk_score_l' ecrit par le panneau admin, et 'mk_score_exact' ecrit par
     bot-generate-tickets.js. Les deux doivent etre reconnues. */
  function estFicheScoreExact(tk,legs){
    if(tk&&tk.score_legs_count>0&&tk.legs_count>0&&tk.score_legs_count===tk.legs_count)return true;
    if(!legs||!legs.length)return false;
    return legs.every(l=>MARCHES_SCORE_EXACT.indexOf(String(l.market||''))>-1
      ||/score exact/i.test(String(l.pick||'')));
  }

  /* "25 août 2026" — meme rendu quel que soit le sport (football ou NBA),
     dans la langue active du panneau. */
  function dateLongue(iso){
    if(!iso)return '';
    const d=new Date(iso+'T12:00:00Z');
    if(isNaN(d.getTime()))return iso;
    const loc={fr:'fr-FR',en:'en-GB',ht:'fr-FR'}[currentLang]||'fr-FR';
    try{
      return new Intl.DateTimeFormat(loc,{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(d);
    }catch(e){return iso;}
  }
  function titreFiche(tk,legs){
    /* Trois libelles possibles (regle du 25/08) : Basketball prime sur la
       distinction cote normal / score exact (le basket n'a pas de marche
       score exact dans l'architecture actuelle). */
    let genre;
    if(tk.sport==='nba'||tk.sport==='basket')genre='adm_fiche_kind_basket';
    else genre=estFicheScoreExact(tk,legs)?'adm_fiche_kind_exact':'adm_fiche_kind_normal';
    return dateLongue(tk.play_date)+' — '+t(genre);
  }

  /* Badge V / X / — par selection, identique a ce que le bot ecrit en base
     (won | lost | void | null). null = match pas encore joue. */
  function marqueLeg(result){
    if(result==='won') return '<span class="admf-leg-mark won">V</span>';
    if(result==='lost')return '<span class="admf-leg-mark lost">X</span>';
    if(result==='void')return '<span class="admf-leg-mark void">—</span>';
    return '<span class="admf-leg-mark none">·</span>';
  }

  /* Rendu d'une fiche complete — meme information que le Dashboard client.
     Les selections sont cliquables : elles ouvrent l'editeur sur ce match. */
  function ficheCardHtml(tk,legs){
    const badgeCls={pending:'pending',won:'won',lost:'lost'}[tk.status]||'aucun';
    const badgeLbl={pending:'adm_fiche_st_pending',won:'adm_fiche_st_won',lost:'adm_fiche_st_lost'}[tk.status];
    const src=(tk.source==='bot')?'bot':'admin';
    /* Regle stricte du 25/08 : une fois une fiche TERMINEE (won/lost, donc
       visible dans l'Historique), plus AUCUNE modification possible — pas
       de deverrouillage, pas d'entree dans l'editeur, ni pour la fiche
       entiere ni pour un seul de ses matchs. Une fiche encore en cours mais
       dont UN match precis est deja regle (l.result non nul) verrouille ce
       seul match, sans exception non plus : aucun bouton de contournement.
       C'est un durcissement volontaire de la version precedente (qui
       proposait "Modifier quand meme") — l'admin ne peut plus jamais
       toucher un resultat deja acquis. */
    const ficheTerminee=(tk.status==='won'||tk.status==='lost');
    // Note "a jouer en 2 tickets separes" (25/08, demande explicite de
    // James) : affichee sur TOUTE fiche 100% score exact, meme detection
    // que titreFiche (estFicheScoreExact), jamais sur une fiche normale.
    const noteX2=estFicheScoreExact(tk,legs)
      ? '<div class="admf-note-x2">'+t('fiche_note_x2')+'</div>' : '';
    const legsHtml=(legs||[]).map((l,i)=>{
      const heure=heureHaitiDeLeg(l,tk.play_date)||'--:--';
      const marche=(translations.fr||{})[l.market]?t(l.market):(l.market||'');
      // Notation 1/2 (28/08) : affichage uniquement, voir commentaire du premier site.
      const pickRaw2=String(l.pick||'').replace(/^Victoire\s*:\s*Home$/i,'Victoire : 1').replace(/^Victoire\s*:\s*Away$/i,'Victoire : 2');
      const pick=(pickRaw2.indexOf(' — ')>-1||!(translations.fr||{})[pickRaw2])?pickRaw2:t(pickRaw2);
      const cote=Number(l.odd);
      const regle=ficheTerminee||!!l.result;
      const corps=marqueLeg(l.result)+
        '<span class="admf-leg-body">'+
          '<span class="admf-leg-top"><span class="admf-leg-time">'+stripTags(heure)+'</span>'+
            '<span class="admf-leg-league">'+stripTags(l.league||'')+(l.league_country?' ('+stripTags(l.league_country)+')':'')+'</span></span>'+
          '<span class="admf-leg-match">'+stripTags(l.match_label||'')+'</span>'+
          '<span class="admf-leg-pick"><em>'+stripTags(marche)+'</em>'+stripTags(pick||'')+'</span>'+
        '</span>'+
        '<span class="admf-leg-odd">'+(isFinite(cote)?cote.toFixed(2):'—')+'</span>';
      // Verrouille : element non interactif (li simple), aucun clic possible.
      if(regle)return '<li class="admf-leg admf-leg-locked">'+corps+'</li>';
      return '<li><button type="button" class="admf-leg" data-fid="'+tk.id+'" data-legidx="'+i+'">'+corps+'</button></li>';
    }).join('');

    return '<div class="admf-card" data-card="'+tk.id+'">'+
      '<div class="admf-card-h">'+
        '<span class="admf-card-title">'+stripTags(titreFiche(tk,legs))+
          '<span class="admf-card-sub">'+((tk.sport==='basket'||tk.sport==='nba')?t('adm_fiche_sport_nba'):t('adm_fiche_sport_foot'))+
          ' · '+stripTags(tk.code||'')+(tk.published?'':' · '+t('adm_fiche_draft'))+'</span></span>'+
        '<span class="admf-src '+src+'">'+t('adm_fiche_src_'+src)+'</span>'+
        '<span class="admdash-row-badge '+badgeCls+'">'+(badgeLbl?t(badgeLbl):tk.status)+'</span>'+
      '</div>'+
      noteX2+
      '<ul class="admf-legs">'+(legsHtml||'')+'</ul>'+
      '<div class="admf-card-f">'+
        '<span>'+(tk.legs_count||0)+' '+t('adm_fiche_legs')+
          (tk.confidence!=null?' · '+tk.confidence+'%':'')+'</span>'+
        '<span class="admf-card-total">'+Number(tk.total_odd||0).toFixed(2)+'</span>'+
      '</div>'+
      (ficheTerminee?'':'<button type="button" class="admf-edit" data-editfid="'+tk.id+'">'+t('adm_fiche_leg_edit')+'</button>')+
    '</div>';
  }

  /* Derniere synchronisation du bot + prochaine generation automatique.
     La derniere synchro est lue en base (tickets.settled_at, ecrit par
     bot-settle-results.js) : aucune valeur inventee cote navigateur. */
  async function majSyncBot(){
    const box=document.getElementById('admFichesSync');
    if(!box)return;
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    let derniere=null;
    if(sb){
      try{
        const {data}=await sb.from('tickets').select('settled_at')
          .not('settled_at','is',null).order('settled_at',{ascending:false}).limit(1);
        if(data&&data.length)derniere=data[0].settled_at;
      }catch(e){}
    }
    const fmt=d=>{
      try{
        return new Intl.DateTimeFormat('fr-FR',{timeZone:TZ_HAITI,day:'2-digit',month:'2-digit',
          year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(d));
      }catch(e){return String(d).slice(0,16).replace('T',' ');}
    };
    /* Prochaine generation : le bot tourne a 17h00 heure d'Haiti (fenetre
       cron de bot-generate-tickets.js). On affiche la prochaine occurrence
       a venir, aujourd'hui ou demain selon l'heure locale actuelle. */
    const maintenant=partsHaiti(new Date());
    const heureH=parseInt(String(maintenant.heure).slice(0,2),10);
    let jourProchain=maintenant.iso;
    if(heureH>=17){
      const d=new Date(maintenant.iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+1);
      jourProchain=d.toISOString().slice(0,10);
    }
    box.innerHTML=
      (derniere?t('adm_fiches_sync_last').replace('{d}',fmt(derniere))
              :t('adm_fiches_sync_never'))+'<br>'+
      t('adm_fiches_sync_next').replace('{d}',dateLongue(jourProchain)+' · 17:00');
  }

  async function renderFiches(){
    const dateInput=document.getElementById('admFichesDate');
    if(!dateInput.value)dateInput.value=dateAujourdhui();
    const body=document.getElementById('admFichesBody');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){body.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}
    body.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    majSyncBot();
    try{
      let req=sb.from('tickets')
        .select('id,code,sport,min_plan_rank,status,confidence,play_date,published,created_at,legs_count,total_odd,score_legs_count,source,settled_at');
      if(admFichesTab==='day'){
        // Vue du jour : les fiches de la date choisie. Filtre de statut
        // (Partie 3 roadmap, 27/08 : zones "En cours/Gagné/Perdu") — mêmes
        // chips que l'Historique, appliqués ici aussi désormais.
        req=req.eq('play_date',dateInput.value)
               .order('min_plan_rank',{ascending:true}).order('created_at',{ascending:true});
        if(admFichesStatut!=='all')req=req.eq('status',admFichesStatut);
      }else{
        /* Historique (25/08, redefinit sur demande explicite de James) :
           TOUTE fiche REGLEE (Genyen/Pedi), des qu'elle l'est — plus
           d'attente au lendemain, une fiche dont tous les matchs se
           terminent aujourd'hui apparait ici aujourd'hui meme. Alignee sur
           le Dashboard client, qui fonctionne deja ainsi (status!=='pending').
           Triee par date de reglement (settled_at), la plus recente
           d'abord ; repli sur play_date pour les tres rares fiches reglees
           sans settled_at (ancien nettoyage manuel). "An kou" n'a plus sa
           place ici : une fiche non reglee, meme datee du passe, ne
           relevait jamais vraiment de l'Historique tel que voulu — elle
           reste trouvable via l'onglet "Du jour" en choisissant sa date. */
        req=req.neq('status','pending')
               .order('settled_at',{ascending:false,nullsFirst:false})
               .order('play_date',{ascending:false}).order('min_plan_rank',{ascending:true})
               .limit(admFichesHistLimit);
        if(admFichesStatut!=='all')req=req.eq('status',admFichesStatut);
      }
      const {data:tickets,error}=await req;
      if(error)throw error;
      if(!tickets||!tickets.length){
        body.innerHTML='<div class="admdash-empty">'+
          t(admFichesTab==='hist'?'adm_fiches_hist_empty':'adm_fiches_empty')+'</div>';
        return;
      }

      /* Toutes les selections des fiches affichees en UNE seule requete :
         le panneau montre exactement ce que voit le Dashboard client
         (matchs, heures, marches, cotes, resultats), pas un simple compteur. */
      const ids=tickets.map(tk=>tk.id);
      const {data:legs}=await sb.from('ticket_legs')
        .select('ticket_id,match_label,match_time,kickoff_at,league,league_country,market,pick,odd,position,result,fixture_id')
        .in('ticket_id',ids).order('position',{ascending:true});
      const parFiche={};
      (legs||[]).forEach(l=>{(parFiche[l.ticket_id]=parFiche[l.ticket_id]||[]).push(l);});

      if(admFichesTab==='day'){
        // Vue du jour (session suivante, demande explicite de James : plus
        // de sous-titre repete par plan — UNE seule ligne horizontale en
        // haut recapitulant le nombre de fiches de CHAQUE plan (foot +
        // basket confondus, bot ou admin confondus), meme a 0, suivie de
        // toutes les fiches du jour triees par rang (deja l'ordre renvoye
        // par la requete Supabase, min_plan_rank croissant).
        const plans=(window.VB_allPlans?window.VB_allPlans():[]).slice().sort((a,b)=>rank[a.id]-rank[b.id]);
        // Récap cliquable (CORRIGÉ 31/08 v3, demande explicite de James —
        // capture d'écran à l'appui : LIFETIME affichait 0 alors que la
        // fiche score exact du rang 3 lui est bien visible via la cascade
        // d'accès, et VIP 21 JOU affichait 0 alors qu'il voit aussi les
        // fiches du rang 1). AVANT : comptait uniquement les fiches
        // ANCRÉES exactement à ce rang (tk.min_plan_rank===rank), ignorant
        // la cascade réelle. MAINTENANT : chaque plan compte TOUTE fiche
        // qu'il peut RÉELLEMENT voir (min_plan_rank<=rang du plan, exactement
        // la même règle que celle qui gouverne l'accès côté Dashboard
        // client) — foot auto/manuel/score-exact + basket auto/manuel
        // confondus, rien exclu par construction. Le total "Tous", lui,
        // reste tickets.length : chaque fiche unique comptée UNE seule
        // fois, jamais sommée à travers les 4 plans (qui se chevauchent
        // par cascade et gonfleraient artificiellement un total sommé).
        const recap='<span class="admf-sum-item'+(admFichesFiltrePlanRang===null?' active':'')+'" data-planrank="">'+
            stripTags(t('adm_fiches_tous_plans'))+' — <b>'+tickets.length+'</b></span>'+
          plans.map(pl=>{
          const nb=tickets.filter(tk=>tk.min_plan_rank<=rank[pl.id]).length;
          return '<span class="admf-sum-item'+(admFichesFiltrePlanRang===rank[pl.id]?' active':'')+'" data-planrank="'+rank[pl.id]+'">'+
            stripTags(window.VB_planLabel(pl))+' — <b>'+nb+'</b></span>';
        }).join('');
        const ticketsAffiches=admFichesFiltrePlanRang===null?tickets
          :tickets.filter(tk=>tk.min_plan_rank<=admFichesFiltrePlanRang);
        body.innerHTML='<div class="admf-summary-h">'+recap+'</div>'+
          (ticketsAffiches.length?ticketsAffiches.map(tk=>ficheCardHtml(tk,parFiche[tk.id]||[])).join('')
            :'<div class="admdash-empty">'+t('adm_fiches_empty')+'</div>');
        body.querySelectorAll('.admf-sum-item').forEach(sp=>{
          sp.addEventListener('click',()=>{
            const r=sp.dataset.planrank?parseInt(sp.dataset.planrank,10):null;
            admFichesFiltrePlanRang=(admFichesFiltrePlanRang===r)?null:r;
            renderFiches();
          });
        });
      }else{
        // Historique : regroupement par jour.
        const jours=[...new Set(tickets.map(tk=>tk.play_date))];
        body.innerHTML=jours.map(j=>{
          const items=tickets.filter(tk=>tk.play_date===j);
          return '<div class="admdash-section-h">'+stripTags(dateLongue(j))+' — '+items.length+'</div>'+
            items.map(tk=>ficheCardHtml(tk,parFiche[tk.id]||[])).join('');
        }).join('');
        // "Charger plus" (Phase 3 roadmap, 27/08) : on a demandé exactement
        // admFichesHistLimit lignes — en recevoir exactement ce nombre est
        // le seul signal fiable qu'il en reste peut-être d'autres (une
        // réponse plus courte que la limite demandée signifie sans
        // ambiguïté qu'on a tout reçu).
        if(tickets.length>=admFichesHistLimit){
          body.innerHTML+='<button type="button" class="btn btn-outline" id="admFichesLoadMore" '+
            'style="width:100%;margin:14px 0 4px">'+stripTags(t('adm_fiches_load_more'))+'</button>';
          const btnPlus=document.getElementById('admFichesLoadMore');
          if(btnPlus)btnPlus.addEventListener('click',()=>{
            admFichesHistLimit+=ADMF_HIST_PAGE;
            renderFiches();
          });
        }
      }

      // Clic sur un match : ouvre l'editeur existant, positionne sur ce match.
      body.querySelectorAll('.admf-leg').forEach(b=>{
        b.addEventListener('click',()=>{
          selectedFicheId=b.dataset.fid;
          admFicheLegCible=parseInt(b.dataset.legidx,10);
          setView('fichedetail');renderFicheDetail();
        });
      });
      // Bouton "Modifier ce match" : ouvre l'editeur complet de la fiche.
      body.querySelectorAll('[data-editfid]').forEach(b=>{
        b.addEventListener('click',()=>{
          selectedFicheId=b.dataset.editfid;
          admFicheLegCible=null;
          setView('fichedetail');renderFicheDetail();
        });
      });
    }catch(e){
      body.innerHTML='<div class="admdash-empty">'+t('adm_k_error')+'</div>';
    }
  }

  // Onglets Du jour / Historique
  document.querySelectorAll('#admFichesTabs [data-ftab]').forEach(b=>{
    b.addEventListener('click',()=>{
      admFichesTab=b.dataset.ftab;
      admFichesHistLimit=ADMF_HIST_PAGE; // Phase 3 (27/08) : jamais garder une pagination gonflée d'un contexte à l'autre
      admFichesFiltrePlanRang=null; // le récap cliquable n'existe que sur "Du jour" — jamais un filtre fantôme sur l'Historique
      document.querySelectorAll('#admFichesTabs [data-ftab]').forEach(x=>x.classList.toggle('is-on',x===b));
      majFiltresJodiA();
      renderFiches();
    });
  });
  // Filtres de statut (les 2 onglets depuis le 27/08 — Phase 3 roadmap)
  document.querySelectorAll('#admFichesFilters [data-fstatus]').forEach(b=>{
    b.addEventListener('click',()=>{
      admFichesStatut=b.dataset.fstatus;
      admFichesHistLimit=ADMF_HIST_PAGE;
      document.querySelectorAll('#admFichesFilters [data-fstatus]').forEach(x=>x.classList.toggle('is-on',x===b));
      renderFiches();
    });
  });
  document.getElementById('admFichesDate').addEventListener('change',()=>{admFichesFiltrePlanRang=null;renderFiches();});
  document.getElementById('admFichesNew').addEventListener('click',()=>{
    selectedFicheId=null;
    fbLegsCourantes=[];
    admFicheLegCible=null;
    setView('fichedetail');
    renderFicheDetail();
  });

  /* ---- Génération manuelle de fiche (26/08) ----
     Appelle la fonction Netlify dédiée bot-generate-tickets-manual.js,
     jamais Supabase directement (la clé API-Sports doit rester côté
     serveur). Réservé aux administrateurs : le jeton de session est
     transmis, revérifié côté serveur avant toute génération. */
  let admGenPlansCache=null;
  // Mode de génération (27/08) : 'normal' (cote max) ou 'exact' (nombre de
  // matchs, score exact uniquement) — determine le titre affiché et le
  // corps envoyé à bot-generate-tickets-manual.js.
  let admGenMode='normal';
  async function renderAdmGenPlans(){
    const box=document.getElementById('admGenPlans');
    box.innerHTML='<span class="admdash-empty" style="padding:6px 0">'+t('adm_k_loading')+'</span>';
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    try{
      if(!admGenPlansCache){
        const {data,error}=await sb.from('plans').select('rank,name').order('rank',{ascending:true});
        if(error)throw error;
        admGenPlansCache=data||[];
      }
      box.innerHTML=admGenPlansCache.map(p=>
        '<label class="admf-chip" style="cursor:pointer;display:inline-flex;align-items:center;gap:6px">'+
          '<input type="checkbox" class="admGenPlanChk" value="'+p.rank+'" style="margin:0">'+stripTags(p.name||('Plan '+p.rank))+
        '</label>'
      ).join('');
    }catch(e){
      box.innerHTML='<span class="admdash-empty">'+t('adm_k_error')+'</span>';
    }
  }
  function ouvrirVueGeneration(mode){
    admGenMode=mode;
    document.getElementById('admGenDate').value=partsHaiti(new Date(Date.now()+24*3600*1000)).iso;
    document.getElementById('admGenResult').innerHTML='';
    // Mode basketball (session suivante, corrigé : mêmes options que le
    // foot) — le nombre de matchs (spécifique score exact) est masqué.
    // Date, heure début/fin, plans, cote max et publication restent
    // identiques au mode normal. Sport n'est plus affiché nulle part
    // (04/09) : toujours 'foot' pour normal/exact, le basketball ayant
    // son propre bouton et endpoint dédiés — voir admGenSport ci-dessus.
    document.getElementById('admGenBasketNote').style.display=(mode==='basket')?'':'none';
    document.getElementById('admGenCoteMaxWrap').style.display=(mode==='exact')?'none':'';
    document.getElementById('admGenNombreMatchsWrap').style.display=(mode==='exact')?'':'none';
    document.getElementById('admGenTitre').textContent=t(mode==='exact'?'adm_fiche_gen_exact_h':(mode==='basket'?'adm_fiche_gen_basket_h':'adm_fiche_gen_h'));
    document.getElementById('admGenSousTitre').textContent=t(mode==='exact'?'adm_fiche_gen_exact_p':(mode==='basket'?'adm_fiche_gen_basket_p':'adm_fiche_gen_p'));
    setView('fichegenerer');
    renderAdmGenPlans();
    renderQuotaBadgeGen(); // RÉACTIVÉ (session suivante) : rebranché sur le vrai quota (get_real_api_quota_today), plus le compteur interne du 29/08.
  }
  document.getElementById('admFicheGenererBtn').addEventListener('click',()=>ouvrirVueGeneration('normal'));
  document.getElementById('admFicheGenererExactBtn').addEventListener('click',()=>ouvrirVueGeneration('exact'));
  document.getElementById('admFicheGenererBasketBtn').addEventListener('click',()=>ouvrirVueGeneration('basket'));
  document.getElementById('admGenPublishMode').addEventListener('change',e=>{
    document.getElementById('admGenScheduledWrap').style.display=(e.target.value==='scheduled')?'block':'none';
  });
  document.getElementById('admGenSubmit').addEventListener('click',async()=>{
    const btn=document.getElementById('admGenSubmit');
    const resBox=document.getElementById('admGenResult');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){resBox.innerHTML='<div class="admdash-empty">'+t('adm_k_offline')+'</div>';return;}

    const playDate=document.getElementById('admGenDate').value;
    const heureDebut=document.getElementById('admGenHeureDebut').value;
    const heureFin=document.getElementById('admGenHeureFin').value;
    const sport=document.getElementById('admGenSport').value;
    const plansChoisis=Array.from(document.querySelectorAll('.admGenPlanChk:checked')).map(c=>Number(c.value));
    const coteMax=Number(document.getElementById('admGenCoteMax').value);
    const nombreMatchs=Number(document.getElementById('admGenNombreMatchs').value);
    const publishMode=document.getElementById('admGenPublishMode').value;
    const scheduledAt=document.getElementById('admGenScheduledAt').value;

    if(!playDate||!heureDebut||!heureFin){
      resBox.innerHTML='<div class="admdash-empty">'+t('adm_fiche_gen_err_champs')+'</div>';return;
    }
    if(!plansChoisis.length){
      resBox.innerHTML='<div class="admdash-empty">'+t('adm_fiche_gen_err_plans')+'</div>';return;
    }
    if(publishMode==='scheduled'&&!scheduledAt){
      resBox.innerHTML='<div class="admdash-empty">'+t('adm_fiche_gen_err_prog')+'</div>';return;
    }
    // CORRIGÉ (04/09, capture d'écran à l'appui : James a vu le popup natif
    // du navigateur au lieu du modal stylé) — remplace window.confirm()
    // par demanderConfirmation() (icône 'fiche', même modal que partout
    // ailleurs dans l'admin). demanderConfirmation étant asynchrone (le
    // modal attend le clic de l'utilisateur), tout ce qui suivait l'ancien
    // "if(!window.confirm(...))return;" est déplacé dans lancerGeneration(),
    // appelée uniquement si l'admin confirme — comportement strictement
    // identique sinon, aucune règle de génération changée.
    const texteConfirm=admGenMode==='basket'?t('adm_fiche_gen_basket_confirm'):t('adm_fiche_gen_confirm');
    demanderConfirmation(btn,texteConfirm,lancerGeneration,'fiche');

    async function lancerGeneration(){
    btn.disabled=true;btn.textContent=t('adm_fiche_gen_wait');
    resBox.innerHTML='';
    try{
      const {data:sessionData}=await sb.auth.getSession();
      const token=sessionData&&sessionData.session&&sessionData.session.access_token;
      if(!token)throw new Error(t('adm_fiche_gen_err_session'));

      // corps de requete : mode 'exact' envoie nombreMatchs au lieu de
      // coteMax (27/08, voir bot-generate-tickets-manual-background.js).
      // Mode 'basket' (session suivante) : mêmes champs que le mode
      // normal (playDate/heureDebut/heureFin/plans/coteMax/publishMode),
      // sport implicite (pas envoyé), endpoint dédié.
      const corps=admGenMode==='exact'
        ? {playDate,heureDebut,heureFin,sport,plans:plansChoisis,mode:'exact',nombreMatchs,publishMode,scheduledAt}
        : (admGenMode==='basket'
          ? {playDate,heureDebut,heureFin,plans:plansChoisis,coteMax,publishMode,scheduledAt}
          : {playDate,heureDebut,heureFin,sport,plans:plansChoisis,coteMax,publishMode,scheduledAt});
      // 28/08 v5 : fonction Background — aucune réponse utilisable
      // (Netlify répond 202 immédiatement, l'exécution continue après,
      // jusqu'à ~6-7 min pour espacer les appels /odds sous la limite de
      // 10 requêtes/minute d'API-Sports). On ne lit plus out.resultats ;
      // à la place, message d'attente + bouton "Vérifier maintenant" qui
      // rafraîchit simplement la liste des Fiches.
      const endpoint=admGenMode==='basket'
        ?'/.netlify/functions/bot-generate-tickets-basket-manual-background'
        :'/.netlify/functions/bot-generate-tickets-manual-background';
      fetch(endpoint,{
        method:'POST',
        headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},
        body:JSON.stringify(corps)
      }).catch(()=>{}); // fire-and-forget : une erreur réseau ici n'a pas de retour utile à afficher
      resBox.innerHTML='<div class="admdash-row" style="cursor:default"><span class="admdash-row-tx"><b>'+
        stripTags(t('adm_fiche_gen_bg_lance'))+'</b><span>'+stripTags(admGenMode==='basket'?t('adm_fiche_gen_basket_bg_attente'):t('adm_fiche_gen_bg_attente'))+'</span></span></div>'+
        '<button type="button" class="btn btn-outline" id="admGenVerifier" style="width:100%;margin-top:10px">'+
        stripTags(t('adm_fiche_gen_bg_verifier'))+'</button>';
      document.getElementById('admGenVerifier').addEventListener('click',()=>{
        setView('fiches');renderFiches();
      });
    }catch(e){
      resBox.innerHTML='<div class="admdash-empty">'+stripTags(e.message)+'</div>';
    }finally{
      btn.disabled=false;btn.textContent=t('adm_fiche_gen_submit');
    }
    }
  });

  function legRowHtml(leg,i){
    /* Protection STRICTE des matchs deja termines (durcie le 25/08, sur
       demande explicite) : une selection dont le resultat est deja regle
       (won/lost/void, ecrit par le bot) est affichee en lecture seule, SANS
       AUCUN moyen de la deverrouiller depuis l'interface — l'admin ne peut
       plus jamais entrer dans un match termine pour le modifier, que la
       fiche entiere soit close (Historique) ou encore en cours avec ce
       match-la deja joue. La base applique la meme protection de son cote
       (admin_save_ticket reapplique systematiquement le resultat deja
       regle), donc meme un contournement du frontend ne changerait rien. */
    const regle=!!leg.result;
    const bandeau=regle
      ? '<div class="admf-lock"><span style="flex:1">'+marqueLeg(leg.result)+' '+t('adm_fiche_leg_locked')+'</span></div>'
      : '';
    const ro=regle?' disabled':'';
    // Reglement manuel (session suivante, demande explicite de James : le
    // compte API-Sports peut etre suspendu, ou le bot indisponible pour
    // toute autre raison — dans ce cas AUCUNE fiche ne se regle jamais
    // automatiquement, et il n'existait avant AUCUN moyen d'entrer un
    // resultat a la main, meme en urgence). Ce selecteur ecrit
    // directement dans fbLegsCourantes[i].result (voir rebrancherLegs) ;
    // le vrai verrou reste process cote base (admin_save_ticket) : un
    // match deja regle ne peut jamais etre re-modifie, meme via ce
    // selecteur, puisqu'il est simplement absent (bandeau verrouille
    // ci-dessus a la place). Options : vide (pas encore joue), Gagne,
    // Perdu, Annule (meme vocabulaire que marqueLeg/l'historique client).
    const resultSel=regle?'':
      '<div style="display:flex;gap:8px;align-items:center;margin-top:2px">'+
        '<label class="fb-leg-result-lbl" style="font-size:12px;opacity:.75;white-space:nowrap">'+t('adm_leg_result_lbl')+'</label>'+
        '<select class="fb-leg-result" data-idx="'+i+'" style="flex:1">'+
          '<option value=""'+(!leg.result?' selected':'')+'>'+t('adm_leg_result_none')+'</option>'+
          '<option value="won">'+t('adm_leg_result_won')+'</option>'+
          '<option value="lost">'+t('adm_leg_result_lost')+'</option>'+
          '<option value="void">'+t('adm_leg_result_void')+'</option>'+
        '</select>'+
      '</div>';
    return '<div class="admdash-hist-row" data-legidx="'+i+'" style="flex-direction:column;align-items:stretch;gap:8px;padding:12px'+(regle?';opacity:.72':'')+'">'+
      bandeau+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<input type="text" class="fb-leg-field" data-f="match_label" placeholder="'+t('adm_fiche_leg_match')+'" value="'+(leg.match_label||'').replace(/"/g,'&quot;')+'" style="flex:2;min-width:140px"'+ro+'>'+
        '<input type="text" class="fb-leg-field" data-f="match_time" placeholder="'+t('adm_fiche_leg_time')+'" value="'+(leg.match_time||'').replace(/"/g,'&quot;')+'" style="flex:1;min-width:70px"'+ro+'>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<input type="text" class="fb-leg-field" data-f="league" placeholder="'+t('adm_fiche_leg_league')+'" value="'+(leg.league||'').replace(/"/g,'&quot;')+'" style="flex:1;min-width:100px"'+ro+'>'+
        '<input type="text" class="fb-leg-field" data-f="market" placeholder="'+t('adm_fiche_leg_market')+'" value="'+(leg.market||'').replace(/"/g,'&quot;')+'" style="flex:1;min-width:100px"'+ro+'>'+
      '</div>'+
      '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
        '<input type="text" class="fb-leg-field" data-f="pick" placeholder="'+t('adm_fiche_leg_pick')+'" value="'+(leg.pick||'').replace(/"/g,'&quot;')+'" style="flex:2;min-width:100px"'+ro+'>'+
        '<input type="number" step="0.01" class="fb-leg-field" data-f="odd" placeholder="'+t('adm_fiche_leg_odd')+'" value="'+(leg.odd!=null?leg.odd:'')+'" style="flex:1;min-width:70px"'+ro+'>'+
      '</div>'+
      resultSel+
      '<button type="button" class="btn btn-reject fb-leg-del" data-idx="'+i+'" style="align-self:flex-end;padding:7px 14px;font-size:12px"'+ro+'>'+t('adm_fiche_leg_remove')+'</button>'+
    '</div>';
  }
  function rebrancherLegs(){
    document.querySelectorAll('.fb-leg-field').forEach(inp=>{
      inp.addEventListener('input',()=>{
        const idx=parseInt(inp.closest('[data-legidx]').dataset.legidx,10);
        const champ=inp.dataset.f;
        fbLegsCourantes[idx][champ]=champ==='odd'?(inp.value?parseFloat(inp.value):null):inp.value;
        if(champ==='odd')majResumeCote();
      });
    });
    document.querySelectorAll('.fb-leg-result').forEach(sel=>{
      sel.addEventListener('change',()=>{
        const idx=parseInt(sel.dataset.idx,10);
        fbLegsCourantes[idx].result=sel.value||null;
        majStatutAutoDepuisLegs();
      });
    });
    document.querySelectorAll('.fb-leg-del').forEach(b=>{
      b.addEventListener('click',()=>{
        fbLegsCourantes.splice(parseInt(b.dataset.idx,10),1);
        rerenderLegsList();
      });
    });
  }
  /* Reglement manuel : des que TOUS les matchs d'une fiche ont un resultat
     saisi (won/lost/void), le statut de la fiche entiere se calcule tout
     seul — jamais a saisir separement, jamais desynchronise du detail par
     match. Une seule defaite suffit a perdre le combine (regle standard) ;
     sinon gagnee des que plus aucun match n'est en attente. Le selecteur
     "Statut" reste modifiable a la main pour les cas hors norme (ex.
     annulation totale avant que tous les matchs soient joues), mais n'est
     plus jamais la SEULE source de verite une fois le detail complet. */
  function majStatutAutoDepuisLegs(){
    const sel=document.getElementById('admFicheStatus');
    if(!sel||!fbLegsCourantes.length)return;
    const tousRegles=fbLegsCourantes.every(l=>!!l.result);
    if(!tousRegles)return;
    const perdu=fbLegsCourantes.some(l=>l.result==='lost');
    sel.value=perdu?'lost':'won';
  }
  function rerenderLegsList(){
    const box=document.getElementById('admFicheLegsList');
    if(!box)return;
    box.innerHTML=fbLegsCourantes.map((l,i)=>legRowHtml(l,i)).join('')||'<div class="admdash-hist-empty">'+t('adm_fiche_leg_none')+'</div>';
    rebrancherLegs();
    majResumeCote();
  }

  async function renderFicheDetail(){
    const box=document.getElementById('admFicheDetail');
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    box.innerHTML='<div class="admdash-empty">'+t('adm_k_loading')+'</div>';
    if(!sb)return;
    let tk={code:'',sport:'foot',min_plan_rank:1,status:'pending',confidence:70,play_date:document.getElementById('admFichesDate').value||dateAujourdhui(),published:false};
    fbLegsCourantes=[];
    if(selectedFicheId){
      try{
        const {data:tdata}=await sb.from('tickets').select('*').eq('id',selectedFicheId).single();
        if(tdata)tk=tdata;
        const {data:ldata}=await sb.from('ticket_legs').select('*').eq('ticket_id',selectedFicheId).order('position',{ascending:true});
        // L'heure est presentee a l'heure d'Haiti. fixture_id et result
        // (renseignes par le bot) sont conserves tels quels : une simple
        // correction de cote ne doit jamais effacer ces informations.
        fbLegsCourantes=(ldata||[]).map(l=>({
          match_label:l.match_label,
          match_time:heureHaitiDeLeg(l,tk.play_date),
          league:l.league,market:l.market,pick:l.pick,odd:l.odd,
          fixture_id:l.fixture_id,result:l.result
        }));
      }catch(e){}
    }
    /* Garde-fou en profondeur (25/08) : meme si un lien vers cette fiche
       subsiste quelque part, une fiche TERMINEE (won/lost) ne s'ouvre
       jamais en edition — affichage seul, aucun champ, aucun bouton. La
       carte (ficheCardHtml) ne propose deja plus ce chemin normalement. */
    if(selectedFicheId&&(tk.status==='won'||tk.status==='lost')){
      box.innerHTML='<div class="admf-lock" style="margin:0 0 4px">'+
        '<span>'+t('adm_fiche_leg_locked')+'</span></div>'+
        '<div class="admdash-section-h">'+stripTags(titreFiche(tk,fbLegsCourantes))+'</div>'+
        '<div id="admFicheLegsList"></div>';
      rerenderLegsList();
      return;
    }
    const plans=(window.VB_allPlans?window.VB_allPlans():[]).slice().sort((a,b)=>rank[a.id]-rank[b.id]);
    const optionsPlans=plans.map(pl=>'<option value="'+rank[pl.id]+'"'+(tk.min_plan_rank===rank[pl.id]?' selected':'')+'>'+stripTags(window.VB_planLabel(pl))+'</option>').join('');
    const optionsSport=['foot','basket'].map(s=>'<option value="'+s+'"'+((tk.sport===s||(s==='basket'&&tk.sport==='nba'))?' selected':'')+'>'+(s==='foot'?t('adm_fiche_sport_foot'):t('adm_fiche_sport_nba'))+'</option>').join('');
    const optionsStatus=['pending','won','lost'].map(s=>'<option value="'+s+'"'+(tk.status===s?' selected':'')+'>'+t('adm_fiche_st_'+s)+'</option>').join('');

    box.innerHTML=
      '<label class="field"><span class="field-lbl">'+t('adm_fiche_code')+'</span>'+
      '<input type="text" id="admFicheCode" value="'+(tk.code||'').replace(/"/g,'&quot;')+'" placeholder="'+t('adm_fiche_code_ph')+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_fiche_plan')+'</span>'+
      '<select id="admFichePlan">'+optionsPlans+'</select></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_fiche_sport')+'</span>'+
      '<select id="admFicheSport">'+optionsSport+'</select></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_fiche_confidence')+'</span>'+
      '<input type="number" min="0" max="100" id="admFicheConf" value="'+(tk.confidence!=null?tk.confidence:70)+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_fiche_date')+'</span>'+
      '<input type="date" id="admFicheDate" value="'+(tk.play_date||dateAujourdhui())+'"></label>'+
      '<label class="field" style="margin-top:10px"><span class="field-lbl">'+t('adm_fiche_status')+'</span>'+
      '<select id="admFicheStatus">'+optionsStatus+'</select></label>'+
      '<label style="display:flex;align-items:center;gap:9px;margin-top:12px;font-size:13.5px;color:#F4F3ED">'+
      '<input type="checkbox" id="admFichePub" style="width:17px;height:17px"'+(tk.published?' checked':'')+'> '+t('adm_published_toggle')+
      '</label>'+

      '<div class="admdash-section-h">'+t('adm_fiche_legs_h')+'</div>'+
      '<div id="admFicheLegsList"></div>'+
      '<div id="admFicheCoteResume" style="margin-top:10px;font-size:12.5px;color:#9FB0C4"></div>'+
      '<button type="button" class="btn btn-ghost" id="admFicheLegAdd" style="width:100%;margin-top:10px">'+t('adm_fiche_leg_add')+'</button>'+

      '<button type="button" class="btn btn-confirm" id="admFicheSave" style="width:100%;margin-top:18px">'+t('adm_fiche_save')+'</button>'+
      (selectedFicheId?'<button type="button" class="btn btn-reject" id="admFicheDelete" style="width:100%;margin-top:10px">'+t('adm_fiche_delete')+'</button>':'')+
      '<div id="admFicheErr" class="field-err" style="display:none;margin-top:8px"></div>';

    rerenderLegsList();
    /* Ouverture ciblee : quand l'admin a clique sur un match precis dans la
       liste des fiches, on amene ce match a l'ecran et on met le curseur
       dans son premier champ modifiable. La cible est consommee une seule
       fois (remise a null) pour ne pas rejouer le defilement au prochain
       rendu de la meme fiche. */
    if(admFicheLegCible!=null){
      const cible=document.querySelector('[data-legidx="'+admFicheLegCible+'"]');
      admFicheLegCible=null;
      if(cible){
        try{cible.scrollIntoView({behavior:'smooth',block:'center'});}catch(e){cible.scrollIntoView();}
        const premier=cible.querySelector('.fb-leg-field:not([disabled])');
        if(premier)setTimeout(()=>{try{premier.focus();}catch(e){}},350);
      }
    }
    // Le catalogue peut arriver apres le premier rendu : on rafraichit
    // le rappel des que la plage du plan est connue.
    chargerPlagesCotes().then(()=>majResumeCote());
    document.getElementById('admFichePlan').addEventListener('change',majResumeCote);

    document.getElementById('admFicheLegAdd').addEventListener('click',()=>{
      fbLegsCourantes.push({match_label:'',match_time:'',league:'',market:'',pick:'',odd:null});
      rerenderLegsList();
    });

    document.getElementById('admFicheSave').addEventListener('click',function(){
      const err=document.getElementById('admFicheErr');
      // Meme calcul qu'a chaque changement de resultat (majStatutAutoDepuisLegs) —
      // reapplique ici en defense de profondeur, au cas ou la fiche etait deja
      // partiellement reglee a l'ouverture sans qu'aucun evenement 'change' n'ait eu lieu.
      majStatutAutoDepuisLegs();
      const payload={
        code:document.getElementById('admFicheCode').value.trim()||null,
        min_plan_rank:parseInt(document.getElementById('admFichePlan').value,10),
        sport:document.getElementById('admFicheSport').value,
        confidence:parseInt(document.getElementById('admFicheConf').value,10)||null,
        play_date:document.getElementById('admFicheDate').value,
        status:document.getElementById('admFicheStatus').value,
        published:document.getElementById('admFichePub').checked
      };
      if(!payload.play_date){err.textContent=t('adm_fiche_err_incomplete');err.style.display='block';return;}
      if(!fbLegsCourantes.length){err.textContent=t('adm_fiche_err_nolegs');err.style.display='block';return;}
      const legsIncomplets=fbLegsCourantes.some(l=>!l.match_label||!l.pick||l.odd==null||!(parseFloat(l.odd)>0));
      if(legsIncomplets){err.textContent=t('adm_fiche_err_leg_incomplete');err.style.display='block';return;}
      /* Plage de cote du plan : controlee ici pour un message clair et
         traduit, et de nouveau par la base qui refuse l'ecriture — la
         verification cote navigateur est un confort, jamais la garantie. */
      const plage=plagesCotes?plagesCotes[payload.min_plan_rank]:null;
      const totalSaisi=coteTotaleSaisie();
      if(plage&&((plage.min!=null&&totalSaisi<plage.min)||(plage.max!=null&&totalSaisi>plage.max))){
        err.textContent=t('adm_fiche_err_odds_range')
          .replace('{n}',totalSaisi.toFixed(2))
          .replace('{min}',plage.min!=null?plage.min.toFixed(2):'0')
          .replace('{max}',plage.max!=null?plage.max.toFixed(2):t('adm_fiche_odds_unlimited'));
        err.style.display='block';return;
      }
      err.style.display='none';
      demanderConfirmation(this,t('adm_confirm_q_save'),()=>sauvegarderFiche(payload),'fiche');
    });
    if(selectedFicheId){
      document.getElementById('admFicheDelete').addEventListener('click',function(){
        demanderConfirmation(this,t('adm_confirm_q_delete'),()=>supprimerFiche(selectedFicheId),'trash');
      });
    }
  }

  /* Messages d'erreur renvoyes par la base (fonction admin_save_ticket).
     On les traduit en clair plutot que de montrer un code brut. */
  function messageErreurFiche(e){
    const brut=((e&&e.message)?e.message:String(e))||'';
    if(brut.indexOf('aucune_selection')>-1)return t('adm_fiche_err_nolegs');
    if(brut.indexOf('selection_invalide')>-1)return t('adm_fiche_err_leg_incomplete');
    if(brut.indexOf('champs_manquants')>-1)return t('adm_fiche_err_incomplete');
    if(brut.indexOf('tickets_code_key')>-1||brut.indexOf('duplicate key')>-1)return t('adm_fiche_err_code_dup');
    if(brut.indexOf('non_autorise')>-1)return t('adm_fiche_err_forbidden');
    if(brut.indexOf('cote_hors_plage')>-1){
      // La base donne le detail chiffre : on le garde, precede du libelle traduit.
      return t('adm_fiche_err_odds_plan')+' — '+brut.replace(/^.*cote_hors_plage:\s*/,'').slice(0,160);
    }
    return t('adm_fiche_err_save')+' — '+brut.slice(0,140);
  }

  async function sauvegarderFiche(payload){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    const btn=document.getElementById('admFicheSave');
    if(btn)btn.disabled=true;
    try{
      /* Ecriture ATOMIQUE : la fiche et toutes ses selections sont
         enregistrees en une seule transaction cote base. Avant, la
         suppression des anciennes selections et l'insertion des nouvelles
         etaient deux appels distincts : si le second echouait, la fiche
         restait publiee mais VIDE cote client. Ce n'est plus possible. */
      const legsAEcrire=fbLegsCourantes.map(l=>{
        // L'heure saisie est une heure d'Haiti : on envoie l'instant exact
        // (kickoff_at) et l'heure UTC correspondante, comme le bot.
        const inst=instantDepuisHaiti(payload.play_date,l.match_time);
        return {
          match_label:(l.match_label||'').trim(),
          match_time:inst?inst.toISOString().slice(11,16):((l.match_time||'').trim()||null),
          kickoff_at:inst?inst.toISOString():null,
          league:(l.league||'').trim()||null,
          market:(l.market||'').trim()||null,
          pick:(l.pick||'').trim(),
          odd:l.odd,
          fixture_id:l.fixture_id!=null?String(l.fixture_id):null,
          // Le resultat deja regle est conserve tel quel — et de toute facon
          // reapplique par admin_save_ticket, qui l'ecrase si besoin.
          result:l.result||null
        };
      });
      const {data:idFiche,error}=await sb.rpc('admin_save_ticket',{
        p_id:selectedFicheId,
        p_ticket:payload,
        p_legs:legsAEcrire
      });
      if(error)throw error;
      if(!idFiche)throw new Error('fiche_non_enregistree');

      if(window.VB_toast)window.VB_toast('adm_fiche_toast_h',t('adm_fiche_toast_p'));
      if(viewStack.length)setView(viewStack.pop(),true);else setView('fiches',true);
    }catch(e){
      const err=document.getElementById('admFicheErr');
      if(err){err.textContent=messageErreurFiche(e);err.style.display='block';}
      if(btn)btn.disabled=false;
    }
  }
  async function supprimerFiche(id){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    try{
      // Suppression en un seul appel : les selections partent avec la
      // fiche (cascade en base), jamais l'une sans l'autre.
      const {error}=await sb.rpc('admin_delete_ticket',{p_id:id});
      if(error)throw error;
      if(window.VB_toast)window.VB_toast('adm_fiche_toast_del_h',t('adm_fiche_toast_del_p'));
      setView('fiches',true);
    }catch(e){
      const err=document.getElementById('admFicheErr');
      if(err){err.textContent=messageErreurFiche(e);err.style.display='block';}
    }
  }

  window.VB_openAdminDash=openAdminDash;
})();

/* ---------- Journal d'erreurs techniques a destination de l'admin ----------
   Remplace toute exposition de detail technique brut a l'utilisateur.
   Ecriture "best effort" : ne bloque et ne notifie jamais l'utilisateur,
   degrade silencieusement si la table est injoignable. */
(function(){
  window.VB_logErreurTechnique=function(contexte,message){
    try{
      const sb=window.VB_getSupabase&&window.VB_getSupabase();
      if(!sb)return;
      const st=window.VB_getState?window.VB_getState():null;
      sb.from('error_log').insert({
        user_id:(st&&st.supabaseUserId)||null,
        email:(st&&st.email)||null,
        context:String(contexte||'').slice(0,80),
        message:String(message||'').slice(0,500)
      }).then(()=>{}).catch(()=>{});
    }catch(e){}
  };
})();

/* ---------- Codes de verification par e-mail (signup) ----------
   Le code n'est plus JAMAIS genere, stocke ou compare dans le navigateur —
   c'est desormais 100% cote serveur (Netlify Functions + Resend), exactement
   selon le meme principe que la reinitialisation de mot de passe
   (request-password-reset / confirm-password-reset). Aucun filet de secours
   n'affiche plus le code a l'ecran en cas d'echec d'envoi : un echec reste
   un echec, signale clairement, jamais contourne. */
(function(){
  window.VB_requestSignupCode=async function(email,btn){
    let orig=null, texteEnvoi=null;
    if(btn){
      orig=btn.textContent;
      texteEnvoi=(translations[currentLang]||translations.fr).wiz_sending||orig;
      btn.disabled=true;
      btn.textContent=texteEnvoi;
    }
    try{
      const resp=await fetch('/.netlify/functions/request-signup-code',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:email})
      });
      const data=await resp.json().catch(()=>({}));
      if(!resp.ok){
        const base=(data&&data.error)||('HTTP '+resp.status);
        const detail=(data&&data.detail)?(typeof data.detail==='string'?data.detail:JSON.stringify(data.detail)):'';
        return {ok:false, erreur:detail?(base+' — '+detail):base};
      }
      return {ok:true};
    }catch(e){
      return {ok:false, erreur:(e&&e.message)?e.message:String(e)};
    }finally{
      if(btn){
        btn.disabled=false;
        if(btn.textContent===texteEnvoi)btn.textContent=orig;
      }
    }
  };
  window.VB_confirmSignupCode=async function(email,code){
    try{
      const resp=await fetch('/.netlify/functions/confirm-signup-code',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:email, code:code})
      });
      const data=await resp.json().catch(()=>({}));
      if(!resp.ok)return {ok:false, erreur:(data&&data.error)||('HTTP '+resp.status)};
      return {ok:true};
    }catch(e){
      return {ok:false, erreur:(e&&e.message)?e.message:String(e)};
    }
  };
})();

/* ---------- Connexion a Supabase (base de donnees reelle) ----------
   La cle "anon" ci-dessous est publique par conception : elle ne donne
   AUCUN acces qui ne soit deja controle par les regles de securite (RLS)
   ecrites dans la base elle-meme. C'est la base qui protege les donnees,
   jamais le navigateur — contrairement a l'ancien systeme en localStorage. */
(function(){
  const SUPABASE_URL='https://llqifjfcpyddwjkferpn.supabase.co';
  const SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxscWlmamZjcHlkZHdqa2ZlcnBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY3MTU2MjcsImV4cCI6MjEwMjI5MTYyN30.Bw7-CHFDYV4LmNtt6WyIc5gSt3UCe7n5agbyBEo6-Zc';

  function initSupabase(){
    if(typeof window.supabase==='undefined'||!window.supabase.createClient){
      // Le script CDN n'est pas encore charge (ou bloque) : on reessaiera.
      return null;
    }
    if(!window.VB_supabase){
      /* IMPORTANT : sessionStorage (jamais localStorage) pour le stockage
         de la session Supabase. Par defaut, Supabase utilise localStorage,
         qui est PARTAGE entre tous les onglets d'un meme navigateur — se
         connecter en admin dans un onglet puis en utilisateur normal dans
         un autre onglet ferait "gagner" la derniere connexion partout, y
         compris au rafraichissement (chaque onglet afficherait le
         Dashboard de l'autre). sessionStorage isole chaque onglet
         completement : sa session survit a un F5 dans CE meme onglet,
         mais n'est jamais partagee avec un autre onglet. */
      window.VB_supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY,{
        auth:{storage:window.sessionStorage,persistSession:true,autoRefreshToken:true}
      });
    }
    return window.VB_supabase;
  }

  // Le script CDN a l'attribut "defer" : on tente immediatement, puis on
  // reessaie apres le chargement complet de la page par securite.
  initSupabase();
  window.addEventListener('load',initSupabase);
  window.VB_getSupabase=initSupabase;

  /* ======================================================================
     PREUVES DE LA PAGE D'ACCUEIL — alimentees par la BASE, jamais en dur.
     ----------------------------------------------------------------------
     Le bandeau defilant affichait six resultats ecrits dans le HTML
     ("Chelsea - Liverpool - BTTS Oui 1.50 GAGNE"), identiques depuis le
     premier jour. On les remplace par les VRAIES selections gagnantes des
     fiches deja jouees et deja reglees.

     Trois garde-fous, dans cet ordre :
       1. seules les fiches `status='won'` ET `play_date` PASSEE sont lues :
          jamais un pronostic du jour, jamais un resultat non tranche ;
       2. la regle RLS "selections des fiches reglees visibles par tous"
          autorise cette lecture sans compte, et RIEN d'autre ;
       3. si la base ne renvoie rien, le bandeau est MASQUE. Il ne retombe
          jamais sur les anciens exemples : une preuve inventee vaut moins
          que pas de preuve du tout.
     ====================================================================== */
  async function chargerPreuvesAccueil(){
    const piste=document.getElementById('tick');
    if(!piste)return;
    const bandeau=piste.closest('.ticker');
    const masquer=()=>{if(bandeau)bandeau.style.display='none';};

    const sb=initSupabase();
    if(!sb){masquer();return;}

    /* Petit traducteur local : `t()` est enferme dans les IIFE du dessus,
       mais `translations` et `currentLang` sont au niveau du bloc. */
    const trad=k=>{
      try{
        const lang=(typeof currentLang!=='undefined'&&currentLang)?currentLang:'fr';
        const table=(translations&&translations[lang])||translations.fr||{};
        if(table[k]!=null)return table[k];
        return (translations.fr&&translations.fr[k])||k;
      }catch(e){return k;}
    };
    const echapper=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

    try{
      /* Le jour de reference est celui d'Haiti : en fin de soiree locale,
         UTC est deja au lendemain et une fiche du jour meme, deja reglee,
         serait presentee comme une preuve passee. */
      const aujourdhui=(window.VB_dateHaiti?window.VB_dateHaiti():new Date().toISOString().slice(0,10));
      const depuis=new Date(Date.parse(aujourdhui+'T00:00:00Z')-14*86400000);

      const {data:fiches,error}=await sb.from('tickets')
        .select('id,play_date')
        .eq('published',true).eq('status','won')
        .lt('play_date',aujourdhui)
        .gte('play_date',depuis.toISOString().slice(0,10))
        .order('play_date',{ascending:false}).limit(8);

      if(error||!fiches||!fiches.length){masquer();return;}

      const {data:legs}=await sb.from('ticket_legs')
        .select('ticket_id,league,league_country,match_label,market,pick,odd,result')
        .in('ticket_id',fiches.map(f=>f.id))
        .order('position',{ascending:true});

      // Une selection annulee (match reporte) n'est pas une preuve.
      const gagnantes=(legs||[]).filter(l=>l.result!=='void').slice(0,12);
      if(!gagnantes.length){masquer();return;}

      const html=gagnantes.map(l=>{
        // Meme regle d'affichage que le Dashboard : une cle i18n connue est
        // traduite, un score exact ("2 — 1") s'affiche tel quel.
        // Notation 1/2 (28/08) : affichage uniquement, voir commentaire du premier site.
        const pickRaw3=String(l.pick||'').replace(/^Victoire\s*:\s*Home$/i,'Victoire : 1').replace(/^Victoire\s*:\s*Away$/i,'Victoire : 2');
        const pick=(pickRaw3.indexOf(' — ')>-1||!(translations.fr||{})[pickRaw3])
          ? pickRaw3 : trad(pickRaw3);
        const marche=(translations.fr||{})[l.market]?trad(l.market):(l.market||'');
        const cote=Number(l.odd);
        return '<span><i class="lg">'+echapper(String(l.league||'').toUpperCase())+(l.league_country?' ('+echapper(l.league_country)+')':'')+'</i> &nbsp;'+
          echapper(l.match_label)+' · '+echapper(marche)+' '+echapper(pick)+
          ' <b>'+(isFinite(cote)?cote.toFixed(2):'')+'</b>'+
          '<i class="w" data-i18n="tick_won">'+echapper(trad('tick_won')||'GAGNÉ')+'</i></span>';
      }).join('');

      // Doublee : le defilement en boucle a besoin d'une piste continue.
      piste.innerHTML=html+html;
      if(bandeau)bandeau.style.display='';
    }catch(e){masquer();}
  }

  // Le bandeau part masque : il ne doit jamais montrer les anciens exemples
  // ecrits en dur, meme une fraction de seconde.
  (function(){
    const p=document.getElementById('tick');
    const b=p&&p.closest('.ticker');
    if(b)b.style.display='none';
    if(p)p.innerHTML='';
  })();
  chargerPreuvesAccueil();
  window.addEventListener('load',chargerPreuvesAccueil);
  window.VB_rechargerPreuves=chargerPreuvesAccueil;

  /* Auto-test, utilisable depuis la console du navigateur :
     VB_testSupabase() puis regarder le resultat affiche. Ne modifie rien
     dans la base, se contente de lire la table publique "plans". */
  window.VB_testSupabase=async function(){
    const sb=initSupabase();
    if(!sb){console.log('Supabase : client non charge (verifier la connexion internet / le CDN)');return false;}
    try{
      const {data,error}=await sb.from('plans').select('id,name,price_htg').order('rank');
      if(error){console.log('Supabase : erreur ->',error.message);return false;}
      console.log('Supabase : connexion OK, plans recus ->',data);
      return true;
    }catch(e){
      console.log('Supabase : echec reseau ->',e.message);
      return false;
    }
  };
})();

/* ---------- Animation de lancement ---------- */
(function(){
  const el=document.getElementById('vbSplash');
  if(!el)return;
  const ring=el.querySelector('.vbsplash-ring');
  const foot=el.querySelector('.vbsplash-ball-foot');
  const bask=el.querySelector('.vbsplash-ball-bask');
  // Un tour complet du ballon de football, puis un tour complet du
  // ballon de basket, et ainsi de suite (alternance a chaque tour).
  let tour='foot';
  ring.addEventListener('animationiteration',()=>{
    tour=(tour==='foot')?'bask':'foot';
    foot.style.display=(tour==='foot')?'':'none';
    bask.style.display=(tour==='bask')?'':'none';
  });

  function hide(){el.classList.add('hide');}
  function show(){el.classList.remove('hide');}

  // Lancement initial du site : duree minimale pour eviter un flash,
  // et filet de securite pour ne jamais bloquer l'affichage.
  const MIN_SHOW=1400,MAX_SHOW=4000;
  const t0=Date.now();
  function finirLancement(){
    const attente=Math.max(0,MIN_SHOW-(Date.now()-t0));
    setTimeout(hide,attente);
  }
  if(document.readyState==='complete')finirLancement();
  else window.addEventListener('load',finirLancement);
  setTimeout(hide,MAX_SHOW);

  /* Reutilisable pour d'autres transitions (ouverture du dashboard, par
     exemple) sur une connexion lente. Non declenche automatiquement en
     dehors du lancement initial : un site en un seul fichier n'a pas de
     temps de chargement reel entre ses pages, et simuler une attente
     artificielle ralentirait l'experience sans raison. */
  window.VB_splashShow=show;
  window.VB_splashHide=hide;
})();

/* ---------- 2FA admin (Supabase MFA/TOTP natif) ----------
   Ne concerne QUE les comptes admin. Un admin sans facteur TOTP verifie
   est FORCE de s'inscrire avant d'acceder au tableau de bord — ce n'est
   jamais facultatif. Un admin qui a deja un facteur verifie doit
   entrer un code a chaque connexion (challenge), avant tout acces. */
(function(){
  const overlay=document.getElementById('mfaOverlay');
  if(!overlay)return;
  const stageEnroll=overlay.querySelector('[data-mfa="enroll"]');
  const stageChallenge=overlay.querySelector('[data-mfa="challenge"]');
  const stageBackup=overlay.querySelector('[data-mfa="backup"]');
  const stageCodes=overlay.querySelector('[data-mfa="codes"]');
  const stageError=overlay.querySelector('[data-mfa="error"]');
  const enrollOtp=[...document.getElementById('mfaEnrollOtp').querySelectorAll('input')];
  const challengeOtp=[...document.getElementById('mfaChallengeOtp').querySelectorAll('input')];
  const enrollErr=document.getElementById('mfaEnrollErr');
  const challengeErr=document.getElementById('mfaChallengeErr');
  const backupErr=document.getElementById('mfaBackupErr');
  const errorDetail=document.getElementById('mfaErrorDetail');
  const T=()=>translations[currentLang]||translations.fr;
  const t=k=>(T()[k]!=null?T()[k]:(translations.fr[k]||''));

  let factorIdCourant=null;
  let challengeIdCourant=null;
  let onSuccessCourant=null;
  let emailCourant=null;
  let adminIdCourant=null;
  let seSouvenirCourant=false;
  let dernierCodesGeneres=null;

  /* ---- "Se souvenir de cet appareil" : purement local (ce navigateur
     precis), jamais un remplacement de la vraie verification serveur —
     juste un confort. Efface par une deconnexion explicite, expire seul
     apres 30 jours, ne survit jamais un changement de navigateur
     (localStorage est deja propre a chaque navigateur). */
  const TRUST_KEY='vipbetcote.mfa_trusted.v1';
  const TRUST_DUREE=30*24*60*60*1000;
  function mfaGetTrustMap(){try{return JSON.parse(localStorage.getItem(TRUST_KEY)||'{}');}catch(e){return {};}}
  function mfaEstDigneDeConfiance(email){
    if(!email)return false;
    const m=mfaGetTrustMap();
    const e=m[email.toLowerCase()];
    return !!(e&&e.expiresAt&&Date.now()<e.expiresAt);
  }
  function mfaFaireConfiance(email){
    if(!email)return;
    const m=mfaGetTrustMap();
    m[email.toLowerCase()]={expiresAt:Date.now()+TRUST_DUREE};
    try{localStorage.setItem(TRUST_KEY,JSON.stringify(m));}catch(e){}
  }
  window.VB_mfaOublierAppareil=function(email){
    if(!email)return;
    const m=mfaGetTrustMap();
    delete m[email.toLowerCase()];
    try{localStorage.setItem(TRUST_KEY,JSON.stringify(m));}catch(e){}
  };
  window.VB_mfaEstDigneDeConfiance=mfaEstDigneDeConfiance;
  // "Verifie cet onglet" : sessionStorage (jamais localStorage) — survit
  // un F5 dans le meme onglet, mais disparait a la fermeture de l'onglet
  // ou dans un autre navigateur. Complementaire de la confiance 30 jours :
  // meme sans avoir coche "se souvenir de moi", un simple rafraichissement
  // pendant la meme visite ne doit jamais redemander le code.
  const TAB_KEY='vipbetcote.mfa_verified_tab';
  function mfaVerifieCetOnglet(email){
    try{return sessionStorage.getItem(TAB_KEY)===((email||'').toLowerCase());}catch(e){return false;}
  }
  function mfaMarquerOngletVerifie(email){
    if(!email)return;
    try{sessionStorage.setItem(TAB_KEY,email.toLowerCase());}catch(e){}
  }
  window.VB_mfaVerifiedThisTab=mfaVerifieCetOnglet;

  /* ---- Codes de secours : jamais stockes en clair — seul un hachage
     SHA-256 est ecrit en base. Le code en clair n'existe qu'un instant,
     le temps de l'afficher/telecharger, jamais conserve ensuite. */
  function genererUnCode(){
    const bytes=new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const hex=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('').toUpperCase();
    return hex.slice(0,4)+'-'+hex.slice(4,8);
  }
  async function hacherCode(code){
    const norm=code.toUpperCase().replace(/[^0-9A-F]/g,'');
    const enc=new TextEncoder().encode(norm);
    const buf=await crypto.subtle.digest('SHA-256',enc);
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }
  async function genererEtEnregistrerCodesSecours(sb,adminId){
    const codes=Array.from({length:10},genererUnCode);
    try{
      const hashes=await Promise.all(codes.map(hacherCode));
      const lignes=hashes.map(h=>({admin_id:adminId,code_hash:h,used:false}));
      await sb.from('admin_mfa_backup_codes').insert(lignes);
    }catch(e){}
    return codes;
  }
  function afficherCodesSecours(codes){
    dernierCodesGeneres=codes;
    document.getElementById('mfaCodesList').innerHTML=
      codes.map(c=>'<span>'+c+'</span>').join('');
    showOverlay('codes');
  }
  document.getElementById('mfaCodesDownload').addEventListener('click',()=>{
    if(!dernierCodesGeneres)return;
    const contenu='VipBetcote — codes de secours 2FA\n'+
      'Genere le '+new Date().toLocaleString('fr-FR')+'\n'+
      'Chaque code n\'est utilisable qu\'une seule fois.\n\n'+
      dernierCodesGeneres.join('\n')+'\n';
    const blob=new Blob([contenu],{type:'text/plain'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download='vipbetcote-codes-secours.txt';
    document.body.appendChild(a);a.click();a.remove();
    URL.revokeObjectURL(url);
  });
  document.getElementById('mfaCodesContinue').addEventListener('click',()=>{
    hideOverlay();
    if(onSuccessCourant)onSuccessCourant();
  });

  function brancherOtp(inputs,errBox){
    inputs.forEach((inp,i)=>{
      inp.addEventListener('input',()=>{
        inp.value=inp.value.replace(/\D/g,'').slice(0,1);
        errBox.style.display='none';
        // Animation "pop" (02/09), meme principe que wizOtp — appliquee
        // ici aux deux ecrans 2FA admin (activation + connexion), qui
        // partagent cette meme fonction brancherOtp.
        if(inp.value){
          inp.classList.remove('otp-pop');
          void inp.offsetWidth;
          inp.classList.add('otp-pop');
        }
        if(inp.value&&i<inputs.length-1)inputs[i+1].focus();
      });
      inp.addEventListener('keydown',ev=>{
        if(ev.key==='Backspace'&&!inp.value&&i>0)inputs[i-1].focus();
      });
      inp.addEventListener('paste',ev=>{
        const dd=(ev.clipboardData||window.clipboardData).getData('text').replace(/\D/g,'');
        if(!dd)return;
        ev.preventDefault();
        dd.split('').slice(0,6).forEach((c,k)=>{if(inputs[k])inputs[k].value=c});
        inputs[Math.min(dd.length,5)].focus();
      });
    });
  }
  brancherOtp(enrollOtp,enrollErr);
  brancherOtp(challengeOtp,challengeErr);

  document.getElementById('mfaSecretCopy').addEventListener('click',async function(){
    const texte=document.getElementById('mfaSecret').textContent||'';
    if(!texte)return;
    const original=this.textContent;
    try{
      await navigator.clipboard.writeText(texte);
      this.textContent=t('mfa_copied');
    }catch(e){
      // Repli si l'API Clipboard est indisponible : selection manuelle
      // du texte exact, sans espace ni caractere invisible en trop.
      const range=document.createRange();
      range.selectNodeContents(document.getElementById('mfaSecret'));
      const sel=window.getSelection();
      sel.removeAllRanges();sel.addRange(range);
      try{document.execCommand('copy');this.textContent=t('mfa_copied');}catch(e2){}
      sel.removeAllRanges();
    }
    setTimeout(()=>{this.textContent=original;},1800);
  });

  function showOverlay(stage,detail){
    overlay.hidden=false;
    stageEnroll.hidden=(stage!=='enroll');
    stageChallenge.hidden=(stage!=='challenge');
    stageBackup.hidden=(stage!=='backup');
    stageCodes.hidden=(stage!=='codes');
    stageError.hidden=(stage!=='error');
    if(stage==='error'){
      errorDetail.textContent=detail?(t('mfa_error_p')+' — '+String(detail).slice(0,160)):t('mfa_error_p');
      return;
    }
    if(stage==='backup'){
      document.getElementById('mfaBackupInput').value='';
      backupErr.style.display='none';
      return;
    }
    if(stage==='codes')return;   // deja rempli par afficherCodesSecours
    const inputs=stage==='enroll'?enrollOtp:challengeOtp;
    inputs.forEach(i=>i.value='');
    (stage==='enroll'?enrollErr:challengeErr).style.display='none';
    if(window.innerWidth>860)inputs[0].focus({preventScroll:true});
  }
  function hideOverlay(){overlay.hidden=true;}

  /* Point d'entree unique : appelee juste apres qu'un mot de passe admin
     a ete valide, AVANT d'ouvrir le tableau de bord. onSuccess n'est
     appelee QUE si le 2FA est reellement en regle — en cas d'echec
     technique, on affiche une erreur bloquante avec "Reessayer" plutot
     que de laisser passer en silence. Le 2FA admin est obligatoire, pas
     "obligatoire sauf en cas d'erreur reseau". Un appareil "de confiance"
     (la case "Se souvenir de moi" de la page de connexion, cochee lors
     d'une precedente verification reussie, toujours valide) saute la
     demande de code — mais jamais l'inscription obligatoire si le 2FA
     n'a encore jamais ete active du tout. */
  window.VB_handleAdminMFA=async function(onSuccess,email,adminId,seSouvenir){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb){onSuccess();return;}   // ne devrait pas arriver : la connexion elle-meme aurait deja echoue
    onSuccessCourant=onSuccess;
    emailCourant=email||null;
    adminIdCourant=adminId||null;
    seSouvenirCourant=!!seSouvenir;
    try{
      const {data:aal}=await sb.auth.mfa.getAuthenticatorAssuranceLevel();
      if(aal&&aal.nextLevel==='aal2'&&aal.currentLevel!=='aal2'){
        // Un facteur verifie existe : la personne a deja active le 2FA
        // elle-meme depuis Parametres. Si cet appareil est deja reconnu
        // (et toujours valide), on ne redemande rien.
        if(mfaEstDigneDeConfiance(emailCourant)){onSuccess();return;}
        await ouvrirChallenge(sb);
        return;
      }
      // Aucun facteur verifie : le 2FA n'est PAS force a la premiere
      // connexion. Il ne se propose que depuis Parametres, en option,
      // jamais impose ici.
      onSuccess();
    }catch(e){
      // Une erreur de lecture du niveau MFA ne doit jamais bloquer un
      // acces qui, par defaut, n'exige rien de plus que le mot de passe.
      onSuccess();
    }
  };

  async function ouvrirInscription(sb){
    try{
      // Nettoyer tout facteur laisse "unverified" par une tentative
      // precedente abandonnee — au mieux (chaque echec est tolere, pas
      // bloquant, puisque le nom unique ci-dessous protege de toute
      // maniere contre la collision).
      const {data:factors}=await sb.auth.mfa.listFactors();
      const abandonnes=((factors&&factors.totp)||[]).filter(f=>f.status==='unverified');
      for(const f of abandonnes){
        try{await sb.auth.mfa.unenroll({factorId:f.id});}catch(e){}
      }
      // Nom unique a chaque tentative : ca evite pour de bon l'erreur
      // "factor with this friendly name already exists", meme si un
      // ancien facteur n'a pas pu etre nettoye pour une raison ou une
      // autre — plus jamais bloquant a cause d'un nom en double.
      const {data,error}=await sb.auth.mfa.enroll({
        factorType:'totp',
        friendlyName:'admin-'+Date.now()
      });
      if(error||!data){showOverlay('error',error&&error.message);return;}
      factorIdCourant=data.id;
      const qrBox=document.getElementById('mfaQr');
      qrBox.innerHTML='';
      const qrSrc=(data.totp&&data.totp.qr_code)||'';
      if(qrSrc){
        const img=document.createElement('img');
        img.src=qrSrc;
        img.alt='QR code 2FA';
        img.style.width='100%';
        img.style.height='100%';
        img.style.objectFit='contain';
        qrBox.appendChild(img);
      }
      document.getElementById('mfaSecret').textContent=(data.totp&&data.totp.secret)||'';
      showOverlay('enroll');
    }catch(e){showOverlay('error',e&&e.message);}
  }
  /* Point d'entree utilise par Parametres (Admin) : le 2FA est desormais
     TOUJOURS une decision volontaire, jamais imposee a la connexion.
     onDone est appelee une fois l'inscription reussie (pas liee a
     l'ouverture du tableau de bord, contrairement a onSuccessCourant
     utilisee par le flux de connexion). */
  window.VB_startMfaEnrollment=function(onDone,adminId){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    onSuccessCourant=onDone;
    adminIdCourant=adminId||adminIdCourant;
    ouvrirInscription(sb);
  };
  window.VB_disableMfa=async function(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return {ok:false};
    try{
      const {data:factors}=await sb.auth.mfa.listFactors();
      const verifie=((factors&&factors.totp)||[]).find(f=>f.status==='verified');
      if(!verifie)return {ok:true};   // deja desactive
      const {error}=await sb.auth.mfa.unenroll({factorId:verifie.id});
      if(error)return {ok:false, erreur:error.message};
      return {ok:true};
    }catch(e){
      return {ok:false, erreur:e.message};
    }
  };
  window.VB_mfaStatus=async function(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return {actif:false};
    try{
      const {data:factors}=await sb.auth.mfa.listFactors();
      return {actif:((factors&&factors.totp)||[]).some(f=>f.status==='verified')};
    }catch(e){return {actif:false};}
  };

  async function ouvrirChallenge(sb){
    try{
      const {data:factors}=await sb.auth.mfa.listFactors();
      const verifie=((factors&&factors.totp)||[]).find(f=>f.status==='verified');
      if(!verifie){showOverlay('error',t('mfa_error_nofactor'));return;}
      factorIdCourant=verifie.id;
      const {data:ch,error}=await sb.auth.mfa.challenge({factorId:factorIdCourant});
      if(error||!ch){showOverlay('error',error&&error.message);return;}
      challengeIdCourant=ch.id;
      showOverlay('challenge');
    }catch(e){showOverlay('error',e&&e.message);}
  }

  document.getElementById('mfaRetry').addEventListener('click',async()=>{
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!onSuccessCourant)return;
    if(window.VB_handleAdminMFA)await window.VB_handleAdminMFA(onSuccessCourant,emailCourant,adminIdCourant,seSouvenirCourant);
  });

  /* Bouton retour de l'etape 'enroll' : jusqu'ici seule etape sans aucun
     moyen d'annuler. Nettoie le facteur TOTP 'unverified' que
     ouvrirInscription vient de creer (best-effort, jamais bloquant —
     le nettoyage automatique au prochain essai s'en chargerait de toute
     facon), puis referme l'overlay SANS appeler onSuccessCourant : ce
     n'est pas une activation reussie, la personne peut reessayer plus
     tard depuis Parametres. */
  document.getElementById('mfaEnrollBack').addEventListener('click',async()=>{
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(sb&&factorIdCourant){
      try{await sb.auth.mfa.unenroll({factorId:factorIdCourant});}catch(e){}
    }
    factorIdCourant=null;
    hideOverlay();
  });

  document.getElementById('mfaEnrollSubmit').addEventListener('click',async()=>{
    // Animation en cascade au clic (02/09), meme principe que wizOtp.
    enrollOtp.forEach((inp,i)=>{
      setTimeout(()=>{
        inp.classList.remove('otp-pop');
        void inp.offsetWidth;
        inp.classList.add('otp-pop');
      },i*45);
    });
    const code=enrollOtp.map(i=>i.value.trim()).join('');
    if(code.length!==6){enrollErr.textContent=t('mfa_err_code');enrollErr.style.display='block';return;}
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!factorIdCourant)return;
    try{
      const {data:ch,error:chErr}=await sb.auth.mfa.challenge({factorId:factorIdCourant});
      if(chErr){enrollErr.textContent=t('mfa_err_code')+(chErr.message?(' — '+chErr.message):'');enrollErr.style.display='block';return;}
      const {error:vErr}=await sb.auth.mfa.verify({factorId:factorIdCourant,challengeId:ch.id,code});
      if(vErr){enrollErr.textContent=t('mfa_err_code')+(vErr.message?(' — '+vErr.message):'');enrollErr.style.display='block';return;}
      if(seSouvenirCourant)mfaFaireConfiance(emailCourant);
      mfaMarquerOngletVerifie(emailCourant);
      // Premiere activation : on genere les codes de secours et on les
      // montre UNE FOIS avant de continuer — c'est la seule occasion de
      // les voir en clair.
      if(adminIdCourant){
        const codes=await genererEtEnregistrerCodesSecours(sb,adminIdCourant);
        afficherCodesSecours(codes);
        return;   // mfaCodesContinue termine le parcours (voir plus haut)
      }
      hideOverlay();
      if(onSuccessCourant)onSuccessCourant();
    }catch(e){
      enrollErr.textContent=t('mfa_err_code')+(e&&e.message?(' — '+e.message):'');enrollErr.style.display='block';
    }
  });

  document.getElementById('mfaChallengeSubmit').addEventListener('click',async()=>{
    // Animation en cascade au clic (02/09), meme principe que wizOtp.
    challengeOtp.forEach((inp,i)=>{
      setTimeout(()=>{
        inp.classList.remove('otp-pop');
        void inp.offsetWidth;
        inp.classList.add('otp-pop');
      },i*45);
    });
    const code=challengeOtp.map(i=>i.value.trim()).join('');
    if(code.length!==6){challengeErr.textContent=t('mfa_err_code');challengeErr.style.display='block';return;}
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!factorIdCourant||!challengeIdCourant)return;
    try{
      const {error}=await sb.auth.mfa.verify({factorId:factorIdCourant,challengeId:challengeIdCourant,code});
      if(error){challengeErr.textContent=t('mfa_err_code')+(error.message?(' — '+error.message):'');challengeErr.style.display='block';return;}
      if(seSouvenirCourant)mfaFaireConfiance(emailCourant);
      mfaMarquerOngletVerifie(emailCourant);
      hideOverlay();
      if(onSuccessCourant)onSuccessCourant();
    }catch(e){
      challengeErr.textContent=t('mfa_err_code')+(e&&e.message?(' — '+e.message):'');challengeErr.style.display='block';
    }
  });

  /* ---- Chemin alternatif : code de secours, si le telephone est perdu ---- */
  document.getElementById('mfaUseBackup').addEventListener('click',()=>{showOverlay('backup');});
  document.getElementById('mfaBackToChallenge').addEventListener('click',()=>{showOverlay('challenge');});
  document.getElementById('mfaBackupSubmit').addEventListener('click',async function(){
    const saisi=document.getElementById('mfaBackupInput').value.trim();
    if(!saisi){backupErr.textContent=t('mfa_err_code');backupErr.style.display='block';return;}
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb||!adminIdCourant)return;
    this.disabled=true;
    try{
      const hash=await hacherCode(saisi);
      const {data:rows}=await sb.from('admin_mfa_backup_codes')
        .select('id').eq('admin_id',adminIdCourant).eq('code_hash',hash).eq('used',false).limit(1);
      if(!rows||!rows.length){
        backupErr.textContent=t('mfa_backup_err');backupErr.style.display='block';
        this.disabled=false;return;
      }
      // Usage unique : jamais reutilisable, meme s'il n'est pas expire.
      await sb.from('admin_mfa_backup_codes').update({used:true}).eq('id',rows[0].id);
      mfaMarquerOngletVerifie(emailCourant);
      hideOverlay();
      if(onSuccessCourant)onSuccessCourant();
    }catch(e){
      backupErr.textContent=t('mfa_err_code')+(e&&e.message?(' — '+e.message):'');backupErr.style.display='block';
      this.disabled=false;
    }
  });
})();

/* ---------- Notification (toast) ---------- */
(function(){
  const box=document.getElementById('vbToast');
  if(!box)return;
  let timer=null;
  function hide(){box.classList.remove('on');timer=null;}
  document.getElementById('vbToastX').addEventListener('click',hide);
  window.VB_toast=function(titleKey,bodyText){
    const d=translations[currentLang]||translations.fr;
    document.getElementById('vbToastH').textContent=d[titleKey]||translations.fr[titleKey]||'';
    document.getElementById('vbToastP').textContent=bodyText||'';
    box.hidden=false;
    requestAnimationFrame(()=>box.classList.add('on'));
    if(timer)clearTimeout(timer);
    timer=setTimeout(hide,6000);
  };
})();

/* ---------- Pages legales (meme systeme que la FAQ) ---------- */
(function(){
  const page=document.getElementById('legalpage');
  if(!page)return;
  let opener=null,current=null;
  const DOCS={
    cgu:   {tag:'legal_tag_cgu',   title:'foot_cgu',      body:'legal_cgu_body'},
    confid:{tag:'legal_tag_confid',title:'foot_confid',   body:'legal_confid_body'},
    jeu:   {tag:'legal_tag_jeu',   title:'foot_jeu_resp', body:'legal_jeu_body'}
  };
  const tr=k=>{const d=translations[currentLang]||translations.fr;return d[k]!=null?d[k]:(translations.fr[k]||'');};

  function paint(){
    if(!current)return;
    const doc=DOCS[current];
    document.getElementById('legalTag').textContent=tr(doc.tag);
    document.getElementById('legalTitle').innerHTML=tr(doc.title);
    document.getElementById('legalBody').innerHTML=tr(doc.body);
    document.getElementById('legalUpdated').textContent=tr('legal_updated');
  }
  function openLegal(key,from){
    if(!DOCS[key])return;
    current=key;opener=from||null;
    paint();
    page.classList.add('open');
    page.scrollTop=0;
    document.body.style.overflow='hidden';
    const c=document.getElementById('legalpageClose');
    if(c)c.focus();
  }
  function closeLegal(){
    page.classList.remove('open');
    document.body.style.overflow='';
    if(opener){opener.focus();opener=null;}
  }
  document.querySelectorAll('[data-legal-open]').forEach(a=>{
    a.addEventListener('click',ev=>{
      ev.preventDefault();ev.stopPropagation();
      if(mnav.classList.contains('on'))closeMenu();
      openLegal(a.dataset.legalOpen,a);
    });
  });
  document.getElementById('legalpageClose').addEventListener('click',closeLegal);
  document.getElementById('legalpageBack').addEventListener('click',closeLegal);
  document.addEventListener('keydown',ev=>{
    if(ev.key==='Escape'&&page.classList.contains('open'))closeLegal();
  });
  document.addEventListener('vb:langchange',paint);
})();

/* ---------- Reseaux sociaux : ouverture via data-url ---------- */
(function(){
  document.querySelectorAll('.soc-link[data-url]').forEach(a=>{
    a.addEventListener('click',ev=>{
      const url=a.dataset.url;
      if(!url)return;
      ev.preventDefault();
      const w=window.open(url,'_blank','noopener,noreferrer');
      if(w)w.opener=null; else location.href=url; // repli si la fenetre est bloquee
    });
  });
})();

/* ---------- Statistiques de la page d'accueil ----------
   CORRIGÉ (session diagnostic, 03/09) : l'ancienne version calculait ces
   chiffres en direct (count sur profiles + tickets), mais un visiteur non
   connecte n'a jamais eu le droit de lire profiles (RLS "visible par
   proprietaire ou admin") — le count retombait silencieusement a 0,
   jamais une erreur, jamais rattrape. REMPLACE (demande explicite de
   James) par une lecture de la table landing_stats, modifiable par
   l'admin depuis le Dashboard (voir renderLandingStatsAdmin plus bas) —
   plus aucun calcul automatique, la valeur affichee est TOUJOURS celle
   choisie par l'admin, synchronisee partout des qu'il l'enregistre. */
(function(){
  const elUsers=document.getElementById('statUsers');
  const elWon=document.getElementById('statWon');
  const elRate=document.getElementById('statRate');
  const elTrust=document.getElementById('statTrustpilot');
  if(!elUsers&&!elWon&&!elRate&&!elTrust)return;

  /* Ecrase directement le texte affiche, meme si l'animation au scroll a
     deja tourne ou est en cours avec l'ancienne valeur par defaut du HTML
     — jamais un chiffre errone laisse a l'ecran en attendant un futur
     passage dans le viewport. */
  function peindre(row){
    if(!row)return;
    if(elUsers){
      const suffixe=row.active_users_suffix||'';
      elUsers.dataset.count=String(row.active_users);
      elUsers.dataset.base=String(row.active_users);
      elUsers.dataset.suffix=suffixe;
      elUsers.textContent=Number(row.active_users).toLocaleString('en-US')+suffixe;
    }
    if(elWon){
      elWon.dataset.count=String(row.successful_tickets);
      elWon.dataset.base=String(row.successful_tickets);
      elWon.textContent=String(row.successful_tickets);
    }
    if(elRate){
      elRate.dataset.count=String(row.win_rate_pct);
      elRate.dataset.base=String(row.win_rate_pct);
      elRate.textContent=row.win_rate_pct+'%';
    }
    if(elTrust){
      const n=Number(row.trustpilot_rating);
      elTrust.textContent=isFinite(n)?n.toFixed(1):String(row.trustpilot_rating);
    }
  }

  async function chargerLandingStats(){
    const sb=window.VB_getSupabase&&window.VB_getSupabase();
    if(!sb)return;
    try{
      const {data,error}=await sb.from('landing_stats')
        .select('active_users,active_users_suffix,successful_tickets,win_rate_pct,trustpilot_rating')
        .eq('id',1).single();
      // Jamais de "0" affiche en cas de panne : les valeurs de demo deja
      // integrees au HTML (identiques aux valeurs par defaut de la table)
      // restent affichees telles quelles tant que la lecture echoue.
      if(error||!data)return;
      peindre(data);
    }catch(e){}
  }
  chargerLandingStats();
  window.addEventListener('load',chargerLandingStats);
  window.VB_chargerLandingStats=chargerLandingStats;   // rejouable a la demande (admin, apres enregistrement)

  /* Synchronisation EN DIRECT : Realtime (immediat) + polling 20s de
     secours (meme principe que demarrerSyncPlansWizard) — si l'admin
     modifie un chiffre pendant qu'un visiteur a deja la page d'accueil
     ouverte, ca se met a jour sans qu'il ait besoin de recharger. */
  const sbRt=window.VB_getSupabase&&window.VB_getSupabase();
  if(sbRt&&sbRt.channel){
    try{
      sbRt.channel('landing-stats-'+Date.now())
        .on('postgres_changes',{event:'UPDATE',schema:'public',table:'landing_stats'},()=>{
          chargerLandingStats();
        })
        .subscribe();
    }catch(e){}
  }
  setInterval(chargerLandingStats,20000);
})();

/* ---------- Compteur d'utilisateurs actifs (bonus visuel local) ----------
   Ajoute UNIQUEMENT +1 dans CE navigateur au moment d'une inscription
   reussie dans CET onglet — jamais la source de verite (qui reste
   landing_stats.active_users, modifiable par l'admin). Purement
   cosmetique : donne l'impression au nouvel inscrit que son inscription
   vient d'etre comptee, sans jamais modifier ce que voient les autres
   visiteurs. */
(function(){
  const el=document.getElementById('statUsers');
  if(!el)return;
  window.VB_countSignup=function(){
    const actuel=parseInt(el.dataset.count,10)||parseInt(el.dataset.base,10)||0;
    const suffixe=el.dataset.suffix||'';
    const total=actuel+1;
    el.dataset.count=String(total);
    el.textContent=total.toLocaleString('en-US')+suffixe;
    el.style.transition='transform .35s cubic-bezier(.34,1.56,.64,1)';
    el.style.transform='scale(1.14)';
    setTimeout(()=>{el.style.transform='';},360);
  };
})();

/* ---------- Routage simple : hero par defaut, sauf lien direct connu ----------
   Le site reste une page unique (pas de vrai routage serveur) : par
   defaut, ouvrir le site atterrit toujours en haut (comportement naturel
   du navigateur). Les chemins ci-dessous sont l'EXCEPTION explicite —
   necessitent une redirection Netlify vers index.html pour ne pas
   renvoyer une 404 (voir netlify.toml). */
(function(){
  const ROUTES={
    '/plan':'abonnements', '/plans':'abonnements', '/abonnements':'abonnements',
    '/faq':'faqpage'
  };
  const chemin=(window.location.pathname||'/').replace(/\/$/,'')||'/';
  const cible=ROUTES[chemin];
  if(cible){
    const el=document.getElementById(cible);
    if(el){
      requestAnimationFrame(()=>el.scrollIntoView({behavior:'auto',block:'start'}));
    }
  }
  // Aucune entree correspondante : comportement par defaut du navigateur
  // (sommet de la page, c'est-a-dire le hero) — rien a faire de plus.
})();

/* ---------- Restauration de session au chargement ----------
   Sans ca, tout rafraichissement (F5) renvoie n'importe qui vers la
   page d'accueil, meme deja connecte — obligeant a tout recommencer a
   chaque fois. Ici, on verifie s'il existe une VRAIE session Supabase
   valide (jamais une simple presence de donnees locales, qui pourrait
   etre perimee ou fabriquee) avant de restaurer quoi que ce soit.
   Reessayable : le script Supabase (CDN, differe) peut ne pas encore
   etre pret au tout premier appel — meme filet de securite que celui
   deja utilise pour le client Supabase lui-meme. */
/* ---------- Surveillance en direct de la suspension ----------
   Sans ca, un onglet deja ouvert au moment ou l'admin suspend le compte
   resterait actif jusqu'au prochain F5 — c'est le bug corrige ici. Deux
   mecanismes complementaires :
     - Realtime Supabase : ecoute en direct les changements sur SA
        PROPRE ligne profiles (protege par la RLS existante — personne
        ne peut ecouter la ligne d'un autre). Des que suspended_at
        change, deconnexion immediate, sans attendre quoi que ce soit.
     - Sondage de secours toutes les 60s : si jamais la connexion
        Realtime tombe (reseau instable, veille mobile...), le compte
        est quand meme repere suspendu au plus tard 1 minute apres,
        jamais indefiniment. */
let vbSuspensionChannel=null, vbSuspensionPoll=null;
let vbEstSuspendu=false, vbMotifSuspension='';
window.VB_estSuspendu=()=>vbEstSuspendu;
window.VB_suspensionMotif=()=>vbMotifSuspension;
function vbArreterSurveillanceSuspension(){
  if(vbSuspensionChannel){
    try{const sb=window.VB_getSupabase&&window.VB_getSupabase();if(sb)sb.removeChannel(vbSuspensionChannel);}catch(e){}
    vbSuspensionChannel=null;
  }
  if(vbSuspensionPoll){clearInterval(vbSuspensionPoll);vbSuspensionPoll=null;}
}
async function vbDeconnexionPourSuspension(reason){
  // Verrou IMMEDIAT, synchrone, avant tout appel reseau : le dashboard
  // (s'il est ouvert) doit refleter la suspension a l'instant, sans
  // attendre la fin de la deconnexion Supabase ni un refresh. C'est ce
  // qui masque les cotes deja chargees en memoire et fait apparaitre la
  // banniere avec le motif reel dans "Mon Abonnement" avant meme que la
  // navigation vers l'accueil ne se produise.
  vbEstSuspendu=true;
  vbMotifSuspension=reason||'';
  if(window.VB_renderAll)try{window.VB_renderAll();}catch(e){}
  vbArreterSurveillanceSuspension();
  const sb=window.VB_getSupabase&&window.VB_getSupabase();
  try{if(sb)await sb.auth.signOut();}catch(e){}
  if(window.VB_toast)window.VB_toast('auth_suspended_h', reason?t('auth_suspended_reason_p').replace('{reason}',reason):t('auth_suspended_p'));
  try{window.location.href='/';}catch(e){}
}
function vbDemarrerSurveillanceSuspension(userId){
  vbArreterSurveillanceSuspension();
  const sb=window.VB_getSupabase&&window.VB_getSupabase();
  if(!sb||!userId)return;
  try{
    vbSuspensionChannel=sb.channel('profile-suspension-'+userId)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'profiles',filter:'id=eq.'+userId},payload=>{
        const nv=payload&&payload.new;
        if(nv&&nv.suspended_at)vbDeconnexionPourSuspension(nv.suspended_reason);
      })
      .subscribe();
  }catch(e){}
  vbSuspensionPoll=setInterval(async()=>{
    try{
      const {data:prof}=await sb.from('profiles').select('suspended_at,suspended_reason').eq('id',userId).single();
      if(prof&&prof.suspended_at)vbDeconnexionPourSuspension(prof.suspended_reason);
    }catch(e){}
  },60000);
}
window.VB_demarrerSurveillanceSuspension=vbDemarrerSurveillanceSuspension;

let dejaRestaure=false;
async function tenterRestaurationSession(){
  if(dejaRestaure)return;   // jamais deux fois : la 2e tentative ne fait rien si la 1re a reussi
  const sb=window.VB_getSupabase&&window.VB_getSupabase();
  if(!sb)return;
  try{
    const {data:sessionData}=await sb.auth.getSession();
    const session=sessionData&&sessionData.session;
    if(!session||!session.user)return;   // pas de session valide : page d'accueil normale
    dejaRestaure=true;
    const emailSession=(session.user.email||'').trim().toLowerCase();

    let profil=null;
    try{
      const {data:prof}=await sb.from('profiles')
        .select('role,suspended_at,suspended_reason').eq('id',session.user.id).single();
      profil=prof;
    }catch(e){}
    if(profil&&profil.suspended_at){
      // Compte suspendu : aucune session active n'est jamais gardee,
      // meme retrouvee au chargement.
      try{await sb.auth.signOut();}catch(e){}
      if(window.VB_toast)window.VB_toast('auth_suspended_h', profil.suspended_reason?t('auth_suspended_reason_p').replace('{reason}',profil.suspended_reason):t('auth_suspended_p'));
      return;
    }
    if(window.VB_demarrerSurveillanceSuspension)window.VB_demarrerSurveillanceSuspension(session.user.id);

    if(profil&&profil.role==='admin'){
      // Un simple F5 pendant la meme visite ne redemande jamais le 2FA
      // (marque "verifie cet onglet"), ni si l'appareil est retenu
      // ("se souvenir de moi", 30 jours) — sinon le code est redemande,
      // jamais un contournement silencieux.
      const dejaOk=(window.VB_mfaVerifiedThisTab&&window.VB_mfaVerifiedThisTab(emailSession))
                 ||(window.VB_mfaEstDigneDeConfiance&&window.VB_mfaEstDigneDeConfiance(emailSession));
      if(dejaOk){
        if(window.VB_openAdminDash)window.VB_openAdminDash(session.user);
      }else if(window.VB_handleAdminMFA){
        window.VB_handleAdminMFA(()=>{
          if(window.VB_openAdminDash)window.VB_openAdminDash(session.user);
        },session.user.email,session.user.id,false);
      }
      return;
    }

    // Utilisateur normal : on ne restaure QUE si l'etat local correspond
    // bien a CETTE session precise (meme email) — jamais les donnees
    // d'un autre compte qui seraient restees en cache localement, et
    // jamais sans un parcours reellement termine (voir VB_dashboardReady).
    if(window.VB_dashboardReady&&window.VB_dashboardReady()){
      const st=window.VB_getState&&window.VB_getState();
      const emailLocal=(st&&st.email||'').trim().toLowerCase();
      if(emailLocal&&emailLocal===emailSession&&window.VB_openDash){
        window.VB_openDash();
      }
    }else if(window.VB_reprendreApresAdmin){
      /* CORRECTIF : quelqu'un dont l'inscription est terminee mais qui n'a
         jamais eu de plan localement (paid=false) ne remplissait jamais
         cette condition — meme si un admin venait de lui activer un plan
         directement. Sur un simple rafraichissement (pas une nouvelle
         connexion via le formulaire), cette personne restait bloquee sur
         la page d'accueil au lieu d'entrer automatiquement dans son
         Dashboard fraichement debloque. On verifie ici directement aupres
         de Supabase, une seule fois, sans bloquer le reste du chargement. */
      window.VB_reprendreApresAdmin(session.user);
    }
  }catch(e){ /* toute erreur degrade simplement vers la page d'accueil normale */ }
}
tenterRestaurationSession();
window.addEventListener('load',tenterRestaurationSession);
window.VB_tenterRestaurationSession=tenterRestaurationSession;

/* ---------- Retour depuis la page de paiement Stripe ----------
   Stripe peut renvoyer la personne sur le site apres un paiement reussi
   (adresse de redirection configuree dans chaque Payment Link :
   https://vipbetcote.com/?paiement=ok).
   ATTENTION : ce bloc ne valide RIEN. Un parametre dans l'adresse est
   fabricable par n'importe qui — il ne prouve aucun paiement et ne doit
   jamais activer quoi que ce soit. Seul le webhook signe par Stripe,
   verifie cote serveur, fait foi. Ce bloc sert uniquement a relire
   l'etat REEL en base pendant les quelques secondes ou le webhook
   ecrit l'abonnement, au lieu de laisser la personne devant une page
   d'accueil muette. */
(function(){
  let params;
  try{params=new URLSearchParams(window.location.search);}catch(e){return;}
  if(params.get('paiement')!=='ok')return;
  // Adresse nettoyee immediatement : un rafraichissement ou un lien
  // partage ne doit jamais rejouer ce message.
  try{history.replaceState(null,'',window.location.pathname+window.location.hash);}catch(e){}
  setTimeout(()=>{ if(window.VB_toast)window.VB_toast('stripe_back_h',t('stripe_back_p')); },700);
  let essais=0;
  const timer=setInterval(async()=>{
    const st=window.VB_getState&&window.VB_getState();
    if(st&&st.paid&&st.planId){
      clearInterval(timer);
      if(window.VB_renderAll)try{window.VB_renderAll();}catch(e){}
      return;
    }
    if(++essais>10){clearInterval(timer);return;}   // 40s au maximum, jamais de boucle infinie
    try{
      if(window.VB_syncPayStatus){
        const change=await window.VB_syncPayStatus();
        if(change&&window.VB_renderAll)window.VB_renderAll();
      }
      const sb=window.VB_getSupabase&&window.VB_getSupabase();
      if(sb&&window.VB_reprendreApresAdmin){
        const {data:sd}=await sb.auth.getSession();
        if(sd&&sd.session&&sd.session.user)await window.VB_reprendreApresAdmin(sd.session.user);
      }
    }catch(e){}
  },4000);
})();

