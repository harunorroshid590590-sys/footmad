<template>
  <div>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
      <h1 class="text-2xl font-bold text-white">Match Banners</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Search matches..."
        class="w-full sm:w-64 bg-card border border-border rounded-lg px-4 py-2 text-sm text-white placeholder-text-muted focus:outline-none focus:border-primary"
      />
    </div>
    <p class="text-text-muted text-sm mb-6">
      Upload a designed poster to override the auto-generated card. Leave empty to use the generated poster.
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
          <p class="mt-1">
            <span
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              :class="m.banner ? 'bg-primary/20 text-primary-light' : 'bg-surface text-text-muted'"
            >
              {{ m.banner ? 'Custom banner' : 'Generated' }}
            </span>
          </p>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-2 shrink-0">
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
  return matches.value.filter((m) =>
    `${m.homeTeam} ${m.awayTeam} ${m.eventName || ''}`.toLowerCase().includes(q)
  )
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
  } catch (err) {
    alert(err.response?.data?.message || 'Failed to revert')
  } finally {
    busyId.value = null
  }
}

onMounted(fetchMatches)
</script>
