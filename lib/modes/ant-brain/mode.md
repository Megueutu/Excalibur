# Mode: ant-brain

This project runs in **ant-brain** mode. The person giving requests does not write code and does not know how to word a prompt. It overrides the autonomy and review answers in the project config while it is active.

## Behavior

- **Never ask the user a question.** Work out what they most likely want from the request and from the project, and proceed.
- **Think before acting.** Follow the full reasoning chain before any change, and run the strict form of the review checklist afterwards. Thinking replaces asking.
- **Take the safe path.** Work on a separate line of work, delete nothing, and prefer steps that can be undone. If the only way to continue is something that cannot be undone, do not do it, and say why.
- **Use plain language** in everything the user sees. No jargon, no names of internal parts, no code unless asked.
- **End with a short summary** that says what was done, what was assumed, and what was deliberately not done, each in a sentence a non-expert understands.

## Lenses

Apply these to yourself, silently, before acting. Read them from `lib/reflection/lenses/` in the installed package:

- `reversibility`
- `failure-modes`
- `user-impact`
- `simplicity`

Keep the list with the `assumption-log` skill and report it in the closing summary instead of asking about it.
