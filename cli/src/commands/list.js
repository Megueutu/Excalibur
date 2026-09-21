import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { parse } from '../lib/yaml.js'

/**
 * `excalibur list` (alias `tasks`) — in-progress tasks under specs/<repo>/<task>/.
 *
 * "In-progress" means: has a tasks.yaml, and not every item in it is `done` yet. A
 * task folder with no tasks.yaml (still at proposal/spec stage) is not listed — there
 * is no checklist to report a status for.
 */

/**
 * Best-effort locator for every `specs/` folder reachable under `cwd`.
 *
 * Same reasoning as doctor.js: there is no literal `sdd_path` yet (section 9 of
 * IMPLEMENTATION_PLAN_2.md, not done), so this walks the tree instead of assuming one
 * fixed location. It covers the default `embedded` destination; a `separate` sibling
 * folder or a fully `external` one needs the optional path argument below.
 */
function findSpecsDirs(cwd) {
  const found = []
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      if (entry.name === 'node_modules' || entry.name === '.git') continue
      const full = path.join(dir, entry.name)
      if (entry.name === 'specs') found.push(full)
      else walk(full, depth + 1)
    }
  }
  walk(cwd, 0)
  return found
}

/**
 * tasks.yaml has no single frozen schema yet — tolerate the reasonable shapes: a
 * top-level `tasks:` list or `items:`, each item `{ id/title, status, blocked? }`.
 * An ordered checklist (rules/heuristics/tasks-ordering.yaml) nests phases, each phase carrying
 * its own `items`/`tasks` instead of a `status` — flatten one level of that so
 * done/total/blocked counts the same way for ordered and unordered checklists.
 */
function flattenItems(list) {
  const out = []
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue
    if (!entry.status && (Array.isArray(entry.items) || Array.isArray(entry.tasks))) {
      out.push(...flattenItems(entry.items ?? entry.tasks))
    } else {
      out.push(entry)
    }
  }
  return out
}

function readItems(doc) {
  const list = doc?.tasks ?? doc?.items ?? []
  return Array.isArray(list) ? flattenItems(list) : []
}

export async function list(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur list ')))

  const explicitRoot = args._?.[0] ? path.resolve(cwd, String(args._[0])) : null
  const specsDirs = explicitRoot ? [path.join(explicitRoot, 'specs')].filter((d) => fs.existsSync(d)) : findSpecsDirs(cwd)

  if (specsDirs.length === 0) {
    if (!quiet) p.outro('No specs/ folder found — nothing to list.')
    return 0
  }

  const rows = []

  for (const specsDir of specsDirs) {
    for (const repo of fs.readdirSync(specsDir, { withFileTypes: true })) {
      if (!repo.isDirectory()) continue
      const repoDir = path.join(specsDir, repo.name)
      for (const task of fs.readdirSync(repoDir, { withFileTypes: true })) {
        if (!task.isDirectory()) continue
        const tasksFile = path.join(repoDir, task.name, 'tasks.yaml')
        if (!fs.existsSync(tasksFile)) continue

        let doc
        try {
          doc = parse(fs.readFileSync(tasksFile, 'utf8'))
        } catch {
          rows.push({ repo: repo.name, task: task.name, error: 'malformed tasks.yaml' })
          continue
        }

        const items = readItems(doc)
        const done = items.filter((i) => i.status === 'done').length
        const blocked = items.filter((i) => i.status === 'blocked' || i.blocked === true)

        if (items.length > 0 && done === items.length) continue // finished — not "in progress"

        rows.push({
          repo: repo.name,
          task: task.name,
          done,
          total: items.length,
          blocked: blocked.map((b) => b.id ?? b.title ?? '?'),
        })
      }
    }
  }

  if (rows.length === 0) {
    if (!quiet) p.outro('No in-progress tasks.')
    return 0
  }

  const lines = rows.map((r) => {
    if (r.error) return `${pc.yellow('!')} ${r.repo}/${r.task}  ${pc.yellow(r.error)}`
    const progress = r.total > 0 ? `${r.done}/${r.total}` : pc.dim('no items')
    const blockedNote = r.blocked.length ? pc.red(`  blocked: ${r.blocked.join(', ')}`) : ''
    return `${pc.cyan(r.repo + '/' + r.task)}  ${progress}${blockedNote}`
  })

  if (quiet) {
    console.log(lines.join('\n'))
    return 0
  }

  p.note(lines.join('\n'), 'In-progress tasks')
  p.outro(`${rows.length} task(s).`)
  return 0
}
