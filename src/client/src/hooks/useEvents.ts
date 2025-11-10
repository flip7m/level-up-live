import { useState, useEffect, useCallback } from 'react'
import { GameEvent } from '@shared/types'
import { useWebSocket } from './useWebSocket'
import { useLiveStore } from '../stores/liveStore'
import apiClient from '../lib/api'

export interface ActiveEvent {
  eventId: string
  name: string
  duration: number
  startedAt: string
  endsAt: string
  type: 'manual' | 'random' | 'audio'
}

export function useEvents() {
  const socket = useWebSocket()
  const { currentLevel } = useLiveStore()
  const [availableEvents, setAvailableEvents] = useState<GameEvent[]>([])
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load available events when level changes
  useEffect(() => {
    loadAvailableEvents()
  }, [currentLevel])

  // Setup WebSocket listeners
  useEffect(() => {
    if (!socket) return

    // Listen for event triggered
    socket.on('event:triggered', (data: any) => {
      const endsAt = new Date(Date.now() + data.duration * 1000).toISOString()
      const newActiveEvent: ActiveEvent = {
        eventId: data.eventId,
        name: data.name,
        duration: data.duration,
        startedAt: data.triggeredAt,
        endsAt,
        type: data.type,
      }
      setActiveEvents((prev) => [...prev, newActiveEvent])
    })

    // Listen for event ended
    socket.on('event:ended', (data: any) => {
      setActiveEvents((prev) => prev.filter((e) => e.eventId !== data.eventId))
    })

    // Listen for event errors
    socket.on('event:error', (data: any) => {
      setError(data.error)
      setTimeout(() => setError(null), 5000) // Clear error after 5 seconds
    })

    return () => {
      socket.off('event:triggered')
      socket.off('event:ended')
      socket.off('event:error')
    }
  }, [socket])

  /**
   * Load available events for current level
   */
  const loadAvailableEvents = useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/api/events/available?level=${currentLevel}`)
      if (response.data.success) {
        setAvailableEvents(response.data.data)
      }
    } catch (err: any) {
      console.error('Failed to load available events:', err)
      setError(err.response?.data?.error || 'Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [currentLevel])

  /**
   * Trigger specific event
   */
  const triggerEvent = useCallback(
    async (eventId: string) => {
      try {
        setLoading(true)
        setError(null)

        if (socket) {
          // Use WebSocket if available
          socket.emit('event:trigger', { eventId, level: currentLevel })
        } else {
          // Fallback to REST API
          const response = await apiClient.post(`/api/events/trigger/${eventId}`, {
            level: currentLevel,
          })

          if (!response.data.success) {
            throw new Error(response.data.error || 'Failed to trigger event')
          }
        }

        // Reload available events (cooldowns may have changed)
        await loadAvailableEvents()
      } catch (err: any) {
        const errorMsg = err.response?.data?.error || err.message || 'Failed to trigger event'
        setError(errorMsg)
        throw new Error(errorMsg)
      } finally {
        setLoading(false)
      }
    },
    [socket, currentLevel, loadAvailableEvents]
  )

  /**
   * Trigger random event
   */
  const triggerRandomEvent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (socket) {
        // Use WebSocket if available
        socket.emit('event:trigger-random', { level: currentLevel })
      } else {
        // Fallback to REST API
        const response = await apiClient.post('/api/events/trigger-random', {
          level: currentLevel,
        })

        if (!response.data.success) {
          throw new Error(response.data.error || 'Failed to trigger random event')
        }
      }

      // Reload available events (cooldowns may have changed)
      await loadAvailableEvents()
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || err.message || 'Failed to trigger random event'
      setError(errorMsg)
      throw new Error(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [socket, currentLevel, loadAvailableEvents])

  /**
   * Get all events (not filtered by level)
   */
  const getAllEvents = useCallback(async (): Promise<GameEvent[]> => {
    try {
      const response = await apiClient.get('/api/events')
      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (err: any) {
      console.error('Failed to get all events:', err)
      return []
    }
  }, [])

  /**
   * Calculate remaining time for active event (in seconds)
   */
  const getRemainingTime = useCallback((event: ActiveEvent): number => {
    const now = Date.now()
    const endsAt = new Date(event.endsAt).getTime()
    const remaining = Math.max(0, endsAt - now)
    return Math.ceil(remaining / 1000)
  }, [])

  return {
    availableEvents,
    activeEvents,
    loading,
    error,
    triggerEvent,
    triggerRandomEvent,
    loadAvailableEvents,
    getAllEvents,
    getRemainingTime,
  }
}
