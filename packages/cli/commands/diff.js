import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../core/paths.js'
import { exists } from '../core/fsx.js'
import { effectiveFiles } from '../core/resolve.js'

/**
 * `excalibur diff` — shows what's in the overrides folder (`custom_dir`) vs. the
 * installed package's defaults (`node_modules/@easy-spec/excalibur/`).
 *
 * Complements `status`, which only lists which paths are customized. This shows what
 * actually changed: a unified-ish diff per file, `+`/`-` prefixed. No `diff` npm
 * dependency (the CLI's dependency list is a closed decision) and no full Myers-diff
 * implementation either — a plain LCS-based line diff is enough for the config/rule
 * files this ever runs against.
 */

const MAX_DIFF_LINES = 2000

function isProbablyText(buf) {
  const len = Math.min(buf.length, 8000)
  for (let i = 0; i < len; i++) if (buf[i] === 0) return false
  return true
}

/** Classic O(n*m) LCS line diff. Fine at this scale; see MAX_DIFF_LINES for the cap. */
function lcsDiff(a, b) {
  const n = a.length
  const m = b.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const out = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      out.push({ type: ' ', line: a[i] })
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: '-', line: a[i] })
      i++
    } else {
      out.push({ type: '+', line: b[j] })
      j++
    }
  }
  while (i < n) out.push({ type: '-', line: a[i++] })
  while (j < m) out.push({ type: '+', line: b[j++] })
  return out
}

function diffFile(basePath, customPath) {
  const baseBuf = fs.readFileSync(basePath)
  const customBuf = fs.readFileSync(customPath)

  if (!isProbablyText(baseBuf) || !isProbablyText(customBuf)) return { binary: true }

  const baseLines = baseBuf.toString('utf8').split(/\r?\n/)
  const customLines = customBuf.toString('utf8').split(/\r?\n/)

  if (baseLines.length > MAX_DIFF_LINES || customLines.length > MAX_DIFF_LINES) return { tooLarge: true }

  const rows = lcsDiff(baseLines, customLines)
  const changedCount = rows.filter((r) => r.type !== ' ').length
  return { rows, changedCount }
}

export async function diff(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur diff ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    if (!quiet) {
      p.log.warn('No config found here — not onboarded yet.')
      p.outro('Run `npx create-excalibur`.')
    }
    return 1
  }

  const target = args._?.[0]
    ? String(args._[0]).replace(/^\.?[/\\]/, '').split(path.sep).join('/')
    : null

  const customized = effectiveFiles(cwd).filter((f) => f.source === 'custom')

  if (customized.length === 0) {
    if (!quiet) p.outro(`Nothing customized — ${paths.customDir}/ has no overrides yet.`)
    return 0
  }

  const toShow = target ? customized.filter((f) => f.path === target) : customized
  if (target && toShow.length === 0) {
    if (!quiet) p.cancel(`Not customized: ${target}`)
    return 1
  }

  const summary = []
  const blocks = []

  for (const f of toShow) {
    if (f.orphan) {
      summary.push(`${pc.yellow('!')} ${f.path}  ${pc.yellow('orphaned — no matching file in the installed package')}`)
      continue
    }

    const customPath = path.join(paths.custom, f.path)
    const basePath = path.join(paths.base, f.path)
    const result = diffFile(basePath, customPath)

    if (result.binary) {
      summary.push(`${pc.cyan(f.path)}  ${pc.dim('binary — not diffed')}`)
      continue
    }
    if (result.tooLarge) {
      summary.push(`${pc.cyan(f.path)}  ${pc.dim(`too large to diff (${MAX_DIFF_LINES}+ lines)`)}`)
      continue
    }
    if (result.changedCount === 0) {
      summary.push(`${pc.cyan(f.path)}  ${pc.dim('identical to base (customized but unchanged)')}`)
      continue
    }

    summary.push(`${pc.cyan(f.path)}  ${result.changedCount} line(s) differ`)
    const body = result.rows
      .map((r) => (r.type === ' ' ? `  ${r.line}` : r.type === '+' ? pc.green(`+ ${r.line}`) : pc.red(`- ${r.line}`)))
      .join('\n')
    blocks.push({ path: f.path, body })
  }

  if (quiet) {
    console.log(summary.join('\n'))
    return 0
  }

  p.note(summary.join('\n'), `Customized (${toShow.length})`)
  for (const b of blocks) p.note(b.body, b.path)

  p.outro(target ? 'Done.' : `${blocks.length} file(s) with differences.`)
  return 0
}
