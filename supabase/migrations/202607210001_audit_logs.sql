create table if not exists public.audit_logs(

    id uuid primary key default gen_random_uuid(),

    user_id uuid
        references auth.users(id)
        on delete set null,

    action varchar(100) not null,

    entity varchar(100) not null,

    entity_id uuid,

    description text,

    old_data jsonb,

    new_data jsonb,

    ip_address text,

    user_agent text,

    created_at timestamptz
        default now()

);

create index idx_audit_logs_user
on public.audit_logs(user_id);

create index idx_audit_logs_entity
on public.audit_logs(entity);

create index idx_audit_logs_created
on public.audit_logs(created_at desc);