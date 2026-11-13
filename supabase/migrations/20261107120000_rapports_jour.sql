-- 07/11 : RAPPORT DU JOUR (taux de reussite des pronostics publies, sans score exact).
-- Uniquement un AJOUT : aucune table, colonne, politique ou fonction existante n'est modifiee.
-- Ecrit uniquement par la fonction serveur rapport-jour (cle service_role).
create table if not exists public.rapports_jour (
  play_date           date        not null,
  portee              text        not null check (portee in ('complet', 'p1', 'p2', 'p3', 'p4')),
  total               integer     not null check (total > 0),
  gagnes              integer     not null check (gagnes >= 0 and gagnes <= total),
  taux                numeric(5,1) not null,
  publie              boolean     not null,              -- taux >= 70 %
  matchs              jsonb       not null default '[]', -- quelques pronostics gagnes (max 8)
  calcule_at          timestamptz not null default now(),
  telegram_statut     text        check (telegram_statut in ('envoi', 'envoye')),
  telegram_message_id bigint,
  telegram_at         timestamptz,
  retroactif          boolean     not null default false, -- jour passe calcule apres coup : admin SEULEMENT
  primary key (play_date, portee)
);
alter table public.rapports_jour enable row level security;
revoke all on public.rapports_jour from anon, authenticated;
grant select on public.rapports_jour to anon, authenticated;

-- Lecture : un rapport PUBLIE et non retroactif est visible (landing, historique) ;
-- l'admin voit tout (y compris < 70 % et les jours passes calcules apres coup).
-- Les rapports ne contiennent que des resultats deja regles, jamais une fiche en cours.
drop policy if exists "rapports publies visibles" on public.rapports_jour;
create policy "rapports publies visibles" on public.rapports_jour
  for select using ((publie and not retroactif) or public.is_admin());
