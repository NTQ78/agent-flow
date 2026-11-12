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
example per option (a named person, real dates), and do not spec past it; more than four is more
rounds, never a downgrade. Survey what each option touches before offering it, then re-read the
answers against each other and the locked rules, and ask what they open in the same session.
Everything else — copy, wording, a count nobody stores — warns, continues, marks `[ASSUMPTION]`.
A `needs-approval` label with no sign-off is always a stop.

## Step 1 — Survey the code before writing

Read the real code in the affected area, and **find by grep, not by browsing**: the helper or
predicate siblings use for the same concept, every copy of what you replace (by shape, not name),
every sentence stating a contract you change, every FE caller of a route you gate; reuse them.

## Step 2 — UI/UX design (only when there is new FE work)

**Settle the design before writing this section** — a skill only as CONVENTIONS §6 scales it; §7:
match the existing app. Decide layout, reused components, empty/loading/error states, responsive
behaviour. **Anything rendering conditionally: name every user path that produces it** and check
its copy against each — no such path is the finding. **A column, chip or header item added to an
existing table or shell states its measured slack at 375 px and the widest breakpoint.** BE-only: skip.

## Step 3 — Diagram: a mermaid `flowchart` or `stateDiagram-v2`, for branching flow only

## Step 4 — Technical spec

Per layer, files to **create** or **modify** with **signatures** — enough for `/s` to run unguessed:

- **Domain** — entities, value objects, changed invariants
- **Application** — command/query and handler, DTOs (every field and type)
- **Infrastructure** — EF configuration, repositories, migration (name, columns added/changed)
- **API** — route, HTTP verb, request/response shape, required permission
- **FE** — components, hooks/stores, API service, routes

**Every path, symbol, call site and screen the spec names is one you opened, with the property its
use relies on stated** (a signature, an error or audit shape, a slot's layout, the save that
persists it) — and so is every reader **and writer** of what it changes: a route, a guard, a derived
figure, a legend, a reused export, a form posting it back, a job or path setting it, **every other
importer of a changed component (re-exports too), every caller that builds its input, every string
stating the same rule**. List them, or show why one is untouched. Grep-verify or do not name it.

Hard constraints (re-check the traps section of the project's `.claude/flow.md`):

- Migrations are **additive-only**. Never drop or rename a column in use.
- Permissions: request the minimum. Never widen a grant for convenience.
- Anything whose shape an installed dependency or generator decides — a plugin's export, a class
  Tailwind emits — is **inspected, not recalled**, against one named source of truth, by signature
  (overloads, generics, optional parameters), never by name. Not installed yet? Inspect it first.
- A new value in a shared vocabulary — enum member, status word, DTO or form field — lists every
  reader and writer and what each does with it; the default branch is where it goes wrong. A new
  stored pointer or rule lists each event that changes its subject (a leaver, a removal, another
  rule applied after it) and per event: clear, keep or recompute. A value read from the URL or a
  shared filter states its valid set, where it is coerced, and what shows for a value outside it.

## Step 5 — i18n

No locale layer (CONVENTIONS §4)? One line: `N/A — single locale, no i18n library`. Otherwise list
**every** key — each state Step 2 decided, each button and validation message, every existing
string the change makes false — with **both locales**, as a `| key | vi | en |` table. Reuse the
locale's existing term for a concept, and grep each touched component for raw text.

## Step 6 — Test case checklist

**Read the repo's CLAUDE.md and flow.md test rules first.** List every case, numbered, grouped (BE
unit / integration / FE / edge), each input → expected result; `/c` checks exactly this list. **Cases
cover what the feature promises, not what each function does:** the invariant functions share, the
string the UI prints, every input shape, edit and exit beside create. **Each case names the
fixture, seeded record and signed-in identity that express it, cited file:line** — a symbol with no
harness, an `internal` class with no `InternalsVisibleTo`, a state no user path reaches: that is the
finding. **List the existing tests, seeds and consumers pinning the old behaviour** — grep EVERY test
tree (BE, FE, mock tests) for the old literal, route, method and changed field, never by test name —
which go red, which stay as the net. No test runner, or a rule against new tests? Keep the
numbering and write **verification steps**, each naming its method, seeded record and **the mock
path producing that state** — opened, or driven once (a capture or guide card is driven first).

## Step 7 — Risks and the work tree

- Risks: what is fragile, whether existing data stays compatible, who is affected if it is wrong
- Break the work into a nested list, written with `LF work <card> --file <f.md>`: **four or five
  level-1 items**, stretched to the card's complexity, each holding its own children, together
  covering the whole card. **The numbering is the run order and `/s` obeys it literally**:
  BE → migration → FE → i18n, and **whatever an item needs to compile goes before it**; a removal
  goes after its last user. Greenfield FE: manifest → install → config → code (Step 4). A **typed**
  locale layer puts i18n first — its key union makes the FE uncompilable without the keys. Siblings
  smallest first, leaves checkable one at a time; a line-capped file carries before/after/cap.

## Step 8 — Record friction, write, close out

Append friction per CONVENTIONS §9 (a code fact → `missing-fact`, into `flow.md` now). Then put
the spec on the card: `LF section <card> spec --file <scratch.md>`, `LF move <card> Todo`,
`LF tick <card> Spec`; `LF points <card> <n>` only when the survey disagrees with `/intake`.

**Put every decision a sibling card is bound by** — a stored format, a vocabulary, which surface
owns a rule — dated, one line each, under the project's `.claude/flow.md` locked rules; cite it after.

Print: files created/modified, whether there is a migration, i18n key count, test case count, the
largest risk, any `[ASSUMPTION]` outstanding, and the card link. Then ask: "Run `/s`?"
