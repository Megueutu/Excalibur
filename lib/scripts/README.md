# lib/scripts/

Shell helpers onboarding and the pipeline call. Small, single-purpose, and callable by an agent without interpretation.

| Script | What it does | Exit codes |
|---|---|---|
| `check-gh.sh` | Is the GitHub CLI installed and authenticated? | 0 ok · 1 not authenticated · 2 not installed |
| `check-git-repo.sh` | Is the target path a git repository? | 0 yes · 1 no |
| `init-git-repo.sh` | `git init` on the target path | 0 ok |
| `create-github-repo.sh` | Creates the GitHub repo via `gh` | 0 ok |
| `detect-os.sh` | `windows` / `macos` / `linux-apt` / `linux-dnf` / `unknown` | 0 always |
| `install-gh-*.sh` | Installs `gh` for the OS `detect-os.sh` reported | 0 ok |
| `detect-stack.sh` | Guesses language, framework and IDE from files on disk | 0 always |
| `record-history.sh` | Appends one changelog entry to a task's `history.yaml` | 0 ok |
| `convert-history.sh` | Builds a compact, fixed-schema digest of every task's history | 0 ok |

## Why `.sh` and not Node — do not reopen this without reading

This was reconsidered once and reverted with measurements. Recording it here so nobody relitigates it from intuition.

**The benchmark that settled it:** a Codex (OpenAI) plugin PR replaced a Node.js agent hook with a bash equivalent. Measured with `hyperfine` over 30 runs: **106ms → 5ms, a 21x improvement.** Node pays roughly 100ms of V8 startup overhead even for trivial work; bash starts effectively instantly. These scripts are small and called often — exactly the profile where that overhead dominates.

**What two real multi-OS projects do:** `itsmichaelwest/agent-kit` keeps `setup.sh` and `setup.ps1` separate with the shared heavy lifting in `scripts/lib/`, duplicating only the shell. The Snowdream Tech Template states the principle outright — heavy logic in POSIX shell, thin wrappers for PowerShell/Batch on Windows.

## Windows: Git Bash is a prerequisite

Rather than duplicating every script as a `.ps1` — which would mean a lot of repeated code kept in sync by hand — the strategy is to **minimize the number of wrappers to as close to zero as possible**:

- **Git Bash is assumed present on Windows.** It very nearly always is, since Excalibur depends on `git` and `gh` anyway. Scripts run directly with `bash script.sh`, no wrapper needed.
- **`excalibur check` verifies `bash` is on the PATH** on Windows and tells the user to install Git Bash if it isn't — one check, instead of a parallel `.ps1` for every script.
- **A `.ps1` wrapper is born only if a specific script turns out not to run under Git Bash at all** — a pointed exception, never the default.

## Conventions for a new script

- `#!/usr/bin/env bash` and `set -euo pipefail`.
- A header comment with usage and the meaning of each exit code.
- Print a result an agent can parse without guessing (`key=value` lines, or a single clear sentence).
- Never prompt interactively: these run unattended. Anything needing a human decision belongs in the flow that calls the script, not in the script.
