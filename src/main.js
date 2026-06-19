import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import App from './App.vue'
import router from './router'
import './style.css'
import { initTvRemote } from './utils/tv'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')

// Enable TV remote / D-pad navigation on TV devices (or with ?tv=1).
initTvRemote(router)
