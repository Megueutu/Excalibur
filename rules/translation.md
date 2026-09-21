# What gets translated, and what never does

The project's language is chosen during onboarding (`language` in the manifest). This rule decides what that choice applies to.

## The split is structural

Not a list of exceptions to maintain — the answer comes from **where a file sits**:

| | Translated | What it is |
|---|---|---|
| **Visible SDD** | yes | `ideas/`, `architecture/`, `proposal.md`, `spec.md`, `design.md`, the project canvas |
| **Operational Excalibur** | **never** | the installed package (`node_modules/@spec/excalibur/`) entirely (rules, agent prompts, session directives), `lib/pipeline/`, `rules/`, `tasks.yaml`, `history.yaml` |

Visible SDD is written for humans to read and collaborate on. Operational content is machinery an agent consumes.

## Why

**Token economy.** Nothing should spend tokens translating a file no human will ever read. `tasks.yaml` is parsed, `history.yaml` is a record, agent prompts are instructions — translating any of them costs money and buys nothing.

**It also removes a maintenance burden.** The earlier design needed a list of files that stay canonical (`git.md`, `commit-convention.md`, …), and every new file meant deciding whether to add it to that list. Now the file's position answers it.

## Canonical language of the operational layer

English. Everything under `lib/pipeline/`, `rules/` and the installed package (`node_modules/@spec/excalibur/`) is written and kept in English regardless of the project's language, so the same framework content works for every project and never needs a translation pass.

## Detecting the project's language

In order:

1. The language the user is writing in, in this conversation.
2. The target project's `README.md`.
3. Ask outright.

The OS locale is deliberately not used — it's a poor signal in an agent context, where the machine's locale often has nothing to do with the language a team documents in.

## Continuous, not one-shot

The translation applies to **every visible-SDD document written from then on**, not just the batch created during onboarding. A project drifting into two languages defeats the purpose of the SDD being a single readable context.

## Preserved through translation

Never translated, even inside a translated file:

- Frontmatter **keys** (values that are free text are translated)
- `[[wikilink]]` targets — a wikilink points at a file by its untranslated name
- Callout types (`[!note]`, `[!warning]`, `[!danger]`)
- Code blocks, paths, commands, identifiers
- Heading levels and list/checkbox structure — text changes, structure doesn't
