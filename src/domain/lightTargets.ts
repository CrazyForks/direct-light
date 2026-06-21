import type { LightConfig, LightTargetMode, PersonConfig, Vector3 } from '../types'
import { PERSON_TARGET } from '../data/rendering'

export const LIGHT_TARGET_MODE_LABELS: Record<LightTargetMode, string> = {
  manual: '手动',
  person: '锁定人物',
  peopleCenter: '多人中心',
}

export function getPersonAimTarget(person: PersonConfig): Vector3 {
  return {
    x: person.position.x,
    y: person.position.y + person.height * (PERSON_TARGET.y / 1.75),
    z: person.position.z,
  }
}

export function getPeopleCenterAimTarget(people: PersonConfig[]): Vector3 | null {
  if (!people.length) return null
  const sum = people.reduce(
    (acc, person) => {
      const target = getPersonAimTarget(person)
      return {
        x: acc.x + target.x,
        y: acc.y + target.y,
        z: acc.z + target.z,
      }
    },
    { x: 0, y: 0, z: 0 },
  )
  return {
    x: sum.x / people.length,
    y: sum.y / people.length,
    z: sum.z / people.length,
  }
}

export function getEffectiveLightTarget(light: LightConfig, people: PersonConfig[]): Vector3 {
  if (light.targetMode === 'person') {
    const person = people.find((p) => p.id === light.targetPersonId) ?? people[0]
    if (person) return getPersonAimTarget(person)
  }

  if (light.targetMode === 'peopleCenter') {
    const center = getPeopleCenterAimTarget(people)
    if (center) return center
  }

  return light.target
}
