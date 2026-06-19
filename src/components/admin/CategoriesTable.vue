<template>
  <div class="bg-card rounded-xl neon-border overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-card-hover">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Matches</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-for="category in categories" :key="category.name" class="hover:bg-card-hover transition-colors">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-white">{{ category.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-text-muted">{{ category.count }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-primary hover:text-primary-light">Edit</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const categories = ref([])

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/admin/categories')
    categories.value = response.data
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>
