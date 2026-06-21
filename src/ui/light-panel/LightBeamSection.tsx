import type { LightConfig } from '../../types'
import { PanelSection, Slider } from '../controls'

export function LightBeamSection({
  light,
  onPatch,
  effectiveSummary,
}: {
  light: LightConfig
  onPatch: (patch: Partial<LightConfig>) => void
  // v0.6a: only set when a modifier is active — shows the post-modifier result so
  // the raw sliders below don't look "wrong" (e.g. slider 1.8 but image dimmer).
  effectiveSummary?: string
}) {
  return (
    <PanelSection title="光束 / 柔硬">
      {effectiveSummary && <p className="text-[11px] text-zinc-400">有效光质：{effectiveSummary}</p>}
      <Slider
        label="光束角"
        min={10}
        max={80}
        step={1}
        unit="°"
        value={light.beamAngle}
        onChange={(value) => onPatch({ beamAngle: value })}
        format={(value) => value.toFixed(0)}
      />
      <Slider
        label="柔硬程度"
        min={0}
        max={1}
        step={0.01}
        value={light.softness}
        onChange={(value) => onPatch({ softness: value })}
        format={(value) =>
          value < 0.25 ? `硬 ${value.toFixed(2)}` : value > 0.7 ? `柔 ${value.toFixed(2)}` : value.toFixed(2)
        }
      />
    </PanelSection>
  )
}
