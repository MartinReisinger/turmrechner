import { achievements, emptyAchievements, type AchievementState } from './achievements'
import { isRecord } from '../platform/storage'
import { finiteTime } from './run-codec'
import type { AppliedTheme } from './preferences'

export function parseAchievements(value: unknown): AchievementState {
  const fresh = emptyAchievements()
  if (!isRecord(value) || value.version !== 1 || !isRecord(value.unlocked)) return fresh
  if (
    !Array.isArray(value.themes) ||
    !Number.isInteger(value.bestStreak) ||
    typeof value.bestStreak !== 'number' ||
    value.bestStreak < 0 ||
    value.bestStreak > 16 ||
    !Number.isSafeInteger(value.cleanTowers) ||
    typeof value.cleanTowers !== 'number' ||
    value.cleanTowers < 0
  )
    return fresh
  const themes: AppliedTheme[] = []
  for (const theme of value.themes) {
    if (theme !== 'white' && theme !== 'warm' && theme !== 'oled' && theme !== 'monokai') return fresh
    if (!themes.includes(theme)) themes.push(theme)
  }
  const unlocked: AchievementState['unlocked'] = {}
  for (const { id } of achievements) {
    const at = value.unlocked[id]
    if (at !== undefined) {
      if (!finiteTime(at) || at > 8640000000000000) return fresh
      unlocked[id] = at
    }
  }
  let activeRun: AchievementState['activeRun'] = null
  if (value.activeRun !== null) {
    if (
      !isRecord(value.activeRun) ||
      typeof value.activeRun.id !== 'string' ||
      !value.activeRun.id ||
      value.activeRun.id.length > 100 ||
      typeof value.activeRun.completed !== 'boolean'
    )
      return fresh
    activeRun = { id: value.activeRun.id, completed: value.activeRun.completed }
  }
  return { version: 1, unlocked, themes, bestStreak: value.bestStreak, cleanTowers: value.cleanTowers, activeRun }
}
