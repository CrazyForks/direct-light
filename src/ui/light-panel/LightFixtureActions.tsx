import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useStore } from '../../state/store'
import { isCustomFixture } from '../../domain/customFixtures'
import { downloadDataUrl } from '../exportImage'
import type { FixturePreset } from '../../types'

// v0.9c: custom-fixture row under the 器械 dropdown — save the current light as a
// fixture, import/export a pack file, and remove the selected custom fixture.
export function LightFixtureActions({ lightId, selectedFixture }: { lightId: string; selectedFixture?: FixturePreset }) {
  const customFixtures = useStore((s) => s.customFixtures)
  const saveCurrentLightAsFixture = useStore((s) => s.saveCurrentLightAsFixture)
  const importCustomFixtures = useStore((s) => s.importCustomFixtures)
  const exportCustomFixtures = useStore((s) => s.exportCustomFixtures)
  const removeCustomFixture = useStore((s) => s.removeCustomFixture)
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState('')

  const removable = selectedFixture != null && isCustomFixture(selectedFixture)

  const onSave = () => {
    const name = window.prompt('把这盏灯当前的光质参数存成一个器械，名称：', selectedFixture?.label ?? '我的器械')
    if (name == null) return
    const trimmed = name.trim()
    if (!trimmed) return
    saveCurrentLightAsFixture(lightId, trimmed)
    setStatus(`已把当前灯存为器械「${trimmed}」`)
  }

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-importing the same file
    if (!file) return
    const text = await file.text()
    const res = importCustomFixtures(text)
    const parts = [`导入 ${res.added} 个器械`]
    if (res.warnings.length > 0) parts.push(`${res.warnings.length} 条提示`)
    if (res.errors.length > 0) parts.push(`${res.errors.length} 条错误`)
    setStatus(parts.join('，'))
    if (res.errors.length > 0 || res.warnings.length > 0) {
      // Surface the details for debugging without a heavy UI.
      console.info('[自定义器械导入]', { errors: res.errors, warnings: res.warnings })
    }
  }

  const onExport = () => {
    if (customFixtures.length === 0) {
      setStatus('还没有自定义器械可导出。')
      return
    }
    const text = exportCustomFixtures()
    downloadDataUrl('data:application/json;charset=utf-8,' + encodeURIComponent(text), 'direct-light-fixtures.json')
    setStatus(`已导出 ${customFixtures.length} 个自定义器械。`)
  }

  const onRemove = () => {
    if (!removable || !selectedFixture) return
    const ok = window.confirm(`删除自定义器械「${selectedFixture.label}」？引用它的灯会回到「自定义参数」，当前亮度/颜色等不变。`)
    if (!ok) return
    removeCustomFixture(selectedFixture.id)
    setStatus(`已删除自定义器械「${selectedFixture.label}」。`)
  }

  const btn = 'rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-700/60'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        <button onClick={onSave} className={btn}>
          存当前灯为器械
        </button>
        <button onClick={() => fileRef.current?.click()} className={btn}>
          导入…
        </button>
        <button onClick={onExport} className={btn}>
          导出
        </button>
        {removable && (
          <button onClick={onRemove} className="rounded-lg bg-zinc-800/60 px-2.5 py-1.5 text-[11px] text-red-300 hover:bg-red-500/20">
            删除此器械
          </button>
        )}
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} />
      </div>
      {status && <p className="text-[11px] text-zinc-400">{status}</p>}
    </div>
  )
}
