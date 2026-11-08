import type { RepoDetail } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { useUi } from '@/shared/state/ui-store'
import { FILE_CLASS, FILE_CLASS_ORDER } from '../lib/file-class'
import { FileTree } from './files/FileTree'
import { SidebarHeader } from './SidebarHeader'

type Props = { detail: RepoDetail; selectedFile: string; onSelectFile: (id: string) => void }

/**
 * The files of the repository being read. It only exists on the Arquivos tab, and only one project
 * sidebar is open at a time. Folded, it is a rail of the kinds of file, and any of them opens it.
 * It has no scroll of its own: it grows with its content and the page scrolls.
 */
export function FilesNav({ detail, selectedFile, onSelectFile }: Props) {
  const collapsed = useUi((s) => s.filesNavCollapsed)
  const toggle = useUi((s) => s.toggleFilesNav)
  const kinds = FILE_CLASS_ORDER.filter((c) => detail.files.some((f) => f.class === c))

  return (
    <nav
      aria-label="Arquivos"
      className={cn('surface-card flex shrink-0 flex-col self-start rounded-lg p-2 transition-[width] duration-200 ease-out', collapsed ? 'w-(--files-nav-width-collapsed)' : 'w-(--files-nav-width)')}
    >
      <SidebarHeader title="Arquivos" count={detail.files.length} collapsed={collapsed} onToggle={toggle} shortcut="Ctrl+Shift+E" what="a lista de arquivos" />
      {collapsed ? (
        <div className="flex flex-col items-center gap-1 pb-1 pt-1">
          {kinds.map((c) => {
            const { icon: Icon, label } = FILE_CLASS[c]
            return (
              <button
                key={c}
                type="button"
                title={label}
                aria-label={`${label}: expandir`}
                onClick={toggle}
                className="no-drag flex size-control-sm items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
              >
                <Icon className="size-4" />
              </button>
            )
          })}
        </div>
      ) : (
        <FileTree files={detail.files} selected={selectedFile} onSelect={onSelectFile} className="pt-1" />
      )}
    </nav>
  )
}
