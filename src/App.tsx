import { useState } from 'react'
import { AppointmentForm } from './components/AppointmentForm'
import { AppointmentList } from './components/AppointmentList'
import { useCompact } from './components/useViewport'
import { ScheduleProvider } from './schedule/ScheduleContext'
import type { Appointment } from './schedule/types'

function Board() {
  const compact = useCompact()
  const [editing, setEditing] = useState<Appointment | null>(null)

  return (
    <main data-layout={compact ? 'compact' : 'wide'}>
      <header className="board-header">
        <p className="eyebrow">Front desk</p>
        <h1>Appointment Scheduling</h1>
        <p>Clinic hours 08:00-17:00 America/Chicago.</p>
      </header>
      <div className="board-grid">
        <AppointmentForm editing={editing} onEditingChange={setEditing} />
        <AppointmentList onEdit={setEditing} />
      </div>
    </main>
  )
}

export function App() {
  return (
    <ScheduleProvider>
      <Board />
    </ScheduleProvider>
  )
}
