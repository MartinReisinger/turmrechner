import { parsePreferences, type Preferences } from './preferences'
import { isRecord } from '../platform/storage'
export type RunSettings = Omit<Preferences, 'version' | 'onboardingStep' | 'onboarded' | 'preview' | 'carries' | 'timer'> & {
  preview: boolean
  carries: boolean
  timer: boolean
}
export interface SettingsChange {
  atMs: number
  step: number
  settings: RunSettings
}
export function snapshotSettings(preferences: Preferences): RunSettings {
  const { difficulty, timer, language, preview, carries, haptics, theme, light, dark } = preferences
  return {
    difficulty,
    timer: timer === true,
    language,
    preview: preview ?? true,
    carries: carries ?? true,
    haptics,
    theme,
    light,
    dark,
  }
}
export function parseSettings(value: unknown): RunSettings | null {
  if (
    !isRecord(value) ||
    !['easy', 'normal', 'hard'].includes(String(value.difficulty)) ||
    typeof value.preview !== 'boolean' ||
    typeof value.carries !== 'boolean' ||
    typeof value.timer !== 'boolean' ||
    typeof value.haptics !== 'boolean' ||
    !['system', 'de', 'en'].includes(String(value.language)) ||
    !['system', 'light', 'dark'].includes(String(value.theme)) ||
    !['white', 'warm'].includes(String(value.light)) ||
    !['charcoal', 'oled', 'monokai'].includes(String(value.dark))
  )
    return null
  return snapshotSettings(parsePreferences({ ...value, version: 2 }))
}
export function parseChanges(value: unknown): SettingsChange[] | null {
  if (!Array.isArray(value) || value.length === 0) return null
  const result: SettingsChange[] = []
  for (const change of value) {
    if (
      !isRecord(change) ||
      typeof change.atMs !== 'number' ||
      !Number.isFinite(change.atMs) ||
      change.atMs < 0 ||
      typeof change.step !== 'number' ||
      !Number.isInteger(change.step) ||
      change.step < 0 ||
      change.step > 15
    )
      return null
    const settings = parseSettings(change.settings)
    if (!settings || change.atMs < (result.at(-1)?.atMs ?? 0)) return null
    result.push({ atMs: change.atMs, step: change.step, settings })
  }
  return result
}
