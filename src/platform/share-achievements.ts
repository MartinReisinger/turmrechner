import { h, render } from 'vue'
import AppIcon from '../components/AppIcon.vue'
import { sortedAchievements, type Achievement, type AchievementState } from '../domain/achievements'
import { t } from '../i18n'
import { appUrl } from './share-run'

export function achievementShareText(state: AchievementState): string {
  const earned = sortedAchievements(state).filter((item) => state.unlocked[item.id] !== undefined)
  return (
    t('shareCollectionText')
      .replace('{count}', String(earned.length))
      .replace('{total}', String(sortedAchievements(state).length))
      .replace('{link}', appUrl) + (earned.length ? `\n${earned.map((item) => t(item.title)).join(' · ')}` : '')
  )
}
async function iconImage(item: Achievement, color: string): Promise<HTMLImageElement> {
  const host = document.createElement('div')
  render(h(AppIcon, { name: item.icon, size: 64 }), host)
  const svg = host.querySelector('svg')
  if (!svg) throw new Error('Icon unavailable')
  svg.setAttribute('color', color)
  const source = new XMLSerializer().serializeToString(svg)
  render(null, host)
  const image = new Image()
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`
  await image.decode()
  return image
}
/** Creates a local PNG. Locked descriptions are replaced by neutral bars. */
export async function renderAchievementImage(state: AchievementState): Promise<File> {
  const items = sortedAchievements(state)
  const canvas = document.createElement('canvas')
  canvas.width = 1080
  canvas.height = 300 + items.length * 190
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  const css = getComputedStyle(document.documentElement)
  const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  const bg = color('--bg', '#090a0c'),
    text = color('--text', '#f4f5f6')
  const muted = color('--muted', '#969da6'),
    good = color('--good', '#83dc8d')
  const icons = await Promise.all(
    items.map((item) => iconImage(item, state.unlocked[item.id] !== undefined ? good : muted)),
  )
  const font = (size: number, weight = 600) => {
    ctx.font = `${weight} ${size}px ui-rounded, "SF Pro Rounded", system-ui, sans-serif`
  }
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = text
  font(42, 800)
  ctx.fillText(t('title'), 64, 84)
  ctx.fillStyle = muted
  font(28)
  const heading =
    t('yourAchievements') +
    ' · ' +
    t('achievementCount')
      .replace('{count}', String(Object.keys(state.unlocked).length))
      .replace('{total}', String(items.length))
  ctx.fillText(heading, 64, 138)
  items.forEach((item, index) => {
    const y = 180 + index * 190
    const earned = state.unlocked[item.id] !== undefined
    ctx.fillStyle = color('--key', '#15181c')
    ctx.beginPath()
    ctx.roundRect(48, y, 984, 170, 24)
    ctx.fill()
    ctx.drawImage(icons[index], 76, y + 32, 64, 64)
    ctx.fillStyle = text
    font(32, 800)
    ctx.fillText(t(item.title), 170, y + 54, 820)
    ctx.fillStyle = muted
    if (earned) {
      font(25)
      const words = t(item.description).split(' ')
      let line = '',
        lineY = y + 98
      for (const word of words) {
        if (line && ctx.measureText(`${line} ${word}`).width > 810) {
          ctx.fillText(line, 170, lineY)
          lineY += 32
          line = word
        } else line = line ? `${line} ${word}` : word
      }
      ctx.fillText(line, 170, lineY)
    } else {
      ctx.save()
      ctx.filter = 'blur(6px)'
      ctx.globalAlpha = 0.4
      ctx.fillRect(170, y + 84, 400, 14)
      ctx.fillRect(170, y + 114, 260, 14)
      ctx.restore()
    }
  })
  ctx.fillStyle = muted
  font(25)
  ctx.fillText(appUrl, 64, canvas.height - 40)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((value) => (value ? resolve(value) : reject(new Error('PNG unavailable'))), 'image/png'),
  )
  return new File([blob], 'turmrechner-achievements.png', {
    type: 'image/png',
  })
}
export async function shareAchievements(state: AchievementState, file: File): Promise<void> {
  if (!navigator.share || !navigator.canShare?.({ files: [file] })) throw new Error('Sharing unavailable')
  await navigator.share({ files: [file], title: t('title'), text: achievementShareText(state) })
}
