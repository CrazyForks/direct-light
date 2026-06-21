import * as THREE from 'three'

// v0.5.1: one seamless cyclorama surface — front floor → quarter-round fillet →
// back wall — extruded across the studio width as a single mesh. Replaces the
// floor + back-wall + quarter-cylinder approximation so the floor-to-wall seam
// reads as one continuous surface. (V0_5_1_RENDERING_CREDIBILITY_SPEC §4.1)
//
// Cross-section is a polyline in the (z, y) plane, ordered front-floor → wall-top.
// Each section point becomes a left (x=-width/2) and right (x=+width/2) vertex;
// consecutive sections are joined into quad strips. Winding is chosen so vertex
// normals face the studio interior (floor → +Y, back wall → +Z).
export function buildCycloramaGeometry(
  width: number,
  depth: number,
  height: number,
  radius: number,
  segments: number,
): THREE.BufferGeometry {
  const halfW = width / 2
  const halfD = depth / 2
  const r = Math.max(0.01, Math.min(radius, depth / 2, height))
  const arcSegments = Math.max(1, Math.round(segments))

  // (z, y) cross-section: front floor edge → fillet start → fillet arc → wall top
  const section: Array<[number, number]> = []
  section.push([halfD, 0]) // front edge of the floor
  section.push([-halfD + r, 0]) // floor meets the fillet
  const cz = -halfD + r // fillet centre z
  const cy = r // fillet centre y
  for (let i = 1; i <= arcSegments; i++) {
    // sweep the quarter circle from straight-down (270°) to straight-back (180°)
    const ang = THREE.MathUtils.degToRad(270 - 90 * (i / arcSegments))
    section.push([cz + r * Math.cos(ang), cy + r * Math.sin(ang)])
  }
  section.push([-halfD, height]) // top of the back wall

  const positions: number[] = []
  for (const [z, y] of section) {
    positions.push(-halfW, y, z) // left edge
    positions.push(halfW, y, z) // right edge
  }

  const indices: number[] = []
  for (let i = 0; i < section.length - 1; i++) {
    const a = 2 * i // left[i]
    const b = 2 * i + 1 // right[i]
    const c = 2 * i + 2 // left[i+1]
    const d = 2 * i + 3 // right[i+1]
    indices.push(a, b, c, b, d, c)
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
