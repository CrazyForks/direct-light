import { useStore } from '../../state/store'
import { useT } from '../../i18n/useT'
import { Group } from './Group'
import { isSelected, rowBase, rowState } from './rowUtils'

export function StudioSection() {
  const studio = useStore((s) => s.scene.studio)
  const selection = useStore((s) => s.selection)
  const select = useStore((s) => s.select)
  const t = useT()

  return (
    <Group title={t('objectList.studio.title')}>
      <button
        type="button"
        className={`${rowBase} ${rowState(isSelected(selection, 'studio', 'studio'))}`}
        onClick={() => select({ kind: 'studio', id: 'studio' })}
        aria-pressed={isSelected(selection, 'studio', 'studio')}
      >
        <span className="text-base">⬜</span>
        <span className="flex-1">{t('objectList.studio.row')}</span>
        <span className="text-[11px] text-zinc-500">
          {studio.width}×{studio.depth}
        </span>
      </button>
    </Group>
  )
}
