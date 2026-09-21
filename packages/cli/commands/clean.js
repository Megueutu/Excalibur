import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, harnessTargets } from '../core/paths.js'
import { exists, removeDir } from '../core/fsx.js'
import { build, canBuild } from '../core/build.js'

/**
 * `excalibur clean` — clear generated/temporary artifacts.
 *
 * Distinct from `clean-history`, which is only about history.yaml. This one removes
 * build output: the files written into the harness's fixed paths, which are copies
 * and can always be regenerated from the installed package (`node_modules/@easy-spec/excalibur/`)
 * + the project's overrides folder (`custom_dir`).
 *
 * It never touches the overrides folder, the SDD destination, or the config —
 * nothing here is a source of truth.
 */
export async function clean(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur clean ')))

  const paths = projectPaths(cwd)
  const targets = harnessTargets.claude
  const removable = []

  for (const dir of [path.join(cwd, targets.agents), path.join(cwd, targets.skills)]) {
    if (exists(dir) && fs.readdirSync(dir).length > 0) removable.push(dir)
  }

  if (removable.length === 0) {
    p.outro('Nothing to clean.')
    return 0
  }

  p.note(
    removable.map((d) => path.relative(cwd, d).split(path.sep).join('/')).join('\n'),
    'Generated files (rebuildable)',
  )

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Remove these? They are rebuilt from the installed package on the next init/update.',
      initialValue: true,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Nothing was removed.')
      return 1
    }
  }

  for (const dir of removable) removeDir(dir)

  if (canBuild(cwd) && !args['no-rebuild']) {
    const built = build(cwd)
    p.log.success(`Rebuilt ${built.agents.length} agents and ${built.skills.length} skill files.`)
  }

  p.outro('Cleaned.')
  return 0
}
