import { onMounted, onScopeDispose, shallowRef } from 'vue'
import { demoFrames } from '../domain/demo'
export function useDemoAnimation() {
  const frames = demoFrames()
  const frame = shallowRef(frames[0])
  const media = matchMedia('(prefers-reduced-motion: reduce)')
  let timer: ReturnType<typeof setTimeout> | undefined
  let index = 0
  function schedule() {
    const next = (index + 1) % frames.length
    const delay = next === 0 ? 1800 : frames[next].at - frames[index].at
    timer = setTimeout(() => {
      index = next
      frame.value = frames[index]
      schedule()
    }, delay)
  }
  function restart() {
    clearTimeout(timer)
    index = 0
    frame.value = media.matches ? frames[4] : frames[0]
    if (!media.matches && !document.hidden) schedule()
  }
  onMounted(() => {
    restart()
    media.addEventListener('change', restart)
    document.addEventListener('visibilitychange', restart)
  })
  onScopeDispose(() => {
    clearTimeout(timer)
    media.removeEventListener('change', restart)
    document.removeEventListener('visibilitychange', restart)
  })
  return frame
}
