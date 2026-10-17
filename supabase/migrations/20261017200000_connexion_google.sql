-- ============================================================================
-- VIP BETCOTE — 17/10 : CONNEXION GOOGLE (Supabase OAuth).
-- Declencheur sur auth.identities, a l'ajout d'une identite Google :
--   1) profiles.email_verified passe a true UNIQUEMENT si Google certifie
--      l'adresse (identity_data.email_verified = true) et qu'elle est bien
--      celle du compte. Le navigateur ne peut jamais ecrire cette colonne
--      (policy RLS « profil modifiable par proprietaire » la verrouille).
--   2) PROTECTION ANTI-DETOURNEMENT : Supabase rattache automatiquement une
--      connexion Google a un compte existant de meme email. Si ce compte
--      existant avait ete cree avec un mot de passe mais n'avait JAMAIS
--      verifie son email (profiles.email_verified = false), son mot de
--      passe a pu etre choisi par quelqu'un d'autre que le vrai proprietaire
--      de l'adresse. Le vrai proprietaire, prouve par Google, reprend alors
--      la main : l'ancien mot de passe est neutralise et les anciennes
--      sessions sont fermees.
-- ADDITIF : handle_new_user, les policies et les autres comptes ne changent pas.
-- ============================================================================
create or replace function public.identite_google_verifiee()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_email   text;
  v_verifie boolean;
begin
  if new.provider is distinct from 'google' then
    return new;
  end if;

  v_email   := lower(coalesce(new.identity_data->>'email', ''));
  v_verifie := coalesce((new.identity_data->>'email_verified')::boolean, false);
  if not v_verifie or v_email = '' then
    return new;
  end if;

  if exists (select 1 from auth.identities i
              where i.user_id = new.user_id and i.provider = 'email')
     and not coalesce((select p.email_verified from public.profiles p
                        where p.id = new.user_id), false) then
    update auth.users
       set encrypted_password = extensions.crypt(gen_random_uuid()::text, extensions.gen_salt('bf'))
     where id = new.user_id;
    delete from auth.sessions where user_id = new.user_id;
  end if;

  update public.profiles
     set email_verified = true
   where id = new.user_id
     and lower(email) = v_email
     and email_verified = false;

  return new;
end;
$$;

revoke all on function public.identite_google_verifiee() from public, anon, authenticated;

drop trigger if exists trg_identite_google on auth.identities;
create trigger trg_identite_google
  after insert on auth.identities
  for each row execute function public.identite_google_verifiee();
