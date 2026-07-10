import type { LightConfig, PersonConfig, PoseConfig, SceneConfig } from '../types'
import { isControlGearKind } from '../data/sceneObjects'
import { t, type AppLanguage } from '../i18n'
import { getPosePresetLabel } from '../i18n/display'

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
  label: string // localized category label
  same: boolean
  hint: string // localized one-line hint
}

export function compareScenes(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff[] {
  return [
    diffLights(a, b, language),
    diffPeople(a, b, language),
    diffObjects(a, b, language),
    diffGear(a, b, language),
    diffPose(a, b, language),
    diffCamera(a, b, language),
    diffStudio(a, b, language),
  ]
}

// ─── per-category diff helpers (pure) ─────────────────────────────────────

function diffLights(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const aOn = a.lights.filter((l) => l.enabled).length
  const bOn = b.lights.filter((l) => l.enabled).length
  const same =
    sameById(a.lights, b.lights, sameLight)
  const hint = same
    ? t(language, 'sceneDiff.lights.same')
    : aOn === bOn && a.lights.length === b.lights.length
      ? t(language, 'sceneDiff.lights.changed')
      : t(language, 'sceneDiff.lights.counts', { aOn, aTotal: a.lights.length, bOn, bTotal: b.lights.length })
  return { category: 'lights', label: t(language, 'diffCategory.lights'), same, hint }
}

function diffPeople(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same =
    sameById(a.people, b.people, samePersonWithoutPose)
  const hint = same
    ? t(language, 'sceneDiff.people.same', { count: a.people.length })
    : a.people.length === b.people.length
      ? t(language, 'sceneDiff.people.changed')
      : t(language, 'sceneDiff.people.counts', { aCount: a.people.length, bCount: b.people.length })
  return { category: 'people', label: t(language, 'diffCategory.people'), same, hint }
}

// v0.6e: props only (gear is split into diffGear below).
function diffObjects(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const ao = a.objects.filter((o) => !isControlGearKind(o.kind))
  const bo = b.objects.filter((o) => !isControlGearKind(o.kind))
  const same =
    sameById(ao, bo, sameValue)
  const hint = same
    ? t(language, 'sceneDiff.objects.same', { count: ao.length })
    : ao.length === bo.length
      ? t(language, 'sceneDiff.objects.changed')
      : t(language, 'sceneDiff.objects.counts', { aCount: ao.length, bCount: bo.length })
  return { category: 'objects', label: t(language, 'diffCategory.objects'), same, hint }
}

// v0.6e: in-studio control gear (black flag / reflector board / diffusion frame).
// Compares kind/position/rotationY AND size + visibility, because all of those
// change the gear's optical footprint (V0_6E_CLOSEOUT_SPEC §4.2).
function diffGear(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const ag = a.objects.filter((o) => isControlGearKind(o.kind))
  const bg = b.objects.filter((o) => isControlGearKind(o.kind))
  const same =
    sameById(ag, bg, sameValue)
  const hint = same
    ? t(language, 'sceneDiff.gear.same', { count: ag.length })
    : ag.length === bg.length
      ? t(language, 'sceneDiff.gear.changed')
      : t(language, 'sceneDiff.gear.counts', { aCount: ag.length, bCount: bg.length })
  return { category: 'gear', label: t(language, 'diffCategory.gear'), same, hint }
}

function diffPose(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same =
    sameById(a.people, b.people, (pa, pb) => samePose(pa.pose, pb.pose))
  const hint = same
    ? t(language, 'sceneDiff.pose.same')
    : t(language, 'sceneDiff.pose.changed', {
        aPose: poseLabel(a.people[0], language),
        bPose: poseLabel(b.people[0], language),
      })
  return { category: 'pose', label: t(language, 'diffCategory.pose'), same, hint }
}

function diffCamera(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const normalizeCamera = (scene: SceneConfig) => {
    const mode = scene.camera.targetMode ?? 'manual'
    return {
      ...scene.camera,
      targetMode: mode,
      targetPersonId: mode === 'person' ? scene.camera.targetPersonId : undefined,
    }
  }
  const same = sameValue(normalizeCamera(a), normalizeCamera(b))
  const hint = same
    ? t(language, 'sceneDiff.camera.same')
    : t(language, 'sceneDiff.camera.changed', { aFocal: a.camera.focalLength, bFocal: b.camera.focalLength })
  return { category: 'camera', label: t(language, 'diffCategory.camera'), same, hint }
}

function diffStudio(a: SceneConfig, b: SceneConfig, language: AppLanguage): CategoryDiff {
  const same = sameValue(
    { ...a.studio, shadowMode: a.studio.shadowMode ?? 'variance' },
    { ...b.studio, shadowMode: b.studio.shadowMode ?? 'variance' },
  )
  const hint = same
    ? t(language, 'sceneDiff.studio.same')
    : t(language, 'sceneDiff.studio.changed', {
        aReflectance: a.studio.wallReflectance.toFixed(2),
        bReflectance: b.studio.wallReflectance.toFixed(2),
      })
  return { category: 'studio', label: t(language, 'diffCategory.studio'), same, hint }
}

// ─── shared helpers ─────────────────────────────────────────────────────────

function samePose(a: PoseConfig | undefined, b: PoseConfig | undefined): boolean {
  return sameValue(a, b)
}

function sameLight(a: LightConfig, b: LightConfig): boolean {
  const normalize = (light: LightConfig) => {
    const targetMode = light.targetMode ?? 'manual'
    return {
      ...light,
      targetMode,
      targetPersonId: targetMode === 'person' ? light.targetPersonId : undefined,
      normalBias: light.normalBias ?? 0,
    }
  }
  return sameValue(normalize(a), normalize(b))
}

function samePersonWithoutPose(a: PersonConfig, b: PersonConfig): boolean {
  const normalize = (person: PersonConfig) => {
    const rest: Partial<PersonConfig> = { ...person }
    delete rest.pose
    return { ...rest, modelVariant: person.modelVariant ?? 'dummy' }
  }
  return sameValue(normalize(a), normalize(b))
}

function sameById<T extends { id: string }>(
  a: T[],
  b: T[],
  compare: (left: T, right: T) => boolean,
): boolean {
  if (a.length !== b.length) return false
  const rightById = new Map(b.map((entry) => [entry.id, entry]))
  return a.every((entry) => {
    const other = rightById.get(entry.id)
    return other ? compare(entry, other) : false
  })
}

function sameValue(a: unknown, b: unknown, eps = 0.01): boolean {
  if (Object.is(a, b)) return true
  if (typeof a === 'number' && typeof b === 'number') return Math.abs(a - b) < eps
  if (Array.isArray(a) || Array.isArray(b)) {
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((value, index) => sameValue(value, b[index], eps))
  }
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false

  const left = a as Record<string, unknown>
  const right = b as Record<string, unknown>
  const leftKeys = Object.keys(left).filter((key) => left[key] !== undefined).sort()
  const rightKeys = Object.keys(right).filter((key) => right[key] !== undefined).sort()
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key, index) => key === rightKeys[index] && sameValue(left[key], right[key], eps))
  )
}

// v0.10.1: localized via getPosePresetLabel (which also maps legacy aliases).
// no person → "none"; person with no presetId → standing fallback.
function poseLabel(person: SceneConfig['people'][number] | undefined, language: AppLanguage): string {
  if (!person) return getPosePresetLabel(language, 'none')
  return getPosePresetLabel(language, person.pose?.presetId)
}
