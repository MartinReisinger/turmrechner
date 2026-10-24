export type LanguageMode = 'system' | 'de' | 'en'

export function detectLanguage(languages: readonly string[]): 'de' | 'en' {
  for (const language of languages) {
    const base = language.toLowerCase().split('-')[0]
    if (base === 'de' || base === 'en') return base
  }
  return 'en'
}
