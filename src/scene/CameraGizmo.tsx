import { Line } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import type { CameraConfig } from '../types'

export function CameraGizmo({
  cam,
  selected,
  onSelect,
  onPointerDown,
}: {
  cam: CameraConfig
  selected: boolean
  onSelect: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
}) {
  const pos: [number, number, number] = [cam.position.x, cam.position.y, cam.position.z]
  const tgt: [number, number, number] = [cam.target.x, cam.target.y, cam.target.z]
  return (
    <group>
      <mesh position={pos} onClick={onSelect} onPointerDown={onPointerDown}>
        <boxGeometry args={[0.32, 0.24, 0.42]} />
        <meshBasicMaterial color={selected ? '#d8b4fe' : '#9aa0aa'} toneMapped={false} />
      </mesh>
      <Line points={[pos, tgt]} color="#9aa0aa" lineWidth={1} dashed dashScale={3} transparent opacity={0.6} />
    </group>
  )
}
