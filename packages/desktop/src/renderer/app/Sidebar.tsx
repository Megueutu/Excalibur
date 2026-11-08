import { useState, type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import type { Repo } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { selectSidebarCollapsed, useUi } from '@/shared/state/ui-store'
import { ChevronDown, ChevronRight, Folder, House, Plus, Settings, User } from '@/shared/ui/icons'
import { StatusDot } from '@/shared/ui/primitives/StatusDot'
import { KindIcon } from '@/features/projects/components/KindIcon'
import { StackIcon } from '@/features/projects/components/StackIcons'
import { useProjects } from '@/features/projects/hooks'
import { needsSync } from '@/features/projects/lib/snapshot'

const row = 'no-drag relative flex h-9 items-center rounded-md text-body transition-colors duration-150 hover:bg-hover'
const active = 'bg-selected font-semibold'
const groupLabel = 'mb-1 mt-6 pl-3 text-caption font-semibold text-muted'

type RowProps = {
  label: string
  icon: ReactNode
  collapsed: boolean
  /** A state dot, shown after the label, or on the icon corner when collapsed. */
  dot?: boolean
  /** Extra content after the label (expanded only). */
  trailing?: ReactNode
  className?: string
}

function RowBody({ label, icon, collapsed, dot, trailing }: RowProps) {
  if (collapsed) {
    return (
      <>
        {icon}
        {dot ? <StatusDot className="absolute right-2 top-1.5" /> : null}
      </>
    )
  }
  return (
    <>
      {icon}
      <span className="min-w-0 truncate">{label}</span>
      {trailing}
      {dot ? <StatusDot className="ml-auto" /> : null}
    </>
  )
}

const layout = (collapsed: boolean) => (collapsed ? 'justify-center' : 'gap-2.5 px-3')

function LinkRow({ to, end = true, ...p }: RowProps & { to: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} title={p.collapsed ? p.label : undefined} aria-label={p.label} className={({ isActive }) => cn(row, layout(p.collapsed), p.className, isActive && active)}>
      <RowBody {...p} />
    </NavLink>
  )
}

function ButtonRow({ onClick, ...p }: RowProps & { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} title={p.collapsed ? p.label : undefined} aria-label={p.label} className={cn(row, layout(p.collapsed), 'w-full text-left', p.className)}>
      <RowBody {...p} />
    </button>
  )
}

/** A repository row: what it is, its main stack, then its name. Only the kind shows when collapsed. */
function RepoRow({ to, repo, collapsed, indent }: { to: string; repo: Repo; collapsed: boolean; indent?: boolean }) {
  const icon = (
    <span className="flex shrink-0 items-center gap-1.5 text-muted">
      <KindIcon kind={repo.kind} />
      {!collapsed && repo.stack[0] ? <StackIcon tech={repo.stack[0]} className="size-3.5" /> : null}
    </span>
  )
  return (
    <LinkRow
      to={to}
      end={false}
      label={repo.name}
      icon={icon}
      collapsed={collapsed}
      dot={needsSync(repo.snapshot)}
      trailing={repo.isHub ? <span className="ml-auto text-caption font-normal text-muted">hub</span> : null}
      className={cn(!collapsed && indent && 'ml-8')}
    />
  )
}

export function Sidebar() {
  const { data } = useProjects()
  const collapsed = useUi(selectSidebarCollapsed)
  const openDialog = useUi((s) => s.openDialog)
  const [open, setOpen] = useState<Record<string, boolean>>({ inter: true })

  return (
    <nav className="flex h-full min-h-0 flex-col gap-0.5 overflow-y-auto overflow-x-hidden px-3 pb-3 pt-2">
      <LinkRow to="/" label="Início" icon={<House className="size-4 shrink-0" />} collapsed={collapsed} />
      <LinkRow to="/profile" label="Perfil do usuário" icon={<User className="size-4 shrink-0" />} collapsed={collapsed} dot />
      <ButtonRow onClick={() => openDialog('settings')} label="Configurações" icon={<Settings className="size-4 shrink-0" />} collapsed={collapsed} />

      {collapsed ? (
        <div className="mt-4 flex flex-col gap-0.5">
          <ButtonRow onClick={() => openDialog('create-project')} label="Criar projeto" icon={<Plus className="size-4 shrink-0" />} collapsed />
        </div>
      ) : (
        <div className={cn(groupLabel, 'flex items-center justify-between pr-1')}>
          Projetos
          <button
            type="button"
            aria-label="Criar projeto"
            onClick={() => openDialog('create-project')}
            className="no-drag rounded-full p-1.5 transition-colors duration-150 hover:bg-hover hover:text-ink"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      )}

      {data?.projects.map((project) => (
        <div key={project.id}>
          <div className="flex items-center">
            {collapsed ? null : (
              <button
                type="button"
                aria-label={open[project.id] ? 'Recolher' : 'Expandir'}
                onClick={() => setOpen((o) => ({ ...o, [project.id]: !o[project.id] }))}
                className="no-drag rounded-full p-1.5 text-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
              >
                {open[project.id] ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              </button>
            )}
            <div className="min-w-0 flex-1">
              <LinkRow to={`/projects/${project.id}`} label={project.name} icon={<Folder className="size-4 shrink-0" />} collapsed={collapsed} />
            </div>
          </div>
          {!collapsed && open[project.id] ? project.repos.map((repo) => <RepoRow key={repo.id} to={`/projects/${project.id}/repos/${repo.id}`} repo={repo} collapsed={false} indent />) : null}
        </div>
      ))}

      {collapsed ? <div className="mt-4" /> : <div className={groupLabel}>Avulsos</div>}
      {data?.standalone.map((repo) => <RepoRow key={repo.id} to={`/projects/standalone/repos/${repo.id}`} repo={repo} collapsed={collapsed} />)}
    </nav>
  )
}
