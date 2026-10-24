<script setup lang="ts">
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
const features = [
  { icon: 'offline', title: 'offlineShort', hint: 'offlineShortHint' },
  { icon: 'privacy', title: 'privateShort', hint: 'privateShortHint' },
  { icon: 'sliders', title: 'cleanShort', hint: 'cleanShortHint' },
] as const
</script>
<template>
  <div class="welcome">
    <div class="welcome-hero">
      <AppIcon name="tower" :size="74" />
      <h1>{{ t('title') }}</h1>
    </div>
    <div class="feature-cards">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <AppIcon :name="feature.icon" :size="24" />
        <div>
          <h2>{{ t(feature.title) }}</h2>
          <p>{{ t(feature.hint) }}</p>
        </div>
        <span class="feature-check"><AppIcon name="check" :size="14" /></span>
      </div>
    </div>
  </div>
</template>
<style scoped>
.welcome {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 44px;
  min-height: 100%;
  padding: 12px 0 24px;
}
.welcome-hero {
  text-align: center;
  display: grid;
  justify-items: center;
  gap: 12px;
}
.welcome-hero svg {
  margin-bottom: 6px;
}
h1 {
  font-size: 25px;
}
.feature-cards {
  display: grid;
  gap: 12px;
}
.feature-card {
  display: grid;
  grid-template-columns: 26px 1fr 20px;
  align-items: center;
  gap: 16px;
  background: var(--key);
  border-radius: 18px;
  padding: 19px 20px;
}
h2 {
  font-size: 16px;
  letter-spacing: 0;
  font-weight: 760;
}
.feature-card p {
  margin-top: 4px;
  font-size: 11px;
}
.feature-check {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--text);
  color: var(--bg);
}
@media (max-height: 700px) {
  .welcome {
    gap: 28px;
  }
  .welcome-hero svg {
    width: 58px;
    height: 58px;
  }
  .feature-card {
    padding: 14px 18px;
  }
}
</style>
