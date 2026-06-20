<template>
  <div class="relative w-full h-full overflow-hidden" :class="gradientClass">
    <!-- decorative shapes -->
    <div class="absolute -top-12 -left-10 w-44 h-44 rounded-full bg-white/15 blur-2xl"></div>
    <div class="absolute top-1/3 -right-12 w-52 h-52 rounded-full bg-black/20 blur-2xl"></div>
    <div class="absolute -bottom-16 left-1/4 w-56 h-40 rounded-full bg-white/10 blur-3xl"></div>

    <div class="relative h-full flex flex-col items-center justify-between p-3 sm:p-4 text-white text-center">
      <!-- Matchup title (pushed below the badge row so long names never overlap the badges) -->
      <h3 class="font-extrabold leading-tight uppercase tracking-wide text-sm sm:text-lg drop-shadow-md line-clamp-2 mt-6 sm:mt-7 px-1">
        {{ teamA }} <span class="opacity-80">vs</span> {{ teamB }}
      </h3>

      <!-- Flags + emblem -->
      <div class="flex items-center justify-center gap-3 sm:gap-6 w-full">
        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/95 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
          <img v-if="homeLogo && !homeErr" :src="homeLogo" :alt="teamA" class="w-full h-full object-contain p-2" @error="homeErr = true" />
          <span v-else class="text-3xl sm:text-4xl">🏳️</span>
        </div>

        <div class="flex flex-col items-center shrink-0">
          <img v-if="emblem && !emblemErr" :src="emblem" alt="" class="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow" @error="emblemErr = true" />
          <span v-else class="text-3xl sm:text-4xl">🏆</span>
        </div>

        <div class="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/95 overflow-hidden flex items-center justify-center shadow-lg shrink-0">
          <img v-if="awayLogo && !awayErr" :src="awayLogo" :alt="teamB" class="w-full h-full object-contain p-2" @error="awayErr = true" />
          <span v-else class="text-3xl sm:text-4xl">🏳️</span>
        </div>
      </div>

      <!-- Meta -->
      <div class="w-full">
        <p class="text-[11px] sm:text-xs font-semibold opacity-95 truncate">{{ eventName }}</p>
        <p v-if="subline" class="text-[10px] sm:text-[11px] opacity-80 truncate">{{ subline }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { resolveAsset } from '@/utils/assets'

const props = defineProps({
  match: { type: Object, required: true },
})

const homeErr = ref(false)
const awayErr = ref(false)
const emblemErr = ref(false)

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
