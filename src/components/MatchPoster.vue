<template>
  <div class="relative w-full h-full overflow-hidden" :class="gradientClass">
    <!-- decorative shapes -->
    <div class="absolute -top-12 -left-10 w-44 h-44 rounded-full bg-white/15 blur-2xl"></div>
    <div class="absolute top-1/3 -right-12 w-52 h-52 rounded-full bg-black/20 blur-2xl"></div>
    <div class="absolute -bottom-16 left-1/4 w-56 h-40 rounded-full bg-white/10 blur-3xl"></div>

    <div class="relative h-full flex flex-col items-center justify-center text-white text-center" :class="compact ? 'p-2 gap-1.5' : 'p-3 sm:p-4 gap-2 sm:gap-3'">
      <!-- Event name (top) -->
      <div class="w-full px-1">
        <h3
          class="font-extrabold leading-tight uppercase tracking-wide drop-shadow-md line-clamp-2"
          :class="compact ? 'text-[10px]' : 'text-sm sm:text-lg'"
        >
          {{ eventName }}
        </h3>
        <p v-if="subline" class="font-semibold opacity-90 truncate" :class="compact ? 'text-[9px]' : 'text-[11px] sm:text-xs'">{{ subline }}</p>
      </div>

      <!-- Flags + emblem -->
      <div class="flex items-center justify-center w-full" :class="compact ? 'gap-2' : 'gap-3 sm:gap-6'">
        <div class="rounded-full overflow-hidden flex items-center justify-center shadow-lg shrink-0" :class="flagClass">
          <img v-if="homeLogo && !homeErr" :src="homeLogo" :alt="teamA" class="w-full h-full object-cover" @error="homeErr = true" />
          <span v-else :class="compact ? 'text-xl' : 'text-3xl sm:text-4xl'">🏳️</span>
        </div>

        <div class="flex flex-col items-center shrink-0">
          <img v-if="emblem && !emblemErr" :src="emblem" alt="" class="object-contain drop-shadow" :class="emblemClass" @error="emblemErr = true" />
          <span v-else :class="compact ? 'text-lg' : 'text-3xl sm:text-4xl'">🏆</span>
        </div>

        <div class="rounded-full overflow-hidden flex items-center justify-center shadow-lg shrink-0" :class="flagClass">
          <img v-if="awayLogo && !awayErr" :src="awayLogo" :alt="teamB" class="w-full h-full object-cover" @error="awayErr = true" />
          <span v-else :class="compact ? 'text-xl' : 'text-3xl sm:text-4xl'">🏳️</span>
        </div>
      </div>

      <!-- Date + countdown (bottom) -->
      <div v-if="countdown" class="text-center leading-tight">
        <p v-if="dateLabel" class="font-medium text-white/90 drop-shadow" :class="compact ? 'text-[9px]' : 'text-xs sm:text-sm'">{{ dateLabel }}</p>
        <p class="font-bold tabular-nums text-white drop-shadow" :class="compact ? 'text-[9px]' : 'text-sm sm:text-base'">⏱ {{ countdown }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { resolveAsset } from '@/utils/assets'

const props = defineProps({
  match: { type: Object, required: true },
  compact: { type: Boolean, default: false },
  countdown: { type: String, default: '' },
  dateLabel: { type: String, default: '' },
})

const homeErr = ref(false)
const awayErr = ref(false)
const emblemErr = ref(false)

const flagClass = computed(() => (props.compact ? 'w-11 h-11' : 'w-24 h-24 sm:w-28 sm:h-28'))
const emblemClass = computed(() => (props.compact ? 'w-6 h-6' : 'w-12 h-12 sm:w-14 sm:h-14'))

// Full literal class strings so Tailwind's JIT keeps them.
const GRADIENTS = [
  'bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500',
  'bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-600',
  'bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600',
  'bg-gradient-to-br from-sky-500 via-blue-600 to-green-500',
  'bg-gradient-to-br from-fuchsia-600 via-purple-600 to-blue-600',
  'bg-gradient-to-br from-amber-500 via-orange-600 to-red-600',
  'bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700',
  'bg-gradient-to-br from-lime-500 via-emerald-600 to-teal-700',
]

const teamA = computed(() => props.match.homeTeam || 'Team A')
const teamB = computed(() => props.match.awayTeam || 'Team B')
const homeLogo = computed(() => resolveAsset(props.match.homeLogo))
const awayLogo = computed(() => resolveAsset(props.match.awayLogo))
const emblem = computed(() => resolveAsset(props.match.image))
const eventName = computed(() => props.match.eventName || props.match.category || 'Live Event')

const subline = computed(() => {
  const parts = []
  if (props.match.category) parts.push(props.match.category)
  return parts.join(' • ')
})

const gradientClass = computed(() => {
  const key = `${teamA.value}${teamB.value}`
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % GRADIENTS.length
  return GRADIENTS[hash]
})
</script>
