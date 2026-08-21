# Promotion rules for the friction log

Only `/retro` reads this file. The stages only need the entry schema and the `kind` table in
`CONVENTIONS.md` §9.

## What earns a change

- `missing-fact` — already applied by the stage that found it. `/retro` only verifies it is still
  true and worded so the next run actually notices it.
- Everything else — **two or more occurrences**, or **one occurrence with a severe cost**: work
  lost, wrong data written to a live system, a broken deploy, a rule violated without anyone
  noticing.
- One occurrence, one project, low cost → leave it in the log and report it as *watching*. Most
  entries should end here. A process that changes on every single observation is noise.

## Where the change goes

- Two or more **distinct projects** → the fix belongs in `CONVENTIONS.md`, not in one `flow.md`.
  If a matching rule already sits in one project's `flow.md`, propose moving it up **and** deleting
  it from there in the same diff. Never leave both copies.
- One project only → that project's `.claude/flow.md`, however many times it recurred.
- A missing question, check or ordering inside one stage → that command file, never the spine.

## Three checks before proposing anything

1. **Is it still true?** Verify against the code and tooling as they are now. A trap may have been
   fixed upstream; a build command may have been renamed. Proposing a stale rule is worse than
   proposing nothing.
2. **Does a rule already cover it?** Then the gap is that the rule was not followed or not
   findable. Propose rewording or relocating it — not a second rule saying the same thing.
3. **Does it contradict an existing rule?** Resolve it explicitly and delete the losing rule in the
   same diff. Two contradicting rules is how a process becomes unreadable.

## Deletions are half the job

Every `/retro` run must look for things to remove:

- `noise` clusters → propose deleting that step outright
- Rules no entry has ever cited and no run has ever triggered → propose deleting them
- Project sections describing a system that no longer exists

Check the budget in `CONVENTIONS.md` §9. At or over budget, every addition must be paired with a
deletion in the same diff.

## Closing the loop

- Approved entries: set `promoted` to today's date.
- Rejected entries: set `promoted` to `rejected <date>` plus a one-line reason, so the same
  suggestion does not resurface on every run.
- Record what changed in the flow repo's `CHANGELOG.md`: date, the change, why, and the entry ids.
- One commit per `/retro` run.
