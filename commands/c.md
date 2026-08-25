---
description: Verify — tests, builds, drive the real app, slop-test, code-review
argument-hint: REQ-ID (empty = newest ticket already built)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md` for test/build
commands and how to run the app.

Ticket: $ARGUMENTS — if empty, take the newest ticket with `status: build`.

The purpose of this command is to catch **green tests over a broken app**. A passing suite is not
evidence the app works.

**The unit of verification is the file list in `02-build-log.md`, not the working tree.** A project
whose tree carries unrelated uncommitted work has no usable "current diff"; scope every
file-level check and the review to that list.

## 1. Gates, scaled to reach

Scale them to what the change can reach, **not to the ticket's size label**. One line in a shared
component reaches forty files; a large change to a leaf page reaches nothing else. The file list
in `02-build-log.md` decides which tier runs, and the report says which one and why.

**Wide** — any changed file is shared (UI primitives, `lib/`, hooks, i18n, config, an entry point),
or the ticket carries a migration or a BE change. Run the project's full declared set.

**Confined** — every changed file is a leaf nothing else imports:

- **typecheck project-wide and unscoped** — it is the cheapest whole-app guarantee there is, and
  the one check that still sees the files this change did not touch
- lint and the formatter over the ticket's files only
- tests **related to** those files — `vitest related --run <files>`, or the project's equivalent
- the production build **only** when the change adds an import, a dependency, a config or an entry
  point. A change confined inside existing files cannot break a bundle that already typechecks

Never skip the formatter to save the second it costs: it is what catches an editing tool rewriting
a file's line endings, which every other gate passes.

Record each command's result under `03-verify/`. **The full set is not skipped, only deferred:**
`/ship` runs it once across the whole batch before deploying, which is where a release earns its
guarantee. A ticket that never ships never needed it.

## 2. Cross-check the /p test case checklist

Open `01-spec.md` and take the numbered case list. For each case: is there a corresponding test,
and does that test actually exercise that case? List the cases **with no test** — this finding
matters more than the suite passing.

## 3. Drive the real app (only when FE changed)

- Start the app as described in `.claude/flow.md`. **If the project has a driver script, use it** —
  rebuilding a browser driver per ticket costs more than every gate in §1 combined. If there is
  none, write one into the project and record it in `flow.md`
- Log in, navigate to the affected screen, capture a screenshot into `03-verify/`
- Check for console errors, 4xx/5xx requests, raw i18n keys (`some.key.name`), broken layout
- **Interactive states are verified by dispatching real input** — hover, focus, click — never by
  reading computed style off an element nobody is touching. A hover an animation has overridden
  passes tsc, lint, build and every static DOM assertion
- When the environment cannot supply the identity the ticket is about — a dev API pointing at a
  real backend with no low-privilege test account — drive the branch at the client boundary,
  never by writing to the server, and **say in the report that the identity was simulated, not
  authenticated**
- **Compare the DTO the FE calls against the API actually running.** The dev API lands after the
  FE, so a field it does not yet return is an environment gap, not a defect — but confirm the FE
  survives without it.

## 4. Slop-test the new UI

Only when there is new or substantially changed UI.

Per CONVENTIONS §6, look for an installed skill shipping a checker (`slop-test.md`,
`anti-patterns.md` or equivalent); if none, use CONVENTIONS §7 directly.

Compare the screenshots just captured against the checklist, and split the failures in two:

- **Fix now** — anything the agent chose. Fix the UI; do not note it and move on.
- **Report only** — any value the requester specified verbatim, cross-referenced to the §7
  sign-off recorded in `00-request.md`. Never silently rewrite what the customer asked for.

Record both in `03-verify/slop-test.md`.

## 5. Code review

Run `/code-review` scoped to the ticket's files. Fold the findings into the verify report, grouped
as: must fix now / should fix / noted.

## 6. Handling failures

- **Clear technical failures** (wrong type, missing i18n key, imports, stale snapshot, lint, build
  config): fix and re-run. Record it under `03-verify/`.
- **Business-logic failures** (wrong result, wrong status transition, wrong permission): **STOP**.
  Diagnose, propose options, ask. Guessing wrong at the business layer is expensive.

## 7. Record friction

Append entries per CONVENTIONS §9. At this stage: cases with no test (`missing-step` — why did
`/p` not list them, or `/s` not write them?), a failure a soft gate let through that cost real
time (`wrong-gate`), a check that found nothing useful two runs running (`noise`), an undocumented
environment gap (`missing-fact`, applied to `flow.md`).

## 8. Verdict

Write `03-verify/report.md`: pass/fail per item, which gate tier ran and why, cases with no test,
code-review findings, slop-test result, screenshots.

Set `status: verify` **only** when every item passes and no untested case is left unexplained.
Otherwise keep `status: build` and say what is missing — `/ship` is a hard gate and will block.

`verify` is where a ticket rests. Report how many tickets in this project now sit there, and offer
`/ship` as a release of that whole batch rather than as this ticket's next step.
