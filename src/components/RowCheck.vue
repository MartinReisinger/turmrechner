<script setup lang="ts">
import { computed, nextTick, onScopeDispose, ref, watch } from 'vue'
import { reviewCells, type Review } from '../domain/review'
import { steps } from '../domain/game'
const props = defineProps<{ review: Review; carries: boolean; paused?: boolean }>()
const canvas = ref<HTMLElement>()
const emit = defineEmits<{ done: [] }>()
const cells = computed(() => {
  const values = reviewCells(props.review)
  const width = props.review.source.length + (steps[props.review.step].type === 'mul' ? 1 : 0)
  return Array.from({ length: width }, (_, index) => {
    const place = width - index - 1
    return (
      values.find((cell) => cell.place === place) ?? {
        place,
        value: '',
        grade: 'right',
        attempts: [],
        helper: null,
        helperAttempts: [],
      }
    )
  })
})
const checked = ref(-1),
  swapped = ref(-1)
const activeError = ref<number | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined
let closed = false
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
function rank(index: number) {
  return steps[props.review.step].type === 'div' ? index : cells.value.length - index - 1
}
function target(place: number) {
  return props.review.expected.at(-place - 1) ?? ''
}
function changed(index: number) {
  return cells.value[index].value !== target(cells.value[index].place)
}
function bad(index: number) {
  const cell = cells.value[index]
  return (cell.value || '0') !== (target(cell.place) || '0') || cell.helper?.grade === 'wrong'
}
async function keepActiveVisible() {
  await nextTick()
  const viewport = canvas.value?.closest<HTMLElement>('.number-scroller')
  const cell = canvas.value?.querySelector<HTMLElement>('[data-check-active="true"]')
  if (!viewport || !cell) return
  const bounds = viewport.getBoundingClientRect(),
    box = cell.getBoundingClientRect()
  if (box.left < bounds.left + 24 || box.right > bounds.right - 24) {
    viewport.scrollTo({
      left: Math.max(0, viewport.scrollLeft + box.left + box.width / 2 - bounds.left - bounds.width / 2),
      behavior: 'instant',
    })
  }
}
function schedule(index: number) {
  if (closed) return
  if (index >= cells.value.length) {
    timer = setTimeout(() => emit('done'), reduced ? 0 : 240)
    return
  }
  const visualIndex = steps[props.review.step].type === 'div' ? index : cells.value.length - index - 1
  const cell = cells.value[visualIndex]
  if (!cell.value && !target(cell.place) && !cell.helper) {
    schedule(index + 1)
    return
  }
  checked.value = index
  void keepActiveVisible()
  if (!bad(visualIndex)) {
    timer = setTimeout(() => schedule(index + 1), reduced ? 0 : 45)
    return
  }
  activeError.value = visualIndex
  timer = setTimeout(
    () => {
      swapped.value = index
      timer = setTimeout(
        () => {
          activeError.value = null
          schedule(index + 1)
        },
        reduced ? 0 : 600,
      )
    },
    reduced ? 0 : 240,
  )
}

watch(
  () => props.paused,
  (paused) => {
    clearTimeout(timer)
    if (!paused) {
      checked.value = -1
      swapped.value = -1
      activeError.value = null
      timer = setTimeout(() => schedule(0), reduced ? 0 : 160)
    }
  },
  { immediate: true },
)
onScopeDispose(() => {
  closed = true
  clearTimeout(timer)
})
</script>
<template>
  <div ref="canvas" class="check-digits">
    <div
      v-for="(cell, index) in cells"
      :key="cell.place"
      class="check-cell"
      :data-anchor="cell.place === 0"
      :data-check-active="checked === rank(index)"
      :class="{
        right: checked >= rank(index) && !bad(index),
        wrong: activeError === index && swapped < rank(index),
        fixed: swapped >= rank(index),
      }"
    >
      <span v-if="carries && cell.helper" class="check-helper">{{
        swapped >= rank(index) ? cell.helper.expected : cell.helper.value
      }}</span>
      <div class="number-window">
        <div class="number-wheel" :class="{ roll: changed(index) && swapped >= rank(index) }">
          <span>{{ cell.value }}</span
          ><span>{{ target(cell.place) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.check-digits {
  display: flex;
}
.check-cell {
  position: relative;
  width: 37px;
  flex: 0 0 37px;
  font-size: 29px;
  font-weight: 720;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.number-window {
  height: 45px;
  overflow: hidden;
}
.number-wheel {
  display: grid;
  grid-template-rows: 45px 45px;
  transition: transform 0.55s cubic-bezier(0.2, 0.75, 0.2, 1);
}
.number-wheel > span {
  display: grid;
  align-items: end;
  line-height: 33px;
}
.number-wheel.roll {
  transform: translateY(-45px);
}
.check-helper {
  position: absolute;
  top: -14px;
  left: -7px;
  font-size: 12px;
}
.right,
.fixed {
  color: var(--good);
}
.wrong:not(.fixed) {
  color: var(--bad);
}
@media (max-width: 390px) {
  .check-cell {
    width: 33px;
    flex-basis: 33px;
    font-size: 25px;
  }
}
</style>
