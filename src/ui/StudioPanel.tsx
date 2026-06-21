import { useStore } from '../state/store'
import { ColorField, PanelSection, Slider, Toggle } from './controls'
import { Header } from './PanelHeader'

export function StudioPanel() {
  const studio = useStore((s) => s.scene.studio)
  const updateStudio = useStore((s) => s.updateStudio)
  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title="白色影棚" subtitle="空间与反射" />
      <PanelSection title="尺寸">
        <Slider label="棚宽" min={4} max={14} step={0.5} unit="m" value={studio.width} onChange={(v) => updateStudio({ width: v })} />
        <Slider label="棚深" min={4} max={16} step={0.5} unit="m" value={studio.depth} onChange={(v) => updateStudio({ depth: v })} />
        <Slider label="棚高" min={3} max={8} step={0.5} unit="m" value={studio.height} onChange={(v) => updateStudio({ height: v })} />
      </PanelSection>
      <PanelSection title="反射 / 环境">
        <Slider label="墙面反射" min={0} max={1} step={0.01} value={studio.wallReflectance} onChange={(v) => updateStudio({ wallReflectance: v })} />
        <Slider label="地面反射" min={0} max={1} step={0.01} value={studio.floorReflectance} onChange={(v) => updateStudio({ floorReflectance: v })} />
        <Slider label="环境基础亮度" min={0} max={1} step={0.01} value={studio.ambientLevel} onChange={(v) => updateStudio({ ambientLevel: v })} />
      </PanelSection>
      <PanelSection title="结构">
        <Toggle label="无缝弧形背景" checked={studio.hasCyclorama} onChange={(v) => updateStudio({ hasCyclorama: v })} />
        <Toggle label="侧墙" checked={studio.showSideWalls} onChange={(v) => updateStudio({ showSideWalls: v })} />
        <Toggle label="顶面" checked={studio.showCeiling} onChange={(v) => updateStudio({ showCeiling: v })} />
        <ColorField label="墙面颜色" value={studio.wallColor} onChange={(v) => updateStudio({ wallColor: v })} />
        <ColorField label="地面颜色" value={studio.floorColor} onChange={(v) => updateStudio({ floorColor: v })} />
      </PanelSection>
    </div>
  )
}
