import type { FixtureCategory } from '../types'

// v0.6a control-modifier presets. These describe what is mounted in front of a
// light, separate from what the fixture is. Values are copied from
// V0_6_MODIFIER_SPEC.md; do not tune here without updating the spec.
export type LightModifierCategory = 'softener' | 'control' | 'reflector'
export type LightModifierVisualKind = 'none' | 'softbox' | 'grid' | 'reflector' | 'diffusion'

export type LightModifierEffect = {
  intensityMultiplier: number
  beamAngleMultiplier?: number
  beamAngleDelta?: number
  softnessDelta: number
  spillMultiplier: number
}

export type LightModifierPreset = {
  id: string
  label: string
  shortLabel: string
  category: LightModifierCategory
  description: string
  compatibleFixtureCategories?: FixtureCategory[]
  effect: LightModifierEffect
  visualKind: LightModifierVisualKind
}

export const LIGHT_MODIFIER_PRESETS: LightModifierPreset[] = [
  {
    id: 'softbox-medium',
    label: '中号柔光箱',
    shortLabel: '柔化',
    category: 'softener',
    description: '明显更软、更宽，亮度略降。适合把裸 COB 或偏硬主光变成可沟通的大面柔光主光。',
    effect: {
      intensityMultiplier: 0.76,
      beamAngleDelta: 24,
      softnessDelta: 0.36,
      spillMultiplier: 0.95,
    },
    visualKind: 'softbox',
  },
  {
    id: 'honeycomb-grid',
    label: '蜂巢',
    shortLabel: '控光',
    category: 'control',
    description: '收束光线，减少背景和地面的溢光。适合比较同一灯位下的控光前后。',
    effect: {
      intensityMultiplier: 0.82,
      beamAngleMultiplier: 0.55,
      softnessDelta: -0.08,
      spillMultiplier: 0.42,
    },
    visualKind: 'grid',
  },
  {
    id: 'standard-reflector',
    label: '标准反光罩',
    shortLabel: '集中',
    category: 'reflector',
    description: '让光更集中、更硬、略微更亮。适合模拟 COB 裸灯加标准罩后的方向感。',
    compatibleFixtureCategories: ['cob', 'fresnel', 'effect'],
    effect: {
      intensityMultiplier: 1.18,
      beamAngleMultiplier: 0.72,
      softnessDelta: -0.06,
      spillMultiplier: 0.78,
    },
    visualKind: 'reflector',
  },
  {
    id: 'diffusion-cloth',
    label: '柔光布',
    shortLabel: '扩散',
    category: 'softener',
    description: '明显变暗，只轻微变软和扩散。第一版作为灯上扩散片，不作为棚内独立布框。',
    effect: {
      intensityMultiplier: 0.48,
      beamAngleDelta: 4,
      softnessDelta: 0.12,
      spillMultiplier: 1.12,
    },
    visualKind: 'diffusion',
  },
]
