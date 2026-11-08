---
name: privacy-scan
description: Use before pushing, or when sharing code, fixtures or logs, to sniff for personal data (CPF, e-mail, phone, cards). `/privacy-scan`. Not for secrets and not for fixing.
---

# /privacy-scan

A thin wrapper over the `piihound` subagent (`agents/piihound/agent.yaml`).

## What to do

1. Dispatch `piihound` against the current diff, or the folder the person named.
2. Surface the verdict first (`approved`, `attention`, `blocked`), then the findings with their values masked.
3. On `blocked`, do not push. Removing the data, or ruling it synthetic, is the person's call.

## What this is not

Not the secret scan (`/scenthound-scan`) and not a legal review. A clean result means the patterns found nothing, not that no personal data exists.
