import { Html } from '@react-three/drei'
import type * as THREE from 'three'
import type { LightConfig } from '../types'

export function DistanceLabel({ light, target }: { light: LightConfig; target: THREE.Vector3Tuple }) {
  const dx = light.position.x - target[0]
  const dy = light.position.y - target[1]
  const dz = light.position.z - target[2]
  const d = Math.sqrt(dx * dx + dy * dy + dz * dz)
  return (
    <Html position={[light.position.x, 0.15, light.position.z]} center zIndexRange={[10, 0]}>
      <div
        style={{
          background: 'rgba(15,16,22,0.82)',
          color: '#e8e6ef',
          fontSize: 11,
          padding: '2px 6px',
          borderRadius: 5,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          border: '1px solid rgba(216,180,254,0.4)',
        }}
      >
        {light.name} · {d.toFixed(1)}m
      </div>
    </Html>
  )
}
