import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse, stringify } from './yaml.js'
import { locateConfig } from './paths.js'
import { readConfig, frameworkVersion } from './config.js'

/**
 * Per-user state, shared by every project on the machine. It lives outside any project,
 * in `~/.excalibur/` (or wherever `EXCALIBUR_HOME` points):
 *
 *   config.yaml    the user profile pointer, which profiles each project uses, defaults
 *   projects.yaml  registry of the projects the CLI has seen
 *
 * Both files carry a `schema` number. A file written by a newer Excalibur is read as far
 * as possible and never rewritten, so an older install cannot damage it.
 */

export const USER_SCHEMA = 1
export const SNAPSHOT_CHOICES = ['ignored', 'committed']

const HEADER = '# Written by Excalibur. Safe to edit by hand while no Excalibur command is running.\n'

export function userPaths(env = process.env) {
  const home = env.EXCALIBUR_HOME ? path.resolve(env.EXCALIBUR_HOME) : path.join(os.homedir(), '.excalibur')
  return { home, config: path.join(home, 'config.yaml'), registry: path.join(home, 'projects.yaml') }
}

/** Path equality that ignores case on Windows, where the file system does. */
export function samePath(a, b) {
  const x = path.resolve(a)
  const y = path.resolve(b)
  return process.platform === 'win32' ? x.toLowerCase() === y.toLowerCase() : x === y
}

function load(file) {
  let doc = {}
  try {
    doc = parse(fs.readFileSync(file, 'utf8')) ?? {}
  } catch {
    doc = {}
  }
  if (typeof doc !== 'object' || Array.isArray(doc)) doc = {}
  return { doc, supported: Number(doc.schema ?? USER_SCHEMA) <= USER_SCHEMA }
}

function save(file, doc, supported) {
  if (!supported) {
    throw new Error(`${file} was written by a newer Excalibur (schema ${doc.schema}). Update Excalibur before changing it.`)
  }
  const { schema: _ignored, ...rest } = doc
  fs.mkdirSync(path.dirname(file), { recursive: true })
  // Write to a temp file and rename, so a crash never leaves a half-written config.
  const tmp = `${file}.${process.pid}.tmp`
  fs.writeFileSync(tmp, HEADER + stringify({ schema: USER_SCHEMA, ...rest }), 'utf8')
  fs.renameSync(tmp, file)
}

/** The whole user config document, plus whether this Excalibur may write it back. */
export function readUserConfig(env = process.env) {
  return load(userPaths(env).config)
}

function updateUserConfig(env, change) {
  const { config } = userPaths(env)
  const { doc, supported } = load(config)
  change(doc)
  save(config, doc, supported)
}

/** Absolute path of the user profile repository, or null when none is linked. */
export function getProfileRepo(env = process.env) {
  const value = readUserConfig(env).doc.profile?.path
  return typeof value === 'string' && value ? value : null
}

export function setProfileRepo(repoPath, env = process.env) {
  updateUserConfig(env, (doc) => {
    doc.profile = { ...(doc.profile ?? {}), path: path.resolve(repoPath) }
  })
}

function defaultSnapshot(doc) {
  const value = doc.defaults?.snapshot
  return SNAPSHOT_CHOICES.includes(value) ? value : 'ignored'
}

/** The snapshot treatment new projects start with: `ignored` (kept out of git) or `committed`. */
export function getDefaultSnapshot(env = process.env) {
  return defaultSnapshot(readUserConfig(env).doc)
}

export function setDefaultSnapshot(value, env = process.env) {
  if (!SNAPSHOT_CHOICES.includes(value)) throw new Error(`Snapshot must be one of: ${SNAPSHOT_CHOICES.join(', ')}.`)
  updateUserConfig(env, (doc) => {
    doc.defaults = { ...(doc.defaults ?? {}), snapshot: value }
  })
}

function projectList(doc) {
  return Array.isArray(doc.projects) ? doc.projects.filter((p) => p && typeof p.path === 'string') : []
}

/** Which profiles a project uses and how its snapshot is treated by git. */
export function getProjectSettings(projectPath, env = process.env) {
  const { doc } = readUserConfig(env)
  const entry = projectList(doc).find((p) => samePath(p.path, projectPath))
  const profiles = Array.isArray(entry?.profiles) ? entry.profiles.map(String) : []
  const snapshot = SNAPSHOT_CHOICES.includes(entry?.snapshot) ? entry.snapshot : defaultSnapshot(doc)
  return { profiles, snapshot }
}

/** Merges `patch` ({ profiles?, snapshot? }) into the project's entry, creating it if needed. */
export function setProjectSettings(projectPath, patch, env = process.env) {
  updateUserConfig(env, (doc) => {
    const list = projectList(doc)
    let entry = list.find((p) => samePath(p.path, projectPath))
    if (!entry) {
      entry = { path: path.resolve(projectPath) }
      list.push(entry)
    }
    if (patch.profiles) entry.profiles = patch.profiles.map(String)
    if (patch.snapshot) entry.snapshot = patch.snapshot
    doc.projects = list
  })
}

/** Registry of projects the CLI has seen: `[{ path, name, framework_version, mode, last_seen }]`. */
export function readRegistry(env = process.env) {
  const { doc } = load(userPaths(env).registry)
  return projectList(doc)
}

export function registerProject(projectPath, env = process.env) {
  const file = userPaths(env).registry
  const { doc, supported } = load(file)
  const list = projectList(doc)
  const located = locateConfig(projectPath)
  const config = readConfig(projectPath) ?? {}
  const entry = {
    path: path.resolve(projectPath),
    name: path.basename(path.resolve(projectPath)),
    framework_version: String(config.framework_version ?? frameworkVersion()),
    mode: located?.mode ?? 'public',
    last_seen: new Date().toISOString(),
  }
  const at = list.findIndex((p) => samePath(p.path, projectPath))
  if (at >= 0) list[at] = entry
  else list.push(entry)
  doc.projects = list
  save(file, doc, supported)
  return entry
}

/** Takes a project out of the registry. Only the registry entry goes: the folder is never touched. Returns whether it was there. */
export function unregisterProject(projectPath, env = process.env) {
  const file = userPaths(env).registry
  const { doc, supported } = load(file)
  const list = projectList(doc)
  const kept = list.filter((p) => !samePath(p.path, projectPath))
  if (kept.length === list.length) return false
  doc.projects = kept
  save(file, doc, supported)
  return true
}

/**
 * Registers a project without ever failing the command that called it: the registry is a
 * convenience, and an unwritable home directory must not break `init` or `update`.
 */
export function touchProject(projectPath, env = process.env) {
  try {
    registerProject(projectPath, env)
    return true
  } catch {
    return false
  }
}
