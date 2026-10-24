import { restoreSession } from './session'
import { isRecord } from '../platform/storage'
import { parseEvents, parseMeta } from './run-codec'
import { replayRound, type RoundEvent, type Round } from './round'
import type { RunMeta } from './run-record'
import type { Game } from './game'
export type PlaySession =
  | { version: 1; kind: 'seed'; text: string }
  | { version: 2; kind: 'tower'; seed: string; events: RoundEvent[]; meta: RunMeta | null }
export function loadPlaySession(value: unknown): { session: PlaySession; game: Game; round: Round | null } {
  const legacy = restoreSession(value)
  const fresh = {
    session: { version: 1, kind: 'seed', text: '' },
    game: { kind: 'seed', text: '' },
    round: null,
  } satisfies { session: PlaySession; game: Game; round: Round | null }
  if (isRecord(value) && value.version === 2 && value.kind === 'tower') {
    if (typeof value.seed !== 'string' || !/^\d{1,6}$/.test(value.seed)) return fresh
    const events = parseEvents(value.events)
    if (!events) return fresh
    const round = replayRound(value.seed, events)
    if (!round) return fresh
    const meta = parseMeta(value.meta)
    if (meta?.completedAt !== null && meta !== null && round.game.kind !== 'done') return fresh
    return { session: { version: 2, kind: 'tower', seed: value.seed, events, meta }, game: round.game, round }
  }
  if (legacy.session.kind === 'seed') return { session: legacy.session, game: legacy.game, round: null }
  const events: RoundEvent[] = legacy.session.entries.map((digit) => ({
    kind: 'input',
    digit,
    mode: 'easy',
    carries: true,
  }))
  const round = replayRound(legacy.session.seed, events)
  return round
    ? { session: { version: 2, kind: 'tower', seed: legacy.session.seed, events, meta: null }, game: round.game, round }
    : fresh
}
