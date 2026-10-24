import { computed, onScopeDispose, ref, watchEffect, type Ref } from 'vue'
import type { Preferences } from '../domain/preferences'
export function useTheme(preferences: Ref<Preferences>) {
  const media = matchMedia('(prefers-color-scheme: dark)')
  const darkSystem = ref(media.matches)
  const changed = () => {
    darkSystem.value = media.matches
  }
  media.addEventListener('change', changed)
  onScopeDispose(() => media.removeEventListener('change', changed))
  const theme = computed(() => {
    const p = preferences.value
    return (p.theme === 'system' ? darkSystem.value : p.theme === 'dark') ? p.dark : p.light
  })
  watchEffect(() => {
    document.documentElement.dataset.theme = theme.value
    const color = { white: '#fafafa', warm: '#fdf6e3', charcoal: '#090a0c', oled: '#000000' }[theme.value]
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color)
  })
}
