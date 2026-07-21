create table if not exists public.notifications(

    id uuid primary key default gen_random_uuid(),

    title text not null,

    message text not null,

    type varchar(30) not null,

    sender_id uuid
        references auth.users(id)
        on delete set null,

    created_at timestamptz
        default now()

);

create table if not exists public.user_notifications(

    id uuid primary key default gen_random_uuid(),

    notification_id uuid not null
        references public.notifications(id)
        on delete cascade,

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    is_read boolean default false,

    read_at timestamptz,

    created_at timestamptz
        default now()

);

create index idx_user_notifications_user
on public.user_notifications(user_id);

create index idx_user_notifications_read
on public.user_notifications(is_read);