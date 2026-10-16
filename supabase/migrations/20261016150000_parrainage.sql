-- ============================================================================
-- VIP BETCOTE — PARRAINAGE (16/10). ADDITIF : aucune table / fonction existante modifiee.
-- Regles validees :
--   * Un client partage son lien https://vipbetcote.com/?ref=CODE.
--   * Le filleul est rattache au parrain UNE fois, a la creation de son compte (< 7 jours).
--   * Au PREMIER paiement confirme du filleul, le parrain gagne des jours selon le plan
--     achete par le filleul : p1 = 2 j, p2 = 5 j, p3 = 7 j, p4 (lifetime) = 15 j.
--   * Les jours prolongent l'abonnement ACTIF du parrain (son plan ne change JAMAIS).
--     Sans abonnement actif : la recompense attend et s'applique a son prochain plan.
--     Parrain LIFETIME : rien a prolonger (acces deja illimite).
--   * Pas d'auto-parrainage, une seule recompense par filleul, 10 recompenses / mois max,
--     un paiement anterieur au rattachement ne compte pas. L'admin peut annuler.
-- ============================================================================

create table if not exists public.parrainage_codes (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  code       text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.parrainages (
  filleul_id      uuid primary key references auth.users(id) on delete cascade,
  parrain_id      uuid not null references auth.users(id) on delete cascade,
  created_at      timestamptz not null default now(),
  statut          text not null default 'inscrit'
                  check (statut in ('inscrit', 'recompense', 'plafond', 'hors_delai', 'annule')),
  payment_id      uuid,
  plan_id         text,
  jours           integer,
  recompense_at   timestamptz,
  applique        boolean not null default false,
  applique_at     timestamptz,
  subscription_id uuid,
  note            text,
  check (filleul_id <> parrain_id)
);
create index if not exists parrainages_parrain_idx on public.parrainages(parrain_id);
create index if not exists parrainages_a_traiter_idx on public.parrainages(statut, applique);

alter table public.parrainage_codes enable row level security;
alter table public.parrainages enable row level security;
revoke all on public.parrainage_codes from anon, authenticated;
revoke all on public.parrainages from anon, authenticated;

-- Jours offerts selon le plan du PREMIER paiement du filleul.
create or replace function public.parrainage_jours(p_plan text)
returns integer language sql immutable as $$
  select case p_plan when 'p1' then 2 when 'p2' then 5 when 'p3' then 7 when 'p4' then 15 else 0 end;
$$;

-- Code personnel (cree au premier appel). Lettres/chiffres sans ambiguite (pas de 0/O/1/I).
create or replace function public.parrainage_code_pour(p_uid uuid)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_code text;
  v_alpha constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  i int;
begin
  select code into v_code from parrainage_codes where user_id = p_uid;
  if v_code is not null then return v_code; end if;
  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_alpha, 1 + (get_byte(extensions.gen_random_bytes(1), 0) % length(v_alpha)), 1);
    end loop;
    begin
      insert into parrainage_codes(user_id, code) values (p_uid, v_code);
      return v_code;
    exception when unique_violation then
      select code into v_code from parrainage_codes where user_id = p_uid;
      if v_code is not null then return v_code; end if;  -- cree entre-temps
    end;
  end loop;
end;
$$;
revoke all on function public.parrainage_code_pour(uuid) from public, anon, authenticated;

-- Appelee par le navigateur du FILLEUL apres son inscription (lien ?ref=CODE).
create or replace function public.enregistrer_parrain(p_code text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_parrain uuid;
  v_cree timestamptz;
begin
  if v_uid is null then return 'non_connecte'; end if;
  if upper(coalesce(p_code, '')) !~ '^[A-Z0-9]{6}$' then return 'invalide'; end if;
  select user_id into v_parrain from parrainage_codes where code = upper(p_code);
  if v_parrain is null then return 'inconnu'; end if;
  if v_parrain = v_uid then return 'soi_meme'; end if;
  select created_at into v_cree from profiles where id = v_uid;
  if v_cree is null or v_cree < now() - interval '7 days' then return 'trop_ancien'; end if;
  insert into parrainages(filleul_id, parrain_id) values (v_uid, v_parrain)
  on conflict (filleul_id) do nothing;
  if found then return 'ok'; end if;
  return 'deja';
end;
$$;
revoke all on function public.enregistrer_parrain(text) from public, anon;
grant execute on function public.enregistrer_parrain(text) to authenticated;

-- Page « Parrainage » du client : son code, ses compteurs, ses filleuls (noms masques).
create or replace function public.mon_parrainage()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  r jsonb;
begin
  if v_uid is null then raise exception 'non connecte'; end if;
  select jsonb_build_object(
    'code', parrainage_code_pour(v_uid),
    'inscrits', (select count(*) from parrainages where parrain_id = v_uid and statut <> 'annule'),
    'payants', (select count(*) from parrainages where parrain_id = v_uid and statut in ('recompense', 'plafond')),
    'jours_gagnes', (select coalesce(sum(jours), 0) from parrainages where parrain_id = v_uid and statut = 'recompense'),
    'jours_attente', (select coalesce(sum(jours), 0) from parrainages where parrain_id = v_uid and statut = 'recompense' and not applique),
    'filleuls', coalesce((select jsonb_agg(jsonb_build_object(
        'nom', case when coalesce(p.username, '') <> '' then left(p.username, 1) || '•••' else left(split_part(p.email, '@', 1), 2) || '•••' end,
        'date', pa.created_at, 'statut', pa.statut, 'jours', pa.jours, 'plan', pa.plan_id, 'applique', pa.applique)
        order by pa.created_at desc)
      from parrainages pa join profiles p on p.id = pa.filleul_id
      where pa.parrain_id = v_uid and pa.statut <> 'annule'), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;
revoke all on function public.mon_parrainage() from public, anon;
grant execute on function public.mon_parrainage() to authenticated;

-- Traitement (toutes les 15 min, cle service) : 1) attribue les recompenses, 2) les applique.
create or replace function public.traiter_parrainages()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  pa record; pay record; sub record;
  n_rec int := 0; n_app int := 0; n_plaf int := 0;
  v_jours int;
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
      update parrainages set applique = true, applique_at = now(), subscription_id = sub.id,
        note = 'parrain lifetime : acces deja illimite' where filleul_id = pa.filleul_id;
      continue;
    end if;
    update subscriptions set expires_at = expires_at + make_interval(days => pa.jours) where id = sub.id;
    update parrainages set applique = true, applique_at = now(), subscription_id = sub.id
      where filleul_id = pa.filleul_id;
    n_app := n_app + 1;
  end loop;
  return jsonb_build_object('recompenses', n_rec, 'appliquees', n_app, 'plafond', n_plaf);
end;
$$;
revoke all on function public.traiter_parrainages() from public, anon, authenticated;
grant execute on function public.traiter_parrainages() to service_role;

-- Admin : vue d'ensemble + liste.
create or replace function public.get_parrainages_admin()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r jsonb;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'filleuls', (select count(*) from parrainages where statut <> 'annule'),
    'payants', (select count(*) from parrainages where statut in ('recompense', 'plafond')),
    'jours', (select coalesce(sum(jours), 0) from parrainages where statut = 'recompense' and applique),
    'attente', (select coalesce(sum(jours), 0) from parrainages where statut = 'recompense' and not applique),
    'liste', coalesce((select jsonb_agg(x order by (x->>'date') desc) from (
      select jsonb_build_object('filleul_id', pa.filleul_id,
        'parrain', coalesce(nullif(pp.username, ''), pp.email), 'parrain_email', pp.email,
        'filleul', coalesce(nullif(pf.username, ''), pf.email), 'filleul_email', pf.email,
        'date', pa.created_at, 'statut', pa.statut, 'jours', pa.jours, 'plan', pa.plan_id,
        'applique', pa.applique, 'note', pa.note) x
      from parrainages pa join profiles pp on pp.id = pa.parrain_id join profiles pf on pf.id = pa.filleul_id
      order by pa.created_at desc limit 300) q), '[]'::jsonb)
  ) into r;
  return r;
end;
$$;
revoke all on function public.get_parrainages_admin() from public, anon;
grant execute on function public.get_parrainages_admin() to authenticated;

-- Admin : annuler une recompense (fraude, remboursement). Retire les jours s'ils ont ete ajoutes
-- et que l'abonnement concerne est encore en cours.
create or replace function public.admin_annuler_parrainage(p_filleul uuid)
returns text language plpgsql security definer set search_path = public as $$
declare pa record;
begin
  if not is_admin() then raise exception 'not authorized'; end if;
  select * into pa from parrainages where filleul_id = p_filleul for update;
  if not found then return 'introuvable'; end if;
  if pa.statut = 'annule' then return 'deja'; end if;
  if pa.applique and pa.subscription_id is not null and coalesce(pa.jours, 0) > 0 then
    update subscriptions set expires_at = greatest(now(), expires_at - make_interval(days => pa.jours))
      where id = pa.subscription_id and expires_at is not null and expires_at > now();
  end if;
  update parrainages set statut = 'annule', note = 'annule par un administrateur' where filleul_id = p_filleul;
  insert into audit_log(admin_id, action, target_user_id, reason, new_value)
    values (auth.uid(), 'parrainage_annule', pa.parrain_id, 'annulation admin', jsonb_build_object('filleul_id', p_filleul, 'parrain_id', pa.parrain_id, 'jours', pa.jours));
  return 'ok';
end;
$$;
revoke all on function public.admin_annuler_parrainage(uuid) from public, anon;
grant execute on function public.admin_annuler_parrainage(uuid) to authenticated;
