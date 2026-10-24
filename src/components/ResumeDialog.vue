<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { t } from '../i18n'
const emit = defineEmits<{ continue: []; reset: [] }>()
const dialog = ref<HTMLDialogElement>()
onMounted(() => dialog.value?.showModal())
</script>
<template>
  <dialog ref="dialog" aria-labelledby="resume-title" @cancel.prevent>
    <h1 id="resume-title">{{ t('resumeTitle') }}</h1>
    <div class="resume-actions">
      <button class="primary" autofocus @click="emit('continue')">{{ t('continue') }}</button>
      <button class="quiet" @click="emit('reset')">{{ t('startFresh') }}</button>
    </div>
  </dialog>
</template>
<style scoped>
dialog {
  background: var(--bg);
  color: var(--text);
  width: min(340px, calc(100% - 40px));
  border: 1px solid var(--key-down);
  border-radius: 24px;
  padding: 28px 22px 16px;
  text-align: center;
}
dialog::backdrop {
  background: color-mix(in srgb, var(--bg) 45%, transparent);
  backdrop-filter: blur(5px);
}
h1 {
  font-size: 20px;
}
.resume-actions {
  margin-top: 24px;
  display: grid;
  gap: 6px;
}
</style>
