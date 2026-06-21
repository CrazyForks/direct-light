// Polar helpers so the panel can express a light's horizontal placement as
// "distance from actor" + "azimuth angle" (0°=front, +90°=camera-right,
// ±180°=behind) instead of raw x/z. Height stays independent.

import type { PersonConfig, Vector3 } from '../types'

export function horizontalDistance(person: PersonConfig, pos: Vector3): number {
  const dx = pos.x - person.position.x
  const dz = pos.z - person.position.z
  return Math.sqrt(dx * dx + dz * dz)
}

export function azimuthDeg(person: PersonConfig, pos: Vector3): number {
  const dx = pos.x - person.position.x
  const dz = pos.z - person.position.z
  // atan2(x, z): 0 = +Z (front, toward camera), +90 = +X (right)
  return (Math.atan2(dx, dz) * 180) / Math.PI
}

export function positionFromPolar(
  person: PersonConfig,
  distance: number,
  azimuthDegValue: number,
  height: number,
): Vector3 {
  const a = (azimuthDegValue * Math.PI) / 180
  return {
    x: person.position.x + distance * Math.sin(a),
    y: height,
    z: person.position.z + distance * Math.cos(a),
  }
}
