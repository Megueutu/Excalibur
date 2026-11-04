# Lens: reversibility

**Use when** a change touches shared state, history, published artifacts or anything another person or system already depends on.

## Questions

1. If this turns out wrong, what exactly has to be undone, and by whom?
2. Is there a way to do it in smaller, separately undoable steps?
3. What cannot be undone at all (sent, published, deleted, migrated)?
4. Can the risky part be done last, after everything reversible is confirmed?
5. What is the cheapest way to be able to go back (a separate line of work, a backup, a switch)?

## Stop when

Every irreversible step is named, isolated, and either confirmed or deferred.
