import { FIXTURE_PRESETS } from '../../data/fixturePresets'
import { LIGHT_TYPE_LABELS } from '../../data/rendering'
import { isCustomFixture } from '../../domain/customFixtures'
import type { CustomFixturePreset, FixturePreset, LightConfig, LightType } from '../../types'
import { Field, PanelSection, Segmented, Toggle } from '../controls'
import { LightFixtureActions } from './LightFixtureActions'

function fixtureCapabilityLabel(fixture: FixturePreset) {
  if (fixture.supportsColor) return '全彩'
  if (fixture.colorEngine === 'bi-color') return '双色温'
  if (fixture.colorEngine === 'tungsten') return '暖色'
  return '白光'
}

export function LightBaseSection({
  light,
  fixture,
  customFixtures,
  onApplyFixture,
  onNameChange,
  onTypeChange,
  onToggle,
}: {
  light: LightConfig
  fixture?: FixturePreset
  customFixtures: CustomFixturePreset[]
  onApplyFixture: (fixturePresetId: string | undefined) => void
  onNameChange: (name: string) => void
  onTypeChange: (type: LightType) => void
  onToggle: () => void
}) {
  const fixtureSelectValue = fixture ? light.fixturePresetId ?? '' : ''

  return (
    <PanelSection title="基础">
      <Field label="器械">
        <div className="flex items-center gap-2">
          <select
            value={fixtureSelectValue}
            onChange={(e) => onApplyFixture(e.target.value || undefined)}
            className="min-w-0 flex-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          >
            <option value="">自定义参数</option>
            <optgroup label="内置器械">
              {FIXTURE_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </optgroup>
            {customFixtures.length > 0 && (
              <optgroup label="我的器械">
                {customFixtures.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
          {fixture && (
            <span className="shrink-0 rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-700">
              {fixtureCapabilityLabel(fixture)}
            </span>
          )}
          {fixture && isCustomFixture(fixture) && (
            <span className="shrink-0 rounded-md bg-violet-500/20 px-2 py-1 text-[11px] text-violet-200 ring-1 ring-violet-400/40">
              自定义
            </span>
          )}
        </div>
      </Field>
      <p className="text-[11px] text-zinc-500">选择灯具只设置默认光质，之后仍可手动微调。</p>
      <LightFixtureActions lightId={light.id} selectedFixture={fixture} />
      <Field label="灯名">
        <input
          value={light.name}
          onChange={(e) => onNameChange(e.target.value)}
          className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        />
      </Field>
      <Segmented
        label="类型"
        value={light.type}
        onChange={onTypeChange}
        options={[
          { value: 'hard', label: LIGHT_TYPE_LABELS.hard },
          { value: 'soft', label: LIGHT_TYPE_LABELS.soft },
          { value: 'panel', label: LIGHT_TYPE_LABELS.panel },
        ]}
      />
      <Toggle label="开关" checked={light.enabled} onChange={onToggle} />
    </PanelSection>
  )
}
