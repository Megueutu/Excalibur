# lib/features/

Optional standing-context fragments a project can opt into during onboarding — not part of the default pipeline, and not installed unless a manifest answer turns the feature on.

One file per feature, named `<feature>.md`. `excalibur init`/`excalibur update` copies the fragment for every enabled feature into `.excalibur/context/`, and `CLAUDE.md` points every session at reading that folder in full — see `installFeatureFragments` in `excalibur/src/commands/init.js`.

`obsidian.md` is the first fragment, not the only one: a new opt-in feature adds a file here plus a manifest question, nothing else.
