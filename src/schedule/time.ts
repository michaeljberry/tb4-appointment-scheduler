export type ClinicWall = {
  date: string
  time: string
}

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

export function gridTimes(): string[] {
  const times: string[] = []
  for (let minute = 8 * 60; minute <= 16 * 60 + 30; minute += 30) {
    times.push(`${pad(Math.floor(minute / 60))}:${pad(minute % 60)}`)
  }
  return times
}

export function formatClinic(iso: string): ClinicWall {
  const date = new Date(iso)
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  }
}

export function clinicWallToUtc(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString()
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString()
}
