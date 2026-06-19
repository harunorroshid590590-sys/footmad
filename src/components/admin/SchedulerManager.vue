<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-white">Scheduler</h2>
      <button
        @click="showModal = true"
        class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
      >
        Add Task
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="scheduler in schedulers"
        :key="scheduler._id"
        class="bg-card rounded-xl border border-border p-4 hover:border-primary transition-colors"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-semibold px-2 py-1 rounded" :class="getStatusClass(scheduler.status)">
            {{ scheduler.status.toUpperCase() }}
          </span>
          <div class="flex items-center space-x-2">
            <button
              @click="runTask(scheduler)"
              class="text-text-muted hover:text-white transition-colors"
              title="Run Now"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              @click="toggleScheduler(scheduler)"
              class="text-text-muted hover:text-white transition-colors"
              title="Toggle"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M24 12l-8-4v8z" />
              </svg>
            </button>
          </div>
        </div>

        <h3 class="text-white font-semibold mb-2">{{ scheduler.name }}</h3>
        <p class="text-text-muted text-sm mb-2">Type: {{ scheduler.type }}</p>
        <p class="text-text-muted text-sm mb-2">Interval: {{ scheduler.interval }} min</p>
        
        <div class="flex items-center justify-between mt-3 pt-3 border-t border-border text-xs text-text-muted">
          <span>Runs: {{ scheduler.runCount }}</span>
          <span>Success: {{ scheduler.successCount }}</span>
          <span>Failed: {{ scheduler.failureCount }}</span>
        </div>

        <div v-if="scheduler.lastError" class="mt-2 text-xs text-red-500">
          Error: {{ scheduler.lastError }}
        </div>

        <div class="mt-2 text-xs text-text-muted">
          Next run: {{ scheduler.nextRun ? new Date(scheduler.nextRun).toLocaleString() : 'N/A' }}
        </div>
      </div>
    </div>

    <!-- Task Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-xl border border-border w-full max-w-md">
        <div class="p-6">
          <h3 class="text-xl font-bold text-white mb-6">Add Scheduled Task</h3>
          
          <form @submit.prevent="saveTask" class="space-y-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Task Name</label>
              <input
                v-model="formData.name"
                type="text"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">Task Type</label>
              <select
                v-model="formData.type"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                required
              >
                <option value="api-sync">API Sync</option>
                <option value="cache-cleanup">Cache Cleanup</option>
                <option value="stats-update">Stats Update</option>
              </select>
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">Interval (minutes)</label>
              <input
                v-model.number="formData.interval"
                type="number"
                min="1"
                class="w-full bg-card-hover border border-border rounded-lg px-4 py-2 text-white focus:border-primary focus:outline-none"
                required
              />
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
                Create
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

const schedulers = ref([])
const showModal = ref(false)
const formData = ref({
  name: '',
  type: 'api-sync',
  interval: 5,
  active: true
})

const fetchSchedulers = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    const response = await axios.get(`${API_URL}/scheduler`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    schedulers.value = response.data
  } catch (error) {
    console.error('Error fetching schedulers:', error)
  }
}

const saveTask = async () => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.post(`${API_URL}/scheduler`, formData.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    closeModal()
    fetchSchedulers()
  } catch (error) {
    console.error('Error saving task:', error)
  }
}

const runTask = async (scheduler) => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.post(`${API_URL}/scheduler/${scheduler._id}/run`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    alert('Task executed successfully')
    fetchSchedulers()
  } catch (error) {
    console.error('Error running task:', error)
    alert('Failed to run task')
  }
}

const toggleScheduler = async (scheduler) => {
  try {
    const token = localStorage.getItem('admin_token')
    await axios.patch(`${API_URL}/scheduler/${scheduler._id}/toggle`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    fetchSchedulers()
  } catch (error) {
    console.error('Error toggling scheduler:', error)
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'running':
      return 'bg-blue-500/20 text-blue-500'
    case 'completed':
      return 'bg-green-500/20 text-green-500'
    case 'failed':
      return 'bg-red-500/20 text-red-500'
    default:
      return 'bg-gray-500/20 text-gray-500'
  }
}

const closeModal = () => {
  showModal.value = false
  formData.value = {
    name: '',
    type: 'api-sync',
    interval: 5,
    active: true
  }
}

onMounted(() => {
  fetchSchedulers()
  // Auto-refresh every 10 seconds
  setInterval(fetchSchedulers, 10000)
})
</script>
