---
description: Write the technical spec onto a board card — files, signatures, migration, i18n, tests
argument-hint: card link | LF-N (empty = oldest card in Backlog)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Card: $ARGUMENTS — a link, or `LF-N`. If empty, `LF ls <project> --column Backlog` and take the
oldest. `LF` means `node C:\Users\VNT\.claude\flow\lf.js` — always the absolute path.

## Step 0 — Gate

`LF get <card>` writes the requester's half to a `.request.md` file. That is your brief and you
never edit it. **A question whose answer decides a permission, a route, a stored value or
which of two shapes the user gets is a HARD stop** (CONVENTIONS §4) — ask it; do not spec past it.
Twice it was read as soft and the whole chain ran on a guess, once to a month picker that was
built, verified and screenshotted against an unanswered "month or date range". Everything else —
copy, wording, a count nobody stores — warns, continues, and marks each guess `[ASSUMPTION]`.
A `needs-approval` label with no sign-off is always a stop.

## Step 1 — Survey the code before writing

Read the real code in the affected area. The spec is built on actual files, not on memory of the
architecture. Note the pattern already used for similar work, and what can be reused.

## Step 2 — UI/UX design (only when there is new FE work)

**Settle the design before writing this section.** CONVENTIONS §6 decides whether a skill is
invoked — scale it to the design decisions carried; one control in an existing slot gets the app
pattern named instead. Apply §7: match the existing app, introduce no new style. Decide
layout, reused components, empty/loading/error states, responsive behaviour. **For anything that
renders conditionally, name the user path that produces the condition** — if there is none, that
is the finding. Skip the whole step if the request is BE-only.

## Step 3 — Diagram

When the flow branches (approval chains, evaluations, lifecycles): draw a mermaid `flowchart` or
`stateDiagram-v2`. A single-branch request needs no diagram — not for decoration.

## Step 4 — Technical spec

Detail level: **file names plus signatures** — enough for `/s` to execute without guessing. For
each layer, list files to **create** or **modify**, with signatures:

- **Domain** — entities, value objects, changed invariants
- **Application** — command/query and handler, DTOs (every field and type)
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
  recalled**, against one named source of truth. Nothing installed yet? Order the work so it is
  inspected first.

## Step 5 — i18n

Only when the project has a locale layer (CONVENTIONS §4). List **every** key to add with
translations for **both locales**, as a `| key | vi | en |` table. A missing locale is a defect,
not a follow-up. No locale layer? One line: `N/A — single locale, no i18n library`.

## Step 6 — Test case checklist

List every case, numbered, grouped: BE unit / integration / FE component / business edge case.
Each case states input → expected result. `/c` checks against exactly this list, so write it for
coverage, not looks. **Each case names the fixture that expresses it** — a symbol with no harness,
an `internal` class with no `InternalsVisibleTo`, a state no user path reaches: that is the
finding, not the case. No test runner and installing one out of scope? Keep the numbering and
write the cases as **verification steps** naming their method, so `/c` reads them as observations.

## Step 7 — Risks and the work tree

- Risks: what is fragile, whether existing data stays compatible, who is affected if it is wrong
- Break the work into a nested markdown list and write it with `LF work <card> --file <f.md>`.
  **The numbering is the run order and `/s` obeys it literally**, so the ordering reason lives
  here now: BE → migration → FE → i18n, never i18n before the FE that uses it nor FE before the
  API whose shape it reads (greenfield FE: manifest → install → config → code, per Step 4).
- Sibling items of equal depth: smallest first. Leaves small enough to check one at a time.
- Sizes that have line caps (a command file, `CONVENTIONS.md`): put before/after/cap in the spec.

## Step 8 — Record friction, write, close out

Append friction entries per CONVENTIONS §9 before writing. What to look for at this stage:

- a fact you had to discover by reading code that `flow.md` should have declared → `missing-fact`,
  applied to `flow.md` in this run
- every `[ASSUMPTION]` that exists because no rule covers the situation → `missing-rule`
- a spec section that consumed effort and that `/s` ignored last time → `noise`

Then write the spec to a scratch `.md` and put it on the card: `LF section <card> spec --file
<scratch.md>`, `LF move <card> Todo`, `LF tick <card> Spec`. Add `LF points <card> <n>` only
when the survey disagrees with `/intake`.

**And put every decision where a sibling card will find it.** A choice made here — a stored
format, a vocabulary, which surface owns a rule — binds cards nobody has written yet, and inside
one card it is invisible to them. Append it dated to the project's `.claude/flow.md` under its
locked rules, one line each, and cite it rather than restating it.

Print: files created/modified, whether there is a migration, i18n key count, test case count, the
largest risk, any `[ASSUMPTION]` outstanding, and the card link. Then ask: "Run `/s`?"
