<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div class="bg-card rounded-xl neon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white">{{ stream ? 'Edit Stream' : 'Add Stream' }}</h2>
          <button
            @click="$emit('close')"
            class="text-text-muted hover:text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-text-muted text-sm mb-2">Stream Name</label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Stream URL</label>
            <input
              v-model="formData.url"
              type="url"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
            <p class="text-text-muted text-xs mt-1">Supports m3u8, mpd, ts. Use | to add params (e.g., url|Referer=https://example.com)</p>
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Quality</label>
            <input
              v-model="formData.quality"
              type="text"
              placeholder="HD, 1080p, 720p"
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Stream Type</label>
            <select
              v-model="formData.type"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="hls">HLS</option>
              <option value="dash">DASH</option>
              <option value="ts">TS</option>
              <option value="embed">Embed</option>
            </select>
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">DRM Type</label>
            <select
              v-model="formData.drmType"
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="">None</option>
              <option value="clearkey">ClearKey</option>
              <option value="widevine">Widevine</option>
            </select>
          </div>

          <div v-if="formData.drmType === 'clearkey'" class="space-y-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">ClearKey (format: KEYID:KEY)</label>
              <input
                v-model="formData.clearKey"
                type="text"
                placeholder="keyid:key"
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div v-if="formData.drmType === 'widevine'" class="space-y-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">License URL</label>
              <input
                v-model="formData.licenseUrl"
                type="url"
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Referer (optional)</label>
            <input
              v-model="formData.referer"
              type="url"
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Origin (optional)</label>
            <input
              v-model="formData.origin"
              type="url"
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">User-Agent (optional)</label>
            <input
              v-model="formData.userAgent"
              type="text"
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div class="flex items-center justify-between">
            <label class="text-text-muted text-sm">Active</label>
            <button
              type="button"
              @click="formData.active = !formData.active"
              class="w-12 h-6 rounded-full transition-colors"
              :class="formData.active ? 'bg-primary' : 'bg-card-hover'"
            >
              <div
                class="w-4 h-4 rounded-full bg-white transition-transform"
                :class="formData.active ? 'translate-x-7' : 'translate-x-1'"
              ></div>
            </button>
          </div>

          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 rounded-lg border border-border text-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  stream: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  name: '',
  url: '',
  quality: 'HD',
  type: 'hls',
  drmType: '',
  clearKey: '',
  licenseUrl: '',
  referer: '',
  origin: '',
  userAgent: '',
  active: true
})

watch(() => props.stream, (newStream) => {
  if (newStream) {
    formData.value = {
      name: newStream.name || '',
      url: newStream.url || '',
      quality: newStream.quality || 'HD',
      type: newStream.type || 'hls',
      drmType: newStream.drm?.type || '',
      clearKey: newStream.drm?.clearKey || '',
      licenseUrl: newStream.drm?.licenseUrl || '',
      referer: newStream.referer || '',
      origin: newStream.origin || '',
      userAgent: newStream.userAgent || '',
      active: newStream.active !== undefined ? newStream.active : true
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  const data = {
    name: formData.value.name,
    url: formData.value.url,
    quality: formData.value.quality,
    type: formData.value.type,
    referer: formData.value.referer,
    origin: formData.value.origin,
    userAgent: formData.value.userAgent,
    active: formData.value.active
  }

  if (formData.value.drmType) {
    data.drm = {
      type: formData.value.drmType
    }
    
    if (formData.value.drmType === 'clearkey') {
      const [kid, key] = formData.value.clearKey.split(':')
      data.drm.clearKeys = {
        [kid]: key
      }
    } else if (formData.value.drmType === 'widevine') {
      data.drm.licenseUrl = formData.value.licenseUrl
    }
  }

  emit('save', data)
}
</script>
