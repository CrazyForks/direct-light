import { COLOR_PRESETS, COLOR_TEMPERATURE_PRESETS } from '../../data/rendering'
import type { LightConfig } from '../../types'
import { ColorField, Field, PanelSection, Slider, SwatchRow } from '../controls'

export function LightColorSection({
  light,
  onPatch,
}: {
  light: LightConfig
  onPatch: (patch: Partial<LightConfig>) => void
}) {
  return (
    <PanelSection title="颜色 / 色温">
      <SwatchRow
        swatches={COLOR_PRESETS.map((color) => ({ label: color.label, color: color.color }))}
        activeColor={light.color}
        onPick={(swatch) => {
          const preset = COLOR_PRESETS.find((color) => color.color === swatch.color)
          onPatch({ color: swatch.color, colorTemperature: preset?.temperature })
        }}
      />
      <ColorField
        label="自定义颜色"
        value={light.color}
        onChange={(value) => onPatch({ color: value, colorTemperature: undefined })}
      />
      <Field label={`色温（白光）${light.colorTemperature ? ` · ${light.colorTemperature}K` : ' · 关'}`}>
        <SwatchRow
          swatches={COLOR_TEMPERATURE_PRESETS.map((color) => ({ label: color.label, color: color.color }))}
          onPick={(swatch) => {
            const preset = COLOR_TEMPERATURE_PRESETS.find((color) => color.color === swatch.color)
            onPatch({ color: '#ffffff', colorTemperature: preset?.value })
          }}
        />
      </Field>
      {light.colorTemperature != null && (
        <Slider
          label="色温微调"
          min={3000}
          max={6800}
          step={50}
          unit="K"
          value={light.colorTemperature}
          onChange={(value) => onPatch({ color: '#ffffff', colorTemperature: value })}
        />
      )}
    </PanelSection>
  )
}
