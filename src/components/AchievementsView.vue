<script setup lang="ts">
import { computed } from 'vue'
import { achievements, sortedAchievements, type AchievementState } from '../domain/achievements'
import { t } from '../i18n'
import { formatLocalDate } from '../platform/date-format'
import AppIcon from './AppIcon.vue'
import ShareAchievementsButton from './ShareAchievementsButton.vue'
const props = defineProps<{ state: AchievementState; theme?: string }>()
const count = computed(() => Object.keys(props.state.unlocked).length)
const sorted = computed(() => sortedAchievements(props.state))
</script>
<template>
  <main class="page achievements-page">
    <div class="page-heading">
      <h1>{{ t('yourAchievements') }}</h1>
      <p>
        {{ t('achievementCount').replace('{count}', String(count)).replace('{total}', String(achievements.length)) }}
      </p>
      <ShareAchievementsButton class="collection-share" :state="state" :theme="theme" />
    </div>
    <ol class="achievement-list">
      <li v-for="item in sorted" :key="item.id" :class="{ earned: state.unlocked[item.id] !== undefined }">
        <div class="achievement-symbol"><AppIcon :name="item.icon" :size="26" /></div>
        <div class="achievement-copy">
          <h2>{{ t(item.title) }}</h2>
          <p
            :class="{ 'locked-description': state.unlocked[item.id] === undefined }"
            :aria-hidden="state.unlocked[item.id] === undefined || undefined"
          >
            {{ t(item.description) }}
          </p>
          <div v-if="state.unlocked[item.id] !== undefined" class="achievement-status">
            <AppIcon name="check" :size="14" />
            {{ t('achievementEarned').replace('{date}', formatLocalDate(state.unlocked[item.id] ?? 0)) }}
          </div>
        </div>
      </li>
    </ol>
  </main>
</template>
<style scoped>
.achievements-page {
  padding-bottom: 20px;
  scrollbar-width: none;
}
.achievements-page::-webkit-scrollbar {
  display: none;
}
.page-heading {
  position: relative;
  padding-right: 48px;
}
.collection-share {
  position: absolute;
  top: 0;
  right: 0;
}
.achievement-list {
  display: grid;
  gap: 12px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.achievement-list li {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 18px 14px;
  border-radius: 18px;
  background: var(--key);
}
.achievement-symbol {
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  min-height: 38px;
  color: var(--soft);
}
.earned .achievement-symbol,
.earned .achievement-status {
  color: var(--good);
}
.achievement-copy {
  flex: 1;
  min-width: 0;
}
h2 {
  font-size: 17px;
  overflow-wrap: anywhere;
  margin-bottom: 4px;
}
.achievement-status {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  color: var(--muted);
  font-size: 12px;
  margin-top: 10px;
}
.locked-description {
  filter: blur(5px);
  user-select: none;
  pointer-events: none;
}
</style>
