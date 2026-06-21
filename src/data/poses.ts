// v0.4a/v0.4b basic pose presets. Angle values are DEGREES and are engineering
// defaults — Codex tunes the exact look (see ROADMAP §5 / RENDERING_SPEC).
// Sign conventions documented on PoseConfig in types.ts.

import type { PoseConfig } from '../types'

const NEUTRAL: Omit<PoseConfig, 'presetId'> = {
  headYaw: 0,
  headPitch: 0,
  torsoYaw: 0,
  torsoPitch: 0,
  // a few degrees of outward roll reads more natural than arms glued to the torso
  leftUpperArmPitch: 0,
  leftUpperArmRoll: 7,
  leftForearmBend: 4,
  leftForearmYaw: 0,
  rightUpperArmPitch: 0,
  rightUpperArmRoll: 7,
  rightForearmBend: 4,
  rightForearmYaw: 0,
  seated: false,
}

function pose(presetId: string, over: Partial<Omit<PoseConfig, 'presetId'>> = {}): PoseConfig {
  return { presetId, ...NEUTRAL, ...over }
}

export const DEFAULT_POSE: PoseConfig = pose('natural')

// v0.4b: hips rest at the group origin when seated, so placeOnSurface puts the
// person at the seat-top height. Used by the panel when a seated preset is
// picked while the actor is still on the floor (no seat under them yet).
export const SEATED_HIP_HEIGHT = 0.46

export const POSE_PRESETS: { id: string; label: string; pose: PoseConfig }[] = [
  { id: 'natural', label: '自然站立', pose: pose('natural') },
  { id: 'side', label: '侧身站立', pose: pose('side', { torsoYaw: -35, headYaw: 12 }) },
  { id: 'head-to-key', label: '头转向主光', pose: pose('head-to-key', { headYaw: -35 }) },
  { id: 'head-down', label: '低头', pose: pose('head-down', { headPitch: 24 }) },
  { id: 'raise-arm', label: '抬一只手', pose: pose('raise-arm', { rightUpperArmRoll: 128, rightForearmBend: 18 }) },
  { id: 'arms-down', label: '双手下垂', pose: pose('arms-down', { leftUpperArmRoll: 4, rightUpperArmRoll: 4, leftForearmBend: 0, rightForearmBend: 0 }) },
  // v0.4b: elbow out + forearm bent forward, then a forearm yaw twists the hand
  // inward to the side hip — the DOF v0.4a was missing.
  { id: 'hand-on-hip', label: '一只手叉腰', pose: pose('hand-on-hip', { rightUpperArmRoll: 48, rightUpperArmPitch: -6, rightForearmBend: 95, rightForearmYaw: -85 }) },
  { id: 'lean-forward', label: '身体前倾', pose: pose('lean-forward', { torsoPitch: 12 }) },
  { id: 'rim-test', label: '轮廓光站姿', pose: pose('rim-test', { torsoYaw: -28, headYaw: 18, leftUpperArmPitch: -10, rightUpperArmPitch: -10 }) },
  // v0.4b seated presets. Use via "放到承载物" (auto-sets seat height) or pick
  // here (panel lifts a floor-standing actor to SEATED_HIP_HEIGHT).
  { id: 'seated', label: '坐姿', pose: pose('seated', { seated: true, torsoPitch: 4 }) },
  { id: 'seated-talk', label: '坐姿·前倾交谈', pose: pose('seated-talk', { seated: true, torsoPitch: 16, headPitch: -4 }) },
  { id: 'seated-hands-knees', label: '坐姿·手放膝', pose: pose('seated-hands-knees', { seated: true, torsoPitch: 10, leftUpperArmPitch: 38, rightUpperArmPitch: 38, leftForearmBend: 64, rightForearmBend: 64 }) },
]
