# Conventions for the /intake → /p → /s → /c → /ship chain

Every command in the chain MUST read this file before doing anything else.

## 1. Where things live

**The card on the LynkFlow board IS the ticket.** One board per project, named after the project
folder (`HR_APP`, `ManageTask`, `velorah-hero`, ...). `lf.js board <project>` creates it if it is
missing, with the five default columns.

Everything the chain writes goes into that card's description, each stage in its own block:

```
<what the requester wrote — no command ever touches this>
<!-- flow:spec -->  /p    <!-- flow:build -->   /s
<!-- flow:verify --> /c   <!-- flow:release --> /ship
```

Blocks are **appended after** the requester's text, never before it: the board renders a
description as plain text clamped to two lines, so a marker at the top shows on the card face.

**The only thing left on disk** is what a description cannot hold — screenshots and gate logs, in
`D:\Agent-Projects\<project>\LF-<n>\`. Code stays in the real repo, as it always did.

`C:\Users\VNT\.claude\flow\lf.js` is the one tool that speaks to the board. Call it by
absolute path: PowerShell does not expand `~` in a native command's arguments.

## 2. State

**The column the card sits in is the state.** Nothing else records it, so nothing can drift:

| Column | Means | Reached by |
|---|---|---|
| Backlog | requested, not specced | `/intake` |
| Todo | spec written | `/p` |
| In progress | being built | `/s` |
| Review | verified, waiting to close | `/c` |
| Done | closed | `/ship` |

A card may also be typed by hand straight into Todo; `/p` accepts one from Backlog or Todo.

Every card carries the checklist `Spec / Build / Verify / Ship`, ticked as each stage finishes, so
progress reads off the card face without opening it.

**The same checklist holds the work tree.** A row's `kind` column says who owns it — `gate`,
`work`, `defer`, or `user` — and it **defaults to `user`**, so anything a person types by hand is
never a command's to delete. Nesting is `parent_id`, order is the `order` column, and the number
you see (`1.2`) is computed from position, never stored. `/intake` and `/p` decide that order
against the code; `/s` obeys it and never re-sorts. Depth is unlimited; a row is a title and a
tick. A command deletes only what it wrote: `LF work --file` replaces `kind='work'` and nothing
else. **No command opens a second card**; `/c` writes a `defer` row on the card it is on.

**Done means finished and verified — not necessarily deployed.** `/ship` closes the ticket, then
asks whether to deploy, and the release block records which was chosen.

`/c` failing pulls the card back to **In progress** and comments why. A board that hides a stuck
ticket is worse than no board.

Code lives in one shared tree, so a card's work reaches production with the next deploy whether or
not its card closed. `/ship` reads the columns **plus** whether the build block's files are in the
repo. On 2026-08-28 four tickets shipped while still mid-flow, every gate green.

## 3. Language

**English** for everything the chain writes and prints; never translate identifiers. Vietnamese
only where a Vietnamese-speaking person reads: the draft message to the requester, and the
end-user changelog (bilingual, English first). Quote the requester **verbatim in their own
language** — a translation is not evidence.

## 4. Gates

- `/intake` → `/p` → `/s` → `/c`: **soft**. If the previous stage is incomplete, print a clear
  warning (what is missing, what the risk is) and continue anyway.
- `/ship`: **hard, across every card you pass it.** One of them short of **Review** → STOP for
  all. No exceptions, no override flag.
- **Stop too when a card OUTSIDE the batch has code in the build** (§2). It deploys either way;
  verify it into the batch, or record in the release block why it rides along.
- `/ship` is **last but optional** — a card resting at Review is waiting, not stalled.
- **A question whose answer decides a permission, a route, or a stored value is a HARD stop at
  `/p`** — cosmetic and copy questions keep the soft gate. Nine unanswered questions once ran the
  whole chain: three were wrong, and one rewrote the access path after `/c` had passed.
- A step whose **precondition the project does not meet** — no test runner, no locale layer, no
  migrations, no BE — is declared `N/A` in one line with the reason, keeping any numbering a
  later stage consumes. Never leave it blank, and never install machinery to satisfy the step.
- For an access, permission or validation change, **map the path, not the files**: every entry
  point reaching the guarded state, and the layer that enforces it. Missing either half has cost a
  mis-sized ticket and a nearly-shipped bug.

## 5. Chaining

After each command: move the card to its column (§2), tick its gate, print a summary with the
card link, then ask "Run `<next>`?" — run it only if the user agrees.

## 6. Skills — look them up at run time

The installed skill set changes over time (the user adds new ones regularly). **Never assume a
skill exists.** Before any design or UI work, list `~/.claude/skills` and
`<project>/.claude/skills`, read the `description` in each candidate's `SKILL.md`, pick the
closest match and invoke it via the Skill tool. Say which you picked and why when several
overlap; if nothing fits, say so plainly rather than inventing a name.

**A directory is not an available skill.** Cross-check against what the session actually offers; a
name that exists only on disk resolves to a different skill. `/sk` reports which are shadowed.

**Scale it, and once per session.** A skill is for work carrying design decisions — a screen, a
component, a layout. One control in an existing slot, a label copied from a sibling tab, a CSS
property on an email table: name the app pattern you are matching and move on. An invocation in
`/p` carries through `/s` in the same session; say which, do not re-run it.

## 7. Must not look AI-generated

A hard requirement: what ships must read as the work of an in-house design team.

**Rule one: match the existing app, do not introduce a new style.** Read the components and tokens
already in the repo and reuse them; with no existing app the brief and the skill set the direction.

Tells to avoid, unless the app already uses them: purple/indigo gradients, glassmorphism, glowing
borders, emoji in headings or buttons, cards inside cards inside cards, symmetrical feature
columns, hollow marketing copy, `shadow-lg` everywhere, an icon on every row, one metronomic
rhythm, grey placeholders and "John Doe" data. Use the domain's real labels and data instead, at
the density its users need, from components the repo already has.

**Precedence, when something else mandates a tell.** The requester outranks §7: a tell they
supplied verbatim — exact CSS, a named font, a spacing over a cap — is sign-off. Record it under
"Business rule conflicts" in the card’s spec block, do not flag it for approval, and `/c` reports it
without changing it. **A skill does not outrank §7.** A skill sets direction — palette, type,
layout — but a tell it mandates stays banned; `/p` records the deviation in a table `/c` then
treats as settled. §7 governs what the agent chose, including what a skill chose for it.

## 8. Per-project config

The commands are global, so they hard-code no project detail. Details come from:

```
<project root>/.claude/flow.md
```

It declares build/test commands, how to run the app, known traps, locked business rules and
deploy targets. No such file? Ask for what you need and offer to create it — do not guess. A
greenfield project has none **by design**: `/s` writes it at the end of the build.

## 9. Friction log — how this process improves itself

Every stage records where **the process itself** fell short, as it happens. One JSON object per
line, appended to `~/.claude/flow/friction.jsonl` (never committed — it quotes project internals):

```json
{"id":"F-2026-08-21-01","project":"HR_APP","req":"REQ-...","stage":"s","kind":"missing-fact",
 "what":"OutDir had to be redirected; flow.md did not say so","cost":"20 min, two failed builds",
 "fix":"add the MSB3021 trap","target":"HR_APP/.claude/flow.md · Known traps","promoted":null}
```

Write every path with forward slashes: a lone backslash is either invalid JSON (`\P`) or a silent
escape. Allocate `id` as highest + 1, read at write time — two sessions have collided before.

`kind`: **`missing-fact`** a project fact nobody wrote down · **`missing-step`** a question not
asked or a check not run · **`missing-rule`** something true for every project · **`wrong-order`**
· **`wrong-gate`** · **`missing-skill`** · **`noise`** work with no value. Where each fix lands is
`/retro`'s call — see `flow/FRICTION.md`.

- **No vague entries.** Name what it cost and a concrete change with a target file. "The spec was
  unclear" is not an entry; "the spec never says which timezone, and `/s` guessed" is.
- **`missing-fact` applies itself.** Append it to that project's `.claude/flow.md` in the same run
  and set `promoted` — project-local, gitignored, purely additive. A greenfield project has none
  (§8), so it goes into the card’s spec block and becomes the final `/s` task, setting `promoted`.
  **Everything else waits for `/retro`**, which clusters, proposes a diff and asks. A stage command
  never edits this file or another command file on its own.

Size budget, enforced by `/retro`: this file ≤ 170 lines, each command ≤ 110. At budget, an
addition arrives with a deletion in the same diff. A process that only grows stops being read.
