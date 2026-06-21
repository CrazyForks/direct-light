import { useStore } from '../../state/store'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function StudioSection() {
  const studio = useStore((s) => s.scene.studio)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)

  return (
    <Group title="白棚">
      <div
        className={`${rowBase} ${rowState(isSelected(selection, 'studio', 'studio'))}`}
        onClick={() => select({ kind: 'studio', id: 'studio' })}
      >
        <span className="text-base">⬜</span>
        <span className="flex-1">白色影棚</span>
        <span className="text-[11px] text-zinc-500">
          {studio.width}×{studio.depth}
        </span>
      </div>
    </Group>
  )
}
