import type { AspectRatio, Vector3 } from '../types'

// v0.4c director-facing camera presets. Numbers/labels are the V0_4C_CAMERA_SPEC
// defaults — applying a preset writes position/target/focalLength/aspectRatio and
// resets targetMode to 'manual' (handled in the store).
export type CameraPreset = {
  id: string
  label: string
  position: Vector3
  target: Vector3
  focalLength: number
  aspectRatio: AspectRatio
}

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'front-full',
    label: '正面全身',
    position: { x: 0, y: 1.55, z: 6.2 },
    target: { x: 0, y: 1.05, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'front-45',
    label: '45°侧前',
    position: { x: 4.2, y: 1.55, z: 4.2 },
    target: { x: 0, y: 1.05, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'high-angle',
    label: '高机位',
    position: { x: 0, y: 2.6, z: 5.2 },
    target: { x: 0, y: 0.95, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'low-angle',
    label: '低机位',
    position: { x: 0, y: 0.75, z: 5.2 },
    target: { x: 0, y: 1.25, z: 0 },
    focalLength: 35,
    aspectRatio: '16:9',
  },
  {
    id: 'top-communication',
    label: '俯拍沟通',
    position: { x: 0, y: 4.2, z: 4.8 },
    target: { x: 0, y: 0.6, z: 0 },
    focalLength: 28,
    aspectRatio: '16:9',
  },
]
