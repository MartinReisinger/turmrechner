export type Operation = 'mul' | 'div'
export type Phase = 'digit' | 'extra' | 'leading'
export interface Task {
  type: Operation
  n: number
  digits: number[]
  index: number
  phase: Phase
  extraIn: number
  result: string[]
  extras: string[]
}
export interface Row {
  value: string
  type: Operation | null
  n: number | null
}
export type Game =
  | { kind: 'seed'; text: string }
  | { kind: 'playing'; seed: string; current: string; step: number; task: Task; rows: Row[] }
  | { kind: 'done'; seed: string; rows: Row[] }

export const steps: RowStep[] = [
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((n): RowStep => ({ type: 'mul', n })),
  ...[2, 3, 4, 5, 6, 7, 8, 9].map((n): RowStep => ({ type: 'div', n })),
]
interface RowStep {
  type: Operation
  n: number
}

export function createTask(value: string, type: Operation, n: number): Task {
  const digits = [...value].map(Number)
  return {
    type,
    n,
    digits,
    index: type === 'mul' ? digits.length - 1 : 0,
    phase: 'digit',
    extraIn: 0,
    result: digits.map(() => ''),
    extras: digits.map(() => ''),
  }
}

export function startGame(seed: string): Extract<Game, { kind: 'playing' }> {
  if (!/^\d{1,6}$/.test(seed)) throw new Error('Invalid seed')
  const value = BigInt(seed).toString()
  return {
    kind: 'playing',
    seed: value,
    current: value,
    step: 0,
    task: createTask(value, 'mul', 2),
    rows: [{ value, type: 'mul', n: 2 }],
  }
}

export function expected(task: Task) {
  const digit = task.digits[task.index]
  const total = task.type === 'mul' ? digit * task.n + task.extraIn : task.extraIn * 10 + digit
  return task.type === 'mul'
    ? { digit: total % 10, extra: Math.floor(total / 10) }
    : { digit: Math.floor(total / task.n), extra: total % task.n }
}

/** Returns the original state for a rejected digit. Every column requires an extra, including zero. */
export function enterDigit(game: Game, digit: number, validate = true): Game {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) return game
  if (game.kind === 'seed') {
    if (game.text.length >= 6) return game
    return { kind: 'seed', text: (game.text === '0' ? '' : game.text) + digit }
  }
  if (game.kind !== 'playing') return game
  const wanted = expected(game.task)[game.task.phase === 'digit' ? 'digit' : 'extra']
  if (validate && digit !== wanted) return game
  const next = structuredClone(game)
  const task = next.task
  if (task.phase === 'digit') {
    task.result[task.index] = String(digit)
    task.phase = task.type === 'mul' && task.index === 0 && expected(task).extra > 0 ? 'leading' : 'extra'
    return next
  }
  task.extras[task.index] = String(digit)
  task.extraIn = digit
  task.index += task.type === 'mul' ? -1 : 1
  if (task.index >= 0 && task.index < task.digits.length) {
    task.phase = 'digit'
    return next
  }
  const carry = task.type === 'mul' && digit ? String(digit) : ''
  const value = (carry + task.result.join('')).replace(/^0+(?=\d)/, '') || '0'
  const step = next.step + 1
  if (step === steps.length) {
    return { kind: 'done', seed: next.seed, rows: [...next.rows, { value, type: null, n: null }] }
  }
  const operation = steps[step]
  next.current = value
  next.step = step
  next.task = createTask(value, operation.type, operation.n)
  next.rows.push({ value, ...operation })
  return next
}

export function randomSeed(random = Math.random): string {
  const roll = random()
  const [min, max] = roll < 0.7 ? [1000, 9999] : roll < 0.9 ? [10000, 99999] : [100000, 999999]
  return String(Math.floor(random() * (max - min + 1)) + min)
}
