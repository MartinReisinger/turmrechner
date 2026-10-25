/** Request a real portrait lock without forcing fullscreen or simulating rotation. */
export async function lockPortrait(): Promise<void> {
  const orientation = screen.orientation
  if (!orientation || !('lock' in orientation) || typeof orientation.lock !== 'function') return
  try {
    await orientation.lock('portrait-primary')
  } catch {
    // Some browsers require fullscreen or reject orientation locking entirely.
  }
}
