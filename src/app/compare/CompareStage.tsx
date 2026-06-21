import { useMemo } from 'react'
import { compareScenes } from '../../domain/sceneDiff'
import { useStore } from '../../state/store'
import { CompareControls } from '../../ui/CompareControls'
import { ComparePane } from './ComparePane'
import { formatRelativeTime } from './relativeTime'

export function CompareStage() {
  const scene = useStore((s) => s.scene)
  const compareB = useStore((s) => s.compareB)
  const freezeCompareB = useStore((s) => s.freezeCompareB)
  const setViewMode = useStore((s) => s.setViewMode)
  const presets = useStore((s) => s.presets)
  const setCompareB = useStore((s) => s.setCompareB)

  const diff = useMemo(
    () => (compareB ? compareScenes(scene, compareB.scene) : null),
    [scene, compareB],
  )

  return (
    <div className="absolute inset-0 flex flex-col bg-black">
      <CompareControls />
      {compareB && diff && (
        // Per-category difference summary strip. Director-friendly, not a
        // field-level diff — just enough signal to know what this compare is
        // "mostly about". See ROADMAP §10.
        <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-800 bg-zinc-950/70 px-4 py-1.5 text-[11px]">
          <span className="text-zinc-500">差异：</span>
          {diff.map((d) => (
            <span
              key={d.category}
              title={d.hint}
              className={
                d.same
                  ? 'rounded-md bg-zinc-800/60 px-2 py-0.5 text-zinc-500'
                  : 'rounded-md bg-violet-500/20 px-2 py-0.5 text-violet-100 ring-1 ring-violet-400/40'
              }
            >
              {d.label}{d.same ? ' · 同' : ` · ${d.hint}`}
            </span>
          ))}
        </div>
      )}
      <div className="flex min-h-0 flex-1">
        <ComparePane
          scene={scene}
          label="A · 当前编辑（可改）"
          badgeClass="bg-violet-500/25 text-violet-100 ring-violet-400/50"
          primary
        />
        <div className="w-px shrink-0 bg-zinc-700" />
        {compareB ? (
          <ComparePane
            scene={compareB.scene}
            label={`B · ${compareB.name}`}
            badgeClass="bg-sky-500/25 text-sky-100 ring-sky-400/50"
            primary={false}
            subtitle={
              compareB.frozenAt
                ? `冻结于 ${formatRelativeTime(compareB.frozenAt)}`
                : undefined
            }
          />
        ) : (
          // Empty-B state: give the director three obvious next actions so the
          // compare view is never a dead end. See ROADMAP §10 acceptance.
          <div className="flex min-w-0 flex-1 items-center justify-center px-6">
            <div className="max-w-sm space-y-4 text-center">
              <div className="space-y-1">
                <div className="text-sm font-medium text-zinc-200">开始一次 A/B 对比</div>
                <div className="text-xs text-zinc-500">
                  先把一份画面放到 B 作为不动参考，再改左边 A 看差异。
                </div>
              </div>
              <div className="grid gap-2">
                <button
                  onClick={freezeCompareB}
                  className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-2 text-sm text-violet-100 hover:bg-violet-500/25"
                >
                  冻结当前为 B
                </button>
                {presets.length > 0 ? (
                  <label className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:border-zinc-500">
                    从已存方案选 ·{' '}
                    <select
                      value=""
                      onChange={(e) => {
                        const p = presets.find((x) => x.id === e.target.value)
                        if (p) setCompareB({ name: p.name, scene: p.sceneSnapshot, frozenAt: p.createdAt })
                      }}
                      className="bg-transparent text-zinc-100 outline-none"
                    >
                      <option value="" disabled className="bg-zinc-900">{presets.length} 个可选…</option>
                      {presets.map((p) => (
                        <option key={p.id} value={p.id} className="bg-zinc-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : (
                  <div className="rounded-lg border border-dashed border-zinc-700 px-3 py-2 text-xs text-zinc-500">
                    还没有已存方案 · 退回普通视图保存一份再来对比
                  </div>
                )}
                <button
                  onClick={() => setViewMode('camera')}
                  className="text-xs text-zinc-500 hover:text-zinc-300"
                >
                  退出对比 · 回到普通视图继续调整
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
