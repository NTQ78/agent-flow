# agent-flow

A chain of Claude Code slash commands that carries a work request from intake to deploy, with the
state living in a ticket on disk rather than in the conversation.

```
/intake  →  /p  →  /s  →  /c  →  /ship
```

Plus three support commands: `/ls` (open ticket overview, `/ls board` for the same as a shareable
HTML dashboard), `/sk` (audit and update the global skills, `/sk trending` for what exists that you
do not have), and `/retro` (turn accumulated friction into changes to the flow itself).

## Why a ticket, not a conversation

Slash commands have no memory between invocations. So each request becomes a folder, and the
frontmatter of `00-request.md` is the single source of truth for where it stands. Every command
takes a ticket ID and reads its own context — nothing has to be retold.

```
D:\Agent-Projects\<project>\<REQ-ID>-<slug>\
  00-request.md      /intake — the request, open questions, impact scope
  01-spec.md         /p      — files, signatures, migration, i18n, test checklist
  02-build-log.md    /s      — what was built, what broke, what was fixed outside scope
  03-verify\         /c      — test results, screenshots, slop-test, review findings
  04-deploy.md       /ship   — target, backup path, rollback notes, changelog
```

Code never lives there; it stays in the real repo. The ticket store is outside this repo too.

## The five stages

| Stage | Command | Job | Entry gate |
|---|---|---|---|
| 01 | `/intake` | Normalise a raw request into a ticket; separate UX references from scope; cross-check locked business rules; list impact | none |
| 02 | `/p` | Technical spec at file-and-signature level, both i18n locales, numbered test case checklist | soft |
| 03 | `/s` | Execute in order, building after each part, tests alongside the code | soft |
| 04 | `/c` | Prove the real app works — not merely that the suite is green | soft |
| 05 | `/ship` | Ask the target, back up, confirm the migration, smoke test, changelog | **hard** |

`/ship` is last but **optional**, and it ships a batch: tickets accumulate at `verify` and one
release closes them all, recorded once in `releases/<date>-NN.md`. A ticket resting at `verify` is
waiting for a release, not stalled — `/ls` never flags it.

Soft gate: warn about what is missing, then continue. Hard gate: stop, with no override flag.

After each stage the command prints a summary and asks whether to run the next one. It never
auto-runs unasked.

## Two constraints that are not preferences

**Skills are looked up at run time.** No command hard-codes a skill name. When design or UI work
comes up, the command lists `~/.claude/skills`, reads each `description`, picks the closest match,
and says which one it picked and why. Installing a new skill therefore needs no command edit.

**The result must not look AI-generated.** Rule one is matching the existing app — read the
components and tokens already in the repo and reuse them — not picking nicer colours. `CONVENTIONS.md`
§7 carries the full list of tells to avoid, and `/c` checks screenshots against it. A failure means
fixing the UI, not noting it and moving on.

## How it improves itself

The chain was written against one project. Running it on others exposes gaps, and a gap that is
noticed but not recorded gets rediscovered every time. So every stage appends what the process itself
got wrong to `~/.claude/flow/friction.jsonl` as it happens — what it cost, and a concrete change with
a target file. Vague entries are refused: "the spec was unclear" is not one, "the spec never says
which timezone, and `/s` had to guess" is.

The split that keeps this from rotting:

- **Facts apply themselves.** A trap, a renamed build command, an undocumented deploy step gets
  appended to that project's `.claude/flow.md` in the same run. That file is project-local and
  gitignored, and the change is purely additive.
- **Rules wait for approval.** Anything touching `CONVENTIONS.md` or a command file changes
  behaviour for *every* project, so `/retro` clusters the entries, proposes a diff with the entry ids
  behind it, and stops. A stage command never edits the spine on its own.

`/retro` is also responsible for shrinking the process. It looks for `noise` clusters, rules nothing
has ever cited, and contradictions — and there is a size budget (`CONVENTIONS.md` ≤ 170 lines, each
command ≤ 110) that forces a deletion to accompany an addition once the budget is reached. A process
that only grows stops being read.

Thresholds, the three checks before proposing anything, and the deletion path live in
`flow/FRICTION.md`. `CHANGELOG.md` records what every `/retro` run actually changed.

## Layout

```
commands/            the eight slash commands
flow/CONVENTIONS.md  the shared spine — storage, state, gates, language, skills, anti-AI rules
flow/FRICTION.md     promotion rules; only /retro reads it
templates/           flow.md.example — redacted per-project config to copy and fill in
sync.ps1             two-way sync with ~/.claude
CHANGELOG.md         what each /retro run changed, and why
```

Precedence when sources conflict: **what the user says** › **`<project>/.claude/flow.md`** ›
**`CONVENTIONS.md`**.

Change the process in `CONVENTIONS.md`, which every command reads first — not in seven files.

## Install

```powershell
git clone <this repo> D:\agent-flow
cd D:\agent-flow
.\sync.ps1 -Push          # repo -> ~/.claude
```

Then create the ticket store and the per-project config:

```powershell
New-Item -ItemType Directory -Force D:\Agent-Projects\<project>
Copy-Item templates\flow.md.example <project root>\.claude\flow.md
```

Fill in that `flow.md`. Without it the commands will ask for build commands, deploy targets and
traps rather than guess them.

## Sync

The repo is the manifest: whatever sits under `commands/` and `flow/` here is tracked, so unrelated
commands in `~/.claude` are left alone.

```powershell
.\sync.ps1            # show which tracked files differ
.\sync.ps1 -Pull      # ~/.claude -> repo   (you edited the live files)
.\sync.ps1 -Push      # repo -> ~/.claude   (you edited the repo, or just cloned)
```

Running it with no switch also lists commands present in `~/.claude/commands` that the repo does
not track yet. Copy one into `commands/` to start tracking it.

## What is deliberately not here

`<project>/.claude/flow.md` — the real per-project config. It holds server addresses, database
names, test accounts and a client's internal business rules, so it is gitignored and only the
redacted template ships. Keep it that way even in a private repo: private repos get flipped by
accident, and git history is not easy to erase.

`~/.claude/flow/friction.jsonl` — the raw friction log, for the same reason: it quotes whatever the
stages ran into. What survives into git is the conclusion, in `CHANGELOG.md` and in the history of
`CONVENTIONS.md`.

`D:\Agent-Projects` — the ticket store. Operational data, not process definition.

## Language

Everything the chain writes is English: request, spec, build log, verify report, deploy notes,
terminal output. Two exceptions, both because a specific person reads them — the draft message
asking the requester a question, and the bilingual end-user changelog. Identifiers are never
translated, and the requester's own words are quoted verbatim in whatever language they used.
