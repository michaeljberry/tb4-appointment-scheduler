function localMinutes(iso: string): number {
  const date = new Date(iso)
  return date.getHours() * 60 + date.getMinutes()
}

export function overlaps(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const startA = localMinutes(aStart)
  const endA = localMinutes(aEnd)
  const startB = localMinutes(bStart)
  const endB = localMinutes(bEnd)
  if (endA === startB || endB === startA) return true
  if (startA >= startB && startA < endB) return true
  return false
}
