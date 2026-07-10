// LocalStorage persistence for saved lighting presets, custom fixtures, app
// preferences, and first-run guidance.

import type { CustomFixturePreset, LightingPreset } from '../types'
import { DEFAULT_LANGUAGE, isAppLanguage, type AppLanguage } from '../i18n/languages'

const PRESETS_KEY = 'direct-light.presets.v1'
const CUSTOM_FIXTURES_KEY = 'direct-light.customFixtures.v1'
// v0.10: app language preference, kept independent from scenes and fixtures.
const LANGUAGE_KEY = 'direct-light.language.v1'
const ONBOARDING_KEY = 'direct-light.onboarding.v1'

export type OnboardingStatus = 'completed' | 'skipped'

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

export function savePresets(presets: LightingPreset[]): boolean {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets))
    return true
  } catch {
    return false
  }
}

// v0.9c: the user's custom fixture library (already-normalized entries; we only
// ever write CustomFixturePreset objects here).
export function loadCustomFixtures(): CustomFixturePreset[] {
  try {
    const raw = localStorage.getItem(CUSTOM_FIXTURES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CustomFixturePreset[]) : []
  } catch {
    return []
  }
}

export function saveCustomFixtures(fixtures: CustomFixturePreset[]): boolean {
  try {
    localStorage.setItem(CUSTOM_FIXTURES_KEY, JSON.stringify(fixtures))
    return true
  } catch {
    return false
  }
}

// v0.10: the selected UI language. An unknown/missing value degrades to the
// default (zh-CN) so a stale or hand-edited key never breaks startup.
export function loadLanguage(): AppLanguage {
  try {
    const raw = localStorage.getItem(LANGUAGE_KEY)
    return isAppLanguage(raw) ? raw : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function saveLanguage(language: AppLanguage): boolean {
  try {
    localStorage.setItem(LANGUAGE_KEY, language)
    return true
  } catch {
    return false
  }
}

// Onboarding is an app preference only. It never enters scene data, presets,
// A/B snapshots, or custom-fixture packs.
export function loadOnboardingStatus(): OnboardingStatus | null {
  try {
    const raw = localStorage.getItem(ONBOARDING_KEY)
    return raw === 'completed' || raw === 'skipped' ? raw : null
  } catch {
    return null
  }
}

export function saveOnboardingStatus(status: OnboardingStatus): boolean {
  try {
    localStorage.setItem(ONBOARDING_KEY, status)
    return true
  } catch {
    // A blocked preference write only means the guide may reappear next time.
    return false
  }
}

export function newId(prefix: string): string {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10)
  return `${prefix}-${rand}`
}
