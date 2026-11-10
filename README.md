# LedgerLine frontend

React and TypeScript frontend for the LedgerLine Spring Boot API in `P:\ledger`.

## Run locally

The frontend expects the backend at `http://localhost:8080` by default.

```powershell
npm install
npm run dev
```

On the sign-in screen, **Preview with sample data** opens a local demo workspace. Demo transactions and user creation stay in browser memory; the demo never sends ledger writes to the backend.

To point the frontend at a different backend, set `VITE_API_URL` in a local `.env` file:

```env
VITE_API_URL=http://localhost:8080
```

The browser sends the backend's HttpOnly JWT cookie with API calls. The backend must allow the frontend origin in its credentialed CORS configuration.

## Source layout

```text
src/
  components/
    account/       Account overview, balance, transaction form, recent activity
    admin/         User provisioning, directory, role permissions
    auditor/       Read-only ledger, integrity, and audit workspace
    auth/          Role-aware sign-in and account verification pages
    common/        Shared brand, cards, tables, panels, and feedback
  hooks/           Session, verification, account, transaction, ledger history, audit, and admin data
  mocks/           Clearly labeled demo account, transaction, user, and audit fixtures
  services/        HTTP client and backend API modules
  types/           Shared API and domain types
  App.tsx          Role-based page composition
```

## Connected API routes

- Sign in: `/api/users/auth/admin/login`, `/api/users/auth/ACCOUNT_HOLDER/login`, `/api/users/auth/auditor/login`
- Sign out: `/api/users/auth/logout`
- Session and verification: `/api/users/auth/me`, `/api/users/auth/email`, `/api/users/auth/mobile`
- Admin creates an account holder or auditor: `POST /api/users/auth/register`
- Admin user directory: `GET /api/admin/users`
- Admin opens the new account holder's ledger account: `POST /api/ledger/accounts`
- Account holder loads their account: `GET /api/ledger/accounts/me`
- Account holder submits transactions: `POST /api/ledger/deposits`, `/api/ledger/withdrawals`, `/api/ledger/transfers`
- Account holder history: `GET /api/ledger/entries/me`, `/api/ledger/audit-events/me`
- Admin/auditor history and integrity: `GET /api/audit/ledger-entries`, `/api/audit/events`, `/api/audit/integrity`
- Backend health: `/api/health/live`, `/api/health/ready`

The frontend sends the backend's HttpOnly JWT cookie with API calls. Account-holder activity, the admin directory, audit tables, ledger lines, and ledger-integrity card load from the backend. The demo workspace uses separate local fixtures and never submits financial writes to the API.

Role-specific pages improve navigation, but they are not the authorization boundary. The Spring Boot API enforces roles and account ownership on protected requests. Do not treat the local demo workspace as authentication or as evidence that the live backend is working.

## Client routes and loading

- `/login` — sign-in and local demo entry
- `/verify` — required verification for signed-in users who have not completed both checks
- `/account` — account-holder workspace
- `/admin` — administrator user-management and ledger workspace
- `/auditor` — read-only audit workspace

Role guards redirect users away from routes they are not allowed to view. Dashboard and authentication screens are lazy-loaded, and account callbacks and dashboard components use memoization where it prevents avoidable re-renders. Static hosts must serve `index.html` for these client routes; `public/_redirects` and `vercel.json` include the SPA fallback for Netlify and Vercel.

## Build checks

```powershell
npm run lint
npm run build
```
