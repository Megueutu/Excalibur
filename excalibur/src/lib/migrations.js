import path from 'node:path'
import fs from 'node:fs'
import { projectPaths } from './paths.js'
import { parse } from './yaml.js'
import { listFiles, ensureDir } from './fsx.js'

/**
 * PENDENTE-REVISÃO: the entire breaking-change migration mechanism comes from
 * section 22 of the design doc, which is marked 🔧 — a technical proposal written
 * without the project owner's review. It is implemented here as reasonably as
 * possible, but nothing in it has been validated against a real version bump.
 * See PENDENCIAS.md item 12. Review before trusting it on a real update.
 *
 * The problem it addresses: .excalibur.custom/ mirrors paths from .excalibur/. If a
 * new version renames or removes a path, the user's override is left pointing at
 * something that no longer exists.
 *
 * The approach: each version that breaks structure ships a migration map at
 * .excalibur/_migrations/<from>-to-<to>.yaml:
 *
 *   version: 1
 *   from: "1.x"
 *   to: "2.x"
 *   renames:
 *     - from: rules/global/kiss.md
 *       to: rules/principles/kiss.md
 *   removed:
 *     - rules/old-thing.md
 *
 * A known rename moves the user's customized file to the new path automatically. A
 * deeper change (the path survives but the expected format changed) is deliberately
 * NOT guessed at — it's reported as an orphan for manual review.
 *
 * The two failure modes this avoids: silently deleting a customization, and blocking
 * an entire update because of one orphaned file.
 */

export function loadMigrations(cwd) {
  const p = projectPaths(cwd)
  if (!fs.existsSync(p.migrations)) return []

  return listFiles(p.migrations)
    .filter((f) => f.endsWith('.yaml'))
    .map((f) => {
      try {
        const doc = parse(fs.readFileSync(path.join(p.migrations, f), 'utf8'))
        return { file: f, ...doc }
      } catch {
        // A malformed migration map must not take the update down with it.
        return { file: f, renames: [], removed: [], malformed: true }
      }
    })
}

/**
 * Applies known renames to files under .excalibur.custom/.
 * Returns { moved, conflicts, removed } — `conflicts` are renames whose destination
 * already had a customization, which we never overwrite.
 */
export function applyMigrations(cwd, { dryRun = false } = {}) {
  const p = projectPaths(cwd)
  const moved = []
  const conflicts = []
  const removed = []

  if (!fs.existsSync(p.custom)) return { moved, conflicts, removed }

  for (const migration of loadMigrations(cwd)) {
    if (migration.malformed) continue

    for (const rename of migration.renames ?? []) {
      if (!rename?.from || !rename?.to) continue
      const src = path.join(p.custom, rename.from)
      const dst = path.join(p.custom, rename.to)
      if (!fs.existsSync(src)) continue

      if (fs.existsSync(dst)) {
        conflicts.push({ from: rename.from, to: rename.to })
        continue
      }

      // Defense in depth against a malformed or malicious migration map: never let
      // a rename resolve outside .excalibur.custom/, e.g. via a `../` in `to`.
      const relative = path.relative(p.custom, dst)
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        conflicts.push({ from: rename.from, to: rename.to })
        continue
      }

      if (!dryRun) {
        ensureDir(path.dirname(dst))
        fs.renameSync(src, dst)
      }
      moved.push({ from: rename.from, to: rename.to })
    }

    for (const gone of migration.removed ?? []) {
      if (typeof gone !== 'string') continue
      if (fs.existsSync(path.join(p.custom, gone))) removed.push(gone)
    }
  }

  return { moved, conflicts, removed }
}
