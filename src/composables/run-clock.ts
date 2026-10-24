import { ref, shallowRef } from 'vue'
import type { RunMeta } from '../domain/run-record'
import type { RunSettings } from '../domain/run-settings'
export function createRunClock(initial: RunMeta | null, now = () => performance.now(), wall = () => Date.now()) {
  const meta = shallowRef(initial)
  const elapsedMs = ref<number | null>(initial?.elapsedMs ?? null)
  let tick: number | null = null
  function refresh() {
    elapsedMs.value = meta.value ? meta.value.elapsedMs + (tick === null ? 0 : Math.max(0, now() - tick)) : null
  }
  function checkpoint() {
    if (meta.value && tick !== null) {
      const next = now()
      meta.value = { ...meta.value, elapsedMs: meta.value.elapsedMs + Math.max(0, next - tick) }
      tick = next
    }
    refresh()
  }
  function active(enabled: boolean): boolean {
    if ((tick !== null) === enabled || !meta.value || meta.value.completedAt !== null) return false
    checkpoint()
    tick = enabled ? now() : null
    refresh()
    return true
  }
  function begin(settings: RunSettings) {
    meta.value = {
      id: crypto.randomUUID(),
      startedAt: wall(),
      elapsedMs: 0,
      completedAt: null,
      archived: false,
      changes: [{ atMs: 0, step: 0, settings }],
    }
    tick = now()
    refresh()
  }
  function finish() {
    checkpoint()
    if (meta.value && meta.value.completedAt === null)
      meta.value = { ...meta.value, completedAt: Math.max(wall(), meta.value.startedAt) }
    tick = null
    refresh()
  }
  function clear() {
    tick = null
    meta.value = null
    refresh()
  }
  return { meta, elapsedMs, refresh, checkpoint, active, begin, finish, clear }
}
