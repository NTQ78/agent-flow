---
description: Verify — tests, builds, drive the real app, slop-test, code-review
argument-hint: REQ-ID (empty = newest ticket already built)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md` for test/build
commands and how to run the app.

Ticket: $ARGUMENTS — if empty, take the newest ticket with `status: build`.

This command exists to catch **green tests over a broken app**. A passing suite is not evidence
the app works. **The unit of verification is the file list in `02-build-log.md`, not the working
tree** — a tree carrying unrelated uncommitted work has no usable "current diff", so scope every
file-level check and the review to that list.

## 1. Gates, scaled to reach

Scale them to what the change can reach, **not to the ticket's size label**: one line in a shared
component reaches forty files, a large leaf-page change reaches nothing. The build log's file list
decides the tier; the report says which and why.

**Wide** — any changed file is shared (UI primitives, `lib/`, hooks, i18n, config, an entry point),
or the ticket carries a migration or a BE change. Run the project's full declared set.

**Confined** — every changed file is a leaf nothing else imports:

- **typecheck project-wide and unscoped** — the cheapest whole-app guarantee there is, and the one
  check that still sees the files this change did not touch
- lint and the formatter over the ticket's files only — never skip the formatter, it is what
  catches an editing tool rewriting line endings, which every other gate passes
- tests **related to** those files — `vitest related --run <files>`, or the equivalent
- the production build **only** when the change adds an import, dependency, config or entry point

Record each result under `03-verify/`. **The full set is not skipped, only deferred:** `/ship`
runs it once across the batch, which is where a release earns its guarantee.

## 2. Reconcile the spec against the code, then the test list

**First, read every file `01-spec.md` named and confirm the code says what the spec says** —
signatures, file names, the shape of what is passed. **The code wins** on a small divergence: fix
the spec so it stops lying and say so; a contradiction big enough to change the design goes back
to the user. A spec nobody reconciled is read as truth by whoever comes next.

Then the numbered case list: for each case, is there a test, and does it exercise that case? List
the cases **with no test** — that finding matters more than the suite passing.

## 3. Drive the real app (only when FE changed)

- Start the app per `flow.md`. **Use the project's driver script if it has one** — rebuilding a
  browser driver per ticket costs more than every gate in §1 combined; if there is none, write one
  and record it in `flow.md`
- Log in, reach the affected screen, screenshot into `03-verify/`, and check for console errors,
  4xx/5xx requests, raw i18n keys (`some.key.name`), broken layout
- **Interactive states are verified by dispatching real input** — hover, focus, click — never by
  reading computed style off an element nobody is touching. A hover an animation has overridden
  passes tsc, lint, build and every static DOM assertion
- When the environment cannot supply the identity the ticket is about, drive the branch at the
  client boundary, never by writing to the server, and **say in the report that the identity was
  simulated, not authenticated**
- **Compare the DTO the FE calls against the API actually running.** The dev API lands after the
  FE, so a field it does not yet return is an environment gap — but confirm the FE survives it.
- **A conditional affordance needs the state that produces it.** If you cannot reach that state by
  using the app, that is the finding: a banner nobody can trigger shipped green on 2026-08-28.

## 4. Slop-test the new UI

Only when there is new or substantially changed UI.

Per CONVENTIONS §6, look for an installed skill shipping a checker (`slop-test.md`,
`anti-patterns.md`); if none, use CONVENTIONS §7 directly. Compare the screenshots just captured
against it, and split the failures in two:

- **Fix now** — anything the agent chose. Fix the UI; do not note it and move on.
- **Report only** — any value the requester specified verbatim, cross-referenced to the §7
  sign-off in `00-request.md`. Never silently rewrite what the customer asked for.
Record both in `03-verify/slop-test.md`.

## 5. Code review

Run `/code-review` scoped to the ticket's files. Fold the findings into the report as: must fix
now / should fix / noted. A finding in code this ticket only moved past is **noted, not fixed** —
name it for its own ticket instead of widening this one.

## 6. Handling failures

- **Technical failures** (wrong type, missing key, imports, lint, build config): fix, re-run,
  record. A **deployment-config** defect counts — fix it in the repo, not in a paragraph `/ship`
  must notice.
- **Business-logic failures** (wrong result, wrong transition, wrong permission): **STOP**.
  Diagnose, propose options, ask — and set `blocked:` per §8. Guessing here is expensive.

## 7. Record friction

Append entries per CONVENTIONS §9. Here: cases with no test (`missing-step` — why did `/p` not
list them, or `/s` not write them?), a failure a soft gate let through (`wrong-gate`), a check
that found nothing twice running (`noise`), an environment gap (`missing-fact`, into `flow.md`).

## 8. Verdict

Write `03-verify/report.md`: pass/fail per item, which gate tier ran and why, cases with no test,
spec divergences, code-review findings, slop-test result, screenshots. **Re-check `size`** against
what the work actually took and correct it — an estimate nobody revisits teaches nothing.

Set `status: verify` **only** when every item passes and no untested case is left unexplained.
**An escalation you refused to guess keeps the ticket at `build`** and names itself in a
`blocked:` frontmatter line — prose in §6 of a report is invisible to `/ship`, and a ticket that
looks ready while a decision hangs is how a payroll bug nearly shipped on 2026-08-28.

`verify` is where a ticket rests. Say how many tickets share this one's `release`, and offer
`/ship` for that batch rather than for this ticket.
