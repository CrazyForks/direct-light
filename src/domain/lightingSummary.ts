import type { SceneConfig, LightConfig } from '../types'

const typeLabelMap: Record<LightConfig['type'], string> = {
  hard: '硬光',
  soft: '柔光',
  panel: '面光',
}

export function summarizeLighting(scene: SceneConfig): string {
  const on = scene.lights.filter((l) => l.enabled === true)
  if (on.length === 0) return '无开启灯光'

  const key = on.reduce((a, b) => (b.intensity > a.intensity ? b : a))
  const typeLabel = typeLabelMap[key.type]
  const softPct = Math.round(key.softness * 100)
  const colorDesc =
    key.colorTemperature != null
      ? `${Math.round(key.colorTemperature)}K`
      : key.color.toUpperCase()

  return `${on.length} 灯 · 主${typeLabel} ${key.intensity.toFixed(1)} / 柔${softPct}% / ${colorDesc}`
}
