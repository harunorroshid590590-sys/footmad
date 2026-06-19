<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
    <div class="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- ===== Desktop ===== -->
      <div class="hidden md:flex items-center justify-between h-16">
        <!-- Brand -->
        <router-link to="/" class="flex items-center space-x-2 shrink-0">
          <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-neon">
            <span class="text-white font-extrabold text-lg">F</span>
          </div>
          <span class="text-white font-extrabold text-xl tracking-tight">FootMad</span>
        </router-link>

        <!-- Center nav -->
        <div class="flex items-center space-x-1">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            :class="isActive(link)
              ? 'text-white bg-card-hover'
              : 'text-text-muted hover:text-white hover:bg-card'"
          >
            {{ link.label }}
          </router-link>
        </div>

        <!-- Right: search + telegram -->
        <div class="flex items-center space-x-3 shrink-0">
          <div class="relative">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search matches..."
              class="bg-card border border-border rounded-lg pl-4 pr-9 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary w-52"
              @keyup.enter="handleSearch"
            />
            <svg class="w-4 h-4 absolute right-3 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <a
            href="https://t.me/footmad"
            target="_blank"
            rel="noopener"
            class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z"/>
            </svg>
            <span>Telegram</span>
          </a>
        </div>
      </div>

      <!-- ===== Mobile header: ☰ · FootMad · 🔍 ===== -->
      <div class="md:hidden flex items-center justify-between h-14">
        <button @click="toggleMobileMenu" class="text-white p-2 -ml-2" aria-label="Menu">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <router-link to="/" class="text-white font-extrabold text-xl tracking-tight">FootMad</router-link>
        <button @click="showMobileSearch = !showMobileSearch" class="text-white p-2 -mr-2" aria-label="Search">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- Mobile search bar (toggles) -->
      <div v-if="showMobileSearch" class="md:hidden pb-3">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search matches..."
          class="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Mobile slide-down menu -->
    <div v-if="mobileMenuOpen" class="md:hidden glass-strong border-t border-border">
      <div class="px-4 py-3 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block text-text-muted hover:text-white hover:bg-card transition-colors py-2.5 px-3 rounded-lg"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </router-link>
        <router-link
          to="/favorites"
          class="block text-text-muted hover:text-white hover:bg-card transition-colors py-2.5 px-3 rounded-lg"
          @click="closeMobileMenu"
        >
          Favorites
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useRouter, useRoute } from 'vue-router'

const uiStore = useUIStore()
const router = useRouter()
const route = useRoute()

const searchQuery = ref('')
const showMobileSearch = ref(false)

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Live', to: '/?tab=live' },
  { label: 'All Channels', to: '/channels' },
  { label: 'All Sports', to: '/sports' },
  { label: 'Leagues', to: '/leagues' },
]

const mobileMenuOpen = computed(() => uiStore.mobileMenuOpen)

const isActive = (link) => {
  if (link.to === '/') return route.path === '/' && !route.query.tab
  if (link.to.startsWith('/?')) return route.path === '/' && route.query.tab === 'live'
  return route.path.startsWith(link.to)
}

const toggleMobileMenu = () => uiStore.toggleMobileMenu()
const closeMobileMenu = () => uiStore.closeMobileMenu()

const handleSearch = () => {
  const query = searchQuery.value.trim()
  if (query) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    showMobileSearch.value = false
    closeMobileMenu()
  }
}
</script>
