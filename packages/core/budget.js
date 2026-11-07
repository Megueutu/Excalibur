import fs from 'node:fs'
import path from 'node:path'
import { projectPaths } from './paths.js'
import { resolveFile } from './resolve.js'
import { listFiles } from './fsx.js'
import { readConfig, configuredSddPath } from './config.js'

/**
 * Context budget: a rough, local count of how much text an agent reads before it
 * starts a task. It never calls a service and never needs a key, so every number is
 * an estimate (characters divided by a ratio) and is always labelled as one.
 *
 * Layers follow the order the entrypoint loads them:
 *   standing   read at the start of every session
 *   task       read when a task starts (pipeline entrypoint, global and stack rules)
 *   on demand  agents and skills, whose bodies load only when invoked
 *   sdd        the project's own architecture notes, when they exist
 */

const CHARS_PER_TOKEN = { en: 4 }
const DEFAULT_RATIO = 3

export function estimateTokens(text, language = 'en') {
  const ratio = CHARS_PER_TOKEN[language] ?? DEFAULT_RATIO
  return Math.ceil(text.length / ratio)
}

function readSafe(file) {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return ''
  }
}

function entry(label, files, language) {
  const items = files
    .filter((f) => f && fs.existsSync(f))
    .map((f) => ({ file: f, tokens: estimateTokens(readSafe(f), language) }))
  return { label, items, tokens: items.reduce((sum, i) => sum + i.tokens, 0) }
}

function stackRuleFiles(cwd, answers) {
  const picks = [
    ['languages', answers.stack_language],
    ['frameworks', answers.stack_framework],
    ['ides', answers.stack_ide],
  ]
  return picks
    .filter(([, name]) => name && name !== 'other' && name !== 'none' && name !== 'unknown')
    .map(([group, name]) => resolveFile(cwd, `rules/stacks/${group}/${name}.yaml`))
}

/** Only the front matter description: that is all an agent or skill costs until invoked. */
function descriptionOnly(file) {
  const text = readSafe(file)
  const match = text.match(/^description:\s*(.+)$/m)
  return match ? match[1] : ''
}

export function measureContext(cwd) {
  const paths = projectPaths(cwd)
  const config = readConfig(cwd) ?? {}
  const answers = config.answers ?? {}
  const language = answers.language ?? 'en'

  const globalRules = listFiles(path.join(paths.base, 'rules', 'global'))
    .filter((f) => f.endsWith('.md'))
    .map((f) => resolveFile(cwd, `rules/global/${f}`))

  const contextDir = paths.context
  const contextFiles = fs.existsSync(contextDir) ? listFiles(contextDir).map((f) => path.join(contextDir, f)) : []
  const isProfile = (f) => path.basename(f) === 'user-profile.md'

  const standing = [
    entry('CLAUDE.md', [path.join(cwd, 'CLAUDE.md')], language),
    entry('module context', contextFiles.filter((f) => !isProfile(f)), language),
    entry('user profile', contextFiles.filter(isProfile), language),
  ]
  const task = [
    entry('pipeline entrypoint', [resolveFile(cwd, 'lib/pipeline/entrypoint.md')], language),
    entry('global rules', globalRules, language),
    entry('stack rules', stackRuleFiles(cwd, answers), language),
  ]

  const generated = (dir) => {
    const root = path.join(cwd, dir)
    return listFiles(root).filter((f) => f.endsWith('.md')).map((f) => path.join(root, f))
  }
  const agentFiles = generated('.claude/agents')
  const skillFiles = generated('.claude/skills').filter((f) => f.endsWith('SKILL.md'))
  const descriptions = [...agentFiles, ...skillFiles].map(descriptionOnly).join('\n')
  const onDemandBodies = [...agentFiles, ...skillFiles].reduce((sum, f) => sum + estimateTokens(readSafe(f), language), 0)
  const visible = { label: 'agent and skill descriptions', items: [], tokens: estimateTokens(descriptions, language) }
  const onDemand = { label: 'agent and skill bodies (only when invoked)', items: [], tokens: onDemandBodies }

  const sddRoot = configuredSddPath(cwd)
  const architecture = sddRoot && fs.existsSync(sddRoot)
    ? listFiles(sddRoot).filter((f) => /^architecture/i.test(f) && f.endsWith('.md')).map((f) => path.join(sddRoot, f))
    : []
  const sdd = entry('SDD architecture notes', architecture, language)

  const alwaysLoaded = [...standing, visible].reduce((sum, l) => sum + l.tokens, 0)
  const perTask = task.reduce((sum, l) => sum + l.tokens, 0) + sdd.tokens

  return {
    language,
    ratio: CHARS_PER_TOKEN[language] ?? DEFAULT_RATIO,
    layers: { standing: [...standing, visible], task: [...task, sdd], onDemand: [onDemand] },
    totals: { alwaysLoaded, perTask, startOfTask: alwaysLoaded + perTask },
    warn: Number(config.context_budget?.warn) || null,
  }
}
