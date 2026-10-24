<script setup lang="ts">
import { computed } from 'vue'
import { achievements, type AchievementId } from '../domain/achievements'
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ ids: AchievementId[]; duringTower: boolean }>()
defineEmits<{ open: [] }>()
const items = computed(() => achievements.filter((item) => props.ids.includes(item.id)))
const label = computed(() =>
  items.value.length === 1
    ? t('achievementUnlocked')
    : t('achievementsUnlocked').replace('{count}', String(items.value.length)),
)
</script>
<template>
  <div class="achievement-announcer sr-only" role="status" aria-live="polite" aria-atomic="true">
    {{ items.length ? `${label}: ${items.map((item) => t(item.title)).join(', ')}` : '' }}
  </div>
  <Transition name="achievement-pop">
    <button
      v-if="items.length"
      :key="ids.join(',')"
      class="achievement-toast"
      :class="{ 'during-tower': duringTower }"
      :aria-label="`${label}. ${items.map((item) => `${t(item.title)}. ${t(item.description)}`).join(' ')}. ${t('achievements')}`"
      @click="$emit('open')"
    >
      <span class="achievement-label">{{ label }}</span>
      <span v-for="item in items" :key="item.id" class="toast-item">
        <AppIcon :name="item.icon" :size="26" />
        <span
          ><strong>{{ t(item.title) }}</strong
          ><span class="toast-description">{{ t(item.description) }}</span></span
        >
      </span>
    </button>
  </Transition>
</template>
<style scoped>
.achievement-toast {
  position: absolute;
  z-index: 10;
  top: calc(env(safe-area-inset-top) + 56px);
  left: 14px;
  right: 14px;
  display: grid;
  gap: 10px;
  padding: 14px 16px;
  border: 1px solid var(--soft);
  border-radius: 18px;
  background: var(--key);
  color: var(--text);
  text-align: left;
}
.achievement-toast.during-tower {
  top: calc(env(safe-area-inset-top) + 88px);
}
.achievement-label {
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--good);
}
.toast-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.toast-item > svg {
  flex: 0 0 auto;
  color: var(--good);
}
.toast-item > span {
  min-width: 0;
}
strong {
  display: block;
  font-size: 16px;
  overflow-wrap: anywhere;
}
.toast-description {
  display: block;
  margin-top: 3px;
  color: var(--soft);
  font-size: 12px;
  line-height: 1.4;
}
.achievement-pop-enter-active,
.achievement-pop-leave-active {
  transition:
    opacity 0.18s,
    transform 0.18s;
}
.achievement-pop-enter-from,
.achievement-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
