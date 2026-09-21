import path from 'node:path'
import fs from 'node:fs'
import { projectPaths, harnessTargets } from './paths.js'
import { resolveFile } from './resolve.js'
import { copyFile, ensureDir, listFiles } from './fsx.js'
import { parse } from './yaml.js'

/**
 * Resolves the project's overrides folder (`custom_dir`) over the installed
 * package (`node_modules/@spec/excalibur/`) and writes the effective files to the fixed
 * paths the harness actually reads.
 *
 * Why this exists: Claude Code reads one fixed path. It has no notion of "look in
 * the override folder first, then fall back". So something has to decide up front
 * which version of each file is the effective one and produce that file. That's
 * this step, and it's needed for everything following the base+override pattern —
 * agents, rules, templates — not only agents with a persona.
 *
 * Not a user-facing command: it runs automatically from init, update and customize,
 * which are the three moments the effective set can change. The CLI's command list
 * is a closed decision and doesn't include a build verb.
 */

/**
 * Assembles one agent's final .md: frontmatter (name/description/tools/model —
 * no `skills:` line, personas are baked into the body, not preloaded by the
 * harness), then each persona's content in list order, then the agent's own
 * body. Personas and the body are separate files, each resolved through the
 * normal base+override chain, so either can be customized independently of
 * the agent's own metadata.
 */
function assembleAgentMd(cwd, agent, body) {
  const personaBlocks = (agent.personas ?? []).map((name) => {
    const source = resolveFile(cwd, `lib/personas/${name}.md`)
    if (!source) throw new Error(`Agent "${agent.name}" references unknown persona "${name}" (no lib/personas/${name}.md)`)
    return fs.readFileSync(source, 'utf8').replace(/\n+$/, '\n')
  })

  const frontmatter = ['---', `name: ${agent.name}`, `description: ${agent.description}`, `tools: ${agent.tools}`, `model: ${agent.model}`, '---', '']
  return [frontmatter.join('\n'), ...personaBlocks, body].join('\n')
}

/** Copies one logical group (a folder of the installed tree) to a harness path. */
function buildGroup(cwd, relDir, targetDir, filter = () => true) {
  const p = projectPaths(cwd)
  const written = []

  // The candidate list comes from base; anything custom-only is picked up too.
  const fromBase = listFiles(path.join(p.base, relDir))
  const fromCustom = listFiles(path.join(p.custom, relDir))
  const candidates = [...new Set([...fromBase, ...fromCustom])].filter(filter)

  for (const rel of candidates) {
    const source = resolveFile(cwd, path.join(relDir, rel).split(path.sep).join('/'))
    if (!source) continue
    const dest = path.join(cwd, targetDir, rel)
    copyFile(source, dest)
    written.push(path.join(targetDir, rel).split(path.sep).join('/'))
  }

  return written
}

/**
 * Builds agents from YAML sources, converting to .md for Claude Code. Each
 * agent is its own subfolder under `sourceDir` — `<name>/agent.yaml`
 * (metadata) and `<name>/instructions.md` (the agent's own body), each
 * resolved independently through base+override, so a project can customize
 * either without touching the other. `.template/` is the skeleton for creating
 * a new agent, never built.
 */
function buildAgents(cwd, sourceDir, targetDir) {
  const p = projectPaths(cwd)
  const written = []

  // The candidate list comes from base; anything custom-only is picked up too.
  const fromBase = listFiles(path.join(p.base, sourceDir)).filter((f) => f.endsWith('/agent.yaml'))
  const fromCustom = listFiles(path.join(p.custom, sourceDir)).filter((f) => f.endsWith('/agent.yaml'))
  const candidates = [...new Set([...fromBase, ...fromCustom])].filter((rel) => !rel.startsWith('.template/'))

  for (const rel of candidates) {
    const agentName = rel.split('/')[0]
    const source = resolveFile(cwd, path.join(sourceDir, rel).split(path.sep).join('/'))
    if (!source) continue

    const agent = parse(fs.readFileSync(source, 'utf8'))

    const bodyRel = `${agentName}/instructions.md`
    const bodySource = resolveFile(cwd, path.join(sourceDir, bodyRel).split(path.sep).join('/'))
    if (!bodySource) throw new Error(`Agent "${agent.name}" has no body file at ${sourceDir}/${bodyRel}`)
    const body = fs.readFileSync(bodySource, 'utf8').replace(/\n+$/, '\n')

    const mdContent = assembleAgentMd(cwd, agent, body)

    const dest = path.join(cwd, targetDir, `${agentName}.md`)
    ensureDir(path.dirname(dest))
    fs.writeFileSync(dest, mdContent, 'utf8')

    written.push(path.join(targetDir, `${agentName}.md`).split(path.sep).join('/'))
  }

  return written
}

export function build(cwd, { harness = 'claude' } = {}) {
  const targets = harnessTargets[harness]
  if (!targets) throw new Error(`Unknown harness: ${harness}`)

  ensureDir(path.join(cwd, targets.agents))
  ensureDir(path.join(cwd, targets.skills))

  const agents = buildAgents(cwd, 'lib/agents', targets.agents)

  // Skills keep their folder shape: a skill is <name>/SKILL.md plus whatever it
  // carries alongside, so the whole subtree is copied, not just the entry file.
  const skills = buildGroup(cwd, `harnesses/${harness}/skills`, targets.skills, (f) => f !== 'README.md')

  return { agents, skills }
}

/** True when the installed tree has anything to build from. */
export function canBuild(cwd) {
  const p = projectPaths(cwd)
  return fs.existsSync(path.join(p.base, 'lib', 'agents'))
}
