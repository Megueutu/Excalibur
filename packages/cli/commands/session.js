import * as p from '@clack/prompts'
import pc from 'picocolors'
import { readConfig, updateConfig, SESSION_FLAGS } from '../core/config.js'

/**
 * `excalibur session <flag>` — set or clear a session directive.
 *
 * CLI only, no skill counterpart: this is metadata the orchestrator reads and passes
 * down through handoffs, not a conversation.
 */
export async function session(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur session ')))

  const config = readConfig(cwd)
  const flags = { ...(config?.session?.flags ?? {}) }
  const requested = args._[0]

  if (!requested) {
    const lines = Object.entries(SESSION_FLAGS).map(([flag, description]) => {
      const value = flags[flag]
      const state = value === undefined || value === false ? pc.dim('off') : pc.green(value === true ? 'on' : String(value))
      return `${state.padEnd(16)} ${flag.padEnd(18)} ${pc.dim(description)}`
    })
    p.note(lines.join('\n'), 'Session flags')
    p.outro('Set one with: npx @easy-spec/excalibur session <flag> [value]  ·  clear with --off')
    return 0
  }

  const flag = String(requested)
  if (!(flag in SESSION_FLAGS)) {
    p.cancel(`Unknown flag: ${flag}\nKnown flags: ${Object.keys(SESSION_FLAGS).join(', ')}`)
    return 1
  }

  if (args.off) {
    delete flags[flag]
    updateConfig(cwd, (current) => ({ ...current, session: { flags } }))
    p.outro(`${flag} cleared.`)
    return 0
  }

  const value = args._[1]
  if (flag === 'budget-limit' || flag === 'read-history') {
    if (value === undefined) {
      p.cancel(
        flag === 'budget-limit'
          ? 'budget-limit needs a value: npx @easy-spec/excalibur session budget-limit 50000'
          : 'read-history needs a value: npx @easy-spec/excalibur session read-history always',
      )
      return 1
    }
    flags[flag] = value
  } else {
    flags[flag] = true
  }

  updateConfig(cwd, (current) => ({ ...current, session: { flags } }))
  p.note(`${flag} = ${pc.green(String(flags[flag]))}`, 'Set')
  p.outro('Written. The orchestrator reads it at the start of every session.')
  return 0
}
