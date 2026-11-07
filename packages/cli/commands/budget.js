import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../../core/paths.js'
import { measureContext } from '../../core/budget.js'

/**
 * `excalibur budget` — how much context an agent reads before a task starts.
 * Estimates only (see core/budget.js). Set `context_budget: {warn: N}` in the config
 * to get a warning when the start-of-task total goes above N tokens.
 */

const fmt = (n) => n.toLocaleString('en-US').padStart(7)

function renderLayer(title, layers) {
  const lines = [pc.bold(title)]
  for (const layer of layers) lines.push(`  ${layer.label.padEnd(46)} ${fmt(layer.tokens)}`)
  return lines.join('\n')
}

export async function budget(args, cwd) {
  const quiet = Boolean(args.quiet) || Boolean(args.json)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur budget ')))

  if (!projectPaths(cwd).configured) {
    p.cancel('No config found here. Run `npx @easy-spec/excalibur init` first.')
    return 1
  }

  const result = measureContext(cwd)
  if (args.json) {
    console.log(JSON.stringify(result, null, 2))
    return 0
  }
  const { totals } = result

  const body = [
    renderLayer('Every session', result.layers.standing),
    '',
    renderLayer('When a task starts', result.layers.task),
    '',
    renderLayer('Only when invoked', result.layers.onDemand),
    '',
    `${'Start of a task (estimate)'.padEnd(48)} ${pc.bold(fmt(totals.startOfTask))} tokens`,
  ].join('\n')

  p.note(body, 'Context budget')
  p.log.info(pc.dim(`Estimate: characters ÷ ${result.ratio} for language "${result.language}". Not an exact count.`))

  let code = 0
  if (result.warn && totals.startOfTask > result.warn) {
    p.log.warn(`Over the configured limit: ${totals.startOfTask} > ${result.warn} tokens (context_budget.warn).`)
  }

  if (!quiet) p.outro('Done.')
  return code
}
