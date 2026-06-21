import { Stage } from './Stage'
import { ViewBadge } from './ViewBadge'
import { ObjectList } from '../ui/ObjectList'
import { ParamPanel } from '../ui/ParamPanel'
import { PresetBar } from '../ui/PresetBar'
import { TopBar } from '../ui/TopBar'

export function AppShell() {
  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-950 text-zinc-200">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <aside className="w-60 shrink-0 border-r border-zinc-800 bg-zinc-900">
          <ObjectList />
        </aside>
        <main className="relative min-w-0 flex-1">
          <Stage />
          <ViewBadge />
        </main>
        <aside className="w-72 shrink-0 border-l border-zinc-800 bg-zinc-900">
          <ParamPanel />
        </aside>
      </div>
      <PresetBar />
    </div>
  )
}
