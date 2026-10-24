<script setup lang="ts">
import { computed } from 'vue'
import { createTask, steps, type Game } from '../domain/game'
import type { Preferences } from '../domain/preferences'
import type { MessageKey } from '../i18n/messages'
import { formatDuration } from '../domain/run-record'
import { t } from '../i18n'
import TowerView from './TowerView.vue'
import KeypadView from './KeypadView.vue'
import AppIcon from './AppIcon.vue'
import RowCheck from './RowCheck.vue'
import ShareRunButton from './ShareRunButton.vue'
import type { Review } from '../domain/review'
import type { RunView } from '../domain/run-record'
const props = defineProps<{
  game: Game
  preferences: Preferences
  feedback: MessageKey | null
  mistakes: number
  elapsedMs?: number | null
  correction?: Review | null
  errors?: number
  run?: RunView | null
  reviews?: Review[]
  paused?: boolean
  canUndo?: boolean
}>()
const emit = defineEmits<{ key: [value: string]; start: []; reset: []; continueRow: []; history: [] }>()
const displayedGame = computed<Game>(() => {
  const review = props.correction,
    game = props.game
  if (!review || game.kind === 'seed') return game
  const op = steps[review.step],
    task = createTask(review.source, op.type, op.n)
  task.index = op.type === 'div' ? task.digits.length - 1 : 0
  return {
    kind: 'playing',
    seed: game.seed,
    current: review.source,
    step: review.step,
    task,
    rows: game.rows.slice(0, -1),
  }
})
const hasMistakes = computed(
  () => (props.errors ?? 0) > 0 || !!props.reviews?.some((row) => row.entered !== row.expected),
)
const pulseStep = computed(() => {
  const row = props.reviews?.at(-1)
  return row?.mode === 'normal' && !props.correction && row.entered === row.expected ? row.step : null
})
const displayStep = computed(() => props.correction?.step ?? (props.game.kind === 'playing' ? props.game.step : 15))
const operation = computed(() => steps[displayStep.value])
const prompt = computed(() => {
  if (props.game.kind !== 'playing') return ''
  const task = props.game.task
  if (task.phase === 'extra') return t(task.type === 'mul' ? 'carry' : 'remainder')
  if (!props.preferences.preview) return ''
  return task.type === 'mul'
    ? `${task.digits[task.index]} × ${task.n}${task.extraIn ? ` + ${task.extraIn}` : ''}`
    : `${task.extraIn || ''}${task.digits[task.index]} ÷ ${task.n}`
})
</script>
<template>
  <main class="game">
    <div v-if="game.kind === 'seed'" class="center-screen">
      <div>
        <div class="seed-label">{{ t('seed') }}</div>
        <div class="seed-value">
          <span class="seed-text" :class="{ empty: !game.text }"
            >{{ game.text }}<span v-if="game.text.length < 6" class="seed-cursor" aria-hidden="true"></span
          ></span>
        </div>
        <p class="seed-hint">{{ t('seedHint') }}</p>
      </div>
    </div>
    <div v-else-if="game.kind === 'playing' || correction" class="game-screen">
      <div>
        <div class="status-row">
          <span class="step">{{ operation.type === 'mul' ? '×' : '÷' }} {{ operation.n }}</span>
          <span v-if="preferences.timer" class="counter" role="timer" :aria-label="t('timer')">{{
            formatDuration(elapsedMs ?? 0)
          }}</span>
        </div>
        <div class="progress"><div :style="{ width: `${(displayStep / 16) * 100}%` }"></div></div>
      </div>
      <div class="tower-container">
        <TowerView
          v-if="displayedGame.kind === 'playing'"
          :game="displayedGame"
          :show-carries="preferences.carries === true"
          :mistakes="mistakes"
          :checking="!!correction"
          :pulse-step="pulseStep"
          :reviews="reviews"
        >
          <template v-if="correction" #result
            ><RowCheck
              :key="correction.step"
              :review="correction"
              :carries="preferences.carries === true"
              :paused="paused"
              @done="emit('continueRow')"
          /></template>
        </TowerView>
      </div>
      <div>
        <div class="prompt" aria-live="polite">{{ correction ? '' : prompt }}</div>
        <div class="sr-only" role="status">{{ feedback ? t(feedback) : '' }}</div>
      </div>
    </div>
    <div v-else class="center-screen">
      <div>
        <div class="done-mark" :class="{ failed: hasMistakes }">
          <AppIcon :name="hasMistakes ? 'close' : 'check'" :size="28" />
        </div>
        <h1>{{ t(hasMistakes ? 'notQuite' : 'done') }}</h1>
        <p v-if="!hasMistakes" class="done-text">
          {{ game.rows.at(-1)?.value === game.seed ? t('doneHint') : t('review') }}
        </p>
        <div class="done-seed">{{ game.seed }}</div>
        <p class="done-time">{{ formatDuration(elapsedMs ?? null, true) }}</p>
        <p>{{ errors ?? 0 }} {{ t('errors') }}</p>
        <div class="done-actions">
          <button class="quiet" @click="emit('history')">{{ t('review') }}</button
          ><ShareRunButton v-if="run" :run="run" />
        </div>
      </div>
    </div>
    <div class="bottom">
      <button v-if="game.kind === 'seed'" class="primary" :disabled="!game.text" @click="emit('start')">
        {{ t('start') }}
      </button>
      <button v-if="game.kind === 'done'" class="primary" @click="emit('reset')">{{ t('newGame') }}</button>
      <KeypadView
        :seed-mode="game.kind === 'seed'"
        :can-undo="canUndo"
        :playing="game.kind === 'playing'"
        :locked="!!correction"
        :haptics="preferences.haptics"
        @key="emit('key', $event)"
      />
    </div>
  </main>
</template>
<style scoped src="../styles/game.css"></style>
