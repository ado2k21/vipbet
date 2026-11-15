-- 15/11 (James : « valide les avis sans image ; l'abonne choisit une fiche, obligatoire »)
-- Avis SANS capture : permis seulement quand une fiche est choisie (« Mwen te jwe fich sa a »).
-- Additif : aucun avis existant n'est modifie ni supprime ; les avis avec capture restent identiques.

-- 1) La capture devient facultative, mais jamais un avis sans capture ET sans fiche.
alter table public.avis_abonnes alter column capture_path drop not null;
alter table public.avis_abonnes drop constraint if exists avis_abonnes_preuve_check;
alter table public.avis_abonnes add constraint avis_abonnes_preuve_check
  check (capture_path is not null or ticket_id is not null);   -- avis existants : tous ont une capture

-- 2) Envoi par l'abonne : memes regles qu'avant ; capture facultative si une fiche est choisie.
drop policy if exists "avis : envoyer (abonne)" on public.avis_abonnes;
create policy "avis : envoyer (abonne)" on public.avis_abonnes
  for insert to authenticated with check (
    auth.uid() = user_id
    and statut = 'attente' and decide_at is null and telegram_statut is null
    and (capture_path is null or capture_path like (auth.uid()::text || '/%'))
    and (capture_path is not null or ticket_id is not null)
    and exists (select 1 from public.subscriptions s where s.user_id = auth.uid() and s.status = 'active')
    and (ticket_id is null or exists (
      select 1 from public.tickets t
      where t.id = avis_abonnes.ticket_id and t.published and t.status in ('won', 'lost')))
  );

-- 3) Vue publique : memes colonnes qu'avant + la fiche choisie (gagnee ou perdue : un avis n'est
--    dans cette vue que si l'admin l'a PUBLIE ; fiche perdue = « 12/13 gagnes »). Colonnes ajoutees a la fin.
create or replace view public.avis_publics as
  select a.id, a.etoiles, a.note, a.plan_libelle, a.capture_path, a.decide_at, t.play_date,
    t.id as ticket_id, t.sport, t.total_odd, t.status as ticket_statut
  from public.avis_abonnes a
  left join public.tickets t on t.id = a.ticket_id
  where a.statut = 'publie';
grant select on public.avis_publics to anon, authenticated;
