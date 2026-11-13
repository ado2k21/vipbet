-- 09/11 : AVIS DES ABONNES (« Mwen te jwe l » + preuve de gain), valides par l'admin.
-- Uniquement des AJOUTS : aucune table, politique ou fonction existante n'est modifiee.

-- 1) « J'ai joue cette fiche » : une ligne par abonne et par fiche.
create table if not exists public.fiche_joues (
  user_id    uuid not null references auth.users(id) on delete cascade,
  ticket_id  uuid not null references public.tickets(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, ticket_id)
);
alter table public.fiche_joues enable row level security;
revoke all on public.fiche_joues from anon, authenticated;
grant select, insert, delete on public.fiche_joues to authenticated;
drop policy if exists "fiche_joues : les siennes" on public.fiche_joues;
create policy "fiche_joues : les siennes" on public.fiche_joues
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "fiche_joues : ajouter sur une fiche gagnee" on public.fiche_joues;
create policy "fiche_joues : ajouter sur une fiche gagnee" on public.fiche_joues
  for insert with check (auth.uid() = user_id and exists (
    select 1 from public.tickets t where t.id = ticket_id and t.published and t.status = 'won'));
drop policy if exists "fiche_joues : retirer la sienne" on public.fiche_joues;
create policy "fiche_joues : retirer la sienne" on public.fiche_joues
  for delete using (auth.uid() = user_id);

-- 2) Avis (preuve de gain) : la fiche est OPTIONNELLE (fenetre fixe de l'Istorik) ; si elle est donnee,
--    un seul avis par abonne et par fiche (gagnee ou perdue). Publie seulement par l'admin.
create table if not exists public.avis_abonnes (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  ticket_id           uuid references public.tickets(id) on delete set null,   -- optionnelle
  etoiles             smallint not null check (etoiles between 1 and 5),
  note                text not null default '' check (char_length(note) <= 140),
  capture_path        text not null,
  consentement        boolean not null check (consentement),
  plan_libelle        text,
  statut              text not null default 'attente' check (statut in ('attente', 'publie', 'refuse', 'retire')),
  created_at          timestamptz not null default now(),
  decide_at           timestamptz,
  telegram_statut     text check (telegram_statut in ('envoi', 'envoye', 'echec')),
  telegram_message_id bigint,
  telegram_at         timestamptz,
  unique (user_id, ticket_id)
);
alter table public.avis_abonnes enable row level security;
revoke all on public.avis_abonnes from anon, authenticated;
grant select, insert on public.avis_abonnes to authenticated;
grant update on public.avis_abonnes to authenticated;   -- limite a l'admin par la politique
drop policy if exists "avis : les siens ou admin" on public.avis_abonnes;
create policy "avis : les siens ou admin" on public.avis_abonnes
  for select using (auth.uid() = user_id or public.is_admin());
-- Meme principe que les Estatistik : seulement un compte qui a (ou a eu) un plan VALIDE.
drop policy if exists "avis : envoyer sur une fiche gagnee" on public.avis_abonnes;
drop policy if exists "avis : envoyer (abonne)" on public.avis_abonnes;
create policy "avis : envoyer (abonne)" on public.avis_abonnes
  for insert with check (auth.uid() = user_id and statut = 'attente' and decide_at is null
    and telegram_statut is null
    and capture_path like (auth.uid()::text || '/%')
    and exists (select 1 from public.subscriptions s where s.user_id = auth.uid() and s.status = 'active')
    and (ticket_id is null or exists (select 1 from public.tickets t
         where t.id = ticket_id and t.published and t.status in ('won', 'lost'))));
-- Anti-abus : au plus 3 avis EN ATTENTE par abonne.
create or replace function public.avis_limite_attente()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from avis_abonnes where user_id = new.user_id and statut = 'attente') >= 3 then
    raise exception 'avis_trop_en_attente' using errcode = 'P0001';
  end if;
  return new;
end $$;
revoke all on function public.avis_limite_attente() from public, anon, authenticated;
drop trigger if exists avis_limite_attente on public.avis_abonnes;
create trigger avis_limite_attente before insert on public.avis_abonnes
  for each row execute function public.avis_limite_attente();
-- Le plan affiche est TOUJOURS lu dans l'abonnement VALIDE de l'abonne (le plus eleve encore
-- en cours, sinon le dernier) : jamais la valeur envoyee par le navigateur.
create or replace function public.avis_plan_reel()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    select pl.name into new.plan_libelle
    from subscriptions s join plans pl on pl.id = s.plan_id
    where s.user_id = new.user_id and s.status = 'active'   -- jamais un abonnement 'pending' (cree par le navigateur)
    order by (s.expires_at is null or s.expires_at > now()) desc, pl.rank desc, s.starts_at desc nulls last
    limit 1;
  end if;
  return new;
end $$;
revoke all on function public.avis_plan_reel() from public, anon, authenticated;
drop trigger if exists avis_plan_reel on public.avis_abonnes;
create trigger avis_plan_reel before insert on public.avis_abonnes
  for each row execute function public.avis_plan_reel();

drop policy if exists "avis : decision admin" on public.avis_abonnes;
create policy "avis : decision admin" on public.avis_abonnes
  for update using (public.is_admin()) with check (public.is_admin());

-- 3) Lecture publique des avis PUBLIES (landing) : jamais l'identite de l'abonne.
create or replace view public.avis_publics
with (security_invoker = false) as
  select a.id, a.etoiles, a.note, a.plan_libelle, a.capture_path, a.decide_at, t.play_date
  from public.avis_abonnes a left join public.tickets t on t.id = a.ticket_id
  where a.statut = 'publie';
grant select on public.avis_publics to anon, authenticated;

-- 4) Compteurs par fiche (« 27 abonnes l'ont jouee · 6 preuves ») : chiffres seulement.
--    ids vide -> total du site (fenetre fixe de l'Istorik), ticket_id null.
create or replace function public.avis_compteurs(ids uuid[])
returns table (ticket_id uuid, joues bigint, preuves bigint)
language sql stable security definer set search_path to 'public' as $$
  select t.id,
         (select count(*) from public.fiche_joues j where j.ticket_id = t.id),
         (select count(*) from public.avis_abonnes a where a.ticket_id = t.id and a.statut = 'publie')
  from unnest(ids) as t(id)
  union all
  select null::uuid,
         (select count(distinct j.user_id) from public.fiche_joues j),
         (select count(*) from public.avis_abonnes a where a.statut = 'publie')
  where coalesce(array_length(ids, 1), 0) = 0;
$$;
revoke all on function public.avis_compteurs(uuid[]) from public;
grant execute on function public.avis_compteurs(uuid[]) to authenticated;

-- 5) Dossier PRIVE des captures (5 Mo, images). Chemin : {user_id}/{fichier}.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avis', 'avis', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])
on conflict (id) do nothing;
drop policy if exists "avis : deposer sa capture" on storage.objects;
create policy "avis : deposer sa capture" on storage.objects
  for insert to authenticated with check (bucket_id = 'avis' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "avis : voir sa capture, admin, ou capture publiee" on storage.objects;
create policy "avis : voir sa capture, admin, ou capture publiee" on storage.objects
  for select using (bucket_id = 'avis' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
    or exists (select 1 from public.avis_abonnes a where a.capture_path = name and a.statut = 'publie')));
