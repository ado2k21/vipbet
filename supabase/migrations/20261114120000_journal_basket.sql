-- 14/11 : JOURNAL D'APPRENTISSAGE DU BOT BASKET (accord de James, 14/11).
-- Uniquement un AJOUT : aucune table, colonne, politique ou fonction existante n'est modifiee.
--
-- Une ligne par SELECTION ENVISAGEE par le bot basket (pool du jour : choisie OU ecartee),
-- avec ce que le bot savait au moment du choix (cote, ligne, projection, segment...).
-- Le calcul des resultats (bot-settle-results) y ajoute le vrai resultat avec les scores
-- qu'il recoit deja pour le jour (aucun appel API en plus pour les matchs du jour).
-- Le bot relit ce journal pour savoir, par type de pari et tranche de cote, s'il gagne plus
-- ou moins souvent que ce qu'annonce la cote, et ajuste ses choix en consequence.
--
-- Ecrit et lu UNIQUEMENT par les fonctions serveur (cle service_role) : RLS active, aucune
-- politique, aucun droit pour anon / authenticated.
create table if not exists public.basket_journal (
  play_date            date         not null,
  game_id              bigint       not null,           -- id API-Sports (positif) ou The Odds API (negatif)
  market               text         not null,           -- mk_basket_1x2 | mk_basket_total
  pick                 text         not null,           -- « Victoire : Home », « Plus de 160.5 points »...
  league               text,
  league_country       text,
  match_label          text,
  kickoff_at           timestamptz,
  odd                  numeric(6,2) not null check (odd > 1),
  odd_autre            numeric(6,2),                    -- cote de l'autre cote du meme pari, si connue
  segment              text         not null,           -- ex. « V|1.30-1.49 », « P|1.50-1.69 », « M|1.70-1.99 »
  ligne                numeric(6,2),                    -- seuil de points (totaux)
  projection_total     integer,                         -- projection maison du total de points
  projection_confirmee boolean,
  score_fiabilite      numeric(6,4),
  facteur_segment      numeric(6,4),                    -- facteur d'apprentissage applique ce jour-la
  choisie              boolean      not null default false,
  ticket_id            uuid,
  result               text         check (result in ('won', 'lost', 'void')),
  points_home          integer,
  points_away          integer,
  settled_at           timestamptz,
  created_at           timestamptz  not null default now(),
  primary key (play_date, game_id, market, pick)
);
create index if not exists basket_journal_a_regler on public.basket_journal (play_date) where result is null;
create index if not exists basket_journal_segment on public.basket_journal (segment, play_date) where result in ('won', 'lost');

alter table public.basket_journal enable row level security;
revoke all on public.basket_journal from anon, authenticated;

-- Annulation (si besoin) : drop table public.basket_journal;
