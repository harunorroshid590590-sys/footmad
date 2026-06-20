<template>
  <component
    :is="banner.link ? 'a' : 'div'"
    v-if="banner.enabled && imageUrl"
    :href="banner.link || undefined"
    :target="banner.link ? '_blank' : undefined"
    rel="noopener"
    class="block rounded-xl overflow-hidden border border-border mb-4 w-full h-20 sm:h-24"
    :class="banner.link ? 'cursor-pointer hover:border-primary/50 transition-colors' : ''"
  >
    <img :src="imageUrl" alt="Banner" class="block w-full h-full object-cover" />
  </component>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { resolveAsset } from '@/utils/assets'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

const banner = ref({ enabled: false, image: '', link: '' })
const imageUrl = computed(() => resolveAsset(banner.value.image))

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_URL}/ad-config`)
    if (data?.watchBanner) banner.value = data.watchBanner
  } catch {
    /* no banner */
  }
})
</script>
