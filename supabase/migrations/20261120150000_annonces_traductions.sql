-- 20/11 (James : « les annonces ne sont pas traduites » -> « OK traduis ») :
-- titre et texte en FRANÇAIS et en ANGLAIS pour chaque annonce. Les colonnes titre / texte
-- existantes restent le KREYÒL (texte de référence, affiché quand une traduction manque).
-- Ajout seulement : rien n'est supprimé, aucune annonce n'est activée ni désactivée.
alter table public.annonces add column if not exists titre_fr text;
alter table public.annonces add column if not exists texte_fr text;
alter table public.annonces add column if not exists titre_en text;
alter table public.annonces add column if not exists texte_en text;

-- Traductions des 10 annonces existantes (seulement si elles sont encore vides : idempotent).
update public.annonces a set
  titre_fr = coalesce(a.titre_fr, v.tfr), texte_fr = coalesce(a.texte_fr, v.xfr),
  titre_en = coalesce(a.titre_en, v.ten), texte_en = coalesce(a.texte_en, v.xen)
from (values
  ('a0000000-0000-4000-8000-000000000001'::uuid,
   'Pas besoin de jouer une fiche entière chaque jour.',
   'Vous pouvez choisir des matchs dans chaque fiche et les réunir pour faire votre propre fiche : un seul ou plusieurs. Jouez avec modération.',
   'You don''t have to play a whole ticket every day.',
   'You can pick matches from each ticket and combine them into your own ticket: one or several. Play responsibly.'),
  ('a0000000-0000-4000-8000-000000000002'::uuid,
   '📊 Le rapport du jour est disponible',
   'Chaque jour, retrouvez le taux de réussite des fiches dans votre Historique. Vous pouvez le partager avec vos amis.',
   '📊 Today''s report is available',
   'Every day, see the success rate of the tickets in your History. You can share it with your friends.'),
  ('a0000000-0000-4000-8000-000000000003'::uuid,
   '📸 Vous avez gagné ? Montrez-le !',
   'Envoyez la capture de votre ticket depuis l''Historique. L''équipe la vérifie, puis elle peut apparaître sur le site sans votre nom.',
   '📸 You won? Show it!',
   'Send a screenshot of your ticket from your History. The team checks it, then it may appear on the site without your name.'),
  ('a0000000-0000-4000-8000-000000000004'::uuid,
   '🤝 Invitez vos amis, gagnez des jours gratuits',
   'Partagez votre lien de parrainage (menu Parrainage). Quand votre ami active son premier plan, vous recevez 2 à 15 jours gratuits sur votre plan.',
   '🤝 Invite your friends, get free days',
   'Share your referral link (Referral menu). When your friend activates their first plan, you get 2 to 15 free days on your plan.'),
  ('a0000000-0000-4000-8000-000000000005'::uuid,
   '⏰ Votre plan se termine bientôt ?',
   'Renouvelez-le à l''avance pour ne manquer aucune fiche.',
   '⏰ Is your plan ending soon?',
   'Renew it in advance so you don''t miss any ticket.'),
  ('a0000000-0000-4000-8000-000000000006'::uuid,
   '📲 Groupe VIP Telegram',
   'Recevez les fiches directement sur Telegram. Le lien du groupe est dans votre espace.',
   '📲 VIP Telegram group',
   'Get the tickets directly on Telegram. The group link is in your account.'),
  ('a0000000-0000-4000-8000-000000000007'::uuid,
   '🔓 Débloquez les fiches VIP',
   'Activez un plan pour voir 4 fiches chaque jour, football et NBA, avec les rapports de résultats.',
   '🔓 Unlock the VIP tickets',
   'Activate a plan to see 4 tickets every day, football and NBA, with the results reports.'),
  ('a0000000-0000-4000-8000-000000000008'::uuid,
   '💳 Paiement facile',
   'MonCash, NatCash ou carte. Votre plan est activé après le paiement.',
   '💳 Easy payment',
   'MonCash, NatCash or card. Your plan is activated after payment.'),
  ('a0000000-0000-4000-8000-000000000009'::uuid,
   '🤝 Parrainage : des jours gratuits pour vous',
   'Partagez votre lien de parrainage (menu Parrainage). Les jours gagnés vous attendent et s''ajoutent à votre premier plan.',
   '🤝 Referral: free days for you',
   'Share your referral link (Referral menu). The days you earn wait for you and are added to your first plan.'),
  ('a0000000-0000-4000-8000-000000000010'::uuid,
   '🛡️ Jouez avec modération',
   'Ne misez jamais plus que ce que vous pouvez perdre. Fixez une limite chaque jour et respectez-la. 18+.',
   '🛡️ Play responsibly',
   'Never stake more than you can afford to lose. Set a daily limit and stick to it. 18+.')
) as v(id, tfr, xfr, ten, xen)
where a.id = v.id;
