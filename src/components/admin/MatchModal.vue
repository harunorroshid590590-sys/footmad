<template>
  <div data-overlay class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
    <div class="bg-card rounded-xl neon-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-white">{{ match ? 'Edit Match' : 'Add Match' }}</h2>
          <button
            data-close
            @click="$emit('close')"
            class="text-text-muted hover:text-white"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Home Team Name</label>
              <input
                v-model="formData.homeTeam.name"
                type="text"
                required
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Home Team Logo URL</label>
              <input
                v-model="formData.homeTeam.logo"
                type="url"
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Away Team Name</label>
              <input
                v-model="formData.awayTeam.name"
                type="text"
                required
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label class="block text-text-muted text-sm mb-2">Away Team Logo URL</label>
              <input
                v-model="formData.awayTeam.logo"
                type="url"
                class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">League</label>
            <input
              v-model="formData.league"
              type="text"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Category</label>
            <select
              v-model="formData.category"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="UFC">UFC</option>
              <option value="Boxing">Boxing</option>
              <option value="WWE">WWE</option>
              <option value="Formula 1">Formula 1</option>
              <option value="MotoGP">MotoGP</option>
              <option value="NBA">NBA</option>
              <option value="MLB">MLB</option>
              <option value="Tennis">Tennis</option>
              <option value="NHL">NHL</option>
            </select>
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Match Time</label>
            <input
              v-model="formData.time"
              type="datetime-local"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label class="block text-text-muted text-sm mb-2">Status</label>
            <select
              v-model="formData.status"
              required
              class="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="upcoming">Upcoming</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          <div class="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-6 py-2 rounded-lg border border-border text-text-muted hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors"
            >
              Save
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
  match: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

const formData = ref({
  homeTeam: {
    name: '',
    logo: ''
  },
  awayTeam: {
    name: '',
    logo: ''
  },
  league: '',
  category: 'Football',
  time: '',
  status: 'upcoming'
})

watch(() => props.match, (newMatch) => {
  if (newMatch) {
    formData.value = {
      homeTeam: {
        name: newMatch.homeTeam?.name || '',
        logo: newMatch.homeTeam?.logo || ''
      },
      awayTeam: {
        name: newMatch.awayTeam?.name || '',
        logo: newMatch.awayTeam?.logo || ''
      },
      league: newMatch.league || '',
      category: newMatch.category || 'Football',
      time: newMatch.time ? newMatch.time.slice(0, 16) : '',
      status: newMatch.status || 'upcoming'
    }
  }
}, { immediate: true })

const handleSubmit = () => {
  emit('save', {
    ...formData.value,
    time: new Date(formData.value.time).toISOString()
  })
}
</script>
