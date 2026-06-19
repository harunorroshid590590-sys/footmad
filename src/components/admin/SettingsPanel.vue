<template>
  <div class="space-y-6">
    <div class="bg-card rounded-xl neon-border p-6">
      <h2 class="text-lg font-semibold text-white mb-4">General Settings</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-text-muted text-sm mb-2">Site Name</label>
          <input
            v-model="settings.siteName"
            type="text"
            class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">Site Description</label>
          <textarea
            v-model="settings.siteDescription"
            rows="3"
            class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="bg-card rounded-xl neon-border p-6">
      <h2 class="text-lg font-semibold text-white mb-4">API Configuration</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-text-muted text-sm mb-2">External API URL</label>
          <input
            v-model="settings.apiUrl"
            type="text"
            class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
        <div>
          <label class="block text-text-muted text-sm mb-2">API Username</label>
          <input
            v-model="settings.apiUsername"
            type="text"
            class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>

    <div class="bg-card rounded-xl neon-border p-6">
      <h2 class="text-lg font-semibold text-white mb-4">Stream Proxy Settings</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span class="text-text-muted">Enable Proxy</span>
          <button
            @click="settings.proxyEnabled = !settings.proxyEnabled"
            class="w-12 h-6 rounded-full transition-colors"
            :class="settings.proxyEnabled ? 'bg-primary' : 'bg-card-hover'"
          >
            <div
              class="w-4 h-4 rounded-full bg-white transition-transform"
              :class="settings.proxyEnabled ? 'translate-x-7' : 'translate-x-1'"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <button
      @click="saveSettings"
      class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
    >
      Save Settings
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

const settings = ref({
  siteName: 'FOOTFY',
  siteDescription: 'Premium Sports Live Streaming Platform',
  apiUrl: 'https://events.ivan-flux.online/api/v1/user',
  apiUsername: 'footfy',
  proxyEnabled: true
})

const saveSettings = async () => {
  try {
    await axios.post('/admin/settings', settings.value)
    alert('Settings saved successfully')
  } catch (err) {
    console.error('Failed to save settings:', err)
    alert('Failed to save settings')
  }
}

onMounted(async () => {
  try {
    const response = await axios.get('/admin/settings')
    settings.value = { ...settings.value, ...response.data }
  } catch (err) {
    console.error('Failed to fetch settings:', err)
  }
})
</script>
