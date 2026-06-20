<template>
  <div class="min-h-screen bg-background">
    <TickerStrip />

    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 pt-0 pb-2">
      <AdRenderer />

      <ContentTabs :active="activeTab" @change="setTab" />

      <!-- Mobile-only sports scroller (desktop has the sidebar) -->
      <MobileSportsBar />

      <!-- Loading -->
      <div v-if="matchesStore.loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCardSkeleton v-for="i in 8" :key="i" />
      </div>

      <!-- Error -->
      <div v-else-if="matchesStore.error" class="text-center py-20">
        <p class="text-text-muted mb-4">{{ matchesStore.error }}</p>
        <button @click="matchesStore.fetchMatches()" class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors">
          Retry
        </button>
      </div>

      <!-- Empty -->
      <div v-else-if="matchesToShow.length === 0" class="text-center py-20 text-text-muted">
        <p>{{ emptyLabel }}</p>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        <MatchCard v-for="m in matchesToShow" :key="m.id" :match="m" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import TickerStrip from '@/components/TickerStrip.vue'
import ContentTabs from '@/components/ContentTabs.vue'
import MobileSportsBar from '@/components/MobileSportsBar.vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import AdRenderer from '@/components/AdRenderer.vue'
import { filterByTab, sortByPriority, emptyLabelFor } from '@/utils/matchStatus'

const route = useRoute()
const router = useRouter()
const matchesStore = useMatchesStore()

const validTabs = ['all', 'live', 'upcoming', 'ended']
const activeTab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'all')

const matchesToShow = computed(() =>
  sortByPriority(filterByTab(matchesStore.matches, activeTab.value))
)

const emptyLabel = computed(() => emptyLabelFor(activeTab.value))

const setTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: tab === 'all' ? {} : { tab } })
}

watch(() => route.query.tab, (tab) => {
  activeTab.value = validTabs.includes(tab) ? tab : 'all'
})

onMounted(() => {
  matchesStore.fetchMatches()
})
</script>
