<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onboardingOptions, onboardingSteps, type Preferences } from '../domain/preferences'
import { t } from '../i18n'
import WelcomeView from './WelcomeView.vue'
import FeatureComparison from './FeatureComparison.vue'
import ThemeChoices from './ThemeChoices.vue'
import ModeChoices from './ModeChoices.vue'
import TimerChoices from './TimerChoices.vue'
import TapButton from './TapButton.vue'
const props = defineProps<{ preferences: Preferences }>()
const emit = defineEmits<{ change: [value: Partial<Preferences>]; finish: [] }>()
const heading = ref<HTMLElement>()
const step = computed(() => props.preferences.onboardingStep)
const stages = onboardingSteps
const canContinue = computed(() =>
  (step.value === 6 ? ['theme'] : step.value === 7 ? ['light', 'dark'] : [])
    .every((key) => props.preferences.onboardingChoices.some((choice) => choice === key)),
)
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
  const index = Math.max(0, Math.min(stages.length - 1, stages.indexOf(step.value) + direction))
  emit('change', { onboardingStep: stages[index] })
}
function select(feature: 'preview' | 'carries' | 'timer', value: boolean) {
  choose({ [feature]: value }, true)
}
function choose(value: Partial<Preferences>, advance = false) {
  const choices = onboardingOptions.filter((key) => value[key] !== undefined)
  emit('change', {
    ...value,
    onboardingChoices: [...new Set([...props.preferences.onboardingChoices, ...choices])],
  })
  if (advance) {
    if (step.value === 8) emit('finish')
    else move(1)
  }
}
watch(step, async () => {
  await nextTick()
  heading.value?.focus()
})
</script>
<template>
  <main class="page onboarding" :class="{ 'welcome-page': step === 0 }">
    <div v-if="step > 0" class="step-dots" :aria-label="`${stages.indexOf(step) + 1} / ${stages.length}`" role="status">
      <span v-for="(stage, index) in stages" :key="stage" :class="{ filled: index <= stages.indexOf(step) }"></span>
    </div>
    <Transition name="fade" mode="out-in">
      <section :key="step" class="onboarding-content">
        <div v-if="step > 0" class="page-heading">
          <h1 ref="heading" tabindex="-1">{{ t(titles[step]) }}</h1>
        </div>
        <div class="page-body">
          <WelcomeView v-if="step === 0" />
          <ModeChoices
            v-else-if="step === 8"
            :value="preferences.onboardingChoices.includes('difficulty') ? preferences.difficulty : null"
            @select="choose({ difficulty: $event }, true)"
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
                :aria-pressed="preferences.onboardingChoices.includes('haptics') && preferences.haptics === enabled"
                @click="choose({ haptics: enabled }, true)"
              >
                <span class="haptic-wave" :class="{ moving: enabled }" aria-hidden="true">· · ·</span>
                <span class="choice-label">{{ t(enabled ? 'on' : 'off') }}</span>
              </button>
            </div>
            <TapButton class="haptic-test" :label="t('testHaptics')" :haptics="preferences.haptics">
              {{ t('testHaptics') }}
            </TapButton>
          </template>
          <TimerChoices v-else-if="step === 5" :value="preferences.timer" @select="select('timer', $event)" />
          <ThemeChoices
            v-else
            :preferences="preferences"
            :choices="preferences.onboardingChoices"
            :variants="step === 7"
            @change="choose($event)"
          />
        </div>
      </section>
    </Transition>
    <div class="page-actions">
      <button v-if="step === 0 || step === 6 || step === 7" class="primary" :disabled="!canContinue" @click="move(1)">
        {{ t('next') }}
      </button>
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
