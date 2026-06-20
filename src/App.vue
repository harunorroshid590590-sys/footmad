<template>
  <div id="app" class="min-h-screen bg-background">
    <Navbar />
    <AppSidebar v-if="showSidebar" />
    <main
      class="pt-14 pb-20 md:pb-8 transition-[padding]"
      :class="showSidebar ? 'md:pl-[72px]' : ''"
    >
      <router-view />
    </main>
    <BottomNav v-if="showSidebar" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Navbar from './components/Navbar.vue'
import AppSidebar from './components/AppSidebar.vue'
import BottomNav from './components/BottomNav.vue'

const route = useRoute()

// Public surfaces get the sports sidebar + mobile bottom nav; admin keeps its own layout.
const showSidebar = computed(() => !route.path.startsWith('/admin'))
</script>
