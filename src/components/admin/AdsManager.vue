<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Ads Manager</h2>
      <button
        @click="showModal = true"
        class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
      >
        Add New Ad
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="ad in ads"
        :key="ad._id"
        class="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold px-2 py-1 rounded bg-primary/20 text-primary">
            {{ ad.type.toUpperCase() }}
          </span>
          <div class="flex items-center space-x-2">
            <button
              @click="editAd(ad)"
              class="text-text-muted hover:text-white transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="deleteAd(ad._id)"
              class="text-text-muted hover:text-red-500 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <h3 class="text-white font-semibold mb-2">{{ ad.name }}</h3>
        <p class="text-text-muted text-sm mb-2">Position: {{ ad.position }}</p>
        <p class="text-text-muted text-sm mb-2">Device: {{ ad.device }}</p>
        
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div class="flex items-center space-x-4 text-xs text-text-muted">
            <span>{{ ad.impressions }} views</span>
            <span>{{ ad.clicks }} clicks</span>
            <span>{{ ad.ctr.toFixed(2) }}% CTR</span>
          </div>
          <button
            @click="toggleAd(ad)"
            :class="ad.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'"
            class="text-xs px-2 py-1 rounded transition-colors"
          >
            {{ ad.active ? 'Active' : 'Inactive' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Ad Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-6">{{ editingAd ? 'Edit Ad' : 'Add New Ad' }}</h3>
          
          <form @submit.prevent="saveAd" class="space-y-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Ad Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-text-muted text-sm mb-2">Ad Type</label>
                <select
                  v-model="formData.type"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="banner">Banner</option>
                  <option value="popunder">Popunder</option>
                  <option value="popup">Popup</option>
                  <option value="native">Native</option>
                  <option value="player">Player</option>
                  <option value="sticky">Sticky</option>
                </select>
              </div>

              <div>
                <label class="block text-text-muted text-sm mb-2">Position</label>
                <select
                  v-model="formData.position"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                  required
                >
                  <option value="header">Header</option>
                  <option value="between-cards">Between Cards</option>
                  <option value="sidebar">Sidebar</option>
                  <option value="above-player">Above Player</option>
                  <option value="below-player">Below Player</option>
                  <option value="footer">Footer</option>
                  <option value="overlay">Overlay</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-text-muted text-sm mb-2">Device</label>
                <select
                  v-model="formData.device"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                >
                  <option value="all">All Devices</option>
                  <option value="desktop">Desktop Only</option>
                  <option value="mobile">Mobile Only</option>
                </select>
              </div>

              <div>
                <label class="block text-text-muted text-sm mb-2">Priority</label>
                <input
                  v-model.number="formData.priority"
                  type="number"
                  min="0"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">HTML Code</label>
              <textarea
                v-model="formData.htmlCode"
                rows="6"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                required
                placeholder="Paste your ad HTML/JS code here..."
              ></textarea>
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">Desktop Code (optional)</label>
              <textarea
                v-model="formData.desktopCode"
                rows="4"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Desktop-specific ad code..."
              ></textarea>
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">Mobile Code (optional)</label>
              <textarea
                v-model="formData.mobileCode"
                rows="4"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="Mobile-specific ad code..."
              ></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-text-muted text-sm mb-2">Frequency Limit</label>
                <input
                  v-model.number="formData.frequencyLimit"
                  type="number"
                  min="1"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-text-muted text-sm mb-2">Frequency Period</label>
                <select
                  v-model="formData.frequencyPeriod"
                  class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                >
                  <option value="session">Per Session</option>
                  <option value="hour">Per Hour</option>
                  <option value="day">Per Day</option>
                </select>
              </div>
            </div>

            <div class="flex items-center">
              <input
                v-model="formData.active"
                type="checkbox"
                id="active"
                class="w-4 h-4 rounded border-border bg-card-hover text-primary focus:ring-primary"
              />
              <label for="active" class="ml-2 text-text-muted text-sm">Active</label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 rounded-lg border border-border text-text-muted hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
              >
                {{ editingAd ? 'Update' : 'Create' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const ads = ref([])
const showModal = ref(false)
const editingAd = ref(null)
const formData = ref({
  name: '',
  type: 'banner',
  position: 'header',
  htmlCode: '',
  desktopCode: '',
  mobileCode: '',
  active: true,
  frequencyLimit: 1,
  frequencyPeriod: 'session',
  device: 'all',
  priority: 0
})

const fetchAds = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_URL}/ads`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ads.value = response.data
  } catch (error) {
    console.error('Error fetching ads:', error)
  }
}

const saveAd = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    if (editingAd.value) {
      await axios.put(`${API_URL}/ads/${editingAd.value._id}`, formData.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      await axios.post(`${API_URL}/ads`, formData.value, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    closeModal()
    fetchAds()
  } catch (error) {
    console.error('Error saving ad:', error)
  }
}

const editAd = (ad) => {
  editingAd.value = ad
  formData.value = { ...ad }
  showModal.value = true
}

const deleteAd = async (id) => {
  if (!confirm('Are you sure you want to delete this ad?')) return
  
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`${API_URL}/ads/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchAds()
  } catch (error) {
    console.error('Error deleting ad:', error)
  }
}

const toggleAd = async (ad) => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.put(`${API_URL}/ads/${ad._id}`, { active: !ad.active }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchAds()
  } catch (error) {
    console.error('Error toggling ad:', error)
  }
}

const closeModal = () => {
  showModal.value = false
  editingAd.value = null
  formData.value = {
    name: '',
    type: 'banner',
    position: 'header',
    htmlCode: '',
    desktopCode: '',
    mobileCode: '',
    active: true,
    frequencyLimit: 1,
    frequencyPeriod: 'session',
    device: 'all',
    priority: 0
  }
}

onMounted(() => {
  fetchAds()
})
</script>
