-- 15/11 (James : « avis sur le rapport du jour : rapports publiés seulement, plan actif ce jour, fais la migration »)
-- Un avis peut porter sur un RAPPORT DU JOUR (au lieu d'une fiche). Additif : aucun avis existant
-- n'est modifie ni supprime.
-- Le rapport choisi = celui du plan de l'abonne CE jour-la (rapports_jour.portee = 'p' + rang),
-- comme dans son Istorik (le site ne propose que ceux-la) ; la base exige un rapport PUBLIE.

alter table public.avis_abonnes add column if not exists rapport_date date;
alter table public.avis_abonnes add column if not exists rapport_portee text;
alter table public.avis_abonnes drop constraint if exists avis_abonnes_rapport_portee_check;
alter table public.avis_abonnes add constraint avis_abonnes_rapport_portee_check
  check (rapport_portee is null or rapport_portee in ('p1', 'p2', 'p3', 'p4'));
alter table public.avis_abonnes drop constraint if exists avis_abonnes_rapport_complet_check;
alter table public.avis_abonnes add constraint avis_abonnes_rapport_complet_check
  check ((rapport_date is null) = (rapport_portee is null));
-- Une fiche OU un rapport, jamais les deux.
alter table public.avis_abonnes drop constraint if exists avis_abonnes_fiche_ou_rapport_check;
alter table public.avis_abonnes add constraint avis_abonnes_fiche_ou_rapport_check
  check (ticket_id is null or rapport_date is null);
-- Preuve : une capture, ou une fiche, ou un rapport.
alter table public.avis_abonnes drop constraint if exists avis_abonnes_preuve_check;
alter table public.avis_abonnes add constraint avis_abonnes_preuve_check
  check (capture_path is not null or ticket_id is not null or rapport_date is not null);
-- Un seul avis par abonne et par rapport.
create unique index if not exists avis_abonnes_user_rapport_key
  on public.avis_abonnes (user_id, rapport_date) where rapport_date is not null;

-- Envoi par l'abonne : memes regles qu'avant + rapport publie (non retroactif) s'il en choisit un.
drop policy if exists "avis : envoyer (abonne)" on public.avis_abonnes;
create policy "avis : envoyer (abonne)" on public.avis_abonnes
  for insert to authenticated with check (
    auth.uid() = user_id
    and statut = 'attente' and decide_at is null and telegram_statut is null
    and (capture_path is null or capture_path like (auth.uid()::text || '/%'))
    and (capture_path is not null or ticket_id is not null or rapport_date is not null)
    and exists (select 1 from public.subscriptions s where s.user_id = auth.uid() and s.status = 'active')
    and (ticket_id is null or exists (
      select 1 from public.tickets t
      where t.id = avis_abonnes.ticket_id and t.published and t.status in ('won', 'lost')))
    and (rapport_date is null or exists (
      select 1 from public.rapports_jour r
      where r.play_date = avis_abonnes.rapport_date and r.portee = avis_abonnes.rapport_portee
        and r.publie and not r.retroactif))
  );

-- Vue publique : memes colonnes qu'avant + le rapport choisi (seulement les avis PUBLIES par l'admin).
create or replace view public.avis_publics as
  select a.id, a.etoiles, a.note, a.plan_libelle, a.capture_path, a.decide_at, t.play_date,
    t.id as ticket_id, t.sport, t.total_odd, t.status as ticket_statut,
    a.rapport_date, r.total as rapport_total, r.gagnes as rapport_gagnes, r.taux as rapport_taux, r.matchs as rapport_matchs
  from public.avis_abonnes a
  left join public.tickets t on t.id = a.ticket_id
  left join public.rapports_jour r on r.play_date = a.rapport_date and r.portee = a.rapport_portee
  where a.statut = 'publie';
grant select on public.avis_publics to anon, authenticated;
