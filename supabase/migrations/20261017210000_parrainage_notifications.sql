-- ============================================================================
-- VIP BETCOTE — 17/10 : PARRAINAGE, NOTIFICATIONS AU PARRAIN.
-- ADDITIF : traiter_parrainages(), les recompenses, les plans et les paiements
-- ne changent PAS. On ajoute seulement des messages :
--   * recompense gagnee, jours ajoutes au plan actif   -> notification (+ email)
--   * recompense gagnee, parrain sans plan (en reserve) -> notification (+ email)
--   * parrain Lifetime (acces deja illimite)            -> notification (+ email)
--   * jours en reserve ajoutes plus tard au nouveau plan -> notification seule
-- Les emails sont envoyes par la fonction Netlify parrainage-recompenses, qui
-- marque parrainages.email_recompense_at (un seul email par recompense).
-- ============================================================================

-- 1) Nouveaux types de notification (la liste existante est conservee).
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type = any (array[
    'payment_pending', 'payment_confirmed', 'payment_rejected', 'admin_plan_change',
    'referral_added', 'referral_pending', 'referral_lifetime', 'referral_applied'
  ]::text[]));

-- 2) Suivi de l'email de recompense. Les recompenses deja existantes sont
--    marquees comme traitees : aucun email retroactif.
alter table public.parrainages add column if not exists email_recompense_at timestamptz;
update public.parrainages set email_recompense_at = now()
 where email_recompense_at is null and recompense_at is not null;

-- 3) Declencheur : cree la notification au bon moment.
create or replace function public.parrainage_notifier()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type text;
begin
  -- Recompense gagnee (premier paiement confirme du filleul).
  if new.statut = 'recompense' and old.statut is distinct from 'recompense' then
    if exists (select 1 from subscriptions s
                where s.user_id = new.parrain_id and s.status = 'active' and s.expires_at > now()) then
      v_type := 'referral_added';
    elsif exists (select 1 from subscriptions s
                   where s.user_id = new.parrain_id and s.status = 'active' and s.expires_at is null) then
      v_type := 'referral_lifetime';
    else
      v_type := 'referral_pending';
    end if;
    insert into notifications (user_id, type, plan_id, reason)
    values (new.parrain_id, v_type, new.plan_id, coalesce(new.jours, 0)::text);
  end if;

  -- Jours restes en reserve, finalement ajoutes au nouveau plan du parrain
  -- (application plus de 10 min apres la recompense = elle etait en attente).
  if new.statut = 'recompense' and new.applique and not old.applique
     and coalesce(new.jours_restants, 0) > 0
     and new.applique_at - new.recompense_at > interval '10 minutes' then
    insert into notifications (user_id, type, plan_id, reason)
    values (new.parrain_id, 'referral_applied', new.plan_id, coalesce(new.jours, 0)::text);
  end if;

  return new;
exception when others then
  -- Une notification ne doit JAMAIS bloquer l'attribution d'une recompense.
  raise warning 'parrainage_notifier: %', sqlerrm;
  return new;
end;
$$;

revoke all on function public.parrainage_notifier() from public, anon, authenticated;

drop trigger if exists trg_parrainage_notifier on public.parrainages;
create trigger trg_parrainage_notifier
  after update on public.parrainages
  for each row execute function public.parrainage_notifier();
