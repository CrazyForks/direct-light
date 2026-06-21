// ============================================================================
// Direct Light — rendering spec values.
//
// This file is the engineering mirror of RENDERING_SPEC.md and is Codex's
// primary tuning surface. When a screenshot looks wrong, adjust numbers HERE
// first, then the scene picks them up automatically. Keep names aligned with
// the spec document so the two stay in sync.
// ============================================================================

import type { LightType } from '../types'

// §3 reference point — lights aim between chest and face, not the feet.
export const PERSON_TARGET = { x: 0, y: 1.2, z: 0 }

// §4 default white studio
export const DEFAULT_STUDIO = {
  width: 8,
  depth: 10,
  height: 5,
  wallReflectance: 0.65,
  floorReflectance: 0.55,
  ambientLevel: 0.35,
  hasCyclorama: true,
  wallColor: '#f7f6f1',
  floorColor: '#f4f3ee',
} as const

export const STUDIO_MATERIAL = {
  wallRoughness: 0.82,
  floorRoughness: 0.86,
  metalness: 0,
} as const

// §5 default camera (focalLength is source of truth; fov derived below)
export const DEFAULT_CAMERA = {
  position: { x: 0, y: 1.55, z: 6.2 },
  target: { x: 0, y: 1.05, z: 0 },
  focalLength: 35,
  fov: 42,
  aspectRatio: '16:9' as const,
}

// Reconciles the spec's "35mm ≈ 42° fov" pairing (implied sensor width).
export const SENSOR_WIDTH_MM = 26.87
export function focalToFov(focalLength: number): number {
  return (2 * Math.atan(SENSOR_WIDTH_MM / 2 / focalLength) * 180) / Math.PI
}
export function fovToFocal(fov: number): number {
  return SENSOR_WIDTH_MM / 2 / Math.tan((fov * Math.PI) / 180 / 2)
}

// §6 default person
export const DEFAULT_PERSON = {
  id: 'person-1',
  name: 'Actor A',
  position: { x: 0, y: 0, z: 0 },
  rotationY: 0,
  height: 1.75,
  skinTone: '#c9956d',
  clothingColor: '#2f3437',
} as const

// v0.2 multi-person staging defaults. These are authored for director-facing
// blocking, not crowd simulation: A stays centered, B sits left/rear, C sits
// right/front, then D/E fill wider alternates without overlapping the key light
// read too much.
export const PERSON_STAGING_PRESETS = [
  {
    name: 'Actor A',
    position: { x: 0, y: 0, z: 0 },
    rotationY: 0,
    skinTone: '#c9956d',
    clothingColor: '#2f3437',
  },
  {
    name: 'Actor B',
    position: { x: -0.95, y: 0, z: -0.55 },
    rotationY: 0.18,
    skinTone: '#bd8b66',
    clothingColor: '#31475f',
  },
  {
    name: 'Actor C',
    position: { x: 1.05, y: 0, z: 0.35 },
    rotationY: -0.22,
    skinTone: '#d0a078',
    clothingColor: '#4a4735',
  },
  {
    name: 'Actor D',
    position: { x: -1.55, y: 0, z: 0.65 },
    rotationY: 0.34,
    skinTone: '#b77f5f',
    clothingColor: '#513642',
  },
  {
    name: 'Actor E',
    position: { x: 1.65, y: 0, z: -0.85 },
    rotationY: -0.35,
    skinTone: '#c69270',
    clothingColor: '#343b50',
  },
] as const

export const PERSON_MATERIAL = {
  skinRoughness: 0.64,
  clothingRoughness: 0.85,
} as const

// §7 per-type defaults (the three.js-flavored numbers behind each fixture).
export type LightTypeDefaults = {
  type: LightType
  intensity: number
  distance: number
  angle: number // radians, base spot cone half-angle
  penumbra: number
  decay: number
  shadowMapSize: number
  shadowRadius: number
  softness: number
  areaWidth?: number
  areaHeight?: number
}

export const HARD_LIGHT_DEFAULTS: LightTypeDefaults = {
  type: 'hard',
  intensity: 2.2,
  distance: 9,
  angle: 0.42,
  penumbra: 0.08,
  decay: 1.4,
  shadowMapSize: 2048,
  shadowRadius: 1,
  softness: 0.05,
}

export const SOFT_LIGHT_DEFAULTS: LightTypeDefaults = {
  type: 'soft',
  intensity: 1.75,
  distance: 8,
  angle: 0.78,
  penumbra: 0.72,
  decay: 1.15,
  shadowMapSize: 2048,
  shadowRadius: 10,
  softness: 0.72,
  areaWidth: 2,
  areaHeight: 1.2,
}

export const PANEL_LIGHT_DEFAULTS: LightTypeDefaults = {
  type: 'panel',
  intensity: 1.25,
  distance: 7,
  angle: 0.95,
  penumbra: 0.85,
  decay: 1.05,
  shadowMapSize: 1024,
  shadowRadius: 14,
  softness: 0.9,
  areaWidth: 1.5,
  areaHeight: 1.5,
}

export const LIGHT_TYPE_DEFAULTS: Record<LightType, LightTypeDefaults> = {
  hard: HARD_LIGHT_DEFAULTS,
  soft: SOFT_LIGHT_DEFAULTS,
  panel: PANEL_LIGHT_DEFAULTS,
}

export const LIGHT_TYPE_LABELS: Record<LightType, string> = {
  hard: '硬光',
  soft: '柔光',
  panel: '面光',
}

// §9.2 softness → shadow parameters
export function getShadowRadius(softness: number): number {
  return 1 + softness * 13
}
export function getPenumbra(softness: number): number {
  return Math.min(0.95, 0.05 + softness * 0.85)
}
export function getShadowBias(softness: number): number {
  return -0.00012 - softness * 0.00008
}

// §9.3 white studio reflectance → ambient / hemisphere fill
// v0.5.1: floorReflectance now contributes its own weight so dragging it has a
// visible effect on fill/bounce (V0_5_1_RENDERING_CREDIBILITY_SPEC §4.3).
export function getAmbientIntensity(wallReflectance: number, floorReflectance: number): number {
  return 0.1 + wallReflectance * 0.3 + floorReflectance * 0.12
}
export function getHemisphereIntensity(wallReflectance: number, floorReflectance: number): number {
  return 0.18 + wallReflectance * 0.28 + floorReflectance * 0.23
}

// §10 colored light bounce onto white surfaces
export function getColorBounceIntensity(
  lightIntensity: number,
  saturation: number,
  wallReflectance: number,
  floorReflectance: number,
): number {
  const reflectance = wallReflectance * 0.6 + floorReflectance * 0.4
  return Math.min(0.34, lightIntensity * saturation * (0.08 + reflectance * 0.12))
}

// §10 common color presets
export const COLOR_PRESETS: { name: string; label: string; color: string; temperature?: number }[] = [
  { name: 'White', label: '白光', color: '#ffffff', temperature: 5600 },
  { name: 'Warm White', label: '暖白', color: '#ffd9b0', temperature: 3200 },
  { name: 'Cool White', label: '冷白', color: '#dceaff', temperature: 6500 },
  { name: 'Red', label: '红', color: '#ff3b30' },
  { name: 'Blue', label: '蓝', color: '#2f6bff' },
  { name: 'Green', label: '绿', color: '#24c46b' },
  { name: 'Cyan', label: '青', color: '#2fd4ff' },
  { name: 'Magenta', label: '品红', color: '#d63bff' },
  { name: 'Amber', label: '琥珀', color: '#ff9f2f' },
]

// §11 color temperature presets
export const COLOR_TEMPERATURE_PRESETS: { label: string; value: number; color: string }[] = [
  { label: '3200K', value: 3200, color: '#ffd2a1' },
  { label: '4300K', value: 4300, color: '#ffe8cf' },
  { label: '5600K', value: 5600, color: '#ffffff' },
  { label: '6500K', value: 6500, color: '#dceaff' },
]

// §12 renderer settings (applied in the Canvas)
export const RENDERER_SETTINGS = {
  toneMappingExposure: 1.0,
} as const

// §8 default lighting rig (key on, fill + rim off). Distance comes from the
// per-type default so it stays consistent with the fixture mapping.
export const DEFAULT_KEY_LIGHT = {
  id: 'light-key',
  name: 'Key Light',
  type: 'soft' as LightType,
  enabled: true,
  position: { x: 2.8, y: 2.6, z: 2.4 },
  target: { x: 0, y: 1.2, z: 0 },
  targetMode: 'manual' as const,
  targetPersonId: 'person-1',
  intensity: 1.8,
  color: '#ffffff',
  colorTemperature: 5600 as number | undefined,
  beamAngle: 45,
  softness: 0.65,
  distance: SOFT_LIGHT_DEFAULTS.distance,
}

export const DEFAULT_FILL_LIGHT = {
  id: 'light-fill',
  name: 'Fill Light',
  type: 'panel' as LightType,
  enabled: false,
  position: { x: -3.2, y: 1.8, z: 3.0 },
  target: { x: 0, y: 1.15, z: 0 },
  targetMode: 'manual' as const,
  targetPersonId: 'person-1',
  intensity: 0.75,
  color: '#f8fbff',
  colorTemperature: 6500 as number | undefined,
  beamAngle: 70,
  softness: 0.9,
  distance: PANEL_LIGHT_DEFAULTS.distance,
}

export const DEFAULT_COLOR_RIM_LIGHT = {
  id: 'light-rim',
  name: 'Color Rim',
  type: 'hard' as LightType,
  enabled: false,
  position: { x: -2.4, y: 2.1, z: -2.6 },
  target: { x: 0, y: 1.25, z: 0 },
  targetMode: 'manual' as const,
  targetPersonId: 'person-1',
  intensity: 1.15,
  color: '#2f6bff',
  colorTemperature: undefined as number | undefined,
  beamAngle: 38,
  softness: 0.18,
  distance: HARD_LIGHT_DEFAULTS.distance,
}

// §13 quick visual debug presets (applied as partial overrides on the rig).
export type DebugPreset = {
  id: string
  name: string
  description: string
  apply: 'low-key-hard' | 'high-soft' | 'rgb-rim'
}

export const DEBUG_PRESETS: DebugPreset[] = [
  {
    id: 'low-key-hard',
    name: 'Low Key Hard',
    description: '硬光 · 右前 · 高1.8m · 反射0.25 · 长而硬的阴影',
    apply: 'low-key-hard',
  },
  {
    id: 'high-soft',
    name: 'High Soft Commercial',
    description: '柔光 · 右前偏高 · 高3.2m · 反射0.7 · 明亮干净广告感',
    apply: 'high-soft',
  },
  {
    id: 'rgb-rim',
    name: 'RGB Rim',
    description: '正面弱白光 + 后侧蓝/紫轮廓 · 反射0.55',
    apply: 'rgb-rim',
  },
]
