// v0.9a — pure data layer for user-authored ("custom") fixtures.
//
// This module is the schema made executable: it defines what a valid custom
// fixture is, how an untrusted value gets normalized/clamped into one, how to
// merge custom fixtures with the built-in library, and how to build a custom
// fixture from a live light ("存当前灯为器械"). It is intentionally pure — no
// React, no store, no localStorage, no Date.now() (timestamps come in via
// `now`). File-level import/export, pack-envelope parsing, cross-entry dedup,
// and user-facing messaging are v0.9b; dropdown/persistence/store are v0.9c.
//
// See V0_9_CUSTOM_FIXTURE_SPEC.md §3–§6.

import type {
  CustomFixturePreset,
  FixtureCategory,
  FixtureColorEngine,
  FixturePowerClass,
  FixturePreset,
  FixtureUse,
  LightConfig,
  LightType,
} from '../types'
import { FIXTURE_PRESETS } from '../data/fixturePresets'

// ---- schema / range constants ----

export const CUSTOM_FIXTURE_SCHEMA = 'direct-light/custom-fixtures'
export const CUSTOM_FIXTURE_SCHEMA_VERSION = 1

// directLightDefaults clamp ranges == the live UI slider ranges, so (1) every
// built-in preset normalizes with zero warnings and (2) a seeded custom value
// is always reachable by the sliders afterwards.
export const CUSTOM_FIXTURE_RANGES = {
  intensity: [0, 3],
  beamAngle: [10, 80],
  softness: [0, 1],
  distance: [1.5, 12],
  colorTemperature: [3000, 6800],
} as const

const FIXTURE_CATEGORIES: readonly FixtureCategory[] = ['cob', 'panel', 'tube', 'fresnel', 'practical', 'effect']
const FIXTURE_COLOR_ENGINES: readonly FixtureColorEngine[] = [
  'daylight',
  'tungsten',
  'bi-color',
  'rgb',
  'rgbww',
  'rgbacl',
  'nebula-c8',
]
const FIXTURE_POWER_CLASSES: readonly FixturePowerClass[] = ['small', 'medium', 'large', 'very-large']
const FIXTURE_USES: readonly FixtureUse[] = ['key', 'fill', 'rim', 'background', 'effect']
const LIGHT_TYPES: readonly LightType[] = ['hard', 'soft', 'panel']
const COLOR_ENGINES_WITH_COLOR: readonly FixtureColorEngine[] = ['rgb', 'rgbww', 'rgbacl', 'nebula-c8']

// ---- small pure utils ----

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isNumberPair(v: unknown): v is [number, number] {
  return Array.isArray(v) && v.length === 2 && isFiniteNumber(v[0]) && isFiniteNumber(v[1])
}

// Accept #rgb or #rrggbb (case-insensitive); return canonical lowercase
// #rrggbb, or null if not a valid hex color.
function normalizeHexColor(v: unknown): string | null {
  if (typeof v !== 'string') return null
  const s = v.trim().toLowerCase()
  if (/^#[0-9a-f]{6}$/.test(s)) return s
  if (/^#[0-9a-f]{3}$/.test(s)) return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`
  return null
}

// ---- identity / merge / lookup ----

const BUILTIN_FIXTURE_IDS = new Set(FIXTURE_PRESETS.map((p) => p.id))

/** True if `id` belongs to a bundled (built-in) fixture. */
export function isReservedFixtureId(id: string): boolean {
  return BUILTIN_FIXTURE_IDS.has(id)
}

/** Type guard: is this a user-authored fixture? */
export function isCustomFixture(f: FixturePreset): f is CustomFixturePreset {
  return f.source === 'custom'
}

/** Built-in library first, then custom. The dropdown groups by this order. */
export function getAllFixtures(custom: CustomFixturePreset[]): FixturePreset[] {
  return [...FIXTURE_PRESETS, ...custom]
}

/** Resolve a fixture id across built-in + custom (built-in wins on a tie). */
export function findFixtureById(id: string | undefined, custom: CustomFixturePreset[]): FixturePreset | undefined {
  if (!id) return undefined
  return FIXTURE_PRESETS.find((p) => p.id === id) ?? custom.find((p) => p.id === id)
}

function ensureCustomPrefix(id: string): string {
  const t = id.trim()
  return t.startsWith('custom-') ? t : `custom-${t}`
}

// A custom fixture id is always `custom-`-prefixed, which also guarantees it can
// never collide with a built-in id (those use `generic-`/`nanlux-`/… prefixes).
// Cross-entry dedup within one imported pack is handled in v0.9b.
function resolveCustomId(rawId: unknown, fallbackId: string): string {
  if (typeof rawId === 'string' && rawId.trim()) return ensureCustomPrefix(rawId)
  return ensureCustomPrefix(fallbackId)
}

// ---- coercion helpers ----

function coerceEnum<T extends string>(
  raw: unknown,
  allowed: readonly T[],
  fallback: T,
  field: string,
  warnings: string[],
): T {
  if (typeof raw === 'string' && (allowed as readonly string[]).includes(raw)) return raw as T
  if (raw !== undefined) warnings.push(`${field} 值无效，已回退为 ${fallback}。`)
  return fallback
}

function coerceEnumArray<T extends string>(raw: unknown, allowed: readonly T[]): T[] {
  if (!Array.isArray(raw)) return []
  const set = new Set<string>(allowed as readonly string[])
  return raw.filter((x): x is T => typeof x === 'string' && set.has(x))
}

// Absent → silent fallback; present-but-invalid or out-of-range → warning.
function clampNumberField(
  raw: unknown,
  range: readonly [number, number],
  fallback: number,
  field: string,
  warnings: string[],
): number {
  if (!isFiniteNumber(raw)) {
    if (raw !== undefined) warnings.push(`${field} 不是数字，已回退为 ${fallback}。`)
    return fallback
  }
  const c = clamp(raw, range[0], range[1])
  if (c !== raw) warnings.push(`${field} ${raw} 超出 [${range[0]}, ${range[1]}]，已钳制为 ${c}。`)
  return c
}

// ---- single-fixture normalize / validate (the schema, executable) ----

export type NormalizeFixtureResult = {
  fixture?: CustomFixturePreset
  errors: string[]
  warnings: string[]
}

/**
 * Validate + normalize one untrusted fixture value into a CustomFixturePreset.
 * Hard errors (not an object / no label / no directLightDefaults) reject the
 * entry (no `fixture`). Soft issues (bad enums, out-of-range numbers, bad color)
 * are clamped/defaulted and reported as warnings. Absent optional fields are
 * filled silently. `opts.fallbackId` is used when the input has no usable id;
 * `opts.now` stamps createdAt (if absent) and updatedAt.
 */
export function normalizeCustomFixture(
  input: unknown,
  opts: { fallbackId: string; now: number },
): NormalizeFixtureResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (!isPlainObject(input)) {
    errors.push('器械数据不是一个对象。')
    return { errors, warnings }
  }

  const label = typeof input.label === 'string' ? input.label.trim() : ''
  if (!label) errors.push('缺少器械名称（label）。')

  const dRaw = input.directLightDefaults
  if (!isPlainObject(dRaw)) errors.push('缺少 directLightDefaults（默认光质）。')

  if (errors.length > 0) return { errors, warnings }

  const d = dRaw as Record<string, unknown>

  let type: LightType = 'soft'
  if (typeof d.type === 'string' && (LIGHT_TYPES as readonly string[]).includes(d.type)) {
    type = d.type as LightType
  } else if (d.type !== undefined) {
    warnings.push('directLightDefaults.type 无效，已回退为 soft。')
  }

  const intensity = clampNumberField(d.intensity, CUSTOM_FIXTURE_RANGES.intensity, 1.2, 'directLightDefaults.intensity', warnings)
  const beamAngle = clampNumberField(d.beamAngle, CUSTOM_FIXTURE_RANGES.beamAngle, 50, 'directLightDefaults.beamAngle', warnings)
  const softness = clampNumberField(d.softness, CUSTOM_FIXTURE_RANGES.softness, 0.5, 'directLightDefaults.softness', warnings)
  const distance = clampNumberField(d.distance, CUSTOM_FIXTURE_RANGES.distance, 6, 'directLightDefaults.distance', warnings)

  let color = '#ffffff'
  const normColor = normalizeHexColor(d.color)
  if (normColor) color = normColor
  else if (d.color !== undefined) warnings.push('directLightDefaults.color 不是合法 #RRGGBB，已回退为 #ffffff。')

  let colorTemperature: number | undefined
  if (d.colorTemperature === undefined || d.colorTemperature === null) {
    colorTemperature = undefined
  } else if (isFiniteNumber(d.colorTemperature)) {
    const ct = CUSTOM_FIXTURE_RANGES.colorTemperature
    const c = clamp(d.colorTemperature, ct[0], ct[1])
    if (c !== d.colorTemperature) {
      warnings.push(`directLightDefaults.colorTemperature ${d.colorTemperature}K 超出 [${ct[0]}, ${ct[1]}]，已钳制为 ${c}K。`)
    }
    colorTemperature = c
  } else {
    warnings.push('directLightDefaults.colorTemperature 不是数字，已忽略。')
  }

  const category = coerceEnum(input.category, FIXTURE_CATEGORIES, 'cob', 'category', warnings)
  const colorEngine = coerceEnum(input.colorEngine, FIXTURE_COLOR_ENGINES, 'daylight', 'colorEngine', warnings)
  const powerClass = coerceEnum(input.powerClass, FIXTURE_POWER_CLASSES, 'medium', 'powerClass', warnings)

  const supportsColor =
    typeof input.supportsColor === 'boolean'
      ? input.supportsColor
      : (COLOR_ENGINES_WITH_COLOR as readonly string[]).includes(colorEngine)

  const recommendedUses = coerceEnumArray(input.recommendedUses, FIXTURE_USES)
  const defaultModifiers = Array.isArray(input.defaultModifiers)
    ? input.defaultModifiers.filter((x): x is string => typeof x === 'string')
    : []

  const fixture: CustomFixturePreset = {
    id: resolveCustomId(input.id, opts.fallbackId),
    label,
    brand: typeof input.brand === 'string' ? input.brand : 'Custom',
    model: typeof input.model === 'string' ? input.model : '',
    category,
    colorEngine,
    powerClass,
    supportsColor,
    nativeCctRange: isNumberPair(input.nativeCctRange) ? input.nativeCctRange : undefined,
    nativeBeamAngle: isFiniteNumber(input.nativeBeamAngle) ? input.nativeBeamAngle : undefined,
    officialPowerW: isFiniteNumber(input.officialPowerW) ? input.officialPowerW : undefined,
    recommendedUses,
    defaultModifiers,
    directLightDefaults: { type, intensity, beamAngle, softness, distance, color, colorTemperature },
    notes: typeof input.notes === 'string' ? input.notes : '',
    sourceUrl: typeof input.sourceUrl === 'string' ? input.sourceUrl : undefined,
    sourceCheckedAt: typeof input.sourceCheckedAt === 'string' ? input.sourceCheckedAt : undefined,
    source: 'custom',
    createdAt: isFiniteNumber(input.createdAt) ? input.createdAt : opts.now,
    updatedAt: opts.now,
  }
  return { fixture, errors, warnings }
}

// ---- "存当前灯为器械" ----

function lightTypeToCategory(type: LightType): FixtureCategory {
  // Rough heuristic; overridden by baseFixture when the light already came from
  // a fixture preset.
  return type === 'hard' ? 'cob' : 'panel'
}

/**
 * Build a custom fixture from a live light. Maps the light's quality params
 * into directLightDefaults (clamped to the usable ranges). When the light was
 * seeded from a fixture (`baseFixture`), its real-world metadata (brand/model/
 * category/color engine/…) is carried over; otherwise sensible defaults are
 * inferred from the light itself.
 */
export function buildCustomFixtureFromLight(
  light: LightConfig,
  opts: { name: string; id: string; now: number; baseFixture?: FixturePreset },
): CustomFixturePreset {
  const base = opts.baseFixture
  const r = CUSTOM_FIXTURE_RANGES
  const colorEngine: FixtureColorEngine = base?.colorEngine ?? (light.colorTemperature == null ? 'rgb' : 'daylight')
  const colorTemperature =
    light.colorTemperature == null ? undefined : clamp(light.colorTemperature, r.colorTemperature[0], r.colorTemperature[1])

  return {
    id: ensureCustomPrefix(opts.id),
    label: opts.name.trim() || base?.label || '自定义器械',
    brand: base?.brand ?? 'Custom',
    model: base?.model ?? '',
    category: base?.category ?? lightTypeToCategory(light.type),
    colorEngine,
    powerClass: base?.powerClass ?? 'medium',
    supportsColor: base?.supportsColor ?? (light.colorTemperature == null),
    nativeCctRange: base?.nativeCctRange,
    nativeBeamAngle: base?.nativeBeamAngle,
    officialPowerW: base?.officialPowerW,
    recommendedUses: base?.recommendedUses ?? [],
    defaultModifiers: base?.defaultModifiers ?? [],
    directLightDefaults: {
      type: light.type,
      intensity: clamp(light.intensity, r.intensity[0], r.intensity[1]),
      beamAngle: clamp(light.beamAngle, r.beamAngle[0], r.beamAngle[1]),
      softness: clamp(light.softness, r.softness[0], r.softness[1]),
      distance: clamp(light.distance, r.distance[0], r.distance[1]),
      color: normalizeHexColor(light.color) ?? '#ffffff',
      colorTemperature,
    },
    notes: base?.notes ?? '从当前灯保存。',
    source: 'custom',
    createdAt: opts.now,
    updatedAt: opts.now,
  }
}
