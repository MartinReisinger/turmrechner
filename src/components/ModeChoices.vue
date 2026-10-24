<script setup lang="ts">
import { difficultyRank, type Difficulty } from '../domain/preferences'
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
defineProps<{ value: Difficulty; minimum?: Difficulty | null }>()
const emit = defineEmits<{ select: [value: Difficulty] }>()
const modes = [
  { value: 'easy', icon: 'zap', hint: 'easyHint' },
  { value: 'normal', icon: 'rows', hint: 'normalHint' },
  { value: 'hard', icon: 'flag', hint: 'hardHint' },
] as const
</script>
<template>
  <div class="mode-options">
    <button
      v-for="mode in modes"
      :key="mode.value"
      class="choice"
      :aria-pressed="value === mode.value"
      :disabled="minimum != null && difficultyRank[mode.value] < difficultyRank[minimum]"
      @click="emit('select', mode.value)"
    >
      <AppIcon :name="mode.icon" /><span class="choice-label">{{ t(mode.value) }}</span>
      <p>{{ t(mode.hint) }}</p>
    </button>
  </div>
</template>
<style scoped>
.mode-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.choice {
  padding: 22px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.choice-label {
  margin-top: 12px;
}
p {
  font-size: 11px;
  margin-top: 6px;
}
</style>
