import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { readConfig, updateConfig, frameworkVersion, syncCustomManifest } from '../lib/config.js'
import { orphanedCustomizations } from '../lib/resolve.js'
import { build } from '../lib/build.js'
import { installFeatureFragments, writeClaudeMd } from './init.js'

/**
 * `excalibur update` — rebuild `.claude/agents/`+`.claude/skills/` from the current
 * package content + overrides, and refresh `CLAUDE.md` + feature fragments.
 *
 * There's no framework folder to re-copy anymore — `build()` already resolves
 * straight from `packageRoot` every time it runs, so a plain `npm install`/`npm
 * update` of the `excalibur` package IS the update; this command (and the
 * `postinstall` hook that runs the same logic automatically) just re-runs the build
 * against whatever's now installed. It never touches the overrides folder.
 */
export async function update(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur update ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.cancel('No config found here. Run `npx create-excalibur` first.')
    return 1
  }

  const config = readConfig(cwd)
  const from = config?.framework_version ?? 'unknown'
  const to = frameworkVersion()

  const spinner = p.spinner()
  spinner.start(`Updating ${from} -> ${to}`)

  const savedAnswers = config?.answers ?? {}
  installFeatureFragments(cwd, savedAnswers)
  writeClaudeMd(cwd, paths.mode)

  spinner.stop('CLAUDE.md and feature context refreshed')

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — the matching file no longer exists in the package:\n` +
        orphans.map((o) => `  ${paths.customDir}/${o}`).join('\n') +
        '\n\nNothing was deleted. Review them by hand; they may just need moving.',
    )
  }

  syncCustomManifest(cwd)

  spinner.start('Rebuilding harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  updateConfig(cwd, { framework_version: to })

  p.outro(orphans.length ? `Updated, with ${orphans.length} thing(s) to look at.` : 'Updated.')
  return 0
}
