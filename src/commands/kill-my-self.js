import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, harnessTargets, locateConfig } from '../lib/paths.js'
import { exists, removeDir, removeFile, listFiles, writeText } from '../lib/fsx.js'

/**
 * `excalibur kill-my-self` — uninstall Excalibur from this project.
 *
 * Removes the config, the overrides folder, and the built harness files. Never
 * touches `node_modules/` — that's the installed package, not something this
 * command owns; `npm uninstall @easy-spec/excalibur` is how that actually goes away. It also
 * never removes the SDD destination: specs, architecture and ideas are the
 * project's own knowledge, not part of the installation.
 */
export async function killMySelf(args, cwd) {
  p.intro(pc.bgRed(pc.white(' excalibur kill-my-self ')))

  const paths = projectPaths(cwd)
  const located = locateConfig(cwd)
  const targets = harnessTargets.claude

  const toRemove = [
    { label: paths.customDir + '/', target: paths.custom, dir: true },
    { label: path.join(cwd, 'CLAUDE.md'), target: path.join(cwd, 'CLAUDE.md'), dir: false },
    { label: targets.agents, target: path.join(cwd, targets.agents), dir: true },
    { label: targets.skills, target: path.join(cwd, targets.skills), dir: true },
  ].filter((item) => exists(item.target))

  if (!located && toRemove.length === 0) {
    p.outro('Excalibur is not installed here.')
    return 0
  }

  const customCount = exists(paths.custom) ? listFiles(paths.custom).filter((f) => f !== 'manifest.yaml').length : 0

  const configLabel = located
    ? located.mode === 'discreet'
      ? 'package.json ("excalibur" key removed, rest of the file kept)'
      : 'excalibur.yaml'
    : null

  p.note(
    [...(configLabel ? [configLabel] : []), ...toRemove.map((item) => item.label)].join('\n'),
    'Will be removed',
  )

  if (customCount > 0) {
    p.log.warn(
      `${customCount} customized file(s) in ${paths.customDir}/ will go with it. That folder is versioned, so git can bring it back — but only if it was committed.`,
    )
  }

  p.log.info('Your SDD content (specs, architecture, ideas) is NOT touched — it is your project, not the installation.')
  p.log.info('node_modules/@easy-spec/excalibur is NOT removed — run `npm uninstall @easy-spec/excalibur` for that, separately.')

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Remove Excalibur from this project?',
      initialValue: false,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Nothing was removed.')
      return 1
    }
  }

  for (const item of toRemove) {
    if (item.dir) removeDir(item.target)
    else removeFile(item.target)
  }

  if (located?.mode === 'discreet') {
    const pkg = JSON.parse(fs.readFileSync(located.file, 'utf8'))
    delete pkg.excalibur
    writeText(located.file, JSON.stringify(pkg, null, 2) + '\n')
  } else if (located) {
    removeFile(located.file)
  }

  p.outro('Removed.')
  return 0
}
