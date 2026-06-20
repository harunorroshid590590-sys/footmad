<template>
  <!-- Mobile-only sports filter row (desktop uses the left sidebar). Material Design icons. -->
  <div class="md:hidden flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
    <button
      v-for="sport in sports"
      :key="sport.slug"
      @click="$emit('select', sport.slug)"
      class="shrink-0 flex items-center justify-center rounded-xl transition-colors"
      :class="modelValue === sport.slug
        ? 'bg-white text-black gap-2 px-3 h-11 font-semibold'
        : 'bg-card text-text-muted w-11 h-11 hover:text-white'"
    >
      <span v-html="sport.icon" class="inline-flex [&>svg]:w-5 [&>svg]:h-5"></span>
      <span v-if="modelValue === sport.slug" class="text-sm whitespace-nowrap">{{ sport.name }}</span>
    </button>
  </div>
</template>

<script setup>
import { SPORTS, ALL_ICON } from '@/data/sports'

defineProps({
  modelValue: { type: String, default: 'all' },
})
defineEmits(['select'])

const sports = [{ name: 'All', slug: 'all', icon: ALL_ICON }, ...SPORTS]
</script>
