# Mirra shared context

This directory is managed by [Mirra](https://docs.getmirra.app/) for the "i15230-enum" group.
It is the shared ground truth between the team's Mirra group and everyone's Claude Code sessions.

## Layout

- `CONTEXT.md` — THE ground-truth file: project overview, goals, constraints. Mirra injects it into the group's AI context; Claude Code should read it too. Keep it curated and current.
- `calls/` — call notes auto-committed by Mirra when a group call ends (`YYYY/MM/DD-HHmm-<slug>.md`).
- `decisions/` — decisions filed from group chat ("Mirra, commit that decision to the repo").
- `chats/` — scheduled chat digests (when enabled in the group's repo settings).

## Conventions

- Mirra only ever writes inside `.mirra-i15230/` — the rest of the repo is yours.
- Commits from Mirra appear as `mirra[bot]` on the default branch.
- Everything here is markdown with YAML frontmatter; grep away.
