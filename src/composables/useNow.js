import { ref } from 'vue'

// Single shared ticking clock (updates once per second) so many countdowns
// across the page share one timer instead of each creating its own interval.
const now = ref(Date.now())
let started = false

const start = () => {
  if (started) return
  started = true
  setInterval(() => {
    now.value = Date.now()
  }, 1000)
}

export const useNow = () => {
  start()
  return now
}
