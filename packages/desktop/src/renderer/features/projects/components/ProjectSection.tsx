import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { Repo } from '@shared/contract'
import { ChevronRight, Folder } from '@/shared/ui/icons'
import { Badge } from '@/shared/ui/primitives/Badge'
import { chipStyles } from '@/shared/ui/primitives/Chip'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { snapshotTone } from '../lib/snapshot'
import { KindIcon } from './KindIcon'
import { StackIcons } from './StackIcons'

function RepoChip({ to, repo }: { to: string; repo: Repo }) {
  return (
    <Link to={to} className={chipStyles({ size: 'md' })}>
      <KindIcon kind={repo.kind} className="size-4.5 text-muted" />
      <span>{repo.name}</span>
      {repo.isHub ? <Badge className="bg-transparent px-0 text-muted">hub</Badge> : null}
      <StatusDot tone={snapshotTone(repo.snapshot)} />
    </Link>
  )
}

type Props = {
  name: string
  caption: string
  repos: Repo[]
  /** The project page. Standalone repositories have none, so the header is not a link. */
  to?: string
  repoPath: (repo: Repo) => string
}

/** A project as one card: its header (opens the project) and every repository as a shortcut. */
export function ProjectSection({ name, caption, repos, to, repoPath }: Props) {
  const stack = [...new Set(repos.flatMap((r) => r.stack))]
  const header: ReactNode = (
    <>
      <Folder className="size-5 shrink-0 text-muted" />
      <span className="min-w-0">
        <span className="block truncate text-title">{name}</span>
        <span className="block truncate text-body text-muted">{caption}</span>
      </span>
      <StackIcons stack={stack} max={6} iconClassName="size-4.5" className="ml-auto" />
      {to ? <ChevronRight className="size-4 shrink-0 text-muted opacity-0 transition-[opacity,translate] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" /> : null}
    </>
  )

  return (
    <section className="surface-card rounded-lg p-2">
      {to ? (
        <Link to={to} className="group no-drag flex items-center gap-4 rounded-md px-4 py-3.5 transition-colors duration-150 hover:bg-hover">
          {header}
        </Link>
      ) : (
        <div className="flex items-center gap-4 px-4 py-3.5">{header}</div>
      )}
      <div className="flex flex-wrap gap-2 px-4 pb-4 pt-1">
        {repos.map((r) => (
          <RepoChip key={r.id} to={repoPath(r)} repo={r} />
        ))}
      </div>
    </section>
  )
}
