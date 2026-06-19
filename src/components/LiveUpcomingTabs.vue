<template>
  <div class="flex items-center space-x-4 px-4 py-3 bg-card/50 border-b border-border">
    <button
      @click="setActiveTab('live')"
      class="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
      :class="activeTab === 'live' 
        ? 'bg-primary text-white shadow-neon' 
        : 'bg-card text-text-muted hover:text-white hover:bg-card-hover'"
    >
      <span>Live</span>
      <span class="bg-primary-dark text-white text-xs px-2 py-0.5 rounded-full">{{ liveCount }}</span>
    </button>
    <button
      @click="setActiveTab('upcoming')"
      class="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
      :class="activeTab === 'upcoming' 
        ? 'bg-primary text-white shadow-neon' 
        : 'bg-card text-text-muted hover:text-white hover:bg-card-hover'"
    >
      <span>Upcoming</span>
      <span class="bg-primary-dark text-white text-xs px-2 py-0.5 rounded-full">{{ upcomingCount }}</span>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  activeTab: {
    type: String,
    default: 'live'
  },
  liveCount: {
    type: Number,
    default: 0
  },
  upcomingCount: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['tab-change'])

const setActiveTab = (tab) => {
  emit('tab-change', tab)
}
</script>
