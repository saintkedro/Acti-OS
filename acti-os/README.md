# ACTI OS

Digital operating system for **Amana College of Technology and Innovation (ACTI)**.

Phase 1 MVP: public website, online admissions, bank-transfer payments with unique references, student enrollment, admin dashboard, and notifications.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Postgres, Storage)
- Bank transfer payments (Paystack can be added later)
- Vercel (`acti.edu.ng`)

## Setup

### 1. Install

```bash
cd acti-os
npm install
cp .env.local.example .env.local
```

### 2. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy Project URL, anon key, and service role key into `.env.local`.
3. Apply the migration in `supabase/migrations/20260325000000_phase1_schema.sql` via the SQL editor, or:

```bash
npx supabase link --project-ref <your-ref>
npx supabase db push
```

4. In Authentication settings, disable email confirm for local testing if desired.
5. Sign up at `/signup`, then promote yourself:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

### 3. Bank transfer payments

Set these in `.env.local`:

```env
BANK_NAME=...
BANK_ACCOUNT_NAME=...
BANK_ACCOUNT_NUMBER=...
```

Flow:

1. Applicant generates a unique reference (e.g. `ACTI-APP-8F3K2Q`).
2. They transfer the fee and put the reference in the bank narration.
3. Admin opens **Payments** and clicks **Confirm received** when the transfer appears.
4. Confirmation submits the application or enrolls the student (same settlement logic as before).

### 4. Email (optional)

Set `RESEND_API_KEY` and `EMAIL_FROM` for email notifications. In-app notifications work without it.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Phase 1 journeys

1. Applicant signs up → completes application → uploads docs → gets bank reference → admin confirms fee → submitted.
2. Admin reviews → offer / reject / waitlist.
3. Offered applicant pays acceptance fee by transfer → admin confirms → receives `ACTI/YYYY/#####` student ID → student portal.

## Deploy (Vercel)

The Next.js app lives in the **`acti-os/`** folder of the GitHub repo.
If [https://acti-os.vercel.app](https://acti-os.vercel.app) shows platform `404: NOT_FOUND`,
Root Directory is wrong or the last deploy failed.

1. Import / open project for `saintkedro/Acti-OS`.
2. **Settings → Build and Deployment → Root Directory** → `acti-os` → Save.
3. Framework: **Next.js**. Redeploy.
4. Add env vars (same as `.env.local`):

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes |
| `SUPABASE_SERVICE_ROLE_KEY` | yes |
| `NEXT_PUBLIC_APP_URL` | yes — `https://acti-os.vercel.app` first, later `https://acti.edu.ng` |
| `BANK_NAME` / `BANK_ACCOUNT_NAME` / `BANK_ACCOUNT_NUMBER` | yes |
| `RESEND_API_KEY` / `EMAIL_FROM` | optional |

5. Point DNS for `acti.edu.ng` when ready.

Ensure Phase 1 SQL is applied on the Supabase project those keys use.

## Default fees (seed)

| Fee | Amount |
|-----|--------|
| Application | ₦5,000 |
| Acceptance | ₦25,000 |
| Tuition (placeholder) | ₦50,000 |

Adjust in `fee_schedules` as needed.
