export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-zinc-800 px-4 py-3">
      <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
    </div>
  )
}
