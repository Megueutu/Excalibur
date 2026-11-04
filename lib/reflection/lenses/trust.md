# Lens: trust and exposure

**Use when** the work handles input from outside, identity, permissions, secrets or anything that crosses a trust boundary.

## Questions

1. What comes from outside, and what is assumed about it without checking?
2. Who is allowed to do this, and where is that enforced?
3. What is secret here, and where could it leak (logs, errors, copies)?
4. What is the worst thing a hostile or careless caller could do?
5. Does this grant more access than the task needs?
6. What is recorded so misuse can be noticed later?

## Stop when

Each outside input is validated or explicitly trusted for a stated reason, and secrets have one controlled path.
