<template>
  <div class="absolute inset-0 z-30 flex flex-col items-center justify-center text-center bg-black/90 backdrop-blur-sm px-5 py-6">
    <!-- Connecting -->
    <template v-if="state === 'connecting'">
      <div class="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-white text-sm font-medium">
        Connecting<span v-if="serverName"> to {{ serverName }}</span>…
      </p>
    </template>

    <!-- Error -->
    <template v-else>
      <div class="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center mb-3">
        <svg class="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M10.34 3.94L1.7 18a1.5 1.5 0 001.3 2.25h18a1.5 1.5 0 001.3-2.25L13.66 3.94a1.5 1.5 0 00-2.6 0z" />
        </svg>
      </div>
      <h3 class="text-white text-base sm:text-lg font-semibold">Stream unavailable</h3>
      <p class="text-text-muted text-xs sm:text-sm max-w-[18rem] mt-1">{{ message }}</p>
      <p v-if="serverName" class="text-text-muted/60 text-[11px] mt-1 truncate max-w-[16rem]">Server: {{ serverName }}</p>

      <div class="flex items-center gap-2 mt-4">
        <button
          @click="$emit('retry')"
          class="bg-primary hover:bg-primary-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
        <button
          v-if="hasNext"
          @click="$emit('next')"
          class="border border-border text-text-muted hover:text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Try next server
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  state: { type: String, default: 'error' }, // 'error' | 'connecting'
  message: { type: String, default: 'This stream is currently unavailable.' },
  serverName: { type: String, default: '' },
  hasNext: { type: Boolean, default: false },
})
defineEmits(['retry', 'next'])
</script>
