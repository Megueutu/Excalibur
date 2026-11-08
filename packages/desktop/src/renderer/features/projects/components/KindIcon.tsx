import type { RepoKind } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { REPO_KIND } from '../lib/repo-kind'

/** The symbol for what a repository is: GitHub, local git, or a plain folder. */
export function KindIcon({ kind, className }: { kind: RepoKind; className?: string }) {
  const { icon: Icon, description } = REPO_KIND[kind]
  return <Icon role="img" aria-label={description} className={cn('size-4 shrink-0', className)} />
}
