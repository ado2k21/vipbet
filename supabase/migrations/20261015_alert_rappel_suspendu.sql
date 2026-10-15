-- Alerte « compte API suspendu » = PRIORITAIRE : rappel toutes les heures
-- (au lieu de 3 h). Les autres alertes gardent 3 h (24 h pour « ancienne clé »).
create or replace function public.alert_claim(p_type text, p_detail text)
returns boolean
language plpgsql
set search_path to 'public'
as $$
declare
  v_ok boolean;
  v_rappel interval := case
    when p_type like 'API_SITE_OBSOLETE%' then interval '24 hours'
    when p_type like '%:SUSPENDU' then interval '1 hour'
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
$$;

create or replace function public.alert_retry_later(p_type text)
returns void
language plpgsql
set search_path to 'public'
as $$
declare
  v_rappel interval := case
    when p_type like 'API_SITE_OBSOLETE%' then interval '24 hours'
    when p_type like '%:SUSPENDU' then interval '1 hour'
    else interval '3 hours' end;
begin
  update alert_state
     set active = true, last_sent_at = now() - (v_rappel - interval '30 minutes'), updated_at = now()
   where type = p_type;
end;
$$;
