import { useEffect, useState, type FormEvent } from 'react'
import { useCompact } from './useViewport'
import { useSchedule } from '../schedule/ScheduleContext'
import { openStartTimes } from '../schedule/slots'
import { formatClinic, gridTimes } from '../schedule/time'
import { PROVIDERS, SERVICES, providerName, type Appointment, type FieldName, type ProviderId, type ServiceId } from '../schedule/types'

type AppointmentFormProps = {
  editing: Appointment | null
  onEditingChange: (appointment: Appointment | null) => void
}

export function AppointmentForm({ editing, onEditingChange }: AppointmentFormProps) {
  const compact = useCompact()
  const { state, save, cancel } = useSchedule()
  const [patientName, setPatientName] = useState('')
  const [providerId, setProviderId] = useState<ProviderId>('amin')
  const [serviceId, setServiceId] = useState<ServiceId>('exam')
  const [date, setDate] = useState('2026-01-15')
  const [time, setTime] = useState('08:30')
  const [error, setError] = useState('')
  const [field, setField] = useState<FieldName | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!editing) return
    const wall = formatClinic(editing.start)
    setPatientName(editing.patientName)
    setProviderId(editing.providerId)
    setServiceId(editing.serviceId)
    setDate(wall.date)
    setTime(wall.time)
    setError('')
    setField(null)
    setStatus('')
  }, [editing])

  const openTimes = openStartTimes(state, providerId, serviceId, date, editing?.id)

  function resetForm() {
    setPatientName('')
    setProviderId('amin')
    setServiceId('exam')
    setDate('2026-01-15')
    setTime('08:30')
    setError('')
    setField(null)
    setStatus('')
    onEditingChange(null)
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const result = save({
      id: editing?.id,
      patientName,
      providerId,
      serviceId,
      date,
      time,
    })
    if (!result.ok) {
      setError(result.error)
      setField(result.field)
      setStatus('')
      return
    }
    setError('')
    setField(null)
    setStatus('Appointment saved.')
    if (!editing) setPatientName('')
  }

  function onCancelVisit() {
    if (!editing) return
    cancel(editing.id)
    setStatus('Appointment cancelled.')
    setError('')
    setField(null)
    setPatientName('')
    onEditingChange(null)
  }

  if (compact) {
    return <p className="create-panel">Booking is available on a wider screen.</p>
  }

  return (
    <form className="create-panel" aria-label="Visit form" noValidate onSubmit={onSubmit}>
      <h2>{editing ? 'Edit visit' : 'New visit'}</h2>
      <label htmlFor="patient-name">Patient name</label>
      <input
        id="patient-name"
        value={patientName}
        onChange={(event) => setPatientName(event.target.value)}
        className={field === 'patient' ? 'invalid' : undefined}
        placeholder="Patient name"
      />

      <label htmlFor="provider">Provider</label>
      <select id="provider" value={providerId} onChange={(event) => setProviderId(event.target.value as ProviderId)}>
        {PROVIDERS.map((provider) => (
          <option key={provider.id} value={provider.id}>
            {provider.name}
          </option>
        ))}
      </select>

      <label htmlFor="service">Service</label>
      <select id="service" value={serviceId} onChange={(event) => setServiceId(event.target.value as ServiceId)}>
        {SERVICES.map((service) => (
          <option key={service.id} value={service.id}>
            {service.name}
          </option>
        ))}
      </select>

      <label htmlFor="visit-date">Date</label>
      <input
        id="visit-date"
        type="date"
        className={field === 'date' ? 'invalid' : undefined}
        value={date}
        onChange={(event) => setDate(event.target.value)}
      />

      <label htmlFor="start-time">Start time</label>
      <select
        id="start-time"
        className={field === 'time' ? 'invalid' : undefined}
        value={time}
        onChange={(event) => setTime(event.target.value)}
      >
        {gridTimes().map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>

      <label htmlFor="open-times">Open times</label>
      <select
        id="open-times"
        value={openTimes.includes(time) ? time : ''}
        onChange={(event) => {
          if (event.target.value) setTime(event.target.value)
        }}
      >
        {openTimes.includes(time) ? null : <option value="">Choose an open time</option>}
        {openTimes.map((slot) => (
          <option key={slot} value={slot}>
            {slot}
          </option>
        ))}
      </select>

      {error ? (
        <p role="alert">
          {error}
        </p>
      ) : null}
      {status ? <p role="status">{status}</p> : null}

      <div className="form-actions">
        <button type="submit">Save appointment</button>
        {editing ? (
          <button type="button" onClick={onCancelVisit}>
            Cancel visit
          </button>
        ) : null}
        <button type="button" onClick={resetForm}>
          Reset form
        </button>
      </div>
      {editing ? <p className="editing-note">Editing {providerName(editing.providerId)}</p> : null}
    </form>
  )
}
