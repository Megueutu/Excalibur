import { api } from '@/shared/api'
import { cn } from '@/shared/lib/cn'
import { openPath } from '@/shared/lib/use-open-path'
import { useUi } from '@/shared/state/ui-store'
import { Button } from '@/shared/ui/primitives/Button'
import { ChevronDown, FolderOpen } from '@/shared/ui/icons'
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '@/shared/ui/overlays/Menu'
import { EDITOR_ICON } from '../lib/editors'
import { useCatalog } from '../hooks'

const part = 'no-drag flex h-full items-center transition-colors duration-150 hover:bg-hover'

/**
 * "Open in editor" as a split button: the main part opens the path in the editor you used last,
 * shown by its icon, and the arrow beside it lists the others, and the file manager.
 */
export function OpenInEditor({ path }: { path: string }) {
  const { data: catalog } = useCatalog()
  const editor = useUi((s) => s.editor)
  const setEditor = useUi((s) => s.setEditor)
  const editors = catalog?.editors ?? []
  const current = editors.find((e) => e.id === editor) ?? editors[0]
  const Icon = current ? EDITOR_ICON[current.id] : undefined
  const open = (id: string) => void api.openInEditor(id, path)

  if (!editors.length) {
    return (
      <Button size="sm" onClick={() => openPath(path)}>
        <FolderOpen className="size-3.5" /> Mostrar na pasta
      </Button>
    )
  }

  return (
    <div role="group" className="inline-flex h-control-sm shrink-0 items-stretch overflow-hidden rounded-full bg-field">
      <button type="button" onClick={() => current && open(current.id)} className={cn(part, 'gap-2 pl-3.5 pr-3 text-caption font-semibold')}>
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        Abrir no editor
      </button>
      <span aria-hidden className="my-2 w-px bg-selected" />
      <Menu>
        <MenuTrigger asChild>
          <button type="button" aria-label="Escolher o editor" className={cn(part, 'px-2.5')}>
            <ChevronDown className="size-3.5 text-muted" />
          </button>
        </MenuTrigger>
        <MenuContent>
          {editors.map((e) => {
            const EIcon = EDITOR_ICON[e.id]
            return (
              <MenuItem
                key={e.id}
                icon={EIcon ? <EIcon className="size-4" /> : null}
                checked={e.id === current?.id}
                onSelect={() => {
                  setEditor(e.id)
                  open(e.id)
                }}
              >
                {e.label}
              </MenuItem>
            )
          })}
          <MenuSeparator />
          <MenuItem icon={<FolderOpen className="size-4" />} onSelect={() => openPath(path)}>
            Mostrar na pasta
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}
