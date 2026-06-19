<template>
  <div v-if="config.adSettings.enabled">
    <!-- Top Banner -->
    <div v-if="config.bannerAds.top.enabled" class="w-full mb-4">
      <div v-html="getBannerCode('top')" class="ad-container"></div>
    </div>

    <!-- Middle Banner -->
    <div v-if="config.bannerAds.middle.enabled" class="w-full my-8">
      <div v-html="getBannerCode('middle')" class="ad-container"></div>
    </div>

    <!-- Bottom Banner -->
    <div v-if="config.bannerAds.bottom.enabled" class="w-full mt-4">
      <div v-html="getBannerCode('bottom')" class="ad-container"></div>
    </div>

    <!-- Popunder -->
    <div v-if="shouldShowPopunder" class="hidden">
      <div v-html="getPopunderCode()" class="ad-container"></div>
    </div>

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

const popunderShownCount = ref(0)
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

const getPopunderCode = () => {
  const device = isMobile.value ? 'mobile' : 'desktop'
  const popunder = config.value.popunderAds[device]
  
  if (!popunder || !popunder.enabled) return ''
  
  return popunder.code || ''
}

const shouldShowPopunder = computed(() => {
  const device = isMobile.value ? 'mobile' : 'desktop'
  const popunder = config.value.popunderAds[device]
  
  if (!popunder || !popunder.enabled) return false
  if (popunderShownCount.value >= config.value.adSettings.maxPopupPerSession) return false
  
  return true
})

const showPopunder = () => {
  if (shouldShowPopunder.value) {
    popunderShownCount.value++
    // Trigger popunder logic here
  }
}

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

onMounted(() => {
  fetchConfig()
  
  // Show popunder after a delay
  setTimeout(() => {
    showPopunder()
  }, 3000)
})
</script>

<style scoped>
.ad-container {
  width: 100%;
  min-height: 50px;
}

.ad-container :deep(iframe) {
  width: 100%;
  border: none;
}
</style>
