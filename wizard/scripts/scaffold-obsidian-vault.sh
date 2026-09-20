#!/usr/bin/env bash
# wizard/scripts/scaffold-obsidian-vault.sh — materializes a minimal .obsidian/
# config folder inside the SDD destination, when the manifest's `obsidian_vault`
# answer is `vault` (not `md_only`). Closes a real gap: the option has existed in
# wizard/manifest.yaml since onboarding was written, but nothing implemented it.
#
# Usage: wizard/scripts/scaffold-obsidian-vault.sh <sdd-destination-path>
# Requires: the destination must already exist (run after wizard/init.sh).
# Exit codes: 0 = created (or already present), 1 = bad args, 2 = destination
#   missing.
#
# This is deliberately minimal: just enough app.json/appearance.json for Obsidian
# to open the folder as a vault cleanly, without complaint or a first-run wizard.
# It does not try to replicate every Obsidian setting, plugin, or workspace layout.
set -euo pipefail

DEST="${1:-}"

if [[ -z "$DEST" ]]; then
  echo "Usage: wizard/scripts/scaffold-obsidian-vault.sh <sdd-destination-path>" >&2
  exit 1
fi

if [[ ! -d "$DEST" ]]; then
  echo "Error: destination does not exist or is not a directory: $DEST" >&2
  exit 2
fi

OBSIDIAN_DIR="$DEST/.obsidian"

if [[ -e "$OBSIDIAN_DIR" ]]; then
  echo "Obsidian vault config already present: $OBSIDIAN_DIR"
  exit 0
fi

mkdir -p "$OBSIDIAN_DIR"

# app.json — core app settings. Defaults chosen so the SDD's own structure
# (Templates/, architecture/, ideas/) reads well without extra setup: new notes
# and attachments land next to the note that created them, not scattered at the
# vault root.
cat > "$OBSIDIAN_DIR/app.json" <<'JSON'
{
  "newFileLocation": "current",
  "attachmentFolderPath": "./",
  "alwaysUpdateLinks": true,
  "useMarkdownLinks": false
}
JSON

# appearance.json — cosmetic only, safe defaults (system theme, native fonts).
cat > "$OBSIDIAN_DIR/appearance.json" <<'JSON'
{
  "theme": "system",
  "cssTheme": "",
  "baseFontSize": 16
}
JSON

echo "Created Obsidian vault config at: $OBSIDIAN_DIR"
