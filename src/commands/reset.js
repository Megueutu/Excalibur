import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { readConfig, updateConfig } from '../lib/config.js'

/**
 * `excalibur reset` — clear the active session directives.
 *
 * Only touches the config's `session.flags`. Doesn't touch answers, framework
 * version, or anything else in the document.
 */
export async function reset(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur reset ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.outro('No config found here — nothing to reset.')
    return 0
  }

  const config = readConfig(cwd)
  const activeFlags = Object.keys(config?.session?.flags ?? {})

  if (activeFlags.length === 0) {
    p.outro('No session flags set — nothing to reset.')
    return 0
  }

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Clear every session directive?',
      initialValue: true,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Left as is.')
      return 1
    }
  }

  updateConfig(cwd, (current) => ({ ...current, session: { flags: {} } }))
  p.outro('Session directives cleared — all flags back to default (off).')
  return 0
}
