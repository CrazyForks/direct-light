import type { ReactNode } from 'react'

// Shared, compact form controls for the parameter panel.

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit = '',
  onChange,
  format,
}: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  onChange: (v: number) => void
  format?: (v: number) => string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</span>
        <span className="text-xs tabular-nums text-zinc-200">
          {format ? format(value) : value.toFixed(step < 1 ? 2 : 0)}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
    </div>
  )
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</span>}
      <div className="flex gap-1 rounded-lg bg-zinc-800/60 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs transition ${
              value === o.value
                ? 'bg-violet-500/30 text-violet-100 ring-1 ring-violet-400/50'
                : 'text-zinc-300 hover:bg-zinc-700/60'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700/60"
    >
      <span>{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition ${checked ? 'bg-violet-500' : 'bg-zinc-600'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>
    </button>
  )
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 cursor-pointer rounded border border-zinc-700 bg-transparent"
        />
        <span className="text-xs tabular-nums text-zinc-300">{value}</span>
      </div>
    </Field>
  )
}

export function SwatchRow({
  swatches,
  onPick,
  activeColor,
}: {
  swatches: { label: string; color: string }[]
  onPick: (s: { label: string; color: string }) => void
  activeColor?: string
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {swatches.map((s) => (
        <button
          key={s.label}
          title={s.label}
          onClick={() => onPick(s)}
          className={`h-6 w-6 rounded-md border transition ${
            activeColor?.toLowerCase() === s.color.toLowerCase()
              ? 'border-violet-300 ring-2 ring-violet-400/50'
              : 'border-zinc-600 hover:border-zinc-400'
          }`}
          style={{ background: s.color }}
        />
      ))}
    </div>
  )
}

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 border-b border-zinc-800 px-4 py-3 last:border-b-0">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h3>
      {children}
    </div>
  )
}
