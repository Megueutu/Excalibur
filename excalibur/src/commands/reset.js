import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths, SESSION_FILE } from '../lib/paths.js'
import { exists, removeFile } from '../lib/fsx.js'

/**
 * `excalibur reset` — clear the active session directives.
 *
 * Only touches .excalibur-session.yaml. It does not reset the project config, the
 * installed framework or any customization — those have their own commands, and
 * conflating them would make this the one destructive command nobody expects.
 */
export async function reset(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur reset ')))

  const paths = projectPaths(cwd)

  if (!exists(paths.session)) {
    p.outro(`No ${SESSION_FILE} — nothing to reset.`)
    return 0
  }

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: `Clear every session directive in ${SESSION_FILE}?`,
      initialValue: true,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Left as is.')
      return 1
    }
  }

  removeFile(paths.session)
  p.outro(`${SESSION_FILE} removed — all flags back to default (off).`)
  return 0
}
