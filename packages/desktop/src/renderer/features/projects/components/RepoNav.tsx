import { Link } from 'react-router-dom'
import type { Project, RepoDetail } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { Folder } from '@/shared/ui/icons'
import { Pill } from '@/shared/ui/primitives/Pill'
import { SidebarHeader } from './SidebarHeader'
import { KindIcon } from './KindIcon'

type Props = {
  project: Project
  details: Record<string, RepoDetail | undefined>
  selectedRepo: string | undefined
}

const row = 'no-drag relative flex h-10 items-center rounded-md text-body transition-colors duration-150 hover:bg-hover'
const layout = (collapsed: boolean) => (collapsed ? 'justify-center' : 'gap-3 px-3')

/** The project's repositories. It folds to an icon rail, and only one of the two project sidebars is open at a time. */
export function RepoNav({ project, details, selectedRepo }: Props) {
  const collapsed = useUi((s) => s.repoNavCollapsed)
  const toggle = useUi((s) => s.toggleRepoNav)
  const base = `/projects/${project.id}`
  const attention = project.repos.reduce((n, r) => n + (details[r.id]?.health.length ?? 0), 0)

  return (
    <nav
      aria-label="Repositórios"
      className={cn(
        'surface-card flex shrink-0 flex-col self-start rounded-lg p-2 transition-[width] duration-200 ease-out',
        collapsed ? 'w-(--repo-nav-width-collapsed)' : 'w-(--repo-nav-width)',
      )}
    >
      <SidebarHeader title="Repositórios" collapsed={collapsed} onToggle={toggle} shortcut="Ctrl+Shift+B" what="a lista de repositórios" />

      <Link to={base} title={collapsed ? 'Visão geral' : undefined} aria-label="Visão geral" className={cn(row, layout(collapsed), !selectedRepo && 'bg-selected font-semibold')}>
        <Folder className="size-4.5 shrink-0" />
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1 truncate">Visão geral</span>
            {attention ? <Pill tone="warn">{attention}</Pill> : null}
          </>
        )}
      </Link>
      {project.repos.map((r) => {
        const issues = details[r.id]?.health.length ?? 0
        return (
          <Link key={r.id} to={`${base}/repos/${r.id}`} title={collapsed ? r.name : undefined} aria-label={r.name} className={cn(row, layout(collapsed), selectedRepo === r.id && 'bg-selected font-semibold')}>
            <KindIcon kind={r.kind} className="size-4.5 text-muted" />
            {collapsed ? (
              issues ? <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-warn" /> : null
            ) : (
              <>
                <span className="min-w-0 flex-1 truncate">{r.name}</span>
                {issues ? <Pill tone="warn">{issues}</Pill> : null}
              </>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
