<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Cache Manager</h2>
      <div class="flex space-x-3">
        <button
          @click="refreshCache"
          class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          Refresh Cache
        </button>
        <button
          @click="clearAllCache"
          class="bg-red-500/20 hover:bg-red-500/30 text-red-500 px-4 py-2 rounded-lg transition-colors"
        >
          Clear All Cache
        </button>
      </div>
    </div>

    <!-- Cache Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-card rounded-xl border border-border p-4">
        <p class="text-text-muted text-sm mb-1">Total Requests Today</p>
        <p class="text-2xl font-bold text-white">{{ stats?.today?.requests || 0 }}</p>
      </div>
      <div class="bg-card rounded-xl border border-border p-4">
        <p class="text-text-muted text-sm mb-1">Cache Hits</p>
        <p class="text-2xl font-bold text-green-500">{{ stats?.today?.cached || 0 }}</p>
      </div>
      <div class="bg-card rounded-xl border border-border p-4">
        <p class="text-text-muted text-sm mb-1">Cache Hit Rate</p>
        <p class="text-2xl font-bold text-primary">{{ stats?.today?.cacheHitRate?.toFixed(1) || 0 }}%</p>
      </div>
      <div class="bg-card rounded-xl border border-border p-4">
        <p class="text-text-muted text-sm mb-1">Cache Size</p>
        <p class="text-2xl font-bold text-white">{{ stats?.cacheSize || 0 }}</p>
      </div>
    </div>

    <!-- API Usage -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">API Usage Today</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p class="text-text-muted text-sm mb-1">Successful</p>
          <p class="text-xl font-bold text-green-500">{{ stats?.today?.successful || 0 }}</p>
        </div>
        <div>
          <p class="text-text-muted text-sm mb-1">Failed</p>
          <p class="text-xl font-bold text-red-500">{{ stats?.today?.failed || 0 }}</p>
        </div>
        <div>
          <p class="text-text-muted text-sm mb-1">Last Sync</p>
          <p class="text-xl font-bold text-white">{{ stats?.today?.lastSyncTime ? new Date(stats.today.lastSyncTime).toLocaleString() : 'Never' }}</p>
        </div>
      </div>
    </div>

    <!-- Memory Cache Info -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Memory Cache</h3>
      <p class="text-text-muted">Memory cache entries: {{ stats?.memoryCacheSize || 0 }}</p>
      <p class="text-text-muted text-sm mt-2">Memory cache provides faster access and reduces database load.</p>
    </div>

    <!-- Cache Settings -->
    <div class="bg-card rounded-xl border border-border p-6">
      <h3 class="text-lg font-semibold text-white mb-4">Cache Settings</h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Cache TTL</p>
            <p class="text-text-muted text-sm">Time-to-live for cached data (5 minutes)</p>
          </div>
          <span class="text-primary font-semibold">300 seconds</span>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Auto Refresh</p>
            <p class="text-text-muted text-sm">Automatic cache refresh via scheduler</p>
          </div>
          <span class="text-green-500 font-semibold">Enabled (5 min)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const stats = ref(null)

const fetchStats = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_URL}/cache/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    stats.value = response.data
  } catch (error) {
    console.error('Error fetching cache stats:', error)
  }
}

const refreshCache = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.post(`${API_URL}/cache/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Cache refreshed successfully')
    fetchStats()
  } catch (error) {
    console.error('Error refreshing cache:', error)
    alert('Failed to refresh cache')
  }
}

const clearAllCache = async () => {
  if (!confirm('Are you sure you want to clear all cache?')) return
  
  try {
    const token = localStorage.getItem('admin_token')
    await axios.delete(`${API_URL}/cache/clear`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Cache cleared successfully')
    fetchStats()
  } catch (error) {
    console.error('Error clearing cache:', error)
    alert('Failed to clear cache')
  }
}

onMounted(() => {
  fetchStats()
  // Auto-refresh stats every 30 seconds
  setInterval(fetchStats, 30000)
})
</script>
