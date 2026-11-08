import type { Catalog, RepoDetail } from '@shared/contract'

export type ContextLayers = { framework: number; context: number; profile: number; modules: number; total: number }

/** Format thousands of tokens: 5.0 becomes "5,0 mil". */
export function formatTokens(thousands: number): string {
  return `${thousands.toFixed(1).replace('.', ',')} mil`
}

/**
 * What an agent reads before the first task: the framework, the files read always, and the modules.
 * With no `moduleIds` the modules layer is what the active modules actually wrote into the repository;
 * with a list it is what those modules would cost, for trying a configuration before saving it.
 */
export function contextLayers(detail: RepoDetail | undefined, moduleIds: string[] | null, catalog: Catalog | undefined): ContextLayers {
  const files = detail?.files ?? []
  const always = (keep: (f: RepoDetail['files'][number]) => boolean) => files.filter((f) => f.alwaysRead && keep(f)).reduce((sum, f) => sum + f.tokens, 0)
  const framework = detail?.frameworkTokens ?? 0
  const context = always((f) => f.class === 'context' && f.module === null)
  const profile = always((f) => f.class === 'profile')
  const modules = moduleIds ? moduleIds.reduce((sum, id) => sum + (catalog?.modules.find((m) => m.id === id)?.tokens ?? 0), 0) : always((f) => f.module !== null)
  return { framework, context, profile, modules, total: framework + context + profile + modules }
}
