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

## Deploy to Vercel + Supabase

Admin saves need a database on Vercel (the server filesystem is read-only).

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Open **SQL Editor** and run the migration in [`supabase/migrations/001_business_settings.sql`](supabase/migrations/001_business_settings.sql).
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

3. Deploy. The site will read/write settings from Supabase automatically.

> **Important:** Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it to git. It is only used in server API routes.

### 3. Update content

Visit `https://your-site.vercel.app/admin`, sign in, and edit content. Changes persist in Supabase.

## Project structure

- `src/app/page.tsx` — Public digital card
- `src/app/admin/` — Admin login and dashboard
- `src/lib/settings.ts` — Loads from Supabase (production) or `data/business.json` (local)
- `supabase/migrations/` — Database setup SQL
- `public/images/kobus-von-willingh.png` — Barber photo
