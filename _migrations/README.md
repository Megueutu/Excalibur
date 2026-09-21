# _migrations/

Migration maps for versions that change the structure of `.excalibur/` in a way that breaks existing overrides in `.excalibur.custom/`. Shipped into every project's `.excalibur/_migrations/` and consumed by `excalibur update` (see `excalibur/src/lib/migrations.js`).

One file per breaking version, named `<from>-to-<to>.yaml`:

```yaml
version: 1
from: "1.x"
to: "2.x"
renames:
  - from: rules/global/kiss.md
    to: rules/principles/kiss.md
removed:
  - rules/old-thing.md
```

On `excalibur update`, a known rename moves the matching file in `.excalibur.custom/` to its new path, so the customization survives. A deeper change — the path still exists but its expected content changed — is deliberately not guessed at: it is reported as an orphaned customization for a human to look at.
