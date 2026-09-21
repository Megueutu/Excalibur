# lib/

The single directory for operational Excalibur content: what agents actually run on, as opposed to `rules/` (how to judge) or `reflection/` (how to reason). Everything here ends up under `.excalibur/lib/` when a project is onboarded.

Always English, and never translated — unlike `reflection/`, which is translated when a project picks a language other than English. Agents read this directly; a translated copy would be a second source of truth to keep in sync.

| Folder | What it is |
|---|---|
| [`agents/`](agents/) | The internal agent catalog, one `.yaml` source per agent |
| [`pipeline/`](pipeline/) | The implementation process — what happens, in what order, for every task |
| [`scripts/`](scripts/) | Shell helpers onboarding and the pipeline call |
| [`features/`](features/) | Optional standing-context fragments a project can opt into during onboarding |
