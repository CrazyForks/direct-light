// Derives the global fill (ambient + hemisphere) and the colored bounce from
// the studio reflectance and the enabled lights, per RENDERING_SPEC §9.3 / §10.

import { Color } from 'three'
import type { LightConfig, PersonConfig, SceneObjectConfig, StudioConfig } from '../types'
import {
  getAmbientIntensity,
  getColorBounceIntensity,
  getHemisphereIntensity,
} from '../data/rendering'
import { blendColors, effectiveLightColor, getSaturationFromHex } from '../lib/color'
import { getEffectiveLightParams } from '../domain/lightModifiers'
import { getEffectiveLightTarget } from '../domain/lightTargets'
import { getGearLightOptics, getNegativeFillFactor } from '../domain/controlGearOptics'

// three.js lights are physically based (candela); spec intensities are
// artistic 1–2.5 values, so we scale into a pleasant range. Calibration knob.
export const SPOT_INTENSITY_SCALE = 9

const DEFAULT_AMBIENT_LEVEL = 0.35

export type GlobalFill = {
  ambientIntensity: number
  hemisphereIntensity: number
  bounceColor: Color
  bounceIntensity: number
}

export function computeGlobalFill(
  studio: StudioConfig,
  lights: LightConfig[],
  // v0.6d (optional, defaults preserve pre-v0.6d behavior): in-studio control
  // gear. Black flags near the subject eat global bounce; a gear cut/diffusion in
  // a light's path also trims that light's colored spill.
  objects: SceneObjectConfig[] = [],
  people: PersonConfig[] = [],
): GlobalFill {
  const factor = studio.ambientLevel / DEFAULT_AMBIENT_LEVEL
  let ambientIntensity = getAmbientIntensity(studio.wallReflectance, studio.floorReflectance) * factor
  let hemisphereIntensity = getHemisphereIntensity(studio.wallReflectance, studio.floorReflectance) * factor

  // Aggregate colored bounce from saturated enabled lights.
  const contributions = lights
    .filter((l) => l.enabled)
    .map((l) => {
      const saturation = getSaturationFromHex(l.color)
      // v0.6a: a modifier's spillMultiplier scales colored bounce (e.g. honeycomb
      // cuts spill to ~0.42); the raw light is unchanged.
      // v0.6d: a black flag / diffusion frame in this light's path further trims
      // its spill via the gear optics spillMultiplier.
      const gearSpill = getGearLightOptics(l, getEffectiveLightTarget(l, people), objects).spillMultiplier
      const spill = getEffectiveLightParams(l).spillMultiplier * gearSpill
      const intensity =
        getColorBounceIntensity(l.intensity, saturation, studio.wallReflectance, studio.floorReflectance) * spill
      return { color: effectiveLightColor(l), weight: intensity, intensity }
    })
    .filter((c) => c.intensity > 0.001)

  const bounceColor = blendColors(contributions)
  // cap raised 0.28 → 0.34 to match the new per-light cap, so high-reflectance
  // studios can show the stronger colored bounce v0.5.1 §4.3 intends.
  let bounceIntensity = Math.min(
    0.34,
    contributions.reduce((sum, c) => sum + c.intensity, 0),
  )

  // v0.6d: black flags near the subject eat ambient / hemisphere / bounce.
  // getNegativeFillFactor returns 1 when there are no flags or no people.
  const negativeFill = getNegativeFillFactor(objects, people)
  ambientIntensity *= negativeFill
  hemisphereIntensity *= negativeFill
  bounceIntensity *= negativeFill

  return { ambientIntensity, hemisphereIntensity, bounceColor, bounceIntensity }
}
