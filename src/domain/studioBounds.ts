import type { StudioConfig } from '../types'

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

// Keep a dragged item's ground position (x,z) inside the white-studio footprint so
// free dragging a light / camera / person / prop can never leave the box. The
// studio spans `width` on X and `depth` on Z, centered on the origin; a small
// margin keeps item centers just inside the walls instead of clipping through
// them. Unlike the camera's `clampCameraInsideStudio`, the front (+Z) is bounded
// too — the studio size is meant to be the hard limit for free dragging.
export function clampToStudioFootprint(
  x: number,
  z: number,
  studio: StudioConfig,
  margin = 0.3,
): { x: number; z: number } {
  const halfW = Math.max(margin, studio.width / 2 - margin)
  const halfD = Math.max(margin, studio.depth / 2 - margin)
  return { x: clamp(x, -halfW, halfW), z: clamp(z, -halfD, halfD) }
}
