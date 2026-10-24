<script setup lang="ts">
import AppIcon from './AppIcon.vue'
import { t } from '../i18n'
</script>
<template>
  <div class="install-demo" aria-hidden="true">
    <div class="mock-browser">
      <div class="mock-content"><img src="/favicon.svg" alt="" width="58" height="58" /></div>
      <div class="mock-toolbar"><span>turmrechner.martindev.at</span><AppIcon name="share" /></div>
      <div class="mock-sheet">
        <div class="sheet-handle"></div>
        <div class="mock-row">
          <AppIcon name="plus" /> <span>{{ t('addHome') }}</span>
        </div>
        <div class="mock-add">{{ t('add') }}</div>
      </div>
      <span class="tap-dot"></span>
    </div>
  </div>
  <ol class="install-steps">
    <li>
      <AppIcon name="share" />
      <div>
        {{ t('share') }}
        <p>{{ t('shareHint') }}</p>
      </div>
    </li>
    <li>
      <AppIcon name="plus" />
      <div>
        {{ t('addHome') }}
        <p>{{ t('addHomeHint') }}</p>
      </div>
    </li>
    <li>
      <AppIcon name="check" />
      <div>
        {{ t('add') }}
        <p>{{ t('addHint') }}</p>
      </div>
    </li>
  </ol>
</template>
<style scoped>
.install-demo {
  display: grid;
  place-items: center;
}
.mock-browser {
  width: 210px;
  height: 230px;
  background: var(--key);
  border: 1px solid var(--muted);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
}
.mock-content {
  display: grid;
  place-items: center;
  height: 175px;
}
.mock-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  color: var(--text);
  background: var(--key-down);
  font-size: 11px;
}
.mock-sheet {
  position: absolute;
  inset: 55px 0 0;
  background: var(--key-down);
  border-radius: 18px 18px 0 0;
  padding: 10px;
  animation: sheet 6s infinite;
}
.sheet-handle {
  width: 30px;
  height: 4px;
  border-radius: 4px;
  background: var(--muted);
  margin: 0 auto 28px;
}
.mock-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 4px;
  font-size: 11px;
  background: var(--key);
  border-radius: 10px;
}
.mock-add {
  margin-top: 18px;
  text-align: right;
  font-size: 13px;
  font-weight: 700;
}
.tap-dot {
  position: absolute;
  width: 28px;
  height: 28px;
  border: 2px solid var(--text);
  border-radius: 50%;
  animation: tap 6s infinite;
  pointer-events: none;
}
.install-steps {
  padding: 0;
  margin: 0;
  list-style: none;
  display: grid;
  gap: 16px;
}
li {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  font-size: 13px;
}
li p {
  font-size: 11px;
  margin-top: 3px;
}
@keyframes sheet {
  0%,
  20%,
  95%,
  100% {
    transform: translateY(110%);
  }
  35%,
  85% {
    transform: translateY(0);
  }
}
@keyframes tap {
  0%,
  10% {
    opacity: 0;
    transform: translate(172px, 188px) scale(1.4);
  }
  18%,
  24% {
    opacity: 0.7;
    transform: translate(172px, 188px) scale(0.8);
  }
  40%,
  55% {
    opacity: 0.7;
    transform: translate(80px, 113px) scale(0.8);
  }
  70%,
  80% {
    opacity: 0.7;
    transform: translate(161px, 155px) scale(0.8);
  }
  90%,
  100% {
    opacity: 0;
  }
}
@media (max-height: 720px) {
  .mock-browser {
    height: 180px;
  }
  .mock-content {
    height: 125px;
  }
  .mock-sheet {
    top: 20px;
  }
}
</style>
