---
description: Close verified cards — release block, move to Done, then offer deploy (optional)
argument-hint: card link | LF-N ... (empty = every card in Review)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Batch: $ARGUMENTS — if empty, every card in **Review** for this project. `LF` means
`node C:\Users\VNT\.claude\flow\lf.js`. Print the batch first — `LF-N`, title, whether it carries
a migration — and ask which to drop, if any.

## 0. Hard gate — no exceptions, across the whole batch

`LF get` each card. If any is **not in Review**, or its verify block has failing items or an
unanswered escalation, or it carries a `needs-approval` label with no sign-off: **STOP the whole
run.** Name the card and why. No override flag. This gate holds whether or not you go on to deploy.

**Then look outside the batch, because the column is a claim and the build is a fact.** Every
other card whose build block names files that exist in the repo is shipping with you (§2). For
each: either it joins the batch and gets verified, or you **name it in the release block** under
"rode along unverified". Silence is forbidden — on 2026-08-28 four such tickets reached
production unrecorded.

**A build block is not the only way code gets in.** Diff the repo against the last release's
commit: any source file no card's build block names ships as surely as the rest — name it. Then
read the base config the artefact carries **block by block**: an environment-specific value
living in the base file needs an override on the target, named in the release block. One pointed
every production punch at a host on a developer's laptop.

## 1. Close the cards

**Run the project's full declared check set once, across the whole batch.** The cards were
verified on the confined set (`/c` §1) and this is where a release pays the difference. A failure
here stops the run like any other gate.

Then, for each card, write the release block and close it: `LF section <card> release --file
<scratch.md>`, `LF move <card> Done`, `LF tick <card> Ship`.

The release block records: the date, every card in the batch, anything riding along unverified,
whether a migration is pending, and **one bilingual changelog** for the whole release — English
first, then Vietnamese, for the people who use the app, no technical vocabulary. **Done means
finished and verified, not deployed** — leave the deploy line reading `Deploy: not yet` until §2
settles it, then rewrite the block with what happened.

## 2. Deploy — ask, do not assume

Now ask the user which of three: **deploy now** (run §3–§7), **deploy by hand** (print the exact
commands and the checklist, touch nothing), or **do not deploy** (stop here).

Whichever they pick, **rewrite the release block to say so**, naming the target if one was used.
A card in Done whose block does not say whether it is live is the one thing this command must
never produce.

## 3. Target, backup, artifact

**Always ask for the target; never assume.** IIS — server/site/app-pool from `.claude/flow.md`;
Vercel — preview or production, and which project; other — build into a folder and print the
checklist. If `flow.md` declares neither the target *nor how the artifact reaches it*, ask and
record the answer there.

A migration or a data-fixing script means **back up first**, to the path `flow.md` declares,
recorded in the release block **before** anything runs. No backup, no migration; a waiver is said
once, in the block.

Then build the FE and publish the BE per `flow.md`. If a running process holds the DLLs, follow
its traps — never kill user processes.

## 4. Migration — stop and confirm

Before running a migration, print its name and **the SQL it will execute**, the target database
(warning if dev and production **share one** — it hits both), and the backup path just created.
Then **stop and ask.** Run only on an explicit yes.

## 5. Deploy and smoke test

Execute against the chosen target. Then:

- Open the main page, log in
- Call a few critical endpoints, plus the new endpoint of each card. **Prove the build is the NEW
  one** — hit a route only this batch added; a healthy old build answers 200 too
- Visit the affected screen, screenshot into the card's folder
- **Diagnose correctly:** on IIS a `500.31` surfaces in the browser as a CORS error. Read the
  response body before touching any CORS configuration — changing it will fix nothing

A failing smoke test means rolling back per §6, not leaving it as is.

## 6. Rollback notes

Write into the release block **as soon as the deploy finishes**, not when needed: the previous
version/commit or artifact and where it is, the database backup path, the exact commands to go
back (restore files, restore DB, restart the app pool), and whether the migration is reversible —
if it is not, say so.

## 7. Record friction and close out

First, from this stage: a deploy step you had to work out that `flow.md` should have declared
(`missing-fact`, applied there), or a safety step that was missing (`missing-rule`/`wrong-gate`).
Second, a look back over each card — the build and verify blocks already record the divergences
and untested cases. Distil what the stages missed; do not re-observe.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more,
print one line: `N unpromoted friction entries — run /retro`. Nothing else.

Print: cards closed with their links, whether a deploy ran and to where, whether the migration
ran, and the smoke test result.
