import { useState } from 'react'
import type { Project, RepoDetail } from '@shared/contract'
import { Graph, List } from '@/shared/ui/icons'
import { Segmented } from '@/shared/ui/primitives/Segmented'
import { useCatalog } from '../../hooks'
import { ContextBudget } from './ContextBudget'
import { FileGraph } from './FileGraph'
import { FileReader } from './FileReader'

type View = 'reader' | 'graph'

const GRAPH_HEIGHT = 420

type Props = { repoId: string; project: Project; detail: RepoDetail; file: string; onFile: (id: string) => void }

/**
 * What the repository holds that an agent can read. The file list and its filter live in the files
 * sidebar; this tab reads the selected file, or shows how all the files link to each other.
 */
export function FilesTab({ repoId, project, detail, file, onFile }: Props) {
  const { data: catalog } = useCatalog()
  const [view, setView] = useState<View>('reader')

  if (!detail.files.length || !file) return <p className="text-body text-muted">Este repositório ainda não tem arquivos de contexto.</p>

  return (
    <div className="flex flex-col gap-4">
      <ContextBudget detail={detail} project={project} catalog={catalog} />

      <div className="flex items-center">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: 'reader', label: 'Leitor', icon: <List className="size-3.5" /> },
            { value: 'graph', label: 'Grafo', icon: <Graph className="size-3.5" /> },
          ]}
        />
      </div>

      {view === 'graph' ? <FileGraph detail={detail} selected={file} onSelect={onFile} height={GRAPH_HEIGHT} /> : null}
      <FileReader repoId={repoId} detail={detail} fileId={file} onOpen={onFile} onShowInGraph={view === 'reader' ? () => setView('graph') : undefined} />
    </div>
  )
}
