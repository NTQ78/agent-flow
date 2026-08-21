---
description: Read the friction log, cluster it, and propose changes to the flow — additions and deletions
argument-hint: (empty) = everything unpromoted | <project> | <kind> | watching
---

Read `~/.claude/flow/CONVENTIONS.md` §9 and `~/.claude/flow/FRICTION.md` first. FRICTION.md holds the
promotion rules; follow them rather than improvising thresholds.

Filter: $ARGUMENTS — empty = all entries with `promoted: null`; a project name or a `kind` narrows it;
`watching` re-reads the entries previously left below threshold.

Locate the flow repo (for CHANGELOG and the commit) by finding a clone that contains
`flow/CONVENTIONS.md`; `D:\agent-flow` is the usual place. If there is no such clone, do everything
else and say the commit step was skipped.

## 1. Load

Read `~/.claude/flow/friction.jsonl`. If nothing matches the filter, say so and stop — do not invent
work. Otherwise print counts by `kind` and by project, and the date range covered.

## 2. Cluster

Group entries that describe the **same underlying gap**, even when worded differently. Report each
cluster with its occurrence count and the projects it spans.

This step is where the value is. Five entries that are one gap produce one change, not five. Five
entries that look similar but have different causes must stay separate, or the fix addresses none of
them.

## 3. Decide what earns a change

Apply the thresholds in FRICTION.md. State the verdict for every cluster, including the ones that do
not qualify — those are reported as *watching*, not silently dropped. Most clusters should end there.

## 4. Run the three checks

For each cluster that qualifies, run the three checks in FRICTION.md before writing any diff: is it
still true, is it already covered, does it contradict something. A cluster that fails check 1 gets
its entries marked rejected with the reason.

## 5. Look for what to delete

Every run, not only when over budget:

- `noise` clusters → propose removing that step
- rules no entry has ever cited and no run has ever triggered → propose deleting them
- project sections describing a system that no longer exists

Print the current line count of `CONVENTIONS.md` and of each command against the budget. At or over
budget, every addition must be paired with a deletion in the same diff.

## 6. Present the diff, then stop

Group proposals by target file. For each one:

- target file and section
- the exact before/after text
- the entry ids that justify it
- one line on what adopting it costs — a longer spec, one more question at intake, a slower verify

Then **stop and ask which to apply.** Nothing is written until the answer comes back. This is the
whole reason the process is allowed to change itself at all.

## 7. Apply what was approved

- **Re-read the log before writing.** If unpromoted entries appeared since step 1, stop and
  restart the run — the clustering and the thresholds were decided on a stale snapshot.
- Write the approved diffs, and nothing else.
- Set `promoted` to today's date on the entries behind them.
- Set `promoted` to `rejected <date>` plus a one-line reason on entries you are declining, so the
  same suggestion does not resurface every run.
- Leave `watching` entries as `null`.
- Append to the repo's `CHANGELOG.md`: date, what changed, why, entry ids.
- In the repo, run `.\sync.ps1 -Pull`, then one commit for this run, the message naming the changes.
  Do not push; leave that to the user.

## 8. Report

What changed, what is still watching, what was rejected and why, and the new line counts against
budget. If any cluster pointed at a missing skill, say so — that is a `/sk` job, not a flow change.
