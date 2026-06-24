import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../state/store'
import { clampToStudioFootprint } from '../domain/studioBounds'

// Drives drag of the currently grabbed light / person / object by raycasting the
// pointer onto the ground plane. Window-level listeners keep the drag smooth even
// when the cursor leaves the dragged mesh.
export function GroundDragController() {
  const dragTarget = useStore((s) => s.dragTarget)
  const setLightPositionXZ = useStore((s) => s.setLightPositionXZ)
  const setPersonPositionXZ = useStore((s) => s.setPersonPositionXZ)
  const setObjectPositionXZ = useStore((s) => s.setObjectPositionXZ)
  const setCameraPositionXZ = useStore((s) => s.setCameraPositionXZ)
  const setDragTarget = useStore((s) => s.setDragTarget)
  const select = useStore((s) => s.select)
  const camera = useThree((s) => s.camera)
  const gl = useThree((s) => s.gl)
  const raycasterRef = useRef(new THREE.Raycaster())
  const pointRef = useRef(new THREE.Vector3())
  const groundRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))

  useEffect(() => {
    if (!dragTarget) return

    const updateFromPointer = (event: PointerEvent) => {
      const rect = gl.domElement.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const pointer = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      )
      const raycaster = raycasterRef.current
      raycaster.setFromCamera(pointer, camera)
      const point = pointRef.current
      if (!raycaster.ray.intersectPlane(groundRef.current, point)) return
      // Clamp to the live white-studio footprint so free dragging a light / camera
      // / person / prop is bounded by the actual box size, not a fixed -20..20.
      const studio = useStore.getState().scene.studio
      const { x, z } = clampToStudioFootprint(point.x, point.z, studio)
      if (dragTarget.kind === 'light') setLightPositionXZ(dragTarget.id, x, z)
      else if (dragTarget.kind === 'object') setObjectPositionXZ(dragTarget.id, x, z)
      else if (dragTarget.kind === 'camera') setCameraPositionXZ(x, z)
      else setPersonPositionXZ(dragTarget.id, x, z)
    }

    const endDrag = () => {
      const target = dragTarget
      setDragTarget(null)
      window.setTimeout(() => select({ kind: target.kind, id: target.id }), 0)
    }

    window.addEventListener('pointermove', updateFromPointer)
    window.addEventListener('pointerup', endDrag)
    return () => {
      window.removeEventListener('pointermove', updateFromPointer)
      window.removeEventListener('pointerup', endDrag)
    }
  }, [
    camera,
    dragTarget,
    gl,
    select,
    setDragTarget,
    setLightPositionXZ,
    setPersonPositionXZ,
    setObjectPositionXZ,
    setCameraPositionXZ,
  ])

  return null
}
