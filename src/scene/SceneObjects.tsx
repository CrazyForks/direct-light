import type { ThreeEvent } from '@react-three/fiber'
import type { SceneObjectConfig } from '../types'
import { SCENE_OBJECT_MATERIALS } from '../data/sceneObjects'

type Props = {
  objects: SceneObjectConfig[]
  selectedId: string | null
  interactive: boolean
  onSelect: (id: string) => void
  onPointerDownObject: (id: string, e: ThreeEvent<PointerEvent>) => void
}

function matProps(obj: SceneObjectConfig) {
  const spec = SCENE_OBJECT_MATERIALS[obj.material]
  return {
    color: obj.color,
    roughness: spec.roughness,
    metalness: spec.metalness,
    ...(spec.opacity < 1 ? { transparent: true, opacity: spec.opacity } : {}),
  }
}

function ObjectMesh({ obj }: { obj: SceneObjectConfig }) {
  const { width, depth, height } = obj.size
  const m = matProps(obj)
  const shadowProps = {
    castShadow: obj.castShadow,
    receiveShadow: obj.receiveShadow,
  }

  switch (obj.geometry) {
    case 'cylinder':
      return (
        <mesh position={[0, height / 2, 0]} {...shadowProps}>
          <cylinderGeometry args={[width / 2, width / 2, height, 24]} />
          <meshStandardMaterial {...m} />
        </mesh>
      )
    case 'panel':
      return (
        <mesh position={[0, height / 2, 0]} {...shadowProps}>
          <boxGeometry args={[width, height, Math.max(depth, 0.06)]} />
          <meshStandardMaterial {...m} />
        </mesh>
      )
    case 'gearPanel': {
      // v0.6c control gear: a thin working surface in the upper portion + a thin
      // stand pole + a small base, so it reads as standing grip gear, not a wall.
      // The broad face normal is local +Z (rotated by the object's rotationY) —
      // v0.6d optics rely on this geometry contract.
      const panelH = height * 0.55
      const panelCenterY = height - panelH / 2
      const standH = Math.max(height - panelH, 0.05)
      return (
        <>
          <mesh position={[0, panelCenterY, 0]} {...shadowProps}>
            <boxGeometry args={[width, panelH, Math.max(depth, 0.03)]} />
            <meshStandardMaterial {...m} />
          </mesh>
          {/* stand pole — fixed dark gray so a white reflector board does not tint it */}
          <mesh position={[0, standH / 2, 0]} {...shadowProps}>
            <cylinderGeometry args={[0.022, 0.022, standH, 12]} />
            <meshStandardMaterial color="#3a3a40" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* base */}
          <mesh position={[0, 0.015, 0]} {...shadowProps}>
            <cylinderGeometry args={[0.18, 0.2, 0.03, 20]} />
            <meshStandardMaterial color="#2a2a30" roughness={0.7} metalness={0.2} />
          </mesh>
        </>
      )
    }
    case 'chair':
      return (
        <>
          <mesh position={[0, height * 0.5, 0]} {...shadowProps}>
            <boxGeometry args={[width, height * 0.12, depth]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.72, -depth / 2 + depth * 0.08]} {...shadowProps}>
            <boxGeometry args={[width, height * 0.5, depth * 0.16]} />
            <meshStandardMaterial {...m} />
          </mesh>
        </>
      )
    case 'sofa':
      return (
        <>
          <mesh position={[0, height * 0.28, 0]} {...shadowProps}>
            <boxGeometry args={[width, height * 0.45, depth]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.62, -depth / 2 + depth * 0.11]} {...shadowProps}>
            <boxGeometry args={[width, height * 0.55, depth * 0.22]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[-(width / 2 - width * 0.07), height * 0.5, 0]} {...shadowProps}>
            <boxGeometry args={[width * 0.14, height * 0.55, depth]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[width / 2 - width * 0.07, height * 0.5, 0]} {...shadowProps}>
            <boxGeometry args={[width * 0.14, height * 0.55, depth]} />
            <meshStandardMaterial {...m} />
          </mesh>
        </>
      )
    case 'mannequinHalf':
      return (
        <>
          <mesh position={[0, height * 0.02, 0]} {...shadowProps}>
            <cylinderGeometry args={[width * 0.5, width * 0.5, height * 0.04, 20]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.32, 0]} {...shadowProps}>
            <cylinderGeometry args={[0.03, 0.03, height * 0.55, 12]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.78, 0]} {...shadowProps}>
            <cylinderGeometry args={[width * 0.32, width * 0.5, height * 0.42, 20]} />
            <meshStandardMaterial {...m} />
          </mesh>
        </>
      )
    case 'mannequinFull':
      return (
        <>
          <mesh position={[0, height * 0.015, 0]} {...shadowProps}>
            <cylinderGeometry args={[width * 0.5, width * 0.5, height * 0.03, 20]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.27, 0]} {...shadowProps}>
            <boxGeometry args={[width * 0.8, height * 0.5, depth]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.65, 0]} {...shadowProps}>
            <cylinderGeometry args={[width * 0.32, width * 0.6, height * 0.34, 20]} />
            <meshStandardMaterial {...m} />
          </mesh>
          <mesh position={[0, height * 0.9, 0]} {...shadowProps}>
            <sphereGeometry args={[width * 0.5, 20, 20]} />
            <meshStandardMaterial {...m} />
          </mesh>
        </>
      )
    case 'box':
    default:
      return (
        <mesh position={[0, height / 2, 0]} {...shadowProps}>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial {...m} />
        </mesh>
      )
  }
}

export function SceneObjects({ objects, selectedId, interactive, onSelect, onPointerDownObject }: Props) {
  return (
    <>
      {objects
        .filter((o) => o.visible !== false)
        .map((obj) => {
          const sel = Math.max(obj.size.width, obj.size.depth)
          return (
            <group
              key={obj.id}
              position={[obj.position.x, obj.position.y, obj.position.z]}
              rotation={[0, obj.rotationY, 0]}
              onClick={
                interactive
                  ? (e) => {
                      e.stopPropagation()
                      onSelect(obj.id)
                    }
                  : undefined
              }
              onPointerDown={interactive ? (e) => onPointerDownObject(obj.id, e) : undefined}
            >
              <ObjectMesh obj={obj} />
              <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[Math.max(0.42, sel * 0.6), 28]} />
                <meshBasicMaterial transparent opacity={0.001} depthWrite={false} />
              </mesh>
              {interactive && selectedId === obj.id && (
                <mesh position={[0, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[sel * 0.55, sel * 0.62, 48]} />
                  <meshBasicMaterial color="#d8b4fe" transparent opacity={0.9} />
                </mesh>
              )}
            </group>
          )
        })}
    </>
  )
}
