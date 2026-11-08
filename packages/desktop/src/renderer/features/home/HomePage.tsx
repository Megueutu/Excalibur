import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import type { Project, Repo } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/button'
import { StatusDot } from '@/shared/ui/badge'
import { AddFolder, Folder, Import, Tune } from '@/shared/ui/icons'
import { PageHeader } from '@/shared/ui/page'
import { StackIcons } from '@/shared/ui/repo-icons'
import { useProjects } from '@/features/projects/hooks'

const PROTOTYPE_NOTE = 'Protótipo: nada é gravado'

function ActionCard({ icon, title, text, onClick }: { icon: React.ReactNode; title: string; text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="no-drag flex flex-col items-start gap-1 rounded-lg bg-panel p-6 text-left hover:bg-panel-2">
      <span className="mb-3 grid size-11 place-items-center rounded-full bg-bg">{icon}</span>
      <span className="text-[17px] font-semibold tracking-[-0.022em]">{title}</span>
      <span className="text-sm text-muted">{text}</span>
    </button>
  )
}

function stackOf(repos: Repo[]): string[] {
  return [...new Set(repos.flatMap((r) => r.stack))]
}

function ProjectCard({ to, name, repos, caption }: { to: string; name: string; repos: Repo[]; caption: string }) {
  const stale = repos.filter((r) => r.snapshot === 'stale').length
  return (
    <Link to={to} className="no-drag flex flex-col gap-3 rounded-lg bg-panel p-5 hover:bg-panel-2">
      <div className="flex items-center gap-3">
        <Folder size={20} className="shrink-0 text-muted" />
        <span className="truncate text-[15px] font-semibold">{name}</span>
        <StackIcons stack={stackOf(repos)} max={5} size={18} className="ml-auto" />
      </div>
      <p className="flex items-center gap-2 text-sm text-muted">
        {caption}
        {stale ? (
          <>
            <StatusDot />
            {stale} pede atenção
          </>
        ) : null}
      </p>
    </Link>
  )
}

export function HomePage() {
  const openDialog = useUi((s) => s.openDialog)
  const { data } = useProjects()
  const { data: attention = [] } = useQuery({ queryKey: ['attention'], queryFn: () => api.listAttention() })
  const projects: Project[] = data?.projects ?? []

  return (
    <>
      <PageHeader title="O que você quer fazer?" subtitle="O Excalibur organiza repositórios em projetos." />
      <div className="min-h-0 flex-1 overflow-auto px-8 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <ActionCard icon={<AddFolder size={22} />} title="Criar projeto" text="Comece do zero, com git e o Excalibur prontos." onClick={() => openDialog('create-project')} />
          <ActionCard icon={<Import size={22} />} title="Incorporar projeto" text="Traga pastas e repositórios que você já tem." onClick={() => openDialog('incorporate-project')} />
          <ActionCard
            icon={<Tune size={22} />}
            title="Gerenciar projeto"
            text="Abra um projeto para ver e ajustar os repositórios."
            onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })}
          />
        </div>

        <h2 id="projects" className="mb-3 mt-10 px-1 text-xs font-semibold text-muted">
          Seus projetos
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} to={`/projects/${p.id}`} name={p.name} repos={p.repos} caption={`${p.repos.length} repositórios`} />
          ))}
          {data?.standalone.length ? (
            <ProjectCard to={`/projects/standalone/repos/${data.standalone[0]!.id}`} name="Avulsos" repos={data.standalone} caption={`${data.standalone.length} repositórios sem projeto`} />
          ) : null}
        </div>

        {attention.length ? (
          <>
            <h2 className="mb-3 mt-10 px-1 text-xs font-semibold text-muted">Pedem atenção</h2>
            <ul className="space-y-2">
              {attention.map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-lg bg-panel py-2 pl-5 pr-3">
                  <StatusDot />
                  <span className="flex-1 text-sm">{item.text}</span>
                  <Button size="sm" className="bg-bg hover:bg-panel-2" disabled title={PROTOTYPE_NOTE}>
                    {item.action}
                  </Button>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </>
  )
}
