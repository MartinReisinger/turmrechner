<script setup lang="ts">
import type { LanguageMode } from '../i18n/language'
import type { Preferences } from '../domain/preferences'
import { t } from '../i18n'
import ThemeChoices from './ThemeChoices.vue'
import FeatureComparison from './FeatureComparison.vue'
import TapButton from './TapButton.vue'
defineProps<{ preferences: Preferences; updateReady: boolean; storageIssue: boolean }>()
const languages: LanguageMode[] = ['de', 'en', 'system']
const emit = defineEmits<{ change: [value: Partial<Preferences>]; reset: []; clear: []; update: [] }>()
</script>
<template>
  <main class="page settings">
    <section>
      <h2>{{ t('preview') }}</h2>
      <FeatureComparison
        feature="preview"
        :selected="preferences.preview"
        @select="emit('change', { preview: $event })"
      />
    </section>
    <section>
      <h2>{{ t('carries') }}</h2>
      <FeatureComparison
        feature="carries"
        :selected="preferences.carries"
        @select="emit('change', { carries: $event })"
      />
    </section>
    <section>
      <h2>{{ t('haptics') }}</h2>
      <div class="haptic-setting">
        <button
          v-for="enabled in [true, false]"
          :key="String(enabled)"
          class="choice"
          :aria-pressed="preferences.haptics === enabled"
          @click="emit('change', { haptics: enabled })"
        >
          {{ t(enabled ? 'on' : 'off') }}
        </button>
        <TapButton :label="t('testHaptics')" :haptics="preferences.haptics" class="choice">{{
          t('testHaptics')
        }}</TapButton>
      </div>
    </section>
    <section>
      <h2>{{ t('appearance') }}</h2>
      <ThemeChoices :preferences="preferences" @change="emit('change', $event)" />
      <ThemeChoices :preferences="preferences" variants @change="emit('change', $event)" />
    </section>
    <section>
      <h2>{{ t('language') }}</h2>
      <div class="language-choices">
        <button
          v-for="language in languages"
          :key="language"
          :data-language="language"
          class="choice"
          :aria-pressed="preferences.language === language"
          @click="emit('change', { language })"
        >
          {{ language === 'de' ? 'Deutsch' : language === 'en' ? 'English' : t('system') }}
        </button>
      </div>
    </section>
    <section class="settings-links">
      <button v-if="updateReady" class="quiet" @click="emit('update')">
        {{ t('update') }} · {{ t('applyUpdate') }}
      </button>
      <button class="primary" @click="emit('reset')">{{ t('newGame') }}</button>
      <button class="quiet reset-all" @click="emit('clear')">{{ t('clearAll') }}</button>
      <p v-if="storageIssue" role="status">{{ t('storageIssue') }}</p>
    </section>
  </main>
</template>
<style scoped>
.settings {
  gap: 32px;
  scrollbar-width: none;
}
.settings::-webkit-scrollbar {
  display: none;
}
.language-choices {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  font-size: 13px;
}
.language-choices .choice {
  padding: 16px 8px;
}
.reset-all {
  color: var(--bad);
}
section {
  display: grid;
  gap: 16px;
}
h2 {
  font-size: 17px;
}
.haptic-setting {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: 8px;
  font-size: 13px;
}
.haptic-setting .choice {
  padding: 14px 8px;
}
.settings-links {
  gap: 8px;
}
</style>
