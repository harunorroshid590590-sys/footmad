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
                <!-- Provider matches: full edit / reset to API / hide. -->
                <template v-else>
                  <button @click="$emit('edit', match)" class="text-primary hover:text-primary-light">Edit</button>
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

    <ConfirmModal
      :open="dialog.open"
      :title="dialog.title"
      :message="dialog.message"
      :confirm-text="dialog.confirmText"
      :tone="dialog.tone"
      @confirm="onDialogConfirm"
      @cancel="onDialogCancel"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/utils/axios'
import { statusOf, sortByPriority } from '@/utils/matchStatus'
import ConfirmModal from './ConfirmModal.vue'

const emit = defineEmits(['edit', 'changed'])

const matches = ref([])
const loading = ref(false)
const busyId = ref(null)

// Promise-based confirm dialog (replaces the browser's native confirm()).
const dialog = ref({ open: false, title: '', message: '', confirmText: 'Confirm', tone: 'danger' })
let dialogResolve = null
const askConfirm = (opts) => new Promise((resolve) => {
  dialog.value = { open: true, title: 'Are you sure?', message: '', confirmText: 'Confirm', tone: 'danger', ...opts }
  dialogResolve = resolve
})
const onDialogConfirm = () => { dialog.value.open = false; dialogResolve?.(true); dialogResolve = null }
const onDialogCancel = () => { dialog.value.open = false; dialogResolve?.(false); dialogResolve = null }

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

const resetLinks = async (match) => {
  const ok = await askConfirm({
    title: 'Reset to original data?',
    message: 'This restores the match to the original API data and removes all your edits (info and links). This cannot be undone.',
    confirmText: 'Reset',
    tone: 'warning'
  })
  if (!ok) return
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
  if (hidden) {
    const ok = await askConfirm({
      title: 'Hide this match?',
      message: 'It will be removed from the public site. You can unhide it again anytime.',
      confirmText: 'Hide',
      tone: 'danger'
    })
    if (!ok) return
  }
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
  const ok = await askConfirm({
    title: 'Delete this match?',
    message: `“${match.homeTeam || 'Home'} vs ${match.awayTeam || 'Away'}” will be permanently deleted. This cannot be undone.`,
    confirmText: 'Delete',
    tone: 'danger'
  })
  if (!ok) return
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
