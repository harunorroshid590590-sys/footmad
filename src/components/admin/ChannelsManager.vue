<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <h1 class="text-2xl font-bold text-white">Channels</h1>
      <div class="flex items-center gap-2">
        <select v-model="sectionFilter" class="bg-card border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary">
          <option value="">All sections</option>
          <option value="channel">Channels</option>
          <option value="news">News</option>
          <option value="playlist">Playlists</option>
          <option value="dawah">Dawah</option>
        </select>
        <button @click="openAdd" class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">Add Channel</button>
      </div>
    </div>

    <div v-if="loading" class="text-text-muted py-10 text-center">Loading channels...</div>
    <div v-else-if="error" class="text-accent py-10 text-center">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="text-text-muted py-10 text-center">No channels found.</div>

    <div v-else class="overflow-x-auto rounded-xl border border-border">
      <table class="w-full text-sm">
        <thead class="bg-card text-text-muted">
          <tr>
            <th class="text-left font-medium px-4 py-3">Channel</th>
            <th class="text-left font-medium px-4 py-3 hidden sm:table-cell">Section</th>
            <th class="text-left font-medium px-4 py-3 hidden md:table-cell">Servers</th>
            <th class="text-left font-medium px-4 py-3 hidden md:table-cell">Quality</th>
            <th class="text-left font-medium px-4 py-3">Active</th>
            <th class="text-right font-medium px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c._id" class="border-t border-border hover:bg-card/50">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-lg overflow-hidden bg-surface border border-border flex items-center justify-center shrink-0">
                  <img v-if="resolveAsset(c.logo)" :src="resolveAsset(c.logo)" alt="" class="w-full h-full object-cover" />
                  <span v-else class="text-[10px] text-text-muted">{{ c.name?.slice(0,2).toUpperCase() }}</span>
                </div>
                <span class="text-white font-medium">{{ c.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 hidden sm:table-cell text-text-muted capitalize">{{ c.section }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-text-muted">{{ c.serversCount ?? c.servers?.length ?? 0 }}</td>
            <td class="px-4 py-3 hidden md:table-cell text-text-muted">{{ c.quality }}</td>
            <td class="px-4 py-3">
              <button @click="toggleActive(c)" class="w-11 h-6 rounded-full transition-colors" :class="c.active ? 'bg-primary' : 'bg-card-hover'">
                <span class="block w-4 h-4 rounded-full bg-white transition-transform" :class="c.active ? 'translate-x-6' : 'translate-x-1'"></span>
              </button>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center justify-end gap-2">
                <button @click="openEdit(c)" class="text-primary-light hover:underline">Edit</button>
                <button @click="remove(c)" class="text-accent hover:underline">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ChannelModal v-if="showModal" :channel="editing" @close="closeModal" @save="save" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'
import { resolveAsset } from '@/utils/assets'
import ChannelModal from './ChannelModal.vue'

const channels = ref([])
const loading = ref(true)
const error = ref(null)
const sectionFilter = ref('')
const showModal = ref(false)
const editing = ref(null)

const filtered = computed(() => {
  if (!sectionFilter.value) return channels.value
  return channels.value.filter((c) => c.section === sectionFilter.value)
})

const fetchChannels = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/channels', { params: { all: 1 } })
    channels.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load channels'
  } finally {
    loading.value = false
  }
}

const openAdd = () => { editing.value = null; showModal.value = true }
const openEdit = (c) => { editing.value = c; showModal.value = true }
const closeModal = () => { showModal.value = false; editing.value = null }

const save = async (payload) => {
  try {
    if (editing.value?._id) {
      await api.put(`/channels/${editing.value._id}`, payload)
    } else {
      await api.post('/channels', payload)
    }
    closeModal()
    fetchChannels()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to save channel')
  }
}

const remove = async (c) => {
  if (!confirm(`Delete "${c.name}"?`)) return
  try {
    await api.delete(`/channels/${c._id}`)
    fetchChannels()
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to delete channel')
  }
}

const toggleActive = async (c) => {
  try {
    await api.patch(`/channels/${c._id}/toggle`)
    c.active = !c.active
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to toggle channel')
  }
}

onMounted(fetchChannels)
</script>
