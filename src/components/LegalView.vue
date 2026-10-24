<script setup lang="ts">
import { computed, ref } from 'vue'
import { currentLanguage, t } from '../i18n'
import { legalMessages } from '../i18n/legal'
import { repositoryUrl } from '../platform/links'
defineProps<{ kind: 'privacy' | 'imprint' }>()
const emit = defineEmits<{ imprint: [] }>()
const copy = computed(() => legalMessages[currentLanguage.value])
const revealed = ref(false)
const contactEmail = window.appConfig?.contactEmail || import.meta.env.VITE_CONTACT_EMAIL || ''
</script>
<template>
  <main class="page legal-page">
    <template v-if="kind === 'privacy'">
      <section>
        <h2>{{ copy.localTitle }}</h2>
        <p>{{ copy.localText }}</p>
        <p>{{ copy.deleteText }}</p>
      </section>
      <section>
        <h2>{{ copy.websiteTitle }}</h2>
        <p>{{ copy.websiteText }}</p>
      </section>
      <section>
        <h2>{{ copy.sharingTitle }}</h2>
        <p>{{ copy.sharingText }}</p>
      </section>
      <section>
        <h2>{{ copy.contactTitle }}</h2>
        <p>{{ copy.contactText }}</p>
        <button class="text-link" @click="emit('imprint')">{{ t('imprint') }}</button>
        <a class="text-link" href="https://dsb.gv.at/" target="_blank" rel="noopener noreferrer">{{
          copy.authorityLink
        }}</a>
      </section>
    </template>
    <template v-else>
      <p>{{ copy.projectText }}</p>
      <a class="text-link" :href="repositoryUrl" target="_blank" rel="noopener noreferrer">{{ copy.repositoryLink }}</a>
      <section>
        <h2>{{ copy.providerTitle }}</h2>
        <button
          class="text-link"
          :aria-expanded="revealed"
          aria-controls="provider-details"
          @click="revealed = !revealed"
        >
          {{ revealed ? copy.hideInfo : copy.showInfo }}
        </button>
        <div v-if="revealed" id="provider-details" class="provider-details">
          <p>Martin Reisinger<br />{{ copy.location }}</p>
          <a v-if="contactEmail" class="text-link" :href="`mailto:${contactEmail}`">{{ contactEmail }}</a>
        </div>
      </section>
      <section>
        <h2>{{ copy.liabilityTitle }}</h2>
        <p>{{ copy.liabilityText }}</p>
      </section>
    </template>
    <p>{{ copy.updated }}</p>
  </main>
</template>
<style scoped>
.legal-page {
  scrollbar-width: none;
}
section,
.provider-details {
  display: grid;
  gap: 12px;
}
h2 {
  font-size: 17px;
}
.text-link {
  justify-self: start;
  padding: 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: var(--text);
  font-size: 13px;
  font-weight: 650;
  text-align: left;
  text-decoration: none;
  overflow-wrap: anywhere;
}
</style>
