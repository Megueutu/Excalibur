# YAGNI — You Aren't Gonna Need It

Build what the task asks for. Not the generalized version of it, not the version that will also handle the case someone might need next quarter.

## In practice

- **No abstraction with one implementation.** An interface with a single implementer is a guess about the future written into today's code.
- **No configuration option nobody asked for.** Every setting is a branch to maintain, document and test.
- **No "while I'm here".** Refactoring adjacent code because you happen to be nearby expands the diff, expands the review, and mixes an unrequested change into a requested one.
- **No placeholder for a feature that isn't being built.** An empty hook or a `TODO: support X` is a guess that costs maintenance now for value later, maybe.

## Why this one matters especially with agents

An agent generalizes readily and cheaply — producing the flexible version costs it very little. But every unasked-for abstraction becomes context that every future agent reads, reasons about, and has to decide whether to respect. YAGNI violations compound faster here than in code written by hand.

## The honest test

Is there a concrete, currently existing need for this? Not "it's likely" — an actual one, today. If not, don't build it. Write it down as a possibility in `ideas/` if it's worth remembering.

## Where this doesn't apply

YAGNI is not an argument against thinking ahead. Choosing a shape that *can* accommodate a known next step costs nothing, as long as you don't build that step. The rule is about what you implement, not about what you consider.

It is also not an argument against doing the requested work properly. Delivering half a feature and calling the rest YAGNI is scope reduction, and that's the user's call to make, not yours.
