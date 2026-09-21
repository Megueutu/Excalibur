import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot, shippedFolders, projectPaths, BASE_DIR, CUSTOM_DIR } from '../lib/paths.js'
import { copyDir, ensureDir, exists, isEmptyDir, removeDir, writeText, ensureGitignore } from '../lib/fsx.js'
import {
  loadManifest,
  defaultAnswers,
  writeAnswers,
  writeConfig,
  frameworkVersion,
  resolveSddPath,
  writeSddMarker,
} from '../lib/config.js'
import { build } from '../lib/build.js'

/**
 * `excalibur init` — collect answers, then materialize .excalibur/.
 *
 * The form COLLECTS; it doesn't implement the SDD. The harness skill (/excalibur-init)
 * picks the answers up and does the rest, because the parts that remain need a
 * conversation (and `gh auth login` is an interactive OAuth flow no collection script
 * can drive).
 */

async function askQuestion(question) {
  const options = (question.options ?? []).map((o) => ({
    value: o.value,
    label: o.label,
    hint: o.value === question.default ? 'default' : undefined,
  }))

  const answer = await p.select({
    message: question.prompt,
    options,
    initialValue: question.default,
  })

  if (p.isCancel(answer)) return { cancelled: true }

  const chosen = (question.options ?? []).find((o) => o.value === answer)

  // A free-text option means the user's own words are the answer.
  if (chosen?.free_text) {
    const text = await p.text({
      message: `${question.prompt} — describe it:`,
      placeholder: 'Your own words',
    })
    if (p.isCancel(text)) return { cancelled: true }
    return { value: answer, text: String(text) }
  }

  return { value: answer }
}

/**
 * Checks BEFORE writing anything, the way create-vite does — it doesn't undo after
 * a failure, it asks first. Same three options, and much simpler than a real
 * rollback, which would need a snapshot.
 */
async function checkExistingInstall(cwd) {
  const paths = projectPaths(cwd)
  if (!exists(paths.base) || isEmptyDir(paths.base)) return 'continue'

  p.log.warn(`${pc.yellow(BASE_DIR + '/')} already exists and is not empty.`)

  const choice = await p.select({
    message: 'How should this be handled?',
    options: [
      { value: 'cancel', label: 'Cancel operation', hint: 'nothing is written' },
      { value: 'remove', label: 'Remove existing files and continue' },
      { value: 'ignore', label: 'Ignore files and continue', hint: 'overwrites file by file' },
    ],
    initialValue: 'cancel',
  })

  if (p.isCancel(choice) || choice === 'cancel') return 'cancel'
  if (choice === 'remove') {
    removeDir(paths.base)
    return 'continue'
  }
  return 'continue'
}

function installFramework(cwd) {
  const paths = projectPaths(cwd)
  ensureDir(paths.base)

  for (const folder of shippedFolders) {
    copyDir(path.join(packageRoot, folder), path.join(paths.base, folder))
  }
  copyDir(path.join(packageRoot, '_migrations'), paths.migrations)
  copyDir(path.join(packageRoot, 'harnesses'), path.join(paths.base, 'harnesses'))

  writeText(
    path.join(paths.base, 'README.md'),
    [
      '# .excalibur/',
      '',
      "The framework's default content, installed by the CLI.",
      '',
      '**Do not edit anything in here.** `excalibur update` overwrites this folder',
      'completely, so a hand edit is lost on the next update without warning. It is',
      `gitignored for the same reason — it is regenerated content, like \`node_modules/\`.`,
      '',
      'To change something, copy it into the override folder first:',
      '',
      '```bash',
      'npx excalibur customize rules/global/kiss.md',
      '```',
      '',
      `That puts an editable copy at \`${CUSTOM_DIR}/rules/global/kiss.md\`, which update`,
      'never touches. Resolution is per file: customizing one file leaves its siblings',
      'coming from here as usual.',
      '',
    ].join('\n'),
  )

  ensureDir(paths.migrations)
  writeText(
    path.join(paths.migrations, 'README.md'),
    [
      '# _migrations/',
      '',
      '<!-- PENDENTE-REVISÃO: section 22 of the design doc is a 🔧 technical proposal,',
      '     written without the project owner\'s review, and this mechanism has never run',
      '     against a real version bump. See PENDENCIAS.md item 12. -->',
      '',
      'Migration maps for versions that change the structure of `.excalibur/` in a way',
      'that breaks existing overrides.',
      '',
      'One file per breaking version, named `<from>-to-<to>.yaml`:',
      '',
      '```yaml',
      'version: 1',
      'from: "1.x"',
      'to: "2.x"',
      'renames:',
      '  - from: rules/global/kiss.md',
      '    to: rules/principles/kiss.md',
      'removed:',
      '  - rules/old-thing.md',
      '```',
      '',
      'On `excalibur update`, a known rename moves the matching file in',
      `\`${CUSTOM_DIR}/\` to its new path, so the customization survives. A deeper change`,
      '— the path still exists but its expected content changed — is deliberately not',
      'guessed at: it is reported as an orphaned customization in the update output and',
      'in `excalibur status`, for a human to look at.',
      '',
      'That avoids both bad outcomes: deleting a customization silently, and blocking a',
      'whole update over one orphan.',
      '',
    ].join('\n'),
  )
}

function writeVscodeFiles(cwd) {
  const paths = projectPaths(cwd)
  ensureDir(paths.vscode)

  const settingsPath = path.join(paths.vscode, 'settings.json')
  if (!exists(settingsPath)) {
    writeText(
      settingsPath,
      JSON.stringify(
        {
          'files.associations': {
            Excalibur: 'yaml',
          },
        },
        null,
        2,
      ) + '\n',
    )
  }

  const extensionsPath = path.join(paths.vscode, 'extensions.json')
  if (!exists(extensionsPath)) {
    writeText(
      extensionsPath,
      JSON.stringify({ recommendations: ['excalibur.icon-theme'] }, null, 2) + '\n',
    )
  }
}

export async function init(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur init ')))

  const decision = await checkExistingInstall(cwd)
  if (decision === 'cancel') {
    p.cancel('Nothing was written.')
    return 1
  }

  const manifest = loadManifest()
  let mode = 'defaults'
  let answers = defaultAnswers(manifest)
  const freeText = {}

  if (args.yes) {
    p.log.info('Running with --yes: every question resolved to its default.')
  } else {
    const chosenMode = await p.select({
      message: manifest.master.prompt,
      options: manifest.master.options.map((o) => ({
        value: o.value,
        label: o.label,
        hint: o.value === manifest.master.default ? 'default' : undefined,
      })),
      initialValue: manifest.master.default,
    })

    if (p.isCancel(chosenMode)) {
      p.cancel('Nothing was written.')
      return 1
    }
    mode = chosenMode

    if (mode === 'customize') {
      for (const question of manifest.questions ?? []) {
        const result = await askQuestion(question)
        if (result.cancelled) {
          p.cancel('Nothing was written.')
          return 1
        }
        answers[question.id] = result.value
        if (result.text) freeText[question.id] = result.text
      }
    } else {
      p.log.info(
        'Using the defaults:\n' +
          (manifest.questions ?? []).map((q) => `  ${q.id}: ${pc.dim(q.default)}`).join('\n'),
      )
    }
  }

  const spinner = p.spinner()
  spinner.start('Installing the framework')
  installFramework(cwd)
  spinner.stop('Framework installed')

  spinner.start('Building harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  const payload = { ...answers }
  for (const [id, text] of Object.entries(freeText)) payload[`${id}_text`] = text
  writeAnswers(cwd, payload, mode)

  // Best effort only: `embedded`/`separate` resolve deterministically from `cwd`,
  // `external`/`new_repo` need the post-manifest interpretation step to pick a real
  // path and fill this in later — see resolveSddPath's doc comment in lib/config.js.
  const sddPath = resolveSddPath(cwd, answers)
  writeSddMarker(sddPath)

  writeConfig(cwd, {
    version: 1,
    framework_version: frameworkVersion(),
    setup_mode: mode,
    answers: payload,
    sdd_path: sddPath,
  })

  writeVscodeFiles(cwd)

  const paths = projectPaths(cwd)
  const ignored = [`${BASE_DIR}/`]
  if (answers.history_gitignore === 'ignored') ignored.push('history.yaml', 'history/archive/')
  const added = ensureGitignore(paths.gitignore, ignored, 'Excalibur')

  p.note(
    [
      `${pc.green('✓')} ${BASE_DIR}/            framework content (gitignored, regenerated)`,
      `${pc.dim('·')} ${CUSTOM_DIR}/     your overrides (commit this)`,
      `${pc.green('✓')} Excalibur              project config`,
      `${pc.green('✓')} .excalibur-answers.yaml  collected answers`,
      added.length ? `${pc.green('✓')} .gitignore             + ${added.join(', ')}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    'Written',
  )

  p.outro(
    `Next: run ${pc.cyan('/excalibur-init')} in your harness — it picks up the answers and finishes onboarding.`,
  )
  return 0
}
