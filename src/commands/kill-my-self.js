import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, harnessTargets, BASE_DIR, CUSTOM_DIR, CONFIG_FILE, SESSION_FILE, ANSWERS_FILE } from '../lib/paths.js'
import { exists, removeDir, removeFile, listFiles } from '../lib/fsx.js'

/**
 * `excalibur kill-my-self` — uninstall Excalibur from this project.
 *
 * It removes the framework's machinery. It deliberately does NOT remove the SDD
 * destination: specs, architecture and ideas are the project's own knowledge, not
 * part of the installation. Deleting them here would be destroying the user's work
 * under the heading of "uninstall".
 */
export async function killMySelf(args, cwd) {
  p.intro(pc.bgRed(pc.white(' excalibur kill-my-self ')))

  const paths = projectPaths(cwd)
  const targets = harnessTargets.claude

  const toRemove = [
    { label: `${BASE_DIR}/`, target: paths.base, dir: true },
    { label: `${CUSTOM_DIR}/`, target: paths.custom, dir: true },
    { label: CONFIG_FILE, target: paths.config, dir: false },
    { label: SESSION_FILE, target: paths.session, dir: false },
    { label: ANSWERS_FILE, target: paths.answers, dir: false },
    { label: targets.agents, target: path.join(cwd, targets.agents), dir: true },
    { label: targets.skills, target: path.join(cwd, targets.skills), dir: true },
  ].filter((item) => exists(item.target))

  if (toRemove.length === 0) {
    p.outro('Excalibur is not installed here.')
    return 0
  }

  const customCount = exists(paths.custom) ? listFiles(paths.custom).filter((f) => f !== 'manifest.yaml').length : 0

  p.note(toRemove.map((item) => item.label).join('\n'), 'Will be removed')

  if (customCount > 0) {
    p.log.warn(
      `${customCount} customized file(s) in ${CUSTOM_DIR}/ will go with it. That folder is versioned, so git can bring it back — but only if it was committed.`,
    )
  }

  p.log.info('Your SDD content (specs, architecture, ideas) is NOT touched — it is your project, not the installation.')

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

  p.outro(`Removed. The .gitignore entries are still there — clear them by hand if you want them gone.`)
  return 0
}
