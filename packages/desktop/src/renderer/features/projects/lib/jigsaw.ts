/**
 * Jigsaw geometry for the snap-in board. A piece is a rounded rectangle whose four edges are each
 * flat (no neighbor), a tab (pokes out) or a blank (cut in). For two neighbors, one has the tab and
 * the other the blank, with the same shape, so they interlock exactly; which one has the tab
 * alternates with the position, as in a real puzzle. The same path draws a loose piece on the shelf,
 * an assembled piece and the outline of an empty place.
 */

/** How far a tab pokes out; also the empty margin an SVG keeps around the body so the tab is not cut. */
export const PAD = 19
/** Size of an assembled piece's body, and of a loose piece on the shelf. */
export const ASSEMBLED = { w: 164, h: 92 }
export const LOOSE = { w: 128, h: 72 }
/** Corner radius of a piece. */
const RADIUS = 12
/** How many pieces fit in a row at most and at least. */
export const MIN_COLUMNS = 2
export const MAX_COLUMNS = 5
/** The flight of a piece from the shelf to the assembly, in milliseconds, and how high it arcs. */
export const FLIGHT_MS = 520
export const FLIGHT_ARC = 26

/** -1 a blank, 0 flat, 1 a tab; clockwise from the top. */
export type Edges = { t: -1 | 0 | 1; r: -1 | 0 | 1; b: -1 | 0 | 1; l: -1 | 0 | 1 }

/**
 * The outline of a tab, in (along the edge, outward) coordinates around the middle of the edge:
 * a neck 14 wide that flares into a bulb 24 wide and 19 deep. M is a point, C a cubic curve.
 */
const BULB: (readonly number[])[] = [
  [-7, 5, -12, 6, -12, 11],
  [-12, 17, -6, 19, 0, 19],
  [6, 19, 12, 17, 12, 11],
  [12, 6, 7, 5, 7, 0],
]
const NECK = 7

const CORNERS = (w: number, h: number) => [
  [PAD, PAD],
  [PAD + w, PAD],
  [PAD + w, PAD + h],
  [PAD, PAD + h],
]
const DIRECTION = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
]
const OUTWARD = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
]

export function piecePath(w: number, h: number, edges: Edges): string {
  const corner = CORNERS(w, h)
  const kinds = [edges.t, edges.r, edges.b, edges.l]
  let d = `M${PAD + RADIUS},${PAD}`
  for (let i = 0; i < 4; i++) {
    const [dx, dy] = DIRECTION[i]!
    const [nx, ny] = OUTWARD[i]!
    const [cx, cy] = corner[i]!
    const [ex, ey] = corner[(i + 1) % 4]!
    const sx = cx + dx * RADIUS
    const sy = cy + dy * RADIUS
    const fx = ex - dx * RADIUS
    const fy = ey - dy * RADIUS
    const mx = (sx + fx) / 2
    const my = (sy + fy) / 2
    const kind = kinds[i]!
    const at = (u: number, v: number) => `${(mx + dx * u + nx * v * kind).toFixed(2)},${(my + dy * u + ny * v * kind).toFixed(2)}`
    if (kind) {
      d += ` L${at(-NECK, 0)}`
      for (const c of BULB) d += ` C${at(c[0]!, c[1]!)} ${at(c[2]!, c[3]!)} ${at(c[4]!, c[5]!)}`
    }
    d += ` L${fx},${fy}`
    const [ndx, ndy] = DIRECTION[(i + 1) % 4]!
    d += ` Q${ex},${ey} ${ex + ndx * RADIUS},${ey + ndy * RADIUS}`
  }
  return `${d} Z`
}

/** Which of two neighbors holds the tab: it alternates with the position, like a checkerboard. */
const parity = (row: number, col: number): 1 | -1 => ((row + col) % 2 === 0 ? 1 : -1)

/** The edges of the piece at `index` of `count`, laid out left to right in rows of `columns`. */
export function edgesFor(index: number, count: number, columns: number): Edges {
  const row = Math.floor(index / columns)
  const col = index % columns
  const edges: Edges = { t: 0, r: 0, b: 0, l: 0 }
  if (col < columns - 1 && index + 1 < count) edges.r = parity(row, col)
  if (col > 0) edges.l = (-parity(row, col - 1)) as -1 | 1
  if (index + columns < count) edges.b = parity(row, col)
  if (row > 0) edges.t = (-parity(row - 1, col)) as -1 | 1
  return edges
}

/** The edges of a loose piece on the shelf: a blank on the left and a tab on the right, ready to be chained. */
export const LOOSE_EDGES: Edges = { t: 0, r: 1, b: 0, l: -1 }

/** How many columns fit in `width` pixels. */
export function columnsFor(width: number): number {
  const fit = Math.floor((width - 2 * PAD) / ASSEMBLED.w)
  return Math.max(MIN_COLUMNS, Math.min(MAX_COLUMNS, fit || MIN_COLUMNS))
}
