# LUCCI CRENO

Luxury fashion e-commerce and CMS built with Next.js (App Router), TypeScript, Tailwind CSS, MongoDB/Mongoose, GSAP, Framer Motion, and Lenis.

Editorial storefront for **LUCCI CRENO** — genuine luxury you wear — plus a protected admin portal for content, products, services, gallery, orders, and settings.

## Prerequisites

- **Node.js** 20+ (tested with Node 24)
- **npm** 10+
- **MongoDB** locally (MongoDB Compass compatible), e.g. running at `mongodb://127.0.0.1:27017`

## Quick start

```bash
# 1. Install
npm install

# 2. Environment
cp .env.example .env.local
# Edit .env.local — set MONGODB_URI, AUTH_SECRET (32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD

# 3. Seed database (idempotent)
npm run seed

# 4. Develop
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin/login](http://localhost:3000/admin/login) for the admin portal.

## Environment variables

See `.env.example`. Required:

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | MongoDB connection string, e.g. `mongodb://127.0.0.1:27017/lucci-creno` |
| `AUTH_SECRET` | JWT signing secret (min 32 characters) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | First admin account (seed only) |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL |
| `MAX_UPLOAD_BYTES` | Max upload size (default 5MB) |
| `UPLOAD_DIR` | Local upload root (default `public/uploads`) |
| `SESSION_MAX_AGE_HOURS` | Admin session length |
| `NEXT_IMAGE_REMOTE_HOSTS` | Comma-separated hosts for `next/image` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript `--noEmit` |
| `npm run test` | Vitest unit tests |
| `npm run seed` | Idempotent MongoDB seed |

## Admin setup

1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local` (strong password).
2. Run `npm run seed` — creates/updates the admin user with a bcrypt hash.
3. Sign in at `/admin/login`.
4. After first login, rotate the password by updating the seed env and re-running seed, or change the hash in MongoDB. Never commit real credentials.

Admin sessions use an **httpOnly**, **sameSite=lax** cookie (`lc_admin_session`). Login is rate-limited.

## Local uploads (important)

Images uploaded in admin are stored under `public/uploads/{pages|products|services|gallery|testimonials|blog|settings|misc}/` with collision-resistant sanitized filenames. MongoDB stores only public paths such as `/uploads/products/...`.

**Production warning:** Local filesystem storage requires a **persistent writable volume**. It does **not** work reliably on ephemeral or serverless filesystems (e.g. many Vercel deployments) unless you attach durable storage or switch to an object store later. Seed/default assets under controlled paths are never deleted by orphan cleanup.

Allowed formats: JPG/JPEG, PNG, WebP, AVIF. SVG admin uploads are rejected. The brand logo is a code-owned SVG component.

## CMS → frontend map

| Admin module | Public surface |
|--------------|----------------|
| Pages | Home, About, Services/Gallery/Testimonials/FAQ/Blog/Contact heroes, policy pages |
| Products / Pricing | `/shop`, `/shop/[slug]`, home featured |
| Services (Listing + Detail tabs) | `/services`, `/services/[slug]` |
| Gallery | `/gallery`, home lookbook |
| Testimonials | `/testimonials`, home preview |
| FAQs | `/faq` |
| Blog | `/blog`, `/blog/[slug]` |
| Orders | Created from `/checkout` (payment pending by default) |
| Contact Messages | From `/contact` and footer newsletter |
| Settings | Header/footer contact, socials, seasonal offer, currency, SEO defaults |

All public content is read from MongoDB (seeded, then editable). Prices are stored as **integer minor units (cents)** — never floating point.

## Cart & payments

- Cart persists in the browser (Zustand + localStorage).
- Checkout validates customer/shipping details and **recalculates prices server-side** from MongoDB.
- Orders are created with `payment.status = pending` and provider `manual` (order request flow).
- **No raw card numbers** are collected.

To connect a payment provider later: implement a provider adapter that updates `Order.payment` after a successful webhook/session, keep line-item snapshots immutable, and only change `payment.status` / `status` via controlled admin or webhook handlers.

## Project structure

```
src/app/(site)/     Public storefront routes
src/app/admin/      Protected CMS portal
src/app/api/        Auth, upload, orders, contact
src/components/     Site, admin, motion, UI
src/lib/            DB, auth, uploads, validation, queries
src/models/         Mongoose models
scripts/seed.ts     Idempotent seed
public/uploads/     Local image storage
```

## Assumptions

- Default currency is USD; seasonal % discount applies to products flagged `seasonal` when the offer is active.
- Online payment is intentionally abstracted as “order request / payment pending” until a provider is configured.
- Seed imagery uses Unsplash remote URLs; configure `NEXT_IMAGE_REMOTE_HOSTS` accordingly. Prefer replacing with local uploads in admin for production.
- First-session cinematic intro plays once per browser session; respects `prefers-reduced-motion`.

## Deployment notes

1. Provide MongoDB (Atlas or self-hosted) and set `MONGODB_URI`.
2. Set a strong unique `AUTH_SECRET`.
3. Mount a persistent volume for `public/uploads` (or change the upload layer).
4. Set `NEXT_PUBLIC_SITE_URL` to the production origin.
5. Run `npm run seed` once (or migrate content), then `npm run build && npm run start`.

## Brand contact (seed defaults)

- Email: luccicreno873@yahoo.com  
- Phone: 7174250354  
- Social: LUCCICRENO  

Editable anytime under **Admin → Settings**.
