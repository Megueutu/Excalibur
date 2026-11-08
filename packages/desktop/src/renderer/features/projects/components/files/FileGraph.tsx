import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d'
import type { RepoDetail } from '@shared/contract'
import { useCssColors } from '@/shared/lib/use-css-colors'
import { useElementSize } from '@/shared/lib/use-element-size'
import { FILE_CLASS, fileName, type GraphShape } from '../../lib/file-class'
import { GRAPH } from '../../lib/graph'

type GNode = { id: string; title: string; shape: GraphShape; x?: number; y?: number }
type GLink = { source: string | GNode; target: string | GNode }

const idOf = (end: string | GNode) => (typeof end === 'string' ? end : end.id)

/** Draw one node's shape on the canvas. All five kinds are the same size and one color. */
function drawShape(ctx: CanvasRenderingContext2D, shape: GraphShape, x: number, y: number, r: number, hole: string) {
  ctx.beginPath()
  switch (shape) {
    case 'square':
      ctx.roundRect(x - r, y - r, r * 2, r * 2, r * 0.35)
      break
    case 'diamond':
      ctx.moveTo(x, y - r * 1.3)
      ctx.lineTo(x + r * 1.3, y)
      ctx.lineTo(x, y + r * 1.3)
      ctx.lineTo(x - r * 1.3, y)
      ctx.closePath()
      break
    case 'triangle':
      ctx.moveTo(x, y - r * 1.25)
      ctx.lineTo(x + r * 1.2, y + r * 0.9)
      ctx.lineTo(x - r * 1.2, y + r * 0.9)
      ctx.closePath()
      break
    default:
      ctx.arc(x, y, r, 0, Math.PI * 2)
  }
  ctx.fill()
  if (shape === 'ring') {
    ctx.beginPath()
    ctx.arc(x, y, r * 0.42, 0, Math.PI * 2)
    ctx.fillStyle = hole
    ctx.fill()
  }
}

type Props = { detail: RepoDetail; selected: string; onSelect: (id: string) => void; height: number }

/**
 * The repository's files as a graph. The layout, zoom, pan and drag come from react-force-graph-2d
 * (d3-force on a canvas); this component only decides how a node looks and what hovering does.
 */
export function FileGraph({ detail, selected, onSelect, height }: Props) {
  const [box, { width }] = useElementSize<HTMLDivElement>()
  const fg = useRef<ForceGraphMethods<GNode, GLink>>(undefined)
  const colors = useCssColors({ muted: '--muted', ink: '--ink', primary: '--primary', hover: '--hover', control: '--control' })
  const [hover, setHover] = useState<string | null>(null)

  const data = useMemo(() => {
    const shown = detail.files
    const ids = new Set(shown.map((f) => f.id))
    return {
      nodes: shown.map<GNode>((f) => ({ id: f.id, title: f.group ? `${f.group} · ${fileName(f.id)}` : fileName(f.id), shape: FILE_CLASS[f.class].shape })),
      links: detail.links.filter(([a, b]) => ids.has(a) && ids.has(b)).map<GLink>(([source, target]) => ({ source, target })),
    }
  }, [detail])

  const focus = hover ?? selected
  const near = useMemo(() => {
    const set = new Set([focus])
    data.links.forEach((l) => {
      const a = idOf(l.source)
      const b = idOf(l.target)
      if (a === focus) set.add(b)
      if (b === focus) set.add(a)
    })
    return set
  }, [data, focus])

  // Tune the forces once the graph exists, and refit whenever the set of nodes changes.
  useEffect(() => {
    const g = fg.current
    if (!g) return
    g.d3Force('link')?.distance(GRAPH.linkDistance)
    g.d3Force('charge')?.strength(GRAPH.chargeStrength)
    g.d3ReheatSimulation()
  }, [data])

  // Refit when the panel is resized, for example when a sidebar is collapsed.
  useEffect(() => {
    if (width > 0) fg.current?.zoomToFit(GRAPH.fitDuration, GRAPH.fitPadding)
  }, [width, height])

  return (
    <div ref={box} className="surface-control relative overflow-hidden rounded-md" style={{ height }}>
      {width > 0 ? (
        <ForceGraph2D
          ref={fg}
          width={width}
          height={height}
          graphData={data}
          backgroundColor="transparent"
          nodeRelSize={GRAPH.nodeRadius}
          cooldownTicks={120}
          onEngineStop={() => fg.current?.zoomToFit(GRAPH.fitDuration, GRAPH.fitPadding)}
          onNodeHover={(n) => setHover(n ? n.id : null)}
          onNodeClick={(n) => onSelect(n.id)}
          linkColor={(l) => (idOf(l.source) === focus || idOf(l.target) === focus ? colors.primary : colors.hover)}
          linkWidth={(l) => (idOf(l.source) === focus || idOf(l.target) === focus ? GRAPH.linkWidthActive : GRAPH.linkWidth)}
          nodePointerAreaPaint={(n, color, ctx) => {
            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(n.x ?? 0, n.y ?? 0, GRAPH.nodeRadius * 1.6, 0, Math.PI * 2)
            ctx.fill()
          }}
          nodeCanvasObject={(n, ctx, scale) => {
            const x = n.x ?? 0
            const y = n.y ?? 0
            const isFocus = n.id === focus
            ctx.globalAlpha = near.has(n.id) ? 1 : GRAPH.dimmedAlpha
            ctx.fillStyle = n.id === selected ? colors.primary : isFocus ? colors.ink : colors.muted
            drawShape(ctx, n.shape, x, y, GRAPH.nodeRadius, colors.control)
            if (isFocus || near.has(n.id) || scale > GRAPH.labelZoom) {
              ctx.font = `${isFocus ? 600 : 400} ${GRAPH.labelSize / scale}px ${colors.font}`
              ctx.textAlign = 'center'
              ctx.textBaseline = 'top'
              ctx.fillStyle = isFocus ? colors.ink : colors.muted
              ctx.fillText(n.title, x, y + GRAPH.nodeRadius * 1.4 + GRAPH.labelOffset / scale)
            }
            ctx.globalAlpha = 1
          }}
        />
      ) : null}
    </div>
  )
}
