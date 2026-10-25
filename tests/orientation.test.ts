import { afterEach, expect, it, vi } from 'vitest'
import { lockPortrait } from '../src/platform/orientation'

afterEach(() => vi.unstubAllGlobals())

it('requests the native portrait lock with the correct receiver', async () => {
  const orientation = { lock: vi.fn().mockResolvedValue(undefined) }
  vi.stubGlobal('screen', { orientation })
  await lockPortrait()
  expect(orientation.lock).toHaveBeenCalledWith('portrait-primary')
  expect(orientation.lock.mock.contexts).toEqual([orientation])
})

it('handles browsers that reject locking without interrupting play', async () => {
  vi.stubGlobal('screen', { orientation: { lock: vi.fn().mockRejectedValue(new Error('Unsupported')) } })
  await expect(lockPortrait()).resolves.toBeUndefined()
})

it.each([{}, { orientation: {} }])('handles browsers without an orientation lock', async (screen) => {
  vi.stubGlobal('screen', screen)
  await expect(lockPortrait()).resolves.toBeUndefined()
})
