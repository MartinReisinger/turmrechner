<script setup lang="ts">
import type { OnboardingOption, Preferences, ThemeMode } from '../domain/preferences'
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
import ArithmeticDemo from './ArithmeticDemo.vue'
import { demoFrames } from '../domain/demo'
const props = defineProps<{ preferences: Preferences; variants?: boolean; choices?: OnboardingOption[] }>()
const chosen = (key: OnboardingOption) => props.choices === undefined || props.choices.includes(key)
const emit = defineEmits<{ change: [value: Partial<Preferences>] }>()
const modes: ThemeMode[] = ['light', 'dark', 'system']
const samples = demoFrames()
// Keep the leading result digit empty so every theme also previews its cursor.
const sample = samples[samples.length - 2]
</script>
<template>
  <div v-if="!variants" class="mode-choices">
    <button
      v-for="mode in modes"
      :key="mode"
      class="choice"
      :aria-pressed="chosen('theme') && preferences.theme === mode"
      @click="emit('change', { theme: mode })"
    >
      <AppIcon :name="mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'system'" />
      <span class="choice-label">{{ t(mode) }}</span>
    </button>
  </div>
  <div v-else class="variant-groups">
    <div>
      <p class="group-label">{{ t('light') }}</p>
      <div class="choices">
        <button
          v-for="variant in ['white', 'warm'] as const"
          :key="variant"
          class="choice swatch"
          :data-theme="variant"
          :aria-pressed="chosen('light') && preferences.light === variant"
          @click="emit('change', { light: variant })"
        >
          <ArithmeticDemo
            :frame="sample"
            :preview="preferences.preview === true"
            :carries="preferences.carries === true"
            :show-preview-row="preferences.preview === true"
          />
          <span class="choice-label">{{ t(variant) }}</span>
        </button>
      </div>
    </div>
    <div>
      <p class="group-label">{{ t('dark') }}</p>
      <div class="choices">
        <button
          v-for="variant in ['oled', 'monokai'] as const"
          :key="variant"
          class="choice swatch"
          :data-theme="variant"
          :aria-pressed="chosen('dark') && preferences.dark === variant"
          @click="emit('change', { dark: variant })"
        >
          <ArithmeticDemo
            :frame="sample"
            :preview="preferences.preview === true"
            :carries="preferences.carries === true"
            :show-preview-row="preferences.preview === true"
          />
          <span class="choice-label">{{ t(variant) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped>
.mode-choices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.mode-choices .choice {
  padding: 22px 8px;
}
.variant-groups {
  display: grid;
  gap: 24px;
}
.group-label {
  margin-bottom: 10px;
  font-size: 12px;
}
.swatch {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--muted);
}
</style>
