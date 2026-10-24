<script setup lang="ts">
import { computed } from 'vue'
import { taskColumns } from '../domain/tower'
import { mentalDemoFrame, type DemoFrame } from '../domain/demo'
const props = defineProps<{ frame: DemoFrame; preview: boolean; carries: boolean; showPreviewRow: boolean }>()
const displayFrame = computed(() => (props.carries ? props.frame : mentalDemoFrame(props.frame)))
const columns = computed(() => taskColumns(displayFrame.value.task))
const prompt = computed(() => {
  if (!props.preview) return ''
  const task = displayFrame.value.task
  return props.preview ? `${task.digits[task.index]} × 2${task.extraIn ? ` + ${task.extraIn}` : ''}` : ''
})
</script>
<template>
  <div class="arithmetic-demo" aria-hidden="true">
    <div class="demo-grid source"><span></span><span>5</span><span>2</span><span>8</span><small>× 2</small></div>
    <div class="demo-grid helpers">
      <span
        v-for="(column, index) in columns"
        :key="index"
        :class="{ 'extra-cursor': carries && column.extraActive && !displayFrame.output }"
      >
        {{ carries ? column.extra : '' }}</span
      ><span></span>
    </div>
    <div class="demo-grid result" :class="{ 'demo-error': displayFrame.error }">
      <span
        v-for="(column, index) in columns"
        :key="index"
        :class="{ cursor: !displayFrame.output && (column.active || (!carries && column.anchor)) }"
      >
        {{ displayFrame.output ? displayFrame.output[index] : column.value }} </span
      ><span></span>
    </div>
    <div v-if="showPreviewRow" class="demo-prompt">{{ prompt }}</div>
  </div>
</template>
<style scoped>
.arithmetic-demo {
  width: 100%;
  max-width: 170px;
  margin: auto;
  font-variant-numeric: tabular-nums;
  font-weight: 720;
}
.demo-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) 30px;
  text-align: center;
}
.source {
  font-size: 22px;
  line-height: 30px;
}
.source small {
  font-size: 12px;
  color: var(--operator);
  align-self: center;
  white-space: nowrap;
}
.helpers {
  height: 17px;
  color: var(--helper);
  font-size: 12px;
  line-height: 16px;
}
.helpers span,
.result span {
  position: relative;
}
.helpers span:not(:last-child) {
  height: 15px;
  top: -8px;
  transform: translateX(calc(-50% + 2px));
}
.result {
  font-size: 28px;
  line-height: 35px;
  height: 38px;
}
.cursor::after,
.extra-cursor::after {
  content: '';
  position: absolute;
  width: 70%;
  height: 3px;
  bottom: 0;
  left: 15%;
  background: var(--cursor);
  border-radius: 3px;
  animation: cursor 1.8s ease-in-out infinite;
}
.extra-cursor::after {
  width: 13px;
  left: calc(50% - 6.5px);
  height: 2px;
}
.demo-prompt {
  font-size: 12px;
  line-height: 18px;
  min-height: 18px;
  color: var(--muted);
  margin-top: 14px;
  font-weight: 500;
}
.demo-error {
  color: var(--bad);
}
.demo-error .cursor::after {
  background: var(--bad);
  opacity: 1;
  animation: none;
}
.demo-error .cursor {
  animation: mistake 0.25s ease;
}
@keyframes cursor {
  0%,
  100% {
    opacity: 0.28;
    transform: scaleX(0.72);
  }
  50% {
    opacity: 1;
    transform: scaleX(1);
  }
}
@keyframes mistake {
  0%,
  100% {
    transform: translateX(0);
  }
  30% {
    transform: translateX(-3px);
  }
  70% {
    transform: translateX(3px);
  }
}
</style>
