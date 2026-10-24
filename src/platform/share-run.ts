import { formatDuration, type RunView } from '../domain/run-record'
import { reviewDisplayCells } from '../domain/review'
import { steps } from '../domain/game'
import { t } from '../i18n'
import { formatLocalDate } from './date-format'
export const appUrl = 'https://turmrechner.com/'
export async function renderRunImage(run: RunView): Promise<File> {
  const rows = run.reviews.map((review) => {
    const cells = reviewDisplayCells(review)
    return { review, cells, height: cells.some((cell) => cell.helper) ? 80 : 64 }
  })
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 450 + rows.reduce((height, row) => height + row.height, 0)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  const css = getComputedStyle(document.documentElement)
  const color = (key: string, fallback: string) => css.getPropertyValue(key).trim() || fallback
  const bg = color('--bg', '#090a0c'),
    text = color('--text', '#f4f5f6'),
    muted = color('--muted', '#969da6')
  const colors = {
    right: color('--good', '#83dc8d'),
    wrong: color('--bad', '#ff7b73'),
    consequence: color('--warning', '#e8ba54'),
  }
  const font = (size: number, weight = 600) => {
    ctx.font = `${weight} ${size}px ui-rounded, "SF Pro Rounded", system-ui, sans-serif`
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.textAlign = 'left'
  ctx.fillStyle = text
  font(42, 800)
  ctx.fillText(t('title'), 80, 92)
  font(28)
  ctx.fillStyle = muted
  const modes = [...new Set(run.changes.map((change) => t(change.settings.difficulty)))].join(', ')
  ctx.fillText(`${formatDuration(run.durationMs, true)} · ${modes} · ${run.errors} ${t('errors')}`, 80, 145)
  font(24)
  ctx.fillText(formatLocalDate(run.completedAt, true), 80, 188)
  const right = 890,
    col = 36
  let y = 275
  ctx.textAlign = 'right'
  font(48, 720)
  ctx.fillStyle = colors.right
  ctx.fillText(run.seed, right, y)
  font(32)
  ctx.fillStyle = muted
  ctx.fillText('× 2', 1000, y)
  for (const { review: row, cells, height } of rows) {
    y += height
    for (const cell of cells) {
      const x = right - cell.place * col
      ctx.fillStyle = colors[cell.grade]
      font(48, 720)
      ctx.fillText(cell.value, x, y)
      if (cell.helper) {
        ctx.fillStyle = colors[cell.helper.grade]
        font(22)
        ctx.fillText(String(cell.helper.value), x - 18, y - 44)
      }
    }
    if (row.step < 15) {
      const op = steps[row.step + 1]
      font(32)
      ctx.fillStyle = muted
      ctx.fillText(`${op.type === 'mul' ? '×' : '÷'} ${op.n}`, 1000, y)
    }
  }
  y = canvas.height - 98
  ctx.textAlign = 'left'
  font(24)
  let x = 80
  for (const grade of ['right', 'consequence', 'wrong'] as const) {
    ctx.fillStyle = colors[grade]
    ctx.fillText(t(grade), x, y)
    x += 285
  }
  ctx.fillStyle = muted
  font(27)
  ctx.fillText(appUrl, 80, canvas.height - 42)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG unavailable'))), 'image/png'),
  )
  return new File([blob], `turmrechner-${run.seed}.png`, { type: 'image/png' })
}
export async function shareRun(run: RunView, file: File): Promise<void> {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) throw new Error('Sharing unavailable')
  const seconds = Math.floor(Math.max(0, run.durationMs) / 1000)
  const message = t('shareResult')
    .replace('{seed}', run.seed)
    .replace('{minutes}', String(Math.floor(seconds / 60)))
    .replace('{seconds}', String(seconds % 60))
    .replace('{link}', appUrl)
  await navigator.share({
    files: [file],
    title: t('title'),
    text: message,
  })
}
