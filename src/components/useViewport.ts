import { useEffect, useState } from 'react'

const COMPACT_QUERY = '(max-width: 700px)'

function mediaMatches(query: string): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(query).matches
}

export function useCompact(): boolean {
  const [compact, setCompact] = useState(() => mediaMatches(COMPACT_QUERY))

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia(COMPACT_QUERY)
    const onChange = () => setCompact(media.matches)
    setCompact(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return compact
}
