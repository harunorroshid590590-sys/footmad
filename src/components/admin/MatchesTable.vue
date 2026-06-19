<template>
  <div class="bg-card rounded-xl neon-border overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-card-hover">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Match</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">League</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Streams</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="match in matches" :key="match._id" class="hover:bg-card-hover transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-white">{{ match.homeTeam?.name }} vs {{ match.awayTeam?.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.league }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.category }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :class="match.status === 'live' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'"
              >
                {{ match.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ formatTime(match.time) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.streams?.length || 0 }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="$emit('edit', match)"
                class="text-primary hover:text-primary-light mr-4"
              >
                Edit
              </button>
              <button
                @click="$emit('delete', match._id)"
                class="text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const emit = defineEmits(['edit', 'delete'])

const matches = ref([])
const loading = ref(false)

const fetchMatches = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/matches')
    matches.value = response.data
  } catch (err) {
    console.error('Failed to fetch matches:', err)
  } finally {
    loading.value = false
  }
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchMatches()
})

defineExpose({ fetchMatches })
</script>
