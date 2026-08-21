---
description: Audit and update the global skills in ~/.claude/skills, and report what changed
argument-hint: (empty) = audit | update = actually update | <skill name>
---

Purpose: keep the design/frontend skill set in `~/.claude/skills` current, and report what changed
so `/p` and `/s` can use it.

Mode: $ARGUMENTS — empty = audit and report only, `update` = perform the update, a skill name =
handle just that one.

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

## Note

No command in the chain hard-codes a skill name. They look the list up at run time per CONVENTIONS
§6 — which is why adding a new skill requires no command edit.
