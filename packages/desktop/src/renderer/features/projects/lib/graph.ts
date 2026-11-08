/**
 * Tuning for the file graph (react-force-graph-2d, a canvas force layout on d3-force).
 * Only the look and feel of the simulation lives here; the data comes from the repository.
 */
export const GRAPH = {
  nodeRadius: 6,
  /** Zoom level above which every label shows; below it only the focused node's neighbors do. */
  labelZoom: 1.4,
  labelSize: 11,
  labelOffset: 4,
  linkDistance: 60,
  chargeStrength: -90,
  fitDuration: 400,
  fitPadding: 40,
  dimmedAlpha: 0.22,
  linkWidth: 1,
  linkWidthActive: 2,
} as const
