// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { expect, it } from 'vitest'
import OnboardingFlow from '../src/components/OnboardingFlow.vue'
import { defaultPreferences, parsePreferences } from '../src/domain/preferences'

it('preselects system appearance and allows continuing without a theme choice', async () => {
  const wrapper = mount(OnboardingFlow, {
    props: { preferences: { ...defaultPreferences(), onboardingStep: 6 } },
  })
  try {
    expect(wrapper.get('.mode-choices .choice[aria-pressed="true"]').text()).toContain('System')
    expect(wrapper.get('button.primary').attributes('disabled')).toBeUndefined()
    await wrapper.get('button.primary').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([{ onboardingStep: 7 }])
  } finally {
    wrapper.unmount()
  }
})

it('preselects monochrome variants while keeping alternative themes selectable', async () => {
  const preferences = { ...defaultPreferences(), onboardingStep: 7 }
  const wrapper = mount(OnboardingFlow, { props: { preferences } })
  try {
    for (const variant of ['white', 'oled'])
      expect(wrapper.get(`[data-theme="${variant}"]`).attributes('aria-pressed')).toBe('true')
    expect(wrapper.get('button.primary').attributes('disabled')).toBeUndefined()
    await wrapper.get('button.primary').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([{ onboardingStep: 5 }])
    await wrapper.get('[data-theme="warm"]').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([{ light: 'warm', onboardingChoices: ['light'] }])
    await wrapper.setProps({ preferences: { ...preferences, light: 'warm', onboardingChoices: ['light'] } })
    expect(wrapper.get('[data-theme="warm"]').attributes('aria-pressed')).toBe('true')
    await wrapper.get('[data-theme="monokai"]').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([{ dark: 'monokai', onboardingChoices: ['light', 'dark'] }])
  } finally {
    wrapper.unmount()
  }
})

it('restores and completes onboarding without explicit theme choices', () => {
  const saved = {
    ...defaultPreferences(),
    onboardingStep: 8,
    onboardingChoices: ['timer', 'preview', 'carries', 'haptics', 'difficulty'],
    timer: false,
    preview: false,
    carries: false,
    onboarded: true,
  }
  expect(parsePreferences(saved)).toEqual(saved)
  expect(parsePreferences({ ...saved, light: 'warm', dark: 'monokai' })).toMatchObject({
    light: 'warm',
    dark: 'monokai',
    onboarded: true,
  })
})
