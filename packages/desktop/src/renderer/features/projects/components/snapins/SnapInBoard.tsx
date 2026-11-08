import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type DragEvent } from 'react'
import type { Catalog } from '@shared/contract'
import { cn } from '@/shared/lib/cn'
import { useElementSize } from '@/shared/lib/use-element-size'
import { Button } from '@/shared/ui/primitives/Button'
import { ASSEMBLED, FLIGHT_ARC, FLIGHT_MS, LOOSE, LOOSE_EDGES, PAD, columnsFor, edgesFor, piecePath, type Edges } from '../../lib/jigsaw'
import { FAMILY_LABEL, familyColor, onShelf, snapinDescription, snapinName, snapinParts } from '../../lib/snapin-copy'

type Module = Catalog['modules'][number]

type Props = {
  catalog: Catalog
  /** The snap-ins switched on, in the order they were switched on. */
  value: string[]
  onChange: (ids: string[]) => void
}

/** Space between two loose pieces on the shelf, and around the shelf. */
const SHELF_GAP = 8
const SHELF_INSET = 10
const CORE_COLOR = 'var(--muted)'

const label = 'text-caption font-semibold text-muted'
const DRAG_TYPE = 'text/plain'

function Shape({ w, h, edges }: { w: number; h: number; edges: Edges }) {
  const vw = w + 2 * PAD
  const vh = h + 2 * PAD
  return (
    <svg viewBox={`0 0 ${vw} ${vh}`} width={vw} height={vh} className="block overflow-visible" aria-hidden>
      <path className="piece-shape pointer-events-auto" d={piecePath(w, h, edges)} />
    </svg>
  )
}

/**
 * Snap-ins as a puzzle. The assembly on top is what the project has, as pieces that interlock in a
 * row (and wrap into the next one); the shelf below holds every piece that exists. Taking a piece
 * from the shelf, by click or by drag, makes it fly into place; its spot on the shelf keeps only an
 * outline. Controlled: the order of `value` is the order of the pieces.
 */
export function SnapInBoard({ catalog, value, onChange }: Props) {
  const [ref, { width }] = useElementSize<HTMLDivElement>()
  const columns = columnsFor(width)
  const shelfColumns = Math.max(1, Math.floor((width - 2 * SHELF_INSET + SHELF_GAP) / (LOOSE.w + 2 * PAD + SHELF_GAP)))
  const byId = useMemo(() => new Map(catalog.modules.map((m) => [m.id, m])), [catalog])
  const inProject = value.map((id) => byId.get(id)).filter((m): m is Module => !!m)

  const [selected, setSelected] = useState<string | null>(null)
  const [holding, setHolding] = useState<string | null>(null)
  const [landed, setLanded] = useState<string | null>(null)
  const [over, setOver] = useState(false)
  const from = useRef<DOMRect | null>(null)
  const pieces = useRef(new Map<string, HTMLElement>())

  const add = (id: string, start?: DOMRect) => {
    if (value.includes(id)) return
    from.current = start ?? null
    setHolding(start ? id : null)
    setLanded(start ? null : id)
    setSelected(id)
    onChange([...value, id])
  }
  const remove = (id: string) => {
    setSelected(null)
    onChange(value.filter((v) => v !== id))
  }

  // The piece that was just taken flies from its place on the shelf to its place in the row.
  useLayoutEffect(() => {
    if (!holding) return
    const target = pieces.current.get(holding)
    const start = from.current
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!target || !start || still) {
      setHolding(null)
      setLanded(holding)
      return
    }
    const end = target.getBoundingClientRect()
    const clone = target.cloneNode(true) as HTMLElement
    clone.style.cssText = `position:fixed;left:0;top:0;width:${end.width}px;height:${end.height}px;z-index:60;pointer-events:none;transform-origin:0 0;visibility:visible`
    document.body.appendChild(clone)
    const scale = start.width / end.width
    const flight = clone.animate(
      [
        { transform: `translate(${start.left}px,${start.top}px) scale(${scale})` },
        { transform: `translate(${end.left}px,${end.top - FLIGHT_ARC}px) scale(1.04)`, offset: 0.75 },
        { transform: `translate(${end.left}px,${end.top}px) scale(1)` },
      ],
      { duration: FLIGHT_MS, easing: 'cubic-bezier(0.35, 0.1, 0.25, 1)' },
    )
    flight.onfinish = () => {
      clone.remove()
      setHolding(null)
      setLanded(holding)
    }
    return () => clone.remove()
  }, [holding])

  const drop = (e: DragEvent) => {
    e.preventDefault()
    setOver(false)
    const id = e.dataTransfer.getData(DRAG_TYPE)
    if (byId.has(id)) add(id)
  }

  const count = inProject.length + 1
  const rows = Math.ceil(count / columns)
  const chosen = selected ? byId.get(selected) : undefined

  return (
    <div ref={ref} className="flex flex-col gap-3">
      <div>
        <p className={cn(label, 'mb-2 px-1')}>
          No projeto · {inProject.length} {inProject.length === 1 ? 'snap-in encaixado' : 'snap-ins encaixados'}
        </p>
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setOver(true)
          }}
          onDragLeave={() => setOver(false)}
          onDrop={drop}
          className={cn('surface-control rounded-lg py-3 transition-shadow duration-150', over && 'ring-2 ring-primary')}
        >
          <div className="relative mx-auto" style={{ width: columns * ASSEMBLED.w + 2 * PAD, height: rows * ASSEMBLED.h + 2 * PAD }}>
            {[null, ...inProject].map((m, i) => {
              const row = Math.floor(i / columns)
              const col = i % columns
              const hidden = !!m && holding === m.id
              const style = {
                left: col * ASSEMBLED.w,
                top: row * ASSEMBLED.h,
                width: ASSEMBLED.w + 2 * PAD,
                height: ASSEMBLED.h + 2 * PAD,
                '--piece-color': m ? familyColor(m) : CORE_COLOR,
              } as CSSProperties
              const text = (
                <span className="pointer-events-none absolute flex flex-col justify-center gap-0.5 text-left text-ink" style={{ left: PAD + 30, top: PAD, width: ASSEMBLED.w - 60, height: ASSEMBLED.h }}>
                  <span className="text-heading leading-tight">{m ? snapinName(m) : 'Excalibur'}</span>
                  <span className="text-caption text-muted">{m ? `+${m.estimate} tokens` : 'núcleo'}</span>
                </span>
              )
              const shape = <Shape w={ASSEMBLED.w} h={ASSEMBLED.h} edges={edgesFor(i, count, columns)} />
              if (!m)
                return (
                  <div key="core" className="piece pointer-events-none absolute" style={style}>
                    {shape}
                    {text}
                  </div>
                )
              return (
                <button
                  key={m.id}
                  type="button"
                  ref={(el) => {
                    if (el) pieces.current.set(m.id, el)
                    else pieces.current.delete(m.id)
                  }}
                  data-selected={selected === m.id}
                  aria-pressed={selected === m.id}
                  aria-label={`${snapinName(m)}, no projeto`}
                  onClick={() => setSelected(selected === m.id ? null : m.id)}
                  className={cn('piece pointer-events-none absolute block transition-transform duration-150 hover:-translate-y-0.5 [&_path]:cursor-pointer', hidden && 'invisible', landed === m.id && 'piece-land')}
                  style={style}
                >
                  {shape}
                  {text}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div>
        <p className={cn(label, 'mb-2 px-1')}>Prateleira · peças que existem. Clique ou arraste uma para a montagem.</p>
        <div
          className="grid justify-center rounded-lg bg-page py-2.5"
          style={{ gridTemplateColumns: `repeat(${shelfColumns}, ${LOOSE.w + 2 * PAD}px)`, columnGap: SHELF_GAP, paddingInline: SHELF_INSET }}
        >
          {onShelf(catalog.modules).map((m) => {
            const used = value.includes(m.id)
            const style = { width: LOOSE.w + 2 * PAD, height: LOOSE.h + 2 * PAD, '--piece-color': familyColor(m) } as CSSProperties
            return (
              <div key={m.id} className="relative" style={style}>
                <button
                  type="button"
                  draggable={!used}
                  title={snapinDescription(m)}
                  aria-label={used ? `${snapinName(m)}, no projeto` : `Encaixar ${snapinName(m)}`}
                  onClick={(e) => (used ? setSelected(m.id) : add(m.id, e.currentTarget.querySelector('svg')!.getBoundingClientRect()))}
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_TYPE, m.id)
                    e.dataTransfer.effectAllowed = 'move'
                  }}
                  className={cn('piece block text-left [&_path]:cursor-pointer', used ? 'piece-gone' : 'transition-transform duration-150 hover:-translate-y-0.5 active:[&_path]:cursor-grabbing')}
                >
                  <Shape w={LOOSE.w} h={LOOSE.h} edges={LOOSE_EDGES} />
                  <span className={cn('pointer-events-none absolute flex flex-col justify-center gap-px', used ? 'text-muted' : 'text-ink')} style={{ left: PAD + 26, top: PAD, width: LOOSE.w - 52, height: LOOSE.h }}>
                    <span className="text-caption font-semibold leading-tight">{snapinName(m)}</span>
                    <span className="text-caption text-muted">{used ? 'no projeto' : `+${m.estimate} tokens`}</span>
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {chosen ? (
        <div className="surface-control flex items-start gap-4 rounded-lg px-5 py-4">
          <i className="mt-1.5 size-3 shrink-0 rounded-xs" style={{ background: familyColor(chosen) }} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-heading">
              {snapinName(chosen)} <span className="text-caption font-normal text-muted">· {FAMILY_LABEL[chosen.family ?? ''] ?? 'Outro'}</span>
            </p>
            <p className="mt-1 text-body text-muted">{snapinDescription(chosen)}</p>
            <p className="mt-2 text-caption text-muted">
              {snapinParts(chosen).join(' · ') || 'Sem agentes nem skills'} · <b className="font-semibold text-ink">+{chosen.estimate} tokens</b> em toda sessão, usado ou não
            </p>
          </div>
          {value.includes(chosen.id) ? (
            <Button size="sm" onClick={() => remove(chosen.id)}>
              Devolver à prateleira
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
