<template>
  <div class="min-h-screen bg-background">
    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-card border-r border-border min-h-screen fixed left-0 top-0 hidden lg:block">
        <div class="p-6">
          <div class="flex items-center space-x-2 mb-8">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">F</span>
            </div>
            <span class="text-white font-bold text-xl">FootMad</span>
          </div>

          <nav class="space-y-2">
            <button
              v-for="item in sidebarItems"
              :key="item.id"
              @click="activeSection = item.id"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors"
              :class="activeSection === item.id ? 'bg-primary text-white' : 'text-text-muted hover:text-white hover:bg-card-hover'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>

            <router-link
              to="/"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-muted hover:text-white hover:bg-card-hover transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
              </svg>
              <span>Back to Home</span>
            </router-link>
          </nav>
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <button
            @click="handleLogout"
            class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-muted hover:text-white hover:bg-card-hover transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 lg:ml-64">
        <!-- Mobile Header -->
        <div class="lg:hidden bg-card border-b border-border p-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span class="text-white font-bold">F</span>
              </div>
              <span class="text-white font-bold">FootMad</span>
            </div>
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="text-white p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <!-- Mobile Menu -->
          <div v-if="mobileMenuOpen" class="mt-4 space-y-2">
            <button
              v-for="item in sidebarItems"
              :key="item.id"
              @click="activeSection = item.id; mobileMenuOpen = false"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors text-left"
              :class="activeSection === item.id ? 'bg-primary text-white' : 'text-text-muted hover:text-white hover:bg-card-hover'"
            >
              <component :is="item.icon" class="w-5 h-5" />
              <span>{{ item.label }}</span>
            </button>
            <router-link
              to="/"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-muted hover:text-white hover:bg-card-hover transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
              </svg>
              <span>Back to Home</span>
            </router-link>
            <button
              @click="handleLogout"
              class="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-text-muted hover:text-white hover:bg-card-hover transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>

        <!-- Content Sections -->
        <div class="p-6">
          <!-- Dashboard -->
          <div v-if="activeSection === 'dashboard'">
            <h1 class="text-2xl font-bold text-white mb-6">Dashboard</h1>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div class="bg-card rounded-xl neon-border p-6">
                <div class="text-text-muted text-sm mb-2">Total Matches</div>
                <div class="text-3xl font-bold text-white">{{ stats.totalMatches }}</div>
              </div>
              <div class="bg-card rounded-xl neon-border p-6">
                <div class="text-text-muted text-sm mb-2">Live Matches</div>
                <div class="text-3xl font-bold text-primary">{{ stats.liveMatches }}</div>
              </div>
              <div class="bg-card rounded-xl neon-border p-6">
                <div class="text-text-muted text-sm mb-2">Total Streams</div>
                <div class="text-3xl font-bold text-white">{{ stats.totalStreams }}</div>
              </div>
              <div class="bg-card rounded-xl neon-border p-6">
                <div class="text-text-muted text-sm mb-2">Categories</div>
                <div class="text-3xl font-bold text-white">{{ stats.categories }}</div>
              </div>
            </div>
          </div>

          <!-- Matches Management -->
          <div v-if="activeSection === 'matches'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-bold text-white">Matches</h1>
              <button
                @click="openAddMatch"
                class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Match
              </button>
            </div>
            <MatchesTable ref="matchesTableRef" @edit="editMatch" @changed="fetchStats" />
          </div>

          <!-- Streams Management -->
          <div v-if="activeSection === 'streams'">
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-bold text-white">Streams</h1>
              <button
                @click="showStreamModal = true"
                class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add Stream
              </button>
            </div>
            <StreamsTable @edit="editStream" @delete="deleteStream" />
          </div>

          <!-- Channels Management -->
          <div v-if="activeSection === 'channels'">
            <ChannelsManager />
          </div>

          <!-- Match Banners -->
          <div v-if="activeSection === 'banners'">
            <MatchBanners />
          </div>

          <!-- Categories -->
          <div v-if="activeSection === 'categories'">
            <h1 class="text-2xl font-bold text-white mb-6">Categories</h1>
            <CategoriesTable />
          </div>

          <!-- Ads Manager -->
          <div v-if="activeSection === 'ads'">
            <AdsManager />
          </div>

          <!-- Ad Config -->
          <div v-if="activeSection === 'ad-config'">
            <AdConfigManager />
          </div>

          <!-- Cache Manager -->
          <div v-if="activeSection === 'cache'">
            <CacheManager />
          </div>

          <!-- Scheduler -->
          <div v-if="activeSection === 'scheduler'">
            <SchedulerManager />
          </div>

          <!-- Settings -->
          <div v-if="activeSection === 'settings'">
            <h1 class="text-2xl font-bold text-white mb-6">Settings</h1>
            <SettingsPanel />
          </div>
        </div>
      </main>
    </div>

    <!-- Match Modal -->
    <MatchModal
      v-if="showMatchModal"
      :match="editingMatch"
      :saving="savingMatch"
      @close="showMatchModal = false"
      @save="saveMatch"
    />

    <!-- Stream Modal -->
    <StreamModal
      v-if="showStreamModal"
      :stream="editingStream"
      @close="showStreamModal = false"
      @save="saveStream"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import MatchesTable from '@/components/admin/MatchesTable.vue'
import StreamsTable from '@/components/admin/StreamsTable.vue'
import ChannelsManager from '@/components/admin/ChannelsManager.vue'
import MatchBanners from '@/components/admin/MatchBanners.vue'
import CategoriesTable from '@/components/admin/CategoriesTable.vue'
import SettingsPanel from '@/components/admin/SettingsPanel.vue'
import MatchModal from '@/components/admin/MatchModal.vue'
import StreamModal from '@/components/admin/StreamModal.vue'
import AdsManager from '@/components/admin/AdsManager.vue'
import CacheManager from '@/components/admin/CacheManager.vue'
import SchedulerManager from '@/components/admin/SchedulerManager.vue'
import AdConfigManager from '@/components/admin/AdConfigManager.vue'
import api from '@/utils/axios'

const router = useRouter()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const activeSection = ref('dashboard')
const mobileMenuOpen = ref(false)
const showMatchModal = ref(false)
const showStreamModal = ref(false)
const editingMatch = ref(null)
const editingStream = ref(null)
const savingMatch = ref(false)
const matchesTableRef = ref(null)

const sidebarItems = computed(() => [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'matches', label: 'Matches', icon: '⚽' },
  { id: 'streams', label: 'Streams', icon: '📺' },
  { id: 'channels', label: 'Channels', icon: '📡' },
  { id: 'banners', label: 'Matches (Pin/Banner)', icon: '📌' },
  { id: 'categories', label: 'Categories', icon: '🏷️' },
  { id: 'ads', label: 'Ads Manager', icon: '📢' },
  { id: 'ad-config', label: 'Ad Config', icon: '⚙️' },
  { id: 'cache', label: 'Cache Manager', icon: '💾' },
  { id: 'scheduler', label: 'Scheduler', icon: '⏰' },
  { id: 'settings', label: 'Settings', icon: '⚙️' }
])

const stats = ref({
  totalMatches: 0,
  liveMatches: 0,
  totalStreams: 0,
  categories: 0
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_user')
  router.push('/admin/login')
}

const openAddMatch = () => {
  editingMatch.value = null
  showMatchModal.value = true
}

// Opened from the Matches table (custom matches only — provider matches use the
// in-table link editor instead).
const editMatch = (match) => {
  editingMatch.value = match
  showMatchModal.value = true
}

// Save the match modal: editing a custom match → custom endpoint; editing an
// API match → provider-edit override; nothing being edited → new custom match.
const saveMatch = async (matchData) => {
  savingMatch.value = true
  try {
    if (editingMatch.value?.isCustom) {
      await api.put(`/admin/custom-matches/${editingMatch.value.id}`, matchData)
    } else if (editingMatch.value) {
      await api.put(`/admin/matches/${editingMatch.value.id}`, matchData)
    } else {
      await api.post('/admin/custom-matches', matchData)
    }
    showMatchModal.value = false
    editingMatch.value = null
    matchesTableRef.value?.fetchMatches()
    fetchStats()
  } catch (err) {
    console.error('Failed to save match:', err)
    alert('Failed to save match. Please try again.')
  } finally {
    savingMatch.value = false
  }
}

const editStream = (stream) => {
  editingStream.value = stream
  showStreamModal.value = true
}

const deleteStream = async (id) => {
  if (!confirm('Are you sure you want to delete this stream?')) return
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`${API_URL}/admin/streams/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchStats()
  } catch (err) {
    console.error('Failed to delete stream:', err)
  }
}

const saveStream = async (streamData) => {
  try {
    const token = localStorage.getItem('admin_token')
    if (editingStream.value) {
      await axios.put(`${API_URL}/admin/streams/${editingStream.value._id}`, streamData, {
        headers: { Authorization: `Bearer ${token}` }
      })
    } else {
      await axios.post(`${API_URL}/admin/streams`, streamData, {
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    showStreamModal.value = false
    editingStream.value = null
    fetchStats()
  } catch (err) {
    console.error('Failed to save stream:', err)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
