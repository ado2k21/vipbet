-- ============================================================================
-- VIP BETCOTE — 16/10 : PROTECTION DES DEPOTS MANUELS (audit paiements).
-- Un depot manuel est ecrit par le NAVIGATEUR du client (payments + subscriptions
-- en 'pending'). Avant ce correctif, le client choisissait librement le montant
-- (amount_htg) et pouvait rattacher un paiement d'un plan a un abonnement d'un
-- AUTRE plan (ex. paiement « P1 249 G » + abonnement Lifetime).
-- Desormais, pour tout appelant qui n'est ni le serveur ni un admin :
--   1) le montant est FORCE au prix officiel du plan (plans.price_htg) ;
--   2) l'abonnement rattache doit appartenir au MEME client, etre 'pending'
--      et porter le MEME plan, sinon l'insertion est refusee.
-- SECURITY INVOKER : current_user est le vrai role de l'appelant (voir le
-- correctif payments_protect_invoker du meme jour). Lectures sous RLS : le
-- client lit son propre abonnement et les plans publics, rien d'autre.
-- ADDITIF : aucune autre fonction, politique ou donnee modifiee.
-- ============================================================================
create or replace function public.payments_controle_depot_client()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare v_prix integer;
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  if public.is_admin() then
    return new;
  end if;

  select price_htg into v_prix from public.plans where id = new.plan_id;
  if v_prix is null then
    raise exception 'DEPOT_REFUSE : plan inconnu.';
  end if;
  new.amount_htg := v_prix;

  if new.subscription_id is not null and not exists (
    select 1 from public.subscriptions s
     where s.id = new.subscription_id
       and s.user_id = new.user_id
       and s.status = 'pending'
       and s.plan_id = new.plan_id
  ) then
    raise exception 'DEPOT_REFUSE : abonnement incoherent avec ce paiement.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_payments_controle_depot_client on public.payments;
create trigger trg_payments_controle_depot_client
  before insert on public.payments
  for each row execute function public.payments_controle_depot_client();
