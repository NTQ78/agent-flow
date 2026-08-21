---
description: Deploy — ask the target first (IIS/Vercel/other), backup, confirmed migration, smoke test, changelog
argument-hint: REQ-ID (empty = newest verified ticket)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Ticket: $ARGUMENTS — if empty, take the newest ticket with `status: verify`.

## 0. Hard gate — no exceptions

Read `00-request.md`. If `status` is not `verify`, or `03-verify/report.md` still has failing
items: **STOP**. Print the reason and what needs doing. Do not deploy. There is no override flag.

If `needs_approval: true` and the ticket records no sign-off: **STOP** as well.

## 1. Ask for the deploy target

**Always ask; never assume.** The same ticket may go to internal IIS or to Vercel. Offer the
options with their consequences:

- **Internal IIS** — using the server/site/app-pool details declared in `.claude/flow.md`
- **Vercel** — standalone FE project; ask preview or production, and which project
- **Other / prepare artifact only** — build into a folder and print the manual step checklist

If `.claude/flow.md` does not declare the matching target, ask for the missing details and offer
to add them to that file — so the next run does not have to ask.

## 2. Back up before touching data

If the ticket has a migration or a data-fixing script: back up the database first. For an internal
SQL Server project, the backup path is declared in `.claude/flow.md`. Record the backup file path
in `04-deploy.md` **before** running anything.

No successful backup means no migration.

## 3. Build the artifact

Build the FE and publish the BE using the commands in `.claude/flow.md`. If the build is blocked
because a running process is holding the DLLs, handle it the way the traps section of
`.claude/flow.md` prescribes — do not kill the user's processes on your own initiative.

## 4. Migration — stop and confirm

Before running a migration, print:

- the migration name and **the SQL it will execute**
- the target database, with an explicit warning if dev and production **share one database**
  (the change hits both immediately)
- the backup path just created

Then **stop and ask for confirmation.** Run only on an explicit yes.

## 5. Deploy

Execute against the chosen target. IIS: copy the artifact, restart the app pool. Vercel: deploy to
the chosen environment.

## 6. Smoke test

- Open the main page, log in
- Call a few critical endpoints, plus this ticket's new endpoint
- Visit the affected screen and capture a screenshot into `03-verify/`
- **Diagnose correctly:** on IIS, a `500.31` (missing runtime/assembly) surfaces in the browser as
  a CORS error. If a "CORS error" appears after deploy, read the IIS response body before changing
  any CORS configuration — changing CORS will fix nothing.

A failing smoke test means rolling back per §7, not leaving it as is.

## 7. Rollback notes

Write into `04-deploy.md` **as soon as the deploy finishes**, not when it is needed:

- the previous version/commit or artifact, and where it is
- the database backup file path
- the exact commands to go back: restore files, restore DB, restart the app pool
- whether this migration is reversible (if not, say so)

## 8. After deploying

- Set `status: done`, record the deploy date and target in the frontmatter
- **Bilingual changelog** for end users, written into `04-deploy.md`: English first, then
  Vietnamese. Written for HR staff, no technical vocabulary, stating what is new and what they now
  need to do differently.

Print a summary: deploy target, whether the migration ran, smoke test result, backup path,
changelog path.
