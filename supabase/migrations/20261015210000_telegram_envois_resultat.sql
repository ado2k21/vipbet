-- Relais Telegram : suivi des messages de RESULTAT (gagnee / perdue), un seul par fiche et par groupe.
alter table public.telegram_envois
  add column if not exists resultat    text check (resultat in ('envoi','gagne','perdu')),
  add column if not exists resultat_at timestamptz;
