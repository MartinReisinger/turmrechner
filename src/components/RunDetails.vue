<script setup lang="ts">
import { formatLocalDate } from '../platform/date-format'
import { computed } from 'vue'
import type { RunView } from '../domain/run-record'
import { formatDuration } from '../domain/run-record'
import { t } from '../i18n'
import DiffTower from './DiffTower.vue'
import RunSettingsLog from './RunSettingsLog.vue'
import ShareRunButton from './ShareRunButton.vue'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ run: RunView; best?: boolean }>()
const modes = computed(() => [...new Set(props.run.changes.map((change) => change.settings.difficulty))])
const firstError = computed(
  () => props.run.reviews.find((row) => row.entries.some((entry) => entry.grade === 'wrong'))?.step,
)
function focusError() {
  if (firstError.value !== undefined)
    document.getElementById(`review-row-${firstError.value}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
</script>
<template>
  <div class="run-details">
    <div class="run-hero">
      <span class="run-seed">{{ run.seed }}</span
      ><span class="run-time">{{ formatDuration(run.durationMs, true) }}</span>
      <p>{{ formatLocalDate(run.completedAt, true) }}</p>
      <p>{{ modes.map((mode) => t(mode)).join(', ') }}</p>
      <p v-if="best" class="best"><AppIcon name="trophy" :size="16" />{{ t('bestTime') }}</p>
    </div>
    <div class="run-actions">
      <button v-if="firstError !== undefined" class="quiet" @click="focusError">{{ t('firstError') }}</button
      ><span class="share-side"><ShareRunButton :run="run" /></span>
    </div>
    <p class="error-total">{{ run.errors }} {{ t('errors') }}</p>
    <div class="legend">
      <span class="right">{{ t('right') }}</span
      ><span class="consequence">{{ t('consequence') }}</span
      ><span class="wrong">{{ t('wrong') }}</span>
    </div>
    <DiffTower :reviews="run.reviews" /><RunSettingsLog :changes="run.changes" />
  </div>
</template>
<style scoped>
.run-details {
  display: grid;
  gap: 20px;
}
.run-hero {
  display: grid;
  justify-items: center;
  gap: 8px;
  padding: 8px 0 16px;
}
.run-seed {
  font-size: 42px;
  font-weight: 800;
}
.run-time {
  font-size: 25px;
  font-weight: 780;
  font-variant-numeric: tabular-nums;
}
.run-hero p {
  font-size: 11px;
}
.best {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--good);
}
.run-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.share-side {
  margin-left: auto;
}
.error-total {
  text-align: center;
}
.legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 11px;
}
.right {
  color: var(--good);
}
.wrong {
  color: var(--bad);
}
.consequence {
  color: var(--warning);
}
</style>
