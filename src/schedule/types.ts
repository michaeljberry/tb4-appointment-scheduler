export type ProviderId = 'amin' | 'brooks'
export type ServiceId = 'exam' | 'consult'
export type VisitStatus = 'scheduled' | 'cancelled'

export type Appointment = {
  id: string
  patientName: string
  providerId: ProviderId
  serviceId: ServiceId
  start: string
  end: string
  status: VisitStatus
}

export type ScheduleState = {
  version: 1
  nextId: number
  appointments: Appointment[]
}

export type Draft = {
  id?: string
  patientName: string
  providerId: ProviderId
  serviceId: ServiceId
  date: string
  time: string
}

export type FieldName = 'patient' | 'date' | 'time'

export const CLINIC_TIME_ZONE = 'America/Chicago'
export const STORAGE_KEY = 'clinic.schedule.v1'

export const PROVIDERS: { id: ProviderId; name: string }[] = [
  { id: 'amin', name: 'Dr. Amin' },
  { id: 'brooks', name: 'Dr. Brooks' },
]

export const SERVICES: { id: ServiceId; name: string; minutes: number }[] = [
  { id: 'exam', name: 'Exam', minutes: 30 },
  { id: 'consult', name: 'Consult', minutes: 60 },
]

export function providerName(id: string): string {
  return PROVIDERS.find((provider) => provider.id === id)?.name ?? id
}

export function serviceById(id: string): { id: ServiceId; name: string; minutes: number } {
  const service = SERVICES.find((item) => item.id === id)
  if (!service) {
    throw new Error(`Unknown service ${id}`)
  }
  return service
}
