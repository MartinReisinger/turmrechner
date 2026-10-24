// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import App from '../src/App.vue'
import AchievementsView from '../src/components/AchievementsView.vue'
import { emptyAchievements } from '../src/domain/achievements'
import { achievementsKey } from '../src/composables/useAchievements'
import { defaultPreferences, onboardingOptions } from '../src/domain/preferences'
import { setLanguage } from '../src/i18n'

vi.mock('virtual:pwa-register/vue', () => ({
  useRegisterSW: () => ({ needRefresh: ref(false), updateServiceWorker: vi.fn() }),
}))
const wrappers: ReturnType<typeof mount>[] = []
let systemChange: () => void
let dark = false
beforeEach(() => {
  vi.useFakeTimers()
  localStorage.clear()
  dark = false
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return dark
    },
    addEventListener(event: string, callback: () => void) {
      if (event === 'change' && query === '(prefers-color-scheme: dark)') systemChange = callback
    },
    removeEventListener() {},
  }))
  localStorage.setItem(
    'turmrechner.preferences.v1',
    JSON.stringify({
      ...defaultPreferences(),
      language: 'en',
      preview: false,
      carries: false,
      timer: true,
      onboarded: true,
      onboardingChoices: [...onboardingOptions],
    }),
  )
  setLanguage('en')
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})
it('sorts unlocked achievements first and blurs their descriptions without exposing individual progress', () => {
  const state = emptyAchievements()
  state.unlocked['first-row'] = 123
  state.bestStreak = 4
  state.themes = ['white']
  const wrapper = mount(AchievementsView, { props: { state } })
  wrappers.push(wrapper)
  const rows = wrapper.findAll('li')
  expect(rows[1].text()).toContain('On a roll!')
  expect(rows[0].classes()).toContain('earned')
  expect(rows[1].get('p').classes()).toContain('locked-description')
  expect(rows[1].get('p').attributes('aria-hidden')).toBe('true')
  expect(rows[0].get('p').classes()).not.toContain('locked-description')
  expect(wrapper.text()).not.toContain('4/5')
  expect(wrapper.find('.theme-progress').exists()).toBe(false)
  expect(wrapper.findAll('.share-achievement')).toHaveLength(1)
  expect(wrapper.find('.achievement-list .share-achievement').exists()).toBe(false)
})
it('unlocks and announces the fourth theme directly in settings, then opens the collection', async () => {
  localStorage.setItem(achievementsKey, JSON.stringify({ ...emptyAchievements(), themes: ['white', 'warm', 'oled'] }))
  const wrapper = mount(App)
  wrappers.push(wrapper)
  await wrapper.get('button[aria-label="Settings"]').trigger('click')
  const monokai = wrapper.get('.swatch[data-theme="monokai"]')
  await monokai.trigger('click')
  expect(wrapper.find('.achievement-toast').exists()).toBe(false)
  dark = true
  systemChange()
  await nextTick()
  expect(document.documentElement.dataset.theme).toBe('monokai')
  expect(wrapper.get('.brand').text()).toBe('Settings')
  expect(wrapper.get('.achievement-toast').text()).toContain('Aesthetic addict')
  expect(wrapper.get('[role="status"][aria-live="polite"]').text()).toContain('Achievement unlocked')
  await wrapper.get('.achievement-toast').trigger('click')
  expect(wrapper.get('.brand').text()).toBe('Achievements')
  expect(wrapper.find('.achievement-toast').exists()).toBe(false)
  await wrapper.get('button[aria-label="Close"]').trigger('click')
  expect(wrapper.find('button[aria-label="Achievements"]').exists()).toBe(true)
})
it('pauses an active game on the achievements page and returns with the same inputs', async () => {
  const wrapper = mount(App)
  wrappers.push(wrapper)
  window.dispatchEvent(new KeyboardEvent('keydown', { key: '2' }))
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))
  await nextTick()
  vi.advanceTimersByTime(2000)
  await wrapper.get('button[aria-label="Achievements"]').trigger('click')
  const saved = JSON.parse(localStorage.getItem('turmrechner.session.v1') ?? '{}')
  vi.advanceTimersByTime(10000)
  await nextTick()
  expect(JSON.parse(localStorage.getItem('turmrechner.session.v1') ?? '{}')).toEqual(saved)
  await wrapper.get('button[aria-label="Close"]').trigger('click')
  expect(wrapper.get('.counter').text()).toBe('0:02')
  expect(wrapper.find('.tower-viewport').exists()).toBe(true)
})
it('clears the achievements with reset while preserving unrelated storage', async () => {
  localStorage.setItem(achievementsKey, JSON.stringify({ ...emptyAchievements(), unlocked: { 'first-delete': 123 } }))
  localStorage.setItem('unrelated', 'keep')
  const wrapper = mount(App)
  wrappers.push(wrapper)
  await wrapper.get('button[aria-label="Settings"]').trigger('click')
  vi.stubGlobal('confirm', () => true)
  await wrapper.get('.reset-all').trigger('click')
  const stored = JSON.parse(localStorage.getItem(achievementsKey) ?? 'null')
  expect(stored?.unlocked ?? {}).toEqual({})
  expect(localStorage.getItem('unrelated')).toBe('keep')
})
