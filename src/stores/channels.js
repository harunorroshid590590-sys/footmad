import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

export const useChannelsStore = defineStore('channels', () => {
  // Cache items per section so switching tabs doesn't refetch needlessly.
  const bySection = ref({})        // { channel: [...], news: [...], ... }
  const loading = ref(false)
  const error = ref(null)

  const fetchSection = async (section = 'channel', { force = false } = {}) => {
    if (!force && bySection.value[section]) {
      return bySection.value[section]
    }

    loading.value = true
    error.value = null
    try {
      const response = await axios.get(`${API_URL}/channels`, { params: { section } })
      const items = Array.isArray(response.data) ? response.data : []
      bySection.value = { ...bySection.value, [section]: items }
      return items
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to load channels'
      bySection.value = { ...bySection.value, [section]: [] }
      return []
    } finally {
      loading.value = false
    }
  }

  const getSection = (section = 'channel') => bySection.value[section] || []

  return { bySection, loading, error, fetchSection, getSection }
})
