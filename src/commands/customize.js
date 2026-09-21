import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { copyFile, exists } from '../lib/fsx.js'
import { syncCustomManifest } from '../lib/config.js'
import { build } from '../lib/build.js'

/**
 * `excalibur customize <path>` — copy one file from the installed package
 * (`node_modules/excalibur/`) to the project's overrides folder (`custom_dir`,
 * `.overrides/` by default) so it can be edited safely.
 *
 * The point is that the user never edits the installed package directly: it's
 * read-only content, overwritten wholesale on every `npm install`/`npm update`.
 * Copying first means the edit survives.
 */
export async function customize(args, cwd) {
  const target = args._[0]

  p.intro(pc.bgCyan(pc.black(' excalibur customize ')))

  if (!target) {
    p.cancel('Usage: npx excalibur customize <path-inside-the-package>')
    return 1
  }

  const rel = String(target).replace(/^\.?[/\\]/, '').split(path.sep).join('/')
  const paths = projectPaths(cwd)
  const source = path.join(paths.base, rel)
  const dest = path.join(paths.custom, rel)

  if (!exists(source)) {
    p.cancel(`Not found in the package: ${rel}`)
    return 1
  }

  if (exists(dest)) {
    p.log.warn(`Already customized: ${paths.customDir}/${rel}`)
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
      `Edit: ${pc.cyan(paths.customDir + '/' + rel)}`,
      '',
      `Resolution is per file: everything else keeps coming from the installed package.`,
      `\`excalibur update\` never touches ${paths.customDir}/, so this edit survives updates.`,
      `Commit ${paths.customDir}/ — it is real customization, the package content isn't.`,
    ].join('\n'),
    `${manifest.customized.length} file(s) customized`,
  )

  p.outro('Ready to edit.')
  return 0
}
