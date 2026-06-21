// Color helpers: hex parsing, saturation, color-temperature tint, and the
// "effective" emitted color of a light (base color modulated by temperature).

import { Color } from 'three'
import { COLOR_TEMPERATURE_PRESETS } from '../data/rendering'
import type { LightConfig } from '../types'

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = new Color(hex)
  return { r: c.r, g: c.g, b: c.b }
}

// HSL saturation in 0..1, used for the colored-bounce approximation (§10).
export function getSaturationFromHex(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max === min) return 0
  const l = (max + min) / 2
  const d = max - min
  return l > 0.5 ? d / (2 - max - min) : d / (max + min)
}

// Kelvin → hex by interpolating the spec's preset mapping (§11). Good enough
// for the prototype; a physical Kelvin→RGB curve can replace this later.
export function kelvinToColor(kelvin: number): Color {
  const presets = COLOR_TEMPERATURE_PRESETS
  if (kelvin <= presets[0].value) return new Color(presets[0].color)
  const last = presets[presets.length - 1]
  if (kelvin >= last.value) return new Color(last.color)
  for (let i = 0; i < presets.length - 1; i++) {
    const a = presets[i]
    const b = presets[i + 1]
    if (kelvin >= a.value && kelvin <= b.value) {
      const t = (kelvin - a.value) / (b.value - a.value)
      return new Color(a.color).lerp(new Color(b.color), t)
    }
  }
  return new Color('#ffffff')
}

// The color a light actually emits: base color modulated by its temperature.
// A white base + temperature → the temperature tint; a colored base passes
// through (multiplied by temperature if one is set).
export function effectiveLightColor(light: Pick<LightConfig, 'color' | 'colorTemperature'>): Color {
  const base = new Color(light.color)
  if (light.colorTemperature == null) return base
  const tint = kelvinToColor(light.colorTemperature)
  return base.clone().multiply(tint)
}

// Weighted-average blend of colors for the aggregate colored ambient bounce.
export function blendColors(entries: { color: Color; weight: number }[]): Color {
  const out = new Color(0, 0, 0)
  let total = 0
  for (const e of entries) {
    out.r += e.color.r * e.weight
    out.g += e.color.g * e.weight
    out.b += e.color.b * e.weight
    total += e.weight
  }
  if (total > 0) {
    out.r /= total
    out.g /= total
    out.b /= total
  }
  return out
}
