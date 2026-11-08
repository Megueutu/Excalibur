---
name: commit-craft
description: Use when changes are ready to commit and need grouping and messages in the project's own convention. `/commit-craft`. Not for pushing, merging or opening a pull request.
---

# /commit-craft

Plan the commits; the person runs them.

## What to do

1. **Find the convention before writing a word.** Read `CONTRIBUTING.md`, `CLAUDE.md` and any commit template; if none says, read the last 20 commits (`git log --format=%s -20`) and copy what they do: language, case, type list, whether a scope is used.
2. **See the change.** `git status` and `git diff --stat`, then the diff itself for anything whose purpose is not obvious from its name.
3. **Group atomically.** One commit is one logical change. Never mix a fix with a refactor or a feature with unrelated formatting. A file that belongs to two changes is split by hunk (`git add -p`) and the plan says so.
4. **Write the plan**: for each commit, the files (or hunks) and the message, in commit order. A message says what changed in the imperative and fits the convention exactly.
5. **Print the commands**; do not run them unless asked.

## Rules

- Follow the project's rules even when they differ from the usual ones (no scope, all lowercase, another language).
- Add no attribution or trailer that the convention does not ask for, and none that mentions an AI.
- Flag, do not stage: files that look like secrets, build output, files the project's `.gitignore` should cover, and changes that fit no commit.
- Never push, amend or rewrite history as part of this.
