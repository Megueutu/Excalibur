import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot } from '../core/paths.js'
import { exists, copyFile } from '../core/fsx.js'

const TEMPLATE = path.join(packageRoot, 'lib', 'pipeline', 'project-canvas-template.canvas')

/**
 * `excalibur canvas` — regenerate the project-level Obsidian Canvas on demand.
 *
 * The `review` agent normally keeps `project.canvas` current automatically, walking
 * `rules/heuristics/canvas-update-checklist.yaml` after every Feature/Big feature task (see
 * lib/agents/review/agent.yaml). That is a judgment call ("did this change deserve a
 * node?") this command cannot make — there is no LLM here. What it does mechanically:
 * materialize `project.canvas` from `lib/pipeline/project-canvas-template.canvas` — the
 * exact file `onboarding/manifest.yaml`-driven init would otherwise never place — when it
 * is missing, or reset it back to the blank template on request. Filling it in with
 * real project content afterward is still the review agent's (or a human's) job.
 */

/**
 * Best-effort locator for the SDD root: the parent of a `specs/` folder.
 *
 * Same reasoning as doctor.js/list.js — no literal `sdd_path` yet (section 9 of
 * IMPLEMENTATION_PLAN_2.md, not done). Falls back to `cwd` so the command still does
 * something useful when nothing is found yet (e.g. right after `init`, before any
 * spec exists).
 */
function locateSddRoot(cwd) {
  const candidates = []
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir) || candidates.length > 0) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      if (entry.name === 'specs') {
        candidates.push(dir)
        return
      }
      walk(path.join(dir, entry.name), depth + 1)
    }
  }
  walk(cwd, 0)
  return candidates[0] ?? cwd
}

export async function canvas(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur canvas ')))

  if (!exists(TEMPLATE)) {
    if (!quiet) p.cancel(`Template not found: ${TEMPLATE}`)
    return 1
  }

  const root = args._?.[0] ? path.resolve(cwd, String(args._[0])) : locateSddRoot(cwd)
  const dest = path.join(root, 'project.canvas')

  if (exists(dest) && !args.yes) {
    const confirmed = await p.confirm({
      message: `${path.relative(cwd, dest)} already exists — reset it to the blank template? (Any content filled in by the review agent or by hand is lost.)`,
      initialValue: false,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      if (!quiet) p.cancel('Left the existing canvas alone.')
      return 1
    }
  }

  copyFile(TEMPLATE, dest)

  if (quiet) return 0

  p.note(
    [
      `Written: ${path.relative(cwd, dest)}`,
      '',
      'This is the blank template — nodes for the stack, modules, flow and phases still',
      'need real content. That normally happens automatically: the `review` agent walks',
      'rules/heuristics/canvas-update-checklist.yaml after every Feature/Big feature task.',
    ].join('\n'),
    'Canvas',
  )

  p.outro('Done.')
  return 0
}
