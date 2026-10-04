-- ============================================================================
-- VIP BETCOTE — Confirmation automatique d'un paiement Stripe (03/10/2026)
-- ----------------------------------------------------------------------------
-- Fonction APPELEE UNIQUEMENT par netlify/functions/stripe-webhook.js (cle
-- service_role), APRES verification cryptographique de la signature Stripe et
-- verification du montant/devise. Jamais depuis le navigateur.
--
-- Meme garanties que confirmer_paiement_prestataire (MonCash/NatCash) :
--   * ligne payments verrouillee (FOR UPDATE) -> aucune course avec l'admin
--   * idempotente (un rejeu Stripe ne cree rien de plus)
--   * jamais deux abonnements actifs
--   * un abonnement deja actif n'est jamais ecrase (clause status='pending')
--   * un compte suspendu n'est pas active
-- Differences volontaires :
--   * `provider` n'est JAMAIS renseigne : une ligne Stripe doit rester
--     invisible du poller et de l'expiration automatique MonCash/NatCash
--     (idx_payments_pending_provider / expirer_paiements_prestataire).
--   * la comparaison de montant se fait dans la devise Stripe, cote webhook
--     (la table plans est en HTG).
--   * un meme identifiant de session Stripe ne peut confirmer qu'UN paiement.
--   * un paiement sans abonnement rattache n'est pas confirme (laisse a l'admin).
-- Additive : ne modifie aucune table, aucune fonction existante.
-- ============================================================================

create or replace function public.confirmer_paiement_stripe(
  p_reference       text,
  p_session_id      text,
  p_amount          bigint,
  p_currency        text,
  p_payment_intent  text,
  p_livemode        boolean,
  p_payload         jsonb default null
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_pay   public.payments%rowtype;
  v_plan  public.plans%rowtype;
  v_debut timestamptz := now();
  v_fin   timestamptz;
  v_meta  jsonb;
begin
  if coalesce(p_reference, '') = '' or coalesce(p_session_id, '') = '' then
    return jsonb_build_object('ok', false, 'code', 'BAD_INPUT');
  end if;

  select * into v_pay
    from public.payments
   where reference = p_reference and method = 'stripe'
   for update;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'PAYMENT_NOT_FOUND');
  end if;

  v_meta := jsonb_build_object(
    'payment_intent', p_payment_intent, 'amount', p_amount,
    'currency', lower(coalesce(p_currency, '')), 'livemode', p_livemode,
    'session_id', p_session_id);

  if v_pay.status = 'confirmed' then
    -- Rejeu du meme evenement Stripe : rien a faire.
    if v_pay.provider_transaction_id = p_session_id then
      return jsonb_build_object('ok', true, 'code', 'ALREADY_CONFIRMED');
    end if;
    -- Deja valide a la main par un admin (cas normal : l'admin a vu le
    -- paiement dans Stripe avant l'arrivee du webhook). On garde la trace
    -- de la session sans rien changer d'autre.
    if v_pay.provider_transaction_id is null then
      update public.payments
         set provider_transaction_id = p_session_id,
             provider_checked_at     = now(),
             provider_payload        = coalesce(p_payload, '{}'::jsonb) || v_meta
       where id = v_pay.id;
      return jsonb_build_object('ok', true, 'code', 'ALREADY_CONFIRMED_ADMIN');
    end if;
    -- Une SECONDE session Stripe payee pour une reference deja confirmee :
    -- l'argent a ete encaisse deux fois -> decision humaine (remboursement).
    return jsonb_build_object('ok', false, 'code', 'DOUBLE_PAYMENT');
  end if;

  if v_pay.status <> 'pending' then
    return jsonb_build_object('ok', false, 'code', 'NOT_PENDING', 'status', v_pay.status);
  end if;

  -- Une session Stripe = un seul paiement.
  if exists (select 1 from public.payments
              where provider_transaction_id = p_session_id and id <> v_pay.id) then
    return jsonb_build_object('ok', false, 'code', 'SESSION_DEJA_UTILISEE');
  end if;

  if v_pay.subscription_id is null then
    return jsonb_build_object('ok', false, 'code', 'NO_SUBSCRIPTION');
  end if;

  select * into v_plan from public.plans where id = v_pay.plan_id;
  if not found then
    return jsonb_build_object('ok', false, 'code', 'PLAN_NOT_FOUND');
  end if;

  if exists (select 1 from public.profiles p
              where p.id = v_pay.user_id and p.suspended_at is not null) then
    return jsonb_build_object('ok', false, 'code', 'USER_SUSPENDED');
  end if;

  update public.payments set
    status                  = 'confirmed',
    confirmed_at            = now(),
    confirmed_by            = null,
    confirmation_source     = 'provider',
    provider_transaction_id = p_session_id,
    provider_status         = 'ok',
    provider_checked_at     = now(),
    provider_payload        = coalesce(p_payload, '{}'::jsonb) || v_meta
  where id = v_pay.id;

  -- Jamais deux abonnements actifs simultanement.
  update public.subscriptions set status = 'cancelled'
   where user_id = v_pay.user_id
     and status = 'active'
     and id <> v_pay.subscription_id;

  if v_plan.duration_days is not null then
    v_fin := v_debut + make_interval(days => v_plan.duration_days);
  else
    v_fin := null;                              -- Lifetime : jamais d'expiration
  end if;

  update public.subscriptions set
    status = 'active', starts_at = v_debut, expires_at = v_fin
   where id = v_pay.subscription_id and status = 'pending';
  if not found then
    -- Annule TOUT (y compris la confirmation du paiement ci-dessus).
    raise exception 'ABONNEMENT_DEJA_MODIFIE : aucune ecriture appliquee, par securite.';
  end if;

  insert into public.notifications (user_id, type, plan_id, reason)
  values (v_pay.user_id, 'payment_confirmed', v_pay.plan_id, null);

  insert into public.audit_log (admin_id, action, target_user_id, old_value, new_value, reason)
  values (null, 'payment_confirmed', v_pay.user_id,
          jsonb_build_object('payment_id', v_pay.id, 'status', 'pending'),
          jsonb_build_object('payment_id', v_pay.id, 'status', 'confirmed',
                             'subscription_id', v_pay.subscription_id,
                             'source', 'stripe_webhook',
                             'stripe_session', p_session_id,
                             'stripe_amount', p_amount,
                             'stripe_currency', lower(coalesce(p_currency, ''))),
          null);

  return jsonb_build_object('ok', true, 'code', 'CONFIRMED',
                            'subscription_id', v_pay.subscription_id,
                            'expires_at', v_fin);
end;
$function$;

-- Meme perimetre d'execution que confirmer_paiement_prestataire :
-- service_role uniquement (jamais anon / authenticated / public).
revoke all on function public.confirmer_paiement_stripe(text, text, bigint, text, text, boolean, jsonb) from public;
revoke all on function public.confirmer_paiement_stripe(text, text, bigint, text, text, boolean, jsonb) from anon;
revoke all on function public.confirmer_paiement_stripe(text, text, bigint, text, text, boolean, jsonb) from authenticated;
grant execute on function public.confirmer_paiement_stripe(text, text, bigint, text, text, boolean, jsonb) to service_role;
