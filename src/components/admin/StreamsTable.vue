<template>
  <div class="bg-card rounded-xl neon-border overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-card-hover">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Quality</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">DRM</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="stream in streams" :key="stream._id" class="hover:bg-card-hover transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-white">{{ stream.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ stream.type }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ stream.quality }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ stream.drm ? stream.drm.type : 'None' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-medium rounded"
                :class="stream.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'"
              >
                {{ stream.active ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="$emit('edit', stream)"
                class="text-primary hover:text-primary-light mr-4"
              >
                Edit
              </button>
              <button
                @click="$emit('delete', stream._id)"
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

const streams = ref([])
const loading = ref(false)

const fetchStreams = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/admin/streams')
    streams.value = response.data
  } catch (err) {
    console.error('Failed to fetch streams:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStreams()
})

defineExpose({ fetchStreams })
</script>
