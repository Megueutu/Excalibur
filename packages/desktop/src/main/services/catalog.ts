import type { Catalog } from '../../shared/contract'
import { core } from '../core'
import { findEditors } from './editors'

/** Recommended ceiling, in thousands of tokens, when a project does not set `context_budget.warn`. */
const DEFAULT_CONTEXT_LIMIT = 20

/** The framework's own share of what an agent reads before a task, in thousands of tokens: the same sum the repository detail uses. */
function baseTokens(cwd: string): number {
  try {
    const m = core().measureContext(cwd)
    const sum = (m.layers.standing[3]?.tokens ?? 0) + (m.layers.task[0]?.tokens ?? 0) + (m.layers.task[1]?.tokens ?? 0) + (m.layers.task[2]?.tokens ?? 0)
    return Math.round(sum / 100) / 10
  } catch {
    return 0
  }
}

/** What the machine offers: the work modes, the optional modules and what each costs, and the editors installed. */
export async function getCatalog(): Promise<Catalog> {
  const c = core()
  const cwd = c.readRegistry()[0]?.path ?? c.packageRoot
  const modules = [...c.availableModules(cwd).values()].map((m) => ({
    id: m.name,
    // What the snap-in adds to every session: its context files and the listing of its agents and skills.
    tokens: Math.ceil(m.tokens / 100) / 10,
    estimate: m.tokens,
    description: m.description,
    family: m.family,
    agents: m.agents,
    skills: m.skills,
    contextFiles: m.context.length,
  }))
  return {
    editors: (await findEditors()).map(({ id, label }) => ({ id, label })),
    modes: [...c.availableModes(cwd).keys()],
    modules,
    contextLimit: DEFAULT_CONTEXT_LIMIT,
    baseTokens: baseTokens(cwd),
  }
}
