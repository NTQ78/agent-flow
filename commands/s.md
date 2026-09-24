---
description: Execute the spec — BE → migration → FE → i18n, without touching git
argument-hint: card link | LF-N (empty = oldest card in Todo)
---

Read `~/.claude/flow/CONVENTIONS.md` first, then the project's `.claude/flow.md` for build
commands and the list of known traps.

Card: $ARGUMENTS — a link, or `LF-N`. If empty, `LF ls <project> --column Todo` and take the
oldest. `LF` means `node C:\Users\VNT\.claude\flow\lf.js`. Start with `LF get <card>` and read
the spec block; `LF assign <card> <your email>` so the board says who is holding it.

## Absolute rules

1. **Run no git command that changes state.** No `checkout`, `restore`, `stash`, `reset`, `clean`,
   `commit`, no branch creation. The tree may hold months of uncommitted work. Read-only is fine.
2. **Invoke a skill before writing UI.** Per CONVENTIONS §6: list the installed skills, pick the
   closest, invoke it via the Skill tool, then write code. Not optional for a small change.
3. **Apply CONVENTIONS §7** (must not look AI-generated) to every line of UI produced.
4. Read the traps section of `.claude/flow.md` **before building**, not after hitting an error.
5. **Never `Write` a file you have not read in this session.** Write replaces: a file that existed
   comes back holding only what you retyped. This destroyed a 113-line test file carrying six
   tests. Read first and Edit — or Write only files you created.

## Step 0 — is anyone else in this tree?

Check whether another session is writing the files the spec names — recent mtimes, a peer's build
log. If so, negotiate ownership **by file** before the first edit and record it. Three sessions
once shared one uncommitted tree and only avoided collisions because a peer asked first. A
failure in a file outside your list is the peer's, not yours to chase.

## Execution order

Follow this order, and **check each part as soon as it is done** to surface errors early. Per part
use the confined set — typecheck, plus lint and related tests over what you touched (`/c` §1).
The full suite runs once, at close-out:

`LF work <card> --list` prints the work tree `/p` built. **Follow its numbering exactly** — that
order is the decision, already made against the code, and re-sorting it here discards the reason.
Tick each item the moment it is done: `LF work <card> --done 1.2`.

A migration in the tree: read the file you generated before ticking it — a command that exits
zero proves nothing. i18n items: both locales in the same pass, never "later".

Keep a running build log in a scratch `.md` as you go: what was done, which files, build
pass/fail, what broke and how it was fixed. It goes on the card at close-out.

## Tests alongside the code

Following the test case checklist in the spec block, write the test as you write the corresponding
code — BE unit tests, FE component tests. Do not defer to `/c`; `/c` only runs and cross-checks.

**An assertion that something is absent proves nothing until its container is proven present.**
`queryByRole` returns null whether the gate works or the page rendered nothing at all. The helper
locating the subject must throw when it finds none, so an empty render fails instead of passing.

**And a test that cannot fail is not a test.** A negative assertion needs a positive control — a
stub nobody wired up satisfies "was never called" perfectly. Two ids both `1` in a fresh database
make "the subject is the owner, not the payslip" unreadable. A test of the mechanism is not a
test of the guarantee: three passed over a payslip freeze broken in the shipped build. When the
deliverable renders — a workbook, a PDF, a letter — produce one specimen and look at it.

## When the spec is wrong

If the spec turns out to be wrong, incomplete or unworkable:

- **STOP** that part
- Record in the build log: where it diverges, why, and two or three options with trade-offs
- Ask the user, and `LF comment <card> --text "..."` so the board shows it is waiting
- Keep going on the parts that **do not** depend on the blocked piece; do not abandon the whole run

## Related bugs outside the spec

Small blockers (a missing older i18n key, a wrong type, a circular import, an existing test broken
by a legitimate change): fix them, and record them under "Fixes outside scope" in the build log.
No need to ask.

But if the fix starts changing business behaviour, or touches a locked business rule → follow the
"When the spec is wrong" procedure above.

## Record friction

Append entries per CONVENTIONS §9. This stage produces the most signal, and the raw material is
already in the build log:

- every trap `flow.md` did not warn about → `missing-fact`, **appended to that project's
  `.claude/flow.md` traps section in this same run**
- every "fix outside scope" → why did the spec not see it? usually `missing-step` on `/p`
- every spec divergence → `missing-step` or `wrong-order`; work redone → `wrong-order`
- no installed skill covered the design work → `missing-skill`

## Close out

**Run the whole suite — never a `--filter` or a scoped run.** A filtered run once reported 40
passed while the full suite was red with 8 failures this ticket had caused, and the ticket was
declared built on it. Then walk the spec block's numbered cases one at a time and say which have
a test and which do not: a matching count is not a mapping — "34 tests for 34 cases" was true and
wrong. Cases with no test do not block the move, but going unmentioned does.

Then put the build log on the card: `LF section <card> build --file <scratch.md>`,
`LF move <card> "In progress"`, `LF tick <card> Build`.

Print: files created/modified, build result per part, tests written **and cases still untested**,
fixes made outside scope, anything blocked awaiting an answer, and the card link.

Then ask: "Run `/c`?"
