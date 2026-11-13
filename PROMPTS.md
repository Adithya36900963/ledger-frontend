# AI development log

AI assistance is allowed for this assessment. This is a transparent retrospective of prompts in the project conversation. The original message timestamps were not preserved in the repository, so these entries are dated when recorded, not backdated to imply a longer coding history. Continue adding entries as work happens. Commit links below refer to real local commits; they are viewable only when the repository is public and those commits are pushed.

## 2026-11-10 — Connect frontend services to Ledger API (retrospective)

- **What I asked:** “now connect backend to frontend” and requested separate services and hooks.
- **What the tool produced:** Typed API modules for auth, accounts, transactions, ledger, and admin operations, with React hooks for session and data loading.
- **What was incomplete:** The first frontend structure did not yet separate backend calls from screen components, making API behavior harder to trace.
- **What I changed instead:** API calls were organized under `src/services`, shared response types under `src/types`, and view state under `src/hooks`.
- **Commit:** [66be5aa — typed Ledger API services](https://github.com/Adithya36900963/ledger-frontend/commit/66be5aa).

## 2026-11-10 — Keep sample data out of live transactions (retrospective)

- **What I asked:** “now add some dummy data”.
- **What the tool produced:** Sample account, transaction, user, ledger, and audit fixtures for a demo workspace.
- **What was incomplete:** Sample data could be mistaken for live backend data unless the demo path was clearly isolated.
- **What I changed instead:** Demo state is labeled in the UI and transaction/user actions stay in browser memory; the README says the demo is local-only.
- **Commit:** [e311037 — role-aware session and demo data hooks](https://github.com/Adithya36900963/ledger-frontend/commit/e311037).

## 2026-11-10 — Make account-holder, auditor, and admin access explicit (retrospective)

- **What I asked:** Admin creates account holders and auditors, and each role can log in.
- **What the tool produced:** Separate role-aware login and dashboards, admin provisioning screens, and an auditor workspace.
- **What was incomplete:** A role selector or hidden frontend screen alone would not enforce access control.
- **What I changed instead:** The frontend was connected to role-specific API routes, and the backend checks actor role and account ownership. The backend authorization tests cover auditor denials for account opening, withdrawal, and holder-only ledger history.
- **Commit:** [b3b3c25 — admin and auditor workspaces](https://github.com/Adithya36900963/ledger-frontend/commit/b3b3c25). Backend test file: `P:\ledger\src\test\java\snovasys\ledger\LedgerRoleAccessTests.java`.

## 2026-11-10 — Show ledger activity and audit views (retrospective)

- **What I asked:** Build LedgerLine around auditable money movement and connect the auditor/admin screens.
- **What the tool produced:** Ledger-entry, audit-event, and integrity panels that load through the API services.
- **What was incomplete:** The live API and deployment were unavailable in this environment, so working UI components could not be presented as verified live audit evidence.
- **What I changed instead:** The UI reports API loading/errors, and the README explicitly says live behavior still needs a configured backend and database check.
- **Commit:** [b3b3c25 — admin and auditor workspaces](https://github.com/Adithya36900963/ledger-frontend/commit/b3b3c25).

## 2026-11-10 — Clarify role pages are not the security boundary (retrospective)

- **What I asked:** Apply the assessment criteria to the actual code and repository files first.
- **What the tool produced:** A check of role boundaries, plus documentation that distinguishes frontend navigation from backend authorization.
- **What was incomplete:** The frontend README did not clearly say that backend authorization is authoritative or that demo mode is not live authentication.
- **What I changed instead:** Added that explanation and the local build-check commands to the README; added auditor-denial tests in the backend.
- **Commit:** [089bca4 — record AI-assisted development notes](https://github.com/Adithya36900963/ledger-frontend/commit/089bca4). The backend test is not in this frontend repository.

## 2026-11-10 — Add navigable and lazy-loaded role routes

- **What I asked:** “use in frontend here please use navigate and routs and lazy loading and react optimzation”.
- **What the tool produced:** Added `/login`, `/verify`, `/account`, `/admin`, and `/auditor` routes; role guards and redirects; `navigate` after login/demo entry; lazy page imports; dashboard memoization; stable callbacks; and Netlify/Vercel SPA fallback files.
- **What was wrong:** The prior app selected dashboards directly from auth state and the sidebar used a hash link, so screens did not have role-aware URLs or route-level code splitting.
- **What I changed instead:** Moved page selection into React Router, redirected unauthorized or unverified sessions, split role dashboards into lazy chunks, and stabilized data/action callbacks to avoid avoidable renders. Production build passed and lint is clean.
- **Commits:** [7f39ab6 — role-aware routes and lazy-loaded pages](https://github.com/Adithya36900963/ledger-frontend/commit/7f39ab6) and [22496c5 — stabilize session and data callbacks](https://github.com/Adithya36900963/ledger-frontend/commit/22496c5).

## 2026-11-13 — Open recipient chats and confirm transfers securely (retrospective)

- **What I asked:** Entering an account number in Make a transaction should open a chat for that account; entering an amount and pressing Pay should request MPIN and avoid duplicate transactions.
- **What the tool produced:** Account-number navigation, recipient name lookup, a chat composer, MPIN confirmation dialog, and idempotency-key requests connected to the backend. Transaction history refreshes after a successful transfer.
- **What needed correction:** The initial version put the MPIN field directly beside the amount. I clarified the desired sequence: recipient chat, amount, Pay, MPIN confirmation, then secure payment.
- **What I changed instead:** Kept the amount composer at the bottom of the chat and moved MPIN entry to a separate confirmation dialog. The idempotency key is tied to the confirmation attempt so retrying that request does not post a second ledger transfer.
- **Verification and limits:** `npm run lint` and `npm run build` passed on 2026-11-13. The demo flow uses in-memory sample data and does not prove backend persistence. The frontend currently has additional local modifications; review `git status` before deciding what to commit or submit.
- **Commit:** [46cca47 — transfer chat confirmation](https://github.com/Adithya36900963/ledger-frontend/commit/46cca47). The follow-up UI edits visible in the current working tree were not included in that commit at the time this note was written.
