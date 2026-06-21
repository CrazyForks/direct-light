import type { Selection, SelectionKind } from '../../types'

export const rowBase =
  'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm cursor-pointer transition'

export function isSelected(selection: Selection, kind: SelectionKind, id: string) {
  return selection?.kind === kind && selection.id === id
}

export function rowState(selected: boolean) {
  return selected ? 'bg-violet-500/20 text-violet-100' : 'text-zinc-300 hover:bg-zinc-800'
}
