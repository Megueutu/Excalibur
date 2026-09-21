import path from 'node:path'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot } from '../core/paths.js'
import { exists, listFiles } from '../core/fsx.js'

/**
 * `excalibur lint` — the .md size-limit + naming-convention checks, outside the
 * `review` agent's own cycle. Meant to be usable standalone, including from the
 * target project's own CI (`npx @easy-spec/excalibur lint` in a workflow step).
 *
 * Two independent, mechanical checks:
 *   1. .md size limits (rules/heuristics/md-size-limits.yaml) — shells out to
 *      scripts/validate-md-size.sh (5.3) rather than re-parsing the YAML
 *      allowlist a second time in JS. The script is the single source of truth for
 *      that logic; check.js already establishes that shelling out to bash is this
 *      CLI's accepted way to reuse a .sh script instead of duplicating it.
 *   2. Naming convention (rules/naming.md) — no companion script exists for this one,
 *      so it's a small JS heuristic covering the two rules that are actually
 *      mechanically checkable: never a numbered filename suffix, and task-slug
 *      folders are lowercase-hyphenated.
 */

const NUMBERED_SUFFIX = /-\d+\.md$/i
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/

function findValidateScript() {
  const script = path.join(packageRoot, 'scripts', 'validate-md-size.sh')
  return exists(script) ? script : null
}

function parseViolations(out) {
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [file, actual, limit, type] = line.split('\t')
      return { file, actual, limit, type }
    })
}

function runSizeCheck(target) {
  const script = findValidateScript()
  if (!script) return { ran: false, violations: [] }

  try {
    const out = execFileSync('bash', [script, target], { encoding: 'utf8' })
    return { ran: true, violations: parseViolations(out) }
  } catch (error) {
    // Non-zero exit is the script's contract for "violations found" (see 5.3) — that
    // is expected output, not a failure to run it. Only treat it as an error when
    // there is nothing usable in stdout to explain it.
    const out = error.stdout ?? ''
    if (out) return { ran: true, violations: parseViolations(out) }
    return { ran: true, error: error.stderr || error.message, violations: [] }
  }
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir)
  } catch {
    return []
  }
}

function namingViolations(target) {
  const violations = []

  for (const rel of listFiles(target).filter((f) => f.endsWith('.md'))) {
    if (NUMBERED_SUFFIX.test(path.basename(rel))) {
      violations.push(`${rel} — numbered filename suffix (rules/naming.md: split by subject, never number a filename)`)
    }
  }

  // Task-slug folders: specs/<repo>/<task-slug>/ must be lowercase-hyphenated
  // (rules/naming.md: Slugs).
  const specsDir = path.join(target, 'specs')
  if (exists(specsDir)) {
    for (const repo of safeReaddir(specsDir)) {
      const repoDir = path.join(specsDir, repo)
      if (!fs.statSync(repoDir).isDirectory()) continue
      for (const slug of safeReaddir(repoDir)) {
        const slugDir = path.join(repoDir, slug)
        if (!fs.statSync(slugDir).isDirectory()) continue
        if (!SLUG.test(slug)) {
          violations.push(`specs/${repo}/${slug} — task-slug folder is not lowercase-hyphenated (rules/naming.md: Slugs)`)
        }
      }
    }
  }

  return violations
}

export async function lint(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur lint ')))

  const target = args._?.[0] ? path.resolve(cwd, String(args._[0])) : cwd

  if (!exists(target)) {
    if (!quiet) p.outro(pc.red(`No such directory: ${target}`))
    return 1
  }

  const size = runSizeCheck(target)
  const naming = namingViolations(target)

  const lines = []
  let failed = false

  if (!size.ran) {
    lines.push(`${pc.yellow('!')} md size limits   could not find validate-md-size.sh — skipped`)
  } else if (size.error) {
    failed = true
    lines.push(`${pc.red('✗')} md size limits   ${size.error}`)
  } else if (size.violations.length === 0) {
    lines.push(`${pc.green('✓')} md size limits   clean`)
  } else {
    failed = true
    lines.push(`${pc.red('✗')} md size limits   ${size.violations.length} violation(s)`)
    for (const v of size.violations) lines.push(`    ${v.file} — ${v.actual} lines (limit ${v.limit}, ${v.type})`)
  }

  if (naming.length === 0) {
    lines.push(`${pc.green('✓')} naming           clean`)
  } else {
    failed = true
    lines.push(`${pc.red('✗')} naming           ${naming.length} violation(s)`)
    for (const v of naming) lines.push(`    ${v}`)
  }

  if (quiet) {
    console.log(lines.join('\n'))
    return failed ? 1 : 0
  }

  p.note(lines.join('\n'), 'Lint')
  p.outro(failed ? pc.red('Lint failed.') : 'Lint clean.')
  return failed ? 1 : 0
}
