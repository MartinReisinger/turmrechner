import { expect, it } from 'vitest'
import { createRunClock } from '../src/composables/run-clock'
import { defaultPreferences } from '../src/domain/preferences'
import { snapshotSettings } from '../src/domain/run-settings'
import { formatLocalDate } from '../src/platform/date-format'
it('counts active time only, freezes completion, and restores a paused clock', () => {
  let tick = 0,
    wall = 1000
  const clock = createRunClock(
    null,
    () => tick,
    () => wall,
  )
  clock.begin(snapshotSettings(defaultPreferences()))
  tick = 1250
  clock.refresh()
  expect(clock.elapsedMs.value).toBe(1250)
  clock.active(false)
  tick = 10000
  clock.refresh()
  expect(clock.elapsedMs.value).toBe(1250)
  clock.active(true)
  tick = 11500
  wall = 20000
  clock.finish()
  expect(clock.elapsedMs.value).toBe(2750)
  tick = 20000
  clock.refresh()
  expect(clock.elapsedMs.value).toBe(2750)
  const reopened = createRunClock(
    clock.meta.value,
    () => tick,
    () => wall,
  )
  tick = 30000
  reopened.refresh()
  expect(reopened.elapsedMs.value).toBe(2750)
})
it('uses Austrian regional formatting with 24-hour time even in an English environment', () => {
  expect(
    formatLocalDate(Date.parse('2026-10-24T08:53:33Z'), true, { locale: 'en-US', timeZone: 'Europe/Vienna' }),
  ).toBe('24.10.2026 · 10:53:33')
})
