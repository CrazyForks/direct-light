import { LIGHT_TARGET_MODE_LABELS } from '../../domain/lightTargets'
import type { LightTargetMode, PersonConfig } from '../../types'
import { Field, PanelSection, Segmented } from '../controls'

export function LightTargetSection({
  people,
  targetMode,
  targetPerson,
  onChangeMode,
  onChangePerson,
  onAim,
}: {
  people: PersonConfig[]
  targetMode: LightTargetMode
  targetPerson: PersonConfig
  onChangeMode: (mode: LightTargetMode) => void
  onChangePerson: (personId: string) => void
  onAim: () => void
}) {
  return (
    <PanelSection title="目标 / 对齐">
      <Segmented<LightTargetMode>
        label="模式"
        value={targetMode}
        onChange={onChangeMode}
        options={[
          { value: 'manual', label: LIGHT_TARGET_MODE_LABELS.manual },
          { value: 'person', label: LIGHT_TARGET_MODE_LABELS.person },
          { value: 'peopleCenter', label: LIGHT_TARGET_MODE_LABELS.peopleCenter },
        ]}
      />
      {targetMode === 'person' && (
        <Field label="目标人物">
          <select
            value={targetPerson.id}
            onChange={(e) => onChangePerson(e.target.value)}
            className="rounded-lg bg-zinc-800/60 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
          >
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </Field>
      )}
      <button
        onClick={onAim}
        className="mt-1 rounded-lg bg-zinc-800/60 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700/60"
      >
        对准一次
      </button>
    </PanelSection>
  )
}
