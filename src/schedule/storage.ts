import seedJson from '../fixtures/schedule.seed.json'
import { STORAGE_KEY, type ScheduleState } from './types'

export const seedState = seedJson as ScheduleState

export function readStoredState(): ScheduleState | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<ScheduleState>
    if (parsed.version !== 1 || !Array.isArray(parsed.appointments) || typeof parsed.nextId !== 'number') {
      return null
    }
    return {
      version: 1,
      nextId: parsed.nextId,
      appointments: parsed.appointments,
    }
  } catch {
    return null
  }
}

export function writeStoredState(state: ScheduleState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function loadInitialState(): ScheduleState {
  return readStoredState() ?? structuredClone(seedState)
}
