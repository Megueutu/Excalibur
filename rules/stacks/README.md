# rules/stacks/

Recommendations that depend on what the project is built with. A stack is never just a language — it's a language *and* a framework *and* an editor, so these are **combinable files**, not one file per stack.

```
stacks/
  languages/    typescript.yaml, python.yaml, go.yaml
  frameworks/   react.yaml, node.yaml, django.yaml
  ides/         vscode.yaml, jetbrains.yaml
```

A project answering "TypeScript + React + VSCode" during onboarding gets the union of three files. Adding a fourth language doesn't touch the framework or IDE files.

## Shape of a file

```yaml
version: 1
id: typescript
name: TypeScript
tools:              # installable, verifiable things
  - id: eslint
    why: ...
    detect: ...     # shell test for "is it already here?"
    install: ...    # command to add it
conventions:        # read by agents, not installed
  - ...
```

`tools` are genuinely mechanical: a linter checks decidable things and either runs or doesn't. That's the difference from [`../global/`](../global/), where KISS/YAGNI/DRY/SOLID are documents precisely because no tool can check them without generating noise.

## Ask first, or just install?

Neither is hardcoded — it follows the project's **autonomy** setting (the same `autonomy` question that governs whether the `grill-me` interview runs). One notion of autonomy for the whole project, rather than a separate question per kind of interruption:

| Setting | Behavior |
|---|---|
| `always_ask` | Report what's missing, install nothing without confirmation |
| `skip_on_fix` | Same as above for installs — ask first |
| `autonomous` | Run the install directly and report what was done |

## When nothing matches

A project on a stack with no file here gets the global rules and nothing else. That's a fine outcome — an empty recommendation is better than a wrong one. Add a file when there's real content to put in it, not to fill the grid.
