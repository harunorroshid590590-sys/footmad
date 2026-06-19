<template>
  <div class="mt-4">
    <h3 class="text-white font-semibold mb-3 flex items-center space-x-2">
      <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7" />
      </svg>
      <span>SERVERS ({{ streams.length }})</span>
    </h3>
    
    <div 
      class="flex items-center space-x-3 overflow-x-auto pb-2 scrollbar-hide"
      @wheel="handleWheel"
    >
      <button
        v-for="(stream, index) in streams"
        :key="index"
        @click="selectServer(stream)"
        class="flex-shrink-0 bg-card border rounded-xl p-4 min-w-[200px] transition-all duration-300 hover:scale-105"
        :class="selectedStream?.url === stream.url 
          ? 'border-primary shadow-neon' 
          : 'border-border hover:border-primary/50'"
      >
        <div class="flex items-center justify-between mb-2">
          <span
            v-if="stream.isLive"
            class="live-badge flex items-center space-x-1 text-xs"
          >
            <span class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            <span>LIVE</span>
          </span>
          <div class="flex items-center space-x-2">
            <!-- DRM Icon -->
            <svg
              v-if="stream.drm"
              class="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              title="DRM Protected"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <!-- HLS Icon -->
            <svg
              v-if="isHLS(stream.url)"
              class="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              title="HLS Stream"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <!-- DASH Icon -->
            <svg
              v-if="isDASH(stream.url)"
              class="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              title="DASH Stream"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        </div>
        
        <h4 class="text-white font-semibold text-sm mb-1">{{ stream.name }}</h4>
        
        <div class="flex items-center space-x-2">
          <span class="text-text-muted text-xs">{{ getStreamType(stream.url) }}</span>
          <span class="text-text-muted text-xs">•</span>
          <span class="text-text-muted text-xs">{{ stream.quality || 'HD' }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  streams: {
    type: Array,
    required: true
  },
  initialStream: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['server-selected'])

const selectedStream = ref(props.initialStream || (props.streams.length > 0 ? props.streams[0] : null))

const selectServer = (stream) => {
  selectedStream.value = stream
  emit('server-selected', stream)
}

const isHLS = (url) => {
  return url.includes('.m3u8') || url.includes('hls')
}

const isDASH = (url) => {
  return url.includes('.mpd') || url.includes('dash')
}

const getStreamType = (url) => {
  if (url.includes('.m3u8')) return 'HLS'
  if (url.includes('.mpd')) return 'DASH'
  if (url.includes('.ts')) return 'TS'
  return 'STREAM'
}

const handleWheel = (e) => {
  if (e.deltaY !== 0) {
    e.currentTarget.scrollLeft += e.deltaY
  }
}

// Watch for prop changes
watch(() => props.initialStream, (newStream) => {
  if (newStream) {
    selectedStream.value = newStream
  }
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
