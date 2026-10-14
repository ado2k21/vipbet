-- =====================================================================
-- 2FA admin appliquee COTE SERVEUR (14/10)
--
-- Regles (demande de James) :
--   * La 2FA reste FACULTATIVE : l'admin l'active / la desactive depuis
--     le menu (Sekirite 2FA) quand il le veut.
--   * Une fois ACTIVEE, elle devient OBLIGATOIRE pour ce compte : sans
--     code valide (session "aal2"), aucun droit admin n'est accorde par
--     la base, meme si l'ecran du code est contourne.
--   * S'il ne peut plus recevoir son code, il reinitialise sa 2FA avec un
--     code de secours (usage unique, essais limites), puis peut la
--     reactiver.
--   * Codes de secours : generes par le serveur apres l'activation,
--     montres une seule fois, stockes uniquement sous forme bcrypt.
-- =====================================================================

-- 1. Droits admin : role 'admin' ET (2FA validee OU 2FA non activee)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
     and (
       coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
       or not exists (
         select 1 from auth.mfa_factors f
         where f.user_id = auth.uid() and f.status = 'verified'
       )
     );
$$;

-- 2. Codes de secours : plus aucun acces direct depuis le navigateur
--    (avant : un admin pouvait ecrire ses propres codes et contourner
--    l'ecran 2FA). Tout passe par les fonctions ci-dessous.
alter policy "admin gere ses propres codes de secours"
  on public.admin_mfa_backup_codes using (false) with check (false);

-- Journal des tentatives de reinitialisation (limitation des essais)
create table if not exists public.admin_mfa_recovery_attempts (
  id       bigserial   primary key,
  admin_id uuid        not null,
  ok       boolean     not null,
  at       timestamptz not null default now()
);
alter table public.admin_mfa_recovery_attempts enable row level security;

-- 3. Generation des codes (apres activation, session 2FA validee)
create or replace function public.admin_mfa_generer_codes()
returns text[]
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  codes text[] := '{}';
  brut  text;
  i     integer;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Reserve aux administrateurs.' using errcode = '42501';
  end if;
  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2' then
    raise exception 'Validation 2FA requise.' using errcode = '42501';
  end if;
  delete from admin_mfa_backup_codes where admin_id = auth.uid();
  for i in 1..10 loop
    brut := upper(encode(gen_random_bytes(8), 'hex'));          -- 64 bits
    insert into admin_mfa_backup_codes (admin_id, code_hash, used)
      values (auth.uid(), crypt(brut, gen_salt('bf', 10)), false);
    codes := codes || (substr(brut,1,4)||'-'||substr(brut,5,4)||'-'||substr(brut,9,4)||'-'||substr(brut,13,4));
  end loop;
  insert into audit_log (admin_id, action) values (auth.uid(), 'mfa_codes_generes');
  return codes;
end;
$$;

-- 4. Nombre de codes restants (affichage dans le menu Sekirite)
create or replace function public.admin_mfa_codes_restants()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer from admin_mfa_backup_codes
  where admin_id = auth.uid() and used = false
    and exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- 5. Suppression des codes (apres desactivation de la 2FA)
create or replace function public.admin_mfa_supprimer_codes()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'admin') then
    raise exception 'Reserve aux administrateurs.' using errcode = '42501';
  end if;
  -- Autorise seulement si la 2FA est validee OU deja retiree du compte.
  if coalesce(auth.jwt() ->> 'aal', 'aal1') <> 'aal2'
     and exists (select 1 from auth.mfa_factors f where f.user_id = auth.uid() and f.status = 'verified') then
    raise exception 'Validation 2FA requise.' using errcode = '42501';
  end if;
  delete from admin_mfa_backup_codes where admin_id = auth.uid();
  insert into audit_log (admin_id, action) values (auth.uid(), 'mfa_desactive');
end;
$$;

-- 6. Reinitialisation avec un code de secours ("je ne recois plus mon code")
--    Appelee avec la session mot-de-passe (aal1). 5 essais rates max par
--    15 minutes. Code bon : il est consomme, la 2FA du compte est retiree
--    (l'admin peut la reactiver) et les autres codes sont invalides.
create or replace function public.admin_mfa_reinitialiser(p_code text)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  uid   uuid := auth.uid();
  norm  text := upper(regexp_replace(coalesce(p_code, ''), '[^0-9A-Fa-f]', '', 'g'));
  r     record;
  bon   boolean := false;
begin
  if uid is null or not exists (select 1 from profiles where id = uid and role = 'admin') then
    return 'interdit';
  end if;
  if (select count(*) from admin_mfa_recovery_attempts
      where admin_id = uid and ok = false and at > now() - interval '15 minutes') >= 5 then
    return 'trop_essais';
  end if;
  if length(norm) = 16 then
    for r in select id, code_hash from admin_mfa_backup_codes
             where admin_id = uid and used = false loop
      if crypt(norm, r.code_hash) = r.code_hash then
        bon := true;
        exit;
      end if;
    end loop;
  end if;
  insert into admin_mfa_recovery_attempts (admin_id, ok) values (uid, bon);
  if not bon then
    return 'code_invalide';
  end if;
  delete from auth.mfa_factors where user_id = uid;
  delete from admin_mfa_backup_codes where admin_id = uid;
  insert into audit_log (admin_id, action) values (uid, 'mfa_reinitialise_code_secours');
  return 'ok';
end;
$$;

-- Droits d'execution : uniquement les comptes connectes (le controle
-- admin / 2FA est fait a l'interieur de chaque fonction).
revoke all on function public.admin_mfa_generer_codes()      from public, anon;
revoke all on function public.admin_mfa_codes_restants()     from public, anon;
revoke all on function public.admin_mfa_supprimer_codes()    from public, anon;
revoke all on function public.admin_mfa_reinitialiser(text)  from public, anon;
grant execute on function public.admin_mfa_generer_codes()     to authenticated;
grant execute on function public.admin_mfa_codes_restants()    to authenticated;
grant execute on function public.admin_mfa_supprimer_codes()   to authenticated;
grant execute on function public.admin_mfa_reinitialiser(text) to authenticated;

-- 7. Temoin "installation complete" : cree EN DERNIER. Le site n'autorise
--    l'activation de la 2FA que si cette fonction existe (toutes les
--    fonctions ci-dessus sont alors en place).
create or replace function public.admin_mfa_pret()
returns boolean
language sql
stable
as $$ select true $$;
revoke all on function public.admin_mfa_pret() from public, anon;
grant execute on function public.admin_mfa_pret() to authenticated;
