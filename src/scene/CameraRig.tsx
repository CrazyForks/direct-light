import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import type { CameraConfig, StudioConfig, ViewMode } from '../types'
import { focalToFov } from '../data/rendering'
import { clampCameraInsideStudio } from '../domain/cameraMath'

// --- Perspective rig: director camera (locked) + free orbit camera ---
// `target` is the effective aim point (may follow a person in 'camera' mode);
// falls back to cam.target. Free mode hands control to OrbitControls after mount.
export function PerspectiveRig({
  mode,
  cam,
  studio,
  target,
}: {
  mode: ViewMode
  cam: CameraConfig
  studio: StudioConfig
  target?: { x: number; y: number; z: number }
}) {
  const ref = useRef<THREE.PerspectiveCamera>(null)
  const fov = focalToFov(cam.focalLength)
  const aim = target ?? cam.target

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const p = clampCameraInsideStudio(cam.position, studio)
    c.position.set(p.x, p.y, p.z)
    c.lookAt(cam.target.x, cam.target.y, cam.target.z)
    c.updateProjectionMatrix()
    // re-init only when entering a perspective mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  useFrame(() => {
    const c = ref.current
    if (!c || mode !== 'camera') return
    // belt-and-suspenders clamp so a loaded/legacy/A-B camera never frames a wall
    const p = clampCameraInsideStudio(cam.position, studio)
    c.position.set(p.x, p.y, p.z)
    c.lookAt(aim.x, aim.y, aim.z)
  })

  return <PerspectiveCamera ref={ref} makeDefault fov={fov} near={0.1} far={200} />
}

// --- Orthographic rig: top + side technical views ---
export function OrthoRig({ mode }: { mode: ViewMode }) {
  const ref = useRef<THREE.OrthographicCamera>(null)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (mode === 'top') {
      c.position.set(0, 24, 0.001)
      c.up.set(0, 0, -1)
      c.lookAt(0, 0, 0)
    } else {
      c.position.set(22, 2.4, 0)
      c.up.set(0, 1, 0)
      c.lookAt(0, 1.2, 0)
    }
    c.updateProjectionMatrix()
  }, [mode])
  return <OrthographicCamera ref={ref} makeDefault zoom={mode === 'top' ? 40 : 46} near={0.1} far={400} />
}
