import { onScopeDispose, ref, shallowRef } from 'vue'
import {
  achievements,
  advanceAchievements,
  emptyAchievements,
  type AchievementEvent,
  type AchievementId,
} from '../domain/achievements'
import { parseAchievements } from '../domain/achievement-codec'
import { readStorage, writeStorage } from '../platform/storage'

export const achievementsKey = 'turmrechner.achievements.v1'
export function useAchievements(wall = () => Date.now()) {
  const state = shallowRef(parseAchievements(readStorage(achievementsKey)))
  const storageIssue = ref(false)
  const announcement = shallowRef<AchievementId[]>([])
  const pending: AchievementId[][] = []
  let timer: ReturnType<typeof setTimeout> | undefined
  function dismiss() {
    clearTimeout(timer)
    pending.length = 0
    announcement.value = []
  }
  function showNext() {
    announcement.value = pending.shift() ?? []
    if (announcement.value.length) timer = setTimeout(showNext, 4000)
  }
  function observe(event: AchievementEvent) {
    const previous = state.value
    const next = advanceAchievements(previous, event, wall())
    if (JSON.stringify(previous) === JSON.stringify(next)) return
    const unlocked = achievements.filter(
      ({ id }) => previous.unlocked[id] === undefined && next.unlocked[id] !== undefined,
    )
    state.value = next
    storageIssue.value = !writeStorage(achievementsKey, next)
    if (unlocked.length) {
      pending.push(unlocked.map(({ id }) => id))
      if (!announcement.value.length) showNext()
    }
  }
  function clear() {
    dismiss()
    state.value = emptyAchievements()
    storageIssue.value = false
  }
  onScopeDispose(dismiss)
  return { state, storageIssue, announcement, observe, dismiss, clear }
}
