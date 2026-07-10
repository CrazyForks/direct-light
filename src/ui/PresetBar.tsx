import { useState } from 'react'
import { useStore } from '../state/store'
import { useT } from '../i18n/useT'
import { capturePreview } from '../scene/capture'
import { downscaleDataUrl } from './exportImage'

export function PresetBar() {
  const presets = useStore((s) => s.presets)
  const savePreset = useStore((s) => s.savePreset)
  const loadPreset = useStore((s) => s.loadPreset)
  const duplicatePreset = useStore((s) => s.duplicatePreset)
  const deletePreset = useStore((s) => s.deletePreset)
  const [name, setName] = useState('')
  const [status, setStatus] = useState<{ message: string; error: boolean } | null>(null)
  const t = useT()

  const handleSave = async () => {
    const raw = capturePreview()
    const thumb = raw ? await downscaleDataUrl(raw, 320) : undefined
    if (savePreset(name, thumb)) {
      setName('')
      setStatus({ message: t('presetBar.saved'), error: false })
    } else {
      setStatus({ message: t('presetBar.saveFailed'), error: true })
    }
  }

  return (
    <div data-onboarding="presets" className="flex items-center gap-3 border-t border-zinc-800 bg-zinc-950/80 px-4 py-2.5">
      <div className="flex shrink-0 items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder={t('presetBar.namePlaceholder')}
          aria-label={t('presetBar.namePlaceholder')}
          className="w-36 rounded-lg bg-zinc-800/60 px-3 py-1.5 text-xs text-zinc-100 outline-none focus:ring-1 focus:ring-violet-400"
        />
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-violet-500/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500"
        >
          {t('presetBar.save')}
        </button>
      </div>

      <div className="h-8 w-px bg-zinc-800" />

      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {status && (
          <span
            role="status"
            aria-live="polite"
            className={`shrink-0 text-xs ${status.error ? 'text-red-300' : 'text-emerald-300'}`}
          >
            {status.message}
          </span>
        )}
        {!status && presets.length === 0 && (
          <span className="text-xs text-zinc-600">{t('presetBar.empty')}</span>
        )}
        {presets.map((p) => (
          <div
            key={p.id}
            className="group relative flex shrink-0 items-center rounded-lg border border-zinc-800 bg-zinc-900 p-1 hover:border-violet-400/50 focus-within:border-violet-400/70"
          >
            <button
              type="button"
              onClick={() => loadPreset(p.id)}
              title={t('presetBar.load')}
              className="flex items-center gap-2 rounded pr-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
            >
              {p.previewImage ? (
                <img src={p.previewImage} alt="" className="h-10 w-16 rounded object-cover" />
              ) : (
                <span className="grid h-10 w-16 place-items-center rounded bg-zinc-800 text-[10px] text-zinc-500">
                  {t('presetBar.noPreview')}
                </span>
              )}
              <span className="max-w-[100px] truncate text-xs text-zinc-200">{p.name}</span>
            </button>
            <div className="flex flex-col opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setStatus(
                    duplicatePreset(p.id)
                      ? { message: t('presetBar.duplicated'), error: false }
                      : { message: t('presetBar.duplicateFailed'), error: true },
                  )
                }}
                className="px-1 text-[10px] text-zinc-400 hover:text-violet-300"
                title={t('presetBar.duplicate')}
              >
                ⧉
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setStatus(
                    deletePreset(p.id)
                      ? { message: t('presetBar.deleted'), error: false }
                      : { message: t('presetBar.deleteFailed'), error: true },
                  )
                }}
                className="px-1 text-[10px] text-zinc-400 hover:text-red-300"
                title={t('presetBar.delete')}
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
