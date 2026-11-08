import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../../core/paths.js'
import { updateConfig } from '../../core/config.js'
import { availableModules, activeModules, withRequirements, syncModuleContext } from '../../core/modules.js'
import { build } from '../../core/build.js'

/**
 * `excalibur module [list|add|remove] [name...]` — turn optional content on or off.
 * The active list is the config's `modules:`; every change re-syncs the module
 * context and rebuilds the harness files, so the result is visible straight away.
 */

function describe(mod, isActive) {
  const parts = []
  if (mod.context.length) parts.push(`${mod.context.length} context`)
  if (mod.agents.length) parts.push(`${mod.agents.length} agent(s)`)
  if (mod.skills.length) parts.push(`${mod.skills.length} skill(s)`)
  const marker = isActive ? pc.green('✓') : pc.dim('·')
  const extras = [parts.join(', '), `~${mod.tokens} tokens always loaded`, mod.requires.length ? `requires ${mod.requires.join(', ')}` : '', mod.default ? 'on by default' : '']
    .filter(Boolean)
    .join(' · ')
  return `${marker} ${mod.name.padEnd(18)} ${mod.description}${extras ? `\n    ${pc.dim(extras)}` : ''}`
}

export async function moduleCommand(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur snapin ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.cancel('No config found here. Run `npx @easy-spec/excalibur init` first.')
    return 1
  }

  const [action = 'list', ...names] = args._
  const available = availableModules(cwd)
  const active = activeModules(cwd)

  if (action === 'list') {
    const lines = [...available.values()].map((mod) => describe(mod, active.includes(mod.name)))
    p.note(lines.length ? lines.join('\n') : 'No snap-ins available.', 'Snap-ins')
    if (!quiet) p.outro(`${active.length} active.`)
    return 0
  }

  if (action !== 'add' && action !== 'remove') {
    p.cancel(`Unknown action "${action}". Use: list, add <name...>, remove <name...>.`)
    return 1
  }
  if (names.length === 0) {
    p.cancel(`Name at least one snap-in: excalibur snapin ${action} <name>.`)
    return 1
  }

  let next
  try {
    if (action === 'add') {
      next = withRequirements([...active, ...names], available)
    } else {
      for (const name of names) {
        if (!available.has(name)) throw new Error(`Unknown module "${name}".`)
      }
      next = active.filter((name) => !names.includes(name))
      const dependents = next.filter((name) => available.get(name).requires.some((dep) => names.includes(dep)))
      if (dependents.length) {
        throw new Error(`Cannot remove ${names.join(', ')}: still required by ${dependents.join(', ')}. Remove those first.`)
      }
    }
  } catch (error) {
    p.cancel(error.message)
    return 1
  }

  const added = next.filter((name) => !active.includes(name))
  const dropped = active.filter((name) => !next.includes(name))
  if (added.length === 0 && dropped.length === 0) {
    p.outro('Nothing to change.')
    return 0
  }

  if (args['dry-run']) {
    p.outro(`Dry run. Would add: ${added.join(', ') || 'none'}; remove: ${dropped.join(', ') || 'none'}.`)
    return 0
  }

  updateConfig(cwd, { modules: next })
  const context = syncModuleContext(cwd)
  const built = build(cwd)

  const lines = [
    added.length ? `${pc.green('+')} ${added.join(', ')}` : '',
    dropped.length ? `${pc.red('-')} ${dropped.join(', ')}` : '',
    context.removed.length ? `removed context: ${context.removed.join(', ')}` : '',
    context.kept.length ? pc.yellow(`kept (edited by hand): ${context.kept.join(', ')}`) : '',
    `rebuilt ${built.agents.length} agents and ${built.skills.length} skill files`,
  ].filter(Boolean)
  p.note(lines.join('\n'), 'Snap-ins updated')
  p.outro('Done.')
  return 0
}
