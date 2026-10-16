-- ============================================================================
-- Alertes : ne surveiller QUE le site de production (16/10).
-- D'autres sites Netlify (autre equipe) executent les memes taches et ecrivent dans
-- la meme table bot_run_log : leurs echecs declenchaient des alertes pour rien.
-- Les passages portent maintenant stats->>'site' (nom du site Netlify). Les alertes
-- ne lisent que les passages dont le site est dans alert_sites.
-- alert_sites VIDE = aucun filtre (comportement identique a avant).
-- Apres le deploiement : inserer le nom du site de production
--   insert into alert_sites(site) values ('<valeur lue dans stats->>''site''>');
-- ============================================================================
create table if not exists public.alert_sites (site text primary key, created_at timestamptz not null default now());
alter table public.alert_sites enable row level security;
revoke all on public.alert_sites from anon, authenticated;

create or replace view public.bot_run_log_prod with (security_invoker = true) as
  select * from public.bot_run_log
  where not exists (select 1 from public.alert_sites)
     or (stats->>'site') in (select site from public.alert_sites);
revoke all on public.bot_run_log_prod from anon, authenticated;

do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.alert_check'::regproc);
  if position('bot_run_log_prod' in d) > 0 then return; end if;
  n := regexp_replace(d, 'bot_run_log(?![_a-z])', 'bot_run_log_prod', 'g');
  if n = d then raise exception 'aucun remplacement'; end if;
  execute n;
end
$mig$;
