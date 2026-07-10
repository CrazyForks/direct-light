import { useT } from '../i18n/useT'
import { LanguageMenu } from './LanguageMenu'

export function NarrowScreenNotice() {
  const t = useT()
  return (
    <main className="direct-light-narrow h-[100dvh] w-screen items-center justify-center bg-zinc-950 px-6 text-zinc-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/20 text-violet-200">◐</span>
            <div>
              <div className="text-sm font-semibold text-white">Direct Light</div>
              <div className="text-[10px] text-zinc-500">v1.0.4</div>
            </div>
          </div>
          <LanguageMenu />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-white">{t('onboarding.narrow.title')}</h1>
        <p className="mt-3 text-sm leading-6 text-zinc-300">{t('onboarding.narrow.body')}</p>
        <p className="mt-4 rounded-xl bg-zinc-950/70 px-4 py-3 text-xs leading-5 text-violet-200">
          {t('onboarding.narrow.hint')}
        </p>
      </div>
    </main>
  )
}
