// Bridge to grab a PNG of the current render from outside the Canvas.
// Requires gl preserveDrawingBuffer:true on the Canvas.

import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

export const captureRef: { current: null | (() => string) } = { current: null }

export function CaptureBridge() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const camera = useThree((s) => s.camera)
  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera)
      return gl.domElement.toDataURL('image/png')
    }
    return () => {
      captureRef.current = null
    }
  }, [gl, scene, camera])
  return null
}

export function capturePreview(): string | null {
  return captureRef.current ? captureRef.current() : null
}
