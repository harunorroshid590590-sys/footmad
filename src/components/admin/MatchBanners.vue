<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
      <h1 class="text-2xl font-bold text-white">Matches</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Search matches..."
        class="w-full sm:w-64 bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
      />
    </div>
    <p class="text-text-muted text-sm mb-6">
      Pin a match to feature it at the top with a PINNED badge. Upload a poster to override the auto-generated card.
    </p>

    <div v-if="loading" class="text-text-muted py-10 text-center">Loading matches...</div>
    <div v-else-if="error" class="text-accent py-10 text-center">{{ error }}</div>
    <div v-else-if="filtered.length === 0" class="text-text-muted py-10 text-center">No matches available.</div>

    <div v-else class="space-y-3">
      <div
        v-for="m in filtered"
        :key="m.id"
        class="flex items-center gap-4 bg-card border border-border rounded-xl p-3"
      >
        <!-- Preview -->
        <div class="w-32 shrink-0 rounded-lg overflow-hidden border border-border">
          <div class="aspect-[16/10]">
            <img v-if="bannerUrl(m)" :src="bannerUrl(m)" alt="" class="w-full h-full object-cover" />
            <MatchPoster v-else :match="m" />
          </div>
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <h3 class="text-white font-semibold truncate">{{ m.homeTeam }} vs {{ m.awayTeam }}</h3>
          <p class="text-text-muted text-xs truncate">{{ m.eventName || m.category }}</p>
          <p class="mt-1 flex items-center gap-1.5">
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              :class="m.banner ? 'bg-primary/20 text-primary-light' : 'bg-surface text-text-muted'"
            >
              {{ m.banner ? 'Custom banner' : 'Generated' }}
            </span>
            <span v-if="m.isPinned" class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">🔥 PINNED</span>
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 shrink-0">
          <button
            @click="togglePin(m)"
            :disabled="busyId === m.id"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            :class="m.isPinned
              ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
              : 'border border-border text-text-muted hover:text-white'"
          >
            {{ m.isPinned ? '🔥 Pinned' : 'Pin' }}
          </button>
          <input :ref="el => setFileRef(m.id, el)" type="file" accept="image/*" class="hidden" @change="(e) => onFile(m, e)" />
          <button
            @click="triggerUpload(m.id)"
            :disabled="busyId === m.id"
            class="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-dark text-white text-sm transition-colors disabled:opacity-50"
          >
            {{ busyId === m.id ? 'Uploading...' : 'Upload' }}
          </button>
          <button
            v-if="m.banner"
            @click="revert(m)"
            :disabled="busyId === m.id"
            class="px-3 py-1.5 rounded-lg border border-border text-text-muted hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            Revert
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'
import { resolveAsset } from '@/utils/assets'
import MatchPoster from '@/components/MatchPoster.vue'

const matches = ref([])
const loading = ref(true)
const error = ref(null)
const search = ref('')
const busyId = ref(null)
const fileRefs = {}

const setFileRef = (id, el) => { if (el) fileRefs[id] = el }
const triggerUpload = (id) => fileRefs[id]?.click()

const bannerUrl = (m) => resolveAsset(m.banner)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return matches.value
  // Support "Team A vs Team B" queries by matching all parts.
  const terms = q.split(/\s+vs?\s+/).map(t => t.trim()).filter(Boolean)
  return matches.value.filter((m) => {
    const hay = `${m.homeTeam} ${m.awayTeam} ${m.eventName || ''} ${m.category || ''}`.toLowerCase()
    if (hay.includes(q)) return true
    if (terms.length > 1) return terms.every(term => hay.includes(term))
    return false
  })
})

const fetchMatches = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await api.get('/matches')
    matches.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to load matches'
  } finally {
    loading.value = false
  }
}

const onFile = async (m, e) => {
  const file = e.target.files?.[0]
  if (!file) return
  busyId.value = m.id
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { data } = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    await api.post('/admin/overrides', { matchId: String(m.id), banner: data.url })
    m.banner = data.url
  } catch (err) {
    alert(err.response?.data?.message || 'Upload failed')
  } finally {
    busyId.value = null
    if (fileRefs[m.id]) fileRefs[m.id].value = ''
  }
}

const revert = async (m) => {
  busyId.value = m.id
  try {
    await api.delete(`/admin/overrides/${m.id}`)
    m.banner = ''
    m.isPinned = false
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to revert')
  } finally {
    busyId.value = null
  }
}

const togglePin = async (m) => {
  busyId.value = m.id
  try {
    const next = !m.isPinned
    await api.post('/admin/overrides', { matchId: String(m.id), pinned: next })
    m.isPinned = next
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to update pin')
  } finally {
    busyId.value = null
  }
}

onMounted(fetchMatches)
</script>
