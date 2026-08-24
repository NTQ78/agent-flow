---
description: Overview of REQ tickets under D:\Agent-Projects — which stage, how long they have sat
argument-hint: (empty) | open | done | board | <project> | <keyword>
---

Read `~/.claude/flow/CONVENTIONS.md` for the frontmatter schema.

Filter: $ARGUMENTS — `open` = not yet `done` (the default when empty), `done` = finished, a project
folder name = that project only, any other word = match on title/slug. `board` renders the same data
as an HTML page instead of a terminal table, and combines with a filter (`board done`).

## What to do

1. Walk `D:\Agent-Projects\<project>\`, reading the frontmatter of each `00-request.md`. Report
   folders with no `00-request.md` separately under "Broken folders".
2. Get today's date with `date +%Y-%m-%d` to compute age from the date inside `REQ-ID`. Never
   guess the date.
3. Draw the table, sorted: past deadline first, then `priority`, then longest-sitting.

## The table

Box-drawing, one row per ticket, **≤ 120 columns total**. A table that wraps is worse than no table:
truncate any cell with `…` and never let one wrap. Widths adapt to the content actually present —
drop the `Due` column entirely when no ticket has a deadline.

```
┌──────────┬────────────┬──────────────────────────────┬──────┬──────┬───┬──────────────┬─────┬───────┐
│ REQ-ID   │ Project    │ Title                        │ Type │ Pri  │ S │ Stage        │ Age │ Flags │
├──────────┼────────────┼──────────────────────────────┼──────┼──────┼───┼──────────────┼─────┼───────┤
│ 08-21-01 │ velorah-h… │ Velorah single-page hero — … │ feat │ norm │ S │ ████░ verify │  3d │ → ?4  │
│ 08-24-01 │ HR_APP     │ Positions page offers crea…  │ bug  │ norm │ S │ ███░░ build  │  0d │       │
└──────────┴────────────┴──────────────────────────────┴──────┴──────┴───┴──────────────┴─────┴───────┘
```

- **REQ-ID**: drop `REQ-` and the year — `08-24-01`. Restore the year only when two years are on
  screen at once.
- **Stage**: a five-cell bar plus the name, filled cells being stages passed — `intake` `█░░░░`,
  `spec` `██░░░`, `build` `███░░`, `verify` `████░`, `done` `█████`.
- **Age**: days from the date in `REQ-ID`. **Due**: the deadline, or `—`.
- **Flags**: symbols, with a legend under the table naming only the ones actually in use —
  `!` past deadline · `?N` N open questions · `§` awaiting rule sign-off · `→` awaiting release
  (at `verify`) · `~` stalled (no stage change in 7 days, and **never** for a ticket at `verify` —
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

## `board` — the same data as an HTML page

Only with `board`. The walk, the sort and the flags are unchanged; only the rendering is. Print the
published link and the closing summary line, and skip the terminal table.

- Load the `artifact-design` skill first, per CONVENTIONS §6, and let it set the direction. §7's
  banned tells still hold; its "match the existing app" clause is inert here — there is no app.
- **Always write `~/.claude/flow/board.html`.** The same path redeploys to the same URL, so a link
  handed out last week keeps working. From a later session that URL is not in context: find it with
  the Artifact tool's `list` action and pass it back as `url`. Never publish a second board.
- Layout: one column per stage — `intake` `spec` `build` `verify`, each headed by its count, with
  `done` appearing only under the `done` filter. Each ticket is a card carrying REQ-ID, project,
  title, type and size, age, and its flags. Past-deadline and stalled cards have to be findable
  without reading every card.
- Under the columns, the two panels that carry the actual decisions: **Needs your answer**, every
  open question grouped by ticket and quoted as written, and **Pending release**, the `verify` batch
  one `/ship` would deploy together, with its count.
- Stamp the page with the date it was generated. An undated dashboard keeps getting trusted after it
  has gone stale.
