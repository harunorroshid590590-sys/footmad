// Map raw/technical player errors to friendly, user-facing messages.
export const friendlyStreamError = (raw = '') => {
  const s = String(raw || '').toLowerCase()
  if (!s) return 'This stream is currently unavailable.'
  if (s.includes('manifest') || s.includes('network') || s.includes('load') || s.includes('404') || s.includes('fetch') || s.includes('timeout'))
    return "We couldn't reach this stream. It may be offline."
  if (s.includes('drm') || s.includes('license') || s.includes('key') || s.includes('widevine') || s.includes('clearkey'))
    return "This stream is protected and can't be played in this browser."
  if (s.includes('cors') || s.includes('cross-origin') || s.includes('blocked'))
    return 'Playback was blocked for this stream.'
  if (s.includes('decode') || s.includes('codec') || s.includes('format') || s.includes('media') || s.includes('support'))
    return "This stream's format isn't supported on your device."
  return 'This stream is currently unavailable.'
}
