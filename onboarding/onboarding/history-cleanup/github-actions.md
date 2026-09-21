# History cleanup — GitHub Actions

Cleanup runs in CI, outside the interactive session. Useful when more than one person works on the project and you don't want the prune to depend on whoever happened to open a session.

## Setup

Commit this workflow as `.github/workflows/excalibur-clean-history.yml`:

```yaml
name: excalibur clean-history

on:
  schedule:
    - cron: "0 3 * * 1"   # Mondays, 03:00 UTC
  workflow_dispatch:

permissions:
  contents: write

jobs:
  clean:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npx @spec/excalibur clean-history --yes
      - name: Commit the pruned history
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add -A
          git diff --staged --quiet || git commit -m "chore: prune excalibur history"
          git push
```

## One caveat worth knowing

The archive half of the default criterion (`history/archive/`) is gitignored, so an archive written inside a CI runner is discarded when the job ends — only the removal from version control survives. If keeping the archive matters to you, use the scheduled-task or manual option instead, both of which run on a machine that persists.
