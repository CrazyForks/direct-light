import { useStore } from '../state/store'
import { buildSupportBinding, CLEAR_SUPPORT_BINDING, getPersonSupportSurfaces } from '../domain/supportSurfaces'
import { DEFAULT_POSE, POSE_PRESETS, SEATED_HIP_HEIGHT } from '../data/poses'
import type { PoseConfig } from '../types'
import { ColorField, Field, PanelSection, Slider, Toggle } from './controls'
import { Header } from './PanelHeader'

export function PersonPanel({ id }: { id: string }) {
  const person = useStore((s) => s.scene.people.find((p) => p.id === id))
  const objects = useStore((s) => s.scene.objects)
  const updatePerson = useStore((s) => s.updatePerson)
  if (!person) return null

  const pose = { ...DEFAULT_POSE, ...(person.pose ?? {}) }
  const posePresetValue = POSE_PRESETS.some((p) => p.id === pose.presetId) ? pose.presetId : 'custom'
  const setPose = (patch: Partial<PoseConfig>) => updatePerson(id, { pose: { ...pose, presetId: 'custom', ...patch } })
  const supportSurfaces = getPersonSupportSurfaces(objects)

  // Seated hips sit at the group origin, so a floor-standing actor (y≈0) needs a
  // lift to seat height for the feet to land on the floor; standing back up from
  // that lifted height returns to the floor. Real seats set the exact Y instead.
  const reconcileY = (nextSeated: boolean) => {
    if (nextSeated && person.position.y < 0.1) return SEATED_HIP_HEIGHT
    if (!nextSeated && Math.abs(person.position.y - SEATED_HIP_HEIGHT) < 0.08) return 0
    return person.position.y
  }
  const applyPosePreset = (presetId: string) => {
    const preset = POSE_PRESETS.find((pp) => pp.id === presetId)
    if (!preset) return
    updatePerson(id, {
      pose: { ...preset.pose },
      position: { ...person.position, y: reconcileY(!!preset.pose.seated) },
    })
  }
  const setSeated = (nextSeated: boolean) =>
    updatePerson(id, {
      pose: { ...pose, presetId: 'custom', seated: nextSeated },
      position: { ...person.position, y: reconcileY(nextSeated) },
    })

  const placeOnSurface = (objectId: string) => {
    const surface = supportSurfaces.find((s) => s.object.id === objectId)
    if (!surface) return
    const position = { x: surface.object.position.x, y: surface.y, z: surface.object.position.z }
    // Build the attach-to-support binding BEFORE mutating the person's
    // position/rotationY — we want the offset to match the support placement
    // point, not any subsequent manual tweak.
    const binding = buildSupportBinding(
      // project the person to the future (post-placement) position so the
      // binding reflects it
      { ...person, position, rotationY: person.rotationY },
      surface.object,
    )
    if (surface.role === 'seat') {
      // sit on the seat: clean seated preset, hips at the seat top
      const seatedPose = POSE_PRESETS.find((pp) => pp.id === 'seated')?.pose ?? { ...DEFAULT_POSE, seated: true }
      updatePerson(id, { position, pose: { ...seatedPose }, ...binding })
    } else {
      // stand on the surface: feet at the top; stand up if we were seated
      updatePerson(id, { position, pose: pose.seated ? { ...DEFAULT_POSE } : pose, ...binding })
    }
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title={person.name} subtitle="人物参数" />
      <PanelSection title="基础">
        <Field label="名称">
          <input
            value={person.name}
            onChange={(e) => updatePerson(id, { name: e.target.value })}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          />
        </Field>
        <Slider label="身高" min={1.4} max={2.05} step={0.01} unit="m" value={person.height} onChange={(v) => updatePerson(id, { height: v })} />
        <Slider label="朝向" min={-180} max={180} step={1} unit="°" value={(person.rotationY * 180) / Math.PI} onChange={(v) => updatePerson(id, { rotationY: (v * Math.PI) / 180 })} format={(v) => v.toFixed(0)} />
      </PanelSection>
      <PanelSection title="位置">
        <Slider label="左右 X" min={-4} max={4} step={0.05} unit="m" value={person.position.x} onChange={(v) => updatePerson(id, { position: { ...person.position, x: v } })} />
        <Slider label="离地 Y" min={0} max={1.5} step={0.05} unit="m" value={person.position.y} onChange={(v) => updatePerson(id, { position: { ...person.position, y: v } })} />
        <Slider label="前后 Z" min={-4} max={4} step={0.05} unit="m" value={person.position.z} onChange={(v) => updatePerson(id, { position: { ...person.position, z: v } })} />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          {supportSurfaces.length > 0 ? (
            <Field label="放到承载物">
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) placeOnSurface(e.target.value)
                  e.target.value = ''
                }}
                className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
              >
                <option value="" disabled>
                  选择桌面 / 椅面 / 舞台
                </option>
                {supportSurfaces.map((surface) => (
                  <option key={surface.object.id} value={surface.object.id}>
                    {surface.label}
                  </option>
                ))}
              </select>
            </Field>
          ) : (
            <Field label="放到承载物">
              <span className="rounded-lg bg-zinc-800/30 px-3 py-2 text-sm text-zinc-500">先添加桌椅或舞台</span>
            </Field>
          )}
          <button
            onClick={() =>
              updatePerson(id, {
                position: { ...person.position, y: 0 },
                // standing back up on the floor: drop the seated fold + detach
                // from the support so future object moves don't drag the actor.
                pose: pose.seated ? { ...DEFAULT_POSE } : pose,
                ...CLEAR_SUPPORT_BINDING,
              })
            }
            className="self-end rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
          >
            {pose.seated ? '起立回地面' : '回到地面'}
          </button>
        </div>
      </PanelSection>
      <PanelSection title="姿态">
        <Field label="预设姿态">
          <select
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
            value={posePresetValue}
            onChange={(e) => applyPosePreset(e.target.value)}
          >
            {posePresetValue === 'custom' && <option value="custom">自定义微调</option>}
            {POSE_PRESETS.map((pp) => (
              <option key={pp.id} value={pp.id}>
                {pp.label}
              </option>
            ))}
          </select>
        </Field>
        <Toggle label="坐姿（折叠双腿）" checked={!!pose.seated} onChange={setSeated} />
        <p className="text-[11px] text-zinc-500">放到椅子/沙发/凳子会自动坐下；选预设后可在下方微调</p>
      </PanelSection>
      <PanelSection title="姿态微调">
        <Slider label="头·左右" min={-80} max={80} step={1} unit="°" value={pose.headYaw} onChange={(v) => setPose({ headYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label="头·俯仰" min={-45} max={45} step={1} unit="°" value={pose.headPitch} onChange={(v) => setPose({ headPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label="躯干·转身" min={-60} max={60} step={1} unit="°" value={pose.torsoYaw} onChange={(v) => setPose({ torsoYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label="躯干·前倾" min={-20} max={40} step={1} unit="°" value={pose.torsoPitch} onChange={(v) => setPose({ torsoPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label="左上臂·抬起" min={-170} max={170} step={1} unit="°" value={pose.leftUpperArmPitch} onChange={(v) => setPose({ leftUpperArmPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label="左上臂·外展" min={0} max={170} step={1} unit="°" value={pose.leftUpperArmRoll} onChange={(v) => setPose({ leftUpperArmRoll: v })} format={(v) => v.toFixed(0)} />
        <Slider label="左前臂·弯曲" min={0} max={150} step={1} unit="°" value={pose.leftForearmBend} onChange={(v) => setPose({ leftForearmBend: v })} format={(v) => v.toFixed(0)} />
        <Slider label="左前臂·内旋" min={-90} max={90} step={1} unit="°" value={pose.leftForearmYaw} onChange={(v) => setPose({ leftForearmYaw: v })} format={(v) => v.toFixed(0)} />
        <Slider label="右上臂·抬起" min={-170} max={170} step={1} unit="°" value={pose.rightUpperArmPitch} onChange={(v) => setPose({ rightUpperArmPitch: v })} format={(v) => v.toFixed(0)} />
        <Slider label="右上臂·外展" min={0} max={170} step={1} unit="°" value={pose.rightUpperArmRoll} onChange={(v) => setPose({ rightUpperArmRoll: v })} format={(v) => v.toFixed(0)} />
        <Slider label="右前臂·弯曲" min={0} max={150} step={1} unit="°" value={pose.rightForearmBend} onChange={(v) => setPose({ rightForearmBend: v })} format={(v) => v.toFixed(0)} />
        <Slider label="右前臂·内旋" min={-90} max={90} step={1} unit="°" value={pose.rightForearmYaw} onChange={(v) => setPose({ rightForearmYaw: v })} format={(v) => v.toFixed(0)} />
      </PanelSection>
      <PanelSection title="外观">
        <ColorField label="肤色" value={person.skinTone} onChange={(v) => updatePerson(id, { skinTone: v })} />
        <ColorField label="服装颜色" value={person.clothingColor} onChange={(v) => updatePerson(id, { clothingColor: v })} />
        <Toggle label="显示面部朝向" checked={person.showFacePlane} onChange={(v) => updatePerson(id, { showFacePlane: v })} />
      </PanelSection>
    </div>
  )
}
