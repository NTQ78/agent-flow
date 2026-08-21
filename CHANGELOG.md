# Changelog

Every entry here comes from a `/retro` run: what changed in the flow, why, and the friction entries
that justified it. The raw friction log stays out of git.

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
