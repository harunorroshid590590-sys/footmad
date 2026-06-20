<template>
  <aside
    class="hidden md:flex fixed left-0 top-16 bottom-0 z-40 w-[72px] flex-col items-center
           bg-surface border-r border-border py-4 overflow-y-auto scrollbar-hide"
  >
    <!-- Quick actions -->
    <div class="flex flex-col items-center gap-2 pb-3 mb-3 border-b border-border w-full">
      <button
        v-for="action in actions"
        :key="action.label"
        @click="action.onClick"
        class="group w-11 h-11 rounded-xl flex items-center justify-center text-text-muted hover:text-white hover:bg-card transition-colors"
        :class="action.active ? 'text-accent' : ''"
        :title="action.label"
        :aria-label="action.label"
      >
        <span v-html="action.icon" class="w-5 h-5 [&>svg]:w-5 [&>svg]:h-5"></span>
      </button>
    </div>

    <!-- Sports -->
    <nav class="flex flex-col items-center gap-1.5 w-full">
      <router-link
        v-for="sport in sports"
        :key="sport.name"
        :to="`/category/${sport.slug}`"
        class="group w-full flex flex-col items-center py-2 gap-1 text-text-muted hover:text-white transition-colors"
        :class="{ 'text-white': isActiveSport(sport) }"
        :title="sport.name"
      >
        <span
          class="w-10 h-10 rounded-xl flex items-center justify-center transition-colors [&>svg]:w-5 [&>svg]:h-5"
          :class="isActiveSport(sport) ? 'bg-primary/20 ring-1 ring-primary/40 text-primary-light' : 'bg-card group-hover:bg-card-hover'"
          v-html="sport.icon"
        ></span>
        <span class="text-[10px] leading-tight text-center px-0.5 truncate w-full">{{ sport.short }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

import { SPORTS } from '@/data/sports'
const sports = SPORTS

const actions = [
  {
    label: 'Search',
    active: false,
    onClick: () => router.push('/search'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>',
  },
  {
    label: 'Live',
    active: route.query.tab === 'live',
    onClick: () => router.push('/?tab=live'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/><path stroke-linecap="round" d="M7.8 7.8a6 6 0 000 8.4M16.2 16.2a6 6 0 000-8.4"/></svg>',
  },
  {
    label: 'Channels',
    active: false,
    onClick: () => router.push('/channels'),
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="2"/><path stroke-linecap="round" d="M8 3l4 4 4-4"/></svg>',
  },
]

const isActiveSport = (sport) =>
  route.path.toLowerCase() === `/category/${sport.slug}`
</script>
