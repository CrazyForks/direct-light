import { createContext, useContext } from 'react'

export type OnboardingContextValue = {
  openOnboarding: () => void
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(null)

export function useOnboarding() {
  const value = useContext(OnboardingContext)
  if (!value) throw new Error('useOnboarding must be used inside OnboardingProvider')
  return value
}
