export function isStandalone(): boolean {
  return (
    matchMedia('(display-mode: standalone)').matches || ('standalone' in navigator && navigator.standalone === true)
  )
}
export function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}
export function errorHaptic(enabled: boolean): void {
  if (enabled && typeof navigator.vibrate === 'function') navigator.vibrate(35)
}
