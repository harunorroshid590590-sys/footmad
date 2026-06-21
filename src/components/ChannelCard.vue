<template>
  <!-- Rich card variant (All Channels / desktop) -->
  <router-link
    v-if="variant === 'card'"
    :to="to"
    class="group relative flex flex-col rounded-2xl p-3 border border-border bg-gradient-to-br hover:border-primary/50 hover:-translate-y-0.5 hover:shadow-card transition-all"
    :class="[gradientClass, 'md:from-card md:via-card md:to-surface']"
  >
    <!-- Badges row -->
    <div class="flex items-center justify-between mb-2 h-5">
      <span
        v-if="channel.badges?.live"
        class="flex items-center gap-1 bg-black/30 border border-accent/30 text-accent text-[9px] font-bold px-2 py-0.5 rounded-md"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></span> LIVE
      </span>
      <span v-else></span>
      <span
        v-if="channel.badges?.sports"
        class="bg-white/5 border border-white/10 text-text-muted text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide"
      >
        SPORTS
      </span>
    </div>

    <!-- Logo panel -->
    <div class="rounded-xl h-28 flex items-center justify-center mb-3 bg-gradient-to-br from-white/[0.07] to-white/[0.01]">
      <img v-if="logoUrl && !logoErr" :src="logoUrl" :alt="channel.name" loading="lazy" class="max-h-20 max-w-[85%] object-contain" @error="logoErr = true" />
      <span v-else class="text-xl font-bold text-white/80">{{ initials }}</span>
    </div>

    <!-- Name + meta -->
    <h3 class="text-white text-sm font-bold text-center truncate w-full">{{ channel.name }}</h3>
    <div class="flex items-center justify-center gap-1.5 mt-1 text-[11px] text-text-muted">
      <span class="truncate">{{ channel.category || 'Sports' }} · {{ serversCount }} server{{ serversCount === 1 ? '' : 's' }}</span>
      <span class="bg-white/10 text-text-muted text-[9px] font-semibold px-1.5 py-0.5 rounded">{{ channel.quality || 'FHD' }}</span>
    </div>
  </router-link>

  <!-- Bordered card with circular logo + name (mobile channels / section tabs) -->
  <router-link
    v-else
    :to="to"
    class="group flex flex-col items-center gap-2 text-center rounded-xl bg-card border border-[#2c2747] p-3 hover:border-primary/60 transition-colors"
  >
    <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white/95 flex items-center justify-center">
      <img v-if="logoUrl && !logoErr" :src="logoUrl" :alt="channel.name" loading="lazy" class="w-full h-full object-cover" @error="logoErr = true" />
      <span v-else class="text-base font-bold text-slate-600">{{ initials }}</span>
    </div>
    <span class="text-[11px] sm:text-xs text-white truncate w-full px-0.5">{{ channel.name }}</span>
  </router-link>
</template>

<script setup>
import { computed, ref } from 'vue'
import { resolveAsset } from '@/utils/assets'

const props = defineProps({
  channel: { type: Object, required: true },
  variant: { type: String, default: 'circle' }, // 'circle' | 'card'
})

const logoErr = ref(false)
const logoUrl = computed(() => resolveAsset(props.channel.logo))
const to = computed(() => `/channel/${props.channel._id || props.channel.id}`)

// Colourful gradient on mobile (like the home posters); overridden to the dark
// card colour on desktop. Full literal strings so Tailwind's JIT keeps them.
const GRADIENTS = [
  'from-blue-600 via-indigo-600 to-emerald-500',
  'from-emerald-600 via-teal-600 to-sky-600',
  'from-orange-500 via-rose-500 to-purple-600',
  'from-sky-500 via-blue-600 to-green-500',
  'from-fuchsia-600 via-purple-600 to-blue-600',
  'from-amber-500 via-orange-600 to-red-600',
  'from-cyan-500 via-blue-600 to-indigo-700',
  'from-lime-500 via-emerald-600 to-teal-700',
]
const gradientClass = computed(() => {
  const key = props.channel.name || ''
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash + key.charCodeAt(i)) % GRADIENTS.length
  return GRADIENTS[hash]
})

const serversCount = computed(() =>
  props.channel.serversCount ?? (Array.isArray(props.channel.servers) ? props.channel.servers.length : 0)
)

const metaLine = computed(() => {
  const parts = [props.channel.category || 'Sports']
  parts.push(`${serversCount.value} server${serversCount.value === 1 ? '' : 's'}`)
  if (props.channel.quality) parts.push(props.channel.quality)
  return parts.join(' · ')
})

const initials = computed(() =>
  (props.channel.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
)
</script>
