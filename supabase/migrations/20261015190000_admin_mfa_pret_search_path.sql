-- Securite : fixe le chemin de recherche de la fonction temoin 2FA (avertissement Supabase).
alter function public.admin_mfa_pret() set search_path = '';
