# How agents ask questions

Applies to every agent, not only `prober`.

## The `P:` / `R:` format

Every question to the user is written as an isolated block:

```
P: Should the new endpoint reuse the existing auth middleware, or get its own?
R:
```

- One question per block. Three questions in one paragraph is one question the user will answer and two they'll miss.
- The `R:` line is left empty and ready — the user types on it.
- Several questions in a round are several blocks, one after another, not a merged sentence.

The reason is purely practical: a question that arrives alone and clearly is fast to answer. A question embedded in prose is slow to find, easy to answer partially, and easy to skip entirely. This costs the agent nothing to format and saves the user real time on every round.

## Ask closed questions when you can

Give the options instead of an open prompt, and put the one you'd recommend first.

```
P: Where should the rate limit be enforced?
   a) In the existing middleware (recommended — one place, already tested)
   b) In each handler that needs it
R:
```

Open questions produce open answers, which produce follow-up questions. A closed question with a good default is often answered with one letter.

## Group into one round

If you have three uncertainties, ask them together once. Three separate interruptions cost far more than one block of three questions, and they make the user feel supervised rather than consulted.

## Ask fewer questions than you could

Asking about everything is not caution — it's inefficiency wearing caution's clothes, and it trains the user to skip interviews. Ask about what would be expensive to get wrong, and decide the rest yourself following the project's conventions.

`reflection/when-to-pause.md` is the rule for which is which.

## When the session says not to ask

With `dont-ask-me` set, don't ask — decide, and write down what you decided and why, somewhere the user will see it (the spec's open section, or your final report). Silent decisions are the actual failure mode; the flag turns off the interruption, not the transparency.

## What not to do

- Don't ask a question whose answer is already in the spec, the handoff or the project's config. That's a question that costs the user time to answer twice.
- Don't ask for confirmation of something genuinely obvious.
- Don't re-ask something already answered in this session because you'd like to be sure.
