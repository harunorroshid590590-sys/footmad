<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border md:hidden">
    <div class="flex items-center justify-around h-16">
      <router-link
        to="/"
        class="flex flex-col items-center justify-center space-y-1 px-4 py-2 transition-colors"
        :class="isActive('/') ? 'text-primary' : 'text-text-muted'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span class="text-xs">Home</span>
      </router-link>

      <router-link
        to="/#live"
        class="flex flex-col items-center justify-center space-y-1 px-4 py-2 transition-colors"
        :class="isActive('/#live') ? 'text-primary' : 'text-text-muted'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">Live</span>
      </router-link>

      <router-link
        to="/category/all"
        class="flex flex-col items-center justify-center space-y-1 px-4 py-2 transition-colors"
        :class="isActive('/category') ? 'text-primary' : 'text-text-muted'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs">Sports</span>
      </router-link>

      <router-link
        to="/#upcoming"
        class="flex flex-col items-center justify-center space-y-1 px-4 py-2 transition-colors"
        :class="isActive('/#upcoming') ? 'text-primary' : 'text-text-muted'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span class="text-xs">Upcoming</span>
      </router-link>

      <router-link
        to="/favorites"
        class="flex flex-col items-center justify-center space-y-1 px-4 py-2 transition-colors"
        :class="isActive('/favorites') ? 'text-primary' : 'text-text-muted'"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span class="text-xs">Me</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const isActive = (path) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>
