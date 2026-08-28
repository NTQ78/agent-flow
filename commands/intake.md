---
description: Take in a raw request and normalise it into a REQ ticket under D:\Agent-Projects
argument-hint: request description | path to file/image | outlook | teams
---

Read `~/.claude/flow/CONVENTIONS.md` first. Then read the current project's `.claude/flow.md`
(if present) for locked business rules and context.

Input: $ARGUMENTS

## Step 1 — Get the raw request

Work out the source from the input:

- **Nothing / a direct description** → use $ARGUMENTS itself. If empty, ask the user.
- **A file or image path** → read it. Screenshots of Word forms and emails: read with the Read tool.
- **`outlook`** → find recent mail from the requester (see `requester` in `.claude/flow.md`); read
  the body *and* the attachments.
- **`teams`** → read the recent Teams conversation with the requester. Collect the amendments
  scattered through the thread, not just the first message.

Extract the request verbatim. Keep the requester's original wording — **in their own language** —
in its own section. When scope is disputed later, that quote is the evidence.

## Step 2 — Classify and strip the noise

- Type: `bug` | `feature` | `rule-change` | `report`
- **Separate the actual request from UX references.** Requesters often attach a link or screenshot
  of some other HRM with "make it like this". That is a reference for how it should *feel*, not a
  backlog. Put it under "UX references" and keep it out of scope.
- State explicitly what is **out of scope**, where confusion is likely.

## Step 3 — Check against locked business rules

Read the locked rules in `.claude/flow.md`. If the request contradicts any of them:

- set `needs_approval: true`
- name the rule and where exactly it conflicts
- draft the question asking for sign-off on changing the rule
- **do not** quietly implement the new behaviour

## Step 4 — Check against existing tickets

Scan `D:\Agent-Projects\<project>\` (read the frontmatter of each `00-request.md`) for:

- duplicates → report them, ask whether to merge
- older tickets this request would contradict → warn about the silent conflict, cite the REQ-ID

## Step 5 — Impact scope

Survey the real code (grep and read; do not guess) and list — the point is to catch work that
looks small and spreads: affected FE screens; BE endpoints / handlers / entities; which roles see
the change; reports, exports, jobs and email templates depending on the touched code.

**Name the tickets that touch the same files**, open or not, and say which must land first. Four
tickets rewrote one wizard in parallel on 2026-08-27 with nobody sequencing them.

## Step 6 — Release, priority, deadline, size

- `release`: the batch name this ships in. Reuse this project's current **unshipped** name; a
  shipped release is sealed (CONVENTIONS §2), so a later ticket starts a new name. Say which
- `priority` and `deadline`: if the requester did not say, add it to the open questions, set
  `priority: normal`, `deadline: null`
- `size`: `S` (under half a day) | `M` (1–2 days) | `L` (more). Rough only; `/p` breaks it down.

## Step 7 — Open questions

List every remaining ambiguity. Each question must be specific, answerable in one sentence, and
state the consequence of guessing wrong. Do not ask what reading the code would answer.

Add a draft message to the requester — **written in Vietnamese**, colleague tone, every question
gathered into a single ask.

**Greenfield floor.** A brand-new product needs five answers before the ticket can be named:
brand name, page list, does it transact, content language and currency, and where real assets
come from (supplied / generated / none). If any is missing, name the folder from the request slug
alone and mark `project` **provisional** — the one sanctioned exception to §1's
never-a-second-name rule, and renaming it later updates the folder and `project` together.

## Step 8 — Write the ticket

Create `D:\Agent-Projects\<project>\<REQ-ID>-<slug>\00-request.md` with frontmatter matching the
schema in CONVENTIONS, `status: intake`, and these sections:

```
## Request (verbatim)
## Interpretation
## Out of scope
## UX references
## Business rule conflicts
## Related tickets
## Impact scope
## Open questions
## Draft message to requester
```

## Step 9 — Record friction and close out

Before printing the summary, append friction entries per CONVENTIONS §9. What to look for at this
stage:

- a question you had to ask that the process should have pre-empted → `missing-step`
- a source you could not read, or read incompletely → `missing-step` or `missing-fact`
- locked rules that were not where `flow.md` said they were → `missing-fact`, applied to `flow.md`
- a section of the ticket that had nothing to put in it two tickets running → `noise`

Print: REQ-ID, type, size, open-question count, whether rule approval is needed, folder path.

If open questions remain, say plainly that the message should go out before `/p`. Then ask:
"Run `/p`?"
