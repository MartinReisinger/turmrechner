<script setup lang="ts">
import { computed, onScopeDispose, ref, watch } from 'vue'
import type { Game } from '../domain/game'
import { completedRowColumns, taskColumns } from '../domain/tower'
import type { Review } from '../domain/review'
import { useTowerScroll } from '../composables/useTowerScroll'
const props = defineProps<{
  game: Extract<Game, { kind: 'playing' }>
  showCarries: boolean
  mistakes: number
  checking?: boolean
  pulseStep?: number | null
  reviews?: Review[]
}>()
const scroller = ref<HTMLElement>()
const invalid = ref(false)
let errorTimer: ReturnType<typeof setTimeout> | undefined
onScopeDispose(() => clearTimeout(errorTimer))
const hasScrolled = useTowerScroll(
  scroller,
  () => props.game,
  () => !props.checking,
)
const rows = computed(() => {
  const visible = props.game.rows.slice(-4)
  const start = props.game.rows.length - visible.length
  return visible.map((row, index) => ({
    ...row,
    columns: completedRowColumns(row.value, props.reviews?.find((review) => review.step === start + index - 1)),
  }))
})
const pulsing = ref(false)
let pulseTimer: ReturnType<typeof setTimeout> | undefined
onScopeDispose(() => clearTimeout(pulseTimer))
watch(
  () => props.pulseStep,
  (value) => {
    if (value === null || value === undefined) return
    clearTimeout(pulseTimer)
    pulsing.value = true
    pulseTimer = setTimeout(() => {
      pulsing.value = false
    }, 950)
  },
)
const columns = computed(() => taskColumns(props.game.task))
watch(
  () => props.game,
  () => {
    clearTimeout(errorTimer)
    invalid.value = false
  },
)
watch(
  () => props.mistakes,
  () => {
    clearTimeout(errorTimer)
    invalid.value = true
    errorTimer = setTimeout(() => {
      invalid.value = false
    }, 650)
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const active = scroller.value?.querySelector<HTMLElement>('.extra-active, .result-cell.active')
    active?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 220 },
    )
  },
)
</script>
<template>
  <div class="tower-viewport" :class="{ 'input-error': invalid }">
    <div
      ref="scroller"
      class="number-scroller"
      :class="{ 'has-scrolled': hasScrolled, division: game.task.type === 'div' }"
    >
      <div class="number-canvas">
        <div
          v-for="(row, i) in rows"
          :key="game.step - rows.length + i"
          class="tower-row"
          :class="{ muted: i < rows.length - 1, 'verified-row': pulsing && i === rows.length - 1 }"
        >
          <span v-for="(column, index) in row.columns" :key="index" class="digit-col">
            <span v-if="showCarries && column.extra" class="carry">{{ column.extra }}</span>
            <span>{{ column.value }}</span>
          </span>
        </div>
        <div class="tower-row result-row">
          <slot name="result">
            <div
              v-for="(column, index) in columns"
              :key="index"
              class="result-cell"
              :data-anchor="column.anchor"
              :class="{ active: column.active || (!showCarries && column.anchor) }"
            >
              <span
                v-if="showCarries && (column.extra || column.extraActive)"
                class="carry"
                :class="{ 'extra-active': column.extraActive }"
                >{{ column.extra }}</span
              >
              <span>{{ column.value }}</span>
            </div>
          </slot>
        </div>
      </div>
    </div>
    <div class="ops-rail" aria-hidden="true">
      <div v-for="(row, i) in rows" :key="i" class="op-cell" :class="{ muted: i < rows.length - 1 }">
        {{ row.type === 'mul' ? '×' : '÷' }} {{ row.n }}
      </div>
      <div class="result-op"></div>
    </div>
  </div>
</template>
<style scoped src="../styles/tower.css"></style>
