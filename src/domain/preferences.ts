import { isRecord } from '../platform/storage'
import type { LanguageMode } from '../i18n/language'
export type ThemeMode = 'system' | 'light' | 'dark'
export type LightTheme = 'white' | 'warm'
export type DarkTheme = 'charcoal' | 'oled'
export interface Preferences {
  version: 1
  language: LanguageMode
  preview: boolean | null
  carries: boolean | null
  haptics: boolean
  theme: ThemeMode
  light: LightTheme
  dark: DarkTheme
  onboardingStep: number
  onboarded: boolean
}
export function defaultPreferences(): Preferences {
  return {
    version: 1,
    language: 'system',
    preview: null,
    carries: null,
    haptics: true,
    theme: 'system',
    light: 'white',
    dark: 'charcoal',
    onboardingStep: 0,
    onboarded: false,
  }
}
export function parsePreferences(value: unknown): Preferences {
  const defaults = defaultPreferences()
  if (!isRecord(value) || value.version !== 1) return defaults
  const preview = typeof value.preview === 'boolean' ? value.preview : null
  const carries = typeof value.carries === 'boolean' ? value.carries : null
  const requestedStep =
    typeof value.onboardingStep === 'number' && Number.isInteger(value.onboardingStep)
      ? Math.max(0, Math.min(6, value.onboardingStep))
      : 0
  const onboardingStep =
    preview === null ? Math.min(2, requestedStep) : carries === null ? Math.min(3, requestedStep) : requestedStep
  return {
    version: 1,
    language: value.language === 'de' || value.language === 'en' ? value.language : 'system',
    preview,
    carries,
    haptics: typeof value.haptics === 'boolean' ? value.haptics : defaults.haptics,
    theme: value.theme === 'light' || value.theme === 'dark' ? value.theme : 'system',
    light: value.light === 'warm' ? 'warm' : 'white',
    dark: value.dark === 'oled' ? 'oled' : 'charcoal',
    onboardingStep,
    onboarded: value.onboarded === true && preview !== null && carries !== null,
  }
}
