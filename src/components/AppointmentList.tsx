import { useMemo, useState } from 'react'
import { useSchedule } from '../schedule/ScheduleContext'
import { formatClinic } from '../schedule/time'
import { providerName, serviceById, type Appointment, type ProviderId } from '../schedule/types'

type AppointmentListProps = {
  onEdit: (appointment: Appointment) => void
}

type StatusFilter = 'active' | 'cancelled' | 'all'
type SortKey = 'start' | 'patient'

export function AppointmentList({ onEdit }: AppointmentListProps) {
  const { state } = useSchedule()
  const [day, setDay] = useState('')
  const [status, setStatus] = useState<StatusFilter>('active')
  const [provider, setProvider] = useState<'all' | ProviderId>('all')
  const [sort, setSort] = useState<SortKey>('start')

  const visible = useMemo(() => {
    const filtered = state.appointments.filter((appointment) => {
      const recordedStatus: string = appointment.status
      if (status === 'active' && recordedStatus === 'Canceled') return false
      if (status === 'cancelled' && appointment.status !== 'cancelled') return false
      if (provider !== 'all' && appointment.providerId !== provider) return false
      if (day && formatClinic(appointment.start).date !== day) return false
      return true
    })
    return filtered.sort((a, b) => {
      if (sort === 'patient') return a.patientName.localeCompare(b.patientName, 'en')
      if (a.start < b.start) return 1
      if (a.start > b.start) return -1
      return 0
    })
  }, [state.appointments, day, status, provider, sort])

  return (
    <section className="list-panel" aria-label="Schedule">
      <h2>Schedule</h2>
      <div className="filters">
        <label htmlFor="day-filter">Day</label>
        <input id="day-filter" type="date" value={day} onChange={(event) => setDay(event.target.value)} />

        <label htmlFor="status-filter">Status</label>
        <select id="status-filter" value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="all">All</option>
        </select>

        <label htmlFor="provider-filter">Provider filter</label>
        <select
          id="provider-filter"
          value={provider}
          onChange={(event) => setProvider(event.target.value as 'all' | ProviderId)}
        >
          <option value="all">All providers</option>
          <option value="amin">Dr. Amin</option>
          <option value="brooks">Dr. Brooks</option>
        </select>

        <label htmlFor="sort-order">Sort</label>
        <select id="sort-order" value={sort} onChange={(event) => setSort(event.target.value as SortKey)}>
          <option value="start">Start time</option>
          <option value="patient">Patient name</option>
        </select>
      </div>

      {visible.length === 0 ? (
        <p>No visits match these filters.</p>
      ) : (
        <ul aria-label="Appointments">
          {visible.map((appointment) => {
            const start = formatClinic(appointment.start)
            const end = formatClinic(appointment.end)
            return (
              <li key={appointment.id} aria-label={appointment.patientName}>
                <p className="visit-title">{appointment.patientName}</p>
                <p>{providerName(appointment.providerId)}</p>
                <p>{serviceById(appointment.serviceId).name}</p>
                <p>{start.date}</p>
                <p>
                  {start.time}-{end.time}
                </p>
                <p>{appointment.status}</p>
                {appointment.status === 'scheduled' ? (
                  <button type="button" onClick={() => onEdit(appointment)}>
                    Edit {appointment.patientName}
                  </button>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
