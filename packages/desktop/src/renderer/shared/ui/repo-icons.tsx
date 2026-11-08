import type { RepoKind } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { BRANDS } from './brand-icons'
import { Folder } from './icons'

/** Human names for what a repository is. One symbol per kind, so the type reads at a glance. */
export const KIND_LABEL: Record<RepoKind, string> = {
  github: 'Git com remoto no GitHub',
  git: 'Git local, sem remoto',
  folder: 'Pasta sem git',
}

function Brand({ slug, size, className }: { slug: string; size: number; className?: string }) {
  const brand = BRANDS[slug]
  if (!brand) return null
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} role="img" className={cn('shrink-0', className)} fill="currentColor" stroke="currentColor" strokeWidth={0.5} strokeLinejoin="round">
      <title>{brand.title}</title>
      <path d={brand.path} />
    </svg>
  )
}

export function KindIcon({ kind, size = 16, className }: { kind: RepoKind; size?: number; className?: string }) {
  if (kind === 'folder') return <Folder size={size} className={className} aria-label={KIND_LABEL.folder} />
  return <Brand slug={kind === 'github' ? 'github' : 'git'} size={size} className={className} />
}

export function StackIcon({ tech, size = 16, className }: { tech: string; size?: number; className?: string }) {
  return <Brand slug={tech} size={size} className={className} />
}

/** A short row of stack icons, all one color. Unknown technologies are skipped. */
export function StackIcons({ stack, max = 4, size = 16, className }: { stack: string[]; max?: number; size?: number; className?: string }) {
  const known = stack.filter((t) => BRANDS[t]).slice(0, max)
  if (!known.length) return null
  return (
    <span className={cn('inline-flex items-center gap-2 text-muted', className)}>
      {known.map((t) => (
        <StackIcon key={t} tech={t} size={size} />
      ))}
    </span>
  )
}

export function brandTitle(tech: string): string {
  return BRANDS[tech]?.title ?? tech
}
