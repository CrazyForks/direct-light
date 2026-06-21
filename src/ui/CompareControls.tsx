import { useStore } from '../state/store'

// Top strip for the A/B compare view. See ROADMAP §10 for v0.4.6 guidance:
// - A is always the live, editable scene on the left.
// - B on the right is a frozen reference; we show its name + when it was
//   frozen/selected, so the director remembers what they're comparing against.
// - Swap text stays explicit: "把 B 变成正在编辑的 A，原来的 A 退到 B".
export function CompareControls() {
  const presets = useStore((s) => s.presets)
  const compareB = useStore((s) => s.compareB)
  const setCompareB = useStore((s) => s.setCompareB)
  const freezeCompareB = useStore((s) => s.freezeCompareB)
  const swapCompare = useStore((s) => s.swapCompare)

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-zinc-800 bg-zinc-950/85 px-4 py-2 text-xs">
      <span className="font-medium text-zinc-300">A/B 对比</span>
      <span className="text-zinc-500">左 A=当前编辑（右侧面板改这里） · 右 B=冻结参考（不会跟着变）</span>

      <div className="h-5 w-px bg-zinc-800" />

      <label className="flex items-center gap-1.5 text-zinc-400">
        B 对照方案
        <select
          value=""
          onChange={(e) => {
            const preset = presets.find((p) => p.id === e.target.value)
            if (preset) setCompareB({ name: preset.name, scene: preset.sceneSnapshot, frozenAt: preset.createdAt })
          }}
          className="rounded-md border border-zinc-700 bg-zinc-800/60 px-2 py-1 text-xs text-zinc-200 outline-none focus:ring-1 focus:ring-violet-400"
        >
          <option value="" disabled>
            {presets.length ? '从已存方案选…' : '（还没有已存方案）'}
          </option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={freezeCompareB}
        title="把当前 A 场景拷一份固定到 B，然后改 A 看前后差异"
        className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-violet-400/60 hover:text-violet-200"
      >
        冻结当前为 B
      </button>

      <button
        onClick={swapCompare}
        disabled={!compareB}
        title="把 B 变成正在编辑的 A（左边），原来的 A 退到 B（右边）"
        className="rounded-md border border-zinc-700 px-2.5 py-1 text-zinc-300 hover:border-violet-400/60 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
      >
        ⇄ 交换 A/B
      </button>

      <span className="ml-auto truncate text-zinc-500">
        B：{compareB ? `${compareB.name}${compareB.frozenAt ? ` · ${formatShortTime(compareB.frozenAt)}` : ''}` : '未设置'}
      </span>
    </div>
  )
}

function formatShortTime(ts: number): string {
  const d = new Date(ts)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}
