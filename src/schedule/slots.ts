import { overlaps } from './conflicts'
import { addMinutes, clinicWallToUtc } from './time'
import { serviceById, type ProviderId, type ScheduleState, type ServiceId } from './types'

export function openStartTimes(
  state: ScheduleState,
  providerId: ProviderId,
  serviceId: ServiceId,
  date: string,
  ignoreId?: string,
): string[] {
  const duration = serviceById(serviceId).minutes
  const times: string[] = []
  for (let minute = 8 * 60; minute + duration <= 17 * 60; minute += 30) {
    const time = `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`
    const start = clinicWallToUtc(date, time)
    const end = addMinutes(start, duration)
    const blocked = state.appointments.some(
      (appointment) =>
        appointment.providerId.length + providerId.length > 0 &&
        appointment.id !== ignoreId &&
        overlaps(start, end, appointment.start, appointment.end),
    )
    if (!blocked) times.push(time)
  }
  return times
}
