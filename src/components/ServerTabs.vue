<template>
  <div v-if="servers.length" class="flex items-center gap-1.5">
    <!-- Left arrow -->
    <button
      @click="scroll(-1)"
      class="shrink-0 w-8 h-8 rounded-lg bg-card border border-border text-text-muted hover:text-white hover:border-primary/40 hidden md:flex items-center justify-center transition-colors"
      aria-label="Scroll left"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
    </button>

    <!-- Scrollable servers -->
    <div ref="scroller" class="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1 scroll-smooth">
      <button
        v-for="(server, index) in servers"
        :key="server.id ?? index"
        @click="$emit('select', index)"
        class="flex items-center gap-2 shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
        :class="index === current
          ? 'bg-card border-primary text-white'
          : 'bg-card border-border text-text-muted hover:text-white hover:border-primary/40'"
      >
        <svg v-if="index === current" class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        <span class="truncate max-w-[160px]">{{ server.title || `Server ${index + 1}` }}</span>
        <span class="text-[10px] uppercase opacity-70">{{ typeLabel(server.type) }}</span>
      </button>
    </div>

    <!-- Right arrow -->
    <button
      @click="scroll(1)"
      class="shrink-0 w-8 h-8 rounded-lg bg-card border border-border text-text-muted hover:text-white hover:border-primary/40 hidden md:flex items-center justify-center transition-colors"
      aria-label="Scroll right"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  servers: { type: Array, default: () => [] },
  current: { type: Number, default: 0 },
})
defineEmits(['select'])

// HLS (.m3u8) plays natively on iOS/Safari, so label those "iOS" for iPhone users.
const typeLabel = (type) => {
  const t = String(type || '').toLowerCase()
  if (t === 'hls') return 'iOS'
  return String(type || '').toUpperCase()
}

const scroller = ref(null)
const scroll = (dir) => {
  scroller.value?.scrollBy({ left: dir * 280, behavior: 'smooth' })
}
</script>
