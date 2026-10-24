// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import ShareAchievementsButton from '../src/components/ShareAchievementsButton.vue'
import { emptyAchievements } from '../src/domain/achievements'
import { achievementShareText, shareAchievements, renderAchievementImage } from '../src/platform/share-achievements'
import { setLanguage } from '../src/i18n'

vi.mock('../src/platform/share-achievements', async (original) => ({
  ...(await original<typeof import('../src/platform/share-achievements')>()),
  renderAchievementImage: vi.fn(async () => new File(['image'], 'achievement.png', { type: 'image/png' })),
}))
const wrappers: ReturnType<typeof mount>[] = []
beforeEach(() => {
  setLanguage('en')
  vi.stubGlobal('navigator', { share: vi.fn().mockResolvedValue(undefined), canShare: () => true })
})
afterEach(() => {
  for (const wrapper of wrappers.splice(0)) wrapper.unmount()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})
function collection() {
  const state = emptyAchievements()
  state.unlocked = { 'first-row': 123, 'all-themes': 124, 'first-delete': 125 }
  return state
}
it('shares the requested collection caption, unlocked names, image, and one app link', async () => {
  const file = new File(['image'], 'achievement.png', { type: 'image/png' })
  await shareAchievements(collection(), file)
  expect(navigator.share).toHaveBeenCalledWith({
    files: [file],
    title: 'Tower arithmetic',
    text: 'Look at what I achieved: 3 of 9. Try it: https://turmrechner.com/\nIt all adds up · Aesthetic addict · Eraser rookie',
  })
})
it('localizes captions and keeps locked achievements out of the shared text', () => {
  setLanguage('de')
  const text = achievementShareText(collection())
  expect(text).toContain('Schau, was ich geschafft habe: 3 von 9.')
  expect(text).toContain('Die Rechnung geht auf')
  expect(text).not.toContain('Läuft bei dir!')
  expect(text).not.toContain('Probiere alle Themes')
})
it('uses an icon-only action and ignores native share cancellation', async () => {
  vi.mocked(navigator.share).mockRejectedValue(new DOMException('cancelled', 'AbortError'))
  const wrapper = mount(ShareAchievementsButton, { props: { state: collection() } })
  wrappers.push(wrapper)
  await flushPromises()
  expect(wrapper.get('button').text()).toBe('')
  expect(wrapper.get('button').attributes('aria-label')).toBe('Share collection')
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(navigator.share).toHaveBeenCalledOnce()
  expect(wrapper.find('[role="status"]').exists()).toBe(false)
})
it('reports a real share failure and disables sharing when unsupported', async () => {
  vi.mocked(navigator.share).mockRejectedValue(new Error('failure'))
  const wrapper = mount(ShareAchievementsButton, { props: { state: collection() } })
  wrappers.push(wrapper)
  await flushPromises()
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(wrapper.get('[role="status"]').text()).toContain('Unable to share right now.')
  vi.stubGlobal('navigator', {})
  const unsupported = mount(ShareAchievementsButton, { props: { state: collection() } })
  wrappers.push(unsupported)
  expect(unsupported.get('button').attributes('disabled')).toBeDefined()
})
it('refreshes the image and caption after changing app language', async () => {
  const wrapper = mount(ShareAchievementsButton, { props: { state: collection() } })
  wrappers.push(wrapper)
  await flushPromises()
  vi.mocked(renderAchievementImage).mockClear()
  setLanguage('de')
  await flushPromises()
  expect(renderAchievementImage).toHaveBeenCalledOnce()
  await wrapper.get('button').trigger('click')
  await flushPromises()
  expect(navigator.share).toHaveBeenCalledWith(
    expect.objectContaining({ text: expect.stringContaining('Schau, was ich geschafft habe') }),
  )
})
