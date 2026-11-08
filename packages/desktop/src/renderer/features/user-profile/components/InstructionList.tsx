import type { ProfileFile } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { Plus } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { instructionTitle, isGlobal, whenText } from '../lib/format'

const heading = 'mb-1 mt-4 px-3 text-caption font-semibold text-muted first:mt-1'

type Props = {
  files: ProfileFile[]
  selected: string
  onSelect: (rel: string) => void
  onNew: () => void
}

function Row({ file, on, onSelect }: { file: ProfileFile; on: boolean; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} aria-current={on} className={cn('block w-full rounded-md px-3 py-2.5 text-left transition-colors duration-150 hover:bg-hover', on && 'bg-selected')}>
      <span className="block truncate text-heading">{instructionTitle(file)}</span>
      <span className="mt-0.5 block truncate text-caption text-muted">{isGlobal(file) ? whenText(file) : `${file.scope} · ${whenText(file)}`}</span>
    </button>
  )
}

/** The instructions, in two groups: the ones that apply everywhere, and the ones that belong to a profile. */
export function InstructionList({ files, selected, onSelect, onNew }: Props) {
  const everywhere = files.filter(isGlobal)
  const some = files.filter((f) => !isGlobal(f))
  return (
    <div className="surface-card rounded-lg p-2">
      <p className={heading}>Valem sempre</p>
      {everywhere.length ? everywhere.map((f) => <Row key={f.rel} file={f} on={f.rel === selected} onSelect={() => onSelect(f.rel)} />) : <p className="px-3 py-2 text-caption text-muted">Nenhuma ainda.</p>}
      {some.length ? (
        <>
          <p className={heading}>Só em alguns projetos</p>
          {some.map((f) => (
            <Row key={f.rel} file={f} on={f.rel === selected} onSelect={() => onSelect(f.rel)} />
          ))}
        </>
      ) : null}
      <div className="px-2 pb-1 pt-3">
        <Button size="sm" onClick={onNew}>
          <Plus className="size-3.5" /> Nova instrução
        </Button>
      </div>
    </div>
  )
}
