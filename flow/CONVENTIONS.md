# Conventions for the /intake → /p → /s → /c → /ship chain

Every command in the chain MUST read this file before doing anything else.

## 1. Where things live

Root: `D:\Agent-Projects\` — grouped by project, then one folder per request:

```
D:\Agent-Projects\<project>\
  releases\<YYYY-MM-DD>-NN.md    <- /ship writes, one file per deploy
  <REQ-ID>-<slug>\
    00-request.md                <- /intake writes
    01-spec.md                   <- /p writes
    02-build-log.md              <- /s writes
    03-verify\                   <- /c writes (screenshots, logs, report)
```

- `<project>` = the folder name of the project root (`HR_APP`, `aiur--hr`, `VILOG`), or the one a
  new project will get. Derive it; never invent a second name for the same project.
- `REQ-ID` = `REQ-YYYY-MM-DD-NN`. **`NN` is global per calendar day across every project**, and
  scanning is not enough: three collisions happened in one day because two sessions read the same
  empty gap. **Claim the number by creating the folder first**, then re-scan — if the id now
  appears twice, the later folder moves. An empty folder holds its number as loudly as a real one.
  Get the date with `date +%Y-%m-%d` **every run**; **never guess it**, and never carry yesterday's
  date through a session that has crossed midnight. `slug` = kebab ASCII, no diacritics, ≤6 words.
- **Code never lives here.** This folder holds documents and artifacts only; code stays in the
  real repo. Single exception: the request is a brand-new project with no repo yet — then create
  `src\` inside the request folder and state that explicitly in `00-request.md`.

## 2. State

The frontmatter of `00-request.md` is the single source of truth; each command advances `status`
to the next stage when it finishes:

```yaml
---
id: REQ-2026-08-21-01
title: Night shift crossing midnight is attributed to the wrong day
requester: Julia Mai
type: bug | feature | rule-change | report
priority: urgent | high | normal | low
deadline: 2026-08-25 | null
size: S | M | L
status: intake | spec | build | verify | done
release: wizard-completion | 2026-08-21-01 | null   # batch NAME at /intake, dated id at /ship
project: D:\Work_Space\HR_APP
targets: [BE, FE, migration, i18n, permission]
open_questions: 3        # count still unanswered
needs_approval: false    # true when it conflicts with a locked business rule
---
```

`status` is what a ticket **claims**; *effective state* is what is **true**. Code lives in one
shared tree, so a ticket's work ships with the next release whether or not its ticket closed —
`/ls` and `/ship` read `status` **plus** whether `02-build-log.md`'s files are in the repo. On
2026-08-28 four tickets reached production at `build`, every gate green.

`release` is assigned at `/intake`, not at deploy: a kebab **name** for the batch this belongs to,
which `/ship` replaces with the dated id it deploys under. A batch is a group somebody chose, not
whatever sits at `verify` on the day. A shipped release is **sealed** — a late ticket gets the next
name, never the shipped id.

## 3. Language

**English** for everything the chain writes and prints; never translate identifiers. Vietnamese
only where a Vietnamese-speaking person reads: the draft message to the requester, and the
end-user changelog (bilingual, English first). Quote the requester **verbatim in their own
language** — a translation is not evidence.

## 4. Gates

- `/intake` → `/p` → `/s` → `/c`: **soft**. If the previous stage is incomplete, print a clear
  warning (what is missing, what the risk is) and continue anyway.
- `/ship`: **hard, across the whole batch** — the batch being every ticket sharing one `release`.
  One of them short of `verify` → STOP for all. No exceptions, no override flag.
- **Stop too when a ticket OUTSIDE the batch has code in the build** (effective state, §2). It
  deploys either way; verify it into the batch, or record in the release file why it rides along.
- `/ship` is **last but optional** — a ticket resting at `verify` is waiting, not stalled.
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

After each command: print a summary, then ask "Run `<next>`?" — run it only if the user agrees.

## 6. Skills — look them up at run time

The installed skill set changes over time (the user adds new ones regularly). **Never assume a
skill exists.** Before any design or UI work, list `~/.claude/skills` and
`<project>/.claude/skills`, read the `description` in each candidate's `SKILL.md`, pick the
closest match and invoke it via the Skill tool. Say which you picked and why when several
overlap; if nothing fits, say so plainly rather than inventing a name.

**A directory is not an available skill.** Cross-check against what the session actually offers; a
name that exists only on disk resolves to a different skill. `/sk` reports which are shadowed.

## 7. Must not look AI-generated

A hard requirement: what ships must read as the work of an in-house design team.

**Rule one: match the existing app, do not introduce a new style.** Before writing any UI, read
the components and tokens already in the repo and reuse them. With no existing app this clause
is inert — the brief and the chosen skill set the direction instead.

Tells to avoid:
- Purple/indigo gradients, glassmorphism, glowing borders — unless the app already uses them
- Emoji in headings, buttons, or table labels
- Cards nested inside cards inside cards, or three perfectly symmetrical feature columns
- Hollow marketing copy, `shadow-lg` everywhere, default icons on every row, one metronomic
  spacing rhythm — and grey placeholders or "John Doe" data: when real assets do not exist the
  direction changes to one that does not need them, it does not fall back to these

Instead: the domain's real labels and data, at the density its users need, from existing components.

**Precedence, when something else mandates a tell.** The requester outranks §7: a tell they
supplied verbatim — exact CSS, a named font, a spacing over a cap — is sign-off. Record it under
"Business rule conflicts" in `00-request.md`, leave `needs_approval` false, and `/c` reports it
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
  (§8), so it goes into `01-spec.md` and becomes the final `/s` task, which sets `promoted`.
  **Everything else waits for `/retro`**, which clusters, proposes a diff and asks. A stage command
  never edits this file or another command file on its own.

Size budget, enforced by `/retro`: this file ≤ 170 lines, each command ≤ 110. At budget, an
addition arrives with a deletion in the same diff. A process that only grows stops being read.
