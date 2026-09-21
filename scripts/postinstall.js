#!/usr/bin/env node
import { locateConfig } from '../src/lib/paths.js'
import { update } from '../src/commands/update.js'

/**
 * Runs automatically on `npm install` (wired as the `postinstall` script in
 * package.json). NOT a public `excalibur <verb>` — the CLI's command list is a
 * closed decision that doesn't include a build verb; this is an npm lifecycle hook
 * calling the same logic `excalibur update` exposes manually.
 *
 * `INIT_CWD` is what npm sets to the directory `npm install` was actually invoked
 * from — this script's own `cwd` is inside `node_modules/@easy-spec/excalibur/`, not the
 * consuming project's root, since that's where npm runs every package's lifecycle
 * scripts. Known limitation, not solved here: pnpm/Yarn have their own (different)
 * lifecycle-script conventions and may not set INIT_CWD the same way, or may block
 * arbitrary postinstall scripts by default — this targets plain npm, matching every
 * other install-flow decision in this framework.
 */
async function main() {
  const targetCwd = process.env.INIT_CWD
  if (!targetCwd) {
    // No INIT_CWD at all means this isn't running under a normal `npm install` —
    // silently do nothing rather than guess at a directory.
    return
  }

  const located = locateConfig(targetCwd)
  if (!located) {
    // Either excalibur's own development install, or a package install that
    // hasn't been scaffolded with create-excalibur yet — nothing to rebuild.
    return
  }

  try {
    await update({}, targetCwd)
  } catch (error) {
    // A postinstall failure must never fail the whole `npm install` — the package
    // is still correctly installed even if the rebuild had a problem. Report it
    // and let `excalibur update` be run manually to see the real error.
    console.error('excalibur postinstall: rebuild failed, run `npx @easy-spec/excalibur update` to see why:', error.message)
  }
}

main()
