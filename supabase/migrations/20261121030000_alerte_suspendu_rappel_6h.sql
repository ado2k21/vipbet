-- 21/11 (James : « OK 1 et 2 ») : une SUSPENSION du compte API est rappelée toutes les 6 heures
-- (avant : toutes les heures, sur tous les canaux -> alertes « sans arrêt » pendant une suspension
-- qui dure). Le premier message reste immédiat et prioritaire. Seul l'intervalle change ; le reste
-- de la fonction est identique.
create or replace function public.alert_claim(p_type text, p_detail text)
 returns boolean
 language plpgsql
 set search_path to 'public'
as $function$
declare
  v_ok boolean;
  v_rappel interval := case
    when p_type like 'API_SITE_OBSOLETE%' then interval '24 hours'
    when p_type like '%:SUSPENDU' then interval '6 hours'
    else interval '3 hours' end;
begin
  insert into alert_state(type) values (p_type) on conflict (type) do nothing;
  update alert_state
     set active = true, last_sent_at = now(), last_detail = left(p_detail, 500), updated_at = now()
   where type = p_type
     and (active = false or last_sent_at is null or last_sent_at < now() - v_rappel)
  returning true into v_ok;
  return coalesce(v_ok, false);
end;
$function$;
