<template>
  <div class="flex items-center gap-2 overflow-x-auto scrollbar-hide pt-2 pb-2">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      @click="$emit('change', tab.key)"
      class="px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
      :class="active === tab.key
        ? 'bg-white text-black'
        : 'bg-card text-text-muted hover:text-white hover:bg-card-hover'"
    >
      {{ tab.label }}<span v-if="counts" class="opacity-70"> ({{ counts[tab.key] ?? 0 }})</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  active: { type: String, default: 'all' },
  counts: { type: Object, default: null }, // { all, live, upcoming, ended }
})
defineEmits(['change'])

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'live', label: 'Live' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'ended', label: 'Ended' },
]
</script>
