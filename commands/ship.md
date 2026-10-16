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

**Claim the batch first.** A card whose release block already reads `in progress` from a live
session (ListAgents) stops the run — join that release. Otherwise write `Release <id> in progress,
<session>` as each card's release block now; §1 overwrites it. A peer's card mid-build in the same
tree, above all with a generated migration, blocks the artifact: name it and stop.

**Then look outside the batch, because the column is a claim and the build is a fact.** Every
other card whose build block names files that exist in the repo is shipping with you (§2). For
each: either it joins the batch and gets verified, or you **name it in the release block** under
"rode along unverified". Silence is forbidden.

**A build block is not the only way code gets in.** Diff the repo against the last release's
commit: any source file no card's build block names ships as surely as the rest — name it. Then
read the base config the artefact carries **block by block**: an environment-specific value
living in the base file needs an override on the target, named in the release block. **The tree
can also be BEHIND production:** HEAD missing a commit the live build has is a hard stop. After a
pull or merge, a clean merge is not evidence — for each file both sides touched, show both hold.

## 1. Close the cards

**Run the project's full declared check set once, across the whole batch**, one suite at a time,
output to a file before any filter. The cards were verified on the confined set (`/c` §1); this is
where a release pays the difference, and a failure stops the run like any other gate.

Then, for each card, write the release block and close it: `LF section <card> release --file
<scratch.md>`, `LF move <card> Done`, `LF tick <card> Ship`.

The release block records: the date, every card in the batch, anything riding along unverified,
whether a migration is pending, and **one bilingual changelog** for the whole release — English
first, then Vietnamese, for the people who use the app, no technical vocabulary. **Done means
finished and verified, not deployed** — leave the deploy line reading `Deploy: not yet` until §2
settles it, then rewrite the block with what happened.

## 2. Deploy — ask, do not assume

Now ask the user which of three: **deploy now** (run §3–§7), **deploy by hand** (print the exact
commands and the checklist, touch nothing), or **do not deploy** (stop here). More than one deploy
path, or one that already ran (push-to-deploy, a migration applied at `/s`)? Name the window each
leaves production in, inside the question.

Whichever they pick, **rewrite the release block to say so**, naming the target if one was used.
A card in Done whose block does not say whether it is live is the one thing this command must
never produce — re-read every block at the end; a leftover `not yet` means unfinished.

## 3. Target, backup, artifact

**Always ask for the target; never assume.** IIS — server/site/app-pool from `.claude/flow.md`;
Vercel — preview or production, and which project; other — build into a folder and print the
checklist. If `flow.md` declares neither the target *nor how the artifact reaches it*, ask and
record the answer there.

A migration or a data-fixing script means **back up first**, to the path `flow.md` declares,
recorded in the release block **before** anything runs. No backup, no migration; a waiver is said
once, in the block. **Keep the files being replaced too** — zip the target's folders (or the
previous artifact) before the first copy; publishing over them destroys the rollback point.

Then build the FE and publish the BE per `flow.md`; never kill a user process holding the DLLs.

## 4. Migration — stop and confirm

Before running a migration, print its name and **the SQL it will execute**, the target database
(warning if dev and production **share one** — it hits both), and the backup path just created.
Then **stop and ask.** Run only on an explicit yes.

## 5. Deploy and smoke test

Execute against the chosen target. Then:

- Log in, visit each affected screen, screenshot into the card's folder
- Call a few critical endpoints, plus the new endpoint of each card. **Prove the build is the NEW
  one** — hit a route only this batch added; a healthy old build answers 200 too

A failing smoke test means rolling back per §6, not leaving it as is.

## 6. Rollback notes

Write into the release block **as soon as the deploy finishes**, not when needed: the previous
version/commit or artifact and where it is, the database backup path, and the exact commands to go
back — **per deploy path**, saying whether undoing one half alone is safe. Split **code** from
**data**: what the previous build does with values the new one wrote (a new stored status word, a
backfill), whether the migration reverses, and which backup alone restores the rest.

## 7. Record friction and close out

First, from this stage: a deploy step `flow.md` should have declared (`missing-fact`, applied
there), or a missing safety step (`missing-rule`/`wrong-gate`). Second, look back over each card's
build and verify blocks and distil what the stages missed; do not re-observe.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more,
print one line: `N unpromoted friction entries — run /retro`. Nothing else.

Print: cards closed with their links, whether a deploy ran and to where, whether the migration
ran, and the smoke test result.
