# Swashray Immigration Services Inc. — Website

A full-stack website with a built-in content management system, built with
Next.js (App Router), TypeScript, Tailwind CSS, and MongoDB.

Kajal (or anyone on the team) can manage the entire public website —
homepage text, images, services, news, bookings, inquiries, theme colors,
navigation, and SEO — from the `/admin` dashboard, without touching code.

## What's included

- **Public website**: Home, About, Services (+ individual service pages),
  News (+ individual article pages), Booking, Contact, plus Privacy/Terms/
  Disclaimer pages.
- **Admin dashboard** (`/admin`): dashboard overview, website content editor,
  services CRUD, news CRUD, bookings management, inquiries inbox, media
  library, theme editor, site settings, SEO settings, navigation manager,
  and account/password management.
- **MongoDB-backed CMS**: every editable thing on the site (text, images,
  services, news, theme colors, navigation, contact info, footer,
  disclaimer) is stored in MongoDB — nothing important is hard-coded.
- **Secure admin auth**: hashed passwords, signed HTTP-only session cookies,
  protected admin routes and APIs.
- **Image uploads**: stored in MongoDB via GridFS (no external file storage
  needed, and it survives redeploys — important for serverless hosting).
- **Booking system** with configurable working days/hours, appointment
  length, buffer time, and closed dates — double-booking is prevented.
- **Inquiry inbox** with statuses, read/unread tracking, and internal notes.
- **Basic spam protection** on public forms (honeypot field + submission
  rate limiting).

## 1. Getting set up

You'll need Node.js 20+ and a MongoDB database. The easiest option is a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster (no cost to start).

```bash
npm install
cp .env.example .env.local
```

Open `.env.local` and fill in:

- `MONGODB_URI` — your MongoDB connection string.
- `AUTH_SECRET` — any long random string (e.g. run `openssl rand -base64 48`).
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` — the first
  admin login. Change the password from inside the dashboard afterwards if
  you like.

Then create the first admin login and starter content:

```bash
npm run seed
```

Run it locally:

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin dashboard: http://localhost:3000/admin/login

## 2. Replacing the starter content

To keep this deliverable honest, a few things are placeholders on purpose —
**nothing here should be presented to real customers as-is**:

- **Logo**: a temporary geometric mark is shown until a real logo is
  uploaded from **Admin → Site Settings → Branding**.
- **6 service categories** (Visitor Visa, Sponsorship, Work Permits, Study
  Permits, Passport Services, Citizenship) were pre-created from **Admin →
  Services** so the site isn't empty on day one. Edit or remove them freely.
  Each one also ships with a custom-designed navy/gold illustration (no stock
  photos — nothing to license) so the cards don't look empty; swap any of
  them for a real photo any time from **Admin → Services → (edit) → Featured
  Image**.
- **2 demo news articles** are marked with a visible "Demo" badge — replace
  or delete them from **Admin → News & Updates** before launch.
- **About page copy, Privacy Policy, and Terms of Use** are general
  placeholder text — have these reviewed before launch. The About page
  intentionally avoids inventing company history, years of experience, or
  client numbers, since none were provided.
- No testimonials, certifications, awards, or success-rate claims are used
  anywhere, per the brief.

## 3. Third-party services — none are required, all are optional

The site works fully with just MongoDB — no other paid service is required.
The following are **not** wired up, but the codebase is structured so any of
them can be added later without a rebuild:

| Feature | Would need | Typical cost |
|---|---|---|
| Email notifications (e.g. "you got a new inquiry") | An email provider (Resend, SendGrid, Postmark) | Free tier available; paid tiers from ~$10–20/mo |
| SMS notifications | An SMS provider (Twilio) | Pay-per-message, no fixed cost |
| Online payments for consultations | A payment gateway (Stripe) | No monthly fee; ~2.9% + $0.30 per transaction |
| Google Calendar sync for bookings | Google Calendar API (free) + OAuth setup | Free |
| Richer image storage/CDN | Cloudinary or AWS S3 | Free tier available; paid usage-based |
| Site analytics | Google Analytics (free) or Plausible (paid) | Free–$9/mo |

We did not add any of these without checking first, per your note that you
want to see pricing before committing to anything paid. Let us know which of
these you'd like and we'll scope it.

## 4. Hosting

This is a standard Next.js app and deploys to Vercel, Netlify, or any
Node.js host. Because images are stored in MongoDB (not on local disk),
it's safe to deploy to serverless platforms — nothing gets lost on
redeploy. Set the same environment variables from `.env.local` in your
hosting provider's dashboard.

## 5. Project structure (for developers)

```
src/app/(site)/        Public website pages
src/app/admin/          Admin dashboard (login is public, everything else
                          under (dashboard) requires a signed-in session)
src/app/api/admin/      Admin-only API routes (protected)
src/app/api/public/     Public form submission endpoints (rate-limited)
src/app/api/media/[id]  Serves uploaded images from MongoDB GridFS
src/lib/models/         Mongoose schemas
src/lib/                Auth, db connection, validation, theme helpers
src/components/site/    Public-facing UI components
src/components/admin/   Admin dashboard UI components
scripts/seed.ts         Creates the admin login + starter content
```

Colors, border radius, button style, and heading font are controlled by
`ThemeSettings` in MongoDB and applied as CSS variables at runtime — changing
them in **Admin → Theme** updates the live site immediately, no rebuild
needed.
