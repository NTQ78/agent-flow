---
description: Write the technical spec for a REQ ticket — file names, signatures, migration, i18n, tests
argument-hint: REQ-ID (empty = newest ticket without a spec)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Ticket: $ARGUMENTS — if empty, take the newest ticket with `status: intake` under
`D:\Agent-Projects\<project>\`.

## Step 0 — Soft gate

Read `00-request.md`. If `open_questions > 0` or `needs_approval: true`: print a warning naming
the unanswered questions and the risk of guessing wrong, then **continue anyway**, marking every
guessed decision `[ASSUMPTION]` in the spec.

## Step 1 — Survey the code before writing

Read the real code in the affected area. The spec is built on actual files, not on memory of the
architecture. Note the pattern already used for similar work, and which components or handlers
can be reused.

## Step 2 — UI/UX design (only when there is new FE work)

**A skill must be invoked before writing this section.** Per CONVENTIONS §6: list the installed
skills, pick the closest design skill, invoke it via the Skill tool, and only then settle layout,
tokens and components. Say which skill you picked and why.

Apply CONVENTIONS §7 from the design stage onward: match the existing app, introduce no new style.
Decide: layout, reused components, empty/loading/error states, responsive behaviour.

Skip this whole step if the request is BE-only.

## Step 3 — Diagram

When the flow branches (approval chains, evaluations, shift handover, status lifecycles): draw a
mermaid `flowchart` for the data flow or `stateDiagram-v2` for the lifecycle. A single-branch
request needs no diagram — do not draw one for decoration.

## Step 4 — Technical spec

Detail level: **file names plus signatures**. Enough for `/s` to execute without guessing, without
writing the logic twice.

For each layer, list files to **create** or **modify**, with signatures:

- **Domain** — entities, value objects, changed invariants
- **Application** — command/query and handler, DTOs (every field and its type)
- **Infrastructure** — EF configuration, repositories, migration (name, columns added/changed)
- **API** — route, HTTP verb, request/response shape, required permission
- **FE** — components, hooks/stores, API service, routes

Hard constraints (re-check the traps section of the project's `.claude/flow.md`):

- Migrations are **additive-only**. Never drop or rename a column in use.
- New fields on a response DTO must be **optional on the FE side** — the dev API is always
  implemented after the FE, and the FE has to keep working against the older API.
- Permissions: request the minimum. Never widen a grant for convenience.

## Step 5 — i18n

List **every** key to add, with translations for **both locales**, as a table:

| key | vi | en |

A missing locale is a defect, not a follow-up task.

## Step 6 — Test case checklist

List every case, numbered, grouped: BE unit / integration / FE component / business edge case.
Each case states input → expected result. `/c` checks against exactly this list, so write it for
coverage, not for looks.

## Step 7 — Risks and task breakdown

- Risks: what is fragile, whether existing data stays compatible, who is affected if it is wrong
- Break the work down in the order `/s` will run it: BE → migration → FE → i18n
- Re-estimate `size` if the survey disagrees with `/intake`

## Step 8 — Record friction, write, close out

Append friction entries per CONVENTIONS §9 before writing. What to look for at this stage:

- a fact you had to discover by reading code that `flow.md` should have declared → `missing-fact`,
  applied to `flow.md` in this run
- every `[ASSUMPTION]` that exists because no rule covers the situation → `missing-rule`
- a spec section that consumed effort and that `/s` ignored last time → `noise`

Then:

Write `01-spec.md`, set `status: spec` in `00-request.md`.

Print: files created/modified, whether there is a migration, i18n key count, test case count, the
largest risk, and any `[ASSUMPTION]` still outstanding. Then ask: "Run `/s`?"
