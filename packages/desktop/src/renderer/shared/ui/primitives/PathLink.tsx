import { cn } from '@/shared/lib/cn'

/**
 * A path, a file name or a hash. It is not a chip: it is code, so it keeps its own shape (nearly square
 * corners) and the mono font, and it never sits in a row of chips. It is always clickable; the caller decides where it goes.
 */
export function PathLink({ path, onOpen, className }: { path: string; onOpen: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="Abrir"
      className={cn(
        'no-drag inline-flex h-chip max-w-full min-w-0 items-center rounded-xs bg-field px-2 text-left font-mono text-caption transition-colors duration-150 hover:bg-hover hover:text-primary',
        className,
      )}
    >
      <span className="truncate">{path}</span>
    </button>
  )
}
