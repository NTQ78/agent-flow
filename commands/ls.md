---
description: Overview of the cards on the LynkFlow boards — which column, how long they have sat
argument-hint: (empty) | open | done | <project> | <keyword>
---

Read `~/.claude/flow/CONVENTIONS.md` for the column model.

Filter: $ARGUMENTS — `open` = not yet Done (the default when empty), `done` = closed, a project
name = that board only, any other word = match on title.

`LF` means `node C:\Users\VNT\.claude\flow\lf.js`.

## What to do

1. `LF ls` with no argument walks every board named in `~/.claude/flow/board.json`. For the cards
   that matter, `LF get LF-N` to read gates, labels and the open questions.
2. Get today's date with `date +%Y-%m-%d` to compute age from each card's creation date. Never
   guess the date.
3. Draw the table, sorted: past due first, then priority, then longest-sitting.

## The table

Box-drawing, one row per card, **≤ 120 columns total**. A table that wraps is worse than no table:
truncate any cell with `…` and never let one wrap. Widths adapt to the content actually present —
drop the `Due` column entirely when no card has a deadline.

```
┌────────┬────────────┬──────────────────────────────┬──────┬──────┬───┬──────────────┬─────┬───────┐
│ Card   │ Project    │ Title                        │ Type │ Pri  │ P │ Column       │ Age │ Flags │
├────────┼────────────┼──────────────────────────────┼──────┼──────┼───┼──────────────┼─────┼───────┤
│ LF-42  │ velorah-h… │ Velorah single-page hero — … │ feat │ med  │ 2 │ ████░ Review │  3d │ → ?4  │
│ LF-51  │ HR_APP     │ Positions page offers crea…  │ bug  │ med  │ 5 │ ███░░ In pr… │  0d │       │
└────────┴────────────┴──────────────────────────────┴──────┴──────┴───┴──────────────┴─────┴───────┘
```

- **Column**: a five-cell bar plus the name, filled cells being stages passed — `Backlog` `█░░░░`,
  `Todo` `██░░░`, `In progress` `███░░`, `Review` `████░`, `Done` `█████`.
- **P**: story points. **Age**: days since the card was created. **Due**: the due date, or `—`.
- **Flags**: symbols, with a legend under the table naming only the ones actually in use —
  `!` past due · `?N` N open questions · `§` labelled `needs-approval` · `→` waiting on `/ship`
  (in Review) · `~` stalled (no column change in 7 days, and **never** for a card in Review —
  shipping is optional and batched, so resting there is waiting, not stalling)

A card whose gates disagree with its column — `Build` ticked but sitting in Todo — is worth a line
of its own. It usually means a run stopped halfway.

## After the table

- **Needs your answer**: the open questions currently blocking, per card — this is the most useful
  part, because cards usually stall here rather than in the code. Quote them as written.
- **Awaiting business rule sign-off**: cards labelled `needs-approval`
- **Ready for the next stage**: which card can move with which command, right now
- **Waiting in Review**: the group one `/ship` would close together, with a count
- **Already in the build**: any card not in Review or Done whose build block names files that
  exist in the repo. Its code ships with the next deploy whatever its column says (CONVENTIONS
  §2) — listing it is the only thing standing between that and a silent release
- **Blocked**: cards pulled back to In progress by `/c`, with the reason from the latest comment
- **Suspected stalled**: no column change in over 7 days

Close with one line: total open cards, how many are blocked, which one to pick up next and why.

Then count entries in `~/.claude/flow/friction.jsonl` with `promoted: null`. At five or more, add
one line: `N unpromoted friction entries — run /retro`.

## No HTML render

This command used to publish `flow/board.html` as an artifact. The LynkFlow board now does that
job with live data, so the HTML page was dropped rather than kept in parallel — two dashboards
disagreeing is worse than one. Point people at the board instead; `LF ls <project>` prints its
link source, and `board.json` holds each board's id.
