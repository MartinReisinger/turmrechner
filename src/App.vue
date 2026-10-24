<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { defaultPreferences, parsePreferences, type Preferences } from './domain/preferences'
import { clearStorage, readStorage, writeStorage } from './platform/storage'
import { historyKey, useRunHistory } from './composables/useRunHistory'
import RunHistoryView from './components/RunHistoryView.vue'
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
const page = ref<'game' | 'settings' | 'history'>('game')
const {
  acceptPendingExtra,
  game,
  needsResume,
  feedback,
  mistakes,
  storageIssue,
  key,
  recordSettings,
  start: startSession,
  reset,
  correction,
  errors,
  continueRow,
  active,
  refreshClock,
  elapsedMs,
  completedRun,
  markArchived,
  meta,
  canUndo,
  activeMode,
  reviews,
} = useGameSession()
const history = useRunHistory()
const historyId = ref<string | null>(null)
const visible = ref(!document.hidden)
let clockTimer: ReturnType<typeof setInterval> | undefined
const { needRefresh, updateServiceWorker } = useRegisterSW({ immediate: true })
const showResume = computed(() => preferences.value.onboarded && needsResume.value)
const canPlay = computed(
  () => preferences.value.onboarded && page.value === 'game' && !showResume.value && !correction.value,
)
useTheme(preferences)
function change(value: Partial<Preferences>) {
  preferences.value = { ...preferences.value, ...value }
  recordSettingsForRun()
  preferenceStorageIssue.value = !writeStorage(preferencesKey, preferences.value)
}
function recordSettingsForRun() {
  recordSettings(preferences.value)
}
function start() {
  startSession(preferences.value)
}
function openHistory(id: string | null = null) {
  historyId.value = id
  page.value = 'history'
}
function finishOnboarding() {
  if (preferences.value.preview === null) return change({ onboardingStep: 3 })
  if (preferences.value.carries === null) return change({ onboardingStep: 4 })
  change({ onboarded: true })
}
function freshGame() {
  reset()
  page.value = 'game'
}
function clearEverything() {
  const cleared = clearStorage([preferencesKey, sessionKey, historyKey])
  reset(false)
  history.clear()
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
    key(event.key, preferences.value.haptics, preferences.value.carries === true, preferences.value.difficulty)
  } else if (event.key === 'Backspace') {
    event.preventDefault()
    key('back', false, preferences.value.carries === true, preferences.value.difficulty)
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
watch(
  () => [page.value, visible.value, game.value.kind, needsResume.value, correction.value, preferences.value.onboarded],
  () => {
    active(
      page.value === 'game' &&
        visible.value &&
        game.value.kind === 'playing' &&
        !needsResume.value &&
        !correction.value &&
        preferences.value.onboarded,
    )
  },
  { immediate: true },
)
watch(
  completedRun,
  (run) => {
    if (run && !meta.value?.archived && history.add(run)) markArchived()
  },
  { immediate: true },
)
function visibility() {
  visible.value = !document.hidden
}
function leaving() {
  active(false)
}
function returning() {
  visibility()
  active(
    page.value === 'game' && visible.value && game.value.kind === 'playing' && !needsResume.value && !correction.value,
  )
}
onMounted(() => {
  clockTimer = setInterval(refreshClock, 250)
  document.addEventListener('visibilitychange', visibility)
  window.addEventListener('pagehide', leaving)
  window.addEventListener('pageshow', returning)
  window.addEventListener('keydown', keyboard)
  window.addEventListener('languagechange', deviceLanguageChanged)
})
onUnmounted(() => {
  leaving()
  clearInterval(clockTimer)
  document.removeEventListener('visibilitychange', visibility)
  window.removeEventListener('pagehide', leaving)
  window.removeEventListener('pageshow', returning)
  window.removeEventListener('keydown', keyboard)
  window.removeEventListener('languagechange', deviceLanguageChanged)
})
</script>
<template>
  <div class="app" :class="{ 'welcome-app': !preferences.onboarded }" :inert="showResume || undefined">
    <header v-if="preferences.onboarded">
      <div>
        <div class="brand">{{ t(page === 'settings' ? 'settings' : page === 'history' ? 'history' : 'title') }}</div>
        <div class="sub">{{ t(page === 'game' ? 'subtitle' : 'deviceSubtitle') }}</div>
      </div>
      <div class="header-actions">
        <button v-if="page === 'game'" class="icon-button" :aria-label="t('history')" @click="openHistory()">
          <AppIcon name="history" />
        </button>
        <button
          class="icon-button"
          :aria-label="t(page === 'game' ? 'settings' : 'close')"
          @click="page = page === 'game' ? 'settings' : 'game'"
        >
          <AppIcon :name="page === 'game' ? 'settings' : 'close'" />
        </button>
      </div>
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
      :storage-issue="storageIssue || preferenceStorageIssue || history.storageIssue.value"
      @change="change"
      @reset="freshGame"
      @clear="clearEverything"
      @update="updateServiceWorker(true)"
    />
    <RunHistoryView
      v-else-if="page === 'history'"
      :runs="history.runs.value"
      :initial-id="historyId"
      @delete="history.remove"
      @restore="history.add"
    />
    <GameView
      v-if="preferences.onboarded"
      v-show="page === 'game'"
      :game="game"
      :preferences="preferences"
      :feedback="feedback"
      :mistakes="mistakes"
      :elapsed-ms="elapsedMs"
      :correction="correction"
      :errors="errors"
      :run="completedRun"
      :reviews="reviews"
      :paused="needsResume || page !== 'game'"
      :can-undo="canUndo && (activeMode ?? preferences.difficulty) !== 'easy'"
      @continue-row="continueRow"
      @history="openHistory(completedRun?.id ?? null)"
      @key="canPlay && key($event, preferences.haptics, preferences.carries === true, preferences.difficulty)"
      @start="canPlay && start()"
      @reset="freshGame"
    />
  </div>
  <ResumeDialog v-if="showResume" @continue="needsResume = false" @reset="freshGame" />
</template>
