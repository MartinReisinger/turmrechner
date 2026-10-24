<script setup lang="ts">
import { t } from '../i18n'
import TapButton from './TapButton.vue'
import AppIcon from './AppIcon.vue'
defineProps<{ seedMode: boolean; haptics: boolean; canUndo?: boolean; playing?: boolean; locked?: boolean }>()
const emit = defineEmits<{ key: [key: string] }>()
const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'back', '0', 'random']
function label(key: string) {
  return key === 'back' ? t('delete') : key === 'random' ? t('random') : key
}
</script>
<template>
  <div class="keypad">
    <TapButton
      v-for="key in keys"
      :key="key"
      class="key"
      :class="{ action: key === 'random', back: key === 'back' }"
      :label="label(key)"
      :haptics="haptics"
      :disabled="
        locked || (key === 'back' ? !seedMode && !canUndo : key === 'random' ? !seedMode : !seedMode && !playing)
      "
      @tap="emit('key', key)"
      ><AppIcon
        v-if="key === 'back'"
        name="delete"
        :size="20"
        class="delete-direction"
        :class="{ reversed: !seedMode }"
      />
      <template v-else>{{ label(key) }}</template></TapButton
    >
  </div>
</template>
<style scoped>
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
}
.key {
  height: 48px;
  border-radius: 13px;
  background: var(--key);
  font-size: 22px;
  font-weight: 690;
}
.key:active {
  transform: scale(0.975);
  background: var(--key-down);
}
.key.back {
  font-size: 18px;
  color: var(--soft);
}
.key.action {
  background: var(--accent);
  color: var(--on-accent);
  font-size: 13px;
  font-weight: 820;
}
@media (max-height: 700px) {
  .key {
    height: 43px;
  }
}
</style>

<style scoped>
.delete-direction {
  transition: transform 0.35s ease;
}
.delete-direction.reversed {
  transform: scaleX(-1);
}
</style>
