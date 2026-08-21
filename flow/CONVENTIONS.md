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

- `<project>` = the **repo folder name** of the project you are working in (`HR_APP`,
  `aiur--hr`, `VILOG`). Derive it from the project root; do not invent a new name.
- `REQ-ID` = `REQ-YYYY-MM-DD-NN`, NN = sequence within that day (01, 02...). Get the date with
  `date +%Y-%m-%d`. **Never guess the date.**
- `slug` = kebab-case ASCII, no diacritics, max 6 words.
- **Code never lives here.** This folder holds documents and artifacts only; code stays in the
  real repo. Single exception: the request is a brand-new project with no repo yet — then create
  `src\` inside the request folder and state that explicitly in `00-request.md`.

## 2. State

The frontmatter of `00-request.md` is the single source of truth:

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

When a command finishes, it advances `status` to the next stage.

## 3. Language

**English** for everything the chain writes and prints: request, spec, build log, verify report,
deploy notes, terminal output. Never translate identifiers.

Keep Vietnamese only where a Vietnamese-speaking person is the reader:

- the **draft message asking the requester** a question — Vietnamese
- the **end-user changelog** — bilingual, English first, then Vietnamese

Quote the requester's original words **verbatim in whatever language they used**; a translated
quote is no longer evidence.

## 4. Gates

- `/intake` → `/p` → `/s` → `/c`: **soft**. If the previous stage is incomplete, print a clear
  warning (what is missing, what the risk is) and continue anyway.
- `/ship`: **hard**. If `status` has not reached `verify`, or `/c` did not pass → STOP, do not
  deploy. No exceptions, no override flag.

## 5. Chaining

After each command: print a result summary, then ask "Run `<next command>`?". If the user agrees,
run it in the same turn. Never auto-run without agreement.

## 6. Skills — look them up at run time

The installed skill set changes over time (the user adds new ones regularly). **Never assume a
skill exists.** Before any design or UI work:

```bash
ls ~/.claude/skills
ls <project>/.claude/skills 2>/dev/null
```

Read the `description` line in each candidate's `SKILL.md`, pick the closest match, invoke it via
the Skill tool. If several overlap, pick one and say which and why. If nothing fits, say so
plainly — do not invent a skill name.

## 7. Must not look AI-generated

This is a hard requirement, not a preference. What ships to the customer must read as the work of
an in-house design team.

**Rule one: match the existing app, do not introduce a new style.** Before writing any UI, read
the components and tokens already in the repo and reuse them.

Tells to avoid:
- Purple/indigo gradients, glassmorphism, glowing borders — unless the app already uses them
- Emoji in headings, buttons, or table labels
- Cards nested inside cards inside cards
- Hollow marketing copy translated from English
- Three perfectly symmetrical feature columns
- `shadow-lg` sprinkled on everything
- Default icons attached to every row "for visual interest"
- Metronomic, identical spacing rhythm in every section
- Grey placeholder images, sample data like "John Doe" or lorem ipsum

Instead: real Vietnamese HR labels and data, information density suited to internal users who key
in data all day, and reuse of existing components.

If any installed skill ships a checker for this (a `slop-test.md`, `anti-patterns.md` or
equivalent), use it as the checklist in `/c`.

## 8. Per-project config

The commands are global, so they hard-code no project detail. Details come from:

```
<project root>/.claude/flow.md
```

That file declares build/test commands, how to run the app, known traps, locked business rules,
and deploy targets. If a project has no such file, ask the user for what you need and offer to
create it — do not guess.
