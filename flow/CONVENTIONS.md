# Conventions for the /intake → /p → /s → /c → /ship chain

Every command in the chain MUST read this file before doing anything else.

## 1. Where things live

Root: `D:\Agent-Projects\` — grouped by project, then one folder per request:

```
D:\Agent-Projects\<project>\<REQ-ID>-<slug>\
  00-request.md      <- /intake writes
  01-spec.md         <- /p writes
  02-build-log.md    <- /s writes
  03-verify\         <- /c writes (screenshots, logs, report)
  04-deploy.md       <- /ship writes
```

- `<project>` = the folder name of the project root you are working in (`HR_APP`, `aiur--hr`,
  `VILOG`) — whatever tree it sits in. For a project that does not exist yet, it is the folder
  name the new project will get. Derive it; never invent a second name for the same project.
- `REQ-ID` = `REQ-YYYY-MM-DD-NN`. **`NN` is global per calendar day across every project**, so
  `/intake` scans all project folders for that date before allocating. Get the date with
  `date +%Y-%m-%d`; **never guess it**. `slug` = kebab-case ASCII, no diacritics, max 6 words.
- **Code never lives here.** This folder holds documents and artifacts only; code stays in the
  real repo. Single exception: the request is a brand-new project with no repo yet — then create
  `src\` inside the request folder and state that explicitly in `00-request.md`.

## 2. State

The frontmatter of `00-request.md` is the single source of truth; each command advances `status`
to the next stage when it finishes:

```yaml
---
id: REQ-2026-08-21-01
slug: night-shift-attribution
title: Night shift crossing midnight is attributed to the wrong day
requester: Julia Mai
source: paste | docs | outlook | teams
type: bug | feature | rule-change | report
priority: urgent | high | normal | low
deadline: 2026-08-25 | null
size: S | M | L
status: intake | spec | build | verify | ship | done
project: D:\Work_Space\HR_APP
targets: [BE, FE, migration, i18n, permission]
open_questions: 3        # count still unanswered
needs_approval: false    # true when it conflicts with a locked business rule
created: 2026-08-21
---
```

## 3. Language

**English** for everything the chain writes and prints: request, spec, build log, verify report,
deploy notes, terminal output. Never translate identifiers.

Keep Vietnamese only where a Vietnamese-speaking person is the reader: the draft message asking
the requester a question, and the end-user changelog (bilingual, English first).

Quote the requester's original words **verbatim in whatever language they used**; a translated
quote is no longer evidence.

## 4. Gates

- `/intake` → `/p` → `/s` → `/c`: **soft**. If the previous stage is incomplete, print a clear
  warning (what is missing, what the risk is) and continue anyway.
- `/ship`: **hard**. If `status` has not reached `verify`, or `/c` did not pass → STOP, do not
  deploy. No exceptions, no override flag.
- A step whose **precondition the project does not meet** — no test runner, no locale layer, no
  migrations, no BE — is declared `N/A` in one line with the reason, keeping any numbering a
  later stage consumes. Never leave it blank, and never install machinery to satisfy the step.

## 5. Chaining

After each command: print a result summary, then ask "Run `<next command>`?". If the user agrees,
run it in the same turn. Never auto-run without agreement.

## 6. Skills — look them up at run time

The installed skill set changes over time (the user adds new ones regularly). **Never assume a
skill exists.** Before any design or UI work, list `~/.claude/skills` and
`<project>/.claude/skills`, read the `description` in each candidate's `SKILL.md`, pick the
closest match and invoke it via the Skill tool. Say which you picked and why when several
overlap; if nothing fits, say so plainly rather than inventing a name.

**A directory is not an available skill.** Cross-check the names against the skills actually
available in the session and ignore any that exist only on disk — a shadowed name resolves to a
different skill of the same name, silently. `/sk` reports which ones are shadowed.

## 7. Must not look AI-generated

This is a hard requirement, not a preference. What ships to the customer must read as the work of
an in-house design team.

**Rule one: match the existing app, do not introduce a new style.** Before writing any UI, read
the components and tokens already in the repo and reuse them. With no existing app this clause
is inert — the brief and the chosen skill set the direction instead.

Tells to avoid:
- Purple/indigo gradients, glassmorphism, glowing borders — unless the app already uses them
- Emoji in headings, buttons, or table labels
- Cards nested inside cards inside cards
- Hollow marketing copy translated from English
- Three perfectly symmetrical feature columns
- `shadow-lg` sprinkled on everything
- Default icons on every row, and one metronomic spacing rhythm repeated in every section
- Grey placeholder images, sample data like "John Doe" or lorem ipsum — when real assets do not
  exist the direction changes to one that does not need them, it does not fall back to these

Instead: the real labels and data of the domain, at the information density its actual users
need, built from components that already exist.

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

That file declares build/test commands, how to run the app, known traps, locked business rules,
and deploy targets. If a project has no such file, ask the user for what you need and offer to
create it — do not guess. A greenfield project has none **by design**: do not block on it, and
let `/s` write it at the end of the build so later runs inherit the traps this one found.

## 9. Friction log — how this process improves itself

Every stage records where **the process itself** fell short, as it happens. One JSON object per
line, appended to `~/.claude/flow/friction.jsonl` (never committed — it quotes project internals):

```json
{"id":"F-2026-08-21-01","date":"2026-08-21","project":"HR_APP","req":"REQ-2026-08-21-01",
 "stage":"s","kind":"missing-fact","what":"OutDir had to be redirected; flow.md did not say so",
 "cost":"20 min, two failed builds","fix":"add the MSB3021 trap",
 "target":"HR_APP/.claude/flow.md · Known traps","promoted":null}
```

Write every path with forward slashes. A lone backslash in a JSON string is either invalid —
`\P` in `D:\Project` — or a silent escape: `\f` in `\flow.md` ate the `f`. Both corrupt the log.
Allocate `id` as the highest existing number + 1, read at write time; two sessions appending by
eye have already collided twice.

`kind` is one of: **`missing-fact`** a project fact nobody wrote down · **`missing-step`** a
question not asked or a check not run · **`missing-rule`** something that should hold for every
project · **`wrong-order`** · **`wrong-gate`** · **`missing-skill`** no installed skill covered
the work · **`noise`** work with no value, a deletion candidate. Where each one's fix lands is
`/retro`'s call — see `flow/FRICTION.md`.

Two rules for writing entries:

- **No vague entries.** An entry must name what it cost and a concrete change with a target file.
  If you cannot name the target, it is not friction worth logging. "The spec was unclear" is not an
  entry; "the spec never says which timezone, and `/s` had to guess" is.
- **`missing-fact` applies itself.** Append it to that project's `.claude/flow.md` in the same run
  and set `promoted` — that file is project-local, gitignored, and the change is purely additive.
  **Everything else waits for `/retro`**, which clusters the entries, proposes a diff and asks. A
  stage command never edits this file or another command file on its own.

Size budget, enforced by `/retro`: this file ≤ 170 lines, each command ≤ 110. At budget, an addition
must arrive with a deletion in the same diff. A process that only grows stops being read.
