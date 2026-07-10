import type { Selection, SelectionKind } from '../../types'

export const rowBase =
  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition'

export const rowSelect =
  'flex min-w-0 flex-1 items-center gap-2 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400'

export const rowActions =
  'flex items-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100'

export function isSelected(selection: Selection, kind: SelectionKind, id: string) {
  return selection?.kind === kind && selection.id === id
}

export function rowState(selected: boolean) {
  return selected ? 'bg-violet-500/20 text-violet-100' : 'text-zinc-300 hover:bg-zinc-800'
}
