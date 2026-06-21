import type { PoseConfig, SceneConfig, SceneObjectSize } from '../types'
import { isControlGearKind } from '../data/sceneObjects'

/**
 * Category-level scene diff for the A/B compare summary. Not a deep diff —
 * just enough signal for a director to know "this compare is mostly about
 * lights / positions / props" at a glance. See ROADMAP §10.
 *
 * Returns an array with one entry per category in a stable order:
 * lights, people, objects, gear, pose, camera, studio.
 *
 * v0.6e: control gear ('控光器材') is split out of '道具' because, since v0.6d,
 * moving gear into/out of a light path changes the picture — the director needs
 * to see that as its own change, not buried under props.
 */

export type DiffCategory = 'lights' | 'people' | 'objects' | 'gear' | 'pose' | 'camera' | 'studio'

export type CategoryDiff = {
  category: DiffCategory
  label: string // 中文标签
  same: boolean
  hint: string // 一行短提示
}

export function compareScenes(a: SceneConfig, b: SceneConfig): CategoryDiff[] {
  return [
    diffLights(a, b),
    diffPeople(a, b),
    diffObjects(a, b),
    diffGear(a, b),
    diffPose(a, b),
    diffCamera(a, b),
    diffStudio(a, b),
  ]
}

// ─── per-category diff helpers (pure) ─────────────────────────────────────

function diffLights(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const aOn = a.lights.filter((l) => l.enabled).length
  const bOn = b.lights.filter((l) => l.enabled).length
  const same =
    a.lights.length === b.lights.length &&
    a.lights.every((la, i) => {
      const lb = b.lights[i]
      if (!lb) return false
      return (
        la.type === lb.type &&
        Math.abs(la.intensity - lb.intensity) < 0.01 &&
        la.color === lb.color &&
        la.enabled === lb.enabled &&
        closeVec(la.position, lb.position) &&
        Math.abs(la.softness - lb.softness) < 0.01 &&
        (la.modifierId ?? '') === (lb.modifierId ?? '')
      )
    })
  const hint = same
    ? `灯位/强度相同`
    : aOn === bOn && a.lights.length === b.lights.length
      ? `类型/强度/位置有变化`
      : `A开${aOn}/${a.lights.length} · B开${bOn}/${b.lights.length}`
  return { category: 'lights', label: '灯光', same, hint }
}

function diffPeople(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const same =
    a.people.length === b.people.length &&
    a.people.every((pa, i) => {
      const pb = b.people[i]
      if (!pb) return false
      return closeVec(pa.position, pb.position) && Math.abs(pa.rotationY - pb.rotationY) < 0.01
    })
  const hint = same
    ? `${a.people.length} 人站位相同`
    : a.people.length === b.people.length
      ? `站位/朝向有变化`
      : `A ${a.people.length}人 · B ${b.people.length}人`
  return { category: 'people', label: '人物位置', same, hint }
}

// v0.6e: props only (gear is split into diffGear below).
function diffObjects(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const ao = a.objects.filter((o) => !isControlGearKind(o.kind))
  const bo = b.objects.filter((o) => !isControlGearKind(o.kind))
  const same =
    ao.length === bo.length &&
    ao.every((oa, i) => {
      const ob = bo[i]
      if (!ob) return false
      return (
        oa.kind === ob.kind &&
        closeVec(oa.position, ob.position) &&
        Math.abs(oa.rotationY - ob.rotationY) < 0.01
      )
    })
  const hint = same
    ? `${ao.length} 个道具相同`
    : ao.length === bo.length
      ? `位置/朝向有变化`
      : `A ${ao.length}个 · B ${bo.length}个`
  return { category: 'objects', label: '道具', same, hint }
}

// v0.6e: in-studio control gear (black flag / reflector board / diffusion frame).
// Compares kind/position/rotationY AND size + visibility, because all of those
// change the gear's optical footprint (V0_6E_CLOSEOUT_SPEC §4.2).
function diffGear(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const ag = a.objects.filter((o) => isControlGearKind(o.kind))
  const bg = b.objects.filter((o) => isControlGearKind(o.kind))
  const same =
    ag.length === bg.length &&
    ag.every((oa, i) => {
      const ob = bg[i]
      if (!ob) return false
      return (
        oa.kind === ob.kind &&
        oa.visible === ob.visible &&
        closeVec(oa.position, ob.position) &&
        Math.abs(oa.rotationY - ob.rotationY) < 0.01 &&
        closeSize(oa.size, ob.size)
      )
    })
  const hint = same
    ? `${ag.length} 件控光器材相同`
    : ag.length === bg.length
      ? `位置/朝向/尺寸有变化`
      : `A ${ag.length}件 · B ${bg.length}件`
  return { category: 'gear', label: '控光器材', same, hint }
}

function diffPose(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const same =
    a.people.length === b.people.length &&
    a.people.every((pa, i) => {
      const pb = b.people[i]
      if (!pb) return false
      return samePose(pa.pose, pb.pose)
    })
  const hint = same
    ? `姿态相同`
    : `A 「${poseLabel(a.people[0])}」 · B 「${poseLabel(b.people[0])}」`
  return { category: 'pose', label: '姿态', same, hint }
}

function diffCamera(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const aTargetMode = a.camera.targetMode ?? 'manual'
  const bTargetMode = b.camera.targetMode ?? 'manual'
  const sameLockedPerson =
    aTargetMode === 'person' && bTargetMode === 'person'
      ? a.camera.targetPersonId === b.camera.targetPersonId
      : true
  const same =
    a.camera.aspectRatio === b.camera.aspectRatio &&
    a.camera.focalLength === b.camera.focalLength &&
    aTargetMode === bTargetMode &&
    sameLockedPerson &&
    closeVec(a.camera.position, b.camera.position) &&
    closeVec(a.camera.target, b.camera.target)
  const hint = same
    ? `焦段/机位相同`
    : `A ${a.camera.focalLength}mm · B ${b.camera.focalLength}mm`
  return { category: 'camera', label: '摄影机', same, hint }
}

function diffStudio(a: SceneConfig, b: SceneConfig): CategoryDiff {
  const same =
    a.studio.wallReflectance === b.studio.wallReflectance &&
    a.studio.floorReflectance === b.studio.floorReflectance &&
    a.studio.ambientLevel === b.studio.ambientLevel
  const hint = same
    ? `反射/环境相同`
    : `A 反射${a.studio.wallReflectance.toFixed(2)} · B 反射${b.studio.wallReflectance.toFixed(2)}`
  return { category: 'studio', label: '白棚', same, hint }
}

// ─── shared helpers ─────────────────────────────────────────────────────────

function closeVec(
  a: { x: number; y: number; z: number } | undefined,
  b: { x: number; y: number; z: number } | undefined,
  eps = 0.01,
): boolean {
  if (!a || !b) return a === b
  return (
    Math.abs(a.x - b.x) < eps &&
    Math.abs(a.y - b.y) < eps &&
    Math.abs(a.z - b.z) < eps
  )
}

function closeSize(a: SceneObjectSize, b: SceneObjectSize, eps = 0.01): boolean {
  return (
    Math.abs(a.width - b.width) < eps &&
    Math.abs(a.depth - b.depth) < eps &&
    Math.abs(a.height - b.height) < eps
  )
}

const POSE_NUMBER_KEYS: (keyof PoseConfig)[] = [
  'headYaw',
  'headPitch',
  'torsoYaw',
  'torsoPitch',
  'leftUpperArmPitch',
  'leftUpperArmRoll',
  'leftForearmBend',
  'leftForearmYaw',
  'rightUpperArmPitch',
  'rightUpperArmRoll',
  'rightForearmBend',
  'rightForearmYaw',
]

function samePose(a: PoseConfig | undefined, b: PoseConfig | undefined): boolean {
  if (!a || !b) return a === b
  return (
    a.presetId === b.presetId &&
    !!a.seated === !!b.seated &&
    POSE_NUMBER_KEYS.every((key) => Math.abs(Number(a[key] ?? 0) - Number(b[key] ?? 0)) < 0.01)
  )
}

function poseLabel(person: SceneConfig['people'][number] | undefined): string {
  if (!person) return '无'
  const id = person.pose?.presetId
  if (!id) return '站立'
  // Friendly labels for known presets; pass through the raw id if unknown.
  switch (id) {
    case 'neutral': return '自然站立'
    case 'side-standing': return '侧身'
    case 'head-to-key': return '头转向主光'
    case 'head-down': return '低头'
    case 'raise-hand': return '抬手'
    case 'arms-down': return '双手下垂'
    case 'hand-on-hip': return '叉腰'
    case 'lean-forward': return '前倾'
    case 'rim-stand': return '轮廓光姿势'
    case 'seated': return '坐姿'
    case 'seated-talk': return '前倾交谈'
    case 'seated-hands-knees': return '手放膝'
    case 'custom': return '自定义'
    default: return id
  }
}
