<script setup lang="ts">
import { ref } from 'vue'
const props = withDefaults(defineProps<{ haptics: boolean; label: string; disabled?: boolean }>(), { disabled: false })
const emit = defineEmits<{ tap: [] }>()
const checked = ref(false)
function change() {
  if (!props.disabled) emit('tap')
  requestAnimationFrame(() => {
    checked.value = false
  })
}
</script>
<template>
  <label v-if="haptics && !disabled" class="tap-target">
    <span aria-hidden="true"><slot /></span>
    <input v-model="checked" type="checkbox" switch :aria-label="label" @change="change" />
  </label>
  <button v-else type="button" class="tap-target" :aria-label="label" :disabled="disabled" @click="emit('tap')">
    <slot />
  </button>
</template>
<style scoped>
.tap-target {
  position: relative;
  display: grid;
  place-items: center;
  cursor: pointer;
}
input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
  appearance: auto;
  -webkit-appearance: auto;
}
.tap-target:has(input:focus-visible) {
  outline: 2px solid var(--text);
  outline-offset: 3px;
}
</style>
