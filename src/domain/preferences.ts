import { isRecord } from '../platform/storage'
import type { LanguageMode } from '../i18n/language'
export type Difficulty = 'easy' | 'normal' | 'hard'
export const difficultyRank = { easy: 0, normal: 1, hard: 2 }
export type ThemeMode = 'system' | 'light' | 'dark'
export type LightTheme = 'white' | 'warm'
export type DarkTheme = 'oled' | 'monokai'
export const onboardingSteps: readonly number[] = [0, 6, 7, 5, 2, 3, 4, 8]
export const onboardingOptions = ['theme', 'light', 'dark', 'timer', 'preview', 'carries', 'haptics', 'difficulty'] as const
export type OnboardingOption = (typeof onboardingOptions)[number]
export interface Preferences {
  version: 3
  difficulty: Difficulty
  timer: boolean | null
  language: LanguageMode
  preview: boolean | null
  carries: boolean | null
  haptics: boolean
  theme: ThemeMode
  light: LightTheme
  dark: DarkTheme
  onboardingStep: number
  onboardingChoices: OnboardingOption[]
  onboarded: boolean
}
export function defaultPreferences(): Preferences {
  return {
    version: 3,
    difficulty: 'easy',
    timer: null,
    language: 'system',
    preview: null,
    carries: null,
    haptics: true,
    theme: 'system',
    light: 'white',
    dark: 'oled',
    onboardingStep: 0,
    onboardingChoices: [],
    onboarded: false,
  }
}
export function missingOnboardingStep(preferences: Preferences): number | undefined {
  const requirements: [number, OnboardingOption[]][] = [
    [6, ['theme']],
    [7, ['light', 'dark']],
    [5, ['timer']],
    [2, ['preview']],
    [3, ['carries']],
    [4, ['haptics']],
    [8, ['difficulty']],
  ]
  return requirements.find(([, keys]) => keys.some((key) => !preferences.onboardingChoices.includes(key)))?.[0]
}
export function parsePreferences(value: unknown): Preferences {
  const defaults = defaultPreferences()
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2 && value.version !== 3)) return defaults
  const preview = typeof value.preview === 'boolean' ? value.preview : null
  const carries = typeof value.carries === 'boolean' ? value.carries : null
  const timer = typeof value.timer === 'boolean' ? value.timer : null
  const requestedStep =
    typeof value.onboardingStep === 'number' && Number.isInteger(value.onboardingStep)
      ? Math.max(0, Math.min(value.version === 1 ? 6 : 8, value.onboardingStep))
      : 0
  const migrated =
    value.version === 1
      ? [0, 1, 2, 3, 4, 6, 7][requestedStep]
      : value.version === 2
        ? [0, 1, 8, 2, 3, 4, 5, 6, 7][requestedStep]
        : requestedStep
  const savedChoices = value.onboardingChoices
  const onboardingChoices = onboardingOptions.filter((key) =>
    Array.isArray(savedChoices) ? savedChoices.includes(key) : value.onboarded === true,
  )
  const preferences: Preferences = {
    version: 3,
    difficulty: value.difficulty === 'normal' || value.difficulty === 'hard' ? value.difficulty : 'easy',
    timer,
    language: value.language === 'de' || value.language === 'en' ? value.language : 'system',
    preview,
    carries,
    haptics: typeof value.haptics === 'boolean' ? value.haptics : defaults.haptics,
    theme: value.theme === 'light' || value.theme === 'dark' ? value.theme : 'system',
    light: value.light === 'warm' ? 'warm' : 'white',
    dark: value.dark === 'monokai' ? 'monokai' : 'oled',
    onboardingStep: migrated === 1 ? 6 : migrated,
    onboardingChoices,
    onboarded: false,
  }
  for (const key of ['timer', 'preview', 'carries'] as const) {
    if (preferences[key] === null) preferences.onboardingChoices = preferences.onboardingChoices.filter((item) => item !== key)
  }
  const missing = missingOnboardingStep(preferences)
  if (missing !== undefined && onboardingSteps.indexOf(missing) < onboardingSteps.indexOf(preferences.onboardingStep))
    preferences.onboardingStep = missing
  preferences.onboarded = value.onboarded === true && missing === undefined
  return preferences
}
