import { isRecord } from '../platform/storage'
import { replayRound, type RoundEvent } from './round'
import { isCleanRow } from './review'
import { parseChanges } from './run-settings'
import type { RunMeta, RunView, SavedRun } from './run-record'
export function finiteTime(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER
}
export function parseEvents(value: unknown): RoundEvent[] | null {
  if (!Array.isArray(value) || value.length > 10000) return null
  const events: RoundEvent[] = []
  for (const event of value) {
    if (!isRecord(event)) return null
    if (event.kind === 'continue' || event.kind === 'settle' || event.kind === 'undo') events.push({ kind: event.kind })
    else if (
      event.kind === 'input' &&
      typeof event.digit === 'number' &&
      Number.isInteger(event.digit) &&
      event.digit >= 0 &&
      event.digit <= 9 &&
      (event.mode === 'easy' || event.mode === 'normal' || event.mode === 'hard') &&
      typeof event.carries === 'boolean'
    )
      events.push({ kind: 'input', digit: event.digit, mode: event.mode, carries: event.carries })
    else return null
  }
  return events
}
export function parseMeta(value: unknown): RunMeta | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    value.id.length > 100 ||
    !finiteTime(value.startedAt) ||
    !finiteTime(value.elapsedMs) ||
    !(value.completedAt === null || (finiteTime(value.completedAt) && value.completedAt >= value.startedAt)) ||
    typeof value.archived !== 'boolean'
  )
    return null
  const changes = parseChanges(value.changes)
  return changes
    ? {
        id: value.id,
        startedAt: value.startedAt,
        elapsedMs: value.elapsedMs,
        completedAt: value.completedAt,
        archived: value.archived,
        changes,
      }
    : null
}
export function runView(saved: SavedRun): RunView | null {
  const round = replayRound(saved.seed, saved.events)
  if (!round || round.game.kind !== 'done') return null
  const clean = round.errors === 0 && round.reviews.every(isCleanRow)
  return { ...saved, reviews: round.reviews, errors: round.errors, clean }
}
export function parseRun(value: unknown): RunView | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !value.id ||
    value.id.length > 100 ||
    typeof value.seed !== 'string' ||
    !/^\d{1,6}$/.test(value.seed) ||
    !finiteTime(value.startedAt) ||
    !finiteTime(value.completedAt) ||
    value.completedAt < value.startedAt ||
    !finiteTime(value.durationMs)
  )
    return null
  const events = parseEvents(value.events),
    changes = parseChanges(value.changes)
  if (!events || !changes) return null
  return runView({
    id: value.id,
    seed: value.seed,
    startedAt: value.startedAt,
    completedAt: value.completedAt,
    durationMs: value.durationMs,
    events,
    changes,
  })
}
