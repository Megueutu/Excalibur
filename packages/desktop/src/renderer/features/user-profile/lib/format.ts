import type { ProfileFile } from '@shared/contract'

const AGO = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400_000],
  ['hour', 3_600_000],
  ['minute', 60_000],
]

/** "há 2 dias", "ontem", "há 5 minutos": how long ago an ISO date was. */
export function ago(iso: string, now = Date.now()): string {
  const diff = new Date(iso).getTime() - now
  for (const [unit, ms] of UNITS) if (Math.abs(diff) >= ms) return AGO.format(Math.round(diff / ms), unit)
  return 'agora há pouco'
}

/** The file name without folders and extension, as words: "writing-style.md" becomes "writing style". */
export function fileTitle(rel: string): string {
  return (rel.split('/').pop() ?? rel).replace(/\.md$/, '').replace(/[-_]+/g, ' ')
}

/** What to call an instruction: its title (the description), or else its file name. */
export const instructionTitle = (f: ProfileFile) => f.description || fileTitle(f.rel)

/** When the agent reads it, in a few words. "always" and an empty value both mean every time. */
export const whenText = (f: ProfileFile) => (f.when.toLowerCase() === 'always' ? 'sempre' : f.when)

/** The ones that apply to every project, and the ones that belong to a named profile. */
export const isGlobal = (f: ProfileFile) => f.scope === 'global'
