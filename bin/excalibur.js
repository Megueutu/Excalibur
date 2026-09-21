#!/usr/bin/env node
import mri from 'mri'
import pc from 'picocolors'
import { frameworkVersion } from '../src/lib/config.js'

/**
 * Excalibur CLI entrypoint.
 *
 * Stack: @clack/prompts + mri + picocolors — the same three create-vite uses, which
 * is where the requested "Vite-style onboarding" look actually comes from.
 *
 * Commands are lazily imported so that a command nobody ran costs nothing at startup.
 */

const COMMANDS = {
  init: () => import('../src/commands/init.js').then((m) => m.init),
  update: () => import('../src/commands/update.js').then((m) => m.update),
  customize: () => import('../src/commands/customize.js').then((m) => m.customize),
  check: () => import('../src/commands/check.js').then((m) => m.check),
  status: () => import('../src/commands/status.js').then((m) => m.status),
  doctor: () => import('../src/commands/doctor.js').then((m) => m.doctor),
  list: () => import('../src/commands/list.js').then((m) => m.list),
  tasks: () => import('../src/commands/list.js').then((m) => m.list),
  canvas: () => import('../src/commands/canvas.js').then((m) => m.canvas),
  diff: () => import('../src/commands/diff.js').then((m) => m.diff),
  lint: () => import('../src/commands/lint.js').then((m) => m.lint),
  session: () => import('../src/commands/session.js').then((m) => m.session),
  reset: () => import('../src/commands/reset.js').then((m) => m.reset),
  'clean-history': () => import('../src/commands/clean-history.js').then((m) => m.cleanHistory),
  clean: () => import('../src/commands/clean.js').then((m) => m.clean),
  'kill-my-self': () => import('../src/commands/kill-my-self.js').then((m) => m.killMySelf),
}

const HELP = `
${pc.bold('excalibur')} — a ready-to-use SDD framework for AI agents

${pc.bold('Usage')}
  npx excalibur <command> [options]

${pc.bold('Commands')}
  init                 Collect answers and write the config (excalibur.yaml or package.json)
  update               Rebuild the harness files from the installed package — never touches your overrides folder
  customize <path>     Copy one file out of the installed package into your overrides folder, safe to edit
  check                Verify dependencies (node, git, bash, gh) before init
  status               Destination, customized files, last prune, installed version
  doctor               Deeper SDD health check: orphaned customizations, stale canvas
  list                 List in-progress tasks under specs/<repo>/*/ (alias: tasks)
  canvas               Regenerate project.canvas from the template, on demand
  diff [path]          Show your overrides folder vs. the package defaults, with content
  lint [dir]           Run the .md size-limit + naming-convention checks (CI-friendly)
  session [flag]       Set a session directive; with no argument, list them all
  reset                Clear every session directive
  clean-history        Prune old history — out of git, archived locally
  clean                Remove generated harness files (they rebuild)
  kill-my-self         Uninstall Excalibur from this project

${pc.bold('Options')}
  --yes                Accept defaults / skip confirmations
  --dry-run            Show what would happen, write nothing
  -v, --version        Print the version
  -h, --help           This text

${pc.dim('Docs: https://github.com/Megueutu/Excalibur')}
`

async function main() {
  const argv = mri(process.argv.slice(2), {
    boolean: ['help', 'version', 'yes', 'dry-run', 'quiet', 'off', 'if-stale', 'no-rebuild', 'discreet', 'custom'],
    alias: { h: 'help', v: 'version', y: 'yes' },
  })

  const [command, ...rest] = argv._

  if (argv.version) {
    console.log(frameworkVersion())
    return 0
  }

  if (!command || argv.help) {
    console.log(HELP)
    return command ? 0 : 1
  }

  const loader = COMMANDS[command]
  if (!loader) {
    console.error(pc.red(`Unknown command: ${command}`))
    console.error(`Known commands: ${Object.keys(COMMANDS).join(', ')}`)
    return 1
  }

  const run = await loader()
  return (await run({ ...argv, _: rest }, process.cwd())) ?? 0
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((error) => {
    console.error(pc.red(`\nexcalibur: ${error?.message ?? error}`))
    if (process.env.EXCALIBUR_DEBUG) console.error(error)
    process.exitCode = 1
  })
