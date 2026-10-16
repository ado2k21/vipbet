-- ============================================================================
-- Alertes : message PRECIS quand la variable de cle API est ABSENTE sur un site.
-- Constat (16/10) : a chaque creneau de 15 min, ~6 executions reussissent et 1-2
-- echouent avec « API_SPORTS_KEY absente des variables Netlify » : un AUTRE site
-- Netlify execute les memes taches sans la variable. L'alerte disait a tort
-- « cle invalide / compte suspendu ».
-- Correctifs (alert_check, remplacement cible, idempotent) :
--   * une execution sans erreur au meme moment (meme sans match, la nuit) suffit
--     a prouver que le service fonctionne -> alerte « site » et non « panne » ;
--   * cause CLE_ABSENTE distincte (variable absente) + texte exact de l'erreur.
-- Voir la migration appliquee « alert_check_cle_absente_precis ».
-- ============================================================================
do $mig$
declare d text; n text;
begin
  d := pg_get_functiondef('public.alert_check'::regproc);
  if position('v_ok_proche' in d) > 0 then return; end if;   -- deja applique
  n := d;
  n := replace(n, 'v_reel_proche int;', 'v_reel_proche int; v_ok_proche int; v_msg_obs text;');
  n := replace(n, 'v_reel_proche := 0; v_est_panne := false;', 'v_reel_proche := 0; v_ok_proche := 0; v_est_panne := false;');
  n := replace(n, '      v_est_panne := (v_ok_at is null or v_err_at > v_ok_at)',
    E'      select count(*) into v_ok_proche from bot_run_log\n        where bot = v_bot and ran_at between v_err_at - interval ''15 minutes'' and v_err_at + interval ''15 minutes''\n          and coalesce(jsonb_array_length(stats->''erreurs''),0) = 0;\n      v_est_panne := (v_ok_at is null or v_err_at > v_ok_at)');
  n := replace(n, 'and v_reel_proche = 0;', 'and v_reel_proche = 0 and v_ok_proche = 0;');
  n := replace(n, 'and v_reel_proche > 0 then', 'and (v_reel_proche > 0 or v_ok_proche > 0) then');
  n := replace(n, '      select count(*) into v_refus_30h from bot_run_log',
    E'      select e into v_msg_obs from bot_run_log b, jsonb_array_elements_text(b.stats->''erreurs'') e\n        where b.bot = v_bot and b.ran_at = v_err_at and e ~* v_pattern limit 1;\n      cause := case when v_msg_obs ~* ''absente|présentes dans les variables'' then ''CLE_ABSENTE'' else ''REFUSE'' end;\n      select count(*) into v_refus_30h from bot_run_log');
  n := replace(n, '''succes_simultanes'', v_reel_proche);',
    '''succes_simultanes'', greatest(v_reel_proche, v_ok_proche), ''message_api'', left(coalesce(v_msg_obs,''''), 200));');
  n := replace(n, 'when v_msg ~* ''suspend''', 'when v_msg ~* ''absente|présentes dans les variables'' then ''CLE_ABSENTE''
        when v_msg ~* ''suspend''');
  if n = d then raise exception 'aucun remplacement'; end if;
  execute n;
end
$mig$;
