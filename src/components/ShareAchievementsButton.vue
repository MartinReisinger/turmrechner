<script setup lang="ts">
import { onScopeDispose, ref, shallowRef, watch } from 'vue'
import { renderAchievementImage, shareAchievements } from '../platform/share-achievements'
import type { AchievementState } from '../domain/achievements'
import { currentLanguage, t } from '../i18n'
import AppIcon from './AppIcon.vue'
const props = defineProps<{ state: AchievementState; theme?: string }>()
const supported = typeof navigator.share === 'function'
const file = shallowRef<File | null>(null)
const status = ref(false)
let generation = 0
watch(
  () => [props.state, props.theme, currentLanguage.value],
  async () => {
    const current = ++generation
    file.value = null
    status.value = false
    if (!supported) return
    try {
      const image = await renderAchievementImage(props.state)
      if (current === generation) file.value = image
    } catch {
      if (current === generation) status.value = true
    }
  },
  { immediate: true },
)
onScopeDispose(() => generation++)
async function share() {
  if (!file.value) return
  try {
    await shareAchievements(props.state, file.value)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    status.value = true
  }
}
</script>
<template>
  <div class="share-achievement">
    <button
      :disabled="!file"
      :title="supported ? t('shareCollection') : t('shareUnavailable')"
      :aria-label="t('shareCollection')"
      @click="share"
    >
      <AppIcon name="share" :size="18" />
    </button>
    <p v-if="status" role="status">{{ t('shareFailed') }}</p>
  </div>
</template>
<style scoped>
.share-achievement {
  flex: 0 0 44px;
}
button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-height: 44px;
  padding: 0;
  font-size: 13px;
}
p {
  font-size: 11px;
}
</style>
