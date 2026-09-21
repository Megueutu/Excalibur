---
name: try-gh
description: Use when a task needs the GitHub CLI and it may not be ready — checking whether `gh` is installed and authenticated, and helping fix it when it isn't. Also useful when a `gh` command just failed and the cause is unclear.
---

# Try gh

A friendly diagnostic on top of `scripts/check-gh.sh`.

## The order matters: cheap first

1. **Local check — free.** Run `scripts/check-gh.sh` and read its exit code:

   | Exit | Meaning | What to say |
   |---|---|---|
   | 0 | Installed and authenticated | Ready. Nothing to do. |
   | 1 | Installed, not authenticated | The user runs `gh auth login` themselves — it's interactive OAuth and can't be driven for them. |
   | 2 | Not installed | Continue to step 2. |

2. **Local install path — still free.** Run `scripts/detect-os.sh` and use the matching installer already in `scripts/` (`install-gh-windows.sh`, `install-gh-macos.sh`, `install-gh-linux-apt.sh`, `install-gh-linux-dnf.sh`). Ask before running it, unless the project's autonomy setting says otherwise.

3. **The web — only as a last resort.** Search for install instructions **only** when the OS didn't match any of the four installers above. That's the expensive step, and it's rarely needed.

That order is the same cost discipline the rest of the framework follows: don't pay for a web search to answer something a local exit code already answered.

## After a fix

Re-run `check-gh.sh` to confirm, rather than assuming the install worked. An installer that exits 0 without `gh` landing on the PATH is a normal Windows outcome.

## When `gh` stays unavailable

Say plainly what changes, so the user isn't surprised later:

- No automated repository creation.
- PRs opened through a browser link instead of the CLI.
- Everything else in the pipeline works normally — `gh` is convenience, not a dependency.
