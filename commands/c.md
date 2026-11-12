---
description: Verify — tests, builds, drive the real app, slop-test, code-review
argument-hint: card link | LF-N (empty = oldest card in In progress)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md` for test/build
commands and how to run the app.

Card: $ARGUMENTS — a link, or `LF-N`. If empty, `LF ls <project> --column "In progress"` and take
the oldest. `LF` means `node C:\Users\VNT\.claude\flow\lf.js`. `LF get <card>` first.

This command exists to catch **green tests over a broken app**. **The unit of verification is the
build block's file list, not the working tree** — a tree carrying unrelated uncommitted work has no
usable "current diff", so scope every file-level check and the review to that list.

## 1. Gates, scaled to reach

Scale them to what the change can reach, **not to the card's size label**: one line in a shared
component reaches forty files, a large leaf-page change reaches nothing. The build block's file
list decides the tier; the verify block says which and why.

**Wide** — a changed file is shared (UI primitives, `lib/`, hooks, i18n, config, an entry point),
or the card carries a migration or a BE change. Run the project's full declared set, one suite at a time.
**Confined** — every changed file is a leaf nothing else imports:

- **typecheck project-wide and unscoped** — the cheapest whole-app guarantee there is, and the one
  check that still sees the files this change did not touch
- lint and the formatter over the card's files only — never skip the formatter, it is what
  catches an editing tool rewriting line endings, which every other gate passes
- tests **related to** those files — `vitest related --run <files>`, or the equivalent; "No test
  files found" exits 0 and is reported as *no coverage reaches these files*, never a pass
- the production build **only** when the change adds an import, dependency, config or entry point

Logs and screenshots go in `D:\Agent-Projects\<project>\LF-<n>\` (§1). **The full set is not
skipped, only deferred:** `/ship` runs it once across the batch, where a release earns it.
**Peers in the tree** (`/s` Step 0): note the card files' mtimes before and after the gates and
re-run what moved; a peer's red whole-tree build is deferred to `/ship` with its files named.

## 2. Reconcile the spec against the code, then the test list

**First, read every file the spec block named and confirm the code says what the spec says** —
signatures, file names, the shape of what is passed. **The code wins** on a small divergence:
rewrite the spec block so it stops lying (`LF section <card> spec --file ...`) and say so; a
contradiction big enough to change the design goes back to the user.

Then the numbered case list: for each case, is there a test, and does it exercise that case? List
the cases **with no test** — that matters more than the suite passing.

## 3. Code review — before the app is driven

Run `/code-review` scoped to the card's files. Fold the findings into the verify block as: must
fix now / should fix / noted. A finding in code this card only moved past is **noted, not fixed**
— `LF work <card> --defer "…"`, never a new card. Deferred items do not block closing.

## 4. Drive the real app (only when FE changed)

- Start the app per `flow.md`. **Use the project's driver script if it has one** — rebuilding a
  driver per card costs more than every gate; if none, write one and record it in `flow.md`
- Log in, reach **every screen that renders what changed** — each route importing a changed
  component, each screen reading a set the card added a value to, each consumer of a changed token
  format (grep, do not recall) — screenshot, and check for console errors, 4xx/5xx requests, raw
  i18n keys (`some.key.name`), an error state shown before any input
- **Layout is measured, never read off a screenshot**: no overflow against the emulated 375 px
  width; at the widest breakpoint one toolbar row shares one top; no value cell clipped in the
  longest locale. A defect in your own screenshots is fixed here, shown red first — deferring it
  needs the owner's word; a failure in one locale×width is measured before it is called a flake
- **Drive every locale the project ships**; screenshot the one whose strings are longest
- **Interactive states are verified by dispatching real input** — hover, focus, click — never by
  reading computed style off an element nobody is touching
- When the environment cannot supply the identity the card is about, drive the branch at the
  client boundary, never by writing to the server, and **say the identity was simulated**
- **Compare the DTO the FE calls against the API actually running.** The dev API lands after the
  FE, so a field it does not yet return is an environment gap — confirm the FE survives it.
- **A conditional affordance needs the state that produces it** — unreachable by use is the finding
- **Verify the outcome, not the mechanism.** A 302 whose target bounces back is a loop; a
  page-load screenshot says nothing about the sheet, toasts and Zod messages behind a click

## 5. Slop-test the new UI

Only when there is new or substantially changed UI. Compare the screenshots just captured
against CONVENTIONS §7 and apply its precedence clause: fix what the agent chose, report what the
requester specified. Record both in the verify block.

## 6. Handling failures

- **Technical failures** (wrong type, missing key, imports, lint, build config): fix, re-run,
  record. A **deployment-config** defect counts — fix it in the repo, not in a paragraph.
- **Reproduce a failing external call standalone before changing any code.** A log line names the
  symptom; the response body names the cause. Two timeout increases shipped against a refusal.
- **Business-logic failures** (wrong result, transition, permission): **STOP**. Measure the cause
  and which paths show it, *then* offer options and ask; the card stays In progress (§7).
- **A fix at `/c` is new code**: before closing a finding, grep its siblings (same pattern in the
  file, every parameter on the same input path) and re-run related tests over what it touched.
- **A red test is a claim about the product**: find which side a person decided before making the
  assertion match. A red no card owns is raised with the owner for its own card, never parked.
- **Record friction** per CONVENTIONS §9 — an untested case, a failure a soft gate let through.

## 7. Verdict

Write the verdict to a scratch `.md`: pass/fail per item, gate tier and why, untested cases, spec
divergences, review findings, slop-test result, screenshot paths, and the points re-checked.

Always `LF section <card> verify --file <scratch.md>`. Then, **pass** — every item green, no
untested case unexplained — `LF move <card> Review` and `LF tick <card> Verify`.

**Fail, or an escalation you refused to guess — the card goes back, loudly:** `LF move <card>
"In progress"` and `LF comment <card> --text "Blocked: <what is undecided>"`. Never leave a
blocked card in Review: prose in a verify block is invisible on the board.

Review is where a card rests. Name the other cards in Review and offer `/ship` for the group.
