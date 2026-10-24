// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import DiffTower from '../src/components/DiffTower.vue'
import { renderRunImage } from '../src/platform/share-run'
import type { RunView } from '../src/domain/run-record'
import type { Review } from '../src/domain/review'
import { setLanguage } from '../src/i18n'

const reviews: Review[] = [
  { step: 0, mode: 'normal', source: '5863', entered: '25432', expected: '11726', reference: '11726', entries: [] },
  { step: 1, mode: 'normal', source: '11726', entered: '35178', expected: '35178', reference: '35178', entries: [] },
]
const run: RunView = {
  id: 'review',
  seed: '5863',
  startedAt: 100,
  completedAt: 200,
  durationMs: 100,
  events: [],
  changes: [],
  reviews,
  errors: 5,
  clean: false,
}
const originalContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext')
const originalBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob')
afterEach(() => {
  if (originalContext) Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalContext)
  if (originalBlob) Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', originalBlob)
  vi.restoreAllMocks()
})
it('shows only the seed and one entered result per operation, without correction rows', () => {
  setLanguage('en')
  const wrapper = mount(DiffTower, { props: { reviews } })
  expect(wrapper.findAll('.diff-step')).toHaveLength(2)
  expect(wrapper.findAll('.diff-digits').map((row) => row.text())).toEqual(['25432', '35178'])
  expect(wrapper.text()).not.toContain('→')
  expect(wrapper.text()).not.toContain('11726')
  expect(wrapper.findAll('.diff-op').map((op) => op.text())).toEqual(['× 3', '× 4'])
  wrapper.unmount()
})
it('keeps carries in the result row without adding intermediate correction lines', () => {
  const review: Review = {
    ...reviews[0],
    entries: [
      {
        value: 2,
        expected: 0,
        reference: 0,
        phase: 'extra',
        place: 0,
        accepted: true,
        grade: 'wrong',
      },
    ],
  }
  const wrapper = mount(DiffTower, { props: { reviews: [review] } })
  expect(wrapper.findAll('.diff-step')).toHaveLength(1)
  expect(wrapper.get('.diff-step').classes()).toContain('has-helpers')
  expect(wrapper.get('.diff-helper').text()).toBe('2')
  expect(wrapper.find('.correction-value').exists()).toBe(false)
  wrapper.unmount()
})
it.each([false, true])('exports compact result rows without correction annotations (helpers: %s)', async (helpers) => {
  setLanguage('en')
  const fillText = vi.fn<(text: string, x: number, y: number) => void>()
  const context = { fillRect: vi.fn(), fillText }
  const canvases: HTMLCanvasElement[] = []
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value(this: HTMLCanvasElement) {
      canvases.push(this)
      return context
    },
  })
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    configurable: true,
    value(callback: BlobCallback) {
      callback(new Blob(['png'], { type: 'image/png' }))
    },
  })
  const rows = reviews.map((row) => ({
    ...row,
    entries: helpers
      ? [
          {
            value: 2,
            expected: 0,
            reference: 0,
            phase: 'extra',
            place: 0,
            accepted: true,
            grade: 'wrong',
          } satisfies Review['entries'][number],
        ]
      : [],
  }))
  const file = await renderRunImage({ ...run, reviews: rows })
  expect(file.type).toBe('image/png')
  const drawnText = fillText.mock.calls.map(([text]) => text)
  expect(drawnText.some((text) => text.startsWith('→'))).toBe(false)
  expect(drawnText).not.toContain('11726')
  expect(drawnText).toContain('× 3')
  expect(drawnText).toContain('× 4')
  expect(canvases[0]?.height).toBeLessThan(450 + reviews.length * 100)
  const baselines = fillText.mock.calls.filter(([text]) => text === '× 2' || text === '× 3').map(([, , y]) => y)
  expect(baselines[1] - baselines[0]).toBeLessThan(100)
})
