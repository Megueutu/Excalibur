# Git — conventions for this repository

Commit rules for the Excalibur repository itself. Not to be confused with the git rules Excalibur *generates* for other projects (`create-excalibur/onboarding/onboarding/github/`) — those are independent and chosen per project.

## Commit messages

- Required pattern: `{type}: {message}`
  - Correct: `feat: add wizard entrypoint`, `fix: correct broken link in structure.md`, `docs: update rules for obsidian specs`
  - Wrong: `feat(wizard): add manifest`, `Feature: add wizard`, `Fix: correct link`
- No parenthesized scope.
- Always English, always fully lowercase — including the type and the first word of the message.
- Atomic: one commit per logical unit of change. Never group unrelated changes, never commit redundantly.

This is the same Conventional Commits vocabulary the task-type skills use (`feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`), minus the scope.

## AI attribution

Unlike the projects Excalibur helps set up — where the convention is usually to leave no AI trace, depending on the GitHub preset chosen — commits **in Excalibur itself may carry AI attribution normally** (`Co-Authored-By:` and similar). This is a tooling repository, not a product repository subject to an organization ruleset.

## Scope of action

- Commit freely; push, open a PR or merge only when the user asked for it.
- Ask before acting when the scope of a change is ambiguous.
