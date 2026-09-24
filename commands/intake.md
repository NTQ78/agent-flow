---
description: Take in a raw request and open it as a card in the project's LynkFlow board
argument-hint: request description | path to file/image | outlook | teams
---

Read `~/.claude/flow/CONVENTIONS.md` first. Then read the current project's `.claude/flow.md`
(if present) for locked business rules and context.

Input: $ARGUMENTS

`LF` below means `node C:\Users\VNT\.claude\flow\lf.js` — always the absolute path.

## Step 1 — Get the raw request

Work out the source from the input. `outlook` and `teams` mean the requester's recent mail or
thread — read the body *and* the attachments, and collect the amendments scattered through a
thread, not just the first message. Anything else is a path, a link or the description itself.

**Open every artefact the request points at, whatever form it took** — data file, returned form,
mockup, a screenshot handed back only as base64. Each one carried the fact that sized the ticket.
Cannot open one? Say so on the card. Resolve the project from the REQUEST, not the cwd.

Extract the request verbatim. Keep the requester's original wording — **in their own language** —
in its own section. When scope is disputed later, that quote is the evidence.

## Step 2 — Classify and strip the noise

- Type: `bug` | `feature` | `rule-change` | `report`
- **Separate the actual request from UX references.** "Make it like this" on someone else's app is
  a reference for how it should *feel*. Put it under "UX references", keep it out of scope.
- State explicitly what is **out of scope**, where confusion is likely.

## Step 3 — Check against locked business rules

Read the locked rules in `.claude/flow.md`. If the request contradicts any of them:

- label the card `needs-approval`; **do not** quietly implement the new behaviour
- name the rule and where exactly it conflicts
- draft the question asking for sign-off on changing the rule

## Step 4 — Check against cards already on the board

`LF ls <project>` and read the titles. For anything close, `LF get LF-N`. Look for:

- duplicates → report them, ask whether to merge
- older cards this request would contradict → warn about the silent conflict, cite the `LF-N`

## Step 5 — Impact scope

Survey the real code (grep and read; do not guess) — the point is to catch work that looks small
and spreads: FE screens; BE endpoints / handlers / entities; which roles see the change; reports,
exports, jobs and email templates depending on the touched code.

**Name the cards that touch the same files**, open or not, and say which must land first.

## Step 6 — Priority, deadline, size

- `priority` and `deadline`: if the requester did not say, add it to the open questions and use
  `MEDIUM` with no due date
- `size`: `S` (under half a day) | `M` (1–2 days) | `L` (more) → story points `2 / 5 / 8`.
  Rough only; `/p` reassesses.

## Step 7 — Open questions

List every remaining ambiguity. Each question must be specific, answerable in one sentence, and
state the consequence of guessing wrong. Do not ask what reading the code would answer.

Add a draft message to the requester — **written in Vietnamese**, colleague tone, every question
gathered into a single ask.

**Greenfield floor.** A new product needs five answers before it can be named: brand, page list,
does it transact, language/currency, where assets come from. Missing any → name the board from
the request slug, say on the card the name is **provisional** (§1's one sanctioned exception).

## Step 8 — Open the card

Write the body to a scratch `.md` first, then:

```
LF new <project> --title "<≤80 chars>" --desc-file <scratch.md> --column Backlog \
  --labels "<type>,<priority>" --points <2|5|8> [--priority H|M|L] [--due YYYY-MM-DD] [--assignee <email>]
```

Assigned to you by default (`owner` in `board.json`); `--assignee ""` leaves it unassigned.

Sections in this order — this text is the **requester's half** of the description and no later
command may touch it: `Request (verbatim)` · `Interpretation` · `Out of scope` ·
`UX references` · `Business rule conflicts` · `Related cards` · `Impact scope` ·
`Open questions` · `Draft message to requester`.

Then seed a **coarse work tree** from your Impact scope — each row is a level-1 item — with
`LF work <card> --file <tree.md>`. `/p` renumbers it later; `/s` never faces an unsplit card.

The board shows only the first two lines of a description as plain text, so open with one line
that reads well on the card face before the first heading.

## Step 9 — Record friction and close out

Before printing the summary, append friction entries per CONVENTIONS §9. What to look for at this
stage:

- a question the process should have pre-empted → `missing-step`
- a source you could not read, or read incompletely → `missing-step` or `missing-fact`
- locked rules not where `flow.md` said → `missing-fact`, applied to `flow.md`
- a card section empty two cards running → `noise`

Print: `LF-N`, type, size, open-question count, whether rule approval is needed, and the card link.

If open questions remain, say plainly that the message should go out before `/p`. Then ask:
"Run `/p`?"
