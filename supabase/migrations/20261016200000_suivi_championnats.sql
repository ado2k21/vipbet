-- ============================================================================
-- VIP BETCOTE — 16/10 : page admin « Suivi des championnats ».
-- LECTURE SEULE, ADDITIF : aucune table, vue ou fonction existante modifiee.
-- Une ligne par sport + championnat + marche, a partir des vrais resultats
-- regles (ticket_legs.result won/lost). p_jours : null = tout l'historique.
-- ============================================================================
create or replace function public.get_suivi_championnats(p_jours integer default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare r jsonb;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  with base as (
    select coalesce(t.sport, 'foot') as sport, l.league, max(l.league_country) as pays, l.market,
           count(*) as joues,
           count(*) filter (where l.result = 'won') as gagnes,
           round(avg(l.odd), 2) as cote_moy,
           max(t.play_date) as dernier
    from public.ticket_legs l
    join public.tickets t on t.id = l.ticket_id
    where l.result in ('won', 'lost') and l.league is not null and l.market is not null
      and (p_jours is null or t.play_date >= current_date - greatest(p_jours, 1))
    group by 1, 2, 4
  )
  select coalesce(jsonb_agg(jsonb_build_object(
           'sport', sport, 'league', league, 'pays', pays, 'market', market,
           'joues', joues, 'gagnes', gagnes, 'cote_moy', cote_moy, 'dernier', dernier)
         order by joues desc, league), '[]'::jsonb)
  into r from base;
  return r;
end;
$$;
revoke all on function public.get_suivi_championnats(integer) from public, anon;
grant execute on function public.get_suivi_championnats(integer) to authenticated;
