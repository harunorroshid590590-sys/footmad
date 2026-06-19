<template>
  <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-6">
    <div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-white">All Channels</h1>
        <p class="text-text-muted text-sm mt-1">Premium live sports channels, optimized for every screen.</p>
      </div>
      <div class="relative w-full sm:w-72">
        <input
          v-model="search"
          type="text"
          placeholder="Search channels..."
          class="w-full bg-card border border-border rounded-lg pl-4 pr-9 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
        />
        <svg class="w-4 h-4 absolute right-3 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && channels.length === 0">
      <!-- mobile circles -->
      <div class="grid grid-cols-4 sm:grid-cols-5 gap-x-3 gap-y-5 md:hidden">
        <div v-for="i in 16" :key="i" class="flex flex-col items-center gap-2 animate-pulse">
          <div class="w-16 h-16 rounded-full bg-card-hover"></div>
          <div class="h-3 w-12 bg-card-hover rounded"></div>
        </div>
      </div>
      <!-- desktop cards -->
      <div class="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-3">
        <div v-for="i in 18" :key="i" class="rounded-xl bg-card border border-border p-4 pt-7 h-36 animate-pulse"></div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="text-center py-20 text-text-muted">
      <p>{{ search ? 'No channels match your search.' : 'No channels available yet.' }}</p>
    </div>

    <!-- Grid -->
    <template v-else>
      <!-- Mobile: circular tiles -->
      <div class="grid grid-cols-4 sm:grid-cols-5 gap-x-3 gap-y-5 md:hidden">
        <ChannelCard v-for="c in filtered" :key="`m-${c._id || c.id}`" :channel="c" variant="circle" />
      </div>
      <!-- Desktop: rich cards -->
      <div class="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-3">
        <ChannelCard v-for="c in filtered" :key="`d-${c._id || c.id}`" :channel="c" variant="card" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useChannelsStore } from '@/stores/channels'
import ChannelCard from '@/components/ChannelCard.vue'

const store = useChannelsStore()
const search = ref('')

const channels = computed(() => store.getSection('channel'))

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return channels.value
  return channels.value.filter((c) => (c.name || '').toLowerCase().includes(q))
})

onMounted(() => store.fetchSection('channel'))
</script>
