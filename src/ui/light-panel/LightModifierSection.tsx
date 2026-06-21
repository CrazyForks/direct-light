import { LIGHT_MODIFIER_PRESETS } from '../../data/lightModifiers'
import { getLightModifierPreset } from '../../domain/lightModifiers'
import { PanelSection } from '../controls'

// v0.6a: pick a control modifier (softbox / grid / reflector / diffusion) for the
// selected light. It only sets modifierId; effective light quality is recomputed
// at render, the raw sliders below stay editable.
export function LightModifierSection({
  modifierId,
  onApply,
}: {
  modifierId: string | undefined
  onApply: (modifierId: string | undefined) => void
}) {
  const modifier = getLightModifierPreset(modifierId)
  return (
    <PanelSection title="附件">
      <div className="flex items-center gap-2">
        <select
          value={modifierId ?? ''}
          onChange={(e) => onApply(e.target.value || undefined)}
          className="min-w-0 flex-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        >
          <option value="">无附件</option>
          {LIGHT_MODIFIER_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
        {modifier && (
          <span className="shrink-0 rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-700">
            {modifier.shortLabel}
          </span>
        )}
      </div>
      <p className="text-[11px] text-zinc-500">附件只改变有效光质，原始亮度、光束角和柔硬仍可手动微调。</p>
    </PanelSection>
  )
}
