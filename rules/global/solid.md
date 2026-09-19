# SOLID

Five principles, not one — kept in a single file because an agent reads them as a block, and splitting them into five files would cost five reads for content that's one idea at a time.

They come from object-oriented design. In a codebase that isn't class-oriented, read "class" as "module" or "unit" — the underlying questions still apply.

## S — Single Responsibility

A unit should have one reason to change. The test isn't "does it do one thing" (everything can be described as one thing at some altitude) — it's **who asks for changes to it**. If the reporting team and the billing team both file requests against the same module, it has two responsibilities and their changes will collide.

## O — Open/Closed

You should be able to extend behavior without editing the thing being extended. In practice this is about not having to reopen and modify stable, tested code to add a case.

The common failure is applying this too early: building an extension mechanism before there is a second case is exactly the YAGNI violation described in [`yagni.md`](yagni.md). Prefer to let the second real case tell you what the seam should look like.

## L — Liskov Substitution

Anything that claims to be a `T` must actually behave like a `T`. A subtype that throws where the parent returns, or that demands more than the parent did, breaks every caller that trusted the contract.

Modern form: if a function takes an interface, every implementation of that interface has to satisfy what callers assume — not just compile.

## I — Interface Segregation

Don't force a caller to depend on methods it doesn't use. A fat interface means every implementer writes stubs, and every consumer reads past irrelevant surface to find what it needs. Several small interfaces beat one that covers everything.

## D — Dependency Inversion

High-level policy shouldn't depend on low-level detail; both should depend on an abstraction. Business logic shouldn't import the database driver directly.

Same caveat as Open/Closed: this is worth doing when there's a real boundary — something that genuinely gets swapped, or needs to be substituted in tests. Inverting every dependency on principle produces indirection with no payoff, which KISS rules out.

## How to hold these

These are diagnostic questions, not a checklist to pass. "Does this have more than one reason to change?" is a useful thing to ask about code that feels wrong. "This violates ISP" said about a two-method interface is cargo cult.

When SOLID and KISS/YAGNI disagree — which happens most often around Open/Closed and Dependency Inversion — **KISS and YAGNI win**, and the SOLID structure gets introduced when a second real case forces it.
