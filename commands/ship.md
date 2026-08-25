---
description: Deploy — ask the target first (IIS/Vercel/other), backup, confirmed migration, smoke test, changelog
argument-hint: (empty = every verified ticket in this project) | REQ-ID [REQ-ID ...]
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Batch: $ARGUMENTS — if empty, take **every** ticket in this project with `status: verify`. One
deploy ships them all, because their code is already in the same build; shipping one while
leaving the others open would push their work out with nobody closing the ticket.

Print the batch before doing anything — REQ-ID, title, whether it carries a migration — and ask
which to drop, if any.

## 0. Hard gate — no exceptions, across the whole batch

For **every** ticket in the batch, read `00-request.md`. If any has `status` other than `verify`,
or a `03-verify/report.md` with failing items, or `needs_approval: true` with no sign-off
recorded: **STOP the whole deploy**. Print which ticket and why. There is no override flag.

One ticket short of verified blocks the release, because the build already contains its code.

## 1. Ask for the deploy target

**Always ask; never assume.** A batch may go to internal IIS or to Vercel. The options and their
consequences:

- **Internal IIS** — server/site/app-pool from `.claude/flow.md`
- **Vercel** — standalone FE project; ask preview or production, and which one
- **Other** — build into a folder and print the manual checklist

If `.claude/flow.md` does not declare the target, ask for what is missing and offer to add it
there, so the next run need not ask.

## 2. Back up before touching data

If the ticket has a migration or a data-fixing script: back up the database first. For an internal
SQL Server project, the backup path is declared in `.claude/flow.md`. Record the backup file path
in the release file **before** running anything.

No successful backup means no migration.

## 3. Build the artifact

**Run the project's full declared check set once, across the whole batch**, before building. The
tickets were verified on the confined set (`/c` §1); this is where a release pays the difference,
once rather than once per ticket. A failure here stops the deploy like any other gate.

Then build the FE and publish the BE using the commands in `.claude/flow.md`. If a running process
is holding the DLLs, follow that file's traps section — never kill the user's processes.

## 4. Migration — stop and confirm

Before running a migration, print:

- the migration name and **the SQL it will execute**
- the target database, warning explicitly if dev and production **share one** (it hits both)
- the backup path just created

Then **stop and ask for confirmation.** Run only on an explicit yes.

## 5. Deploy

Execute against the chosen target. IIS: copy the artifact, restart the app pool. Vercel: deploy to
the chosen environment.

## 6. Smoke test

- Open the main page, log in
- Call a few critical endpoints, plus the new endpoint of each ticket in the batch
- Visit the affected screen and capture a screenshot into `03-verify/`
- **Diagnose correctly:** on IIS, a `500.31` (missing runtime/assembly) surfaces in the browser as
  a CORS error. If a "CORS error" appears after deploy, read the IIS response body before changing
  any CORS configuration — changing CORS will fix nothing.

A failing smoke test means rolling back per §7, not leaving it as is.

## 7. Rollback notes

Write into `releases/<YYYY-MM-DD>-NN.md` **as soon as the deploy finishes**, not when needed:

- the previous version/commit or artifact, and where it is
- the database backup file path
- the exact commands to go back: restore files, restore DB, restart the app pool
- whether this migration is reversible (if not, say so)

## 8. Record friction

First, from this stage: a deploy step you had to work out that `flow.md` should have declared
(`missing-fact`, applied to `flow.md`), or a safety step that turned out to be missing
(`missing-rule` or `wrong-gate`).

Second, a look back over each ticket — `02-build-log.md` and `03-verify/report.md` already record
the divergences, out-of-scope fixes and untested cases. Distil what the stages missed; do not
re-observe.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more, print
one line: `N unpromoted friction entries — run /retro`. Nothing else; not the moment to act.

## 9. After deploying

Write the release file `releases/<YYYY-MM-DD>-NN.md` (NN = sequence for that day in this
project): target, date, every ticket in the batch, the migration that ran, backup path, rollback
notes from §7, and **one bilingual changelog** covering the whole release — English first, then
Vietnamese, written for the people who use the app, no technical vocabulary.

Then, on **each** ticket in the batch: set `status: done` and `release: <YYYY-MM-DD>-NN`.

Print a summary: target, tickets closed, whether the migration ran, smoke test result, and the
release file path.
