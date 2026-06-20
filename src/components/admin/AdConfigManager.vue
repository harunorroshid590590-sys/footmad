<template>
  <div class="space-y-6">
    <!-- Toast notification -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="toast.show"
        class="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card max-w-sm"
        :class="toast.type === 'error'
          ? 'bg-card border-accent/40 text-white'
          : 'bg-card border-green-500/40 text-white'"
      >
        <span
          class="flex items-center justify-center w-7 h-7 rounded-full shrink-0"
          :class="toast.type === 'error' ? 'bg-accent/20 text-accent' : 'bg-green-500/20 text-green-400'"
        >
          <svg v-if="toast.type === 'error'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>
        </span>
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </Transition>

    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Ad Configuration</h2>
      <button
        @click="saveConfig"
        class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
      >
        Save Configuration
      </button>
    </div>

    <!-- Global Ad Settings -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Global Settings</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Enable Ads</p>
            <p class="text-text-muted text-sm">Enable or disable all ads globally</p>
          </div>
          <input
            v-model="config.adSettings.enabled"
            type="checkbox"
            class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
          />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Frequency</p>
            <p class="text-text-muted text-sm">How often to show ads per session</p>
          </div>
          <input
            v-model.number="config.adSettings.frequency"
            type="number"
            min="1"
            class="w-20 bg-card-hover border border-border rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Max Popup Per Session</p>
            <p class="text-text-muted text-sm">Maximum popup ads per user session</p>
          </div>
          <input
            v-model.number="config.adSettings.maxPopupPerSession"
            type="number"
            min="1"
            class="w-20 bg-card-hover border border-border rounded-lg px-3 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Watch Page Banner (clickable image) -->
    <div class="bg-card rounded-xl border border-border p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-white">Watch Page Banner</h3>
          <p class="text-text-muted text-sm">Clickable image banner shown above the match info on the watch page.</p>
        </div>
        <input
          v-model="config.watchBanner.enabled"
          type="checkbox"
          class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
        />
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-text-muted text-sm mb-2">Banner Image URL</label>
          <input
            v-model="config.watchBanner.image"
            type="text"
            placeholder="https://example.com/banner.jpg"
            class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
          <div class="flex items-center gap-3 mt-2">
            <input ref="bannerFile" type="file" accept="image/*" class="hidden" @change="uploadBanner" />
            <button type="button" @click="$refs.bannerFile.click()" :disabled="uploadingBanner" class="px-3 py-1.5 rounded-lg border border-border text-white text-sm hover:bg-card-hover disabled:opacity-50">
              {{ uploadingBanner ? 'Uploading...' : 'or Upload image' }}
            </button>
            <img v-if="bannerPreview" :src="bannerPreview" alt="" class="h-10 rounded border border-border" />
          </div>
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">Link URL (opens when banner is clicked)</label>
          <input
            v-model="config.watchBanner.link"
            type="url"
            placeholder="https://example.com"
            class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Pre-roll Video Ad (VAST) -->
    <div class="bg-card rounded-xl border border-border p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h3 class="text-lg font-semibold text-white">Video Ad (Pre-roll)</h3>
          <p class="text-text-muted text-sm">VAST tag played before the stream starts. Plays again each time a match is opened.</p>
        </div>
        <input
          v-model="config.videoAd.enabled"
          type="checkbox"
          class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
        />
      </div>
      <div class="space-y-4">
        <div>
          <label class="block text-text-muted text-sm mb-2">VAST Tag URL</label>
          <input
            v-model="config.videoAd.vastUrl"
            type="text"
            placeholder="https://www.videosprofitnetwork.com/watch.xml?key=..."
            class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">Skip allowed after (seconds, 0 = no skip)</label>
          <input
            v-model.number="config.videoAd.skipAfter"
            type="number"
            min="0"
            class="w-32 bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
          />
        </div>
      </div>
    </div>

    <!-- Banner Ads -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Banner Ads</h3>
      <div class="space-y-6">
        <!-- Top Banner -->
        <div class="border-b border-border pb-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-medium">Top Banner</h4>
            <input
              v-model="config.bannerAds.top.enabled"
              type="checkbox"
              class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
            />
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-text-muted text-sm mb-2">Ad Code (HTML/JS)</label>
              <textarea
                v-model="config.bannerAds.top.code"
                rows="4"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Paste your ad code here..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Desktop Code (optional)</label>
              <textarea
                v-model="config.bannerAds.top.desktopCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Desktop-specific ad code..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Mobile Code (optional)</label>
              <textarea
                v-model="config.bannerAds.top.mobileCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Mobile-specific ad code..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Middle Banner -->
        <div class="border-b border-border pb-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-medium">Middle Banner</h4>
            <input
              v-model="config.bannerAds.middle.enabled"
              type="checkbox"
              class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
            />
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-text-muted text-sm mb-2">Ad Code (HTML/JS)</label>
              <textarea
                v-model="config.bannerAds.middle.code"
                rows="4"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Paste your ad code here..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Desktop Code (optional)</label>
              <textarea
                v-model="config.bannerAds.middle.desktopCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Desktop-specific ad code..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Mobile Code (optional)</label>
              <textarea
                v-model="config.bannerAds.middle.mobileCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Mobile-specific ad code..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Bottom Banner -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-medium">Bottom Banner</h4>
            <input
              v-model="config.bannerAds.bottom.enabled"
              type="checkbox"
              class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
            />
          </div>
          <div class="space-y-3">
            <div>
              <label class="block text-text-muted text-sm mb-2">Ad Code (HTML/JS)</label>
              <textarea
                v-model="config.bannerAds.bottom.code"
                rows="4"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Paste your ad code here..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Desktop Code (optional)</label>
              <textarea
                v-model="config.bannerAds.bottom.desktopCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Desktop-specific ad code..."
              ></textarea>
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Mobile Code (optional)</label>
              <textarea
                v-model="config.bannerAds.bottom.mobileCode"
                rows="3"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Mobile-specific ad code..."
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Popunder Ads -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Popunder Ads</h3>
      <div class="space-y-6">
        <!-- Desktop Popunder -->
        <div class="border-b border-border pb-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-medium">Desktop Popunder</h4>
            <input
              v-model="config.popunderAds.desktop.enabled"
              type="checkbox"
              class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-text-muted text-sm mb-2">Popunder Code</label>
            <textarea
              v-model="config.popunderAds.desktop.code"
              rows="4"
              class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
              placeholder="Paste your popunder code here..."
            ></textarea>
          </div>
        </div>

        <!-- Mobile Popunder -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-white font-medium">Mobile Popunder</h4>
            <input
              v-model="config.popunderAds.mobile.enabled"
              type="checkbox"
              class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
            />
          </div>
          <div>
            <label class="block text-text-muted text-sm mb-2">Popunder Code</label>
            <textarea
              v-model="config.popunderAds.mobile.code"
              rows="4"
              class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
              placeholder="Paste your popunder code here..."
            ></textarea>
          </div>
        </div>
      </div>
    </div>

    <!-- Direct Link Ads -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Direct Link Ads</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Enable Direct Link Ads</p>
            <p class="text-text-muted text-sm">Enable redirect-based advertising</p>
          </div>
          <input
            v-model="config.directLinkAds.enabled"
            type="checkbox"
            class="w-5 h-5 rounded border-border bg-card-hover text-primary focus:ring-primary"
          />
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">Redirect URL</label>
          <input
            v-model="config.directLinkAds.redirectUrl"
            type="url"
            class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">Button Ads</label>
          <div class="space-y-2">
            <div v-for="(button, index) in config.directLinkAds.buttonAds" :key="index" class="flex space-x-2">
              <input
                v-model="button.title"
                type="text"
                class="flex-1 bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                placeholder="Button title"
              />
              <input
                v-model="button.url"
                type="url"
                class="flex-1 bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                placeholder="Button URL"
              />
              <select
                v-model="button.position"
                class="bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
              >
                <option value="header">Header</option>
                <option value="middle">Middle</option>
                <option value="footer">Footer</option>
              </select>
              <button
                @click="removeButtonAd(index)"
                class="text-red-500 hover:text-red-400 px-2"
              >
                Remove
              </button>
            </div>
            <button
              @click="addButtonAd"
              class="text-primary hover:text-primary-dark text-sm"
            >
              + Add Button Ad
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { resolveAsset } from '@/utils/assets'

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
  },
  watchBanner: {
    enabled: false,
    image: '',
    link: ''
  },
  videoAd: {
    enabled: false,
    vastUrl: '',
    skipAfter: 5
  }
})

const uploadingBanner = ref(false)
const bannerPreview = computed(() => resolveAsset(config.value.watchBanner?.image))

const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value.show = false }, 3000)
}

const fetchConfig = async () => {
  try {
    const response = await axios.get(`${API_URL}/ad-config`)
    config.value = response.data
    // Ensure newer sections exist for older configs
    if (!config.value.watchBanner) {
      config.value.watchBanner = { enabled: false, image: '', link: '' }
    }
    if (!config.value.videoAd) {
      config.value.videoAd = { enabled: false, vastUrl: '', skipAfter: 5 }
    }
  } catch (error) {
    console.error('Error fetching ad config:', error)
  }
}

const uploadBanner = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploadingBanner.value = true
  try {
    const token = localStorage.getItem('admin_token')
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await axios.post(`${API_URL}/upload`, fd, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    })
    config.value.watchBanner.image = data.url
  } catch (err) {
    showToast('Image upload failed', 'error')
  } finally {
    uploadingBanner.value = false
    e.target.value = ''
  }
}

const saveConfig = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.put(`${API_URL}/ad-config`, config.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showToast('Ad configuration saved successfully')
  } catch (error) {
    console.error('Error saving ad config:', error)
    showToast('Failed to save ad configuration', 'error')
  }
}

const addButtonAd = () => {
  config.value.directLinkAds.buttonAds.push({
    title: '',
    url: '',
    position: 'header'
  })
}

const removeButtonAd = (index) => {
  config.value.directLinkAds.buttonAds.splice(index, 1)
}

onMounted(() => {
  fetchConfig()
})
</script>
