<template><span style="display:none"></span></template>

<script setup>
import { onMounted } from 'vue'
import axios from 'axios'
import { initPopunder } from '@/utils/popunder'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5007/api'

onMounted(async () => {
  try {
    const { data } = await axios.get(`${API_URL}/ad-config`)
    initPopunder(data)
  } catch {
    /* no ad config — skip popunder */
  }
})
</script>
