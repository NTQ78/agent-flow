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
2. Get today's date with `date +%Y-%m-%d` to compute age from the date inside `REQ-ID`. Never
   guess the date.
3. Print the table, sorted: past deadline first, then `priority`, then longest-sitting.

| REQ-ID | Project | Title | Type | Priority | Size | Stage | Age | Deadline | Flags |

- **Stage**: `intake → spec → build → verify → done`, marking the current one
- **Age**: days from the date in `REQ-ID`
- **Flags**: `past deadline` · `N open questions` · `awaiting rule sign-off` · `awaiting release`
  (at `verify`) · `stalled` (no stage change in 7 days, and **never** for a ticket at `verify` —
  shipping is optional and batched, so resting there is waiting, not stalling)

## After the table

- **Needs your answer**: the open questions currently blocking, listed per ticket — this is the
  most useful part, because tickets usually stall here rather than in the code
- **Awaiting business rule sign-off**: tickets with `needs_approval: true`
- **Ready for the next stage**: which ticket can move with which command, right now
- **Pending release**: every ticket at `verify`, with a count — this is what one `/ship` would
  deploy together
- **Suspected stalled**: no status change in over 7 days

Close with one line: total open tickets, how many are blocked, which one to pick up next and why.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more, add one
line: `N unpromoted friction entries — run /retro`.
