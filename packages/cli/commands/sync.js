import * as p from '@clack/prompts'
import pc from 'picocolors'
import { projectPaths } from '../../core/paths.js'
import { syncUserProfile } from '../../core/profile.js'

/**
 * `excalibur sync` — copy the user profile into this project: an index the agent reads
 * every session, plus the files it opens when their trigger applies.
 */
export async function sync(args, cwd) {
  const quiet = Boolean(args.quiet)
  if (!quiet) p.intro(pc.bgCyan(pc.black(' excalibur sync ')))

  if (!projectPaths(cwd).configured) {
    p.cancel('No config found here. Run `npx @easy-spec/excalibur init` first.')
    return 1
  }

  const result = syncUserProfile(cwd, { dryRun: Boolean(args['dry-run']) })

  if (result.status === 'no-profile') {
    p.outro('No user profile linked. Create one with `excalibur profile init` or link one with `excalibur profile link <path>`.')
    return 0
  }
  if (result.status === 'repo-missing') {
    p.cancel(`The linked profile repository was not found: ${result.repo}`)
    return 1
  }

  for (const name of result.missingProfiles) p.log.warn(`Profile "${name}" does not exist in the repository; skipped.`)

  if (result.status === 'empty') {
    p.outro('The profile has no files for this project; nothing installed.')
    return 0
  }

  const verb = result.status === 'dry-run' ? 'Would sync' : 'Synced'
  p.note(result.files.join('\n'), `${verb} ${result.files.length} file(s)`)
  p.outro(result.status === 'dry-run' ? 'Dry run: nothing written.' : `Done. Snapshot is ${result.settings.snapshot === 'ignored' ? 'kept out of git' : 'committed with the project'}.`)
  return 0
}
