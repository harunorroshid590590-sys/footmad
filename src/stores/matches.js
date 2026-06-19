import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

export const useMatchesStore = defineStore('matches', () => {
  const matches = ref([])
  const liveMatches = ref([])
  const upcomingMatches = ref([])
  const loading = ref(false)
  const error = ref(null)
  const selectedCategory = ref('All')
  const favorites = ref(JSON.parse(localStorage.getItem('favorites') || '[]'))

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

  const fetchMatches = async () => {
    loading.value = true
    error.value = null
    try {
      console.log('Fetching matches from API:', `${API_URL}/matches`)
      const response = await axios.get(`${API_URL}/matches`)
      
      // Filter out broken matches
      matches.value = response.data.filter(match => {
        // Must have team names
        if (!match.homeTeam || !match.awayTeam) return false
        // Must have streams
        if (!match.servers || match.servers.length === 0) return false
        // Must be published
        if (!match.publish) return false
        // At least one server must have a stream URL
        const hasValidStream = match.servers.some(server => server.streamUrl)
        if (!hasValidStream) return false
        
        return true
      })
      
      categorizeMatches()
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch matches'
      console.error('Error fetching matches:', err)
      console.error('Error details:', err.response?.data)
    } finally {
      loading.value = false
    }
  }

  const categorizeMatches = () => {
    const now = new Date()
    
    liveMatches.value = matches.value.filter(match => {
      if (!match.startTime || !match.endTime) return false
      const start = new Date(match.startTime)
      const end = new Date(match.endTime)
      return now >= start && now <= end
    })
    
    upcomingMatches.value = matches.value.filter(match => {
      if (!match.startTime) return false
      const start = new Date(match.startTime)
      return now < start
    })
  }

  const getMatchById = (id) => {
    return matches.value.find(match => match.id === id)
  }

  const filterByCategory = (category) => {
    selectedCategory.value = category
    if (category === 'All') {
      return matches.value
    }
    return matches.value.filter(match => match.category === category)
  }

  const filteredMatches = computed(() => {
    if (selectedCategory.value === 'All') {
      return matches.value
    }
    return matches.value.filter(match => match.category === selectedCategory.value)
  })

  const toggleFavorite = (matchId) => {
    const index = favorites.value.indexOf(matchId)
    if (index > -1) {
      favorites.value.splice(index, 1)
    } else {
      favorites.value.push(matchId)
    }
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
  }

  const isFavorite = (matchId) => {
    return favorites.value.includes(matchId)
  }

  const favoriteMatches = computed(() => {
    return matches.value.filter(match => favorites.value.includes(match.id))
  })

  return {
    matches,
    loading,
    error,
    selectedCategory,
    favorites,
    favoriteMatches,
    filteredMatches,
    liveMatches,
    upcomingMatches,
    fetchMatches,
    categorizeMatches,
    getMatchById,
    filterByCategory,
    toggleFavorite,
    isFavorite
  }
})
