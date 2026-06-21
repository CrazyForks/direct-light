import { useStore } from '../state/store'
import { LightPanel } from './LightPanel'
import { PersonPanel } from './PersonPanel'
import { ObjectPanel } from './ObjectPanel'
import { CameraPanel } from './CameraPanel'
import { StudioPanel } from './StudioPanel'

export function ParamPanel() {
  const selection = useStore((s) => s.selection)
  if (!selection) return <EmptyState />
  if (selection.kind === 'light') return <LightPanel id={selection.id} />
  if (selection.kind === 'person') return <PersonPanel id={selection.id} />
  if (selection.kind === 'object') return <ObjectPanel id={selection.id} />
  if (selection.kind === 'camera') return <CameraPanel />
  return <StudioPanel />
}

function EmptyState() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center text-sm text-zinc-500">
      在左侧或场景中选择一个对象
      <br />
      （人物 / 灯光 / 摄影机 / 白棚）
    </div>
  )
}
