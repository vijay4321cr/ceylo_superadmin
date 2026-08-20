# Ceylo — Partner Onboarding & Admin Console

Two surfaces for **Sri Lanka**, built against `CEYLO_ONBOARDING_ADMIN_BUILD.md`:

1. **Ceylo admin console** (`/admin`) — the staff surface. Talks to the real Ceylo backend.
2. **Partner onboarding** (`/onboarding`) — the applicant wizard. Mobile-first, trilingual
   (Sinhala · Tamil · English). Captures a draft locally; submission is not connected yet.

**There is no mock data anywhere.** A screen either shows what the backend returned, or it
declares itself unbuilt and names the endpoints it needs. Nothing is invented to fill space.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run lint
npm run check      # offline unit checks (see checks/)
npm run api:smoke  # read-only end-to-end check against the live backend
npm run api:stub   # optional local stand-in backend on :3002
```

---

## Start here

| | |
|---|---|
| `/` | Front door |
| `/admin/login` | Sign in with a phone that holds an admin role (see `NEXT_PUBLIC_DEV_OTP` in `.env.example`) |
| `/admin/approvals` | Approve partners who registered and submitted KYC |
| `/onboarding` | The applicant wizard |

New backend with no admin yet? On the login page use **Make an account admin** (you supply the
bootstrap secret), then **sign in again** — the role is baked into the JWT when it is issued, so
promoting an account does nothing for a token you already hold.

> **Security note.** No credentials are committed to this repo. If your backend accepts a fixed
> development OTP, or a guessable bootstrap secret, treat both as production credentials: anyone
> who learns them can sign in as any phone number and promote themselves to `super_admin`. Disable
> the fixed code and rotate the bootstrap secret before the backend is reachable publicly.

---

## What is actually connected

The backend is `https://ceylo-backend.onrender.com/api/v1` (override with `CYLO_API_ORIGIN`).
Four screens are live; the rest of the information architecture is present but unbuilt.

| Screen | Endpoint |
|---|---|
| **Sign in** | `POST /auth/otp/send` · `POST /auth/otp/verify` · `POST /auth/refresh` · `POST /admin/bootstrap` |
| **Partner approvals** | `GET /admin/partners/kyc` · `POST /admin/partners/:id/kyc/approve` · `.../reject` |
| **Event moderation** | `GET /admin/events/moderation` · `POST /admin/events/:id/approve` · `.../reject` |
| **Users** | `GET /admin/users` |
| **Overview** | `GET /admin/analytics/overview` |

Everything else — settlements, payouts, refunds, commissions, listings and review moderation,
collections, banners, featured slots, coupons, campaigns, tickets, fraud, audit logs, analytics,
staff, catalog, the application queue, the partner directory and document expiry — renders a
**Not connected yet** page that states what the screen is for and lists the endpoints the API
would need. Those items carry a `Soon` chip in the nav, so the gap is visible before you click.

That is 23 screens waiting on the API and 5 working, which is an honest picture of where the
backend is rather than a demo that looks finished.

---

## How auth works

One sign-in, one token. The token that authenticates API calls is the same token that opens the
console — there is no separate demo persona any more.

- Requests go to `/cylo-api/*` on this app's own origin, and the route handler at
  `src/app/cylo-api/[...path]/route.ts` forwards them to `CYLO_API_ORIGIN`. Same-origin, so the
  backend needs no CORS entry and the bearer token never crosses an origin boundary. Seeing the
  app's own host in devtools is expected — the upstream call happens server-side.
  Set `NEXT_PUBLIC_API_BASE_URL` to skip the proxy and call the API directly (CORS then required).
  See `.env.example`.
  This was a `rewrites()` entry originally; it worked under `next dev` and `next start` but 404'd
  once deployed, so the proxy is now application code that ships with the app on any host.
- **Access tokens live 15 minutes.** The service refreshes an expired one via `POST /auth/refresh`
  and retries once, so a review session does not die mid-queue.
- **OTP resend is rate-limited to 30s**; the backend's own message is surfaced.
- The backend issues `customer`, `admin` or `super_admin` and nothing finer. Anything that is not
  an admin cannot open the console; both admin claims map to Super Admin. The five-role matrix in
  `staffRbac.ts` is the product design and is enforced in code, but it will not mean anything until
  the API carries a real staff role — `/admin/settings/roles` says so on the page.

---

## What is where

```
src/
  app/
    (admin)/admin/    staff console — guards on staffAuthStore
    (onboard)/        applicant wizard — own layout, no staff session
    fonts/            self-hosted Noto Sans Sinhala/Tamil + Bricolage
  components/
    ui/               Button, Field, DataTable, Modal, Toast, StatusBadge, Tile
    admin/            StaffShell, ComingSoon
    onboarding/       StepShell, ChecklistRail, DocUpload, RepeatList
  lib/
    api/client.ts     the only way to reach data — envelope, errors, timeouts
    services/
      ceyloApi.ts         every live backend call
      approvalNormalise.ts response mapping, dependency-free so it can be unit-checked
      onboardingService.ts local draft handling; submit reports it is unconnected
    staffRbac.ts      capability matrix, nav, and LIVE_ROUTES
    srilanka.ts       districts, provinces, banks, NIC/phone/BRN/TIN validators, doc matrix
    format.ts         the only money/date helper — LKR cents, Asia/Colombo
    settlement.ts     gross − commission + WHT = net, used by the onboarding rate preview
    i18n/             si/ta/en dictionaries, useT(), LanguageSwitcher
```

---

## Response shapes

The API contract documents request bodies but not responses, so `approvalNormalise.ts` maps flat,
nested and minimal shapes defensively and **never invents a value**. Every detail pane exposes the
**raw API response**, so an operator can always see the truth rather than only the mapped fields.
A verbatim row from the deployed backend is pinned in `checks/approvals.check.ts`, so a mapping
change that would break the real queue fails there first.

Live rows carry `kycStatus`, a nested `kyc` object and a `restaurant` block (name, area,
`listingStatus`) — but no document URLs and no contact email, so those render blank.

---

## Known gaps

- **The KYC schemas do not match.** The backend stores **FSSAI, GST, PAN and IFSC**; the onboarding
  wizard collects the Sri Lankan set — **BRN, TIN, VAT, NIC** and bank + branch codes. The approvals
  tab renders exactly what the API returns and says so on screen. Reconciling the two is a real
  outstanding decision.
- **Approve and reject have not been fired against the deployed backend** — doing so changes real
  partner records. They share the client and envelope handling of the reads, which are verified.
  Exercise them from the UI, or against `npm run api:stub` first.
- **Partner onboarding cannot submit.** It needs `POST /partner/register`, `POST /partner/restaurant`
  and `POST /partner/kyc/submit`. The wizard captures and persists the draft; the review screen says
  plainly that nothing was sent.
- **Sinhala and Tamil strings need a native-speaker review**, especially Inland Revenue terminology.
- **The merchant agreement text is a placeholder** and needs counsel-approved wording, with a version
  bump so signatures record which text was signed.
