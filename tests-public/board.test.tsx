import { fireEvent, render, screen } from '@testing-library/react'
import { App } from '../src/App'

function setControl(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function saveVisit(fields: { patient: string; date: string; time: string }) {
  setControl('Patient name', fields.patient)
  setControl('Provider', 'amin')
  setControl('Service', 'exam')
  setControl('Date', fields.date)
  setControl('Start time', fields.time)
  fireEvent.click(screen.getByRole('button', { name: 'Save appointment' }))
}

it('prints the seed visit in America/Chicago', () => {
  render(<App />)
  const row = screen.getByRole('listitem', { name: 'Riley Chen' })
  expect(row).toHaveTextContent('2026-01-15')
  expect(row).toHaveTextContent('09:00-09:30')
})

it('allows a visit that starts when the previous visit ends', () => {
  render(<App />)
  saveVisit({ patient: 'First Adjacent', date: '2026-01-22', time: '09:00' })
  saveVisit({ patient: 'Second Adjacent', date: '2026-01-22', time: '09:30' })
  expect(screen.getByRole('listitem', { name: 'First Adjacent' })).toBeInTheDocument()
  expect(screen.getByRole('listitem', { name: 'Second Adjacent' })).toBeInTheDocument()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})

it('accepts a visit that starts at 08:00 clinic time', () => {
  render(<App />)
  saveVisit({ patient: 'Opening Visit', date: '2026-01-22', time: '08:00' })
  expect(screen.getByRole('status')).toHaveTextContent('Appointment saved.')
  expect(screen.getByRole('listitem', { name: 'Opening Visit' })).toHaveTextContent('08:00-08:30')
})

it('keeps a stored board instead of replacing it with the seed', () => {
  localStorage.setItem(
    'clinic.schedule.v1',
    JSON.stringify({
      version: 1,
      nextId: 4,
      appointments: [
        {
          id: 'apt-custom',
          patientName: 'Stored Patient',
          providerId: 'brooks',
          serviceId: 'exam',
          start: '2026-02-02T15:00:00.000Z',
          end: '2026-02-02T15:30:00.000Z',
          status: 'scheduled',
        },
      ],
    }),
  )
  render(<App />)
  expect(screen.getByRole('listitem', { name: 'Stored Patient' })).toBeInTheDocument()
  expect(screen.queryByRole('listitem', { name: 'Riley Chen' })).not.toBeInTheDocument()
  expect(localStorage.getItem('clinic.schedule.v1')).toContain('Stored Patient')
})
