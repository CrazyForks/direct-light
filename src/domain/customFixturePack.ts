// v0.9b — pack-level (file) import/export for custom fixtures. Pure: string in /
// structured out. Builds on normalizeCustomFixture (v0.9a). No UI, no IO side
// effects, no Date.now() (timestamps come in via `now`).
// See V0_9_CUSTOM_FIXTURE_SPEC.md §7.

import type { CustomFixturePack, CustomFixturePreset } from '../types'
import { CUSTOM_FIXTURE_SCHEMA, CUSTOM_FIXTURE_SCHEMA_VERSION, normalizeCustomFixture } from './customFixtures'

export type ParseCustomFixturePackResult = {
  fixtures: CustomFixturePreset[] // successfully normalized & de-duplicated
  errors: string[] // fatal + per-entry rejections, user-readable
  warnings: string[] // per-entry / envelope warnings, user-readable
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

// Return `id` if free, else the first free `${id}-2`, `${id}-3`, …
function uniqueId(id: string, taken: ReadonlySet<string>): string {
  if (!taken.has(id)) return id
  let n = 2
  while (taken.has(`${id}-${n}`)) n++
  return `${id}-${n}`
}

/**
 * Parse + validate a custom-fixture file (string) into normalized fixtures.
 * Accepts a full pack envelope, a bare fixtures array, or a single fixture
 * object. Per-entry problems are reported as `第 N 条：…` errors/warnings; bad
 * entries are skipped, good ones are id-deduped (within the pack and against
 * `takenIds`). Never throws.
 */
export function parseCustomFixturePack(
  text: string,
  opts: { now: number; takenIds?: ReadonlySet<string> },
): ParseCustomFixturePackResult {
  const warnings: string[] = []
  const errors: string[] = []
  const fixtures: CustomFixturePreset[] = []

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { fixtures: [], errors: ['文件不是合法 JSON。'], warnings: [] }
  }

  let rawFixtures: unknown[] | null = null

  if (Array.isArray(parsed)) {
    rawFixtures = parsed
    warnings.push('文件没有外层信封，已按器械数组导入。')
  } else if (isPlainObject(parsed)) {
    if (Array.isArray(parsed.fixtures)) {
      rawFixtures = parsed.fixtures
      if (parsed.schema !== undefined && parsed.schema !== CUSTOM_FIXTURE_SCHEMA) {
        warnings.push(`schema 标记不是 ${CUSTOM_FIXTURE_SCHEMA}，仍尝试导入。`)
      }
      if (typeof parsed.version === 'number' && parsed.version > CUSTOM_FIXTURE_SCHEMA_VERSION) {
        warnings.push(`文件版本 ${parsed.version} 高于当前支持的 ${CUSTOM_FIXTURE_SCHEMA_VERSION}，可能有字段无法识别。`)
      }
    } else if (parsed.directLightDefaults !== undefined || parsed.label !== undefined) {
      rawFixtures = [parsed]
      warnings.push('文件是单个器械，已按 1 条导入。')
    }
  }

  if (rawFixtures === null) {
    return { fixtures: [], errors: ['无法识别的文件结构：缺少 fixtures 数组。'], warnings }
  }

  if (rawFixtures.length === 0) {
    return { fixtures: [], errors: [], warnings: [...warnings, '文件里没有器械。'] }
  }

  const taken = new Set<string>(opts.takenIds ?? [])

  rawFixtures.forEach((entry, i) => {
    const fallbackId = `custom-imported-${i + 1}`
    const r = normalizeCustomFixture(entry, { fallbackId, now: opts.now })
    for (const msg of r.errors) errors.push(`第 ${i + 1} 条：${msg}`)
    for (const msg of r.warnings) warnings.push(`第 ${i + 1} 条：${msg}`)
    if (r.fixture) {
      const newId = uniqueId(r.fixture.id, taken)
      if (newId !== r.fixture.id) warnings.push(`第 ${i + 1} 条：器械 id 重复，已改为 ${newId}。`)
      taken.add(newId)
      fixtures.push({ ...r.fixture, id: newId })
    }
  })

  return { fixtures, errors, warnings }
}

/** Serialize fixtures into a pretty-printed pack file string. */
export function serializeCustomFixturePack(fixtures: CustomFixturePreset[], opts: { now: number }): string {
  const pack: CustomFixturePack = {
    schema: CUSTOM_FIXTURE_SCHEMA,
    version: CUSTOM_FIXTURE_SCHEMA_VERSION,
    exportedAt: opts.now,
    fixtures,
  }
  return JSON.stringify(pack, null, 2)
}
