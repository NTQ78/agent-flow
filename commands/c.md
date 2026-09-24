---
description: Verify — tests, builds, drive the real app, slop-test, code-review
argument-hint: card link | LF-N (empty = oldest card in In progress)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md` for test/build
commands and how to run the app.

Card: $ARGUMENTS — a link, or `LF-N`. If empty, `LF ls <project> --column "In progress"` and take
the oldest. `LF` means `node C:\Users\VNT\.claude\flow\lf.js`. `LF get <card>` first.

This command exists to catch **green tests over a broken app**. A passing suite is not evidence
the app works. **The unit of verification is the file list in the card's build block, not the
working tree** — a tree carrying unrelated uncommitted work has no usable "current diff", so
scope every file-level check and the review to that list.

## 1. Gates, scaled to reach

Scale them to what the change can reach, **not to the card's size label**: one line in a shared
component reaches forty files, a large leaf-page change reaches nothing. The build block's file
list decides the tier; the verify block says which and why.

**Wide** — a changed file is shared (UI primitives, `lib/`, hooks, i18n, config, an entry point),
or the card carries a migration or a BE change. Run the project's full declared set.
**Confined** — every changed file is a leaf nothing else imports:

- **typecheck project-wide and unscoped** — the cheapest whole-app guarantee there is, and the one
  check that still sees the files this change did not touch
- lint and the formatter over the card's files only — never skip the formatter, it is what
  catches an editing tool rewriting line endings, which every other gate passes
- tests **related to** those files — `vitest related --run <files>`, or the equivalent
- the production build **only** when the change adds an import, dependency, config or entry point

Logs and screenshots go in `D:\Agent-Projects\<project>\LF-<n>\` (§1). **The full set is not
skipped, only deferred:** `/ship` runs it once across the batch, where a release earns it.

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
  browser driver per card costs more than every gate in §1 combined; if none, write one and
  record it in `flow.md`
- Log in, reach the affected screen, screenshot into the card's folder, and check for console
  errors, 4xx/5xx requests, raw i18n keys (`some.key.name`), broken layout
- **Drive every locale the project ships**, and screenshot the one whose strings are longest — a
  VN-only overflow and a hard-coded English label both shipped past an English-only pass
- **Interactive states are verified by dispatching real input** — hover, focus, click — never by
  reading computed style off an element nobody is touching. A hover an animation has overridden
  passes tsc, lint, build and every static DOM assertion
- When the environment cannot supply the identity the card is about, drive the branch at the
  client boundary, never by writing to the server, and **say the identity was simulated**
- **Compare the DTO the FE calls against the API actually running.** The dev API lands after the
  FE, so a field it does not yet return is an environment gap — confirm the FE survives it.
- **A conditional affordance needs the state that produces it.** Cannot reach it by using the
  app? That is the finding: a banner nobody can trigger shipped green on 2026-08-28.
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
- **Business-logic failures** (wrong result, wrong transition, wrong permission): **STOP**.
  Diagnose, propose options, ask — and leave the card in In progress per §8. Guessing is costly.

## 7. Record friction

Append entries per CONVENTIONS §9. Here: cases with no test (`missing-step` — why did `/p` not
list them, or `/s` not write them?), a failure a soft gate let through (`wrong-gate`), a check
that found nothing twice running (`noise`), an environment gap (`missing-fact`, into `flow.md`).

## 8. Verdict

Write the verdict to a scratch `.md`: pass/fail per item, which gate tier ran and why, cases with
no test, spec divergences, code-review findings, slop-test result, where the screenshots are.
**Re-check the points** against what the work took — an estimate nobody revisits teaches nothing.

Always `LF section <card> verify --file <scratch.md>`. Then, **pass** — every item green, no
untested case unexplained — `LF move <card> Review` and `LF tick <card> Verify`.

**Fail, or an escalation you refused to guess — the card goes back, loudly:**
`LF move <card> "In progress"` and `LF comment <card> --text "Blocked: <what is undecided>"`.
Never leave a blocked card in Review: prose buried in a verify block is invisible on the board,
and a card that looks ready while a decision hangs is how a payroll bug nearly shipped on
2026-08-28.

Review is where a card rests. Name the other cards in Review and offer `/ship` for the group.
