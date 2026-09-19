# wizard/onboarding/

Pre-written files copied into the SDD destination based on the answers to [`../manifest.yaml`](../manifest.yaml). One folder per question that materializes a file.

Nothing here is generated at onboarding time — every option maps to a file that already exists, via that option's `copy` block. That is deliberate: copying a reviewed file is cheaper and more predictable than having an agent write one on the spot.

| Folder | Question |
|---|---|
| `github/` | `github_preset` — how git/GitHub is handled |
| `review-depth/` | `review_depth` — how strict the final checklist is |
| `commit-convention/` | `commit_convention` — commit/branch convention |
| `testing-policy/` | `testing_policy` — when tests are required |
| `history-cleanup/` | `history_cleanup` — how execution history is pruned |

To add an option, write the file here first, then point the manifest option at it.
