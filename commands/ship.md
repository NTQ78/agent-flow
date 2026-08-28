---
description: Deploy — ask the target first (IIS/Vercel/other), backup, confirmed migration, smoke test, changelog
argument-hint: (empty = every verified ticket in this project) | REQ-ID [REQ-ID ...]
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Batch: $ARGUMENTS — if empty, take every ticket sharing the **oldest unshipped `release`**, and
if no ticket carries one, every ticket at `verify` (and say you fell back). A batch is a group
somebody chose, not a coincidence of timing.

Print the batch before doing anything — REQ-ID, title, whether it carries a migration — and ask
which to drop, if any.

## 0. Hard gate — no exceptions, across the whole batch

For **every** ticket in the batch, read `00-request.md`. If any has `status` other than `verify`,
or a `03-verify/report.md` with failing items or an unanswered escalation, or `needs_approval:
true` with no sign-off: **STOP the whole deploy**. Name the ticket and why. No override flag.

**Then look outside the batch, because `status` is a claim and the build is a fact.** Every other
ticket in this project whose `02-build-log.md` names files that exist in the repo is shipping with
you (CONVENTIONS §2, effective state). For each: either it joins the batch and gets verified, or
you **name it in the release file** under "rode along unverified" with what it touches. Silence is
the one thing this step forbids — on 2026-08-28 four such tickets reached production unrecorded.

**Migrations answer to the same rule.** Run `dotnet ef migrations list` (or the project's
equivalent) against the target and check that every pending migration belongs to a ticket in the
batch. One that does not is an unverified schema change riding a verified release.

## 1. Ask for the deploy target

**Always ask; never assume.** **Internal IIS** — server/site/app-pool from `.claude/flow.md`;
**Vercel** — ask preview or production, and which project; **other** — build into a folder and
print the manual checklist. If `flow.md` does not declare the target *or how the artifact reaches
it* — paths, app-pool names, copy mechanism — ask, and add the answer there so the next run need
not.

## 2. Back up before touching data

If any ticket carries a migration or a data-fixing script: back up first, to the path `flow.md`
declares, and record it in the release file **before** running anything. No successful backup means
no migration — and if the requester waives it, say so once, in the release file, and proceed.

## 3. Build the artifact

**Run the project's full declared check set once, across the whole batch**, before building — the
tickets were verified on the confined set (`/c` §1) and this is where a release pays the
difference. A failure here stops the deploy like any other gate. Then build the FE and publish the
BE per `flow.md`; if a running process holds the DLLs, follow its traps — never kill user
processes.

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
- Call a few critical endpoints, plus the new endpoint of each ticket in the batch. **Prove the
  build is the NEW one** — hit a route only this batch added; a healthy old build answers 200 too
- Visit the affected screen, screenshot into `03-verify/`
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
(`missing-fact`, applied there), or a safety step that was missing (`missing-rule`/`wrong-gate`).
Second, a look back over each ticket — the build logs and verify reports already record the
divergences and untested cases. Distil what the stages missed; do not re-observe.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more, print
one line: `N unpromoted friction entries — run /retro`. Nothing else; not the moment to act.

## 9. After deploying

Write `releases/<YYYY-MM-DD>-NN.md` (NN = that day's sequence in this project): target, date,
every ticket, the migration that ran, backup path, anything that rode along unverified (§0),
rollback notes from §7, and **one bilingual changelog** for the whole release — English first,
then Vietnamese, for the people who use the app, no technical vocabulary.

Then on **each** ticket: `status: done`, `release: <YYYY-MM-DD>-NN`. **That release id is now
sealed** — a later ticket gets the next one, never this.

Print a summary: target, tickets closed, whether the migration ran, smoke test result, and the
release file path.
