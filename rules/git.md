# Git — Excalibur conventions

Commit rules for the Excalibur repository itself (not to be confused with the git rules Excalibur *generates* for other projects via `bootstrap/presets/github/` — those are independent and specific to each project).

## Commit messages

- Mandatory pattern: `{pattern}: {message}`
  - Correct: `feat: add bootstrap wizard entrypoint`, `fix: correct broken link in structure.md`, `docs: update rules for obsidian specs`
  - Incorrect: `feat(bootstrap): add wizard`, `Feature: add wizard`, `Fix: correct link`
- No scope in parentheses.
- Always in English, always fully lowercase (including the pattern and the first word of the message).
- Atomic: one commit per logical unit of change — never bundle unrelated changes, never a redundant commit.

## AI attribution

Unlike the projects Excalibur helps set up SDDs for (where the rule is usually to never include AI attribution — see the GitHub preset chosen for each project), commits **in Excalibur itself can carry AI attribution normally** (`Co-Authored-By`, etc.) — it's a tooling/support repo, not a product repo subject to an organization ruleset.

## Scope of action

- Only commit — never push, open a PR, or merge without the user's explicit request.
- Ask before acting when the scope of a change is ambiguous.
