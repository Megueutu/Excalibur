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
    // What the snap-in adds to every session: its context files and the listing of its agents and skills.
    return { id: m.name, tokens: Math.ceil(m.tokens / 100) / 10 }
  })
  return {
    editors: (await findEditors()).map(({ id, label }) => ({ id, label })),
    modes: [...c.availableModes(cwd).keys()],
    modules,
    contextLimit: DEFAULT_CONTEXT_LIMIT,
  }
}
