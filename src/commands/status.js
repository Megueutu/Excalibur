import path from 'node:path'
import fs from 'node:fs'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../lib/paths.js'
import { exists, listFiles } from '../lib/fsx.js'
import { readConfig, frameworkVersion } from '../lib/config.js'
import { orphanedCustomizations } from '../lib/resolve.js'

/** `excalibur status` — a quick overall picture, without opening any file by hand. */
export async function status(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur status ')))

  const paths = projectPaths(cwd)

  if (!paths.configured) {
    p.log.warn('No config found here — not onboarded yet.')
    p.outro('Run `npx create-excalibur`.')
    return 1
  }

  const config = readConfig(cwd)
  const answers = config?.answers ?? {}
  const customized = exists(paths.custom) ? listFiles(paths.custom).filter((f) => f !== 'manifest.yaml') : []
  const installed = config?.framework_version ?? 'unknown'
  const current = frameworkVersion()

  const lines = [
    `version      ${installed}${installed !== current ? pc.yellow(`  (package has ${current} — run update)`) : ''}`,
    `mode         ${paths.mode}`,
    `destination  ${answers.destination ?? pc.dim('unknown')}`,
    `language     ${answers.language ?? pc.dim('unknown')}`,
    `autonomy     ${answers.autonomy ?? pc.dim('unknown')}`,
    `customized   ${customized.length} file(s) in ${paths.customDir}/`,
  ]

  // Last cleanup is inferred from the archive folder's mtime rather than tracked in
  // a state file — one less thing to keep in sync, and it is only ever advisory.
  const archive = path.join(cwd, 'history', 'archive')
  if (exists(archive)) {
    const when = fs.statSync(archive).mtime.toISOString().slice(0, 10)
    lines.push(`last prune   ${when}`)
  } else {
    lines.push(`last prune   ${pc.dim('never')}`)
  }

  const activeFlags = config?.session?.flags ? Object.entries(config.session.flags).filter(([, v]) => v !== false && v != null) : []
  lines.push(
    `session      ${activeFlags.length ? activeFlags.map(([k, v]) => (v === true ? k : `${k}=${v}`)).join(', ') : pc.dim('no flags set')}`,
  )

  p.note(lines.join('\n'), 'Project')

  if (customized.length) {
    p.note(customized.map((f) => `${pc.dim(paths.customDir + '/')}${f}`).join('\n'), 'Customized files')
  }

  const orphans = orphanedCustomizations(cwd)
  if (orphans.length) {
    p.log.warn(
      `${orphans.length} orphaned customization(s) — no matching file in the installed package:\n` +
        orphans.map((o) => `  ${paths.customDir}/${o}`).join('\n'),
    )
  }

  p.outro(installed !== current ? 'An update is available.' : 'Up to date.')
  return 0
}
