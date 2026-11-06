-- 06/11 : lieu approximatif du client au moment du paiement (globe du Dashboard admin).
-- Uniquement des AJOUTS : aucune colonne, ligne, politique ou fonction existante n'est modifiee ou supprimee.
-- L'adresse IP n'est JAMAIS enregistree : seulement pays, region, ville et coordonnees approximatives.

alter table public.payments
  add column if not exists geo_country text,          -- code pays ISO (HT, US, CA...)
  add column if not exists geo_region  text,          -- departement / etat
  add column if not exists geo_city    text,
  add column if not exists geo_lat     double precision,
  add column if not exists geo_lon     double precision,
  add column if not exists geo_source  text;          -- 'reseau' (Cloudflare) ou 'stripe' (pays de la carte)

-- Stripe passe par des liens de paiement : le lieu est note au clic sur « Payer par carte »,
-- puis rattache au paiement par stripe-webhook. Une seule ligne par compte (la derniere).
create table if not exists public.stripe_geo_clic (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  geo_country text,
  geo_region  text,
  geo_city    text,
  geo_lat     double precision,
  geo_lon     double precision,
  created_at  timestamptz not null default now()
);
-- RLS active SANS aucune politique : seules les fonctions serveur (cle secrete) y accedent.
alter table public.stripe_geo_clic enable row level security;

-- Les colonnes geo_* ne sont ecrites QUE par le serveur (meme principe que
-- payments_protect_provider_cols, qui n'est pas modifie) : un compte ne peut
-- pas inventer le lieu de son propre paiement depuis le navigateur.
create or replace function public.payments_protect_geo_cols()
returns trigger
language plpgsql
set search_path to 'public'
as $$
begin
  if current_user in ('service_role','postgres','supabase_admin') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    new.geo_country := null; new.geo_region := null; new.geo_city := null;
    new.geo_lat := null; new.geo_lon := null; new.geo_source := null;
  else
    new.geo_country := old.geo_country; new.geo_region := old.geo_region; new.geo_city := old.geo_city;
    new.geo_lat := old.geo_lat; new.geo_lon := old.geo_lon; new.geo_source := old.geo_source;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_payments_protect_geo_cols on public.payments;
create trigger trg_payments_protect_geo_cols
  before insert or update on public.payments
  for each row execute function public.payments_protect_geo_cols();
