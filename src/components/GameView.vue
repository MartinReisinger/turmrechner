<script setup lang="ts">
import { computed } from 'vue'
import type { Game } from '../domain/game'
import type { Preferences } from '../domain/preferences'
import type { MessageKey } from '../i18n/messages'
import { t } from '../i18n'
import TowerView from './TowerView.vue'
import KeypadView from './KeypadView.vue'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ game: Game; preferences: Preferences; feedback: MessageKey | null; mistakes: number }>()
const emit = defineEmits<{ key: [value: string]; start: []; reset: [] }>()
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
    <div v-else-if="game.kind === 'playing'" class="game-screen">
      <div>
        <div class="status-row">
          <span class="step">{{ game.task.type === 'mul' ? '×' : '÷' }} {{ game.task.n }}</span>
          <span class="counter" :aria-label="`${t('step')} ${game.step + 1} / 16`">{{ game.step + 1 }} / 16</span>
        </div>
        <div class="progress"><div :style="{ width: `${(game.step / 16) * 100}%` }"></div></div>
      </div>
      <div class="tower-container">
        <TowerView :game="game" :show-carries="preferences.carries === true" :mistakes="mistakes" />
      </div>
      <div>
        <div class="prompt" aria-live="polite">{{ prompt }}</div>
        <div class="sr-only" role="status">{{ feedback ? t(feedback) : '' }}</div>
      </div>
    </div>
    <div v-else class="center-screen">
      <div>
        <div class="done-mark"><AppIcon name="check" :size="28" /></div>
        <h1>{{ t('done') }}</h1>
        <p class="done-text">{{ t('doneHint') }}</p>
        <div class="done-seed">{{ game.seed }}</div>
      </div>
    </div>
    <div class="bottom">
      <button v-if="game.kind === 'seed'" class="primary" :disabled="!game.text" @click="emit('start')">
        {{ t('start') }}
      </button>
      <button v-if="game.kind === 'done'" class="primary" @click="emit('reset')">{{ t('newGame') }}</button>
      <KeypadView :seed-mode="game.kind === 'seed'" :haptics="preferences.haptics" @key="emit('key', $event)" />
    </div>
  </main>
</template>
<style scoped src="../styles/game.css"></style>
