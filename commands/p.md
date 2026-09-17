---
description: Write the technical spec for a REQ ticket — file names, signatures, migration, i18n, tests
argument-hint: REQ-ID (empty = newest ticket without a spec)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Ticket: $ARGUMENTS — if empty, take the newest ticket with `status: intake` under
`D:\Agent-Projects\<project>\`.

## Step 0 — Gate

Read `00-request.md`. **A question whose answer decides a permission, a route, a stored value or
which of two shapes the user gets is a HARD stop** (CONVENTIONS §4) — ask it; do not spec past it.
Twice it was read as soft and the whole chain ran on a guess, once to a month picker that was
built, verified and screenshotted against an unanswered "month or date range". Everything else —
copy, wording, a count nobody stores — warns, continues, and marks each guess `[ASSUMPTION]`.
`needs_approval: true` with no sign-off is always a stop.

## Step 1 — Survey the code before writing

Read the real code in the affected area. The spec is built on actual files, not on memory of the
architecture. Note the pattern already used for similar work, and which components or handlers
can be reused.

## Step 2 — UI/UX design (only when there is new FE work)

**A skill must be invoked before writing this section.** Per CONVENTIONS §6: list the installed
skills, pick the closest, invoke it, and only then settle layout, tokens and components — saying
which and why. Apply §7 from here on: match the existing app, introduce no new style. Decide
layout, reused components, empty/loading/error states, responsive behaviour. **For anything that
renders conditionally, name the user path that produces the condition** — if there is none, that
is the finding. Skip the whole step if the request is BE-only.

## Step 3 — Diagram

When the flow branches (approval chains, evaluations, status lifecycles): draw a mermaid
`flowchart` or `stateDiagram-v2`. A single-branch request needs no diagram — not for decoration.

## Step 4 — Technical spec

Detail level: **file names plus signatures** — enough for `/s` to execute without guessing.

For each layer, list files to **create** or **modify**, with signatures:

- **Domain** — entities, value objects, changed invariants
- **Application** — command/query and handler, DTOs (every field and its type)
- **Infrastructure** — EF configuration, repositories, migration (name, columns added/changed)
- **API** — route, HTTP verb, request/response shape, required permission
- **FE** — components, hooks/stores, API service, routes

**Every path, symbol and call site the spec names must be one you opened** — not inferred from a
sibling spec, not from the folder's shape. A folder that never existed, a guard that was two
conditions, "three call sites" that were four. Grep-verify it or do not name it.

Hard constraints (re-check the traps section of the project's `.claude/flow.md`):

- Migrations are **additive-only**. Never drop or rename a column in use.
- New fields on a response DTO must be **optional on the FE side** — the dev API lands after the
  FE, which has to keep working against the older API.
- Permissions: request the minimum. Never widen a grant for convenience.
- Anything whose shape an installed dependency or generator decides — a plugin's flat-config
  export, a class Tailwind will emit, a type a major version removed — is **inspected, not
  recalled**. Check hand-written class names against what the config generates and name one source
  of truth; if nothing is installed yet, order the work so it is inspected first.

## Step 5 — i18n

Only when the project has a locale layer (CONVENTIONS §4). List **every** key to add with
translations for **both locales**, as a `| key | vi | en |` table. A missing locale is a defect,
not a follow-up. No locale layer gets one line: `N/A — single locale, no i18n library`.

## Step 6 — Test case checklist

List every case, numbered, grouped: BE unit / integration / FE component / business edge case.
Each case states input → expected result. `/c` checks against exactly this list, so write it for
coverage, not for looks. **Each case names the fixture that expresses it** — a symbol with no
harness, an `internal` class with no `InternalsVisibleTo`, a state no user path reaches: that is
the finding, not the case. With no test runner and installing one out of scope, keep the numbering
and write the cases as **verification steps** naming their method — a toolchain gate, or the
browser over CDP — so `/c` knows they are observations, not assertions.

## Step 7 — Risks and task breakdown

- Risks: what is fragile, whether existing data stays compatible, who is affected if it is wrong
- Break the work down in the order `/s` will run it: BE → migration → FE → i18n (greenfield FE:
  manifest → install → config → code, so shapes are read from what is installed, per Step 4)
- Re-estimate `size` if the survey disagrees with `/intake`

## Step 8 — Record friction, write, close out

Append friction entries per CONVENTIONS §9 before writing. What to look for at this stage:

- a fact you had to discover by reading code that `flow.md` should have declared → `missing-fact`,
  applied to `flow.md` in this run
- every `[ASSUMPTION]` that exists because no rule covers the situation → `missing-rule`
- a spec section that consumed effort and that `/s` ignored last time → `noise`

Then:

Write `01-spec.md`, set `status: spec` in `00-request.md`.

**And put every decision somewhere a sibling ticket will find it.** A choice made here — a stored
format, a vocabulary, which surface owns a rule — binds tickets nobody has written yet, and inside
one ticket folder it is invisible to them. Append it dated to the project's `.claude/flow.md`
under its locked rules, one line each, and cite it from the spec rather than restating it.

Print: files created/modified, whether there is a migration, i18n key count, test case count, the
largest risk, and any `[ASSUMPTION]` still outstanding. Then ask: "Run `/s`?"
