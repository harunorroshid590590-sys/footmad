<template>
  <div class="min-h-screen bg-background">
    <TickerStrip />

    <div class="max-w-screen-2xl mx-auto px-3 sm:px-4 py-2">
      <AdRenderer />

      <ContentTabs :active="activeTab" @change="setTab" />

      <!-- ===== Match tabs (All / Live) ===== -->
      <template v-if="isMatchTab">
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
          <p>{{ activeTab === 'live' ? 'No live matches right now.' : 'No matches available.' }}</p>
        </div>

        <!-- Grid -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          <MatchCard v-for="m in matchesToShow" :key="m.id" :match="m" />
        </div>
      </template>

      <!-- ===== Section tabs (News / Playlists / Dawah) ===== -->
      <template v-else>
        <div v-if="channelsStore.loading" class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 pt-2">
          <div v-for="i in 12" :key="i" class="flex flex-col items-center gap-2 animate-pulse">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-card-hover"></div>
            <div class="h-3 w-12 bg-card-hover rounded"></div>
          </div>
        </div>

        <div v-else-if="sectionItems.length === 0" class="text-center py-20 text-text-muted">
          <p>No {{ activeTab }} yet.</p>
          <p class="text-xs mt-1 opacity-70">Items added from the admin panel will appear here.</p>
        </div>

        <div v-else class="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4 pt-2">
          <ChannelCard v-for="c in sectionItems" :key="c._id || c.id" :channel="c" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMatchesStore } from '@/stores/matches'
import { useChannelsStore } from '@/stores/channels'
import TickerStrip from '@/components/TickerStrip.vue'
import ContentTabs from '@/components/ContentTabs.vue'
import MatchCard from '@/components/MatchCard.vue'
import MatchCardSkeleton from '@/components/MatchCardSkeleton.vue'
import ChannelCard from '@/components/ChannelCard.vue'
import AdRenderer from '@/components/AdRenderer.vue'

const route = useRoute()
const router = useRouter()
const matchesStore = useMatchesStore()
const channelsStore = useChannelsStore()

// Tab keys map to channel "section" values for the collection tabs.
const SECTION_KEY = { news: 'news', playlists: 'playlist', dawah: 'dawah' }

const validTabs = ['all', 'live', 'news', 'playlists', 'dawah']
const activeTab = ref(validTabs.includes(route.query.tab) ? route.query.tab : 'all')

const isMatchTab = computed(() => activeTab.value === 'all' || activeTab.value === 'live')

const matchesToShow = computed(() => {
  if (activeTab.value === 'live') return matchesStore.liveMatches
  // "All" — live first, then upcoming.
  return [...matchesStore.liveMatches, ...matchesStore.upcomingMatches]
})

const sectionItems = computed(() =>
  channelsStore.getSection(SECTION_KEY[activeTab.value] || 'news')
)

const ensureSection = (tab) => {
  const key = SECTION_KEY[tab]
  if (key) channelsStore.fetchSection(key)
}

const setTab = (tab) => {
  activeTab.value = tab
  router.replace({ query: tab === 'all' ? {} : { tab } })
  ensureSection(tab)
}

// Keep tab in sync when navigating here via ?tab= links (navbar / bottom nav).
watch(() => route.query.tab, (tab) => {
  const next = validTabs.includes(tab) ? tab : 'all'
  if (next !== activeTab.value) {
    activeTab.value = next
    ensureSection(next)
  }
})

onMounted(() => {
  matchesStore.fetchMatches()
  ensureSection(activeTab.value)
})
</script>
