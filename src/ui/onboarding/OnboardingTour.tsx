import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useT } from '../../i18n/useT'
import type { MessageKey } from '../../i18n/messages'

type Placement = 'right' | 'below' | 'above'

type TourStep = {
  titleKey: MessageKey
  bodyKey: MessageKey
  selector?: string
  placement?: Placement
}

type TargetBox = { top: number; left: number; width: number; height: number }

const STEPS: TourStep[] = [
  {
    titleKey: 'onboarding.welcome.title',
    bodyKey: 'onboarding.welcome.body',
  },
  {
    titleKey: 'onboarding.lights.title',
    bodyKey: 'onboarding.lights.body',
    selector: '[data-onboarding="lights"]',
    placement: 'right',
  },
  {
    titleKey: 'onboarding.views.title',
    bodyKey: 'onboarding.views.body',
    selector: '[data-onboarding="views"]',
    placement: 'below',
  },
  {
    titleKey: 'onboarding.presets.title',
    bodyKey: 'onboarding.presets.body',
    selector: '[data-onboarding="presets"]',
    placement: 'above',
  },
  {
    titleKey: 'onboarding.export.title',
    bodyKey: 'onboarding.export.body',
    selector: '[data-onboarding="export"]',
    placement: 'below',
  },
]

export function OnboardingTour({
  onSkip,
  onComplete,
}: {
  onSkip: () => void
  onComplete: () => void
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [target, setTarget] = useState<TargetBox | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const t = useT()
  const step = STEPS[stepIndex]
  const isWelcome = stepIndex === 0
  const isLast = stepIndex === STEPS.length - 1

  useLayoutEffect(() => {
    if (!step.selector) {
      const frame = window.requestAnimationFrame(() => setTarget(null))
      return () => window.cancelAnimationFrame(frame)
    }

    const element = document.querySelector<HTMLElement>(step.selector)
    if (!element) {
      const frame = window.requestAnimationFrame(() => setTarget(null))
      return () => window.cancelAnimationFrame(frame)
    }

    const update = () => {
      const rect = element.getBoundingClientRect()
      const pad = 8
      setTarget({
        top: Math.max(8, rect.top - pad),
        left: Math.max(8, rect.left - pad),
        width: Math.min(window.innerWidth - 16, rect.width + pad * 2),
        height: Math.min(window.innerHeight - 16, rect.height + pad * 2),
      })
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    window.addEventListener('resize', update)
    document.addEventListener('scroll', update, true)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      document.removeEventListener('scroll', update, true)
    }
  }, [step.selector])

  useEffect(() => {
    headingRef.current?.focus()
  }, [stepIndex])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onSkip()
      } else if (event.key === 'ArrowLeft' && stepIndex > 0) {
        setStepIndex((value) => value - 1)
      } else if (event.key === 'ArrowRight' && stepIndex < STEPS.length - 1) {
        setStepIndex((value) => value + 1)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onSkip, stepIndex])

  const cardStyle = useMemo<CSSProperties>(() => positionCard(target, step.placement), [target, step.placement])

  const trapWelcomeFocus = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (!isWelcome || event.key !== 'Tab' || !cardRef.current) return
    const focusable = Array.from(
      cardRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'),
    )
    if (!focusable.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="onboarding-layer">
      {isWelcome && <div className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-[2px]" aria-hidden="true" />}
      {!isWelcome && target && (
        <div
          className="pointer-events-none fixed z-[90] rounded-xl border-2 border-violet-300 shadow-[0_0_32px_rgba(167,139,250,0.45)] transition-all duration-200 motion-reduce:transition-none"
          style={{
            top: target.top,
            left: target.left,
            width: target.width,
            height: target.height,
            boxShadow: '0 0 0 9999px rgba(9, 9, 11, 0.74), 0 0 32px rgba(167, 139, 250, 0.45)',
          }}
          aria-hidden="true"
        />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal={isWelcome ? 'true' : undefined}
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-body"
        className="fixed z-[100] w-[min(22.5rem,calc(100vw-2rem))] rounded-2xl border border-violet-400/30 bg-zinc-950/95 p-5 text-zinc-100 shadow-2xl shadow-black/60 backdrop-blur transition-[top,left,transform] duration-200 motion-reduce:transition-none"
        style={cardStyle}
        onKeyDown={trapWelcomeFocus}
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-300" aria-live="polite">
            {t('onboarding.progress', { current: stepIndex + 1, total: STEPS.length })}
          </span>
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            {t('onboarding.skip')}
          </button>
        </div>

        <h2
          ref={headingRef}
          id="onboarding-title"
          tabIndex={-1}
          className="text-lg font-semibold tracking-tight text-white outline-none"
        >
          {t(step.titleKey)}
        </h2>
        <p id="onboarding-body" className="mt-2 text-sm leading-6 text-zinc-300">
          {t(step.bodyKey)}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="flex gap-1.5" aria-hidden="true">
            {STEPS.map((_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full transition-all ${index === stepIndex ? 'w-6 bg-violet-400' : 'w-1.5 bg-zinc-700'}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex((value) => value - 1)}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
              >
                {t('onboarding.back')}
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? onComplete() : setStepIndex((value) => value + 1))}
              className="rounded-lg bg-violet-500 px-3.5 py-2 text-xs font-semibold text-white hover:bg-violet-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {isLast ? t('onboarding.done') : isWelcome ? t('onboarding.start') : t('onboarding.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function positionCard(target: TargetBox | null, placement: Placement | undefined): CSSProperties {
  if (!target) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

  const gap = 16
  const cardWidth = Math.min(360, window.innerWidth - 32)
  const centeredLeft = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, target.left + target.width / 2 - cardWidth / 2))

  if (placement === 'right' && target.left + target.width + gap + cardWidth <= window.innerWidth - 16) {
    return {
      top: Math.max(16, Math.min(window.innerHeight - 280, target.top)),
      left: target.left + target.width + gap,
    }
  }
  if (placement === 'above') {
    return { top: Math.max(16, target.top - gap), left: centeredLeft, transform: 'translateY(-100%)' }
  }
  return {
    top: Math.max(16, Math.min(window.innerHeight - 260, target.top + target.height + gap)),
    left: centeredLeft,
  }
}
