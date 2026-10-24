import { createTask, enterDigit, expected, startGame, steps, type Game } from './game'
import type { Difficulty } from './preferences'
import { calculate, describeEntry, referenceSource, type Entry, type Review } from './review'
export type RoundEvent =
  | { kind: 'input'; digit: number; mode: Difficulty; carries: boolean }
  | { kind: 'continue' }
  | { kind: 'settle' }
  | { kind: 'undo' }
export interface Round {
  game: Game
  mode: Difficulty | null
  entries: Entry[]
  reviews: Review[]
  correction: Review | null
  errors: number
  discarded: { step: number; entry: Entry }[]
  undo: { state: Omit<Round, 'undo'>; entry: Entry }[]
}
export function startRound(seed: string): Round {
  return {
    game: startGame(seed),
    mode: null,
    entries: [],
    reviews: [],
    correction: null,
    errors: 0,
    undo: [],
    discarded: [],
  }
}
function correctResult(game: Game, value: string): Game {
  if (game.kind === 'seed') return game
  const rows = game.rows.map((row, index) => (index === game.rows.length - 1 ? { ...row, value } : row))
  if (game.kind === 'done') return { ...game, rows }
  const op = steps[game.step]
  return { ...game, current: value, rows, task: createTask(value, op.type, op.n) }
}
export function advanceRound(round: Round, event: RoundEvent): Round {
  if (event.kind === 'undo') {
    const point = round.undo.at(-1)
    if (!point || round.correction) return round
    return {
      ...point.state,
      discarded:
        point.entry.grade === 'wrong' && point.state.game.kind === 'playing'
          ? [...round.discarded, { step: point.state.game.step, entry: { ...point.entry, accepted: false } }]
          : round.discarded,
      errors: round.errors,
      undo: round.undo.slice(0, -1),
    }
  }
  if (event.kind === 'continue') return round.correction ? { ...round, correction: null } : round
  if (round.game.kind !== 'playing' || round.correction) return round
  if (event.kind === 'settle' && round.game.task.phase !== 'extra') return round
  const mode = round.mode ?? (event.kind === 'input' ? event.mode : 'easy')
  const digit = event.kind === 'input' ? event.digit : expected(round.game.task).extra
  const entry = event.kind === 'input' ? describeEntry(round.game, digit) : null
  const accepted = mode !== 'easy' || entry?.grade !== 'wrong'
  if (entry) entry.accepted = accepted
  const entries = entry ? [...round.entries, entry] : round.entries
  const errors = round.errors + (entry?.grade === 'wrong' ? 1 : 0)
  if (!accepted) return { ...round, mode, entries, errors }
  const { undo: previousUndo, ...state } = round
  const undo = entry ? (mode === 'easy' ? [] : [...previousUndo, { state, entry }]) : previousUndo
  const before = round.game
  let game = enterDigit(before, digit, false)
  if (event.kind === 'input' && !event.carries && game.kind === 'playing' && game.task.phase === 'extra') {
    game = enterDigit(game, expected(game.task).extra, false)
  }
  if (game.kind === 'playing' && game.step === before.step) return { ...round, game, mode, entries, errors, undo }
  if (game.kind === 'seed') return round
  const review: Review = {
    step: before.step,
    mode,
    source: before.current,
    entered: game.rows.at(-1)?.value ?? '',
    expected: calculate(before.current, before.step),
    reference: calculate(referenceSource(before.seed, before.step), before.step),
    entries: [...entries, ...round.discarded.filter((item) => item.step === before.step).map((item) => item.entry)],
  }
  const rowWrong =
    review.entered !== review.expected || review.entries.some((entry) => entry.accepted && entry.grade === 'wrong')
  if (mode === 'normal') game = correctResult(game, review.expected)
  return {
    game,
    mode: null,
    entries: [],
    reviews: [...round.reviews, review],
    correction: mode === 'normal' && rowWrong ? review : null,
    errors,
    undo,
    discarded: round.discarded,
  }
}
export function replayRound(seed: string, events: RoundEvent[]): Round | null {
  let round = startRound(seed)
  for (const event of events) {
    const next = advanceRound(round, event)
    if (next === round) return null
    round = next
  }
  return round
}
