# Changelog

What changed in the flow, why, and — for a `/retro` run — the friction entries that justified it.
Direct decisions are recorded here too, marked as such. The raw friction log stays out of git.

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
