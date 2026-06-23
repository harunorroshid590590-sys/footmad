<template>
  <div class="bg-card rounded-xl neon-border overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-card-hover">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Match</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">League</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Streams</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr
            v-for="match in sortedMatches"
            :key="match.id"
            class="hover:bg-card-hover transition-colors"
            :class="{ 'opacity-50': match.isHidden }"
          >
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-white flex items-center gap-2">
                {{ match.homeTeam || 'Home' }} vs {{ match.awayTeam || 'Away' }}
                <span v-if="match.isCustom" class="text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary-light border border-primary/30 px-1.5 py-0.5 rounded">Custom</span>
                <span v-if="match.isEdited" class="text-[10px] font-semibold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded">Edited</span>
                <span v-if="match.isHidden" class="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-text-muted border border-border px-1.5 py-0.5 rounded">Hidden</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.eventName || '—' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.category || 'Sports' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                class="px-2 py-1 text-xs font-medium rounded capitalize"
                :class="statusClass(statusOf(match))"
              >
                {{ statusOf(match) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ formatTime(match.startTime) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ match.servers?.length ?? match.streamsCount ?? 0 }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div class="flex items-center justify-end gap-3">
                <!-- Custom (admin-created) matches: full edit + real delete. -->
                <template v-if="match.isCustom">
                  <button @click="$emit('edit', match)" class="text-primary hover:text-primary-light">Edit</button>
                  <button
                    @click="deleteCustom(match)"
                    :disabled="busyId === match.id"
                    class="text-red-500 hover:text-red-400 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </template>
                <!-- Provider matches: edit links / reset to API / hide. -->
                <template v-else>
                  <button @click="openEdit(match)" class="text-primary hover:text-primary-light">Edit</button>
                  <button
                    v-if="match.isEdited"
                    @click="resetLinks(match)"
                    :disabled="busyId === match.id"
                    class="text-amber-400 hover:text-amber-300 disabled:opacity-50"
                  >
                    Reset
                  </button>
                  <button
                    @click="toggleHide(match)"
                    :disabled="busyId === match.id"
                    class="text-red-500 hover:text-red-400 disabled:opacity-50"
                  >
                    {{ match.isHidden ? 'Unhide' : 'Hide' }}
                  </button>
                </template>
              </div>
            </td>
          </tr>
          <tr v-if="!loading && matches.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-sm text-text-muted">
              No matches from the API. Check the provider URL/username in Settings, or run a sync in Cache Manager.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- ===== Edit links modal ===== -->
    <div
      v-if="editing"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      @click.self="closeEdit"
    >
      <div class="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 class="text-lg font-bold text-white">Edit Streams</h2>
            <p class="text-xs text-text-muted mt-0.5">{{ editing.homeTeam || 'Home' }} vs {{ editing.awayTeam || 'Away' }}</p>
          </div>
          <button @click="closeEdit" class="text-text-muted hover:text-white text-xl leading-none">&times;</button>
        </div>

        <div class="px-6 py-4 overflow-y-auto space-y-3">
          <p class="text-xs text-text-muted">
            Add or update stream links for this match. Saving replaces the API links until you press
            <span class="text-amber-400 font-medium">Reset</span>, which restores the original API links.
          </p>

          <div
            v-for="(row, idx) in editRows"
            :key="idx"
            class="border border-border rounded-xl p-3 space-y-2 bg-surface/40"
            :class="{ 'opacity-60': row.hidden }"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-semibold text-text-muted flex items-center gap-2">
                Stream {{ idx + 1 }}
                <span v-if="row.hidden" class="text-[10px] font-semibold uppercase tracking-wider bg-white/10 text-text-muted border border-border px-1.5 py-0.5 rounded">Hidden</span>
              </span>
              <div class="flex items-center gap-3">
                <button
                  @click="row.hidden = !row.hidden"
                  class="text-xs"
                  :class="row.hidden ? 'text-emerald-400 hover:text-emerald-300' : 'text-text-muted hover:text-white'"
                >
                  {{ row.hidden ? 'Show' : 'Hide' }}
                </button>
                <button @click="removeRow(idx)" class="text-red-500 hover:text-red-400 text-xs">Remove</button>
              </div>
            </div>
            <input
              v-model="row.title"
              placeholder="Title (e.g. HD, Server 1)"
              class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted focus:border-primary outline-none"
            />
            <input
              v-model="row.link"
              placeholder="Stream URL (.m3u8 / .mpd)  — optional headers: url|Referer=...&Origin=..."
              class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted focus:border-primary outline-none font-mono"
            />
            <input
              v-model="row.drmKey"
              placeholder="DRM key (optional, e.g. keyId:key)"
              class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-text-muted focus:border-primary outline-none font-mono"
            />
          </div>

          <button
            @click="addRow"
            class="w-full border border-dashed border-border hover:border-primary text-text-muted hover:text-primary rounded-xl py-2.5 text-sm transition-colors"
          >
            + Add stream link
          </button>
        </div>

        <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button @click="closeEdit" class="px-4 py-2 text-sm text-text-muted hover:text-white">Cancel</button>
          <button
            @click="saveLinks"
            :disabled="saving"
            class="px-5 py-2 text-sm bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'
import { statusOf, sortByPriority } from '@/utils/matchStatus'

const emit = defineEmits(['edit', 'changed'])

const matches = ref([])
const loading = ref(false)
const busyId = ref(null)

// Edit modal state
const editing = ref(null)
const editRows = ref([])
const saving = ref(false)

// Same ordering as the public site: pinned → live → upcoming (soonest start
// first) → finished.
const sortedMatches = computed(() => sortByPriority(matches.value))

const fetchMatches = async () => {
  loading.value = true
  try {
    // Matches come from the provider API; the shared axios instance adds the API
    // base URL and the admin auth token. Each row carries override flags
    // (isEdited / isHidden) so the actions render correctly.
    const response = await api.get('/admin/matches')
    matches.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    console.error('Failed to fetch matches:', err)
  } finally {
    loading.value = false
  }
}

// Rebuild the editable "url|headers" link string from a normalized server so a
// round-trip Save preserves any referer/origin/user-agent headers.
const linkFromServer = (s) => {
  const base = s.externalUrl || s.url || s.streamUrl || ''
  const headers = s.headers && typeof s.headers === 'object' ? s.headers : {}
  const parts = Object.entries(headers).filter(([, v]) => v)
  if (!parts.length) return base
  return `${base}|${parts.map(([k, v]) => `${k}=${v}`).join('&')}`
}

const openEdit = (match) => {
  editing.value = match
  editRows.value = (match.servers || []).map((s) => ({
    title: s.title || s.name || '',
    link: linkFromServer(s),
    drmKey: s.drmKey || '',
    hidden: s.hidden === true
  }))
  if (editRows.value.length === 0) addRow()
}

const closeEdit = () => {
  editing.value = null
  editRows.value = []
}

const addRow = () => editRows.value.push({ title: '', link: '', drmKey: '', hidden: false })
const removeRow = (idx) => editRows.value.splice(idx, 1)

const saveLinks = async () => {
  if (!editing.value) return
  saving.value = true
  try {
    const servers = editRows.value
      .map((r) => ({ title: (r.title || '').trim(), link: (r.link || '').trim(), drmKey: (r.drmKey || '').trim(), hidden: r.hidden === true }))
      .filter((r) => r.link)
    await api.put(`/admin/matches/${editing.value.id}/links`, { servers })
    closeEdit()
    await fetchMatches()
    emit('changed')
  } catch (err) {
    console.error('Failed to save links:', err)
    alert('Failed to save links. Please try again.')
  } finally {
    saving.value = false
  }
}

const resetLinks = async (match) => {
  if (!confirm('Reset this match to the original API links? Your edited links will be removed.')) return
  busyId.value = match.id
  try {
    await api.post(`/admin/matches/${match.id}/reset`)
    await fetchMatches()
    emit('changed')
  } catch (err) {
    console.error('Failed to reset links:', err)
  } finally {
    busyId.value = null
  }
}

const toggleHide = async (match) => {
  const hidden = !match.isHidden
  if (hidden && !confirm('Hide this match from the public site?')) return
  busyId.value = match.id
  try {
    await api.post(`/admin/matches/${match.id}/hide`, { hidden })
    await fetchMatches()
    emit('changed')
  } catch (err) {
    console.error('Failed to update visibility:', err)
  } finally {
    busyId.value = null
  }
}

const deleteCustom = async (match) => {
  if (!confirm('Delete this custom match permanently?')) return
  busyId.value = match.id
  try {
    await api.delete(`/admin/custom-matches/${match.id}`)
    await fetchMatches()
    emit('changed')
  } catch (err) {
    console.error('Failed to delete custom match:', err)
  } finally {
    busyId.value = null
  }
}

const statusClass = (status) => {
  if (status === 'live') return 'bg-red-500/20 text-red-500'
  if (status === 'finished') return 'bg-white/10 text-text-muted'
  return 'bg-blue-500/20 text-blue-500'
}

const formatTime = (time) => {
  if (!time) return 'TBD'
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return 'TBD'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  fetchMatches()
})

defineExpose({ fetchMatches })
</script>
