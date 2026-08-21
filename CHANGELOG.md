# Changelog

Every entry here comes from a `/retro` run: what changed in the flow, why, and the friction entries
that justified it. The raw friction log stays out of git.

## 2026-08-21 — first /retro run

Seven fixes from 8 friction entries, all from `velorah-hero`, the first project run that was not
HR_APP. Four clusters, each with two independent occurrences.

- **§7 has no requester-authorised deviation** (F-02, F-12) — a tell the requester supplied verbatim
  is sign-off, not slop: recorded in `00-request.md`, `needs_approval` stays false, and `/c` splits
  slop-test failures into *fix now* (what the agent chose) and *report only* (what the customer
  asked for). Without this a careless run silently rewrites requested values; F-12 caught five.
- **Steps that assume capabilities the project lacks** (F-04, F-05) — one rule in §4 instead of two
  step edits: a step whose precondition is absent is declared `N/A` with a reason, keeping the
  numbering a later stage consumes. `/p` Step 5 (i18n) and Step 6 (tests) now say so explicitly.
- **Specifying from memory what only the installed artifact can tell you** (F-09, F-10, corroborated
  by F-08) — plugin config exports, generated utility classes and types a major version removed are
  inspected, not recalled; greenfield FE order is manifest → install → tooling config → code.
- **Greenfield onboarding** (F-01, part of F-03) — `<project>` is the project root folder name in
  whatever tree it sits, including one that does not exist yet; a greenfield project has no
  `flow.md` by design and `/s` writes it at the end of the build.
- **§6: a directory is not an available skill** (from `/sk`) — cross-check the listing against the
  skills actually available; a shadowed name resolves to a different skill silently.
- **§9: write paths with forward slashes** — a lone backslash in a JSON string is either invalid
  (`\P`) or a silent escape (`\f` in `\flow.md` ate the `f`). Five of twelve entries were
  unreadable and four had corrupted targets; all repaired.
- **FRICTION.md: the placement rules govern facts, not process gaps** — a missing step cannot be
  fixed in a project file however few projects reported it; judge it structural vs incidental.

Deletions, to stay inside the budget: the HR-specific "real Vietnamese HR labels" guidance left §7
for HR_APP's `flow.md`, where it belongs — in the spine it was wrong for every other project. The
`slop-test.md` pointer left §7 too; `/c` Step 4 already carried it verbatim, and `/sk` established
no global skill ships such a file. §2, §3 and §6 were compressed without losing meaning.

`CONVENTIONS.md` 164 → 168/170 · `p.md` 94 → 105/110 · `c.md` 80 → 85/110.

Left watching: F-18, whether `/p` should choose the stack version on greenfield work — one
occurrence, real machinery. Nothing rejected.

Logged during the run: F-19. `/retro` read the log at step 1 and wrote at step 7 without re-reading;
another session appended 5 entries meanwhile, including the first from a second project, and the id
`/retro` appended collided with one that had arrived. Ids need max+1 allocation at write time and
step 7 needs a re-read.

## 2026-08-21 — self-improvement loop

Added `/retro`, plus a friction log the stages write to as they go.

- `CONVENTIONS.md` §9: entry schema, the `kind` taxonomy that decides where a fix belongs, and the
  rule that facts apply themselves to a project's `flow.md` while rules wait for approval
- `flow/FRICTION.md`: promotion thresholds, the three checks before proposing anything, and the
  deletion path
- All five stages record friction at close-out, aimed at the signal each one naturally produces —
  `/s` at traps and out-of-scope fixes, `/c` at untested cases and gates that let a failure through
- `/ship` and `/ls` print a one-line nudge at five or more unpromoted entries
- A size budget: `CONVENTIONS.md` ≤ 170 lines, each command ≤ 110. At budget, an addition must
  arrive with a deletion in the same diff

Why: the flow was written against one project. Running it on others will expose gaps, and gaps that
are noticed but not recorded get rediscovered every time.

Why not fully automatic: a process that rewrites its own rules unsupervised accumulates
contradictions until nobody reads it. Facts are additive and project-local, so they apply
themselves. Rules change behaviour everywhere, so they get a diff and a yes.

## 2026-08-21 — initial

The `/intake → /p → /s → /c → /ship` chain, plus `/ls` and `/sk`.
