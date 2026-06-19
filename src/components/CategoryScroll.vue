<template>
  <div class="border-b border-border bg-card/50">
    <div 
      class="flex items-center space-x-4 px-4 py-3 overflow-x-auto scrollbar-hide"
      @wheel="handleWheel"
    >
      <button
        v-for="category in categories"
        :key="category"
        @click="selectCategory(category)"
        class="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300"
        :class="selectedCategory === category 
          ? 'bg-primary text-white shadow-neon' 
          : 'bg-card text-text-muted hover:text-white hover:bg-card-hover'"
      >
        {{ category }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const categories = [
  'All',
  'Football',
  'Cricket',
  'UFC',
  'Boxing',
  'WWE',
  'Formula 1',
  'MotoGP',
  'NBA',
  'MLB',
  'Tennis',
  'NHL'
]

const selectedCategory = ref('All')

const emit = defineEmits(['category-selected'])

const selectCategory = (category) => {
  selectedCategory.value = category
  emit('category-selected', category)
}

const handleWheel = (e) => {
  if (e.deltaY !== 0) {
    e.currentTarget.scrollLeft += e.deltaY
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
