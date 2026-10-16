-- ============================================================================
-- VIP BETCOTE — PARRAINAGE : report des jours sur le nouveau plan (16/10, option B).
-- Quand un parrain renouvelle / change de plan AVANT la fin du precedent, l'ancien
-- abonnement est ferme (regle existante, NON modifiee). Les jours de parrainage
-- encore non utilises sur cet ancien abonnement sont reportes sur le NOUVEAU plan.
-- Seuls les jours de parrainage sont reportes, jamais les autres jours restants.
-- Les jours de parrainage sont en fin de plan : ils sont consommes en dernier.
-- ============================================================================

alter table public.parrainages add column if not exists jours_restants numeric;
update public.parrainages set jours_restants = jours
  where applique and statut = 'recompense' and jours_restants is null and subscription_id is not null;

create or replace function public.traiter_parrainages()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  pa record; pay record; sub record; anc record; nouv record; r record;
  n_rec int := 0; n_app int := 0; n_plaf int := 0; n_rep int := 0;
  v_jours int; v_restant numeric; v_reporte numeric; v_part numeric;
begin
  -- 1) Premier paiement confirme d'un filleul -> recompense (ou plafond / hors delai)
  for pa in select * from parrainages where statut = 'inscrit' for update skip locked loop
    select id, plan_id, created_at, confirmed_at into pay from payments
      where user_id = pa.filleul_id and status = 'confirmed'
      order by coalesce(confirmed_at, created_at) asc limit 1;
    if not found then continue; end if;
    if pay.created_at < pa.created_at then
      update parrainages set statut = 'hors_delai', payment_id = pay.id, plan_id = pay.plan_id,
        note = 'paiement anterieur au rattachement' where filleul_id = pa.filleul_id;
      continue;
    end if;
    v_jours := parrainage_jours(pay.plan_id);
    if v_jours <= 0 then continue; end if;
    if (select count(*) from parrainages where parrain_id = pa.parrain_id and statut = 'recompense'
          and recompense_at >= date_trunc('month', now())) >= 10 then
      update parrainages set statut = 'plafond', payment_id = pay.id, plan_id = pay.plan_id, jours = 0,
        recompense_at = now(), note = 'plafond de 10 recompenses ce mois' where filleul_id = pa.filleul_id;
      n_plaf := n_plaf + 1;
      continue;
    end if;
    update parrainages set statut = 'recompense', payment_id = pay.id, plan_id = pay.plan_id,
      jours = v_jours, recompense_at = now() where filleul_id = pa.filleul_id;
    n_rec := n_rec + 1;
  end loop;

  -- 2) Application : prolonge l'abonnement ACTIF du parrain (plan inchange)
  for pa in select pr.* from parrainages pr join profiles p on p.id = pr.parrain_id
            where pr.statut = 'recompense' and not pr.applique and p.suspended_at is null
            for update of pr skip locked loop
    select s.id, s.expires_at into sub from subscriptions s join plans pl on pl.id = s.plan_id
      where s.user_id = pa.parrain_id and s.status = 'active' and (s.expires_at is null or s.expires_at > now())
      order by pl.rank desc, s.expires_at desc nulls first limit 1;
    if not found then continue; end if;          -- en attente du prochain plan du parrain
    if sub.expires_at is null then
      update parrainages set applique = true, applique_at = now(), subscription_id = sub.id, jours_restants = 0,
        note = 'parrain lifetime : acces deja illimite' where filleul_id = pa.filleul_id;
      continue;
    end if;
    update subscriptions set expires_at = expires_at + make_interval(days => pa.jours) where id = sub.id;
    update parrainages set applique = true, applique_at = now(), subscription_id = sub.id, jours_restants = pa.jours
      where filleul_id = pa.filleul_id;
    n_app := n_app + 1;
  end loop;

  -- 3) Report : ancien abonnement ferme par un renouvellement / changement de plan.
  for anc in
    select s.id, s.user_id, s.expires_at, s.ended_at, sum(pr.jours_restants) as bonus
    from subscriptions s join parrainages pr on pr.subscription_id = s.id
    where s.status = 'cancelled' and s.ended_at is not null and s.expires_at is not null
      and pr.statut = 'recompense' and pr.applique and coalesce(pr.jours_restants, 0) > 0
    group by s.id, s.user_id, s.expires_at, s.ended_at
  loop
    -- Nouveau plan qui a remplace l'ancien (active apres sa fermeture).
    select s.id, s.expires_at into nouv from subscriptions s join plans pl on pl.id = s.plan_id
      where s.user_id = anc.user_id and s.status = 'active' and s.id <> anc.id
        and s.starts_at >= anc.ended_at - interval '1 hour'
        and (s.expires_at is null or s.expires_at > now())
      order by pl.rank desc, s.starts_at desc limit 1;
    if not found then continue; end if;          -- pas encore de nouveau plan : on reessaiera
    -- Jours de parrainage non utilises = part de la duree restante, plafonnee au bonus.
    v_restant := greatest(0, extract(epoch from (anc.expires_at - anc.ended_at)) / 86400.0);
    v_reporte := least(anc.bonus, v_restant);
    if nouv.expires_at is not null and v_reporte > 0 then
      update subscriptions set expires_at = expires_at + make_interval(secs => round(v_reporte * 86400))
        where id = nouv.id;
    end if;
    -- Repartition du report entre les recompenses concernees (les plus recentes d'abord).
    for r in select filleul_id, jours_restants from parrainages
             where subscription_id = anc.id and statut = 'recompense' and applique and coalesce(jours_restants, 0) > 0
             order by applique_at desc loop
      v_part := least(r.jours_restants, v_reporte);
      v_reporte := v_reporte - v_part;
      update parrainages set
        subscription_id = case when v_part > 0 then nouv.id else null end,
        jours_restants = case when nouv.expires_at is null then 0 else v_part end,
        note = case when v_part <= 0 then 'jours deja utilises avant le renouvellement'
                    when nouv.expires_at is null then 'reporte : nouveau plan lifetime'
                    else 'reporte sur le nouveau plan' end
        where filleul_id = r.filleul_id;
    end loop;
    n_rep := n_rep + 1;
  end loop;

  return jsonb_build_object('recompenses', n_rec, 'appliquees', n_app, 'plafond', n_plaf, 'reports', n_rep);
end;
$$;
revoke all on function public.traiter_parrainages() from public, anon, authenticated;
grant execute on function public.traiter_parrainages() to service_role;

-- Annulation admin : retire seulement les jours ENCORE credites (apres report eventuel).
create or replace function public.admin_annuler_parrainage(p_filleul uuid)
returns text language plpgsql security definer set search_path = public as $$
declare pa record; v_j numeric;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  select * into pa from parrainages where filleul_id = p_filleul for update;
  if not found then return 'introuvable'; end if;
  if pa.statut = 'annule' then return 'deja'; end if;
  v_j := coalesce(pa.jours_restants, pa.jours, 0);
  if pa.applique and pa.subscription_id is not null and v_j > 0 then
    update subscriptions set expires_at = greatest(now(), expires_at - make_interval(secs => round(v_j * 86400)))
      where id = pa.subscription_id and expires_at is not null and expires_at > now();
  end if;
  update parrainages set statut = 'annule', jours_restants = 0, note = 'annule par un administrateur' where filleul_id = p_filleul;
  insert into audit_log(admin_id, action, target_user_id, reason, new_value)
    values (auth.uid(), 'parrainage_annule', pa.parrain_id, 'annulation admin',
            jsonb_build_object('filleul_id', p_filleul, 'parrain_id', pa.parrain_id, 'jours', v_j));
  return 'ok';
end;
$$;
revoke all on function public.admin_annuler_parrainage(uuid) from public, anon;
grant execute on function public.admin_annuler_parrainage(uuid) to authenticated;
