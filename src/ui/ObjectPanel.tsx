import { useStore } from '../state/store'
import { SCENE_OBJECT_MATERIALS, isControlGearKind } from '../data/sceneObjects'
import { ColorField, Field, PanelSection, Segmented, Slider, Toggle } from './controls'
import { Header } from './PanelHeader'

export function ObjectPanel({ id }: { id: string }) {
  const obj = useStore((s) => s.scene.objects.find((o) => o.id === id))
  const updateObject = useStore((s) => s.updateObject)
  if (!obj) return null

  // v0.6c/d: control gear (black flag / reflector board / diffusion frame) has a
  // fixed material tied to its kind — the optics key off `kind`, not material — so
  // it must not expose a material picker.
  const isGear = isControlGearKind(obj.kind)

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title={obj.name} subtitle="道具 / 结构参数" />
      <PanelSection title="基础">
        <Field label="名称">
          <input
            value={obj.name}
            onChange={(e) => updateObject(id, { name: e.target.value })}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          />
        </Field>
        <Field label="类型">
          <span className="text-sm text-zinc-400">{obj.kind}</span>
        </Field>
        <Toggle label="显示" checked={obj.visible} onChange={(v) => updateObject(id, { visible: v })} />
      </PanelSection>
      <PanelSection title="位置 / 朝向">
        <Slider label="左右 X" min={-4} max={4} step={0.05} unit="m" value={obj.position.x} onChange={(v) => updateObject(id, { position: { ...obj.position, x: v } })} />
        <Slider label="离地 Y" min={0} max={1.5} step={0.05} unit="m" value={obj.position.y} onChange={(v) => updateObject(id, { position: { ...obj.position, y: v } })} />
        <Slider label="前后 Z" min={-4} max={4} step={0.05} unit="m" value={obj.position.z} onChange={(v) => updateObject(id, { position: { ...obj.position, z: v } })} />
        <Slider label="朝向" min={-180} max={180} step={1} unit="°" value={(obj.rotationY * 180) / Math.PI} onChange={(v) => updateObject(id, { rotationY: (v * Math.PI) / 180 })} format={(v) => v.toFixed(0)} />
      </PanelSection>
      <PanelSection title="尺寸">
        <Slider label="宽" min={0.1} max={4} step={0.05} unit="m" value={obj.size.width} onChange={(v) => updateObject(id, { size: { ...obj.size, width: v } })} />
        <Slider label="深" min={0.1} max={4} step={0.05} unit="m" value={obj.size.depth} onChange={(v) => updateObject(id, { size: { ...obj.size, depth: v } })} />
        <Slider label="高" min={0.1} max={3} step={0.05} unit="m" value={obj.size.height} onChange={(v) => updateObject(id, { size: { ...obj.size, height: v } })} />
      </PanelSection>
      <PanelSection title="外观">
        {!isGear && (
          <Segmented
            label="材质"
            value={obj.material}
            onChange={(v) => updateObject(id, { material: v, color: SCENE_OBJECT_MATERIALS[v].color })}
            options={(Object.keys(SCENE_OBJECT_MATERIALS) as Array<keyof typeof SCENE_OBJECT_MATERIALS>).map((k) => ({
              value: k,
              label: SCENE_OBJECT_MATERIALS[k].label,
            }))}
          />
        )}
        <ColorField label="颜色" value={obj.color} onChange={(v) => updateObject(id, { color: v })} />
      </PanelSection>
      <PanelSection title="阴影">
        {/* v0.6c/d: control gear must not cast a hard mesh shadow — its optics are
            the derived approximation in controlGearOptics.ts, not a Three.js shadow
            (V0_6D_OPTICS_SPEC §2). So gear hides the 投射阴影 toggle. */}
        {!isGear && (
          <Toggle label="投射阴影" checked={obj.castShadow} onChange={(v) => updateObject(id, { castShadow: v })} />
        )}
        <Toggle label="接收阴影" checked={obj.receiveShadow} onChange={(v) => updateObject(id, { receiveShadow: v })} />
        <Toggle label="俯视标签" checked={obj.showLabel} onChange={(v) => updateObject(id, { showLabel: v })} />
      </PanelSection>
    </div>
  )
}
