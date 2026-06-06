-- VonWillingh Barbershop: single-row settings store for admin dashboard
create table if not exists public.business_settings (
  id int primary key default 1 check (id = 1),
  settings jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.business_settings enable row level security;

-- No public policies: the Next.js server uses the service role key (bypasses RLS).

insert into public.business_settings (id, settings)
values (
  1,
  '{
    "businessName": "VonWillingh Barbershop",
    "tagline": "Classic cuts. Modern style.",
    "logoUrl": null,
    "phone": "+27 00 000 0000",
    "whatsapp": "27000000000",
    "email": "hello@vonwillinghbarbershop.co.za",
    "address": "Your Street Address, City",
    "mapsUrl": "https://maps.google.com",
    "timezone": "Africa/Johannesburg",
    "hours": {
      "monday": { "open": "09:00", "close": "18:00", "closed": false },
      "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
      "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
      "thursday": { "open": "09:00", "close": "18:00", "closed": false },
      "friday": { "open": "09:00", "close": "18:00", "closed": false },
      "saturday": { "open": "08:00", "close": "14:00", "closed": false },
      "sunday": { "open": "09:00", "close": "18:00", "closed": true }
    },
    "services": [
      {
        "name": "Classic Haircut",
        "price": "R150",
        "duration": "30 min",
        "description": "Scissor or clipper cut, finished with a hot towel."
      },
      {
        "name": "Skin Fade",
        "price": "R180",
        "duration": "40 min",
        "description": "Clean fade with sharp line-up and styling."
      },
      {
        "name": "Beard Trim & Shape",
        "price": "R100",
        "duration": "20 min",
        "description": "Neat beard sculpting and razor edge detail."
      },
      {
        "name": "Haircut & Beard Combo",
        "price": "R220",
        "duration": "50 min",
        "description": "Full haircut plus beard trim — the complete package."
      }
    ],
    "whatsappMessage": "Hi Kobus, I''d like to book an appointment at VonWillingh Barbershop.",
    "social": { "instagram": "", "facebook": "" },
    "barber": {
      "name": "Kobus Von Willingh",
      "title": "Owner & Master Barber",
      "yearsExperience": 10,
      "photo": "/images/kobus-von-willingh.png",
      "tagline": "10 years behind the chair. Precision cuts. Classic style.",
      "bio": "Kobus Von Willingh has spent a decade perfecting his craft behind the chair. Known for clean fades, sharp line-ups, and cuts tailored to you — not just the trend — he brings old-school technique and modern style to every appointment. Calm, focused, and detail-driven, Kobus makes sure you leave looking sharp and feeling confident.",
      "bioShort": "With 10 years of barbering experience, Kobus Von Willingh delivers clean fades, sharp details, and cuts that suit your style — every time."
    }
  }'::jsonb
)
on conflict (id) do nothing;
