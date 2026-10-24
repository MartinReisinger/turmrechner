<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { defaultPreferences, parsePreferences, type Preferences } from './domain/preferences'
import { clearStorage, readStorage, writeStorage } from './platform/storage'
import { sessionKey, useGameSession } from './composables/useGameSession'
import { useTheme } from './composables/useTheme'
import { setLanguage, t } from './i18n'
import AppIcon from './components/AppIcon.vue'
import OnboardingFlow from './components/OnboardingFlow.vue'
import GameView from './components/GameView.vue'
import SettingsView from './components/SettingsView.vue'
import ResumeDialog from './components/ResumeDialog.vue'

const preferencesKey = 'turmrechner.preferences.v1'
const preferences = ref(parsePreferences(readStorage(preferencesKey)))
const preferenceStorageIssue = ref(false)
const page = ref<'game' | 'settings'>('game')
const { acceptPendingExtra, game, needsResume, feedback, mistakes, storageIssue, key, start, reset } = useGameSession()
const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })
const showResume = computed(() => preferences.value.onboarded && needsResume.value)
const canPlay = computed(() => preferences.value.onboarded && page.value === 'game' && !showResume.value)
useTheme(preferences)
function change(value: Partial<Preferences>) {
  preferences.value = { ...preferences.value, ...value }
  preferenceStorageIssue.value = !writeStorage(preferencesKey, preferences.value)
}
function finishOnboarding() {
  if (preferences.value.preview === null) return change({ onboardingStep: 2 })
  if (preferences.value.carries === null) return change({ onboardingStep: 3 })
  change({ onboarded: true })
}
function freshGame() {
  reset()
  page.value = 'game'
}
function clearEverything() {
  const cleared = clearStorage([preferencesKey, sessionKey])
  reset(false)
  preferences.value = defaultPreferences()
  preferenceStorageIssue.value = !cleared
  page.value = 'game'
}
const deviceLanguageChanged = () => setLanguage(preferences.value.language)
watch(() => preferences.value.language, setLanguage, { immediate: true })
function keyboard(event: KeyboardEvent) {
  if (
    !canPlay.value ||
    event.metaKey ||
    event.ctrlKey ||
    event.altKey ||
    event.repeat ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLButtonElement
  )
    return
  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    key(event.key, preferences.value.haptics, preferences.value.carries === true)
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    key('back', false)
  } else if (event.key === 'Enter' && game.value.kind === 'seed') {
    event.preventDefault()
    start()
  }
}
watch(
  () => [preferences.value.carries, needsResume.value],
  () => {
    if (preferences.value.carries === false) acceptPendingExtra()
  },
  { immediate: true },
)
watch(page, () => {
  feedback.value = null
})
onMounted(() => {
  window.addEventListener('keydown', keyboard)
  window.addEventListener('languagechange', deviceLanguageChanged)
})
onUnmounted(() => {
  window.removeEventListener('keydown', keyboard)
  window.removeEventListener('languagechange', deviceLanguageChanged)
})
</script>
<template>
  <div class="app" :class="{ 'welcome-app': !preferences.onboarded }" :inert="showResume || undefined">
    <header v-if="preferences.onboarded">
      <div>
        <div class="brand">{{ t(page === 'settings' ? 'settings' : 'title') }}</div>
        <div class="sub">{{ t(page === 'settings' ? 'deviceSubtitle' : 'subtitle') }}</div>
      </div>
      <button
        v-if="preferences.onboarded"
        class="icon-button"
        :aria-label="t(page === 'game' ? 'settings' : 'close')"
        @click="page = page === 'game' ? 'settings' : 'game'"
      >
        <AppIcon :name="page === 'game' ? 'settings' : 'close'" />
      </button>
    </header>
    <OnboardingFlow
      v-if="!preferences.onboarded"
      :preferences="preferences"
      @change="change"
      @finish="finishOnboarding"
    />
    <SettingsView
      v-else-if="page === 'settings'"
      :preferences="preferences"
      :update-ready="needRefresh"
      :storage-issue="storageIssue || preferenceStorageIssue"
      @change="change"
      @reset="freshGame"
      @clear="clearEverything"
      @update="updateServiceWorker(true)"
    />
    <GameView
      v-if="preferences.onboarded"
      v-show="page === 'game'"
      :game="game"
      :preferences="preferences"
      :feedback="feedback"
      :mistakes="mistakes"
      @key="canPlay && key($event, preferences.haptics, preferences.carries === true)"
      @start="canPlay && start()"
      @reset="freshGame"
    />
  </div>
  <ResumeDialog v-if="showResume" @continue="needsResume = false" @reset="freshGame" />
</template>
