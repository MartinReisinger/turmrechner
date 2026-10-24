import type { Task } from './game'
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
