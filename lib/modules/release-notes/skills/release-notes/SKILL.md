---
name: release-notes
description: Use when preparing a release, to draft the changelog entry and a version bump from the commits since the last tag. `/release-notes`. Not for tagging or publishing.
---

# /release-notes

A thin wrapper over the `changelogger` subagent (`agents/changelogger/agent.yaml`).

## What to do

1. Dispatch `changelogger` on the repository.
2. Show the suggested version and its reason first, then the entry, then the commits that did not follow the convention.
3. Tag, publish and edit nothing; the person pastes the entry and runs the release.
