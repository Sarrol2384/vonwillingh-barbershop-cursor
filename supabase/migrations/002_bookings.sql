-- Appointments for VonWillingh Barbershop
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  client_phone text not null,
  client_email text,
  service_name text not null,
  service_duration int not null default 30,
  booking_date date not null,
  booking_time time not null,
  status text not null default 'confirmed'
    check (status in ('confirmed', 'cancelled', 'completed')),
  reminder_sent boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists bookings_date_idx on public.bookings (booking_date);
create index if not exists bookings_status_idx on public.bookings (status);

create unique index if not exists bookings_slot_unique
  on public.bookings (booking_date, booking_time)
  where status = 'confirmed';

alter table public.bookings enable row level security;
