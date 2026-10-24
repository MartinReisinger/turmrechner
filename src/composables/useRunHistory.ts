import { ref, shallowRef } from 'vue'
import { isRecord, readStorage, writeStorage } from '../platform/storage'
import { parseRun } from '../domain/run-codec'
import type { RunView } from '../domain/run-record'
export const historyKey = 'turmrechner.history.v1'
export function useRunHistory() {
  const stored = readStorage(historyKey)
  const seen = new Set<string>()
  const runs = shallowRef<RunView[]>(
    isRecord(stored) && stored.version === 1 && Array.isArray(stored.runs)
      ? stored.runs
          .flatMap((value) => {
            const run = parseRun(value)
            if (!run || seen.has(run.id)) return []
            seen.add(run.id)
            return [run]
          })
          .sort((a, b) => b.completedAt - a.completedAt)
      : [],
  )
  const storageIssue = ref(false)
  function persist() {
    const records = runs.value.map(({ id, seed, startedAt, completedAt, durationMs, events, changes }) => ({
      id,
      seed,
      startedAt,
      completedAt,
      durationMs,
      events,
      changes,
    }))
    const saved = writeStorage(historyKey, { version: 1, runs: records })
    storageIssue.value = !saved
    return saved
  }
  function add(run: RunView): boolean {
    if (!runs.value.some((item) => item.id === run.id))
      runs.value = [run, ...runs.value].sort((a, b) => b.completedAt - a.completedAt)
    return persist()
  }
  function remove(id: string) {
    const run = runs.value.find((item) => item.id === id)
    runs.value = runs.value.filter((item) => item.id !== id)
    persist()
    return run
  }
  function clear() {
    runs.value = []
    storageIssue.value = false
  }
  return { runs, storageIssue, add, remove, clear }
}
