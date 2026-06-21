import { DoubleSide, Group } from 'three'
import { useLayoutEffect, useMemo, useRef } from 'react'
import type { LightModifierVisualKind } from '../data/lightModifiers'
import type { Vector3 } from '../types'

// v0.6b visible light modifier — pure display R3F component. Shows the mounted
// control modifier (softbox / grid / reflector / diffusion cloth) as a small body
// in front of the light head. Does NOT do any real illumination; the SpotLight
// continues to handle lighting via the v0.6a effective-quality helpers, and these
// bodies neither cast shadows nor occlude light (no castShadow), so the v0.6a
// effective-param formulas stay untouched. See V0_6B_VISUAL_BRIEF_SPEC.md §3.
// v0.6b follow-up (user request, 2026-06-20): solid 3D forms instead of flat
// planes — boxed softbox, metal cone reflector, dark control ring grid, thin
// translucent diffusion slab. Diffusion stays a thin sheet per §3.4.

type SolidKind = Exclude<LightModifierVisualKind, 'none'>

// How far in front of the light head each body sits (meters toward the aim
// target). Grid/reflector hug the head (§3.2/§3.3); the larger softbox sits a
// touch further out so its glow face clears the light body.
const OFFSET_BY_KIND: Record<SolidKind, number> = {
  softbox: 0.4,
  reflector: 0.3,
  grid: 0.22,
  diffusion: 0.3,
}

function offsetTowardTarget(position: Vector3, target: Vector3, amount: number): Vector3 {
  const dx = target.x - position.x
  const dy = target.y - position.y
  const dz = target.z - position.z
  const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
  return {
    x: position.x + (dx / len) * amount,
    y: position.y + (dy / len) * amount,
    z: position.z + (dz / len) * amount,
  }
}

export function LightModifierVisual({
  position,
  target,
  kind,
}: {
  position: Vector3
  target: Vector3
  kind: LightModifierVisualKind
}) {
  const amount = kind === 'none' ? 0 : OFFSET_BY_KIND[kind]
  const visualPos = useMemo(
    () => (kind === 'none' ? position : offsetTowardTarget(position, target, amount)),
    [position, target, kind, amount],
  )
  if (kind === 'none') return null
  return <ModifierGroup position={visualPos} target={target} kind={kind} />
}

function ModifierGroup({
  position,
  target,
  kind,
}: {
  position: Vector3
  target: Vector3
  kind: SolidKind
}) {
  const groupRef = useRef<Group>(null)
  useLayoutEffect(() => {
    if (groupRef.current) {
      groupRef.current.lookAt(target.x, target.y, target.z)
    }
    // After lookAt, the group's local +Z points toward the aim target, so each
    // body opens / faces the subject. Re-orient when the light moves too.
  }, [position.x, position.y, position.z, target.x, target.y, target.z])

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      {kind === 'softbox' && (
        // 中号柔光箱 (§3.1): a clearly larger 3D housing box with a glowing white
        // diffusion face on the front. Biggest of the four bodies.
        <group>
          <mesh position={[0, 0, -0.2]}>
            <boxGeometry args={[1.7, 1.15, 0.42]} />
            <meshStandardMaterial color="#33333a" roughness={0.85} metalness={0.05} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[1.78, 1.22]} />
            <meshBasicMaterial color="#f5f5ee" toneMapped={false} side={DoubleSide} />
          </mesh>
        </group>
      )}
      {kind === 'reflector' && (
        // 标准反光罩 (§3.3): a shallow light-metal cone/bowl opening toward the
        // subject (base at +Z, apex toward the lamp). Bigger than the grid,
        // clearly smaller than the softbox.
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.42, 0.34, 28, 1, true]} />
          <meshStandardMaterial color="#cfcfd4" metalness={0.35} roughness={0.45} side={DoubleSide} />
        </mesh>
      )}
      {kind === 'grid' && (
        // 蜂巢 (§3.2): a small dark control ring with a faint cross to hint at the
        // grid cells, no real honeycomb geometry. Smallest body, hugs the head.
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.18, 24, 1, true]} />
            <meshStandardMaterial color="#1b1b1f" roughness={0.7} metalness={0.1} side={DoubleSide} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.5, 0.03, 0.02]} />
            <meshBasicMaterial color="#0f0f12" toneMapped={false} />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <boxGeometry args={[0.03, 0.5, 0.02]} />
            <meshBasicMaterial color="#0f0f12" toneMapped={false} />
          </mesh>
        </group>
      )}
      {kind === 'diffusion' && (
        // 柔光布 (§3.4): a thin translucent diffusion slab — only slightly larger
        // than the head and clearly NOT a second white softbox. Kept a thin sheet.
        <mesh>
          <boxGeometry args={[0.72, 0.6, 0.05]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} toneMapped={false} side={DoubleSide} />
        </mesh>
      )}
    </group>
  )
}
