<template>
  <!-- Centering wrapper (doesn't capture taps) -->
  <div class="fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 md:hidden pointer-events-none">
    <nav
      class="flex items-center gap-2 rounded-full bg-card/90 backdrop-blur-md border border-border shadow-card px-3 py-2 transition-all duration-300 will-change-transform"
      :class="isHidden
        ? 'translate-y-[160%] opacity-0 pointer-events-none'
        : 'translate-y-0 opacity-100 pointer-events-auto'"
    >
      <!-- Home (all matches) -->
      <router-link
        to="/"
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="isHomeActive ? 'bg-primary text-white' : 'text-text-muted hover:text-white'"
        aria-label="Home"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />
        </svg>
      </router-link>

      <!-- Channels / TV (center) -->
      <router-link
        to="/channels"
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="isChannelsActive ? 'bg-primary text-white shadow-neon' : 'text-text-muted hover:text-white'"
        aria-label="Channels"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path stroke-linecap="round" d="M8 3l4 4 4-4" />
        </svg>
      </router-link>

      <!-- Upcoming -->
      <router-link
        to="/?tab=upcoming"
        class="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="isUpcomingActive ? 'bg-primary text-white' : 'text-text-muted hover:text-white'"
        aria-label="Upcoming"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isHomeActive = computed(() => route.path === '/' && (!route.query.tab || route.query.tab === 'all' || route.query.tab === 'live'))
const isChannelsActive = computed(() => route.path.startsWith('/channels'))
const isUpcomingActive = computed(() => route.path === '/' && route.query.tab === 'upcoming')

// Auto-hide on scroll down, reveal on scroll up. Always visible in TV mode so the
// remote can reach it, and always visible near the top of the page.
const isHidden = ref(false)
let lastY = 0
const THRESHOLD = 6

const isTvMode = () => document.documentElement.classList.contains('tv')

const onScroll = () => {
  if (isTvMode()) { isHidden.value = false; return }
  const y = window.scrollY || document.documentElement.scrollTop || 0
  if (y < 24) {
    isHidden.value = false
  } else if (y > lastY + THRESHOLD) {
    isHidden.value = true       // scrolling down
  } else if (y < lastY - THRESHOLD) {
    isHidden.value = false      // scrolling up
  }
  lastY = y
}

onMounted(() => {
  lastY = window.scrollY || 0
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>
