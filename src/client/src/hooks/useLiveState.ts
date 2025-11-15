import { useCallback, useRef } from 'react'
import { useLiveStore } from '../stores/liveStore'
import { useWebSocket } from './useWebSocket'
import apiClient from '../lib/api'

export function useLiveState() {
  const socket = useWebSocket()
  const liveWindowRef = useRef<Window | null>(null)

  const {
    isLive,
    currentXP,
    currentLevel,
    nextLevelXP,
    progress,
    totalXPEarned,
    currentSession,
    setIsLive,
    addXP,
    setLevel,
    reset,
  } = useLiveStore()

  const startLive = useCallback(async () => {
    try {
      // Start session on backend
      const response = await apiClient.post('/api/session/start')
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to start session')
      }

      // Emit start event via WebSocket
      if (socket) {
        console.log('[Live] 📤 Emitting live:start event to server...')
        socket.emit('live:start')
        console.log('[Live] ✅ live:start event emitted')
      } else {
        console.warn('[Live] ⚠️ Socket not available, cannot emit live:start')
      }

      // Update store
      setIsLive(true)

      console.log('[Live] Session started:', response.data.sessionId)
      console.log('[Live] 🎥 OBS Browser Source should be pointing to: http://localhost:8020')
      console.log('[Live] 🔊 Audio is playing in this tab (Control Panel)')
    } catch (err: any) {
      console.error('[Live] Failed to start session:', err)
      alert(err.message || 'Falha ao iniciar live')
    }
  }, [socket, setIsLive])

  const stopLive = useCallback(async () => {
    try {
      // Stop session on backend
      const response = await apiClient.post('/api/session/stop', {
        finalLevel: currentLevel,
        totalXP: currentXP,
      })

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to stop session')
      }

      // Emit stop event via WebSocket
      if (socket) {
        socket.emit('live:stop')
      }

      // Update store
      setIsLive(false)

      console.log('[Live] Session stopped')
      console.log('[Live] 🔇 Audio stopped in Control Panel')
    } catch (err: any) {
      console.error('[Live] Failed to stop session:', err)
      alert(err.message || 'Falha ao parar live')
    }
  }, [socket, setIsLive, currentLevel, currentXP])

  return {
    isLive,
    currentXP,
    currentLevel,
    nextLevelXP,
    progress,
    totalXPEarned,
    currentSession,
    startLive,
    stopLive,
    addXP,
    setLevel,
    reset,
  }
}
