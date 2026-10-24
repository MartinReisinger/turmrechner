<script setup lang="ts">
import { t } from '../i18n'
defineProps<{ value: boolean }>()
const emit = defineEmits<{ select: [value: boolean] }>()
</script>
<template>
  <div class="choices">
    <button
      v-for="enabled in [true, false]"
      :key="String(enabled)"
      class="choice"
      :aria-pressed="value === enabled"
      @click="emit('select', enabled)"
    >
      <div class="timer-sample" aria-hidden="true">
        <span>× 2</span><span class="time">{{ enabled ? '0:12' : '' }}</span>
      </div>
      <div class="sample-progress" aria-hidden="true"><span></span></div>
      <span class="choice-label">{{ t(enabled ? 'show' : 'hide') }}</span>
    </button>
  </div>
</template>
<style scoped>
.timer-sample {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 17px;
  font-weight: 780;
}
.time {
  min-width: 3ch;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
  align-self: center;
}
.sample-progress {
  height: 3px;
  background: var(--key-down);
  border-radius: 4px;
  margin: 10px 0 24px;
  overflow: hidden;
}
.sample-progress span {
  display: block;
  width: 25%;
  height: 100%;
  background: var(--text);
}
</style>
