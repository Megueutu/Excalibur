import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { StatusDot } from '@/shared/ui/badge'
import { ChevronDown, ChevronRight, Folder, House, Plus, Settings, User } from '@/shared/ui/icons'
import { useProjects } from '@/features/projects/hooks'

const item = 'no-drag flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted hover:bg-panel-2 hover:text-text'
const active = 'bg-panel-2 text-text font-medium'

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink to={to} end className={({ isActive }) => cn(item, isActive && active)}>
      {children}
    </NavLink>
  )
}

export function Sidebar() {
  const { data } = useProjects()
  const openDialog = useUi((s) => s.openDialog)
  const [open, setOpen] = useState<Record<string, boolean>>({ inter: true })

  return (
    <nav className="flex h-full flex-col gap-0.5 border-r border-border bg-panel px-2 py-3">
      <Item to="/">
        <House size={16} /> Início
      </Item>
      <Item to="/profile">
        <User size={16} /> Perfil do usuário <StatusDot className="ml-auto" />
      </Item>

      <div className="mt-4 flex items-center justify-between px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
        Projetos
        <button type="button" aria-label="Adicionar pasta" onClick={() => openDialog('add-project')} className="no-drag rounded p-0.5 hover:bg-panel-2 hover:text-text">
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
              className="no-drag rounded p-1 text-muted hover:text-text"
            >
              {open[project.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <NavLink to={`/projects/${project.id}`} end className={({ isActive }) => cn(item, 'flex-1', isActive && active)}>
              <Folder size={16} /> {project.name}
            </NavLink>
          </div>
          {open[project.id]
            ? project.repos.map((repo) => (
                <NavLink
                  key={repo.id}
                  to={`/projects/${project.id}/repos/${repo.id}`}
                  className={({ isActive }) => cn(item, 'ml-6', isActive && active)}
                >
                  <span className="truncate">{repo.name}</span>
                  {repo.isHub ? <span className="ml-auto text-[10px] text-muted">hub</span> : null}
                  {repo.snapshot === 'stale' ? <StatusDot className="ml-auto" /> : null}
                </NavLink>
              ))
            : null}
        </div>
      ))}

      <div className="mt-4 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Avulsos</div>
      {data?.standalone.map((repo) => (
        <Item key={repo.id} to={`/projects/standalone/repos/${repo.id}`}>
          <Folder size={16} /> {repo.name}
        </Item>
      ))}

      <button type="button" onClick={() => openDialog('settings')} className={cn(item, 'mt-auto')}>
        <Settings size={16} /> Configurações
      </button>
    </nav>
  )
}
