// LocalStorage persistence for saved lighting presets.

import type { LightingPreset } from '../types'

const PRESETS_KEY = 'direct-light.presets.v1'

export function loadPresets(): LightingPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as LightingPreset[]) : []
  } catch {
    return []
  }
}

export function savePresets(presets: LightingPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
  } catch {
    // Quota or serialization issues are non-fatal for the prototype.
  }
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${rand}`
}
