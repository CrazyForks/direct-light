import type { LightConfig, PersonConfig, SceneObjectConfig, Vector3 } from '../types'
import { getPersonAimTarget } from '../domain/lightTargets'
import { CLEAR_SUPPORT_BINDING, recomputePersonFromSupport } from '../domain/supportSurfaces'

// Pure data helpers shared across the action factories. No set/get, no React,
// no Three.js — only scene-data transforms.

export function mapLights(
  lights: LightConfig[],
  id: string,
  fn: (l: LightConfig) => LightConfig,
): LightConfig[] {
  return lights.map((l) => (l.id === id ? fn(l) : l))
}

export function chestTarget(person: PersonConfig): Vector3 {
  return getPersonAimTarget(person)
}

// After `objects` changed, re-project every person who has a live
// attach-to-support binding so they follow the support. Cheap no-op for free
// people; a couple of trig ops per bound person.
export function carryBoundPeople(objects: SceneObjectConfig[], people: PersonConfig[]): PersonConfig[] {
  return people.map((p) => {
    if (!p.supportObjectId) return p
    const obj = objects.find((o) => o.id === p.supportObjectId)
    if (!obj) return p
    const delta = recomputePersonFromSupport(p, obj)
    return Object.keys(delta).length === 0 ? p : { ...p, ...delta }
  })
}

// Strip the attach-to-support binding from every person that referenced
// `objectId`. Used when the support object is deleted.
export function detachPeopleFrom(people: PersonConfig[], objectId: string): PersonConfig[] {
  return people.map((p) => (p.supportObjectId === objectId ? { ...p, ...CLEAR_SUPPORT_BINDING } : p))
}
