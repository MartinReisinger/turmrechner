<script setup lang="ts">
import { computed } from 'vue'
import { steps } from '../domain/game'
import { reviewCells, type Review } from '../domain/review'
import { t } from '../i18n'
const props = defineProps<{ reviews: Review[] }>()
const rows = computed(() => props.reviews.map((review) => ({ review, cells: reviewCells(review) })))
</script>
<template>
  <div class="diff-tower">
    <div v-if="rows.length" class="diff-start">{{ rows[0].review.source }}<span>× 2</span></div>
    <div
      v-for="{ review, cells } in rows"
      :id="`review-row-${review.step}`"
      :key="review.step"
      class="diff-step"
      :class="{
        'has-helpers': cells.some((cell) => cell.helper),
        'has-attempts': cells.some((cell) => cell.attempts.length || cell.helperAttempts.length),
      }"
    >
      <div class="diff-line">
        <div class="diff-digits">
          <div v-for="cell in cells" :key="cell.place" class="diff-cell">
            <span
              v-if="cell.helper"
              class="diff-helper"
              :class="cell.helper.grade"
              :title="`${t('corrected')}: ${cell.helper.expected}`"
              >{{ cell.helper.value }}</span
            >
            <span v-if="cell.attempts.length || cell.helperAttempts.length" class="diff-attempt wrong">
              {{ [...cell.attempts, ...cell.helperAttempts].join('·') }}</span
            >
            <span :class="cell.grade" :aria-label="`${cell.value}, ${t(cell.grade)}`">{{ cell.value }}</span>
          </div>
        </div>
        <span class="diff-op">{{
          review.step < 15 ? `${steps[review.step + 1].type === 'mul' ? '×' : '÷'} ${steps[review.step + 1].n}` : ''
        }}</span>
      </div>
      <div v-if="review.mode === 'normal' && review.entered !== review.expected" class="correction-value right">
        → {{ review.expected }}
      </div>
    </div>
  </div>
</template>
<style scoped>
.diff-tower {
  display: grid;
  gap: 12px;
  font-variant-numeric: tabular-nums;
  padding: 8px 2px;
  overflow-x: auto;
  scrollbar-width: none;
}
.diff-tower::-webkit-scrollbar {
  display: none;
}
.diff-start {
  text-align: right;
  font-size: 22px;
  font-weight: 720;
  white-space: nowrap;
}
.diff-start > span,
.diff-op {
  display: inline-block;
  min-width: 50px;
  text-align: right;
  font-size: 17px;
  color: var(--operator);
}
.diff-line {
  display: flex;
  justify-content: flex-end;
  align-items: baseline;
  min-width: max-content;
}
.diff-digits {
  display: flex;
  padding-top: 0;
}
.has-helpers .diff-digits {
  padding-top: 13px;
}
.has-attempts {
  padding-bottom: 12px;
}
.diff-cell {
  position: relative;
  min-width: 0.72em;
  text-align: center;
  font-size: 22px;
  font-weight: 720;
}
.diff-helper {
  position: absolute;
  top: -14px;
  left: -5px;
  font-size: 11px;
  font-weight: 600;
}
.diff-attempt {
  position: absolute;
  bottom: -12px;
  left: 0;
  font-size: 10px;
  white-space: nowrap;
  text-decoration: line-through;
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
.correction-value {
  text-align: right;
  font-size: 12px;
  margin-right: 50px;
  margin-top: 7px;
}
.diff-step {
  scroll-margin-top: 20px;
}
</style>
