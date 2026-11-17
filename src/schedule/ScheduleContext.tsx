import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { applyDraft, cancelAppointment, type ApplyResult } from './validate'
import { readStoredState, seedState, writeStoredState } from './storage'
import type { Draft, ScheduleState } from './types'

type ScheduleApi = {
  state: ScheduleState
  save: (draft: Draft) => ApplyResult
  cancel: (id: string) => void
}

const ScheduleContext = createContext<ScheduleApi | null>(null)

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ScheduleState>(() => structuredClone(seedState))

  useEffect(() => {
    writeStoredState(state)
  }, [state])

  useEffect(() => {
    const stored = readStoredState()
    if (stored) setState(stored)
  }, [])

  const save = useCallback((draft: Draft) => {
    const result = applyDraft(state, draft)
    if (result.ok) setState(result.state)
    return result
  }, [])

  const cancel = useCallback((id: string) => {
    setState(cancelAppointment(state, id))
  }, [])

  const api = useMemo(() => ({ state, save, cancel }), [state, save, cancel])
  return <ScheduleContext.Provider value={api}>{children}</ScheduleContext.Provider>
}

export function useSchedule(): ScheduleApi {
  const api = useContext(ScheduleContext)
  if (!api) throw new Error('useSchedule must be used inside ScheduleProvider')
  return api
}
