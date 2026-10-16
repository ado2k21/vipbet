-- ============================================================================
-- VIP BETCOTE — 16/10 : (1) provenance des inscrits (liens traces ?src=...)
--                       (2) suivi des fiches gagnantes postees sur le canal
--                           Telegram PUBLIC.
-- ADDITIF UNIQUEMENT : aucune table, fonction ou politique existante modifiee.
-- ============================================================================

-- (1) Provenance : une ligne par compte, ecrite UNE seule fois (premiere source).
create table if not exists public.acquisition_sources (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  source     text not null check (source ~ '^[a-z0-9_-]{1,32}$'),
  created_at timestamptz not null default now()
);
alter table public.acquisition_sources enable row level security;
-- Aucune politique : lecture/ecriture uniquement via les fonctions ci-dessous.
revoke all on public.acquisition_sources from anon, authenticated;

-- Appelee par le navigateur juste apres l'inscription / la connexion.
-- Seuls les comptes crees depuis moins de 7 jours sont attribues : un ancien
-- client qui clique un lien TikTok n'est jamais compte comme nouveau client.
create or replace function public.enregistrer_source(p_source text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_src text := lower(trim(coalesce(p_source, '')));
  v_cree timestamptz;
begin
  if v_uid is null then return 'non_connecte'; end if;
  if v_src !~ '^[a-z0-9_-]{1,32}$' then return 'invalide'; end if;
  select created_at into v_cree from public.profiles where id = v_uid;
  if v_cree is null or v_cree < now() - interval '7 days' then return 'trop_ancien'; end if;
  insert into public.acquisition_sources(user_id, source) values (v_uid, v_src)
  on conflict (user_id) do nothing;
  if found then return 'ok'; end if;
  return 'deja';
end;
$$;
revoke all on function public.enregistrer_source(text) from public, anon;
grant execute on function public.enregistrer_source(text) to authenticated;

-- Tableau admin : inscrits, clients payants et revenus par source.
-- p_jours : null = tout l'historique, sinon les inscrits des N derniers jours.
create or replace function public.get_acquisition_stats(p_jours integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_depuis timestamptz := case when p_jours is null then '-infinity'::timestamptz
                               else now() - make_interval(days => greatest(p_jours, 1)) end;
  r jsonb;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  with base as (
    select p.id, coalesce(a.source, 'inconnu') as source
    from public.profiles p
    left join public.acquisition_sources a on a.user_id = p.id
    where p.created_at >= v_depuis and coalesce(p.role, '') <> 'admin'
  ), pay as (
    select user_id,
           sum(case when coalesce(provider, '') <> 'stripe' then amount_htg else 0 end) as htg,
           sum(case when provider = 'stripe' then provider_amount else 0 end) as usd
    from public.payments where status = 'confirmed' group by user_id
  ), agg as (
    select b.source,
           count(*) as inscrits,
           count(pay.user_id) as payants,
           coalesce(sum(pay.htg), 0) as htg,
           coalesce(sum(pay.usd), 0) as usd
    from base b left join pay on pay.user_id = b.id
    group by b.source
  )
  select coalesce(jsonb_agg(jsonb_build_object('source', source, 'inscrits', inscrits, 'payants', payants,
                                               'htg', htg, 'usd', usd)
                            order by inscrits desc, source), '[]'::jsonb)
  into r from agg;
  return r;
end;
$$;
revoke all on function public.get_acquisition_stats(integer) from public, anon;
grant execute on function public.get_acquisition_stats(integer) to authenticated;

-- (2) Canal Telegram public : une fiche gagnante = un seul message (reservation avant envoi).
create table if not exists public.telegram_public_envois (
  ticket_id  uuid primary key references public.tickets(id) on delete cascade,
  statut     text not null default 'envoi' check (statut in ('envoi', 'envoye')),
  message_id bigint,
  created_at timestamptz not null default now(),
  envoye_at  timestamptz
);
alter table public.telegram_public_envois enable row level security;
revoke all on public.telegram_public_envois from anon, authenticated;
