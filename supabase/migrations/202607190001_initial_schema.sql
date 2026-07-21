-- =========================================================
-- Extensions
-- =========================================================

create extension if not exists pgcrypto;

-- =========================================================
-- Enum
-- =========================================================

create type public.user_role as enum (
    'ADMIN',
    'TEACHER',
    'STUDENT'
);

-- =========================================================
-- Profiles
-- =========================================================

create table if not exists public.profiles (

    id uuid primary key
        references auth.users(id)
        on delete cascade,

    student_code varchar(20) unique not null,

    full_name text not null,

    email text not null,

    role public.user_role not null default 'STUDENT',

    avatar_url text,

    is_active boolean not null default true,

    must_change_password boolean not null default true,

    deleted_at timestamptz,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

create index idx_profiles_role
on public.profiles(role);

create index idx_profiles_student_code
on public.profiles(student_code);
-- =========================================================
-- User Sessions
-- =========================================================

create table if not exists public.user_sessions (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    session_token text not null,

    device_name text,

    ip_address text,

    user_agent text,

    is_active boolean default true,

    created_at timestamptz default now(),

    expires_at timestamptz
);

create index idx_user_sessions_user
on public.user_sessions(user_id);

create index idx_user_sessions_active
on public.user_sessions(is_active);
-- =========================================================
-- Update Timestamp
-- =========================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as
$$
begin

    new.updated_at = now();

    return new;

end;
$$;

drop trigger if exists trg_profiles_updated_at
on public.profiles;

create trigger trg_profiles_updated_at

before update

on public.profiles

for each row

execute procedure public.update_updated_at();
-- =========================================================
-- Handle New User
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as
$$
begin

insert into public.profiles(

    id,

    student_code,

    full_name,

    email,

    role

)

values(

    new.id,

    upper(split_part(new.email,'@',1)),

    coalesce(new.raw_user_meta_data->>'full_name',''),

    new.email,

    coalesce(
        (new.raw_user_meta_data->>'role')::public.user_role,
        'STUDENT'
    )

);

return new;

end;
$$;
drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created

after insert

on auth.users

for each row

execute function public.handle_new_user();

alter table public.profiles
enable row level security;

alter table public.user_sessions
enable row level security;
create policy "profiles_select"

on public.profiles

for select

using (

auth.uid()=id

);

create policy "profiles_update"

on public.profiles

for update

using (

auth.uid()=id

);
create policy "sessions_select"

on public.user_sessions

for select

using (

auth.uid()=user_id

);
create policy "sessions_update"

on public.user_sessions

for update

using (

auth.uid()=user_id

);