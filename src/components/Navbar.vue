<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-xl">F</span>
            </div>
            <span class="text-white font-bold text-xl hidden sm:block">FOOTFY</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/" 
            class="text-text-muted hover:text-white transition-colors"
            :class="{ 'text-primary': $route.path === '/' }"
          >
            Home
          </router-link>
          <a 
            href="#live" 
            class="text-text-muted hover:text-white transition-colors"
          >
            Live
          </a>
          <a 
            href="#upcoming" 
            class="text-text-muted hover:text-white transition-colors"
          >
            Upcoming
          </a>
          <router-link 
            to="/category/all" 
            class="text-text-muted hover:text-white transition-colors"
          >
            Sports
          </router-link>
        </div>

        <!-- Desktop Right Side -->
        <div class="hidden md:flex items-center space-x-4">
          <div class="relative">
            <input
              type="text"
              placeholder="Search matches..."
              class="bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary w-48"
              @keyup.enter="handleSearch"
            />
            <svg class="w-4 h-4 absolute right-3 top-2.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <a
            href="https://t.me/footfy"
            target="_blank"
            class="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.828.94z"/>
            </svg>
            <span>Telegram</span>
          </a>
        </div>

        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden text-white p-2"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden glass-strong border-t border-border"
    >
      <div class="px-4 py-3 space-y-3">
        <router-link
          to="/"
          class="block text-text-muted hover:text-white transition-colors py-2"
          @click="closeMobileMenu"
        >
          Home
        </router-link>
        <a
          href="#live"
          class="block text-text-muted hover:text-white transition-colors py-2"
          @click="closeMobileMenu"
        >
          Live
        </a>
        <a
          href="#upcoming"
          class="block text-text-muted hover:text-white transition-colors py-2"
          @click="closeMobileMenu"
        >
          Upcoming
        </a>
        <router-link
          to="/category/all"
          class="block text-text-muted hover:text-white transition-colors py-2"
          @click="closeMobileMenu"
        >
          Sports
        </router-link>
        <router-link
          to="/favorites"
          class="block text-text-muted hover:text-white transition-colors py-2"
          @click="closeMobileMenu"
        >
          Favorites
        </router-link>
        <div class="pt-3 border-t border-border">
          <input
            type="text"
            placeholder="Search matches..."
            class="w-full bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
            @keyup.enter="handleSearch"
          />
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useUIStore } from '@/stores/ui'
import { useRouter } from 'vue-router'

const uiStore = useUIStore()
const router = useRouter()

const mobileMenuOpen = computed(() => uiStore.mobileMenuOpen)

const toggleMobileMenu = () => {
  uiStore.toggleMobileMenu()
}

const closeMobileMenu = () => {
  uiStore.closeMobileMenu()
}

const handleSearch = (e) => {
  const query = e.target.value
  if (query) {
    router.push(`/search?q=${encodeURIComponent(query)}`)
    closeMobileMenu()
  }
}
</script>
