import type { CameraConfig, PersonConfig, StudioConfig, Vector3 } from '../types'
import { getPeopleCenterAimTarget, getPersonAimTarget } from './lightTargets'

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

// v0.4c: keep the camera inside the open studio volume so rotating (camera mode)
// or orbiting (free mode) never parks it behind a wall — a flat-white frame. The
// studio is open at the front (+Z), so we clamp laterally to the side walls, keep
// it above the floor (and below the ceiling when present), and in front of the
// back wall; +Z stays free. lookAt is unchanged, so the subject stays framed.
export function clampCameraInsideStudio(position: Vector3, studio: StudioConfig, margin = 0.4): Vector3 {
  const halfW = studio.width / 2
  const halfD = studio.depth / 2
  const maxY = studio.showCeiling ? studio.height - margin : 50
  return {
    x: clamp(position.x, -(halfW - margin), halfW - margin),
    y: clamp(position.y, margin, Math.max(margin, maxY)),
    z: Math.max(position.z, -halfD + margin),
  }
}

// v0.4c: the camera orbits around `target`. Azimuth is the horizontal angle of
// `position` about the target in the XZ plane (degrees, -180..180); 0° = camera
// on the +Z side (front), +45° = front-right. atan2(dx, dz) keeps that mapping.

export function cameraAzimuthDeg(position: Vector3, target: Vector3): number {
  const dx = position.x - target.x
  const dz = position.z - target.z
  const horizontal = Math.sqrt(dx * dx + dz * dz)
  if (horizontal < 1e-6) return 0
  return (Math.atan2(dx, dz) * 180) / Math.PI
}

export function cameraHorizontalDistance(position: Vector3, target: Vector3): number {
  const dx = position.x - target.x
  const dz = position.z - target.z
  return Math.sqrt(dx * dx + dz * dz)
}

export function cameraPositionFromPolar(
  target: Vector3,
  distanceM: number,
  azimuthDeg: number,
  height: number,
): Vector3 {
  const az = (azimuthDeg * Math.PI) / 180
  return {
    x: target.x + distanceM * Math.sin(az),
    y: height,
    z: target.z + distanceM * Math.cos(az),
  }
}

// v0.4c: live target the director camera looks at. 'manual' uses the stored
// target; 'person'/'peopleCenter' follow people at render time (mirrors lights),
// so moving a person updates the camera aim without a re-click.
export function getEffectiveCameraTarget(camera: CameraConfig, people: PersonConfig[]): Vector3 {
  if (camera.targetMode === 'person') {
    const person = people.find((p) => p.id === camera.targetPersonId) ?? people[0]
    if (person) return getPersonAimTarget(person)
  }
  if (camera.targetMode === 'peopleCenter') {
    const center = getPeopleCenterAimTarget(people)
    if (center) return center
  }
  return camera.target
}
