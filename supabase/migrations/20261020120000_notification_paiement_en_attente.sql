-- 20/10 : notification « paiement en attente » creee PAR LA BASE.
-- Le site ne peut pas l'ecrire lui-meme (seul un admin peut inserer dans
-- notifications, voir notifications_insert_admin) : elle n'etait donc jamais
-- enregistree. Ici, des qu'un depot MANUEL (MonCash/NatCash avec recu) est
-- enregistre, la base ajoute la notification au compte concerne : visible
-- sur tous ses appareils, a l'heure reelle du depot. Les paiements
-- automatiques (provider renseigne) ne sont pas concernes : ils se confirment
-- seuls en quelques minutes. Aucune donnee existante n'est modifiee.
create or replace function public.notifier_paiement_en_attente_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.notifications (user_id, type, plan_id, reason)
  values (new.user_id, 'payment_pending', new.plan_id, null);
  return new;
exception when others then
  -- Jamais bloquant : un echec de notification ne doit pas annuler le paiement.
  return new;
end;
$$;

revoke all on function public.notifier_paiement_en_attente_user() from public, anon, authenticated;

drop trigger if exists trg_notif_paiement_en_attente_user on public.payments;
create trigger trg_notif_paiement_en_attente_user
  after insert on public.payments
  for each row
  when (new.status = 'pending' and new.provider is null and new.method = any (array['moncash','natcash']))
  execute function public.notifier_paiement_en_attente_user();
