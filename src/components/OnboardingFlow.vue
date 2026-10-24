<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { Preferences } from '../domain/preferences'
import { t } from '../i18n'
import { isIOS, isStandalone } from '../platform/device'
import WelcomeView from './WelcomeView.vue'
import InstallGuide from './InstallGuide.vue'
import FeatureComparison from './FeatureComparison.vue'
import ThemeChoices from './ThemeChoices.vue'
import ModeChoices from './ModeChoices.vue'
import TimerChoices from './TimerChoices.vue'
import TapButton from './TapButton.vue'
const props = defineProps<{ preferences: Preferences }>()
const emit = defineEmits<{ change: [value: Partial<Preferences>]; finish: [] }>()
const heading = ref<HTMLElement>()
const canInstall = isIOS() && !isStandalone()
const step = computed(() =>
  props.preferences.onboardingStep === 1 && !canInstall ? 2 : props.preferences.onboardingStep,
)
const stages = canInstall ? [0, 1, 2, 3, 4, 5, 6, 7, 8] : [0, 2, 3, 4, 5, 6, 7, 8]
const titles = [
  'welcome',
  'install',
  'previewTitle',
  'carryTitle',
  'hapticsTitle',
  'timerTitle',
  'themeTitle',
  'variantsTitle',
  'modeTitle',
] as const
function move(direction: number) {
  let target = step.value + direction
  if (target === 1 && !canInstall) target += direction
  emit('change', { onboardingStep: Math.max(0, Math.min(8, target)) })
}
function select(feature: 'preview' | 'carries', value: boolean) {
  emit('change', { [feature]: value })
  move(1)
}
watch(step, async () => {
  await nextTick()
  heading.value?.focus()
})
</script>
<template>
  <main class="page onboarding" :class="{ 'welcome-page': step === 0 }">
    <div v-if="step > 0" class="step-dots" :aria-label="`${stages.indexOf(step) + 1} / ${stages.length}`" role="status">
      <span v-for="stage in stages" :key="stage" :class="{ filled: stage <= step }"></span>
    </div>
    <Transition name="fade" mode="out-in">
      <section :key="step" class="onboarding-content">
        <div v-if="step > 0" class="page-heading">
          <h1 ref="heading" tabindex="-1">{{ t(titles[step]) }}</h1>
        </div>
        <div class="page-body">
          <WelcomeView v-if="step === 0" />
          <template v-else-if="step === 1"><InstallGuide /></template>
          <ModeChoices
            v-else-if="step === 8"
            :value="preferences.difficulty"
            @select="emit('change', { difficulty: $event })"
          />
          <FeatureComparison
            v-else-if="step === 2"
            feature="preview"
            :selected="preferences.preview"
            @select="select('preview', $event)"
          />
          <FeatureComparison
            v-else-if="step === 3"
            feature="carries"
            :selected="preferences.carries"
            @select="select('carries', $event)"
          />
          <template v-else-if="step === 4">
            <div class="choices">
              <button
                v-for="enabled in [true, false]"
                :key="String(enabled)"
                class="choice"
                :aria-pressed="preferences.haptics === enabled"
                @click="emit('change', { haptics: enabled })"
              >
                <span class="haptic-wave" :class="{ moving: enabled }" aria-hidden="true">· · ·</span>
                <span class="choice-label">{{ t(enabled ? 'on' : 'off') }}</span>
              </button>
            </div>
            <TapButton class="haptic-test" :label="t('testHaptics')" :haptics="preferences.haptics">
              {{ t('testHaptics') }}
            </TapButton>
          </template>
          <TimerChoices v-else-if="step === 5" :value="preferences.timer" @select="emit('change', { timer: $event })" />
          <ThemeChoices v-else :preferences="preferences" :variants="step === 7" @change="emit('change', $event)" />
        </div>
      </section>
    </Transition>
    <div class="page-actions">
      <button v-if="step !== 2 && step !== 3" class="primary" @click="step === 8 ? emit('finish') : move(1)">
        {{ t(step === 8 ? 'finish' : 'next') }}
      </button>
      <button v-if="step === 1" class="quiet" @click="move(1)">{{ t('noThanks') }}</button>
      <button v-if="step > 0" class="quiet" @click="move(-1)">{{ t('back') }}</button>
    </div>
  </main>
</template>
<style scoped>
.onboarding {
  padding-top: 20px;
}
.welcome-page {
  padding-top: 0;
}
.welcome-page .page-body {
  display: block;
}
.onboarding-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}
.onboarding-content .page-heading {
  min-height: 60px;
}
.step-dots {
  display: flex;
  gap: 5px;
}
.step-dots span {
  flex: 1;
  height: 3px;
  border-radius: 3px;
  background: var(--key-down);
}
.step-dots .filled {
  background: var(--text);
}
.haptic-test {
  min-height: 48px;
  border-radius: 14px;
  background: var(--key);
  font-size: 13px;
}
.haptic-wave {
  font-size: 28px;
  display: inline-block;
  letter-spacing: 4px;
}
.moving {
  animation: wave 1.8s infinite;
}
@keyframes wave {
  0%,
  30%,
  60%,
  100% {
    transform: translateX(0);
  }
  35%,
  45%,
  55% {
    transform: translateX(3px);
  }
  40%,
  50% {
    transform: translateX(-3px);
  }
}
</style>
