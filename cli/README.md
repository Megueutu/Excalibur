# cli/

The npm-publishable Node CLI. This is the **distribution mechanism** — it is not where framework content lives.

`wizard/`, `pipeline/`, `rules/` and `reflection/` are the source of truth for content. The CLI packages and copies them. If a rule's text ever appears inside `cli/src/`, that's a bug.

```
cli/
  bin/excalibur.js        entrypoint and command dispatch
  src/commands/           one file per command
  src/lib/                override resolution, build, paths, minimal YAML
```

## Commands

| Command | What it does |
|---|---|
| `npx excalibur init` | Runs the form, writes `.excalibur-answers.yaml`, materializes `.excalibur/`, writes `Excalibur` |
| `npx excalibur update` | Rewrites `.excalibur/` with the current version — **never** touches `.excalibur.custom/` |
| `npx excalibur customize <path>` | Copies one file into `.excalibur.custom/` for safe editing |
| `npx excalibur check` | Verifies node, git, bash and gh before an install fails halfway |
| `npx excalibur status` | Destination, customized file count, last prune, installed version |
| `npx excalibur session <flag>` | Writes a session directive to `.excalibur-session.yaml` |
| `npx excalibur reset` | Clears the session directives |
| `npx excalibur clean-history` | Prunes old history: out of git, archived locally |
| `npx excalibur clean` | Removes generated harness files (they rebuild) |
| `npx excalibur kill-my-self` | Uninstalls Excalibur — leaves your SDD content alone |

## Decisions worth knowing before changing anything here

**Single package.** One `package.json` at the repository root covers the CLI *and* the framework content, at one version. That's what OpenSpec and BMad Method both do. Splitting into a workspace with independent versions is a later move, justified only if the CLI and the content start evolving at genuinely different rates.

**Three dependencies, deliberately.** `@clack/prompts` (the interface), `mri` (flag parsing, for non-interactive use), `picocolors` (color) — exactly what `create-vite` uses. YAML is read by a small in-repo reader (`src/lib/yaml.js`) rather than a fourth dependency; if it ever needs anchors or flow collections, that's the signal to swap in the `yaml` package, and the change is contained to that one file.

**Check before writing, not rollback after.** `create-vite`'s actual source doesn't undo anything after a failure — it checks whether the target exists and isn't empty *before* touching a file, then offers three options: cancel, remove and continue, or ignore and continue. `init` does the same. It solves the real problem without needing a snapshot or a transaction.

**Never installed by cloning.** All three researched SDD frameworks install through a package manager that fetches and runs an installer — never `git clone` of the framework into the target project. The CLI is that installer.

**`build` is a library, not a command.** Resolving `.excalibur.custom/` over `.excalibur/` and writing the result to the path the harness reads (`.claude/agents/`, `.claude/skills/`) has to happen, because Claude Code reads one fixed path and can't do the fallback itself. It runs automatically from `init`, `update` and `customize` — the three moments the effective file set changes. The command list is a closed decision and doesn't include a build verb.

## Where paths live

Every path the CLI knows is in `src/lib/paths.js`, including where each harness reads its files. That location is still unverified in practice (see `PENDENCIAS.md` item 4), so it's centralized on purpose: correcting it later is a one-line change.
