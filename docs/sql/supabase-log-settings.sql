-- Read-only diagnostics. Run once, not as a recurring job.
select name, setting, unit, source from pg_settings
where name in ('log_statement', 'log_min_duration_statement', 'log_min_messages',
  'log_connections', 'log_disconnections', 'log_autovacuum_min_duration',
  'log_temp_files', 'log_lock_waits', 'pgaudit.log', 'pgaudit.role') order by name;

-- Inspect only logging-related database/role overrides; no credentials.
select d.datname, r.rolname, config.setting
from pg_db_role_setting s
left join pg_database d on d.oid = s.setdatabase
left join pg_roles r on r.oid = s.setrole
cross join lateral unnest(s.setconfig) as config(setting)
where config.setting ~ '^(log_|pgaudit\.)'
order by d.datname, r.rolname, config.setting;

select extname from pg_extension where extname in ('pgaudit', 'pg_cron');

-- Only run if pg_cron is installed. Omit commands which may contain secrets.
-- select jobid, jobname, schedule, active from cron.job order by jobid;
