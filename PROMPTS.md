# AI development log

AI assistance is allowed for this assessment. This is a transparent retrospective of prompts in the project conversation. The original message timestamps were not preserved in the repository, so these entries are dated when recorded, not backdated to imply a longer coding history. Continue adding entries as work happens. Commit links below refer to real local commits and will work on GitHub only after the remote is private and those commits are pushed.

## 2026-11-10 — Connect frontend services to Ledger API (retrospective)

- **What I asked:** “now connect backend to frontend” and requested separate services and hooks.
- **What the tool produced:** Typed API modules for auth, accounts, transactions, ledger, and admin operations, with React hooks for session and data loading.
- **What was incomplete:** The first frontend structure did not yet separate backend calls from screen components, making API behavior harder to trace.
- **What I changed instead:** API calls were organized under `src/services`, shared response types under `src/types`, and view state under `src/hooks`.
- **Commit:** [66be5aa — typed Ledger API services](https://github.com/Adithya36900963/ledger-frontend/commit/66be5aa) (local only; push pending).

## 2026-11-10 — Keep sample data out of live transactions (retrospective)

- **What I asked:** “now add some dummy data”.
- **What the tool produced:** Sample account, transaction, user, ledger, and audit fixtures for a demo workspace.
- **What was incomplete:** Sample data could be mistaken for live backend data unless the demo path was clearly isolated.
- **What I changed instead:** Demo state is labeled in the UI and transaction/user actions stay in browser memory; the README says the demo is local-only.
- **Commit:** [e311037 — role-aware session and demo data hooks](https://github.com/Adithya36900963/ledger-frontend/commit/e311037) (local only; push pending).

## 2026-11-10 — Make account-holder, auditor, and admin access explicit (retrospective)

- **What I asked:** Admin creates account holders and auditors, and each role can log in.
- **What the tool produced:** Separate role-aware login and dashboards, admin provisioning screens, and an auditor workspace.
- **What was incomplete:** A role selector or hidden frontend screen alone would not enforce access control.
- **What I changed instead:** The frontend was connected to role-specific API routes, and the backend checks actor role and account ownership. The backend authorization tests cover auditor denials for account opening, withdrawal, and holder-only ledger history.
- **Commit:** [b3b3c25 — admin and auditor workspaces](https://github.com/Adithya36900963/ledger-frontend/commit/b3b3c25) (local only; push pending). Backend test file: `P:\ledger\src\test\java\snovasys\ledger\LedgerRoleAccessTests.java`.

## 2026-11-10 — Show ledger activity and audit views (retrospective)

- **What I asked:** Build LedgerLine around auditable money movement and connect the auditor/admin screens.
- **What the tool produced:** Ledger-entry, audit-event, and integrity panels that load through the API services.
- **What was incomplete:** The live API and deployment were unavailable in this environment, so working UI components could not be presented as verified live audit evidence.
- **What I changed instead:** The UI reports API loading/errors, and the README explicitly says live behavior still needs a configured backend and database check.
- **Commit:** [b3b3c25 — admin and auditor workspaces](https://github.com/Adithya36900963/ledger-frontend/commit/b3b3c25) (local only; push pending).

## 2026-11-10 — Clarify role pages are not the security boundary (retrospective)

- **What I asked:** Apply the assessment criteria to the actual code and repository files first.
- **What the tool produced:** A check of role boundaries, plus documentation that distinguishes frontend navigation from backend authorization.
- **What was incomplete:** The frontend README did not clearly say that backend authorization is authoritative or that demo mode is not live authentication.
- **What I changed instead:** Added that explanation and the local build-check commands to the README; added auditor-denial tests in the backend.
- **Commit:** Pending. This entry is being recorded as the next focused frontend documentation commit; the backend test is not in this frontend repository.
