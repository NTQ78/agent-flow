---
description: Write the technical spec onto a board card — files, signatures, migration, i18n, tests
argument-hint: card link | LF-N (empty = this session's card, else oldest in Backlog)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md`.

Card: $ARGUMENTS — a link, or `LF-N`. If empty, this session's card, else the oldest in Backlog
(`LF ls <project> --column Backlog`). `LF` means `node C:\Users\VNT\.claude\flow\lf.js`, absolute.

## Step 0 — Gate

`LF get <card>` writes the requester's half to a `.request.md` file. That is your brief and you
never edit it. **A question whose answer decides a permission, a route, a stored value or
which of two shapes the user gets is a HARD stop** (CONVENTIONS §4) — ask it, with a worked
example per option (a named person, real dates), and do not spec past it. Everything else —
copy, wording, a count nobody stores — warns, continues, and marks each guess `[ASSUMPTION]`.
A `needs-approval` label with no sign-off is always a stop.

## Step 1 — Survey the code before writing

Read the real code in the affected area. The spec is built on actual files, not on memory of the
architecture. Note the pattern already used for similar work, and what can be reused.

## Step 2 — UI/UX design (only when there is new FE work)

**Settle the design before writing this section.** CONVENTIONS §6 decides whether a skill is
invoked — scale it to the decisions carried; one control in an existing slot gets the app pattern
named instead. Apply §7: match the existing app, introduce no new style. Decide layout, reused
components, empty/loading/error states, responsive behaviour. **Anything rendering conditionally:
name the user path that produces it** — no such path is the finding. BE-only: skip the step.

## Step 3 — Diagram

Branching flow (approvals, evaluations, lifecycles): a mermaid `flowchart` or `stateDiagram-v2`.

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
- Anything whose shape an installed dependency or generator decides — a plugin's export, a class
  Tailwind emits, a type a major version removed — is **inspected, not recalled**, against one
  named source of truth. Nothing installed yet? Order the work so it is inspected first.
- A new value in a shared vocabulary — enum member, status word, DTO or form field — lists every
  reader and writer of it and what each does with it; the default branch is where it goes wrong.

## Step 5 — i18n

No locale layer (CONVENTIONS §4)? One line: `N/A — single locale, no i18n library`. Otherwise list
**every** key with **both locales**, as a `| key | vi | en |` table — a missing locale is a defect.

## Step 6 — Test case checklist

List every case, numbered, grouped: BE unit / integration / FE component / business edge case.
Each case states input → expected result. `/c` checks against exactly this list, so write it for
coverage, not looks. **Each case names the fixture that expresses it** — a symbol with no harness,
an `internal` class with no `InternalsVisibleTo`, a state no user path reaches: that is the
finding, not the case. No test runner, or a project rule against new tests (read flow.md and the
repo's CLAUDE.md first)? Keep the numbering and write **verification steps**, each naming its
method and the seeded record that produces its state, so `/c` reads them as observations.

## Step 7 — Risks and the work tree

- Risks: what is fragile, whether existing data stays compatible, who is affected if it is wrong
- Break the work into a nested list, written with `LF work <card> --file <f.md>`: **four or five
  level-1 items**, stretched to the card's complexity, each holding its own children, together
  covering the whole card. **The numbering is the run order and `/s` obeys it literally**:
  BE → migration → FE → i18n, never FE before the API whose shape it reads; greenfield FE is
  manifest → install → config → code (Step 4). A **typed** locale layer inverts the i18n step —
  a key union built from the dictionary makes the FE uncompilable without its keys, so it leads.
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
