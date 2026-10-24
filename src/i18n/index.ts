import { ref } from 'vue'
import { de, en, type MessageKey } from './messages'
import { detectLanguage, type LanguageMode } from './language'
const activeLanguage = ref(detectLanguage(navigator.languages))
export function setLanguage(mode: LanguageMode): void {
  activeLanguage.value = mode === 'system' ? detectLanguage(navigator.languages) : mode
  document.documentElement.lang = activeLanguage.value
  document.title = t('title')
}
export function t(key: MessageKey): string {
  return (activeLanguage.value === 'de' ? de : en)[key]
}
