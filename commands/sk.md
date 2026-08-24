---
description: Audit and update the global skills in ~/.claude/skills, and report what changed
argument-hint: (empty) = audit | update | trending | install <name> | <skill name>
---

Purpose: keep the design/frontend skill set in `~/.claude/skills` current, and report what changed
so `/p` and `/s` can use it.

Mode: $ARGUMENTS — empty = audit and report only, `update` = perform the update, `trending` = report
what exists elsewhere that you do not have (§5), `install <name>` = install one named skill (§6), a
skill name = handle just that one.

## 1. Inventory

```bash
ls ~/.claude/skills
```

For each skill: read `name` and `description` from the `SKILL.md` frontmatter, count its files.
Group them by purpose (design system / frontend taste / image generation / brand / other) to make
functional overlap visible.

## 2. Update sources

Work out where each skill came from, based on evidence only:

- **Installed by a CLI** — if `uipro` is on PATH (`uipro --version`), the skills it generated are
  updated with `uipro update` followed by `uipro init --ai claude --global --force`. Check for a
  newer release with `npm view ui-ux-pro-max-cli version`.
- **Installed as a plugin** — cross-check `~/.claude/plugins/installed_plugins.json`.
- **Unknown origin** — only a `SKILL.md`, placed there by the user. Report it as not
  auto-updatable; do not guess a source.

## 3. Report

- Which skills have a newer version, current vs available
- Which skills are **shadowed** by a same-named built-in skill or command (check against the
  actually-available skill list — present in `~/.claude/skills` but absent from the available list
  means it is shadowed)
- Which skills overlap in function, and which to use for what
- Which skills have never been used by any ticket under `D:\Agent-Projects\`

## 4. Update (only with `update`)

Run the update, then:

- Diff the skill list before and after: what was added, whose `description` changed
- For each new skill: say which stage of the chain it belongs to (`/p` design, `/c` slop-test, ...)
- If CONVENTIONS §6 or §7 needs revising because a new skill supersedes an old role, **propose** the
  specific change and ask before editing that file

## 5. `trending` — what exists that you do not have

Three sources. Report them **separately, in this order**, because they do not carry the same weight
of evidence and merging them hides that:

- **Official marketplace** — `~/.claude/plugins/marketplaces/` and the plugin catalogue. Versioned,
  installable, first-party. Cross-check `installed_plugins.json` so nothing you already have is
  offered back.
- **npm** — search the registry for skill and plugin packages; `ui-ux-pro-max-cli` is the precedent.
  Give the package, its latest version and its **publish date**. A package last published a year ago
  is not trending whatever its download count says.
- **GitHub and the web** — repo search by stars and recent commit activity, plus WebSearch for what
  is being discussed. Widest source, weakest evidence: give the repo, stars, last commit, and say
  plainly that it is a stranger's code and unvetted.

For each candidate, one line on what it does and **which stage of the chain would use it** (`/p`
design, `/c` slop-test, ...). A candidate that maps to no stage is noise — say so rather than list
it. Then the two facts that decide whether it is worth having: does it **overlap** something already
installed, and would its name **shadow** an existing skill — same name, silently different skill.

End with a ranked shortlist and stop. Never install here.

## 6. `install <name>` — one skill, after you approve it

Only with `install`, and only the skill named. Before anything is written into `~/.claude/skills`:

- **Read the candidate's `SKILL.md` in full** and report what it actually does, not what its
  description claims. A skill runs with your full permissions.
- **Refuse to overwrite** an existing folder of the same name — report the collision and stop.
- Install by the mechanism the source provides: plugin install, `npm i -g` plus the package's own
  init, or a clone into `~/.claude/skills/<name>`. Never hand-copy source out of a web page.
- Then re-run §1, confirm the skill appears in the **available** list and not merely on disk, and
  say which stage of the chain now has it.

## Note

No command in the chain hard-codes a skill name. They look the list up at run time per CONVENTIONS
§6 — which is why adding a new skill requires no command edit.
