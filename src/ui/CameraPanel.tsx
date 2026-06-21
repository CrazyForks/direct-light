import { useStore } from '../state/store'
import type { AspectRatio, CameraTargetMode } from '../types'
import { CAMERA_PRESETS } from '../data/cameraPresets'
import { cameraAzimuthDeg, cameraHorizontalDistance, cameraPositionFromPolar } from '../domain/cameraMath'
import { Field, PanelSection, Segmented, Slider } from './controls'
import { Header } from './PanelHeader'

export function CameraPanel() {
  const camera = useStore((s) => s.scene.camera)
  const people = useStore((s) => s.scene.people)
  const viewMode = useStore((s) => s.viewMode)
  const updateCamera = useStore((s) => s.updateCamera)
  const setViewMode = useStore((s) => s.setViewMode)
  const setCameraTargetMode = useStore((s) => s.setCameraTargetMode)
  const aimCameraAtPerson = useStore((s) => s.aimCameraAtPerson)
  const applyCameraPreset = useStore((s) => s.applyCameraPreset)
  const requestFreeCameraCapture = useStore((s) => s.requestFreeCameraCapture)

  const dist = cameraHorizontalDistance(camera.position, camera.target)
  const az = cameraAzimuthDeg(camera.position, camera.target)
  const setPolar = (d: number, a: number) =>
    updateCamera({ position: cameraPositionFromPolar(camera.target, d, a, camera.position.y) })

  const isFree = viewMode === 'free'
  const targetMode = camera.targetMode ?? 'manual'
  const lockedPersonId = camera.targetPersonId ?? people[0]?.id
  const aimName = people.find((p) => p.id === lockedPersonId)?.name ?? 'Actor A'

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <Header title="主摄影机" subtitle="镜头与机位" />

      <PanelSection title="镜头">
        <Slider
          label="焦段（等效）"
          min={18}
          max={85}
          step={1}
          unit="mm"
          value={camera.focalLength}
          onChange={(v) => updateCamera({ focalLength: v })}
          format={(v) => v.toFixed(0)}
        />
        <Segmented<AspectRatio>
          label="画幅"
          value={camera.aspectRatio}
          onChange={(v) => updateCamera({ aspectRatio: v })}
          options={[
            { value: '16:9', label: '16:9' },
            { value: '4:3', label: '4:3' },
            { value: '1:1', label: '1:1' },
            { value: '9:16', label: '9:16' },
          ]}
        />
      </PanelSection>

      <PanelSection title="机位">
        <Slider label="方位角" min={-180} max={180} step={1} unit="°" value={az} onChange={(v) => setPolar(dist, v)} format={(v) => v.toFixed(0)} />
        <Slider label="距离" min={2} max={10} step={0.1} unit="m" value={dist} onChange={(v) => setPolar(v, az)} />
        <Slider label="高度" min={0.4} max={3.5} step={0.05} unit="m" value={camera.position.y} onChange={(v) => updateCamera({ position: { ...camera.position, y: v } })} />
        <Slider label="看向高度" min={0.2} max={2.6} step={0.05} unit="m" value={camera.target.y} onChange={(v) => updateCamera({ target: { ...camera.target, y: v }, targetMode: 'manual' })} />
      </PanelSection>

      <PanelSection title="目标">
        <Segmented<CameraTargetMode>
          label="模式"
          value={targetMode}
          onChange={(m) => setCameraTargetMode(m, lockedPersonId)}
          options={[
            { value: 'manual', label: '手动' },
            { value: 'person', label: '锁定人物' },
            { value: 'peopleCenter', label: '多人中心' },
          ]}
        />
        {targetMode === 'person' && (
          <Field label="锁定对象">
            <select
              className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
              value={lockedPersonId}
              onChange={(e) => setCameraTargetMode('person', e.target.value)}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {people.length > 0 && (
          <button
            className="mt-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
            onClick={() => aimCameraAtPerson(lockedPersonId)}
          >
            对准 {aimName} 一次
          </button>
        )}
      </PanelSection>

      <PanelSection title="机位预设">
        <div className="flex flex-wrap gap-1.5">
          {CAMERA_PRESETS.map((preset) => (
            <button
              key={preset.id}
              className="rounded-lg bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700/60"
              onClick={() => applyCameraPreset(preset.id)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </PanelSection>

      <PanelSection title="从自由视角取景">
        <button
          className="w-full rounded-lg bg-zinc-800/60 px-3 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700/60"
          onClick={() => (isFree ? requestFreeCameraCapture() : setViewMode('free'))}
        >
          {isFree ? '设为当前自由视角' : '切到自由视角调整'}
        </button>
        <p className="text-[11px] text-zinc-500">在自由视角找好角度后，把它写入主摄影机。</p>
      </PanelSection>
    </div>
  )
}
