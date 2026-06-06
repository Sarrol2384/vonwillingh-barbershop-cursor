# VonWillingh Barbershop — Digital Business Card

A mobile-first digital business card for VonWillingh Barbershop with WhatsApp booking, opening hours, services, and a password-protected admin dashboard.

## Quick start

```bash
npm install
npm run dev
```

- **Public site:** http://localhost:3000
- **Admin:** http://localhost:3000/admin (default password: `admin123`)

Copy `.env.example` to `.env.local` and change `ADMIN_PASSWORD` and `SESSION_SECRET` before deploying.

## Admin dashboard

Sign in at `/admin` to update:

- Business name, tagline, and timezone
- Phone, WhatsApp, email, address, and maps link
- Opening hours per day
- Services and prices
- Kobus's bio and profile details

Changes are saved to `data/business.json`.

## Deploy notes

- Set `ADMIN_PASSWORD` and `SESSION_SECRET` environment variables in production.
- **Vercel:** File writes to `data/business.json` do not persist between deploys. For production on Vercel, migrate storage to a database (e.g. Supabase) or deploy to a platform with a persistent filesystem (Railway, Fly.io, VPS).
- Add the client's real phone number, WhatsApp, address, and prices via the admin dashboard.

## Project structure

- `src/app/page.tsx` — Public digital card
- `src/app/admin/` — Admin login and dashboard
- `data/business.json` — All business content
- `public/images/kobus-von-willingh.png` — Barber photo
