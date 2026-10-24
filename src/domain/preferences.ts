import { isRecord } from '../platform/storage'
import type { LanguageMode } from '../i18n/language'
export type Difficulty = 'easy' | 'normal' | 'hard'
export const difficultyRank = { easy: 0, normal: 1, hard: 2 }
export type ThemeMode = 'system' | 'light' | 'dark'
export type LightTheme = 'white' | 'warm'
export type DarkTheme = 'charcoal' | 'oled'
export interface Preferences {
  version: 2
  difficulty: Difficulty
  timer: boolean
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
    version: 2,
    difficulty: 'easy',
    timer: false,
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
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) return defaults
  const preview = typeof value.preview === 'boolean' ? value.preview : null
  const carries = typeof value.carries === 'boolean' ? value.carries : null
  const requestedStep =
    typeof value.onboardingStep === 'number' && Number.isInteger(value.onboardingStep)
      ? Math.max(0, Math.min(value.version === 1 ? 6 : 8, value.onboardingStep))
      : 0
  const migrated = value.version === 1 ? [0, 1, 3, 4, 5, 7, 8][requestedStep] : requestedStep
  const onboardingStep = preview === null ? Math.min(3, migrated) : carries === null ? Math.min(4, migrated) : migrated
  return {
    version: 2,
    difficulty: value.difficulty === 'normal' || value.difficulty === 'hard' ? value.difficulty : 'easy',
    timer: value.timer === true,
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
