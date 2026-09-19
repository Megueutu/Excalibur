import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { parse, stringify } from '../lib/yaml.js'
import { readConfig } from '../lib/config.js'
import { ensureDir, writeText } from '../lib/fsx.js'

/**
 * `excalibur clean-history` — prune old per-task history.
 *
 * The default criterion is COMBINED, not either/or: entries past the cutoff are
 * removed from version control AND archived locally under history/archive/, which is
 * gitignored. Not deleted outright, not versioned forever — "out of git, but not lost".
 *
 * The archive is written in a fixed schema, for an agent to read rather than a human:
 * no free prose, nothing ambiguous, so a later reader can't hallucinate meaning into
 * a badly shaped record.
 */

const DEFAULT_KEEP_DAYS = 90

/** The header record-history.sh writes, restored when we rewrite the file. */
const HISTORY_HEADER = [
  '# Execution history for this task — a changelog, not an event log.',
  '# Not read by any agent unless a handoff or the user explicitly asks for it.',
  '',
].join('\n')

/**
 * Task paths routinely start with a dot (`.sdd/specs/...`). Using one directly as a
 * filename produces a hidden file, which is a poor place to put something the user
 * is meant to be able to find later.
 */
function archiveName(taskDir) {
  return taskDir.replace(/[/\\]/g, '_').replace(/^\.+/, '') + '.yaml'
}

function findHistoryFiles(root) {
  const out = []
  const walk = (dir, depth) => {
    if (depth > 6 || !fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'archive') continue
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full, depth + 1)
      else if (entry.name === 'history.yaml') out.push(full)
    }
  }
  walk(root, 0)
  return out
}

function daysBetween(a, b) {
  return Math.floor((a.getTime() - b.getTime()) / 86400000)
}

export async function cleanHistory(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur clean-history ')))

  const config = readConfig(cwd)
  const keepDays = Number(args.days ?? config?.history_keep_days ?? DEFAULT_KEEP_DAYS)
  const archiveDir = path.join(cwd, 'history', 'archive')
  const now = new Date()

  // --if-stale exists for the hook option: the hook fires often, and re-scanning the
  // tree every time would make a cheap reactive option expensive.
  if (args['if-stale'] && fs.existsSync(archiveDir)) {
    const age = daysBetween(now, fs.statSync(archiveDir).mtime)
    if (age < 7) {
      if (!quiet) p.outro(`Last prune was ${age} day(s) ago — nothing to do.`)
      return 0
    }
  }

  const files = findHistoryFiles(cwd)
  if (files.length === 0) {
    if (!quiet) p.outro('No history.yaml found.')
    return 0
  }

  const archived = []
  let movedEntries = 0

  for (const file of files) {
    let doc
    try {
      doc = parse(fs.readFileSync(file, 'utf8'))
    } catch {
      continue // a malformed history file must not abort the prune of the others
    }

    const entries = Array.isArray(doc?.entries) ? doc.entries : []
    if (entries.length === 0) continue

    const keep = []
    const old = []
    for (const entry of entries) {
      const date = entry?.date ? new Date(String(entry.date)) : null
      if (date && !Number.isNaN(date.getTime()) && daysBetween(now, date) > keepDays) old.push(entry)
      else keep.push(entry)
    }

    if (old.length === 0) continue

    const taskDir = path.relative(cwd, path.dirname(file)).split(path.sep).join('/')

    if (!args['dry-run']) {
      ensureDir(archiveDir)
      const archiveFile = path.join(archiveDir, archiveName(taskDir))
      const existing = fs.existsSync(archiveFile) ? parse(fs.readFileSync(archiveFile, 'utf8')) : null
      const merged = {
        version: 1,
        task: taskDir,
        archived_on: now.toISOString().slice(0, 10),
        entries: [...(existing?.entries ?? []), ...old],
      }
      writeText(archiveFile, stringify(merged))
      // The reader drops comments, so the header has to be put back explicitly —
      // it is the line telling a future reader this file is not read by default.
      writeText(file, HISTORY_HEADER + stringify({ ...doc, entries: keep }))
    }

    archived.push(`${taskDir} (${old.length})`)
    movedEntries += old.length
  }

  if (quiet) return 0

  if (archived.length === 0) {
    p.outro(`Nothing older than ${keepDays} days.`)
    return 0
  }

  p.note(archived.join('\n'), args['dry-run'] ? 'Would archive' : 'Archived')
  p.outro(
    args['dry-run']
      ? `${movedEntries} entr(ies) would move to history/archive/ (gitignored). Nothing was written.`
      : `${movedEntries} entr(ies) moved to history/archive/ — out of git, still on disk.`,
  )
  return 0
}
