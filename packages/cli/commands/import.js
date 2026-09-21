import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { packageRoot, projectPaths } from '../core/paths.js'
import { copyFile, ensureDir, exists } from '../core/fsx.js'
import { parse } from '../core/yaml.js'
import { syncCustomManifest } from '../core/config.js'
import { build } from '../core/build.js'

function catalogs() {
  const agentsRoot = path.join(packageRoot, 'lib', 'agents')
  const personasRoot = path.join(packageRoot, 'lib', 'personas')
  return {
    agent: fs.readdirSync(agentsRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name)
      .sort(),
    persona: fs.readdirSync(personasRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .map((entry) => path.basename(entry.name, '.md'))
      .sort(),
  }
}

function importPersona(paths, name, written) {
  const source = path.join(packageRoot, 'lib', 'personas', `${name}.md`)
  if (!exists(source)) throw new Error(`Unknown persona: ${name}`)
  const destination = path.join(paths.custom, 'lib', 'personas', `${name}.md`)
  copyFile(source, destination)
  written.push(path.relative(paths.root, destination).split(path.sep).join('/'))
}

function importAgent(paths, name, written) {
  const sourceDir = path.join(packageRoot, 'lib', 'agents', name)
  if (!exists(path.join(sourceDir, 'agent.yaml'))) throw new Error(`Unknown agent: ${name}`)

  for (const file of ['agent.yaml', 'instructions.md']) {
    const destination = path.join(paths.custom, 'lib', 'agents', name, file)
    copyFile(path.join(sourceDir, file), destination)
    written.push(path.relative(paths.root, destination).split(path.sep).join('/'))
  }

  const metadata = parse(fs.readFileSync(path.join(sourceDir, 'agent.yaml'), 'utf8'))
  for (const persona of metadata.personas ?? []) importPersona(paths, persona, written)
}

async function choose(message, values) {
  const answer = await p.select({
    message,
    options: values.map((value) => ({ value, label: value })),
  })
  return p.isCancel(answer) ? null : answer
}

export async function importContent(args, cwd) {
  p.intro(pc.bgCyan(pc.black(' excalibur import ')))

  const paths = projectPaths(cwd)
  if (!paths.configured) {
    p.cancel('No config found here. Run `npx create-excalibur` first.')
    return 1
  }

  const available = catalogs()
  let type = args._?.[0]
  let name = args._?.[1]

  if (!['agent', 'persona', 'all'].includes(type)) {
    type = await choose('What do you want to import?', ['agent', 'persona', 'all'])
    if (!type) return 1
  }

  if (type !== 'all' && !name) {
    name = await choose(`Which ${type}?`, available[type])
    if (!name) return 1
  }

  if (type !== 'all' && !available[type].includes(name)) {
    p.cancel(`Unknown ${type}: ${name}\nAvailable: ${available[type].join(', ')}`)
    return 1
  }

  const selected = type === 'all'
    ? [...available.agent.map((value) => ['agent', value]), ...available.persona.map((value) => ['persona', value])]
    : [[type, name]]

  const existing = selected.filter(([kind, value]) => {
    const relative = kind === 'agent'
      ? path.join('lib', 'agents', value)
      : path.join('lib', 'personas', `${value}.md`)
    return exists(path.join(paths.custom, relative))
  })

  if (existing.length && !args.yes) {
    const confirmed = await p.confirm({
      message: `Overwrite ${existing.length} already imported item(s)?`,
      initialValue: false,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Nothing was imported.')
      return 1
    }
  }

  ensureDir(paths.custom)
  const written = []
  for (const [kind, value] of selected) {
    if (kind === 'agent') importAgent(paths, value, written)
    else importPersona(paths, value, written)
  }

  syncCustomManifest(cwd)
  const built = build(cwd)

  p.note([...new Set(written)].join('\n'), 'Editable sources imported')
  p.outro(`Built ${built.agents.length} agent Markdown file(s) and ${built.skills.length} skill file(s).`)
  return 0
}
