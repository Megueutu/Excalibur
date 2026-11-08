import { core } from '../core'

/**
 * The stack of a folder, as the ids the screen has icons for. The language comes from linguist-js
 * (the same rules as GitHub Linguist) and frameworks and tools from @specfy/stack-analyser. Neither
 * is reimplemented here. If either fails or takes too long, the core's own marker-file detection
 * answers instead, so the list is never empty because of a slow scan.
 */

const TIMEOUT_MS = 12_000
const TTL_MS = 10 * 60_000
const MAX_ITEMS = 8

const LANGUAGE: Record<string, string> = {
  TypeScript: 'typescript',
  TSX: 'typescript',
  JavaScript: 'javascript',
  JSX: 'javascript',
  Python: 'python',
  Shell: 'shell',
  HTML: 'html',
  CSS: 'css',
  Kotlin: 'kotlin',
  Java: 'java',
  Go: 'go',
  Rust: 'rust',
  PHP: 'php',
  Ruby: 'ruby',
  Swift: 'swift',
  Dart: 'dart',
  Vue: 'vue',
  Svelte: 'svelte',
}

/** Ids from stack-analyser (and the core's detection) to the ids of the icon registry. */
const TECH: Record<string, string> = {
  nodejs: 'nodejs',
  react: 'react',
  vite: 'vite',
  tailwind: 'tailwindcss',
  tailwindcss: 'tailwindcss',
  electron: 'electron',
  docker: 'docker',
  nestjs: 'nestjs',
  nextjs: 'nextjs',
  next: 'nextjs',
  angular: 'angular',
  vue: 'vue',
  svelte: 'svelte',
  spring: 'spring',
  flutter: 'flutter',
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  dart: 'dart',
  kotlin: 'kotlin',
  shell: 'shell',
  bash: 'shell',
  css: 'css',
  html: 'html',
}

const cache = new Map<string, { at: number; stack: string[] }>()

function withTimeout<T>(work: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('stack detection timed out')), TIMEOUT_MS)
    work.then(
      (v) => (clearTimeout(timer), resolve(v)),
      (e) => (clearTimeout(timer), reject(e)),
    )
  })
}

async function languageFromLinguist(dir: string): Promise<string | null> {
  const { default: linguist } = await import('linguist-js')
  // Not `quick`: that mode trusts file extensions alone and calls a Markdown file a machine description.
  const result = await linguist(dir, { ignoredFiles: ['node_modules/**', 'dist/**', 'out/**', 'build/**', '.git/**', 'vendor/**'] })
  const ranked = Object.entries(result.languages.results)
    .filter(([, info]) => info.type === 'programming')
    .sort((a, b) => b[1].bytes - a[1].bytes)
  const top = ranked.map(([name]) => LANGUAGE[name]).find(Boolean)
  if (top) return top
  return 'Markdown' in result.languages.results ? 'markdown' : null
}

async function techFromAnalyser(dir: string): Promise<string[]> {
  await import('@specfy/stack-analyser/dist/autoload.js')
  const { analyser, FSProvider } = await import('@specfy/stack-analyser')
  const payload = await analyser({ provider: new FSProvider({ path: dir }) })
  const json = payload.toJson() as { techs?: string[]; childs?: { techs?: string[] }[] }
  return [...(json.techs ?? []), ...(json.childs ?? []).flatMap((c) => c.techs ?? [])]
}

function fromCore(dir: string): string[] {
  const found = core().detectStack(dir)
  if (!found.available) return []
  const ids = [found.language, found.framework].map((x) => (x ? TECH[x] : undefined))
  return ids.filter((x): x is string => !!x)
}

export async function detectStack(dir: string): Promise<string[]> {
  const hit = cache.get(dir)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.stack

  const stack: string[] = []
  const add = (id: string | undefined | null) => {
    if (id && !stack.includes(id) && stack.length < MAX_ITEMS) stack.push(id)
  }

  try {
    const [language, techs] = await withTimeout(Promise.all([languageFromLinguist(dir), techFromAnalyser(dir)]))
    add(language)
    for (const t of techs) add(TECH[t])
  } catch {
    for (const id of fromCore(dir)) add(id)
  }
  if (!stack.length) for (const id of fromCore(dir)) add(id)

  cache.set(dir, { at: Date.now(), stack })
  return stack
}
