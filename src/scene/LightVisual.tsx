import { DoubleSide, Group } from 'three'
import type { ThreeEvent } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import type { FixtureCategory, LightType, Vector3 } from '../types'

// v0.5.1 visible light body — pure display R3F component. Gives the director a
// quick read of "softbox / panel / tube / point source" without doing any real
// illumination; the SpotLight continues to handle lighting and shadows.
// See V0_5_1_RENDERING_CREDIBILITY_SPEC.md §4.2.

export type LightVisualKind = 'point' | 'softbox' | 'panel' | 'tube'

/**
 * Map a light's (LightType, FixtureCategory?) pair to the visual body kind.
 * Priority matches §4.2: fixtureCategory 'tube' wins over lightType 'panel'
 * (so the RGB Tube preset, which has light.type='panel' + category='tube' in
 * the fixture preset, renders as a tube, not a panel).
 */
// eslint-disable-next-line react-refresh/only-export-components
export function lightVisualKind(
  lightType: LightType,
  fixtureCategory: FixtureCategory | undefined,
): LightVisualKind {
  if (fixtureCategory === 'tube') return 'tube'
  if (lightType === 'panel') return 'panel'
  if (lightType === 'soft') return 'softbox'
  return 'point'
}

export function LightVisual({
  position,
  target,
  color,
  kind,
  softness,
  onClick,
  onPointerDown,
}: {
  position: Vector3
  target: Vector3
  color: string
  kind: LightVisualKind
  softness: number
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
}) {
  const groupRef = useRef<Group>(null)

  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(target.x, target.y, target.z)
    }
    // re-orient when the light moves too, not only when the target moves
  }, [position.x, position.y, position.z, target.x, target.y, target.z])

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={onClick}
      onPointerDown={onPointerDown}
    >
      {kind === 'point' && (
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
      {kind === 'softbox' && (
        <mesh>
          <planeGeometry args={[1.2 + softness * 0.9, 0.7 + softness * 0.45]} />
          <meshBasicMaterial color={color} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
      {kind === 'panel' && (
        <mesh>
          <planeGeometry args={[1, 1]} />
          <meshBasicMaterial color={color} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
      {kind === 'tube' && (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 1.4, 16]} />
          <meshBasicMaterial color={color} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
