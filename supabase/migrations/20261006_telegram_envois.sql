-- VIP BETCOTE — relais Telegram : table de suivi des envois (ADDITIVE).
-- Ne touche à aucune table existante. Un envoi par (fiche, groupe).
create table if not exists public.telegram_envois (
  ticket_id   uuid        not null references public.tickets(id) on delete cascade,
  groupe      smallint    not null check (groupe between 1 and 4),
  statut      text        not null default 'envoi' check (statut in ('envoi','envoye')),
  message_id  bigint,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz,
  primary key (ticket_id, groupe)
);
alter table public.telegram_envois enable row level security;
-- Aucune policy : seul le service_role (fonction Netlify) y accède.
revoke all on public.telegram_envois from anon, authenticated;
