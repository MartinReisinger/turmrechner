<script setup lang="ts">
import { t } from '../i18n'
import { useDemoAnimation } from '../composables/useDemoAnimation'
import ArithmeticDemo from './ArithmeticDemo.vue'
defineProps<{ feature: 'preview' | 'carries'; selected: boolean | null }>()
const emit = defineEmits<{ select: [value: boolean] }>()
const frame = useDemoAnimation()
</script>
<template>
  <div class="choices">
    <button
      v-for="enabled in [true, false]"
      :key="String(enabled)"
      class="choice comparison-card"
      :aria-pressed="selected === enabled"
      @click="emit('select', enabled)"
    >
      <ArithmeticDemo
        :frame="frame"
        :show-preview-row="feature === 'preview'"
        :preview="feature === 'preview' && enabled"
        :carries="feature === 'carries' && enabled"
      />
      <span class="choice-label">{{
        t(feature === 'carries' ? (enabled ? 'enter' : 'mental') : enabled ? 'with' : 'without')
      }}</span>
    </button>
  </div>
</template>

<style scoped>
.comparison-card {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: stretch;
}
</style>
