import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../../core/paths.js'
import { getProfileRepo, setProfileRepo, setProjectSettings, SNAPSHOT_CHOICES } from '../../core/user.js'
import { listProfiles, scanProfile, profileState, createProfileRepo, createRemote } from '../../core/profile.js'

/**
 * `excalibur profile [status|init|link|use|snapshot]` — the user profile: a repository of
 * the user's own standing instructions for AI agents, valid across every project.
 *
 *   status                 where it is, what it holds, and how this project uses it (--json)
 *   init [dir] [--remote]  create a new repository from the template and link it
 *   link <dir>             link a repository you already have
 *   use [name...]          pick which optional profiles this project uses
 *   snapshot <choice>      keep this project's snapshot `ignored` by git (default) or `committed`
 */

function requireProject(cwd) {
  if (projectPaths(cwd).configured) return true
  p.cancel('No config found here. Run `npx @easy-spec/excalibur init` first.')
  return false
}

function status(args, cwd) {
  const repo = getProfileRepo()
  const inProject = projectPaths(cwd).configured
  const scan = repo && fs.existsSync(repo) ? scanProfile(repo) : null
  const project = inProject ? profileState(cwd) : null

  if (args.json) {
    console.log(JSON.stringify({
      repo,
      repoExists: Boolean(scan),
      files: scan ? scan.files.map(({ rel, scope, when, description }) => ({ rel, scope, when, description })) : [],
      problems: scan?.problems ?? [],
      profiles: repo && scan ? listProfiles(repo) : [],
      project,
    }, null, 2))
    return 0
  }

  p.intro(pc.bgCyan(pc.black(' excalibur profile ')))
  if (!repo) {
    p.outro('No user profile linked. Create one with `excalibur profile init` or link one with `excalibur profile link <path>`.')
    return 0
  }
  if (!scan) {
    p.cancel(`The linked repository was not found: ${repo}`)
    return 1
  }

  const lines = [`${pc.dim('repository')}  ${repo}`, `${pc.dim('files')}       ${scan.files.length}`, `${pc.dim('profiles')}    ${listProfiles(repo).join(', ') || 'none'}`]
  if (project) {
    lines.push(
      '',
      `${pc.dim('this project uses')}  ${['global', ...project.settings.profiles].join(', ')}`,
      `${pc.dim('snapshot')}           ${project.snapshot} (${project.settings.snapshot} by git)`,
    )
  }
  p.note(lines.join('\n'), 'User profile')

  const issues = [...scan.problems.map((x) => `${x.file}: ${x.issue}`), ...(project?.warnings ?? [])]
  if (issues.length) p.log.warn(issues.join('\n'))
  p.outro(issues.length ? `${issues.length} thing(s) to look at.` : 'Everything checks out.')
  return 0
}

async function init(args) {
  p.intro(pc.bgCyan(pc.black(' excalibur profile init ')))
  const dir = path.resolve(args._[1] ?? path.join(os.homedir(), 'excalibur-profile'))

  let result
  try {
    result = createProfileRepo(dir)
  } catch (error) {
    p.cancel(error.message)
    return 1
  }
  setProfileRepo(dir)
  p.note(result.created.join('\n'), `Created ${dir}`)
  if (!result.git) p.log.warn('Could not run `git init` here; initialise the repository yourself.')
  p.log.info('Nothing is committed yet. Review the files, then commit them in your own way.')

  if (args.remote) {
    // The remote is a public-facing action: never taken without a live, explicit yes.
    if (!process.stdin.isTTY) {
      p.log.warn('Creating the remote needs a terminal to confirm. Run `excalibur profile init --remote` in one.')
    } else {
      const ok = await p.confirm({ message: `Create a private repository "${path.basename(dir)}" on GitHub with your gh login?`, initialValue: false })
      if (ok === true) {
        try {
          createRemote(dir)
          p.log.success('Remote "origin" created (private). Nothing was pushed.')
        } catch (error) {
          p.log.error(`gh could not create it: ${String(error.stderr ?? error.message).trim()}`)
        }
      } else {
        p.log.info('Skipped the remote.')
      }
    }
  }

  p.outro('Linked. In a project, run `excalibur sync` to copy it in.')
  return 0
}

function link(args) {
  p.intro(pc.bgCyan(pc.black(' excalibur profile link ')))
  const target = args._[1]
  if (!target) {
    p.cancel('Usage: excalibur profile link <path>')
    return 1
  }
  const dir = path.resolve(target)
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    p.cancel(`${dir} is not a folder.`)
    return 1
  }
  if (!fs.existsSync(path.join(dir, 'global')) && !fs.existsSync(path.join(dir, 'profiles'))) {
    p.log.warn('No `global/` or `profiles/` folder in it yet. Add instruction files there for Excalibur to find them.')
  }
  setProfileRepo(dir)
  p.outro(`Linked ${dir}.`)
  return 0
}

function use(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur profile use ')))
  if (!requireProject(cwd)) return 1
  const names = args._.slice(1)
  const repo = getProfileRepo()
  const known = repo && fs.existsSync(repo) ? listProfiles(repo) : []

  if (names.length === 0) {
    const current = profileState(cwd).settings.profiles
    p.outro(`This project uses: ${['global', ...current].join(', ')}. Available: ${known.join(', ') || 'none'}.`)
    return 0
  }
  const unknown = names.filter((n) => !known.includes(n))
  if (unknown.length) {
    p.cancel(`Unknown profile(s): ${unknown.join(', ')}. Available: ${known.join(', ') || 'none'}.`)
    return 1
  }
  setProjectSettings(cwd, { profiles: names })
  p.outro(`This project now uses: global, ${names.join(', ')}. Run \`excalibur sync\` to apply.`)
  return 0
}

function snapshot(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur profile snapshot ')))
  if (!requireProject(cwd)) return 1
  const choice = args._[1]
  if (!SNAPSHOT_CHOICES.includes(choice)) {
    p.cancel(`Usage: excalibur profile snapshot <${SNAPSHOT_CHOICES.join('|')}>`)
    return 1
  }
  setProjectSettings(cwd, { snapshot: choice })
  p.outro(`Snapshot is now "${choice}". Run \`excalibur sync\` to apply.`)
  return 0
}

export async function profile(args, cwd) {
  const [action = 'status'] = args._
  switch (action) {
    case 'status': return status(args, cwd)
    case 'init': return init(args)
    case 'link': return link(args)
    case 'use': return use(args, cwd)
    case 'snapshot': return snapshot(args, cwd)
    default:
      console.error(pc.red(`Unknown profile command: ${action}. Use status, init, link, use or snapshot.`))
      return 1
  }
}
