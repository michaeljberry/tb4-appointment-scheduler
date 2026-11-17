import { overlaps } from './conflicts'
import { addMinutes, clinicWallToUtc, formatClinic } from './time'
import { serviceById, type Draft, type FieldName, type ScheduleState } from './types'

export type ValidationResult =
  | { ok: true; start: string; end: string }
  | { ok: false; error: string; field: FieldName }

export function validateDraft(draft: Draft): ValidationResult {
  const patientName = draft.patientName.trim()
  if (!patientName) {
    return { ok: false, error: 'Enter the patient name.', field: 'patient' }
  }
  if (patientName.length > 80) {
    return { ok: false, error: 'Patient name must be 80 characters or fewer.', field: 'patient' }
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
    return { ok: false, error: 'Choose a visit date.', field: 'date' }
  }
  if (!draft.time) {
    return { ok: false, error: 'Choose a start time.', field: 'time' }
  }
  if (!/^\d{2}:\d{2}$/.test(draft.time)) {
    return { ok: false, error: 'Start time must be on a 30-minute mark.', field: 'time' }
  }
  const [hourText, minuteText] = draft.time.split(':')
  const hour = Number(hourText)
  const minute = Number(minuteText)
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute % 30 !== 0 || hour > 23) {
    return { ok: false, error: 'Start time must be on a 30-minute mark.', field: 'time' }
  }

  const duration = serviceById(draft.serviceId).minutes
  const startMinute = hour * 60 + minute
  const endMinute = startMinute + duration
  if (startMinute <= 8 * 60) {
    return {
      ok: false,
      error: 'Visits must start at or after 08:00 and end by 17:00 clinic time.',
      field: 'time',
    }
  }
  if (duration === 30 && endMinute >= 17 * 60) {
    return {
      ok: false,
      error: 'Visits must start at or after 08:00 and end by 17:00 clinic time.',
      field: 'time',
    }
  }

  const start = clinicWallToUtc(draft.date, draft.time)
  const end = addMinutes(start, duration)
  const startWall = formatClinic(start)
  if (startWall.time !== draft.time) {
    return { ok: false, error: 'Choose a start time.', field: 'time' }
  }
  return { ok: true, start, end }
}

export type ApplyResult =
  | { ok: true; state: ScheduleState }
  | { ok: false; error: string; field: FieldName }

export function applyDraft(state: ScheduleState, draft: Draft): ApplyResult {
  const validated = validateDraft(draft)
  if (!validated.ok) return validated

  const patientName = draft.patientName.trim()
  const conflict = state.appointments.some((appointment) =>
    overlaps(validated.start, validated.end, appointment.start, appointment.end),
  )
  if (conflict) {
    return {
      ok: false,
      error: 'That time overlaps another visit for this provider.',
      field: 'time',
    }
  }

  if (draft.id) {
    return {
      ok: true,
      state: {
        ...state,
        appointments: state.appointments.map((appointment) =>
          appointment.id === draft.id
            ? {
                ...appointment,
                patientName,
                providerId: draft.providerId,
                serviceId: draft.serviceId,
                start: validated.start,
                end: validated.end,
                status: 'scheduled',
              }
            : appointment,
        ),
      },
    }
  }

  return {
    ok: true,
    state: {
      version: 1,
      nextId: state.nextId + 1,
      appointments: [
        ...state.appointments,
        {
          id: `apt-${state.nextId}`,
          patientName,
          providerId: draft.providerId,
          serviceId: draft.serviceId,
          start: validated.start,
          end: validated.end,
          status: 'scheduled',
        },
      ],
    },
  }
}

export function cancelAppointment(state: ScheduleState, id: string): ScheduleState {
  return {
    ...state,
    appointments: state.appointments.map((appointment) =>
      appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment,
    ),
  }
}
