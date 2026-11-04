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
One missing, or its source refused you (expired login, an image that never arrived)? Ask the user
to re-send or re-authenticate **before Step 5**; only if they cannot, size without it and say so
on the card. Resolve the project from the REQUEST, not the cwd. A link to a card already on the
board is enriched, never re-opened (§2): add what is missing as a comment on that card.

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

Survey the real code **and the data it reads** (grep, read, count rows; do not guess) — the point
is to catch work that looks small and spreads: FE screens; BE endpoints / handlers / entities;
which roles see the change; reports, exports, jobs and email templates depending on the touched
code; every caller of a touched action; which copy of a duplicated definition the screen reads.

**A claim in the request is a hypothesis** — a named culprit, a reviewer's "two places", "staging
diverged", "it should only show X". Reproduce or measure it before Impact scope inherits it.

**Name the cards that touch the same files**, open or not, and say which must land first — then
`git fetch` and name the remote branches and `origin/main` commits since your base that touch them.

## Step 6 — Priority, deadline, size

- `priority` and `deadline`: unsaid → an open question, and `MEDIUM` with no due date
- `size`: `S` (under half a day) | `M` (1–2 days) | `L` (more) → points `2 / 5 / 8`; `/p` reassesses.

## Step 7 — Open questions

List every remaining ambiguity. Each question must be specific, answerable in one sentence, and
state the consequence of guessing wrong — for one that decides where data lives, the scope each
answer buys (schema, migration, product change). Do not ask what reading the code would answer.
A question carries the follow-ups its answer opens — who is told, where it lives, one record or
many, its siblings in the same family — each with a proposed default.

Add a draft message to the requester — **in Vietnamese**, colleague tone, every question in one ask.
**The requester or a scope owner is at the keyboard** (no mail, thread or file source)? Ask the hard
questions now with AskUserQuestion, record who answered, and keep the draft only for what is left.

**Greenfield floor:** brand, page list, does it transact, language/currency, asset source. Missing
any → name the board from the request slug, marked **provisional** (§1's one sanctioned exception).

## Step 8 — Open the card

Independent parts touching disjoint files → one card each, each quoting the full verbatim request,
cross-linked under Related cards. Write each body to a scratch `.md` first, then:

```
LF new <project> --title "<≤80 chars>" --desc-file <scratch.md> --column Backlog \
  --labels "<type>,<priority>" --points <2|5|8> [--priority LOW|MEDIUM|HIGH] [--due YYYY-MM-DD] [--assignee <email>]
```

Open with one line that reads on the card face (§1), then these sections in order — the
**requester's half**, which no later command may touch: `Request (verbatim)` · `Interpretation` ·
`Out of scope` · `UX references` · `Business rule conflicts` · `Related cards` · `Impact scope` ·
`Open questions` · `Draft message to requester`.

Then seed a **coarse work tree** from your Impact scope (each row a level-1 item) with
`LF work LF-<N> --file <tree.md>` — N **read from `LF new`'s output**, never guessed or chained:
a guessed N once replaced another session's Done card's tree. `/p` renumbers it later.

## Step 9 — Record friction and close out

First append friction per CONVENTIONS §9: a question the process should have pre-empted or a source
read incompletely → `missing-step`; locked rules not where `flow.md` said → `missing-fact`.

Print: `LF-N`, type, size, open-question count, whether rule approval is needed, and the card link.

Open questions left? Say the message goes out before `/p`. Then ask: "Run `/p`?"
