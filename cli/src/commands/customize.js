import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
import { copyFile, exists } from '../lib/fsx.js'
import { syncCustomManifest } from '../lib/config.js'
import { build } from '../lib/build.js'

/**
 * `excalibur customize <path>` — copy one file from .excalibur/ to .excalibur.custom/
 * so it can be edited safely.
 *
 * The point is that the user never edits .excalibur/ directly: that folder is
 * overwritten wholesale on every update. Copying first means the edit survives.
 */
export async function customize(args, cwd) {
  const target = args._[0]

  p.intro(pc.bgCyan(pc.black(' excalibur customize ')))

  if (!target) {
    p.cancel('Usage: npx excalibur customize <path-inside-.excalibur>')
    return 1
  }

  const rel = String(target).replace(/^\.?[/\\]/, '').split(path.sep).join('/')
  const paths = projectPaths(cwd)
  const source = path.join(paths.base, rel)
  const dest = path.join(paths.custom, rel)

  if (!exists(source)) {
    p.cancel(`Not found: ${BASE_DIR}/${rel}`)
    return 1
  }

  if (exists(dest)) {
    p.log.warn(`Already customized: ${CUSTOM_DIR}/${rel}`)
    const overwrite = await p.confirm({
      message: 'Overwrite your customized copy with the default again?',
      initialValue: false,
    })
    if (p.isCancel(overwrite) || !overwrite) {
      p.cancel('Left your version alone.')
      return 1
    }
  }

  copyFile(source, dest)
  const manifest = syncCustomManifest(cwd)
  build(cwd)

  p.note(
    [
      `Edit: ${pc.cyan(CUSTOM_DIR + '/' + rel)}`,
      '',
      `Resolution is per file: everything else in that folder keeps coming from ${BASE_DIR}/.`,
      `\`excalibur update\` never touches ${CUSTOM_DIR}/, so this edit survives updates.`,
      `Commit ${CUSTOM_DIR}/ — it is real customization, unlike ${BASE_DIR}/.`,
    ].join('\n'),
    `${manifest.customized.length} file(s) customized`,
  )

  p.outro('Ready to edit.')
  return 0
}
