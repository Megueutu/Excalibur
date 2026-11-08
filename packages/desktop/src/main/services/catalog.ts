import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Catalog } from '../../shared/contract'
import { core } from '../core'
import { findEditors } from './editors'

/** Recommended ceiling, in thousands of tokens, when a project does not set `context_budget.warn`. */
const DEFAULT_CONTEXT_LIMIT = 20

/** What the machine offers: the work modes, the optional modules and what each costs, and the editors installed. */
export async function getCatalog(): Promise<Catalog> {
  const c = core()
  const cwd = c.readRegistry()[0]?.path ?? c.packageRoot
  const modules = [...c.availableModules(cwd).values()].map((m) => {
    const chars = m.context.reduce((sum, f) => {
      const file = join(c.packageRoot, 'lib', 'modules', m.name, 'context', f)
      return sum + (existsSync(file) ? c.estimateTokens(readFileSync(file, 'utf8')) : 0)
    }, 0)
    return { id: m.name, tokens: Math.ceil(chars / 100) / 10 }
  })
  return {
    editors: (await findEditors()).map(({ id, label }) => ({ id, label })),
    modes: [...c.availableModes(cwd).keys()],
    modules,
    contextLimit: DEFAULT_CONTEXT_LIMIT,
  }
}
