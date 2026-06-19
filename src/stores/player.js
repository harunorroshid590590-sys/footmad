import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentStream = ref(null)
  const currentServer = ref(null)
  const isPlaying = ref(false)
  const isFullscreen = ref(false)
  const volume = ref(1)
  const isMuted = ref(false)
  const playbackSpeed = ref(1)
  const currentQuality = ref('auto')
  const loading = ref(false)
  const error = ref(null)
  const playerType = ref(null) // 'hls' or 'shaka'

  const setStream = (stream) => {
    currentStream.value = stream
  }

  const setServer = (server) => {
    currentServer.value = server
  }

  const setPlaying = (playing) => {
    isPlaying.value = playing
  }

  const setFullscreen = (fullscreen) => {
    isFullscreen.value = fullscreen
  }

  const setVolume = (vol) => {
    volume.value = vol
  }

  const setMuted = (muted) => {
    isMuted.value = muted
  }

  const setPlaybackSpeed = (speed) => {
    playbackSpeed.value = speed
  }

  const setQuality = (quality) => {
    currentQuality.value = quality
  }

  const setLoading = (loadingState) => {
    loading.value = loadingState
  }

  const setError = (err) => {
    error.value = err
  }

  const setPlayerType = (type) => {
    playerType.value = type
  }

  const resetPlayer = () => {
    currentStream.value = null
    currentServer.value = null
    isPlaying.value = false
    loading.value = false
    error.value = null
    playerType.value = null
  }

  return {
    currentStream,
    currentServer,
    isPlaying,
    isFullscreen,
    volume,
    isMuted,
    playbackSpeed,
    currentQuality,
    loading,
    error,
    playerType,
    setStream,
    setServer,
    setPlaying,
    setFullscreen,
    setVolume,
    setMuted,
    setPlaybackSpeed,
    setQuality,
    setLoading,
    setError,
    setPlayerType,
    resetPlayer
  }
})
