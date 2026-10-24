<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import { bestRuns, formatDuration, type RunView } from '../domain/run-record'
import { t } from '../i18n'
import SwipeRunRow from './SwipeRunRow.vue'
import RunDetails from './RunDetails.vue'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ runs: RunView[]; initialId?: string | null }>()
const emit = defineEmits<{ delete: [id: string]; restore: [run: RunView] }>()
const selectedId = ref(props.initialId ?? null)
const selected = computed(() => props.runs.find((run) => run.id === selectedId.value))
const best = computed(() => bestRuns(props.runs))
const bestIds = computed(() => new Set([...best.value.values()].map((run) => run.id)))
const removed = ref<RunView | null>(null)
let undoTimer: ReturnType<typeof setTimeout> | undefined
function remove(run: RunView) {
  selectedId.value = null
  removed.value = run
  emit('delete', run.id)
  clearTimeout(undoTimer)
  undoTimer = setTimeout(() => {
    removed.value = null
  }, 7000)
}
function undo() {
  if (removed.value) emit('restore', removed.value)
  removed.value = null
  clearTimeout(undoTimer)
}
watch(
  () => props.initialId,
  (value) => {
    selectedId.value = value ?? null
  },
)
onScopeDispose(() => clearTimeout(undoTimer))
</script>
<template>
  <main class="page run-history">
    <template v-if="selected"
      ><button class="quiet back-link" @click="selectedId = null">
        <AppIcon name="back" :size="18" />{{ t('back') }}
      </button>
      <RunDetails :run="selected" :best="bestIds.has(selected.id)" />
      <button class="quiet delete-run" @click="remove(selected)">
        <AppIcon name="trash" :size="18" />{{ t('delete') }}
      </button>
    </template>
    <template v-else>
      <div v-if="best.size" class="best-times">
        <div v-for="[mode, run] in best" :key="mode">
          <span
            >{{ t('bestTime') }} ·
            {{ t(mode === 'mixed' ? 'mixed' : mode === 'easy' ? 'easy' : mode === 'normal' ? 'normal' : 'hard') }}</span
          ><strong>{{ formatDuration(run.durationMs, true) }}</strong>
        </div>
      </div>
      <p v-if="!runs.length" class="empty">{{ t('noRuns') }}</p>
      <div class="run-list">
        <SwipeRunRow
          v-for="run in runs"
          :key="run.id"
          :run="run"
          :best="bestIds.has(run.id)"
          @open="selectedId = run.id"
          @delete="remove(run)"
        />
      </div>
    </template>
    <div v-if="removed" class="undo" role="status">
      <span>{{ t('deleted') }} · {{ removed.seed }}</span
      ><button @click="undo">{{ t('undo') }}</button>
    </div>
  </main>
</template>
<style scoped>
.run-history {
  scrollbar-width: none;
  gap: 20px;
}
.run-history::-webkit-scrollbar {
  display: none;
}
.run-list {
  display: grid;
  gap: 10px;
}
.best-times {
  display: grid;
  gap: 8px;
  padding: 4px 0 16px;
}
.best-times > div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.best-times span {
  font-size: 11px;
  color: var(--muted);
}
.best-times strong {
  font-size: 17px;
  font-variant-numeric: tabular-nums;
}
.empty {
  text-align: center;
  margin: auto;
}
.back-link,
.delete-run {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.back-link {
  justify-content: flex-start;
}
.delete-run {
  color: var(--bad);
}
.undo {
  position: sticky;
  bottom: 0;
  padding: 16px;
  border-radius: 14px;
  background: var(--accent);
  color: var(--on-accent);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 13px;
}
.undo button {
  font-weight: 700;
}
</style>
