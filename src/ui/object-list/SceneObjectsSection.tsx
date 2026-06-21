import { MAX_OBJECTS } from '../../data/defaults'
import { SCENE_OBJECT_PRESETS } from '../../data/sceneObjects'
import { useStore } from '../../state/store'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function SceneObjectsSection() {
  const objects = useStore((s) => s.scene.objects)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const addObject = useStore((s) => s.addObject)
  const duplicateObject = useStore((s) => s.duplicateObject)
  const removeObject = useStore((s) => s.removeObject)
  const toggleObjectVisibility = useStore((s) => s.toggleObjectVisibility)

  return (
    <Group
      title="道具 / 结构"
      action={
        objects.length < MAX_OBJECTS ? (
          <select
            className="rounded bg-zinc-800/60 px-1 py-0.5 text-[11px] text-zinc-300 outline-none"
            value=""
            onChange={(e) => {
              if (e.target.value) addObject(e.target.value)
              e.target.value = ''
            }}
          >
            <option value="" disabled>
              ＋ 加道具
            </option>
            <optgroup label="道具 / 结构">
              {SCENE_OBJECT_PRESETS.filter((p) => p.group !== 'gear').map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="控光器材">
              {SCENE_OBJECT_PRESETS.filter((p) => p.group === 'gear').map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </optgroup>
          </select>
        ) : (
          <span className="text-[10px] text-zinc-600">满 {MAX_OBJECTS}</span>
        )
      }
    >
      {objects.map((object) => (
        <div
          key={object.id}
          className={`${rowBase} group ${rowState(isSelected(selection, 'object', object.id))}`}
          onClick={() => select({ kind: 'object', id: object.id })}
        >
          <button
            className="px-0.5 text-[11px]"
            title={object.visible ? '隐藏' : '显示'}
            onClick={(e) => {
              e.stopPropagation()
              toggleObjectVisibility(object.id)
            }}
          >
            {object.visible ? '👁' : '🚫'}
          </button>
          <span className={`flex-1 truncate ${object.visible ? '' : 'text-zinc-500'}`}>{object.name}</span>
          <span className="text-[10px] text-zinc-500">{object.kind}</span>
          <div className="flex items-center opacity-0 transition group-hover:opacity-100">
            <button
              className="px-1 text-zinc-400 hover:text-violet-300 disabled:opacity-30"
              title="复制"
              disabled={objects.length >= MAX_OBJECTS}
              onClick={(e) => {
                e.stopPropagation()
                duplicateObject(object.id)
              }}
            >
              ⧉
            </button>
            <button
              className="px-1 text-zinc-400 hover:text-red-300"
              title="删除"
              onClick={(e) => {
                e.stopPropagation()
                removeObject(object.id)
              }}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </Group>
  )
}
