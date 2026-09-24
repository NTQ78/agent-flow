# Changelog

What changed in the flow, why, and — for a `/retro` run — the friction entries that justified it.
Direct decisions are recorded here too, marked as such. The raw friction log stays out of git.

## 2026-09-24 — sixth `/retro` run: the order of the checks

179 unpromoted entries, 2026-08-24 → 2026-09-24, four projects. **19 were rejected outright**: the
flow was rewritten to board-first mid-log, so every entry aimed at `00-request`, frontmatter,
`status:` or a release name now targets a system `CONVENTIONS.md` no longer contains. Four clusters
of the surviving 160 earned a change; 146 stay watching.

- **`/code-review` now runs BEFORE the app is driven.** Three cards running, the worst defect of
  the card came out of the review — and it came out *after* `/c` had already driven the screen and
  written the numbers down as correct. On LF-99 six of seven defects were review findings, one of
  them a cascade delete that destroyed a user's own checklist rows; on LF-85 the review found a
  period comparison that reported a team at steady pace as down 26%. Driving a screen you have not
  reviewed means reading numbers with nothing to be suspicious of. The reason lives in the heading
  so it costs no line. *(F-2026-09-23-315, F-2026-09-24-331)*
- **`/c` drives every locale, and screenshots the longest one.** An English pass was clean and
  would have been the whole of step 3; the same screen in Vietnamese immediately showed a
  hard-coded English label that two earlier cards had walked past. Separately a pay-type label
  20 characters long in English is 40 in Vietnamese and overflowed the column it was sized for —
  shipped, and found by the owner rather than by a gate. The language toggle was being treated as
  a translation concern; it is a layout input. *(F-2026-09-21-267, -274, F-2026-09-23-310)*
- **`/p` Step 2 stops contradicting the spine.** The fifth run gave CONVENTIONS §6 a scale clause
  and a once-per-session clause, and left `/p` Step 2 opening with a flat *"A skill must be
  invoked before writing this section"* whose only escape was "BE-only". Four entries since then,
  all recording the same collision — the mandate firing on a control dropped into an existing slot
  and on a surface copying a sibling panel. Step 2 now defers to §6 instead of restating it.
  *(F-2026-09-18-242, F-2026-09-22-308, -321, F-2026-09-23-321)*
- **A browser measurement must prove its own subject first — into `HR_APP/.claude/flow.md`, not
  the spine.** Three entries, one project, so it lands project-local next to the driver it is
  about. `all(...)` over a collection that came back empty passed all three of its assertions
  against a toolbar that had not painted; twice more the same day an empty collection reported a
  correctly rendering page as five FAILs; and three runs in a row reported the measurement as the
  product — an echo regex matching the hint line, a click landing on the header toggle because the
  page has two `role=group` toggles, an index of `[3]` against a DOM ordered start, end,
  breakStart, breakEnd. `s.md` already carries this rule for absent assertions; measurements are
  where it is easier to miss, because a measurement looks like data.
  *(F-2026-09-21-279, -285, F-2026-09-23-304)*

Rejected as already covered: what to do when no design skill fits (§6 says to say so plainly
rather than invent a name), and a skill recommending Phosphor against a `flow.md` that locks
lucide (§7's precedence clause already decides it, and `/c` applied it).

Deletions that funded the above: `/c` §4's hunt for an installed skill shipping a `slop-test.md`
or `anti-patterns.md` checker — **not once cited in 496 entries**, and the fifth run deleted the
same pointer from §7 for the same reason while missing this copy; and the second example in `/c`'s
"verify the outcome" anecdote, which the rule no longer needs.

`c.md` 110 → 110/110 · `p.md` 110 → 110/110 · `CONVENTIONS.md` untouched at 170/170.

Left watching, and worth naming: **`/intake` treats a diagnosis inside the request as a finding** —
six entries across two projects, where mail headers said staging had diverged, a doc comment put a
helper out of scope, and two timing numbers named the wrong latency mechanism, one of them written
into `flow.md` as a project fact. It earned a change and did not get one: `intake.md` is at
110/110 and this run found no three lines in it dead enough to cut. That is F-2026-09-24-328's
warning working as intended — cutting to fit the budget risks cutting meaning — but it means the
budget is now blocking a qualified change, which is the next thing to decide.

Also logged and not acted on: two entries in this same log share the id `F-2026-09-24-341`. §9's
"allocate `id` as highest + 1, read at write time" exists because of exactly this, and two
concurrent sessions still lost the read-then-write race.

## 2026-09-23 — the board becomes the ticket (direct decision)

Recorded after the fact: this was in force in `~/.claude` before the sixth `/retro` run and reached
git only with it.

Tickets lived as markdown under `D:\Agent-Projects\`, with `status` in YAML frontmatter and a
board that knew nothing about them — one person, on one machine, could see where the work was. The
axis is now inverted. **A card on a LynkFlow board is the ticket**, its column is its status, and
the drive keeps only what will not fit in a description: screenshots and gate logs.

- One command, one column: `/intake` Backlog → `/p` Todo → `/s` In progress → `/c` Review →
  `/ship` Done. A card made by hand in Todo and a card `/intake` opened in Backlog travel the same
  road from `/p` onwards.
- `flow/lf.js` holds the whole protocol — link parsing, `ensureBoard`, and `putSection`, which
  replaces only the block between its own markers so no command can overwrite what a person wrote.
  Labels merge rather than replace, because a board has other people on it.
- `/ship` stopped being the deploy command and became the **close** command: it writes the release
  block, moves the card to Done, and then asks whether to deploy. **Done now means finished and
  verified, not live** — the release block has to say which. No safety step was dropped; backup,
  migration confirmation, smoke test and rollback notes all still run, now conditionally.
- `/c` failing pushes the card back to In progress with a comment, so the board says out loud that
  the work is stuck. That visibility is the main thing the move was for.
- `REQ-…` ids are gone; a card number is already unique. Two tickets had been sharing
  `REQ-2026-08-27-01`, and `CONVENTIONS` §1 no longer spends six lines preventing that.

`lf.js`, `board.json` and `.env` stay untracked — `sync.ps1` carries only `*.md`, and the API key
must not reach git. The protocol the whole chain now depends on therefore has no history here.

## 2026-09-17 — fifth `/retro` run: what a gate is for

97 unpromoted entries, 2026-08-24 → 2026-09-17, two real projects. Six clusters earned a change;
53 stay watching. Every file was at its line cap, so each addition below is funded by a deletion
in the same file — the budget did the editing it was written to do.

- **`/p` Step 0 now implements the hard gate instead of contradicting it.** The spine said a
  question deciding a permission, a route or a stored value is a HARD stop; `/p`'s own step was
  titled "Soft gate" and said *continue anyway*. Twice the contradiction was resolved in favour of
  continuing, and the whole chain ran on a guess — once producing a month picker that was built,
  verified and screenshotted against an unanswered "month or date range". The step now states the
  stop, names the tier below it, and keeps `[ASSUMPTION]` for that tier only.
  *(F-2026-09-03-171, -196, -160, F-2026-09-16-220)*
- **A test case now has to be able to exist, and to fail.** Ten recorded cases could not do one or
  the other: a case written against a service with no harness, an `internal` class with no
  `InternalsVisibleTo`, a state no user path reaches, a negative assertion with no positive
  control, two ids that are both `1` in a fresh database, and three green tests over a payslip
  freeze that was broken in the shipped build. Split by stage — `/p` Step 6 names the fixture that
  expresses each case, `/s` owns whether it can fail, next to the absent-assertion rule it extends.
  *(F-2026-08-27-08, -85, -88, -119, -130, F-2026-09-03-165, -178, -186, -191, -193)*
- **`/intake` Step 1 stops enumerating sources.** Seven requests arrived in a form the list did not
  name — a SharePoint link, a returned form, a design mockup, a screenshot a tool hands back only
  as base64, a description written *for* the requester, mail whose `hasAttachments` lied — and each
  carried the fact that sized the ticket. The four cases are now two sentences and a principle:
  open whatever came, say so when you cannot, and resolve the project from the request, not the cwd.
  *(F-2026-08-24-25, F-2026-08-26-03, F-2026-08-27-02, F-2026-08-28-128, F-2026-09-03-170, -173,
  F-2026-09-08-200, -201)*
- **The design-skill mandate gets a scale clause and a once-per-session clause.** It was firing on
  one shadcn `Select` dropped into an existing actions slot, and on one label string copied from a
  sibling tab. A skill is for work carrying design decisions; an invocation in `/p` now carries
  through `/s` in the same session. *(F-2026-08-25-39, F-2026-08-27-05, F-2026-09-03-161, -162, -183)*
- **`/c` verifies the outcome, not the mechanism that should produce it.** A 302 with the right
  `Location` whose target bounced back; a page-load screenshot with no English on it while every
  sheet, toast and Zod message behind a click was still English; two timeout increases shipped
  against what turned out to be a refusal, not a timeout. `/c` §3 gains the rule, §6 gains
  "reproduce the failing external call standalone before changing any code".
  *(F-2026-08-27-42, -122, F-2026-08-28-136, -143, -149, -151, F-2026-09-16-232)*
- **`/ship`'s gate answers to the artefact, not only to the tickets.** Its effective-state check
  reads `02-build-log.md`, so work built from a brief with no ticket folder is invisible to it —
  two features reached a production artefact that way. And the base config an artefact carries is
  now read block by block: one shipped with a punch mirror pointing at a host on a developer's
  laptop. *(F-2026-09-17-234, -236)*

Rejected as already covered, so they stop resurfacing: the `friction.jsonl` concurrency and
backslash entries (§9 carries both rules, added in response to them), the stale-date-in-a-long-
session entry (§1), the un-renderable banner (`/c` §3 cites that incident by name), and pending
migrations at `/ship` (§0 already runs the migrations-list check).

Deletions that funded the above: `§7`'s tells list compressed to four lines — in 289 entries not
one has ever cited a tell, while the two that cite `§7` cite its precedence clause; `/c` §4's
slop-test split, which restated `§7` in full; `/ship` §5 and §6's IIS restatements; and four
anecdotes in `/p` and `/intake` that had earned their place and have now been absorbed into the
rules they justified.

## 2026-08-28 — the bible model, then the fourth `/retro` run

Two changes in one day, kept apart because they came from opposite directions.

**First, a model taken from `aiursoftware/bible`'s `/pm /p /s /pp`** (direct decision, not from the
log). That chain keeps durable state in Plane and Outline and treats plan files as ephemeral; ours
is filesystem-only and stays that way. What was worth taking was the shape, not the infrastructure:

- **A release is a group somebody chose.** `release` is now assigned at `/intake` as a batch name
  and replaced by the dated id at `/ship`; a shipped release is **sealed**. Before this, a batch was
  whatever happened to sit at `verify` on the day — nine unrelated tickets shipped together because
  they shared a working tree.
- **Effective state.** `status` is what a ticket claims; what is true is `status` plus whether its
  build log's files are in the repo. `/ls` and `/ship` read both, and `/ship` now stops when a
  ticket *outside* the batch has code in the build — it deploys either way, so it is named in the
  release file or verified into the batch. Four tickets reached production at `build` on 2026-08-28
  with every gate green.
- **Reconcile the spec against the code** (`/c` §2), from `/pp`'s Deep Research gate: read every
  file the spec named and confirm the code says what the spec says. Code wins on a small
  divergence — fix the spec so it stops lying; a contradiction big enough to change the design goes
  back to the user.
- **Decisions go where a sibling ticket will find them** (`/p`): dated, into the project's
  `flow.md`, not buried in one ticket folder.

Not taken: Plane, Outline, the node scripts — and `/pp` does not replace `/c`. `/pp` asks whether
the documentation matches the code. It would not have found the banner that could never render.

**Second, `/retro` over 101 entries** (2026-08-21 → 2026-08-28, 4 projects). Six changes:

- **REQ-ID allocation is a claim, not a scan** — `CONVENTIONS.md` §1. Three collisions in one day,
  two tickets still sharing an id. Create the folder first, then re-scan; the later one moves.
  `F-2026-08-27-11/-13/-33/-43/-92`, `F-2026-08-28-114/-141`
- **A question that decides a permission, a route or a stored value is a HARD stop at `/p`** — §4.
  Nine unanswered questions once ran the whole chain; three were wrong, one rewrote the access path
  after `/c`. `F-2026-08-27-93`, `F-2026-08-28-110/-139`
- **`/s` runs the whole suite at close-out and maps the spec's cases one by one.** A `--filter` run
  reported 40 green while the suite was red with 8 failures the ticket had caused; "34 tests for 34
  cases" was a true count and a false claim. Resolves a contradiction: the old rule said a full run
  at `/s` "buys nothing". `F-2026-08-26-10/-32/-34`, `F-2026-08-27-26/-31/-97/-120/-132`,
  `F-2026-08-28-154`
- **Never `Write` a file you have not read this session** — a Write destroyed a 113-line test file
  carrying six tests. `F-2026-08-27-16`
- **`/s` step 0: is anyone else in this tree?** Three sessions shared one uncommitted tree and
  avoided collisions only because a peer asked first. `F-2026-08-27-07/-17/-20/-24/-28`
- **Every path and symbol a spec names must be one you opened** — `/p` step 4. `Reference/` never
  existed, "the same guard" was two conditions, "three call sites" was four.
  `F-2026-08-27-09/-12/-19/-23/-96/-112`, `F-2026-08-28-134`

Rejected: `F-2026-08-27-03` — friction.jsonl unparseable. Stale; 208/208 lines parse today.
Watching (56): intake source coverage and impact-scope gaps, both of which were touched this same
day; the design-skill scope question, one project only; `/c` verifying through a proxy, where two
new rules landed today and deserve a run before a third. A `missing-skill` entry
(`html-to-pdf` on disk, absent from the session) is a `/sk` job, not a flow change.

Budget after both: `CONVENTIONS.md` 170/170, `/intake` 110, `/p` 110, `/c` 110, `/ship` 110,
`/s` 99, `/ls` 80, `/retro` 80. Every addition was paid for with a deletion.

## 2026-08-24 — /ls gets a board, /sk gets a trending scan (direct decision)

Not from the friction log. Two support commands were doing less than they could: `/ls` had one
output shape, and `/sk` could only look inward at what was already installed.

- **`/ls` draws a real table.** Box-drawing, capped at 120 columns with truncation rather than
  wrapping, `REQ-` and the year dropped from the ID, and the stage rendered as a five-cell progress
  bar instead of an arrow chain. Flags became symbols with a legend naming only the ones in use, so
  the column stays narrow. Columns adapt: with no deadline anywhere, `Due` is not drawn at all.
- **`/ls board` publishes the same data as an HTML page.** One column per stage, tickets as cards,
  and underneath the two panels that carry the decisions — every open question quoted as written,
  and the `verify` batch one `/ship` would deploy. It always writes `~/.claude/flow/board.html`, so
  it redeploys to one stable URL and a link handed out last week keeps working; from a later session
  the URL is recovered with the Artifact `list` action rather than published a second time. The page
  is stamped with its generation date, because an undated dashboard keeps being trusted once stale.
- **`/sk trending` reports three sources, kept apart.** Official marketplace, npm, then GitHub and
  the web — in that order, never merged, because they do not carry the same weight of evidence. Each
  candidate is judged on which stage of the chain would use it; one that maps to no stage is named
  as noise rather than listed. Overlap and name shadowing are called out per candidate.
- **`/sk install <name>` is a separate, named step.** `trending` ends at a shortlist and stops. A
  skill runs with full permissions and lands in a store shared by every project, so installation
  reads the candidate's `SKILL.md` in full first, refuses to overwrite a same-named folder, and
  afterwards confirms the skill is actually *available* and not merely present on disk.

Rejected: auto-installing whatever ranked highest. It is the one version of this that cannot be
undone by reading the report — the code is already on the machine, possibly shadowing a skill in use.

Line budgets after: `ls.md` 78, `sk.md` 89, both against 110.

## 2026-08-24 — /c scales its gates to reach (direct decision)

Not from the friction log. The complaint was that `/c` takes too long on small tickets. Measured on
WCL-HR before changing anything, because the complaint and the cost turned out to disagree:

| | wide | confined |
|---|---|---|
| `tsc -b` | 15s | 15s — never scoped |
| lint | 19s | 3s |
| tests | 26s | 10s (`vitest related`) |
| build | 16s | skipped when the change adds no import, dependency, config or entry point |
| **total** | **77s** | **29s** |

So the gates are 77s, not the minutes it felt like. The real cost on that ticket was the gate set
running **three times** (~230s) and a browser driver being **rebuilt from scratch** — about twenty
attempts. Both are now fixed, and the second one mattered more than the tiering.

- **`/c` §1 scales to reach, not to the size label.** One line in a shared component reaches forty
  files; a large change to a leaf page reaches nothing else. `02-build-log.md`'s file list decides the
  tier, and the report says which ran and why. Typecheck stays project-wide in both tiers — it is the
  cheapest whole-app guarantee there is.
- **The full set is deferred, not skipped.** `/ship` now runs it once across the whole batch before
  building. A release earns its guarantee once instead of once per ticket, and a ticket that never
  ships never needed it.
- **`/s` stops re-running the full suite.** Its per-part checks are the confined set; `/c` runs the
  authoritative pass once.
- **`/c` §3 reuses a driver instead of writing one.** If the project has a driver script, use it;
  otherwise write one into the project and record it in `flow.md`, so the next ticket does not pay.
  `WCL-HR/scripts/drive_app.py` was extracted from that first ticket and smoke-tested: sign in, open
  Positions, expand, screenshot — one call, 53 rows, no console errors.

Funded by nine cuts across `c.md` and `ship.md`; both landed on 110/110 after `c.md` first came out at
121 and `ship.md` at 113. The measured timings moved into HR_APP's `flow.md`, where project-specific
numbers belong, rather than sitting in a global command.

`c.md` 101 → 110/110 · `ship.md` 109 → 110/110 · `s.md` 81 → 84/110 · `CONVENTIONS.md` 168/170.

## 2026-08-24 — third /retro run

Five fixes from 12 entries, the first batch drawn mostly from a real HR_APP ticket rather than from
building the flow itself.

- **Map the path, not the files** (F-24-24, F-24-27) — for an access, permission or validation change,
  `CONVENTIONS.md` §4 now asks for every entry point that reaches the guarded state and the layer that
  already enforces it. Both halves had been missed on one ticket: the backend already enforced the
  rule, which would have mis-sized it into a security fix; and a second control reached the edit form,
  which following the spec literally would have left open.
- **§8 and §9 stopped contradicting each other** (F-21-20) — §9 said a `missing-fact` applies itself to
  the project's `flow.md`; §8 said a greenfield project has none until `/s` writes it. The fact now
  goes into `01-spec.md` and becomes the final `/s` task, which sets `promoted`.
- **An absence proves nothing until its container is proven present** (F-24-28) — `s.md`. `queryByRole`
  returns null whether the gate works or the page rendered nothing, and six negative assertions were
  green for exactly that reason until an unrelated failure exposed them. The helper that locates the
  subject must now throw when it finds none.
- **One file list for the whole of `/c`** (F-24-32, F-24-34) — the unit of verification is
  `02-build-log.md`'s file list, not the working tree, because a tree carrying unrelated uncommitted
  work has no usable "current diff". The same list now scopes the review *and* a formatter check that
  the project's own four required checks omit — lint, tsc, test and build all pass over a file
  rewritten with the wrong line endings.
- **A simulated identity has to say so** (F-24-31, partial) — `/c` step 3. When the environment cannot
  supply the identity under test, drive the branch at the client boundary, never by writing to the
  server, and record in the report that the identity was simulated rather than authenticated.

Funded by seven cuts: `source` left the §2 schema (nothing reads it), `date` left the §9 example (it
duplicates the id prefix, as `created` did), and §6, §7 and §9 lost a line each to compression.
`CONVENTIONS.md` came out at 171 on the first pass — over budget — and was cut back rather than the
ceiling being raised.

**Rejected: F-21-18**, whether `/p` should choose the stack version on greenfield work. Declined three
times across two `/retro` runs: one project, one occurrence, and no second project has reproduced it.
Marked rejected so it stops consuming a judgement every run; reopen if it recurs elsewhere.

**Still watching:** F-21-23 (animation vs transition precedence — the `/c` gate bounds it), F-24-25
(mining a screenshot for state), F-24-26 (inspect-then-decide — the spec named both branches and it
worked), F-24-29 (repo-mandated companion artifacts).

**Logged during the run: F-24-35**, `noise`. §4 is titled "Gates" but now holds two rules that are not
gates, including one added by this run. Rules land there because it is the section with room, which is
how a spine becomes unreadable — but renaming it breaks the literal "§4" references in three files, so
the decision is queued rather than taken.

`CONVENTIONS.md` 168/170 unchanged · `s.md` 76 → 81/110 · `c.md` 89 → 101/110.

## 2026-08-21 — /ship becomes optional and batched (direct decision)

Not from the friction log: many `/intake` runs accumulate, and only one `/ship` is needed, because
by the time a ticket reaches `verify` its code is already in the same build as the others.

- **`verify` is a legitimate resting state.** `status` drops `ship` from its values — a ticket sits
  at `verify` until a release happens, and `/ls` never flags that as stalled. New flag:
  `awaiting release`, and a `Pending release` section listing what one `/ship` would deploy together.
- **`/ship` takes the whole batch.** With no arguments it collects every ticket at `verify` in the
  project, prints them with their migrations, and asks which to drop. The hard gate now applies
  across the batch: one unverified ticket blocks the release, because the build already contains its
  code. Shipping one while leaving the others open would push their work out with nobody closing the
  ticket.
- **One release file per deploy.** `releases/<YYYY-MM-DD>-NN.md` at the project root holds the
  target, the ticket list, the migration, the backup path, the rollback notes and a single bilingual
  changelog for the release. `04-deploy.md` is retired; each ticket keeps a `release:` field instead.
- **`/c` no longer offers `/ship` as this ticket's next step.** It reports how many tickets now sit
  at `verify` and offers a release of that batch.

Two schema fields dropped as redundant, which funded the additions: `slug` (the folder name carries
it) and `created` (`REQ-ID` carries the date, and `/ls` now computes age from it — one source of
truth rather than two that can disagree). Existing tickets keep the extra fields harmlessly.

`CONVENTIONS.md` 168/170 unchanged · `ship.md` 103 → 109/110 · `ls.md` 36 → 40/110 ·
`c.md` 88 → 89/110.

## 2026-08-21 — second /retro run

Five fixes from 8 entries, now spanning two projects. Two of them fix half-fixes from the first run.

- **§7 precedence** (F-22, extending promoted F-02) — the requester outranks §7 and a tell they
  supplied verbatim is sign-off; **a skill does not**. A skill sets direction, but a tell it mandates
  stays banned and `/p` records the deviation in a table `/c` treats as settled. Second ticket in two
  days to argue §7 from scratch; the first run fixed only the requester half.
- **A floor for greenfield briefs** (F-15, F-16, corroborated by F-01) — five answers before a ticket
  can be named: brand, page list, does it transact, content language and currency, asset provenance.
  Missing any, the folder is named from the request slug and `project` is marked provisional. The
  first run's naming fix did not hold: the folder still got a placeholder destined for rename.
  §7 also now says "no placeholders" changes the direction rather than licensing grey boxes.
- **`REQ-ID` is global per calendar day across every project** (F-17) — `/intake` scans all project
  folders for that date. Promoted on one occurrence: the text had two defensible readings and this
  log produced duplicate ids twice the same day.
- **The loop reads stale and numbered by eye** (F-19) — `id` is allocated as highest + 1 read at
  write time, and `/retro` re-reads the log before writing, restarting if unpromoted entries arrived.
  Three collisions in one day, one of which hid a second project from a whole promotion round.
- **Interactive states are verified with real input** (F-13, `/c` half) — a hover an animation has
  overridden passes tsc, lint, build and every static DOM assertion. It shipped dead through three
  stages before a real mouse event exposed it.

Funded by cutting §9's `kind` table down to a list: its `target` column duplicated FRICTION.md's
"Where the change goes", which owns that decision. Two `intake.md` compressions, including a dangling
`Then:` left by the first run's patch.

`CONVENTIONS.md` 168 → 168/170 · `intake.md` 107 → 109/110 · `c.md` 85 → 88/110 ·
`retro.md` 78 → 80/110.

Renumbered F-18 and F-19 as filed by limited-drop-store to F-21 and F-22 — they collided with the
pair the first run wrote. Numbers were then picked by hand a second time and collided again with an
existing F-20, which is exactly what F-19 describes; the rule adopted above is what stops it.

Routed to `/sk`, not a flow change: F-21. `gpt-taste` pins four faces and bans Inter without
mentioning content language; for Vietnamese, Satoshi ships 2 of the 90 codepoints in U+1EA0–1EF9 and
Outfit has no Vietnamese subset, leaving Geist as the only safe member. A skill-obedient pick ships
tofu.

Still watching: F-18, whether `/p` chooses the stack version on greenfield work — declined twice.
F-23, naming animation-vs-transition precedence in the spec, now bounded by the `/c` gate.

Reopened: **F-20**, an unresolved `missing-rule` a stage had marked `promoted` with a location note
(`"01-spec.md Step 1 and Step 7 task 9"`), which hid it from the queue. Its content is a real
contradiction introduced by the first run — §9 says a `missing-fact` applies itself to the project's
`flow.md` in the same run, while §8 says a greenfield project has no `flow.md` until `/s` writes it
at the end of the build. Five verified facts had nowhere to go and were carried in `01-spec.md`.
`promoted` is reset to null so the next run sees it. Only `/retro` promotes a `missing-rule`.

## 2026-08-21 — first /retro run

Seven fixes from 8 friction entries, all from `velorah-hero`, the first project run that was not
HR_APP. Four clusters, each with two independent occurrences.

- **§7 has no requester-authorised deviation** (F-02, F-12) — a tell the requester supplied verbatim
  is sign-off, not slop: recorded in `00-request.md`, `needs_approval` stays false, and `/c` splits
  slop-test failures into *fix now* (what the agent chose) and *report only* (what the customer
  asked for). Without this a careless run silently rewrites requested values; F-12 caught five.
- **Steps that assume capabilities the project lacks** (F-04, F-05) — one rule in §4 instead of two
  step edits: a step whose precondition is absent is declared `N/A` with a reason, keeping the
  numbering a later stage consumes. `/p` Step 5 (i18n) and Step 6 (tests) now say so explicitly.
- **Specifying from memory what only the installed artifact can tell you** (F-09, F-10, corroborated
  by F-08) — plugin config exports, generated utility classes and types a major version removed are
  inspected, not recalled; greenfield FE order is manifest → install → tooling config → code.
- **Greenfield onboarding** (F-01, part of F-03) — `<project>` is the project root folder name in
  whatever tree it sits, including one that does not exist yet; a greenfield project has no
  `flow.md` by design and `/s` writes it at the end of the build.
- **§6: a directory is not an available skill** (from `/sk`) — cross-check the listing against the
  skills actually available; a shadowed name resolves to a different skill silently.
- **§9: write paths with forward slashes** — a lone backslash in a JSON string is either invalid
  (`\P`) or a silent escape (`\f` in `\flow.md` ate the `f`). Five of twelve entries were
  unreadable and four had corrupted targets; all repaired.
- **FRICTION.md: the placement rules govern facts, not process gaps** — a missing step cannot be
  fixed in a project file however few projects reported it; judge it structural vs incidental.

Deletions, to stay inside the budget: the HR-specific "real Vietnamese HR labels" guidance left §7
for HR_APP's `flow.md`, where it belongs — in the spine it was wrong for every other project. The
`slop-test.md` pointer left §7 too; `/c` Step 4 already carried it verbatim, and `/sk` established
no global skill ships such a file. §2, §3 and §6 were compressed without losing meaning.

`CONVENTIONS.md` 164 → 168/170 · `p.md` 94 → 105/110 · `c.md` 80 → 85/110.

Left watching: F-18, whether `/p` should choose the stack version on greenfield work — one
occurrence, real machinery. Nothing rejected.

Logged during the run: F-19. `/retro` read the log at step 1 and wrote at step 7 without re-reading;
another session appended 5 entries meanwhile, including the first from a second project, and the id
`/retro` appended collided with one that had arrived. Ids need max+1 allocation at write time and
step 7 needs a re-read.

## 2026-08-21 — self-improvement loop

Added `/retro`, plus a friction log the stages write to as they go.

- `CONVENTIONS.md` §9: entry schema, the `kind` taxonomy that decides where a fix belongs, and the
  rule that facts apply themselves to a project's `flow.md` while rules wait for approval
- `flow/FRICTION.md`: promotion thresholds, the three checks before proposing anything, and the
  deletion path
- All five stages record friction at close-out, aimed at the signal each one naturally produces —
  `/s` at traps and out-of-scope fixes, `/c` at untested cases and gates that let a failure through
- `/ship` and `/ls` print a one-line nudge at five or more unpromoted entries
- A size budget: `CONVENTIONS.md` ≤ 170 lines, each command ≤ 110. At budget, an addition must
  arrive with a deletion in the same diff

Why: the flow was written against one project. Running it on others will expose gaps, and gaps that
are noticed but not recorded get rediscovered every time.

Why not fully automatic: a process that rewrites its own rules unsupervised accumulates
contradictions until nobody reads it. Facts are additive and project-local, so they apply
themselves. Rules change behaviour everywhere, so they get a diff and a yes.

## 2026-08-21 — initial

The `/intake → /p → /s → /c → /ship` chain, plus `/ls` and `/sk`.
