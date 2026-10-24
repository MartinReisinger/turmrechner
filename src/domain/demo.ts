import { enterDigit, expected, startGame, type Task } from './game'
export interface DemoFrame {
  at: number
  task: Task
  attempt: number | null
  pressed: string | null
  error: boolean
  output: string | null
}
export function demoFrames(): DemoFrame[] {
  let game = startGame('528')
  const frames: DemoFrame[] = []
  function add(
    at: number,
    pressed: string | null = null,
    attempt: number | null = null,
    error = false,
    output: string | null = null,
  ) {
    frames.push({ at, task: structuredClone(game.task), pressed, attempt, error, output })
  }
  add(0)
  add(900, '7', 7, true)
  add(1650)
  const inputs = [6, 1, 5, 0, 0, 1]
  inputs.forEach((digit, index) => {
    const next = enterDigit(game, digit)
    if (next.kind === 'playing' && next.step === 0) game = next
    add(2400 + index * 1000, String(digit), null, false, index === 5 ? '1056' : null)
  })
  return frames
}

export function mentalDemoFrame(frame: DemoFrame): DemoFrame {
  if (frame.output || frame.error || frame.task.phase !== 'extra') return frame
  const game = { ...startGame('528'), task: frame.task }
  const next = enterDigit(game, expected(game.task).extra)
  if (next.kind !== 'playing') return frame
  return { ...frame, task: next.step === 0 ? next.task : frame.task, output: next.step > 0 ? next.current : null }
}
