-- =====================================================================
-- VIPBETCOTE - 2FA admin : PARTIE RESTANTE A EXECUTER (14/10)
-- Supabase > SQL Editor > New query > coller tout ce fichier > Run
-- (le reste de la migration est deja installe)
-- =====================================================================

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

revoke all on function public.admin_mfa_generer_codes()     from public, anon;
revoke all on function public.admin_mfa_supprimer_codes()    from public, anon;
revoke all on function public.admin_mfa_reinitialiser(text)  from public, anon;
grant execute on function public.admin_mfa_generer_codes()     to authenticated;
grant execute on function public.admin_mfa_supprimer_codes()   to authenticated;
grant execute on function public.admin_mfa_reinitialiser(text) to authenticated;

-- Temoin "installation complete" (EN DERNIER) : debloque le bouton
-- "Aktive 2FA" sur le site.
create or replace function public.admin_mfa_pret()
returns boolean
language sql
stable
as $$ select true $$;
revoke all on function public.admin_mfa_pret() from public, anon;
grant execute on function public.admin_mfa_pret() to authenticated;
