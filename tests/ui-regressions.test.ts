// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App.vue'
import GameView from '../src/components/GameView.vue'
import ArithmeticDemo from '../src/components/ArithmeticDemo.vue'
import ThemeChoices from '../src/components/ThemeChoices.vue'
import { demoFrames } from '../src/domain/demo'
import { defaultPreferences, onboardingOptions } from '../src/domain/preferences'
import { enterDigit, startGame } from '../src/domain/game'
import { setLanguage } from '../src/i18n'

vi.mock('virtual:pwa-register/vue', () => ({
  useRegisterSW: () => ({ needRefresh: ref(false), updateServiceWorker: vi.fn() }),
}))
const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener() {}, removeEventListener() {} }))
  vi.spyOn(HTMLElement.prototype, 'animate').mockReturnValue({} as Animation)
  setLanguage('en')
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('arithmetic viewport regressions', () => {
  it('keeps the viewport and scroll position through repeated errors and accepted input', async () => {
    const game = startGame('234')
    const wrapper = mount(GameView, {
      props: {
        game,
        preferences: { ...defaultPreferences(), preview: true, carries: true },
        feedback: null,
        mistakes: 0,
      },
    })
    wrappers.push(wrapper)
    await nextTick()
    const scroller = wrapper.get('.number-scroller').element
    scroller.scrollLeft = 67
    for (const mistakes of [1, 2]) {
      await wrapper.setProps({ feedback: 'wrongDigit', mistakes })
      expect(wrapper.get('.number-scroller').element).toBe(scroller)
      expect(scroller.scrollLeft).toBe(67)
      expect(wrapper.get('.tower-viewport').classes()).toContain('input-error')
    }
    await wrapper.setProps({ game: enterDigit(game, 8), feedback: null })
    await nextTick()
    expect(wrapper.get('.number-scroller').element).toBe(scroller)
    expect(scroller.scrollLeft).toBe(67)
    expect(wrapper.get('.tower-viewport').classes()).not.toContain('input-error')
    expect(wrapper.find('.row-rule').exists()).toBe(false)
    expect(wrapper.find('.feedback').exists()).toBe(false)
    expect(HTMLElement.prototype.animate).toHaveBeenCalledTimes(2)
  })
})

it('switches all UI text immediately and clears only app data when restarting onboarding', async () => {
  localStorage.setItem(
    'turmrechner.preferences.v1',
    JSON.stringify({
      ...defaultPreferences(),
      language: 'en',
      preview: true,
      carries: false,
      timer: false,
      onboarded: true,
      onboardingChoices: [...onboardingOptions],
    }),
  )
  localStorage.setItem('unrelated', 'keep')
  const wrapper = mount(App)
  wrappers.push(wrapper)
  await wrapper.get('button[aria-label="Settings"]').trigger('click')
  await wrapper.get('[data-language="de"]').trigger('click')
  await nextTick()
  expect(document.documentElement.lang).toBe('de')
  expect(document.title).toBe('Turmrechnen')
  expect(wrapper.get('.brand').text()).toBe('Einstellungen')
  expect(wrapper.get('.reset-all').text()).toBe('Alles zurücksetzen')
  expect(JSON.parse(localStorage.getItem('turmrechner.preferences.v1') ?? '{}').language).toBe('de')
  vi.stubGlobal('confirm', vi.fn(() => true))
  await wrapper.get('.reset-all').trigger('click')
  expect(wrapper.find('.welcome-hero').exists()).toBe(true)
  expect(localStorage.getItem('turmrechner.preferences.v1')).toBe(null)
  expect(localStorage.getItem('turmrechner.session.v1')).toBe(null)
  expect(localStorage.getItem('unrelated')).toBe('keep')
})

it('keeps equal preview slots, continuous hints, and hides rejected demo digits', async () => {
  const frames = demoFrames()
  const error = frames.find((frame) => frame.error)
  if (!error) throw new Error('Missing mistake frame')
  const wrapper = mount(ArithmeticDemo, {
    props: { frame: error, preview: true, carries: true, showPreviewRow: true },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('.result').text()).not.toContain('7')
  const resultElement = wrapper.get('.result').element
  const carry = frames.find((frame) => frame.task.phase === 'extra')
  if (!carry) throw new Error('Missing carry frame')
  await wrapper.setProps({ frame: carry })
  expect(wrapper.get('.result').element).toBe(resultElement)
  expect(wrapper.get('.demo-prompt').text()).not.toBe('')
  await wrapper.setProps({ preview: false })
  expect(wrapper.get('.demo-prompt').text()).toBe('')
  await wrapper.setProps({ frame: frames.at(-1), preview: true })
  expect(wrapper.find('.extra-cursor').exists()).toBe(false)
  expect(wrapper.get('.demo-prompt').text()).toBe('5 × 2')
})

it('places the start-number cursor after the entered digits and removes it at the input limit', async () => {
  const wrapper = mount(GameView, {
    props: {
      game: { kind: 'seed', text: '23' },
      preferences: defaultPreferences(),
      feedback: null,
      mistakes: 0,
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.get('.seed-value > span:first-child').text()).toBe('23')
  expect(wrapper.get('.seed-text > span:last-child').classes()).toContain('seed-cursor')
  await wrapper.setProps({ game: { kind: 'seed', text: '123456' } })
  expect(wrapper.find('.seed-cursor').exists()).toBe(false)
  await wrapper.setProps({ game: { kind: 'seed', text: '' } })
  expect(wrapper.get('.seed-text').text()).toBe('')
  expect(wrapper.get('.seed-text').classes()).toContain('empty')
  expect(wrapper.find('.seed-cursor').exists()).toBe(true)
})

it('renders theme samples with the selected preview and carry preferences', async () => {
  const wrapper = mount(ThemeChoices, {
    props: {
      preferences: { ...defaultPreferences(), preview: true, carries: true },
      variants: true,
    },
  })
  wrappers.push(wrapper)
  expect(wrapper.findAll('.demo-prompt')).toHaveLength(4)
  for (const sample of wrapper.findAll('.arithmetic-demo')) {
    expect(sample.get('.demo-prompt').text()).toBe('5 × 2')
    expect(sample.get('.helpers').text()).toContain('1')
    expect(sample.find('.cursor').exists()).toBe(true)
  }
  await wrapper.setProps({ preferences: { ...defaultPreferences(), preview: false, carries: false } })
  expect(wrapper.findAll('.demo-prompt')).toHaveLength(0)
  for (const sample of wrapper.findAll('.arithmetic-demo')) expect(sample.get('.helpers').text()).toBe('')
})
