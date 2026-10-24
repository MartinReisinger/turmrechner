<script setup lang="ts">
import { computed } from 'vue'
import type { SettingsChange, RunSettings } from '../domain/run-settings'
import { t } from '../i18n'
const props = defineProps<{ changes: SettingsChange[] }>()
const keys = ['difficulty', 'preview', 'carries', 'haptics', 'timer', 'theme', 'light', 'dark', 'language'] as const
const labels = {
  difficulty: 'mode',
  preview: 'preview',
  carries: 'carries',
  haptics: 'haptics',
  timer: 'timer',
  theme: 'appearance',
  light: 'light',
  dark: 'dark',
  language: 'language',
} as const
function text(item: RunSettings[(typeof keys)[number]]) {
  if (typeof item === 'boolean') return t(item ? 'on' : 'off')
  if (item === 'de') return 'Deutsch'
  if (item === 'en') return 'English'
  return t(item)
}
const fields = computed(() =>
  keys.map((key) => ({ key, values: [...new Set(props.changes.map((change) => change.settings[key]))] })),
)
</script>
<template>
  <section class="run-settings">
    <h2>{{ t('settings') }}</h2>
    <div v-for="field in fields" :key="field.key" class="setting-line">
      <span>{{ t(labels[field.key]) }}</span> <span>{{ field.values.map(text).join(', ') }}</span>
    </div>
  </section>
</template>
<style scoped>
h2 {
  font-size: 17px;
  margin-bottom: 16px;
}
.run-settings {
  border-top: 1px solid var(--key-down);
  padding-top: 20px;
}
.setting-line {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  font-size: 12px;
  line-height: 1.8;
}
.setting-line > span:last-child {
  text-align: right;
}
</style>
