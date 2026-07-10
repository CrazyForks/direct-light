import type { ReactNode } from 'react'

export function Group({
  title,
  children,
  action,
  onboarding,
}: {
  title: string
  children: ReactNode
  action?: ReactNode
  onboarding?: string
}) {
  return (
    <div data-onboarding={onboarding} className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}
