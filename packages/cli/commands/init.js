import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
  packageRoot,
  projectPaths,
  DEFAULT_CUSTOM_DIR,
  CONTEXT_DIR,
  locateConfig,
  GENERATED_GITIGNORE_ENTRIES,
} from '../core/paths.js'
import {
  copyFile,
  ensureDir,
  exists,
  writeText,
  ensureGitignore,
} from '../core/fsx.js'
import {
  loadManifest,
  defaultAnswers,
  writeConfig,
  frameworkVersion,
  resolveSddPath,
  writeSddMarker,
} from '../core/config.js'
import { build } from '../core/build.js'
import { detectStack } from '../core/stack-detection.js'

const STACK_COLORS = {
  typescript: pc.cyan,
  javascript: pc.yellow,
  python: pc.blue,
  go: pc.cyan,
  rust: pc.red,
  java: pc.red,
  csharp: pc.magenta,
  ruby: pc.red,
  php: pc.magenta,
  cpp: pc.blue,
  swift: pc.red,
  dart: pc.cyan,
  next: pc.bold,
  react: pc.cyan,
  vue: pc.green,
  svelte: pc.red,
  angular: pc.red,
  nuxt: pc.green,
  astro: pc.magenta,
  marko: pc.yellow,
  node: pc.green,
  nestjs: pc.red,
  django: pc.green,
  fastapi: pc.cyan,
  rails: pc.red,
  laravel: pc.red,
  spring: pc.green,
  vscode: pc.blue,
  jetbrains: pc.magenta,
}

function recommendationFor(question, detection) {
  if (!detection.available) return question.default
  if (question.id === 'stack_language' && detection.language !== 'unknown') return detection.language
  if (question.id === 'stack_framework') return detection.framework
  if (question.id === 'stack_ide' && detection.ide !== 'unknown') return detection.ide
  return question.default
}

function questionOptions(question, detection) {
  const recommended = recommendationFor(question, detection)
  const isStackQuestion = question.id.startsWith('stack_')
  const options = [...(question.options ?? [])]

  options.sort((a, b) => Number(b.value === recommended) - Number(a.value === recommended))

  return options.map((option) => {
    const color = isStackQuestion ? STACK_COLORS[option.value] : undefined
    const wasDetected = detection.available && recommended === option.value && recommended !== question.default
    return {
      value: option.value,
      label: color ? color(`◆ ${option.label}`) : option.label,
      hint: option.value === recommended ? (wasDetected ? 'recommended · detected' : 'recommended') : undefined,
    }
  })
}

/**
 * `excalibur init` (via `create-excalibur` or re-run directly) — collect answers,
 * write the config, build the harness files. No framework content is copied
 * anywhere: `build()` resolves `lib/`/`rules/`/etc. straight from `packageRoot`
 * (wherever npm installed this package) every time.
 */

async function askQuestion(question, detection) {
  const recommended = recommendationFor(question, detection)
  const options = questionOptions(question, detection)

  const answer = await p.select({
    message: question.prompt,
    options,
    initialValue: recommended,
  })

  if (p.isCancel(answer)) return { cancelled: true }

  const chosen = (question.options ?? []).find((o) => o.value === answer)

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
 * Checks BEFORE writing anything, the way create-vite does. There's no big folder
 * to offer "remove vs. ignore" for anymore — just a config to overwrite or not.
 */
async function checkExistingInstall(cwd) {
  const located = locateConfig(cwd)
  if (!located) return 'continue'

  p.log.warn(`A config already exists: ${pc.yellow(path.relative(cwd, located.file))} (mode: ${located.mode}).`)

  const choice = await p.select({
    message: 'How should this be handled?',
    options: [
      { value: 'cancel', label: 'Cancel operation', hint: 'nothing is written' },
      { value: 'overwrite', label: 'Overwrite the existing config and continue' },
    ],
    initialValue: 'cancel',
  })

  if (p.isCancel(choice) || choice === 'cancel') return 'cancel'
  return 'continue'
}

/**
 * Installs the standing-context fragment for each opt-in feature the manifest
 * answers turned on. Read in FULL, every session — unlike architecture/, which is
 * pulled selectively per handoff. One manifest answer per feature gates one
 * lib/features/<feature>.md fragment; Obsidian is the first, not the only one.
 * Lives under the custom-overrides folder now (context/ is project-writable
 * content, never under packageRoot).
 */
export function installFeatureFragments(cwd, answers) {
  const paths = projectPaths(cwd)
  ensureDir(paths.context)

  const features = []
  if (answers.obsidian_vault === 'vault') features.push('obsidian')

  for (const feature of features) {
    const source = path.join(packageRoot, 'lib', 'features', `${feature}.md`)
    if (!exists(source)) continue
    copyFile(source, path.join(paths.context, `${feature}.md`))
  }

  return features
}

/**
 * CLAUDE.md is regenerated by every init/update — Claude Code's one automatically-
 * read entry point, so it's what points a brand-new session at the Excalibur flow.
 * Discreet mode's wording never names "Excalibur" or "SDD" — that's the one visible
 * file discreet mode can't avoid writing (removing it would break Claude Code's own
 * session loading), so its CONTENT carries the discretion instead.
 */
export function writeClaudeMd(cwd, mode) {
  const paths = projectPaths(cwd)
  const claudeMdPath = path.join(cwd, 'CLAUDE.md')

  const lines = mode === 'discreet'
    ? [
        '# CLAUDE.md',
        '',
        'Before doing anything else:',
        '',
        `1. Read every file in \`${paths.customDir}/${CONTEXT_DIR}/\` in full, if that`,
        '   folder has any files — those are standing project context that applies',
        '   to every session.',
        `2. Follow \`node_modules/@easy-spec/excalibur/lib/pipeline/entrypoint.md\` for how to`,
        '   handle any implementation request.',
        '',
        `This file is regenerated automatically — don't hand-edit it.`,
        '',
      ]
    : [
        '# CLAUDE.md',
        '',
        'This project uses Excalibur (SDD). Before doing anything else:',
        '',
        `1. Read every file in \`${paths.customDir}/${CONTEXT_DIR}/\` in full, if that`,
        '   folder has any files — those are standing project context that applies',
        '   to every session (installed by \`create-excalibur\` for the features',
        '   this project opted into, e.g. Obsidian integration).',
        `2. Follow \`node_modules/@easy-spec/excalibur/lib/pipeline/entrypoint.md\` for how to`,
        '   handle any implementation request — it defines the four pipeline layers',
        '   (orchestrator → spec → implement → review) and which ones a given task',
        '   actually needs.',
        '',
        `This file is regenerated by \`excalibur update\` — don't hand-edit it.`,
        'Project-specific standing instructions belong in a `lib/features/`',
        'fragment (ask for one to be added) or in your SDD destination, not here.',
        '',
      ]

  writeText(claudeMdPath, lines.join('\n'))
}

export async function init(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur init ')))

  const decision = await checkExistingInstall(cwd)
  if (decision === 'cancel') {
    p.cancel('Nothing was written.')
    return 1
  }

  const configMode = args.discreet ? 'discreet' : 'public'

  let customDir = DEFAULT_CUSTOM_DIR
  if (args.custom) {
    const answer = await p.text({
      message: 'Name for the overrides folder (where your customizations live)?',
      placeholder: DEFAULT_CUSTOM_DIR,
      initialValue: DEFAULT_CUSTOM_DIR,
    })
    if (p.isCancel(answer)) {
      p.cancel('Nothing was written.')
      return 1
    }
    customDir = String(answer).trim() || DEFAULT_CUSTOM_DIR
  }

  const manifest = loadManifest()
  let mode = 'defaults'
  let answers = defaultAnswers(manifest)
  const freeText = {}
  const detection = detectStack(cwd)

  if (detection.available) {
    if (detection.language !== 'unknown') answers.stack_language = detection.language
    answers.stack_framework = detection.framework
    if (detection.ide !== 'unknown') answers.stack_ide = detection.ide

    const detectedItems = [
      detection.language !== 'unknown' ? `Language  ${detection.language}` : '',
      detection.framework !== 'none' ? `Framework ${detection.framework}` : '',
      detection.ide !== 'unknown' ? `Editor    ${detection.ide}` : '',
    ].filter(Boolean)

    if (detectedItems.length) p.note(detectedItems.join('\n'), pc.cyan('Detected stack'))
  }

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
        if (question.id === 'stack_language') p.log.info(pc.bold(pc.cyan('Stack & tooling')))
        const result = await askQuestion(question, detection)
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
          (manifest.questions ?? []).map((q) => `  ${q.id}: ${pc.dim(answers[q.id])}`).join('\n'),
      )
    }
  }

  const payload = { ...answers }
  for (const [id, text] of Object.entries(freeText)) payload[`${id}_text`] = text

  // customDir has to be resolved before projectPaths(cwd) can find the right
  // context/ folder — write the config FIRST, then everything else can call
  // projectPaths(cwd) normally and get the right paths back.
  const sddPath = resolveSddPath(cwd, answers)
  writeSddMarker(sddPath)

  writeConfig(cwd, {
    version: 1,
    mode: configMode,
    base_dir: 'node_modules/@easy-spec/excalibur',
    custom_dir: customDir,
    framework_version: frameworkVersion(),
    setup_mode: mode,
    answers: payload,
    sdd_path: sddPath,
    session: { flags: {} },
  })

  const spinner = p.spinner()
  spinner.start('Building harness files')
  const built = build(cwd)
  spinner.stop(`Built ${built.agents.length} agents and ${built.skills.length} skill files`)

  const installedFeatures = installFeatureFragments(cwd, answers)
  writeClaudeMd(cwd, configMode)

  const paths = projectPaths(cwd)
  // Public mode keeps generated harness output out of git; it can always be rebuilt
  // from the package plus the committed overrides. Discreet mode avoids adding an
  // Excalibur-labelled block. History follows the explicit onboarding answer.
  const ignored = configMode === 'public' ? [...GENERATED_GITIGNORE_ENTRIES] : []
  if (answers.history_gitignore === 'ignored') ignored.push('history.yaml', 'history/archive/')
  // Discreet mode's .gitignore must not name "Excalibur"/"SDD" either — the
  // comment header is the only bit of this call that could leak the name.
  const added = ignored.length
    ? ensureGitignore(paths.gitignore, ignored, configMode === 'discreet' ? 'ignored files' : 'Excalibur')
    : []

  p.note(
    [
      `${pc.green('✓')} ${configMode === 'discreet' ? 'package.json ("excalibur" key)' : 'excalibur.yaml'}   project config`,
      `${pc.dim('·')} ${paths.customDir}/     your overrides (commit this)`,
      added.length ? `${pc.green('✓')} .gitignore             + ${added.join(', ')}` : '',
      installedFeatures.length
        ? `${pc.green('✓')} ${paths.customDir}/${CONTEXT_DIR}/     ${installedFeatures.join(', ')} standing context`
        : '',
      `${pc.green('✓')} CLAUDE.md              entrypoint the harness reads every session`,
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
