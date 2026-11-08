import { cn } from '@/shared/lib/cn'
import { SidebarToggle } from '@/shared/ui/icons'

type Props = {
  title: string
  collapsed: boolean
  onToggle: () => void
  shortcut: string
  /** What the sidebar holds, for the button's label: "a lista de repositórios". */
  what: string
  count?: number
}

/** The top row of a project sidebar: its title and the fold button, in the same place whether open or folded. */
export function SidebarHeader({ title, collapsed, onToggle, shortcut, what, count }: Props) {
  return (
    <header className={cn('flex h-control-sm shrink-0 items-center', collapsed ? 'justify-center' : 'pl-3')}>
      {collapsed ? null : (
        <h2 className="flex flex-1 items-baseline gap-2 text-caption font-semibold text-muted">
          {title}
          {count !== undefined ? <span className="font-normal">{count}</span> : null}
        </h2>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-label={`${collapsed ? 'Expandir' : 'Recolher'} ${what}`}
        title={`${collapsed ? 'Expandir' : 'Recolher'} (${shortcut})`}
        className="no-drag flex size-control-sm items-center justify-center rounded-full text-muted transition-colors duration-150 hover:bg-hover hover:text-ink"
      >
        <SidebarToggle className="size-4" />
      </button>
    </header>
  )
}
