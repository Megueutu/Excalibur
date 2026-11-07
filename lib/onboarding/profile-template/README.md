# My AI instructions

Standing instructions for AI agents that apply to every project I work on. Excalibur copies them into each project with `excalibur sync`.

## Layout

- `global/` applies to every project.
- `profiles/<name>/` applies only to projects that opt in with `excalibur profile use <name>`.

## File format

Each `.md` file may start with frontmatter:

```yaml
---
description: one line saying what the file covers
when: always
---
```

- `when: always` means the file is read in full at the start of every session. Keep those short.
- Any other text is a trigger, such as `when committing`. The agent opens the file only when the trigger applies.
- A file without frontmatter is treated as `when: always`.

## Precedence

My request in the moment wins, then each project's own rules, then these files, then Excalibur defaults. Write instructions as defaults for when a project says nothing.

Keep this repository private unless you are sure nothing personal is in it.
