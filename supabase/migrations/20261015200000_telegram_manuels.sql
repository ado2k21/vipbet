-- Invites MANUELS des groupes Telegram VIP : personnes ajoutees par un administrateur du groupe
-- (ajout direct, lien cree a la main) ou autorisees depuis le panneau admin. Le robot ne les
-- retire JAMAIS (sauf decision de l'admin). Ecriture : fonctions Netlify (service_role) seulement.
create table if not exists public.telegram_manuels (
  chat_id          bigint      not null,
  telegram_user_id bigint      not null,
  telegram_name    text,
  note             text,
  origine          text        not null default 'admin_groupe' check (origine in ('admin_groupe','lien_admin','panneau')),
  created_at       timestamptz not null default now(),
  primary key (chat_id, telegram_user_id)
);
alter table public.telegram_manuels enable row level security;
create policy "telegram_manuels lecture admin"
  on public.telegram_manuels for select to authenticated
  using (public.is_admin());
revoke insert, update, delete on public.telegram_manuels from anon, authenticated;
