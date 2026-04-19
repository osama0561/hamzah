# Hamzah.sa — Financing Calculator MVP

Internal financial eligibility calculator for **Hamzah.sa** (Saudi real-estate financing brokerage).
Built by **نهر AI (Nahrai)**.

**Scope (MVP):** single bank (Saudi Fransi), single product (شراء وحدة جاهزة), active-employee path only.
Retired path, liabilities, service stops, owner surplus, PDF/Excel export, AI explainability layer, and multi-bank/multi-product support are **Phase 2** — out of scope.

---

## Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + tailwindcss-rtl plugin
- react-hook-form + zod
- NextAuth (Credentials provider)
- Vitest for the policy engine
- Deploy target: Vercel

## Quick start (local)

```bash
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET and SEED_USER_PASSWORD_HASH (see below)
npm install
npm test            # runs the CEO acceptance test — must pass before deploy
npm run dev         # http://localhost:3000
```

### Generate a seed password hash

```bash
node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD_HERE', 10))"
```

Paste the output as `SEED_USER_PASSWORD_HASH` in `.env.local`.

### Generate `NEXTAUTH_SECRET`

```bash
openssl rand -base64 32
```

## Environment variables

| Var                       | Purpose                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| `NEXTAUTH_SECRET`         | NextAuth JWT signing secret                                             |
| `NEXTAUTH_URL`            | Public URL of the deployment (e.g. `https://hamzah-mvp.vercel.app`)     |
| `SEED_USER_EMAIL`         | Single-user login email for the MVP                                     |
| `SEED_USER_PASSWORD_HASH` | Bcrypt hash of the seed password                                        |
| `ALLOWED_IPS`             | Comma-separated IPv4/IPv6 allowlist. Leave empty to disable IP check    |
| `ALLOWED_HOURS_START`     | `HH:MM` Asia/Riyadh. Leave empty to disable time check                  |
| `ALLOWED_HOURS_END`       | `HH:MM` Asia/Riyadh. Use `22:00` etc.                                   |

## Deploying to Vercel

1. Import the repo in Vercel.
2. Set every env var from the table above in the Vercel project settings.
3. Set `NEXTAUTH_URL` to the production domain (e.g. `https://hamzah-mvp.vercel.app`).
4. Deploy. First login will set a `hamzah_device_id` cookie; subsequent requests verify it.

## Architecture

```
hamzah-mvp/
├── app/
│   ├── layout.tsx              # RTL + Tajawal font + SessionProvider
│   ├── page.tsx                # redirect to /calculator or /login
│   ├── login/page.tsx          # credentials login
│   ├── calculator/page.tsx     # server-auth-guarded shell
│   └── api/auth/[...nextauth]/route.ts
├── components/
│   ├── CalculatorClient.tsx    # client shell; owns result state
│   ├── CalculatorForm.tsx      # react-hook-form + zod
│   └── ResultsPanel.tsx        # per-phase cards + explanations
├── lib/
│   ├── auth.ts                 # NextAuth credentials config
│   ├── utils.ts                # SAR / percent formatters (Arabic locale)
│   └── policy/
│       ├── types.ts
│       ├── constants.ts        # all tunable policy values in one place
│       ├── derived.ts          # age, service years, pension salary
│       ├── stages.ts           # merged / pre-retirement / post-retirement
│       ├── calculate.ts        # single entry point
│       └── __tests__/calculate.test.ts
└── middleware.ts               # IP + time + device fingerprint
```

## Acceptance test

`lib/policy/__tests__/calculate.test.ts` codifies the CEO's hand-calculated
example as the single source of truth for the calculation engine. **Must pass
before every deploy.** Run with:

```bash
npm test
```

---

## ⚠️ Open questions — confirm before shipping to CEO

1. **17% personal-loan discount rate.** The CEO's manual example implies this
   value (297,000 gross × 0.83 ≈ 247,000 net) but does not state it
   explicitly. Captured as `POLICY.PERSONAL_DISCOUNT_RATE` in
   `lib/policy/constants.ts`. **Confirm with CEO before the demo.**
2. **Current year.** The CEO's example uses Hijri (1397, 1420). For MVP the
   `currentYear` is a user input, defaulting to 1447 — confirm the year to use
   on the day of the demo.
3. **Seed credentials.** `SEED_USER_EMAIL` / `SEED_USER_PASSWORD_HASH` — Osama
   to generate and share with the CEO.
4. **Office IP.** `ALLOWED_IPS` — Osama to capture the CEO's office public IP
   before deploy.

If any of the above are unresolved, **do not deploy**.

## Pension-total rounding note

CEO's manual sheet: 14,892 × 0.55 = 8,190.6 ≈ **8,190**; 8,190 × 180 =
**1,474,200**. His sheet also wrote 1,472,000 — a typo. Our engine uses the
precise value (14,892.5 × 0.55 × 180 = **1,474,357.5**), which is within ~160
SAR of the CEO's 1,474,200. The final financing value stays within 0.5% of
his 1,085,648.

## Security posture (MVP)

The app is locked down via `middleware.ts`:

- NextAuth session required for every non-public route.
- IP allowlist (`ALLOWED_IPS`).
- Time-of-day window in Asia/Riyadh (`ALLOWED_HOURS_START/END`).
- Device fingerprint cookie set on first authed request.
- All denials return 403 with a generic Arabic message — no detail is leaked
  about which check failed.

No database, no analytics, no third-party scripts. Calculation history is not
persisted.

## Phase 2 (flagged, not built)

- Liabilities management, service stops, owner-check surplus
- PDF / Excel export
- AI agent / explainability layer
- Multi-bank, multi-product, retired scenarios
- Calculation history persistence
