import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import type { Repo } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { StatusDot } from '@/shared/ui/badge'
import { ChevronDown, ChevronRight, Folder, House, Plus, Settings, User } from '@/shared/ui/icons'
import { KindIcon, StackIcon } from '@/shared/ui/repo-icons'
import { useProjects } from '@/features/projects/hooks'

const item = 'no-drag flex h-9 items-center gap-2.5 rounded-md px-3 text-sm hover:bg-panel-2'
const active = 'bg-panel-2 font-semibold'

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => cn(item, isActive && active)}>
      {children}
    </NavLink>
  )
}

/** A repository row: what it is, its main stack, then its name. */
function RepoItem({ to, repo, className }: { to: string; repo: Repo; className?: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn(item, className, isActive && active)}>
      <span className="flex shrink-0 items-center gap-1.5 text-muted">
        <KindIcon kind={repo.kind} size={16} />
        {repo.stack[0] ? <StackIcon tech={repo.stack[0]} size={14} /> : null}
      </span>
      <span className="truncate">{repo.name}</span>
      {repo.isHub ? <span className="ml-auto text-[11px] font-normal text-muted">hub</span> : null}
      {repo.snapshot === 'stale' ? <StatusDot className="ml-auto" /> : null}
    </NavLink>
  )
}

export function Sidebar() {
  const { data } = useProjects()
  const openDialog = useUi((s) => s.openDialog)
  const [open, setOpen] = useState<Record<string, boolean>>({ inter: true })

  return (
    <nav className="flex h-full min-h-0 flex-col gap-0.5 overflow-auto px-3 pb-3 pt-2">
      <Item to="/">
        <House size={16} /> Início
      </Item>
      <Item to="/profile">
        <User size={16} /> Perfil do usuário <StatusDot className="ml-auto" />
      </Item>
      <button type="button" onClick={() => openDialog('settings')} className={cn(item, 'w-full text-left')}>
        <Settings size={16} /> Configurações
      </button>

      <div className="mb-1 mt-6 flex items-center justify-between pl-3 pr-1 text-xs font-semibold text-muted">
        Projetos
        <button type="button" aria-label="Criar projeto" onClick={() => openDialog('create-project')} className="no-drag rounded-full p-1.5 hover:bg-panel-2 hover:text-text">
          <Plus size={14} />
        </button>
      </div>

      {data?.projects.map((project) => (
        <div key={project.id}>
          <div className="flex items-center">
            <button
              type="button"
              aria-label={open[project.id] ? 'Recolher' : 'Expandir'}
              onClick={() => setOpen((o) => ({ ...o, [project.id]: !o[project.id] }))}
              className="no-drag rounded-full p-1.5 text-muted hover:bg-panel-2 hover:text-text"
            >
              {open[project.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <NavLink to={`/projects/${project.id}`} end className={({ isActive }) => cn(item, 'flex-1', isActive && active)}>
              <Folder size={16} /> {project.name}
            </NavLink>
          </div>
          {open[project.id] ? project.repos.map((repo) => <RepoItem key={repo.id} to={`/projects/${project.id}/repos/${repo.id}`} repo={repo} className="ml-8" />) : null}
        </div>
      ))}

      <div className="mb-1 mt-6 pl-3 text-xs font-semibold text-muted">Avulsos</div>
      {data?.standalone.map((repo) => <RepoItem key={repo.id} to={`/projects/standalone/repos/${repo.id}`} repo={repo} />)}
    </nav>
  )
}
