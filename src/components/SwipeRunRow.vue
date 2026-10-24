<script setup lang="ts">
import { formatLocalDate } from '../platform/date-format'
import { ref } from 'vue'
import type { RunView } from '../domain/run-record'
import { formatDuration } from '../domain/run-record'
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
defineProps<{ run: RunView; best: boolean }>()
const emit = defineEmits<{ open: []; delete: [] }>()
const offset = ref(0)
let startX = 0,
  startY = 0,
  base = 0,
  dragged = false
function down(event: PointerEvent) {
  startX = event.clientX
  startY = event.clientY
  base = offset.value
  dragged = false
}
function move(event: PointerEvent) {
  const dx = event.clientX - startX,
    dy = event.clientY - startY
  if (event.buttons === 0 || (!dragged && (Math.abs(dx) < 10 || Math.abs(dy) > Math.abs(dx)))) return
  dragged = true
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture(event.pointerId)
  offset.value = Math.min(0, Math.max(-170, base + dx))
}
function up() {
  if (offset.value <= -130) {
    offset.value = 0
    emit('delete')
  } else offset.value = offset.value < -35 ? -72 : 0
}
function open() {
  if (!dragged && offset.value === 0) emit('open')
  else offset.value = 0
}
</script>
<template>
  <div
    class="swipe-row"
    :class="{ open: offset < 0 }"
    @pointerdown="down"
    @pointermove="move"
    @pointerup="up"
    @pointercancel="offset = 0"
  >
    <button class="swipe-delete" :aria-label="t('delete')" @click="emit('delete')"><AppIcon name="trash" /></button>
    <button class="run-row" :style="{ transform: `translateX(${offset}px)` }" @click="open">
      <span class="run-primary">{{ run.seed }}</span>
      <span class="run-primary run-time"
        >{{ formatDuration(run.durationMs, true) }}<AppIcon v-if="best" name="trophy" :size="16"
      /></span>
      <span class="run-secondary">{{ formatLocalDate(run.completedAt) }}</span>
      <span class="run-secondary run-errors">{{ run.errors }} {{ t('errors') }}</span>
    </button>
  </div>
</template>
<style scoped>
.swipe-row {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: var(--key);
  touch-action: pan-y;
}
.swipe-row.open {
  background: var(--bad);
}
.swipe-delete {
  visibility: hidden;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 72px;
  display: grid;
  place-items: center;
  color: var(--bg);
}
.swipe-row.open .swipe-delete {
  visibility: visible;
}
.run-row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 6px 16px;
  padding: 18px;
  width: 100%;
  background: var(--key);
  text-align: left;
  transition: transform 0.16s;
}
.run-primary {
  font-size: 20px;
  font-weight: 780;
  line-height: 1.25;
  font-variant-numeric: tabular-nums;
}
.run-secondary {
  font-size: 11px;
  font-weight: 400;
  color: var(--muted);
  line-height: 1.4;
}
.run-time {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}
.run-errors {
  text-align: right;
}
</style>
