import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import type { StudioConfig } from '../types'
import { STUDIO_MATERIAL } from '../data/rendering'
import { buildCycloramaGeometry } from './studioGeometry'

type Props = {
  studio: StudioConfig
  onSelect?: () => void
  // The side-view ortho camera sits outside the +X side wall and would otherwise
  // see only its white inner face. Drop the side walls for that view so the
  // person reads as a clean side elevation.
  suppressSideWalls?: boolean
}

// v0.1.0: flat white studio (floor + back wall + optional side walls/ceiling).
// `hasCyclorama` adds a concave quarter-round fillet at the floor/back-wall
// seam to approximate a seamless 无缝弧形 background. A fully swept cyc can
// replace this later (tracked in COLLABORATION.md).
export function Studio({ studio, onSelect, suppressSideWalls = false }: Props) {
  const { width, depth, height, wallColor, floorColor, hasCyclorama, showSideWalls, showCeiling } = studio
  const halfW = width / 2
  const halfD = depth / 2

  // v0.5.1: one seamless cyclorama surface when enabled (floor+fillet+back wall).
  const cycGeometry = useMemo(() => {
    if (!hasCyclorama) return null
    const radius = Math.min(1.35, depth * 0.16, height * 0.35)
    return buildCycloramaGeometry(width, depth, height, radius, 24)
  }, [hasCyclorama, width, depth, height])
  useEffect(() => () => cycGeometry?.dispose(), [cycGeometry])

  const wallMat = {
    color: wallColor,
    roughness: STUDIO_MATERIAL.wallRoughness,
    metalness: STUDIO_MATERIAL.metalness,
    side: THREE.DoubleSide,
  }
  const floorMat = {
    color: floorColor,
    roughness: STUDIO_MATERIAL.floorRoughness,
    metalness: STUDIO_MATERIAL.metalness,
  }

  return (
    <group onClick={onSelect}>
      {cycGeometry ? (
        /* v0.5.1 seamless cyclorama: floor → fillet → back wall as one surface */
        <mesh geometry={cycGeometry} receiveShadow>
          <meshStandardMaterial {...wallMat} />
        </mesh>
      ) : (
        <>
          {/* floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial {...floorMat} />
          </mesh>

          {/* back wall */}
          <mesh position={[0, height / 2, -halfD]} receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial {...wallMat} />
          </mesh>
        </>
      )}

      {/* side walls */}
      {showSideWalls && !suppressSideWalls && (
        <>
          <mesh position={[-halfW, height / 2, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial {...wallMat} />
          </mesh>
          <mesh position={[halfW, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial {...wallMat} />
          </mesh>
        </>
      )}

      {/* ceiling */}
      {showCeiling && (
        <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial {...wallMat} />
        </mesh>
      )}
    </group>
  )
}
