import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot, shippedFolders, projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
import { copyDir, ensureDir, exists, removeDir } from '../lib/fsx.js'
import {
  readConfig,
  writeConfig,
  frameworkVersion,
  syncCustomManifest,
  readAnswers,
} from '../lib/config.js'
import { applyMigrations } from '../lib/migrations.js'
import { orphanedCustomizations } from '../lib/resolve.js'
import { build } from '../lib/build.js'
import { installFeatureFragments, writeClaudeMd } from './init.js'

/**
 * `excalibur update` — rewrite .excalibur/ with the current framework version.
 *
 * It NEVER touches .excalibur.custom/. That is what makes the update safe without
 * any per-file diffing or hashing: default content is disposable, overrides are not,
 * and they live in different folders.
 */
export async function update(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur update ')))

  const paths = projectPaths(cwd)
  if (!exists(paths.base)) {
    p.cancel(`No ${BASE_DIR}/ here. Run \`npx excalibur init\` first.`)
    return 1
  }

  const config = readConfig(cwd)
  const from = config?.framework_version ?? 'unknown'
  const to = frameworkVersion()

  const spinner = p.spinner()
  spinner.start(`Updating ${from} -> ${to}`)

  // Replace wholesale rather than merging: leftover files from a previous version
  // are exactly what a partial overwrite leaves behind.
  for (const folder of [...shippedFolders, 'harnesses']) {
    removeDir(path.join(paths.base, folder))
    copyDir(path.join(packageRoot, folder), path.join(paths.base, folder))
  }
  ensureDir(paths.migrations)

  const savedAnswers = readAnswers(cwd)?.answers ?? {}
  installFeatureFragments(cwd, savedAnswers)
  writeClaudeMd(cwd)

  spinner.stop(`${BASE_DIR}/ updated`)

  // PENDENTE-REVISÃO: see cli/src/lib/migrations.js — section 22 is a 🔧 proposal
  // and this path has never run against a real breaking change.
  const migrated = applyMigrations(cwd, { dryRun: Boolean(args['dry-run']) })
  if (migrated.moved.length) {
    p.log.success(
      `Moved ${migrated.moved.length} customization(s) to their new paths:\n` +
        migrated.moved.map((m) => `  ${pc.dim(m.from)} -> ${m.to}`).join('\n'),
    )
  }
  if (migrated.conflicts.length) {
    p.log.warn(
      'A rename target already had a customization — left both in place, nothing overwritten:\n' +
        migrated.conflicts.map((c) => `  ${c.from} -> ${c.to}`).join('\n'),
    )
  }

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — the matching file no longer exists in ${BASE_DIR}/:\n` +
        orphans.map((o) => `  ${CUSTOM_DIR}/${o}`).join('\n') +
        '\n\nNothing was deleted. Review them by hand; they may just need moving.',
    )
  }

  syncCustomManifest(cwd)

  spinner.start('Rebuilding harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  if (config) writeConfig(cwd, { ...config, framework_version: to })

  p.outro(orphans.length ? `Updated, with ${orphans.length} thing(s) to look at.` : 'Updated.')
  return 0
}
