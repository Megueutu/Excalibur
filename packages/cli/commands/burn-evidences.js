import fs from 'node:fs'
import path from 'node:path'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import {
  projectPaths,
  harnessTargets,
  locateConfig,
  GENERATED_GITIGNORE_ENTRIES,
} from '../core/paths.js'
import { readConfig } from '../core/config.js'
import {
  exists,
  removeDir,
  removeFile,
  removeGitignoreEntries,
  writeText,
} from '../core/fsx.js'

const PACKAGE_NAME = '@easy-spec/excalibur'
const GITIGNORE_ENTRIES = [...GENERATED_GITIGNORE_ENTRIES, 'history.yaml', 'history/archive/', '.excalibur/']

function safeSddPath(cwd, configuredPath) {
  if (!configuredPath) return null
  const resolved = path.resolve(configuredPath)
  if (resolved === path.resolve(cwd) || resolved === path.parse(resolved).root) return null
  return resolved
}

function removePackageConfiguration(cwd) {
  const packageJson = path.join(cwd, 'package.json')
  if (!exists(packageJson)) return false

  const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
  let changed = false
  if (pkg.excalibur) {
    delete pkg.excalibur
    changed = true
  }
  for (const group of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    if (pkg[group]?.[PACKAGE_NAME]) {
      delete pkg[group][PACKAGE_NAME]
      if (Object.keys(pkg[group]).length === 0) delete pkg[group]
      changed = true
    }
  }
  if (changed) writeText(packageJson, JSON.stringify(pkg, null, 2) + '\n')
  return changed
}

function removePackageLockEntry(cwd) {
  const lockPath = path.join(cwd, 'package-lock.json')
  if (!exists(lockPath)) return false
  try {
    const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'))
    let changed = false
    if (lock.packages?.['']?.dependencies?.[PACKAGE_NAME]) {
      delete lock.packages[''].dependencies[PACKAGE_NAME]
      changed = true
    }
    if (lock.packages?.['']?.devDependencies?.[PACKAGE_NAME]) {
      delete lock.packages[''].devDependencies[PACKAGE_NAME]
      changed = true
    }
    if (lock.packages?.[`node_modules/${PACKAGE_NAME}`]) {
      delete lock.packages[`node_modules/${PACKAGE_NAME}`]
      changed = true
    }
    if (lock.dependencies?.[PACKAGE_NAME]) {
      delete lock.dependencies[PACKAGE_NAME]
      changed = true
    }
    if (changed) writeText(lockPath, JSON.stringify(lock, null, 2) + '\n')
    return changed
  } catch {
    return false
  }
}

function removeIfEmpty(directory) {
  if (exists(directory) && fs.readdirSync(directory).length === 0) fs.rmdirSync(directory)
}

function hasPackageEvidence(cwd) {
  const packageJson = path.join(cwd, 'package.json')
  if (!exists(packageJson)) return false
  try {
    const pkg = JSON.parse(fs.readFileSync(packageJson, 'utf8'))
    return Boolean(
      pkg.excalibur ||
      pkg.dependencies?.[PACKAGE_NAME] ||
      pkg.devDependencies?.[PACKAGE_NAME] ||
      pkg.optionalDependencies?.[PACKAGE_NAME] ||
      pkg.peerDependencies?.[PACKAGE_NAME],
    )
  } catch {
    return false
  }
}

export async function burnEvidences(args, cwd) {
  p.intro(pc.bgRed(pc.white(' excalibur burn-evidences ')))

  const config = readConfig(cwd)
  const located = locateConfig(cwd)
  const paths = projectPaths(cwd)
  const targets = harnessTargets.claude
  const sddPath = safeSddPath(cwd, config?.sdd_path)

  const removals = [
    { label: paths.customDir + '/', target: paths.custom, dir: true },
    { label: '.claude/agents/', target: path.join(cwd, targets.agents), dir: true },
    { label: '.claude/skills/', target: path.join(cwd, targets.skills), dir: true },
    { label: 'CLAUDE.md', target: path.join(cwd, 'CLAUDE.md'), dir: false },
    { label: '.excalibur/', target: path.join(cwd, '.excalibur'), dir: true },
    ...(sddPath ? [{ label: path.relative(cwd, sddPath) || sddPath, target: sddPath, dir: true }] : []),
    ...(located?.mode === 'public'
      ? [{ label: 'excalibur.yaml', target: located.file, dir: false }]
      : []),
  ].filter((item) => exists(item.target))

  const hasPackage = hasPackageEvidence(cwd)
  if (!located && removals.length === 0 && !hasPackage) {
    p.outro('No Excalibur evidence was found in this project.')
    return 0
  }

  p.note(
    [
      ...removals.map((item) => item.label),
      '.gitignore entries owned by Excalibur',
      `${PACKAGE_NAME} dependency and package files`,
    ].join('\n'),
    'Will be permanently removed',
  )
  p.log.warn('This removes the current working-tree SDD. Existing Git history is not rewritten.')

  if (args['dry-run']) {
    p.outro('Dry run complete. Nothing was removed.')
    return 0
  }

  if (!args.yes) {
    const confirmed = await p.confirm({
      message: 'Burn all Excalibur evidence from this project?',
      initialValue: false,
    })
    if (p.isCancel(confirmed) || !confirmed) {
      p.cancel('Nothing was removed.')
      return 1
    }
  }

  for (const item of removals) {
    if (item.dir) removeDir(item.target)
    else removeFile(item.target)
  }

  removeGitignoreEntries(paths.gitignore, GITIGNORE_ENTRIES, ['Excalibur', 'ignored files'])
  removePackageConfiguration(cwd)
  removePackageLockEntry(cwd)
  removeIfEmpty(path.join(cwd, '.claude'))

  // Do this last: in a normal installation this is the package currently
  // executing. Node has already loaded the command and Windows permits removing
  // the package files once their contents are in memory.
  const installedPackage = path.join(cwd, 'node_modules', '@easy-spec', 'excalibur')
  removeDir(installedPackage)
  removeIfEmpty(path.dirname(installedPackage))
  removeIfEmpty(path.join(cwd, 'node_modules'))

  p.outro('Excalibur evidence removed from the working tree.')
  return 0
}
