# KISS — Keep It Simple

Prefer the solution that is easiest to understand later over the one that is cleverest now. The reader of this code — often an agent, often you in three months with no memory of today — is the constraint that matters.

## In practice

- **Fewer moving parts wins.** A function beats a class hierarchy when a function does the job. A file beats a folder. A direct call beats an event bus.
- **Indirection needs to earn itself.** Every layer between the caller and the work is a layer someone has to traverse to understand what happens. Add one when it removes more confusion than it creates.
- **Configuration is complexity too.** An option that nobody changes is a branch that has to be understood and tested anyway.
- **Boring beats novel.** Using the pattern the project already uses is almost always better than introducing a better one that now exists exactly once.

## The honest test

Can you explain what this does, and why it is shaped this way, in a couple of sentences without saying "well, it's a bit involved"? If not, it probably wants to be simpler — or it genuinely is complex, and that complexity should be written down rather than left to be rediscovered.

## Where this doesn't apply

Simple does not mean short, and it does not mean under-specified. An API spec that documents every payload is long and simple. A regex that replaces thirty lines is short and anything but.

Simplicity is about how hard the thing is to hold in your head — not its line count.
