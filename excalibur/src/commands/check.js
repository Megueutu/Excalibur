import { execFileSync } from 'node:child_process'
import os from 'node:os'
import * as p from '@clack/prompts'
import pc from 'picocolors'

/**
 * `excalibur check` — verify the environment before init.
 *
 * All three researched competitors ship something like this (Spec Kit's
 * `specify check`), and for good reason: failing at dependency N of an install is
 * much worse than being told up front.
 *
 * The bash check is the load-bearing one on Windows. The framework's scripts are
 * .sh by design (measured: 106ms -> 5ms versus Node, a 21x difference, because Node
 * pays ~100ms of V8 startup even for trivial work). Rather than duplicating every
 * script as a .ps1, Git Bash is assumed present — and this is the single place that
 * verifies the assumption instead of each script discovering it the hard way.
 */

function probe(command, args) {
  try {
    const out = execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
    return { ok: true, version: out.trim().split('\n')[0] }
  } catch {
    return { ok: false }
  }
}

export async function check(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur check ')))

  const isWindows = os.platform() === 'win32'

  const checks = [
    {
      name: 'node',
      required: true,
      result: { ok: true, version: process.version },
      fix: '',
    },
    {
      name: 'git',
      required: true,
      result: probe('git', ['--version']),
      fix: 'Install git: https://git-scm.com/downloads',
    },
    {
      name: 'bash',
      required: true,
      result: probe('bash', ['--version']),
      fix: isWindows
        ? "Install Git Bash (it ships with Git for Windows) and make sure `bash` is on your PATH. Excalibur's scripts are .sh and run through it — there is no PowerShell equivalent by design."
        : 'Install bash through your package manager.',
    },
    {
      name: 'gh',
      required: false,
      result: probe('gh', ['--version']),
      fix: 'Optional. Without it: no automated repo creation, and PRs are opened in a browser. Install: https://cli.github.com',
    },
  ]

  const lines = []
  let missingRequired = 0

  for (const c of checks) {
    if (c.result.ok) {
      lines.push(`${pc.green('✓')} ${c.name.padEnd(6)} ${pc.dim(c.result.version ?? '')}`)
    } else if (c.required) {
      missingRequired++
      lines.push(`${pc.red('✗')} ${c.name.padEnd(6)} ${pc.red('missing')} — ${c.fix}`)
    } else {
      lines.push(`${pc.yellow('!')} ${c.name.padEnd(6)} ${pc.yellow('not found')} — ${c.fix}`)
    }
  }

  // Authentication is a separate question from installation: `gh` can be present
  // and useless. The wizard treats "installed but unauthenticated" like "missing",
  // so it is worth reporting separately here.
  const gh = checks.find((c) => c.name === 'gh')
  if (gh.result.ok) {
    const auth = probe('gh', ['auth', 'status'])
    lines.push(
      auth.ok
        ? `${pc.green('✓')} gh auth  authenticated`
        : `${pc.yellow('!')} gh auth  not authenticated — run \`gh auth login\` yourself (interactive OAuth)`,
    )
  }

  p.note(lines.join('\n'), 'Environment')

  if (missingRequired > 0) {
    p.outro(pc.red(`${missingRequired} required dependency missing — install it before \`excalibur init\`.`))
    return 1
  }

  p.outro('Ready for `npx excalibur init`.')
  return 0
}
