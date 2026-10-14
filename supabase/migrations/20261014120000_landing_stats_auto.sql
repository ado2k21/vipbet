-- =====================================================================
-- Statistiques du LANDING synchronisees automatiquement (14/10)
--
-- Concerne UNIQUEMENT la table landing_stats (chiffres affiches sur la
-- page d'accueil). Aucune donnee de profiles / tickets n'est modifiee,
-- aucune statistique de l'admin ou du dashboard n'est touchee.
--
-- Regles (demande de James) :
--   1. active_users       : +1 a chaque nouvelle inscription confirmee
--                           (email_verified = true, role 'user').
--   2. successful_tickets : +1 a chaque fiche publiee qui passe a 'won',
--                           qu'elle vienne du bot ou de l'admin. -1 si
--                           l'admin la corrige (plus 'won' ou depubliee)
--                           afin que le chiffre reste exact. Une
--                           suppression ne fait jamais baisser le chiffre.
--   Point de depart : valeurs actuelles conservees (option A).
--   Jamais deux fois : registre landing_stats_ledger (cle kind + ref).
--   L'admin peut toujours corriger les chiffres a la main.
-- =====================================================================

create table if not exists public.landing_stats_ledger (
  kind       text        not null check (kind in ('user','ticket')),
  ref        uuid        not null,
  counted_at timestamptz not null default now(),
  primary key (kind, ref)
);
-- RLS active sans aucune policy : illisible et non modifiable depuis le site.
alter table public.landing_stats_ledger enable row level security;

-- Etat de depart : ce qui existe deja est considere comme deja compte
-- (inclus dans les chiffres actuels), pour ne jamais etre recompte.
insert into public.landing_stats_ledger (kind, ref)
  select 'user', id from public.profiles
  where email_verified is true and coalesce(role,'user') = 'user'
on conflict do nothing;

insert into public.landing_stats_ledger (kind, ref)
  select 'ticket', id from public.tickets
  where published is true and status = 'won'
on conflict do nothing;

-- ---------- 1. Utilisateurs actifs ----------
create or replace function public.landing_stats_compter_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare n integer;
begin
  if new.email_verified is true
     and coalesce(new.role,'user') = 'user'
     and (tg_op = 'INSERT' or old.email_verified is distinct from true) then
    insert into landing_stats_ledger (kind, ref) values ('user', new.id)
      on conflict do nothing;
    get diagnostics n = row_count;
    if n > 0 then
      update landing_stats set active_users = active_users + 1, updated_at = now()
      where id = 1;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists landing_stats_user on public.profiles;
create trigger landing_stats_user
  after insert or update of email_verified on public.profiles
  for each row execute function public.landing_stats_compter_user();

-- ---------- 2. Fiches reussies ----------
create or replace function public.landing_stats_compter_ticket()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  n   integer;
  v_ref uuid := case when tg_op = 'DELETE' then old.id else new.id end;
begin
  -- Suppression d'une fiche (nettoyage d'historique) : le compteur du
  -- landing est cumulatif, il ne redescend jamais pour une suppression.
  if tg_op = 'DELETE' then
    return old;
  end if;
  if new.published is true and new.status = 'won' then
    insert into landing_stats_ledger (kind, ref) values ('ticket', v_ref)
      on conflict do nothing;
    get diagnostics n = row_count;
    if n > 0 then
      update landing_stats set successful_tickets = successful_tickets + 1, updated_at = now()
      where id = 1;
    end if;
  else
    delete from landing_stats_ledger where kind = 'ticket' and landing_stats_ledger.ref = v_ref;
    get diagnostics n = row_count;
    if n > 0 then
      update landing_stats set successful_tickets = greatest(successful_tickets - 1, 0), updated_at = now()
      where id = 1;
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists landing_stats_ticket on public.tickets;
create trigger landing_stats_ticket
  after insert or update of status, published or delete on public.tickets
  for each row execute function public.landing_stats_compter_ticket();

-- Fonctions internes : jamais appelables directement depuis le site.
revoke all on function public.landing_stats_compter_user()   from public, anon, authenticated;
revoke all on function public.landing_stats_compter_ticket() from public, anon, authenticated;
