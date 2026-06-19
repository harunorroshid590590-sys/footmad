import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Backend dev server — keep in sync with footfy-backend PORT (default 5007)
  const backendTarget = env.VITE_PROXY_TARGET || 'http://localhost:5007'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true
        },
        '/proxy': {
          target: backendTarget,
          changeOrigin: true
        }
      },
      allowedHosts: ['localhost', '127.0.0.1', 'harvest-flier-surplus.ngrok-free.dev']
    }
  }
})
