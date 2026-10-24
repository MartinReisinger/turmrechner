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
      <span v-if="chosen('theme') && preferences.theme === mode" class="swatch-check" aria-hidden="true">
        <AppIcon name="check" :size="13" />
      </span>
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
          <span v-if="chosen('light') && preferences.light === variant" class="swatch-check" aria-hidden="true">
            <AppIcon name="check" :size="13" />
          </span>
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
          <span v-if="chosen('dark') && preferences.dark === variant" class="swatch-check" aria-hidden="true">
            <AppIcon name="check" :size="13" />
          </span>
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
  position: relative;
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
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--muted);
  transition:
    opacity 0.2s,
    outline-color 0.2s,
    transform 0.2s;
}
.choices:has(.swatch[aria-pressed='true']) .swatch[aria-pressed='false'],
.mode-choices:has(.choice[aria-pressed='true']) .choice[aria-pressed='false'] {
  opacity: 0.5;
}
.swatch-check {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--accent);
  color: var(--on-accent);
}
</style>
