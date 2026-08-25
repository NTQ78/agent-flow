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

## 1. Tests and builds

Run all of them, using the commands declared in `.claude/flow.md`: BE tests, FE tests, typecheck,
FE build, BE build. Record each command's result under `03-verify/`.

Also run the project's formatter in check mode over the ticket's files, **even when the project's
own list of required checks omits it**: lint, tsc, test and build all pass over a file rewritten
with the wrong line endings.

## 2. Cross-check the /p test case checklist

Open `01-spec.md` and take the numbered case list. For each case: is there a corresponding test,
and does that test actually exercise that case? List the cases **with no test** — this finding
matters more than the suite passing.

## 3. Drive the real app (only when FE changed)

Skip if the ticket is BE-only. Otherwise:

- Start the app as described in `.claude/flow.md`
- Log in, navigate to the affected screen, capture a screenshot into `03-verify/`
- Check for: console errors, 4xx/5xx requests, raw i18n keys showing through (`some.key.name`),
  broken layout
- **Interactive states are verified by dispatching real input** — hover, focus, click — never by
  reading computed style off an element nobody is touching. A hover an animation has overridden
  passes tsc, lint, build and every static DOM assertion
- When the environment cannot supply the identity the ticket is about — a dev API pointing at a
  real backend with no low-privilege test account — drive the branch at the client boundary,
  never by writing to the server, and **say in the report that the identity was simulated, not
  authenticated**
- **Compare the DTO the FE calls against the API actually running.** The dev API usually lands
  after the FE; if the FE reads a field the API does not yet return, report it as an environment
  gap rather than a code defect — but still confirm the FE does not break without that field.

## 4. Slop-test the new UI

Only when there is new or substantially changed UI.

Per CONVENTIONS §6, look through the installed skills for a checker of this kind (`slop-test.md`,
`anti-patterns.md` or equivalent) and use it as the checklist. If none exists, use the list in
CONVENTIONS §7 directly.

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
- **Business-logic failures** (wrong computed result, wrong status transition, wrong permission):
  **STOP**. Diagnose the cause, propose options, ask the user. Guessing wrong at the business
  layer is expensive.

## 7. Record friction

Append entries per CONVENTIONS §9. What to look for at this stage:

- cases with no test → why did `/p` not list them, or `/s` not write them? `missing-step`
- a failure that a soft gate let through and that cost real time → `wrong-gate`
- a check that found nothing useful two runs running → `noise`
- an environment gap (dev API behind the FE, missing runtime) not documented → `missing-fact`,
  applied to `flow.md`

## 8. Verdict

Write `03-verify/report.md`: pass/fail per item, cases with no test, code-review findings,
slop-test result, screenshots attached.

Set `status: verify` **only** when every item passes and no untested case is left unexplained.
Otherwise keep `status: build` and say exactly what is missing — `/ship` is a hard gate and will
block.

`verify` is where a ticket rests. Report how many tickets in this project now sit there, and offer
`/ship` as a release of that whole batch rather than as this ticket's next step.
