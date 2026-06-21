import { useStore } from '../../state/store'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function CameraSection() {
  const camera = useStore((s) => s.scene.camera)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)

  return (
    <Group title="摄影机">
      <div
        className={`${rowBase} ${rowState(isSelected(selection, 'camera', 'camera'))}`}
        onClick={() => select({ kind: 'camera', id: 'camera' })}
      >
        <span className="text-base">🎥</span>
        <span className="flex-1">主摄影机</span>
        <span className="text-[11px] text-zinc-500">{camera.focalLength}mm</span>
      </div>
    </Group>
  )
}
