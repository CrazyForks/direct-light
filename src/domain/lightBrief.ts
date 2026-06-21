import type { LightConfig } from '../types'
import { FIXTURE_PRESETS } from '../data/fixturePresets'
import { LIGHT_MODIFIER_PRESETS } from '../data/lightModifiers'

// v0.6b director-facing brief. Generates a one-line summary for the selected
// light in camera view. Copy verbatim from V0_6B_VISUAL_BRIEF_SPEC.md §4:
// - 有灯具 + 有附件: `Key Light · Nanlux Evoke 600C · 中号柔光箱 · 柔光主光`
// - 有灯具 + 无附件: `Key Light · Nanlux Evoke 600C · 无附件`
// - 无灯具 + 有附件: `Key Light · 自定义灯具 · 柔光布 · 扩散片`
// - 无灯具 + 无附件: `Key Light · 自定义灯具 · 无附件`
export function getLightBrief(light: LightConfig): string {
  const fixture = FIXTURE_PRESETS.find(f => f.id === light.fixturePresetId)
  const modifier = LIGHT_MODIFIER_PRESETS.find(m => m.id === light.modifierId)

  const namePart = light.name || '未命名灯'
  const fixturePart = fixture ? fixture.label : '自定义灯具'

  if (modifier) {
    const effectPart = getModifierEffectPhrase(modifier.id)
    return `${namePart} · ${fixturePart} · ${modifier.label} · ${effectPart}`
  }

  return `${namePart} · ${fixturePart} · 无附件`
}

// Effect phrase mapping from V0_6B_VISUAL_BRIEF_SPEC.md §4 table.
// | 附件 | 效果短语 |
// | --- | --- |
// | 中号柔光箱 | 柔光主光 |
// | 蜂巢 | 收束控光 |
// | 标准反光罩 | 集中硬光 |
// | 柔光布 | 扩散片 |
// | 无附件 | 可手动调光 |
function getModifierEffectPhrase(modifierId: string): string {
  switch (modifierId) {
    case 'softbox-medium':
      return '柔光主光'
    case 'honeycomb-grid':
      return '收束控光'
    case 'standard-reflector':
      return '集中硬光'
    case 'diffusion-cloth':
      return '扩散片'
    default:
      return '可手动调光'
  }
}
