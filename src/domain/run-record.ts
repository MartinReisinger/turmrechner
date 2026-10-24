import type { RoundEvent } from './round'
import type { SettingsChange } from './run-settings'
import type { Review } from './review'
export interface RunMeta {
  id: string
  startedAt: number
  elapsedMs: number
  completedAt: number | null
  archived: boolean
  changes: SettingsChange[]
}
export interface SavedRun {
  id: string
  seed: string
  startedAt: number
  completedAt: number
  durationMs: number
  events: RoundEvent[]
  changes: SettingsChange[]
}
export interface RunView extends SavedRun {
  reviews: Review[]
  errors: number
  clean: boolean
}
export function formatDuration(ms: number | null, precise = false): string {
  if (ms === null) return '—'
  const seconds = Math.floor(Math.max(0, ms) / 1000)
  const minutes = Math.floor(seconds / 60)
  const base = minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` : String(minutes)
  return `${base}:${String(seconds % 60).padStart(2, '0')}${precise ? '.' + String(Math.floor((ms % 1000) / 10)).padStart(2, '0') : ''}`
}
export function modeGroup(run: RunView): string {
  const modes = [...new Set(run.reviews.map((row) => row.mode))]
  return modes.length === 1 ? modes[0] : 'mixed'
}
export function bestRuns(runs: RunView[]): Map<string, RunView> {
  const result = new Map<string, RunView>()
  for (const run of runs.filter((run) => run.clean)) {
    const group = modeGroup(run)
    if (!result.has(group) || run.durationMs < (result.get(group)?.durationMs ?? Infinity)) result.set(group, run)
  }
  return result
}
