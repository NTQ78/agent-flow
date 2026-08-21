---
description: Overview of REQ tickets under D:\Agent-Projects — which stage, how long they have sat
argument-hint: (empty) | open | done | <project> | <keyword>
---

Read `~/.claude/flow/CONVENTIONS.md` for the frontmatter schema.

Filter: $ARGUMENTS — `open` = not yet `done` (the default when empty), `done` = finished, a project
folder name = that project only, any other word = match on title/slug.

## What to do

1. Walk `D:\Agent-Projects\<project>\`, reading the frontmatter of each `00-request.md`. Report
   folders with no `00-request.md` separately under "Broken folders".
2. Get today's date with `date +%Y-%m-%d` to compute age. Never guess the date.
3. Print the table, sorted: past deadline first, then `priority`, then longest-sitting.

| REQ-ID | Project | Title | Type | Priority | Size | Stage | Age | Deadline | Flags |

- **Stage**: `intake → spec → build → verify → ship → done`, marking the current one
- **Age**: days since `created`
- **Flags**: `past deadline` · `N open questions` · `awaiting rule sign-off` · `stalled` (no stage
  change in 7 days)

## After the table

- **Needs your answer**: the open questions currently blocking, listed per ticket — this is the
  most useful part, because tickets usually stall here rather than in the code
- **Awaiting business rule sign-off**: tickets with `needs_approval: true`
- **Ready for the next stage**: which ticket can move with which command, right now
- **Suspected stalled**: no status change in over 7 days

Close with one line: total open tickets, how many are blocked, which one to pick up next and why.
