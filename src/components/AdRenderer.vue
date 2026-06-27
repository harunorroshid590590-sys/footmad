<template>
  <div v-if="config.adSettings.enabled">
    <!-- Top Banner -->
    <div v-if="config.bannerAds.top.enabled && getBannerCode('top')" class="w-full mb-4">
      <AdSlot :code="getBannerCode('top')" class="ad-container" />
    </div>

    <!-- Middle Banner -->
    <div v-if="config.bannerAds.middle.enabled && getBannerCode('middle')" class="w-full my-8">
      <AdSlot :code="getBannerCode('middle')" class="ad-container" />
    </div>

    <!-- Bottom Banner -->
    <div v-if="config.bannerAds.bottom.enabled && getBannerCode('bottom')" class="w-full mt-4">
      <AdSlot :code="getBannerCode('bottom')" class="ad-container" />
    </div>

    <!-- Popunder is injected as a real <script> element (see injectPopunder);
         v-html can't execute scripts, which is why it never fired before. -->

    <!-- Direct Link Buttons -->
    <div v-if="config.directLinkAds.enabled" class="fixed z-50">
      <div
        v-for="(button, index) in config.directLinkAds.buttonAds"
        :key="index"
        :class="getButtonPositionClass(button.position)"
      >
        <a
          :href="button.url"
          target="_blank"
          rel="noopener noreferrer"
          class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          {{ button.title }}
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import AdSlot from './AdSlot.vue'
import { initPopunder } from '@/utils/popunder'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const config = ref({
  bannerAds: {
    top: { enabled: false, code: '', desktopCode: '', mobileCode: '' },
    middle: { enabled: false, code: '', desktopCode: '', mobileCode: '' },
    bottom: { enabled: false, code: '', desktopCode: '', mobileCode: '' }
  },
  popunderAds: {
    desktop: { enabled: false, code: '' },
    mobile: { enabled: false, code: '' }
  },
  directLinkAds: {
    enabled: false,
    redirectUrl: '',
    buttonAds: []
  },
  adSettings: {
    enabled: true,
    frequency: 1,
    maxPopupPerSession: 3
  }
})

const isMobile = computed(() => window.innerWidth < 768)

const fetchConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/ad-config`)
    config.value = response.data
  } catch (error) {
    console.error('Error fetching ad config:', error)
  }
}

const getBannerCode = (position) => {
  const banner = config.value.bannerAds[position]
  if (!banner || !banner.enabled) return ''
  
  const isMobileDevice = isMobile.value
  
  if (isMobileDevice && banner.mobileCode) {
    return banner.mobileCode
  } else if (!isMobileDevice && banner.desktopCode) {
    return banner.desktopCode
  }
  
  return banner.code || ''
}

// Popunder is shared with the watch page (one init guard); it re-arms on a
// click cadence so it shows repeatedly with a gap.
const showPopunder = () => initPopunder(config.value)

const getButtonPositionClass = (position) => {
  switch (position) {
    case 'header':
      return 'top-4 right-4'
    case 'middle':
      return 'top-1/2 right-4 transform -translate-y-1/2'
    case 'footer':
      return 'bottom-4 right-4'
    default:
      return 'top-4 right-4'
  }
}

onMounted(async () => {
  // Load config, then inject the popunder script IMMEDIATELY so it's armed
  // before the user clicks a match. A delay here meant the script wasn't loaded
  // yet when the user clicked through, so no popunder fired.
  await fetchConfig()
  showPopunder()
})
</script>

<style scoped>
.ad-container {
  width: 100%;
}

.ad-container :deep(iframe) {
  width: 100%;
  border: none;
}
</style>
