<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border md:hidden">
    <div class="flex items-center justify-center gap-12 h-16">
      <!-- Live / Broadcast -->
      <router-link
        to="/?tab=live"
        class="flex flex-col items-center justify-center transition-colors"
        :class="isLiveActive ? 'text-accent' : 'text-text-muted'"
        aria-label="Live"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
          <path stroke-linecap="round" d="M7.8 7.8a6 6 0 000 8.4M16.2 16.2a6 6 0 000-8.4M5 5a9.5 9.5 0 000 14M19 5a9.5 9.5 0 010 14" />
        </svg>
      </router-link>

      <!-- Channels / TV (center) -->
      <router-link
        to="/channels"
        class="flex items-center justify-center -mt-1"
        aria-label="Channels"
      >
        <span
          class="w-12 h-12 rounded-xl flex items-center justify-center border transition-colors"
          :class="isChannelsActive
            ? 'bg-primary border-primary text-white shadow-neon'
            : 'bg-card border-border text-text-muted'"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <rect x="3" y="7" width="18" height="13" rx="2" />
            <path stroke-linecap="round" d="M8 3l4 4 4-4" />
          </svg>
        </span>
      </router-link>

      <!-- Playlists -->
      <router-link
        to="/?tab=playlists"
        class="flex flex-col items-center justify-center transition-colors"
        :class="isPlaylistsActive ? 'text-primary-light' : 'text-text-muted'"
        aria-label="Playlists"
      >
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h11M4 12h11M4 18h7M17 10v8a2 2 0 11-2-2h2z" />
        </svg>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isLiveActive = computed(() => route.path === '/' && route.query.tab === 'live')
const isChannelsActive = computed(() => route.path.startsWith('/channels'))
const isPlaylistsActive = computed(() => route.path === '/' && route.query.tab === 'playlists')
</script>
