-- 20/11 (demande de James) : une fiche à cote totale 15,xx (ex. 15,20) est partagée au plan 1 ;
-- au-delà de 15,99 elle va au plan supérieur. Le plafond du plan 1 passe de 15 à 15,99.
-- Seule la ligne du plan 1 est touchée, et seulement si elle vaut encore 15 (idempotent).
-- Le contrôle tickets_valider_cote (trg_valider_cote_plan) lit ce plafond : sans ce changement,
-- une fiche foot à 15,20 étiquetée plan 1 serait refusée par la base.
update public.plans set max_total_odd = 15.99 where rank = 1 and max_total_odd = 15;
