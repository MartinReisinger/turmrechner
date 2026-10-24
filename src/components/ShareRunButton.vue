<script setup lang="ts">
import { onScopeDispose, ref, shallowRef, watch } from 'vue'
import type { RunView } from '../domain/run-record'
import { renderRunImage, shareRun } from '../platform/share-run'
import { t } from '../i18n'
import AppIcon from './AppIcon.vue'
const supported = typeof navigator.share === 'function'
const props = defineProps<{ run: RunView }>()
const file = shallowRef<File | null>(null)
const status = ref('')
let generation = 0
watch(
  () => [props.run, document.documentElement.dataset.theme],
  async () => {
    const current = ++generation
    file.value = null
    status.value = ''
    if (typeof navigator.share !== 'function') return
    try {
      const image = await renderRunImage(props.run)
      if (current === generation) file.value = image
    } catch {
      if (current === generation) status.value = t('shareFailed')
    }
  },
  { immediate: true },
)
onScopeDispose(() => generation++)
async function share() {
  if (!file.value) return
  try {
    await shareRun(props.run, file.value)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    status.value = t('shareFailed')
  }
}
</script>
<template>
  <div v-if="supported" class="share-run">
    <button class="share-button" :disabled="!file" @click="share">
      <AppIcon name="share" :size="18" />{{ t('shareRun') }}
    </button>
    <p v-if="status" role="status">{{ status }}</p>
  </div>
</template>
<style scoped>
.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  min-height: 44px;
}
p {
  font-size: 11px;
}
.share-run {
  display: grid;
  justify-items: center;
}
</style>
