# Lens: boundaries and contracts

**Use when** the change crosses a seam: between modules, between teams, between a producer and its consumers.

## Questions

1. Who depends on what is changing, including people who are not in this task?
2. What does the contract promise, and does this change keep every promise?
3. Is the coupling being added deliberate, or a shortcut?
4. Which side should own this logic?
5. What would have to change elsewhere if this changes again?
6. Can old and new live side by side during the transition?

## Stop when

Every consumer is identified and the change is either compatible or has an agreed transition.
