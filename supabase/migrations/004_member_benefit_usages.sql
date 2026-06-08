-- Track when members use their monthly benefits at the shop
create table if not exists public.member_benefit_usages (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members (id) on delete cascade,
  benefit_name text not null,
  used_on date not null,
  created_at timestamptz not null default now()
);

create index if not exists member_benefit_usages_member_idx
  on public.member_benefit_usages (member_id);

alter table public.member_benefit_usages enable row level security;
