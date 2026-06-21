import { useStore } from '../state/store'
import { VIEW_HINTS } from './canvasLayout'

export function ViewBadge() {
  const viewMode = useStore((s) => s.viewMode)

  // Compare view has its own header strip; skip the floating badge there.
  if (viewMode === 'compare') return null

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-zinc-950/70 px-2.5 py-1 text-[11px] text-zinc-300 ring-1 ring-zinc-800">
      {VIEW_HINTS[viewMode]}
    </div>
  )
}
