<template>
  <div class="min-h-screen bg-background flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <div class="bg-card rounded-xl neon-border p-8">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <span class="text-white font-bold text-3xl">F</span>
          </div>
          <h1 class="text-2xl font-bold text-white">Admin Login</h1>
          <p class="text-text-muted text-sm mt-2">FOOTFY Dashboard</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="space-y-4">
            <div>
              <label class="block text-text-muted text-sm mb-2">Username</label>
              <input
                v-model="username"
                type="text"
                required
                class="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label class="block text-text-muted text-sm mb-2">Password</label>
              <input
                v-model="password"
                type="password"
                required
                class="w-full bg-background border border-border rounded-lg px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                placeholder="Enter password"
              />
            </div>

            <div
              v-if="error"
              class="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-500 text-sm"
            >
              {{ error }}
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading">Logging in...</span>
              <span v-else>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    console.log('Attempting login to:', `${API_URL}/auth/login`)
    const response = await axios.post(`${API_URL}/auth/login`, {
      username: username.value,
      password: password.value
    })
    
    console.log('Login response:', response.data)
    
    // Store token
    localStorage.setItem('admin_token', response.data.token)
    localStorage.setItem('admin_user', JSON.stringify(response.data.user))
    
    console.log('Token saved, redirecting to dashboard')
    
    // Redirect to dashboard
    router.push('/admin/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    error.value = err.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>
