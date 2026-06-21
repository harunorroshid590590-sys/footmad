// Shared match status + ordering helpers used by Home, Category, Search, etc.

const slugify = (s) => String(s || '').toLowerCase().replace(/[\s_]+/g, '-')

// Map a sidebar/All-Sports slug to the matches it represents. The provider uses
// broad categories (Basketball, Baseball, Hockey, Motorsport, Boxing), so some
// app sports (nba, mlb, nhl, formula-1, motogp, wwe) are aliases or title-based.
export const matchInSport = (m, slug) => {
  const cat = slugify(m.category)
  const title = String(m.eventName || m.title || m.category || '').toLowerCase()
  switch (slug) {
    case 'nba': return cat === 'basketball'
    case 'mlb': return cat === 'baseball'
    case 'nhl': return cat === 'hockey'
    case 'formula-1': return cat === 'motorsport' && /formula|f1/.test(title)
    case 'motogp': return cat === 'motorsport' && /moto/.test(title)
    case 'wwe': return cat === 'boxing' && /wwe|raw|smackdown|nxt|aew|wrestl/.test(title)
    case 'ufc': return cat === 'ufc' || /ufc|mma/.test(title)
    default: return cat === slug
  }
}

// Friendly title for a slug (e.g. "nba" → "Basketball").
export const sportDisplayName = (slug) => {
  const map = { nba: 'Basketball', mlb: 'Baseball', nhl: 'Hockey', 'formula-1': 'Formula 1', motogp: 'MotoGP', wwe: 'WWE', ufc: 'UFC' }
  return map[slug] || String(slug || '').replace(/-/g, ' ')
}

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
