-- Monthly membership subscribers (cash payments at the shop)
create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  member_number text not null unique,
  client_name text not null,
  client_phone text not null,
  last_payment_date date not null,
  expires_at date not null,
  notes text,
  created_at timestamptz not null default now()
);

create unique index if not exists members_phone_unique on public.members (client_phone);

create table if not exists public.member_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  payment_date date not null,
  amount text not null default 'R30',
  created_at timestamptz not null default now()
);

create index if not exists member_payments_member_idx on public.member_payments (member_id);

alter table public.members enable row level security;
alter table public.member_payments enable row level security;
