<template>
  <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="$emit('change', tab.key)"
      class="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
      :class="active === tab.key
        ? 'bg-white text-black'
        : 'bg-card text-text-muted hover:text-white hover:bg-card-hover'"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  active: { type: String, default: 'all' },
})
defineEmits(['change'])

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'news', label: 'News' },
  { key: 'playlists', label: 'Playlists' },
  { key: 'dawah', label: 'Dawah' },
]
</script>
