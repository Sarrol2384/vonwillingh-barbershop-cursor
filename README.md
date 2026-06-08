# VonWillingh Barbershop — Digital Business Card

A mobile-first digital business card for VonWillingh Barbershop with WhatsApp booking, opening hours, services, and a password-protected admin dashboard.

## Quick start (local)

```bash
npm install
npm run dev
```

- **Public site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin (default password: `admin123`)

Copy `.env.example` to `.env.local` and set your passwords.

Locally, without Supabase env vars, content is read/written to `data/business.json`.

## Admin dashboard

Sign in at `/admin` to update:

- Business name, tagline, and timezone
- Phone, WhatsApp, email, address, and maps link
- Opening hours per day
- Services and prices
- Kobus's bio and profile details

View and manage appointments at **`/admin/bookings`**.

## Deploy to Vercel + Supabase

Admin saves need a database on Vercel (the server filesystem is read-only).

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor** and run both migrations:
   - [`supabase/migrations/001_business_settings.sql`](supabase/migrations/001_business_settings.sql)
   - [`supabase/migrations/002_bookings.sql`](supabase/migrations/002_bookings.sql)
3. In **Project Settings → API**, copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **service_role** key (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Deploy on Vercel

1. Import the GitHub repo at [vercel.com](https://vercel.com).
2. Add these environment variables:

| Variable | Value |
|----------|-------|
| `ADMIN_PASSWORD` | Your secure admin password |
| `SESSION_SECRET` | Long random string |
| `NEXT_PUBLIC_SUPABASE_URL` | From Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | From Supabase API settings (service_role) |
| `WHATSAPP_ACCESS_TOKEN` | Meta WhatsApp Cloud API token |
| `WHATSAPP_PHONE_NUMBER_ID` | From Meta Developer → WhatsApp → API Setup |
| `CRON_SECRET` | Random string (Vercel sets this for cron jobs) |

3. Deploy. The site will read/write settings from Supabase automatically.

## Online booking & reminders

- Clients book at **Book an Appointment** on the public site (`/#book`)
- Kobus views upcoming bookings at **`/admin/bookings`**
- **WhatsApp only** — confirmations and 24h reminders go to the client's phone via Meta WhatsApp Cloud API:
  1. Create a [Meta Business](https://business.facebook.com) app with WhatsApp
  2. Add approved **UTILITY** templates:
     - `appointment_reminder` — `Hi {{1}}, reminder for your {{4}} at VonWillingh Barbershop on {{2}} at {{3}}. See you soon!`
     - `booking_confirmation` — same body (or customize)
  3. Set `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` in Vercel

> **Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it to git. It is only used in server API routes.

### 3. Update content

Visit `https://your-site.vercel.app/admin`, sign in, and edit content. Changes persist in Supabase.

## Project structure

- `src/app/page.tsx` — Public digital card
- `src/app/admin/` — Admin login and dashboard
- `src/lib/settings.ts` — Loads from Supabase (production) or `data/business.json` (local)
- `supabase/migrations/` — Database setup SQL
- `public/images/kobus-von-willingh.png` — Barber photo
