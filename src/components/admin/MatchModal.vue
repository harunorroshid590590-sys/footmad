<template>
  <div data-overlay class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div class="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-extrabold text-white">{{ match ? 'Edit Match' : 'Create New Match' }}</h2>
          <button data-close @click="$emit('close')" class="text-text-muted hover:text-white">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Category + Status -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Category</label>
              <select v-model="form.category" :class="inputCls">
                <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Status</label>
              <select v-model="form.status" :class="inputCls">
                <option value="normal">Normal</option>
                <option value="hot">Hot</option>
              </select>
            </div>
          </div>

          <!-- Tournament -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Tournament Name</label>
              <div :class="pasteWrap">
                <input v-model="form.eventName" type="text" placeholder="League Name" :class="bareInput" />
                <button type="button" @click="pasteInto(form, 'eventName')" :class="pasteBtn">Paste</button>
              </div>
            </div>
            <div>
              <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Tournament Logo URL</label>
              <div :class="pasteWrap">
                <input v-model="form.tournamentLogo" type="text" placeholder="https://logo-url.png" :class="bareInput" />
                <button type="button" @click="pasteInto(form, 'tournamentLogo')" :class="pasteBtn">Paste</button>
              </div>
            </div>
          </div>

          <!-- Teams -->
          <div>
            <h3 class="text-accent text-sm font-bold uppercase tracking-wider mb-3">Teams</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="border border-accent/40 rounded-xl p-4 space-y-3">
                <span class="text-text-muted text-xs font-semibold uppercase tracking-wider">Team A (Home)</span>
                <div :class="pasteWrap">
                  <input v-model="form.homeTeam" type="text" placeholder="Name" required :class="bareInput" />
                  <button type="button" @click="pasteInto(form, 'homeTeam')" :class="pasteBtn">Paste</button>
                </div>
                <div :class="pasteWrap">
                  <input v-model="form.homeLogo" type="text" placeholder="Flag URL" :class="bareInput" />
                  <button type="button" @click="pasteInto(form, 'homeLogo')" :class="pasteBtn">Paste</button>
                </div>
              </div>
              <div class="border border-accent/40 rounded-xl p-4 space-y-3">
                <span class="text-text-muted text-xs font-semibold uppercase tracking-wider">Team B (Away)</span>
                <div :class="pasteWrap">
                  <input v-model="form.awayTeam" type="text" placeholder="Name" required :class="bareInput" />
                  <button type="button" @click="pasteInto(form, 'awayTeam')" :class="pasteBtn">Paste</button>
                </div>
                <div :class="pasteWrap">
                  <input v-model="form.awayLogo" type="text" placeholder="Flag URL" :class="bareInput" />
                  <button type="button" @click="pasteInto(form, 'awayLogo')" :class="pasteBtn">Paste</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule -->
          <div>
            <h3 class="text-accent text-sm font-bold uppercase tracking-wider mb-3">Schedule</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Start Time</label>
                <input v-model="form.startTime" type="datetime-local" required :class="inputCls" />
              </div>
              <div>
                <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">Duration (Minutes)</label>
                <div class="flex items-center gap-2">
                  <input v-model.number="form.durationMinutes" type="number" min="1" :class="inputCls" />
                  <button type="button" @click="form.durationMinutes += 5" class="w-10 h-10 shrink-0 rounded-lg bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold">+</button>
                  <button type="button" @click="form.durationMinutes = Math.max(1, form.durationMinutes - 5)" class="w-10 h-10 shrink-0 rounded-lg bg-accent/20 text-accent border border-accent/40 hover:bg-accent/30 font-bold">−</button>
                </div>
                <p class="text-text-muted text-xs mt-1.5">Starting time থেকে কত মিনিট খেলা চলবে</p>
              </div>
            </div>
          </div>

          <!-- Notification banner -->
          <div>
            <label class="block text-text-muted text-xs font-semibold uppercase tracking-wider mb-2">⚠ Notification Banner URL (Optional)</label>
            <div :class="pasteWrap">
              <input v-model="form.banner" type="text" placeholder="https://example.com/banner.jpg — খেলার নোটিফিকেশনে এই ছবি দেখাবে" :class="bareInput" />
              <button type="button" @click="pasteInto(form, 'banner')" :class="pasteBtn">Paste</button>
            </div>
          </div>

          <!-- Channels -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-accent text-sm font-bold uppercase tracking-wider">Channels</h3>
              <button type="button" @click="addChannel" class="text-sm bg-surface border border-border hover:border-primary text-white px-3 py-1.5 rounded-lg">+ Add Manually</button>
            </div>

            <div v-if="form.channels.length === 0" class="text-text-muted text-sm border border-dashed border-border rounded-xl py-6 text-center">
              No channels yet. Click “+ Add Manually” to add a stream link.
            </div>

            <div v-for="(ch, idx) in form.channels" :key="idx" class="relative border border-border rounded-xl p-4 mb-3 bg-surface/40">
              <button type="button" @click="removeChannel(idx)" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center hover:bg-accent/80">✕</button>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-xs font-bold bg-accent/20 text-accent border border-accent/40 rounded px-2 py-1">#{{ idx + 1 }}</span>
                <div>
                  <span class="text-text-muted text-[11px] block">Order</span>
                  <input v-model.number="ch.order" type="number" min="1" class="w-16 bg-card border border-border rounded px-2 py-1 text-sm text-white" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-text-muted text-[11px] uppercase mb-1">Title</label>
                  <div class="relative">
                    <input v-model="ch.title" type="text" placeholder="Stream title" class="w-full bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm text-white focus:border-primary outline-none" />
                    <button type="button" @click="ch.title = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-accent text-xs">✕</button>
                  </div>
                </div>
                <div>
                  <label class="block text-text-muted text-[11px] uppercase mb-1">Type</label>
                  <select v-model="ch.type" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none">
                    <option value="M3U8">M3U8</option>
                    <option value="DASH">DASH / MPD</option>
                    <option value="TS">TS</option>
                    <option value="IFRAME">IFRAME</option>
                  </select>
                </div>
              </div>

              <div class="mb-3">
                <label class="block text-text-muted text-[11px] uppercase mb-1">Link</label>
                <div class="relative">
                  <input v-model="ch.link" type="text" placeholder="https://...  (optional headers: url|Referer=...&Origin=...)" class="w-full bg-card border border-border rounded-lg px-3 py-2 pr-8 text-sm text-white font-mono focus:border-primary outline-none" />
                  <button type="button" @click="ch.link = ''" class="absolute right-2 top-1/2 -translate-y-1/2 text-accent text-xs">✕</button>
                </div>
              </div>

              <div>
                <label class="block text-text-muted text-[11px] uppercase mb-1">DRM Info / Headers (Optional)</label>
                <div :class="pasteWrap">
                  <input v-model="ch.drm" type="text" placeholder="e.g. Clearkey format: kid:key OR custom API headers" :class="bareInput" />
                  <button type="button" @click="pasteInto(ch, 'drm')" :class="pasteBtn">Paste</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="$emit('close')" class="px-6 py-2.5 rounded-lg border border-border text-text-muted hover:text-white">Cancel</button>
            <button type="submit" :disabled="saving" class="bg-accent hover:bg-accent/90 text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50">
              {{ saving ? 'Saving...' : (match ? 'Save Changes' : 'Save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  match: { type: Object, default: null },
  saving: { type: Boolean, default: false }
})
const emit = defineEmits(['close', 'save'])

const categories = ['Football', 'Cricket', 'UFC', 'Boxing', 'WWE', 'Formula 1', 'MotoGP', 'NBA', 'MLB', 'Tennis', 'NHL', 'Basketball', 'Baseball', 'Hockey', 'Motorsport']

// Shared input styles
const inputCls = 'w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary'
const pasteWrap = 'flex items-stretch bg-background border border-border rounded-lg focus-within:border-primary overflow-hidden'
const bareInput = 'flex-1 bg-transparent px-4 py-2.5 text-white outline-none min-w-0'
const pasteBtn = 'px-3 my-1.5 mr-1.5 text-xs rounded bg-surface border border-border text-text-muted hover:text-white shrink-0'

const blankChannel = () => ({ title: '', type: 'M3U8', link: '', drm: '', order: 1 })

const form = ref({
  category: 'Football',
  status: 'normal',
  eventName: '',
  tournamentLogo: '',
  homeTeam: '',
  homeLogo: '',
  awayTeam: '',
  awayLogo: '',
  startTime: '',
  durationMinutes: 120,
  banner: '',
  channels: []
})

// Reconstruct the "url|headers" string from a normalized server so editing
// preserves any referer/origin/user-agent it carried.
const linkFromServer = (s) => {
  const base = s.externalUrl || s.url || s.streamUrl || ''
  const headers = s.headers && typeof s.headers === 'object' ? s.headers : {}
  const parts = Object.entries(headers).filter(([, v]) => v)
  return parts.length ? `${base}|${parts.map(([k, v]) => `${k}=${v}`).join('&')}` : base
}

// Format an ISO/UTC date into a local "YYYY-MM-DDTHH:mm" for datetime-local.
const toLocalInput = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

watch(() => props.match, (m) => {
  if (!m) return
  const durMin = m.startTime && m.endTime
    ? Math.max(1, Math.round((new Date(m.endTime) - new Date(m.startTime)) / 60000))
    : 120
  form.value = {
    category: m.category || 'Football',
    status: m.isHot ? 'hot' : 'normal',
    eventName: m.eventName || '',
    tournamentLogo: m.image || '',
    homeTeam: m.homeTeam || '',
    homeLogo: m.homeLogo || '',
    awayTeam: m.awayTeam || '',
    awayLogo: m.awayLogo || '',
    startTime: toLocalInput(m.startTime),
    durationMinutes: durMin,
    banner: m.banner || '',
    channels: (m.servers || []).map((s, i) => ({
      title: s.title || s.name || '',
      type: (s.type || 'M3U8').toUpperCase() === 'DASH' ? 'DASH' : 'M3U8',
      link: linkFromServer(s),
      drm: s.drmKey || '',
      order: i + 1
    }))
  }
}, { immediate: true })

const pasteInto = async (obj, key) => {
  try {
    const text = await navigator.clipboard.readText()
    if (text) obj[key] = text.trim()
  } catch {
    /* clipboard blocked — user can paste manually */
  }
}

const addChannel = () => {
  const ch = blankChannel()
  ch.order = form.value.channels.length + 1
  form.value.channels.push(ch)
}
const removeChannel = (idx) => form.value.channels.splice(idx, 1)

const handleSubmit = () => {
  const channels = form.value.channels
    .map((c, i) => ({ title: (c.title || '').trim(), type: c.type, link: (c.link || '').trim(), drm: (c.drm || '').trim(), order: Number(c.order) || i + 1 }))
    .filter((c) => c.link)

  emit('save', {
    category: form.value.category,
    status: form.value.status,
    eventName: form.value.eventName.trim(),
    tournamentLogo: form.value.tournamentLogo.trim(),
    homeTeam: form.value.homeTeam.trim(),
    homeLogo: form.value.homeLogo.trim(),
    awayTeam: form.value.awayTeam.trim(),
    awayLogo: form.value.awayLogo.trim(),
    startTime: form.value.startTime ? new Date(form.value.startTime).toISOString() : new Date().toISOString(),
    durationMinutes: Number(form.value.durationMinutes) || 120,
    banner: form.value.banner.trim(),
    channels
  })
}
</script>
