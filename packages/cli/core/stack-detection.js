import fs from 'node:fs'
import path from 'node:path'

function exists(cwd, name) {
  return fs.existsSync(path.join(cwd, name))
}

function read(cwd, name) {
  try {
    return fs.readFileSync(path.join(cwd, name), 'utf8')
  } catch {
    return ''
  }
}

function packageNames(cwd) {
  try {
    const pkg = JSON.parse(read(cwd, 'package.json'))
    return new Set([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ])
  } catch {
    return new Set()
  }
}

function hasAnyFile(cwd, suffixes) {
  try {
    return fs.readdirSync(cwd).some((name) => suffixes.some((suffix) => name.endsWith(suffix)))
  } catch {
    return false
  }
}

function detectLanguage(cwd) {
  if (exists(cwd, 'package.json')) return exists(cwd, 'tsconfig.json') ? 'typescript' : 'javascript'
  if (['pyproject.toml', 'requirements.txt', 'setup.py'].some((name) => exists(cwd, name))) return 'python'
  if (exists(cwd, 'go.mod')) return 'go'
  if (exists(cwd, 'Cargo.toml')) return 'rust'
  if (['pom.xml', 'build.gradle', 'build.gradle.kts'].some((name) => exists(cwd, name))) return 'java'
  if (exists(cwd, 'Gemfile')) return 'ruby'
  if (exists(cwd, 'composer.json')) return 'php'
  if (hasAnyFile(cwd, ['.sln', '.csproj'])) return 'csharp'
  if (exists(cwd, 'Package.swift')) return 'swift'
  if (exists(cwd, 'pubspec.yaml')) return 'dart'
  if (exists(cwd, 'CMakeLists.txt')) return 'cpp'
  return 'unknown'
}

function detectFramework(cwd, language) {
  const dependencies = packageNames(cwd)
  const nodeSignals = [
    ['next', 'next'],
    ['@angular/core', 'angular'],
    ['nuxt', 'nuxt'],
    ['astro', 'astro'],
    ['marko', 'marko'],
    ['react', 'react'],
    ['vue', 'vue'],
    ['svelte', 'svelte'],
    ['@nestjs/core', 'nestjs'],
    ['nestjs', 'nestjs'],
    ['express', 'node'],
    ['fastify', 'node'],
  ]
  const nodeMatch = nodeSignals.find(([dependency]) => dependencies.has(dependency))
  if (nodeMatch) return nodeMatch[1]

  if (language === 'python') {
    const contents = `${read(cwd, 'requirements.txt')}\n${read(cwd, 'pyproject.toml')}`
    if (/\bdjango\b/i.test(contents)) return 'django'
    if (/\bfastapi\b/i.test(contents)) return 'fastapi'
  }
  if (language === 'ruby' && /gem\s+['"]rails['"]/.test(read(cwd, 'Gemfile'))) return 'rails'
  if (language === 'php' && /"laravel\/framework"/.test(read(cwd, 'composer.json'))) return 'laravel'
  if (language === 'java') {
    const contents = `${read(cwd, 'pom.xml')}\n${read(cwd, 'build.gradle')}\n${read(cwd, 'build.gradle.kts')}`
    if (/spring/i.test(contents)) return 'spring'
  }

  return 'none'
}

export function detectStack(cwd) {
  if (!fs.existsSync(cwd)) return { available: false }

  const language = detectLanguage(cwd)
  return {
    available: true,
    language,
    framework: detectFramework(cwd, language),
    ide: exists(cwd, '.vscode') ? 'vscode' : exists(cwd, '.idea') ? 'jetbrains' : 'unknown',
  }
}
