import { MAX_LIGHTS } from '../../data/defaults'
import { LIGHT_TYPE_LABELS } from '../../data/rendering'
import { effectiveLightColor } from '../../lib/color'
import { useStore } from '../../state/store'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function LightsSection() {
  const lights = useStore((s) => s.scene.lights)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const toggleLight = useStore((s) => s.toggleLight)
  const addLight = useStore((s) => s.addLight)
  const duplicateLight = useStore((s) => s.duplicateLight)
  const removeLight = useStore((s) => s.removeLight)

  return (
    <Group
      title={`灯光 ${lights.length}/${MAX_LIGHTS}`}
      action={
        lights.length < MAX_LIGHTS ? (
          <button
            onClick={addLight}
            className="rounded px-1.5 text-lg leading-none text-zinc-400 hover:text-violet-300"
            title="添加灯"
          >
            ＋
          </button>
        ) : (
          <span className="text-[10px] text-zinc-600">满 {MAX_LIGHTS}</span>
        )
      }
    >
      {lights.map((light) => {
        const swatch = `#${effectiveLightColor(light).getHexString()}`
        return (
          <div
            key={light.id}
            className={`${rowBase} group ${rowState(isSelected(selection, 'light', light.id))}`}
            onClick={() => select({ kind: 'light', id: light.id })}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                toggleLight(light.id)
              }}
              className="h-3.5 w-3.5 shrink-0 rounded-full border"
              style={{
                background: light.enabled ? swatch : 'transparent',
                borderColor: light.enabled ? swatch : '#52525b',
              }}
              title={light.enabled ? '关灯' : '开灯'}
            />
            <span className={`flex-1 truncate ${light.enabled ? '' : 'text-zinc-500'}`}>{light.name}</span>
            <span className="text-[10px] text-zinc-500">{LIGHT_TYPE_LABELS[light.type]}</span>
            <div className="flex items-center opacity-0 transition group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  duplicateLight(light.id)
                }}
                disabled={lights.length >= MAX_LIGHTS}
                className="px-1 text-zinc-400 hover:text-violet-300 disabled:opacity-30"
                title="复制灯"
              >
                ⧉
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeLight(light.id)
                }}
                className="px-1 text-zinc-400 hover:text-red-300"
                title="删除灯"
              >
                ✕
              </button>
            </div>
          </div>
        )
      })}
    </Group>
  )
}
