<template>
  <div id="app" class="min-h-screen bg-background">
    <Navbar />
    <main class="pt-16 pb-20 md:pb-0">
      <router-view />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import BottomNav from './components/BottomNav.vue'
</script>
