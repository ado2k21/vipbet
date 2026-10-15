-- =====================================================================
-- Acces aux groupes Telegram VIP, pilote par la base (15/10)
--
-- Un compte avec un plan ACTIF recoit un lien d'invitation a usage unique
-- pour le groupe de SON plan. Le robot ne fait qu'executer : l'etat reel
-- (qui a droit a quel groupe) vient toujours de `subscriptions`.
--
-- Rien n'est ecrit depuis le navigateur : seules les fonctions Netlify
-- (cle service_role) ecrivent. L'utilisateur ne peut que LIRE sa ligne.
-- =====================================================================

create table if not exists public.telegram_access (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references public.profiles(id) on delete cascade,
  plan_id          text        not null references public.plans(id),
  chat_id          bigint      not null,
  invite_link      text,
  status           text        not null default 'issued'
                     check (status in ('issued','joined','revoked','expired','left')),
  telegram_user_id bigint,
  telegram_name    text,
  created_at       timestamptz not null default now(),
  expires_at       timestamptz,
  joined_at        timestamptz,
  ended_at         timestamptz,
  ended_reason     text
);

-- Un seul acces ACTIF (lien emis ou membre) par compte du site ...
create unique index if not exists telegram_access_un_actif_par_user
  on public.telegram_access (user_id) where status in ('issued','joined');
-- ... et un compte Telegram ne peut etre relie qu'a UN compte du site.
create unique index if not exists telegram_access_un_compte_telegram
  on public.telegram_access (telegram_user_id)
  where status = 'joined' and telegram_user_id is not null;
create index if not exists telegram_access_statut on public.telegram_access (status);

alter table public.telegram_access enable row level security;

drop policy if exists "telegram_access lecture de son acces" on public.telegram_access;
create policy "telegram_access lecture de son acces"
  on public.telegram_access for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "telegram_access lecture admin" on public.telegram_access;
create policy "telegram_access lecture admin"
  on public.telegram_access for select to authenticated
  using (public.is_admin());

revoke insert, update, delete on public.telegram_access from anon, authenticated;

-- Qui a droit a quel groupe : plan actif, non expire, compte non suspendu.
-- Si plusieurs abonnements actifs coexistent (ne devrait pas arriver),
-- le plan le plus eleve l'emporte.
create or replace function public.telegram_eligibles()
returns table (user_id uuid, plan_id text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (s.user_id) s.user_id, s.plan_id
  from subscriptions s
  join profiles p on p.id = s.user_id
  join plans pl on pl.id = s.plan_id
  where s.status = 'active'
    and p.suspended_at is null
    and (s.expires_at is null or s.expires_at > now())
  order by s.user_id, pl.rank desc;
$$;
revoke all on function public.telegram_eligibles() from public, anon, authenticated;
grant execute on function public.telegram_eligibles() to service_role;
