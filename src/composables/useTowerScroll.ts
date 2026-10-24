import { nextTick, onMounted, ref, watch, type Ref } from 'vue'
import type { Game } from '../domain/game'

type Playing = Extract<Game, { kind: 'playing' }>
export function useTowerScroll(scroller: Ref<HTMLElement | undefined>, getGame: () => Playing, enabled = () => true) {
  const hasScrolled = ref(false)
  let initializedStep = -1
  async function keepVisible() {
    await nextTick()
    const element = scroller.value
    if (!element) return
    const game = getGame()
    if (!enabled() && initializedStep === game.step) return
    const anchor = element.querySelector<HTMLElement>('[data-anchor="true"]')
    if (!anchor) return
    if (initializedStep !== game.step) {
      initializedStep = game.step
      hasScrolled.value = false
      // Initialize once per operation. Rejected input never resets or recreates this viewport.
      element.scrollLeft = game.task.type === 'mul' ? element.scrollWidth - element.clientWidth : 0
    }
    const bounds = element.getBoundingClientRect()
    const box = anchor.getBoundingClientRect()
    const delta = box.left + box.width / 2 - bounds.left - bounds.width / 2
    if (game.task.type === 'mul' ? delta < 0 : delta > 0) {
      element.scrollTo({
        left: Math.max(0, element.scrollLeft + delta),
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      })
      hasScrolled.value = true
    }
  }
  watch(() => [getGame().step, getGame().task.index, getGame().task.phase], keepVisible)
  onMounted(keepVisible)
  return hasScrolled
}
