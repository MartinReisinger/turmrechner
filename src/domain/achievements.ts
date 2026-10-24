import { isCleanRow, type Review } from './review'
import type { Round } from './round'
import type { AppliedTheme } from './preferences'

export const achievements = [
  { id: 'first-row', icon: 'badgeCheck', title: 'firstRowTitle', description: 'firstRowDescription', target: 1 },
  { id: 'five-rows', icon: 'flame', title: 'fiveRowsTitle', description: 'fiveRowsDescription', target: 5 },
  { id: 'ten-rows', icon: 'rocket', title: 'tenRowsTitle', description: 'tenRowsDescription', target: 10 },
  { id: 'first-tower', icon: 'flag', title: 'firstTowerTitle', description: 'firstTowerDescription', target: 1 },
  { id: 'clean-tower', icon: 'sparkles', title: 'cleanTowerTitle', description: 'cleanTowerDescription', target: 1 },
  { id: 'ten-towers', icon: 'medal', title: 'tenTowersTitle', description: 'tenTowersDescription', target: 10 },
  { id: 'fifty-towers', icon: 'crown', title: 'fiftyTowersTitle', description: 'fiftyTowersDescription', target: 50 },
  { id: 'all-themes', icon: 'swatchBook', title: 'allThemesTitle', description: 'allThemesDescription', target: 4 },
  { id: 'first-delete', icon: 'eraser', title: 'firstDeleteTitle', description: 'firstDeleteDescription', target: 1 },
] as const
export type Achievement = (typeof achievements)[number]
export type AchievementId = Achievement['id']
export function sortedAchievements(state: AchievementState): Achievement[] {
  return [...achievements].sort(
    (a, b) => Number(state.unlocked[b.id] !== undefined) - Number(state.unlocked[a.id] !== undefined),
  )
}
export interface AchievementState {
  version: 1
  unlocked: Partial<Record<AchievementId, number>>
  themes: AppliedTheme[]
  bestStreak: number
  cleanTowers: number
  activeRun: { id: string; completed: boolean } | null
}
export type AchievementEvent =
  | { kind: 'started'; runId: string }
  | { kind: 'round'; runId: string; round: Round }
  | { kind: 'deleted' }
  | { kind: 'theme'; theme: AppliedTheme }

export function emptyAchievements(): AchievementState {
  return { version: 1, unlocked: {}, themes: [], bestStreak: 0, cleanTowers: 0, activeRun: null }
}
export function bestRowStreak(reviews: Review[], finished: boolean): number {
  let streak = 0,
    best = 0
  for (const row of reviews) {
    // Hard never leaks correctness before the completed tower is checked.
    if (!finished && row.mode === 'hard') break
    streak = isCleanRow(row) ? streak + 1 : 0
    best = Math.max(best, streak)
  }
  return best
}
export function advanceAchievements(state: AchievementState, event: AchievementEvent, at: number): AchievementState {
  const next = { ...state, unlocked: { ...state.unlocked } }
  function unlock(id: AchievementId) {
    next.unlocked[id] ??= at
  }
  switch (event.kind) {
    case 'started':
      next.activeRun = { id: event.runId, completed: false }
      break
    case 'deleted':
      unlock('first-delete')
      break
    case 'theme':
      if (!next.themes.includes(event.theme)) next.themes = [...next.themes, event.theme]
      if (next.themes.length === 4) unlock('all-themes')
      break
    case 'round': {
      if (!next.activeRun || next.activeRun.id !== event.runId || next.activeRun.completed) return state
      const finished = event.round.game.kind === 'done'
      next.bestStreak = Math.max(next.bestStreak, bestRowStreak(event.round.reviews, finished))
      for (const [target, id] of [
        [1, 'first-row'],
        [5, 'five-rows'],
        [10, 'ten-rows'],
      ] as const) {
        if (next.bestStreak >= target) unlock(id)
      }
      if (finished) {
        next.activeRun = { ...next.activeRun, completed: true }
        unlock('first-tower')
        if (event.round.errors === 0 && event.round.reviews.every(isCleanRow)) {
          next.cleanTowers++
          for (const [target, id] of [
            [1, 'clean-tower'],
            [10, 'ten-towers'],
            [50, 'fifty-towers'],
          ] as const) {
            if (next.cleanTowers >= target) unlock(id)
          }
        }
      }
      break
    }
  }
  return next
}
