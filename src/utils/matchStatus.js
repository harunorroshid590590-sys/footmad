// Shared match status + ordering helpers used by Home, Category, Search, etc.

// Live if the provider says live OR the match is currently within its time window
// (kept consistent with the LIVE badge in MatchCard).
export const statusOf = (m) => {
  const now = Date.now()
  const start = m.startTime ? new Date(m.startTime).getTime() : NaN
  const end = m.endTime ? new Date(m.endTime).getTime() : NaN
  const hasStart = !Number.isNaN(start)
  const hasEnd = !Number.isNaN(end)

  // The provider keeps status as "upcoming" even after a match ends, so the clock
  // is authoritative whenever we have valid times.
  if (hasEnd && now > end) return 'finished'
  if (hasStart && hasEnd && now >= start && now <= end) return 'live'
  if (hasStart && now < start) return 'upcoming'

  // Fallbacks when start/end times are missing or invalid.
  if (m.status === 'live' || m.isLive === true) return 'live'
  if (m.status === 'finished') return 'finished'
  return 'upcoming'
}

// Filter a list by the active tab ('all' | 'live' | 'upcoming' | 'ended').
export const filterByTab = (list, tab) => {
  if (tab === 'live') return list.filter((m) => statusOf(m) === 'live')
  if (tab === 'upcoming') return list.filter((m) => statusOf(m) === 'upcoming')
  if (tab === 'ended') return list.filter((m) => statusOf(m) === 'finished')
  return list
}

// Ordering priority: pinned (admin) → live → upcoming → ended.
export const rankOf = (m) => {
  if (m.isPinned === true) return 0
  const s = statusOf(m)
  if (s === 'live') return 1
  if (s === 'upcoming') return 2
  return 3
}

// Stable sort by the priority above.
export const sortByPriority = (list) =>
  list
    .map((m, i) => ({ m, i }))
    .sort((a, b) => rankOf(a.m) - rankOf(b.m) || a.i - b.i)
    .map((x) => x.m)

export const emptyLabelFor = (tab) => {
  if (tab === 'live') return 'No live matches right now.'
  if (tab === 'upcoming') return 'No upcoming matches.'
  if (tab === 'ended') return 'No ended matches.'
  return 'No matches available.'
}
