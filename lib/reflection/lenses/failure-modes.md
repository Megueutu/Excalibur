# Lens: failure modes

**Use when** the work depends on something that can be slow, absent, malformed or wrong: other services, user input, time, storage.

## Questions

1. What are the ways this can fail, from most likely to most damaging?
2. For each one: who or what notices, and how quickly?
3. What state is left behind when it fails halfway?
4. Does it fail loudly, or does it quietly produce a wrong result?
5. What is the safe default when the answer is unknown?
6. Can the same action be repeated safely?

## Stop when

The two most damaging failures each have a defined, visible outcome.
