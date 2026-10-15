-- Les paiements Stripe automatiques (provider='stripe') sont comptes a part, en DOLLARS :
-- provider_amount = montant d'origine en USD (jamais le montant en gourdes eventuellement paye par le client),
-- provider_payload = detail (devise payee, montant paye, devise d'origine).
-- Le total en gourdes (get_revenue_stats) ne garde que les autres moyens.
-- (Definitions identiques a celles appliquees en production le 15/10 : voir get_revenue_stats / get_stripe_stats.)

create or replace function public.get_revenue_stats()
returns table(total_confirmed integer, month_confirmed integer, month_prev_confirmed integer, month_confirmed_count integer, month_prev_confirmed_count integer, pending_amount integer, pending_count integer)
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_debut_mois timestamptz := date_trunc('month', now());
  v_debut_mois_prec timestamptz := date_trunc('month', now()) - interval '1 month';
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  return query
  select
    coalesce((select sum(amount_htg) from payments where status='confirmed' and provider is distinct from 'stripe'),0)::integer,
    coalesce((select sum(amount_htg) from payments where status='confirmed' and provider is distinct from 'stripe' and confirmed_at >= v_debut_mois),0)::integer,
    coalesce((select sum(amount_htg) from payments where status='confirmed' and provider is distinct from 'stripe' and confirmed_at >= v_debut_mois_prec and confirmed_at < v_debut_mois),0)::integer,
    coalesce((select count(*) from payments where status='confirmed' and provider is distinct from 'stripe' and confirmed_at >= v_debut_mois),0)::integer,
    coalesce((select count(*) from payments where status='confirmed' and provider is distinct from 'stripe' and confirmed_at >= v_debut_mois_prec and confirmed_at < v_debut_mois),0)::integer,
    coalesce((select sum(amount_htg) from payments where status='pending' and provider is distinct from 'stripe'),0)::integer,
    coalesce((select count(*) from payments where status='pending' and provider is distinct from 'stripe'),0)::integer;
end;
$function$;

create or replace function public.get_stripe_stats()
returns jsonb
language plpgsql security definer set search_path to 'public'
as $function$
declare
  v_debut_mois timestamptz := date_trunc('month', now());
  v_debut_mois_prec timestamptz := date_trunc('month', now()) - interval '1 month';
  r jsonb;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'total_usd',   coalesce((select sum(provider_amount) from payments where provider='stripe' and status='confirmed'),0),
    'total_count', (select count(*) from payments where provider='stripe' and status='confirmed'),
    'mois_usd',    coalesce((select sum(provider_amount) from payments where provider='stripe' and status='confirmed' and confirmed_at >= v_debut_mois),0),
    'mois_count',  (select count(*) from payments where provider='stripe' and status='confirmed' and confirmed_at >= v_debut_mois),
    'prec_usd',    coalesce((select sum(provider_amount) from payments where provider='stripe' and status='confirmed' and confirmed_at >= v_debut_mois_prec and confirmed_at < v_debut_mois),0),
    'a_verifier',  (select count(*) from payments where method='stripe' and status='pending'),
    'par_plan',    coalesce((select jsonb_agg(x order by x->>'plan_id') from (
                     select jsonb_build_object('plan_id', plan_id, 'n', count(*), 'usd', coalesce(sum(provider_amount),0)) x
                     from payments where provider='stripe' and status='confirmed' group by plan_id) q),'[]'::jsonb),
    'recents',     coalesce((select jsonb_agg(x) from (
                     select jsonb_build_object('plan_id', plan_id, 'usd', provider_amount, 'at', confirmed_at,
                            'devise', provider_payload->>'devise_paiement', 'montant', provider_payload->>'montant_paiement') x
                     from payments where provider='stripe' and status='confirmed' order by confirmed_at desc limit 8) q),'[]'::jsonb)
  ) into r;
  return r;
end;
$function$;
revoke all on function public.get_stripe_stats() from public, anon;
grant execute on function public.get_stripe_stats() to authenticated;
