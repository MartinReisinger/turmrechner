import type { Task } from './game'
import { steps } from './game'
import type { Review } from './review'
export function completedRowColumns(value: string, review?: Review): { value: string; extra: string }[] {
  const helpers = new Map<number, string>()
  if (review) {
    const offset = steps[review.step].type === 'div' ? 1 : 0
    for (const entry of review.entries) {
      if (!entry.accepted || entry.phase !== 'extra') continue
      const extra = review.mode === 'normal' ? entry.expected : entry.value
      helpers.set(entry.place - offset, extra ? String(extra) : '')
    }
  }
  return [...value].map((digit, index) => ({
    value: digit,
    extra: helpers.get(value.length - index - 1) ?? '',
  }))
}
export interface Column {
  value: string
  extra: string
  active: boolean
  extraActive: boolean
  anchor: boolean
}
/** Positions helpers and the scroll anchor independently of helper visibility. */
export function taskColumns(task: Task): Column[] {
  const leading = task.type === 'mul' ? 1 : 0
  return Array.from({ length: task.digits.length + leading }, (_, column) => {
    const index = column - leading
    const extraActive =
      task.phase === 'extra' && (task.type === 'mul' ? index === task.index : index === task.index + 1)
    const active = (task.phase === 'digit' && index === task.index) || (task.phase === 'leading' && index < 0)
    const extra = task.type === 'mul' ? task.extras[index] : task.extras[index - 1]
    return {
      value: index < 0 ? '' : task.result[index],
      extra: extra && extra !== '0' ? extra : '',
      active,
      extraActive,
      anchor:
        active ||
        (task.phase === 'extra' &&
          (task.type === 'mul'
            ? column === (task.index === 0 ? 0 : task.index + 1)
            : index === Math.min(task.index + 1, task.digits.length - 1))),
    }
  })
}
