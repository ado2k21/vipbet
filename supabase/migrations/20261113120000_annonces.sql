-- 13/11 : ANNONCES du Dashboard (a la place de la note fixe au-dessus des fiches du jour).
-- Uniquement des AJOUTS : aucune table, politique ou fonction existante n'est modifiee.
-- L'admin redige, active/desactive, modifie, supprime ; choisit le public :
--   'abonne' (plan actif), 'non_abonne' (sans plan actif), 'tous'.
-- Plusieurs annonces actives pour un meme public : elles defilent toutes les 30 s (cote site).
create table if not exists public.annonces (
  id         uuid primary key default gen_random_uuid(),
  titre      text not null check (char_length(titre) between 1 and 90),
  texte      text not null default '' check (char_length(texte) <= 200),
  public     text not null default 'tous' check (public in ('abonne', 'non_abonne', 'tous')),
  actif      boolean not null default false,
  ordre      integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.annonces enable row level security;
revoke all on public.annonces from anon, authenticated;
grant select on public.annonces to authenticated;
grant insert, update, delete on public.annonces to authenticated;   -- limite a l'admin par les politiques

-- Lecture : un compte connecte voit les annonces ACTIVES ; l'admin voit tout.
drop policy if exists "annonces : actives ou admin" on public.annonces;
create policy "annonces : actives ou admin" on public.annonces
  for select using (actif or public.is_admin());
drop policy if exists "annonces : admin ajoute" on public.annonces;
create policy "annonces : admin ajoute" on public.annonces
  for insert with check (public.is_admin());
drop policy if exists "annonces : admin modifie" on public.annonces;
create policy "annonces : admin modifie" on public.annonces
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "annonces : admin supprime" on public.annonces;
create policy "annonces : admin supprime" on public.annonces
  for delete using (public.is_admin());

-- Liste prete a l'emploi. SEULE la note actuelle est active (rien ne change pour les abonnes
-- tant que l'admin n'active pas autre chose). Identifiants fixes : rejouer ce fichier ne
-- duplique rien et n'ecrase jamais une annonce deja modifiee par l'admin.
insert into public.annonces (id, titre, texte, public, actif, ordre) values
  ('a0000000-0000-4000-8000-000000000001', 'Ou pa oblije jwe yon fich antye chak jou.',
   'Ou ka chwazi match ou pi renmen nan chak fich, epi mete yo ansanm pou fè pwòp fich pa w : yon sèl oswa plizyè. Jwe ak kontwòl.',
   'tous', true, 1),
  ('a0000000-0000-4000-8000-000000000002', '📊 Rapò jounen an disponib',
   'Chak jou, gade pousantaj fich ki pase yo nan Istorik ou. Ou ka pataje l ak zanmi w.',
   'abonne', false, 2),
  ('a0000000-0000-4000-8000-000000000003', '📸 Ou te genyen ? Montre l !',
   'Voye kapti tikè ou nan Istorik la. Ekip la verifye l, epi li ka parèt sou sit la san non w.',
   'abonne', false, 3),
  ('a0000000-0000-4000-8000-000000000004', '🤝 Envite zanmi w, jwenn jou gratis',
   'Pataje lyen parennaj ou (meni Parennaj). Lè zanmi w aktive premye plan li, ou jwenn 2 a 15 jou gratis sou plan ou.',
   'abonne', false, 4),
  ('a0000000-0000-4000-8000-000000000005', '⏰ Plan ou ap fini ?',
   'Renouvle l alavans pou w pa rate okenn fich.',
   'abonne', false, 5),
  ('a0000000-0000-4000-8000-000000000006', '📲 Gwoup VIP Telegram',
   'Resevwa fich yo dirèkteman sou Telegram. Lyen gwoup la nan espas ou.',
   'abonne', false, 6),
  ('a0000000-0000-4000-8000-000000000007', '🔓 Debloke fich VIP yo',
   'Aktive yon plan pou w wè 4 fich chak jou, foutbòl ak NBA, ak rapò rezilta yo.',
   'non_abonne', false, 7),
  ('a0000000-0000-4000-8000-000000000008', '💳 Peye fasil',
   'MonCash, NatCash oswa kat. Plan ou aktive apre peman an.',
   'non_abonne', false, 8),
  ('a0000000-0000-4000-8000-000000000009', '🤝 Parennaj : jou gratis pou ou',
   'Menm san plan, pataje lyen parennaj ou (meni Parennaj). Jou ou genyen yo ap tann ou, epi yo ajoute sou premye plan ou.',
   'non_abonne', false, 9),
  ('a0000000-0000-4000-8000-000000000010', '🛡️ Jwe ak kontwòl',
   'Pa janm mete plis pase sa ou ka pèdi. Fikse yon limit chak jou epi respekte l. 18+.',
   'tous', false, 10)
on conflict (id) do nothing;
