import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { exists } from '../lib/fsx.js'
import { orphanedCustomizations } from '../lib/resolve.js'

/**
 * `excalibur doctor` — deeper diagnostic than `check`.
 *
 * `check` verifies the environment (node/git/bash/gh) before init ever runs.
 * `doctor` verifies the SDD's own health, after the fact: things that only go wrong
 * once a project and the framework have evolved together for a while.
 */

/**
 * Best-effort locator for project.canvas and every tasks.yaml under the project.
 *
 * There is no literal `sdd_path` yet (see IMPLEMENTATION_PLAN_2.md section 9 — not
 * done). This walks the tree the same way clean-history.js already walks for
 * history.yaml, rather than guessing a single fixed location. It only reaches an SDD
 * that lives somewhere under `cwd` — a `separate` sibling folder or a fully `external`
 * destination (see create-excalibur/onboarding/manifest.yaml's `destination` question) is out of its reach,
 * and that limitation is reported rather than silently producing a false "missing".
 */
function findCanvasAndTasks(cwd) {
  let canvas = null
  const taskFiles = []

  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(full, depth + 1)
      } else if (entry.name === 'project.canvas' && !canvas) {
        canvas = full
      } else if (entry.name === 'tasks.yaml') {
        taskFiles.push(full)
      }
    }
  }
  walk(cwd, 0)
  return { canvas, taskFiles }
}

export async function doctor(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur doctor ')))

  const paths = projectPaths(cwd)

  if (!paths.configured) {
    if (!quiet) {
      p.log.warn('No config found here — not onboarded yet.')
      p.outro('Run `npx create-excalibur`.')
    }
    return 1
  }

  const lines = []
  let problems = 0

  // 1. Orphaned customizations — a removal or rename upstream left a customized
  //    file pointing at nothing in the current .excalibur/. Reuses resolve.js —
  //    the same check `status` already surfaces — rather than re-deriving it here.
  const orphans = orphanedCustomizations(cwd)
  if (orphans.length === 0) {
    lines.push(`${pc.green('✓')} customizations   no orphans in ${paths.customDir}/`)
  } else {
    problems++
    lines.push(`${pc.red('✗')} customizations   ${orphans.length} orphaned file(s) in ${paths.customDir}/`)
    for (const o of orphans) lines.push(`    ${paths.customDir}/${o}`)
  }

  // 2. Canvas out of sync with tasks.yaml. Best effort, not exact: a real diff would
  //    need to know which tasks.yaml the canvas is *supposed* to reflect, and nothing
  //    records that (updating it is a judgment call the `review` agent makes, per
  //    rules/heuristics/canvas-update-checklist.yaml). The heuristic here is mtime-based — any
  //    tasks.yaml newer than project.canvas is presumed to carry unreflected progress.
  //    False positives are possible (a tasks.yaml touched without anything
  //    canvas-worthy changing), and false negatives too (the canvas kept up by hand
  //    right after). Good enough to prompt a human look; not authoritative.
  const { canvas, taskFiles } = findCanvasAndTasks(cwd)
  if (!canvas) {
    lines.push(`${pc.yellow('!')} canvas           project.canvas not found — run \`excalibur canvas\` once the SDD exists`)
  } else if (taskFiles.length === 0) {
    lines.push(`${pc.green('✓')} canvas           found, no tasks.yaml to compare against`)
  } else {
    const canvasMtime = fs.statSync(canvas).mtimeMs
    const staleTasks = taskFiles.filter((f) => fs.statSync(f).mtimeMs > canvasMtime)
    if (staleTasks.length === 0) {
      lines.push(`${pc.green('✓')} canvas           up to date with every tasks.yaml (heuristic: mtime)`)
    } else {
      problems++
      lines.push(`${pc.yellow('!')} canvas           ${staleTasks.length} tasks.yaml newer than project.canvas (heuristic: mtime)`)
      for (const f of staleTasks) lines.push(`    ${path.relative(cwd, f).split(path.sep).join('/')}`)
    }
  }

  if (quiet) {
    console.log(lines.join('\n'))
    return problems > 0 ? 1 : 0
  }

  p.note(lines.join('\n'), 'Diagnostics')

  if (problems > 0) {
    p.outro(pc.red(`${problems} check(s) need attention.`))
    return 1
  }

  p.outro('Everything checks out.')
  return 0
}
