import { ref } from 'vue'
import { de, en, type MessageKey } from './messages'
import { detectLanguage, type LanguageMode } from './language'
export const currentLanguage = ref(detectLanguage(navigator.languages))
export function setLanguage(mode: LanguageMode): void {
  currentLanguage.value = mode === 'system' ? detectLanguage(navigator.languages) : mode
  document.documentElement.lang = currentLanguage.value
  document.title = t('title')
}
export function t(key: MessageKey): string {
  return (currentLanguage.value === 'de' ? de : en)[key]
}
