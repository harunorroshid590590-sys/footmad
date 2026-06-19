import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const mobileMenuOpen = ref(false)
  const searchQuery = ref('')
  const activeTab = ref('live')
  const currentRoute = ref('home')

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
  }

  const closeMobileMenu = () => {
    mobileMenuOpen.value = false
  }

  const setSearchQuery = (query) => {
    searchQuery.value = query
  }

  const setActiveTab = (tab) => {
    activeTab.value = tab
  }

  const setCurrentRoute = (route) => {
    currentRoute.value = route
  }

  return {
    mobileMenuOpen,
    searchQuery,
    activeTab,
    currentRoute,
    toggleMobileMenu,
    closeMobileMenu,
    setSearchQuery,
    setActiveTab,
    setCurrentRoute
  }
})
