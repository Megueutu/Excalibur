import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../core/paths.js'
import { updateConfig } from '../core/config.js'
import { availableModes, activeMode, syncModeContext } from '../core/modes.js'

/**
 * `excalibur mode [list|<name>|off]` — pick how the agent works with you.
 * One mode at a time; none is the default and changes nothing.
 */
export async function mode(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur mode ')))

  if (!projectPaths(cwd).configured) {
    p.cancel('No config found here. Run `npx @easy-spec/excalibur init` first.')
    return 1
  }

  const [action = 'list', maybeName] = args._
  const modes = availableModes(cwd)
  const current = activeMode(cwd)

  if (action === 'list') {
    const lines = [...modes.values()].map(
      (m) => `${m.name === current ? pc.green('✓') : pc.dim('·')} ${m.name.padEnd(12)} ${m.description}`,
    )
    p.note(lines.join('\n') || 'No modes available.', 'Modes')
    if (!quiet) p.outro(current ? `Active: ${current}.` : 'No mode active.')
    return 0
  }

  const target = action === 'set' ? maybeName : action
  if (target === 'off') {
    updateConfig(cwd, (config) => {
      const { work_mode: _removed, ...rest } = config
      return rest
    })
    syncModeContext(cwd)
    p.outro('Mode turned off.')
    return 0
  }

  if (!target || !modes.has(target)) {
    p.cancel(`Unknown mode "${target ?? ''}". Available: ${[...modes.keys()].join(', ') || 'none'}.`)
    return 1
  }

  updateConfig(cwd, { work_mode: target })
  syncModeContext(cwd)
  p.outro(`Mode "${target}" is active. Start a new session for it to take effect.`)
  return 0
}
