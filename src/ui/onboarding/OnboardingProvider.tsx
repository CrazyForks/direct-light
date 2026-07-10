import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import {
  loadOnboardingStatus,
  saveOnboardingStatus,
  type OnboardingStatus,
} from '../../lib/storage'
import { OnboardingTour } from './OnboardingTour'
import { OnboardingContext } from './OnboardingContext'

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<OnboardingStatus | null>(() => loadOnboardingStatus())
  const [isOpen, setIsOpen] = useState(false)
  const autoOpenedRef = useRef(false)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (status !== null || autoOpenedRef.current) return

    const media = window.matchMedia('(min-width: 960px)')
    let timer: number | undefined
    const maybeOpen = () => {
      if (!media.matches || autoOpenedRef.current) return
      timer = window.setTimeout(() => {
        autoOpenedRef.current = true
        setIsOpen(true)
      }, 600)
    }

    maybeOpen()
    media.addEventListener('change', maybeOpen)
    return () => {
      if (timer !== undefined) window.clearTimeout(timer)
      media.removeEventListener('change', maybeOpen)
    }
  }, [status])

  const openOnboarding = useCallback(() => {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setIsOpen(true)
  }, [])

  const closeOnboarding = useCallback(
    (result: OnboardingStatus) => {
      if (status === null) {
        saveOnboardingStatus(result)
        setStatus(result)
      }
      setIsOpen(false)
      window.requestAnimationFrame(() => returnFocusRef.current?.focus())
    },
    [status],
  )

  return (
    <OnboardingContext.Provider value={{ openOnboarding }}>
      {children}
      {isOpen && (
        <OnboardingTour
          onSkip={() => closeOnboarding('skipped')}
          onComplete={() => closeOnboarding('completed')}
        />
      )}
    </OnboardingContext.Provider>
  )
}
