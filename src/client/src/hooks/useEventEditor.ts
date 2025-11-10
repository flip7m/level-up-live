import { useState, useCallback } from 'react'
import { GameEvent } from '@shared/types'
import apiClient from '../lib/api'

interface CreateEventData {
  name: string
  description: string
  type: 'visual' | 'audio' | 'interactive'
  triggerType: 'manual' | 'random' | 'audio' | 'vote' | 'xp-milestone'
  triggerConfig: {
    cooldown?: number
    minLevel?: number
    probability?: number
    audioType?: 'drop' | 'buildUp'
  }
  duration: number
  assets: {
    layers: any[]
    sounds: string[]
  }
}

export function useEventEditor() {
  const [events, setEvents] = useState<GameEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all events
   */
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/api/events')
      if (response.data.success) {
        setEvents(response.data.data)
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to load events'
      setError(errorMsg)
      console.error('Failed to load events:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Create new event
   */
  const createEvent = useCallback(
    async (data: CreateEventData): Promise<GameEvent | null> => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.post('/api/events', data)

        if (response.data.success) {
          const newEvent = response.data.data
          setEvents((prev) => [...prev, newEvent])
          return newEvent
        }

        return null
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to create event'
        setError(errorMsg)
        console.error('Failed to create event:', err)
        throw new Error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Update event
   */
  const updateEvent = useCallback(
    async (id: string, data: Partial<CreateEventData>): Promise<GameEvent | null> => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.put(`/api/events/${id}`, data)

        if (response.data.success) {
          const updatedEvent = response.data.data
          setEvents((prev) => prev.map((e) => (e.id === id ? updatedEvent : e)))
          if (selectedEvent?.id === id) {
            setSelectedEvent(updatedEvent)
          }
          return updatedEvent
        }

        return null
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to update event'
        setError(errorMsg)
        console.error('Failed to update event:', err)
        throw new Error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [selectedEvent]
  )

  /**
   * Delete event
   */
  const deleteEvent = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        setLoading(true)
        setError(null)

        const response = await apiClient.delete(`/api/events/${id}`)

        if (response.data.success) {
          setEvents((prev) => prev.filter((e) => e.id !== id))
          if (selectedEvent?.id === id) {
            setSelectedEvent(null)
          }
          return true
        }

        return false
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || 'Failed to delete event'
        setError(errorMsg)
        console.error('Failed to delete event:', err)
        throw new Error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [selectedEvent]
  )

  /**
   * Get event by ID
   */
  const getEventById = useCallback(
    async (id: string): Promise<GameEvent | null> => {
      try {
        const response = await apiClient.get(`/api/events/${id}`)
        if (response.data.success) {
          return response.data.data
        }
        return null
      } catch (err: any) {
        console.error('Failed to get event:', err)
        return null
      }
    },
    []
  )

  return {
    events,
    selectedEvent,
    loading,
    error,
    setSelectedEvent,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById,
  }
}
