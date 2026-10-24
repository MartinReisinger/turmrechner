// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, expect, it } from 'vitest'
import LegalView from '../src/components/LegalView.vue'
import { setLanguage } from '../src/i18n'

afterEach(() => {
  delete window.appConfig
  setLanguage('en')
})

it('reveals the configured contact only after clicking in the imprint', async () => {
  window.appConfig = { contactEmail: 'contact@example.test' }
  setLanguage('en')
  const wrapper = mount(LegalView, { props: { kind: 'imprint' } })
  expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('contact@example.test')
  await wrapper.get('button[aria-controls="provider-details"]').trigger('click')
  expect(wrapper.get('a[href^="mailto:"]').attributes('href')).toBe('mailto:contact@example.test')
  await wrapper.get('button[aria-controls="provider-details"]').trigger('click')
  expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  wrapper.unmount()
})

it.each(['de', 'en'] as const)('keeps contact out of privacy and explains the authority link in %s', (language) => {
  window.appConfig = { contactEmail: 'contact@example.test' }
  setLanguage(language)
  const wrapper = mount(LegalView, { props: { kind: 'privacy' } })
  expect(wrapper.find('a[href^="mailto:"]').exists()).toBe(false)
  expect(wrapper.text()).not.toContain('contact@example.test')
  expect(wrapper.get('a[href="https://dsb.gv.at/"]').text()).toContain(
    language === 'de' ? 'Datenschutzbehörde' : 'Data Protection Authority',
  )
  wrapper.unmount()
})
