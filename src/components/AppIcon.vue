<script setup lang="ts">
import {
  Settings,
  Share,
  Plus,
  Check,
  ChevronLeft,
  Sun,
  Moon,
  Monitor,
  Wifi,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Delete,
  AlignVerticalJustifyEnd,
} from '@lucide/vue'
withDefaults(defineProps<{ name: keyof typeof icons; size?: number }>(), { size: 22 })
const icons = {
  settings: Settings,
  share: Share,
  plus: Plus,
  check: Check,
  back: ChevronLeft,
  sun: Sun,
  moon: Moon,
  system: Monitor,
  offline: Wifi,
  privacy: ShieldCheck,
  sliders: SlidersHorizontal,
  close: X,
  delete: Delete,
  tower: AlignVerticalJustifyEnd,
}
</script>
<template>
  <component :is="icons[name]" :size="size" :stroke-width="2" aria-hidden="true" />
</template>
