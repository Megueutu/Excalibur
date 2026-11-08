import type { ReactNode } from 'react'
import type { RepoFile } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { ChevronRight, FileText } from '@/shared/ui/icons'
import { Disclosure } from '@/shared/ui/primitives/Disclosure'
import { useUi } from '@/shared/state/ui-store'
import { formatTokens } from '../../lib/context'
import { FILE_CLASS, FILE_CLASS_ORDER, fileName } from '../../lib/file-class'

type Props = { files: RepoFile[]; selected: string; onSelect: (id: string) => void; className?: string }

/** A header that folds the group under it. The arrow turns when it is open. */
function GroupHeader({ open, onToggle, className, children }: { open: boolean; onToggle: () => void; className?: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onToggle}
      className={cn('no-drag flex w-full items-center gap-2 rounded-sm text-left text-caption font-semibold text-muted transition-colors duration-150 hover:bg-hover hover:text-ink', className)}
    >
      <ChevronRight className={cn('size-3.5 shrink-0 transition-transform duration-200', open && 'rotate-90')} />
      {children}
    </button>
  )
}

/**
 * The repository's files, grouped by kind and, for specs, by task. Every group folds. Files show
 * their real names, and what each costs the agent when read. It has no scroll of its own: the page scrolls.
 */
export function FileTree({ files, selected, onSelect, className }: Props) {
  const collapsed = useUi((s) => s.collapsedFileGroups)
  const toggle = useUi((s) => s.toggleFileGroup)
  const isOpen = (key: string) => !collapsed.includes(key)

  const row = (f: RepoFile, indent: string) => (
    <button
      key={f.id}
      type="button"
      title={f.title}
      onClick={() => onSelect(f.id)}
      className={cn('flex h-8 w-full items-center gap-2 rounded-sm pr-2 text-left text-body transition-colors duration-150 hover:bg-hover', indent, f.id === selected && 'bg-selected font-semibold')}
    >
      <FileText className="size-3.5 shrink-0 opacity-50" />
      <span className="min-w-0 flex-1 truncate">{fileName(f.id)}</span>
      <span className="shrink-0 text-caption font-normal text-muted">{formatTokens(f.tokens)}</span>
    </button>
  )

  return (
    <nav aria-label="Árvore de arquivos" className={cn('flex flex-col gap-1', className)}>
      {FILE_CLASS_ORDER.map((cls) => {
        const inClass = files.filter((f) => f.class === cls)
        if (!inClass.length) return null
        const { icon: Icon, label } = FILE_CLASS[cls]
        const groups = [...new Set(inClass.map((f) => f.group ?? ''))]
        const always = inClass.every((f) => f.alwaysRead)
        return (
          <section key={cls}>
            <GroupHeader open={isOpen(cls)} onToggle={() => toggle(cls)} className="h-control-sm px-2">
              <Icon className="size-4 shrink-0" />
              <span className="truncate">{label}</span>
              <span className="ml-auto shrink-0 font-normal">{always ? 'sempre lido' : inClass.length}</span>
            </GroupHeader>
            <Disclosure open={isOpen(cls)}>
              {groups.map((g) => {
                const key = `${cls}/${g}`
                const rows = inClass.filter((f) => (f.group ?? '') === g)
                if (!g) return rows.map((f) => row(f, 'pl-9'))
                return (
                  <div key={key}>
                    <GroupHeader open={isOpen(key)} onToggle={() => toggle(key)} className="h-8 pl-6 pr-2">
                      <span className="truncate">{g}</span>
                      <span className="ml-auto shrink-0 font-normal">{rows.length}</span>
                    </GroupHeader>
                    <Disclosure open={isOpen(key)}>{rows.map((f) => row(f, 'pl-12'))}</Disclosure>
                  </div>
                )
              })}
            </Disclosure>
          </section>
        )
      })}
    </nav>
  )
}
