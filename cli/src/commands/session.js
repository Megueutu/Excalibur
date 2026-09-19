import * as p from '@clack/prompts'
import pc from 'picocolors'
import { readSession, writeSession, SESSION_FLAGS } from '../lib/config.js'
import { SESSION_FILE } from '../lib/paths.js'

/**
 * `excalibur session <flag>` — set or clear a session directive.
 *
 * CLI only, no skill counterpart: this is metadata the orchestrator reads and passes
 * down through handoffs, not a conversation.
 */
export async function session(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur session ')))

  const current = readSession(cwd)
  const flags = { ...(current?.flags ?? {}) }
  const requested = args._[0]

  if (!requested) {
    const lines = Object.entries(SESSION_FLAGS).map(([flag, description]) => {
      const value = flags[flag]
      const state = value === undefined || value === false ? pc.dim('off') : pc.green(value === true ? 'on' : String(value))
      return `${state.padEnd(16)} ${flag.padEnd(18)} ${pc.dim(description)}`
    })
    p.note(lines.join('\n'), SESSION_FILE)
    p.outro('Set one with: npx excalibur session <flag> [value]  ·  clear with --off')
    return 0
  }

  const flag = String(requested)
  if (!(flag in SESSION_FLAGS)) {
    p.cancel(`Unknown flag: ${flag}\nKnown flags: ${Object.keys(SESSION_FLAGS).join(', ')}`)
    return 1
  }

  if (args.off) {
    delete flags[flag]
    writeSession(cwd, flags)
    p.outro(`${flag} cleared.`)
    return 0
  }

  // Two flags carry a value rather than being on/off.
  const value = args._[1]
  if (flag === 'budget-limit' || flag === 'read-history') {
    if (value === undefined) {
      p.cancel(
        flag === 'budget-limit'
          ? 'budget-limit needs a value: npx excalibur session budget-limit 50000'
          : 'read-history needs a value: npx excalibur session read-history always',
      )
      return 1
    }
    flags[flag] = value
  } else {
    flags[flag] = true
  }

  writeSession(cwd, flags)
  p.note(`${flag} = ${pc.green(String(flags[flag]))}`, 'Set')
  p.outro(`Written to ${SESSION_FILE}. The orchestrator reads it at the start of every session.`)
  return 0
}
