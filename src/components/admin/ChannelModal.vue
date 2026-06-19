<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div class="bg-card rounded-xl neon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white">{{ channel ? 'Edit Channel' : 'Add Channel' }}</h2>
          <button @click="$emit('close')" class="text-text-muted hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name + section -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Name</label>
              <input v-model="form.name" type="text" required class="input" />
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Section</label>
              <select v-model="form.section" class="input">
                <option value="channel">Channel</option>
                <option value="news">News</option>
                <option value="playlist">Playlist</option>
                <option value="dawah">Dawah</option>
              </select>
            </div>
          </div>

          <!-- Logo upload -->
          <div>
            <label class="block text-text-muted text-sm mb-2">Logo</label>
            <div class="flex items-center gap-3">
              <div class="w-16 h-16 rounded-xl overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0">
                <img v-if="logoPreview" :src="logoPreview" alt="" class="w-full h-full object-cover" />
                <span v-else class="text-xs text-text-muted">No logo</span>
              </div>
              <div class="flex-1">
                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange" />
                <button type="button" @click="fileInput?.click()" :disabled="uploading" class="px-4 py-2 rounded-lg border border-border text-white hover:bg-card-hover transition-colors disabled:opacity-50">
                  {{ uploading ? 'Uploading...' : 'Upload image' }}
                </button>
                <input v-model="form.logo" type="text" placeholder="or paste image URL" class="input mt-2 text-sm" />
              </div>
            </div>
          </div>

          <!-- Category + quality -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Category</label>
              <input v-model="form.category" type="text" placeholder="Sports" class="input" />
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Quality</label>
              <input v-model="form.quality" type="text" placeholder="FHD" class="input" />
            </div>
          </div>

          <!-- Badges + active -->
          <div class="flex flex-wrap items-center gap-6">
            <label class="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" v-model="form.badges.live" class="accent-[#3B6FF6]" /> LIVE badge
            </label>
            <label class="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" v-model="form.badges.sports" class="accent-[#3B6FF6]" /> SPORTS badge
            </label>
            <label class="flex items-center gap-2 text-sm text-text-muted">
              <input type="checkbox" v-model="form.active" class="accent-[#3B6FF6]" /> Active
            </label>
          </div>

          <!-- Servers -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-text-muted text-sm">Servers ({{ form.servers.length }})</label>
              <button type="button" @click="addServer" class="text-primary-light text-sm hover:underline">+ Add server</button>
            </div>
            <div v-if="form.servers.length === 0" class="text-text-muted text-xs py-2">No servers yet. Add at least one playable stream.</div>
            <div v-for="(s, i) in form.servers" :key="i" class="bg-surface border border-border rounded-lg p-3 mb-3 space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-white text-sm font-medium">Server {{ i + 1 }}</span>
                <button type="button" @click="removeServer(i)" class="text-accent text-xs hover:underline">Remove</button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input v-model="s.title" placeholder="Title (e.g. WILLOW FHD)" class="input text-sm" />
                <select v-model="s.type" class="input text-sm">
                  <option value="hls">HLS (.m3u8)</option>
                  <option value="dash">DASH (.mpd)</option>
                  <option value="ts">TS</option>
                  <option value="direct">Direct</option>
                  <option value="embed">Embed</option>
                </select>
              </div>
              <input v-model="s.url" placeholder="Stream URL" class="input text-sm" />
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input v-model="s.quality" placeholder="Quality (FHD)" class="input text-sm" />
                <input v-model="s.drmKey" placeholder="DRM key  keyid:key  or license URL" class="input text-sm" />
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input v-model="s.referer" placeholder="Referer (optional)" class="input text-sm" />
                <input v-model="s.origin" placeholder="Origin (optional)" class="input text-sm" />
                <input v-model="s.userAgent" placeholder="User-Agent (optional)" class="input text-sm" />
              </div>
            </div>
          </div>

          <p v-if="uploadError" class="text-accent text-sm">{{ uploadError }}</p>

          <div class="flex justify-end gap-4 pt-2">
            <button type="button" @click="$emit('close')" class="px-6 py-2 rounded-lg border border-border text-text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">Save</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import api from '@/utils/axios'
import { resolveAsset } from '@/utils/assets'

const props = defineProps({
  channel: { type: Object, default: null },
})
const emit = defineEmits(['close', 'save'])

const fileInput = ref(null)
const uploading = ref(false)
const uploadError = ref('')

const blankServer = () => ({ title: '', url: '', type: 'hls', quality: 'FHD', drmKey: '', referer: '', origin: '', userAgent: '' })

const form = ref({
  name: '',
  logo: '',
  section: 'channel',
  category: 'Sports',
  quality: 'FHD',
  badges: { live: true, sports: true },
  active: true,
  servers: [],
})

const logoPreview = computed(() => resolveAsset(form.value.logo))

watch(() => props.channel, (c) => {
  if (c) {
    form.value = {
      name: c.name || '',
      logo: c.logo || '',
      section: c.section || 'channel',
      category: c.category || 'Sports',
      quality: c.quality || 'FHD',
      badges: { live: c.badges?.live ?? true, sports: c.badges?.sports ?? true },
      active: c.active ?? true,
      servers: Array.isArray(c.servers) ? c.servers.map((s) => ({ ...blankServer(), ...s })) : [],
    }
  }
}, { immediate: true })

const addServer = () => form.value.servers.push(blankServer())
const removeServer = (i) => form.value.servers.splice(i, 1)

const onFileChange = async (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  uploading.value = true
  uploadError.value = ''
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    form.value.logo = data.url
  } catch (err) {
    uploadError.value = err.response?.data?.message || 'Upload failed'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const handleSubmit = () => {
  // Drop empty servers (no URL).
  const servers = form.value.servers.filter((s) => s.url && s.url.trim())
  emit('save', { ...form.value, servers })
}
</script>

<style scoped>
.input {
  @apply w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary;
}
</style>
