import { useEffect, useCallback } from 'react'
import { useLiveStore } from '../stores/liveStore'
import { useWebSocket } from './useWebSocket'
import apiClient from '../lib/api'

export interface XPState {
  currentXP: number
  currentLevel: number
  totalXPEarned: number
  progress: number
  xpToNext: number
  nextLevelThreshold: number
  comboCount: number
}

export function useXPSystem() {
  const socket = useWebSocket()
  const {
    setCurrentXP,
    setCurrentLevel,
    setProgress,
    setComboCount,
  } = useLiveStore()

  // Listen for XP updates from server
  useEffect(() => {
    if (!socket) return

    socket.on('xp:state', (state: XPState) => {
      console.log('[XPSystem] xp:state received:', state)
      setCurrentXP(state.currentXP)
      setCurrentLevel(state.currentLevel)
      setProgress(state.progress)
      setComboCount(state.comboCount)
    })

    socket.on('xp:added', (data: any) => {
      // Update local state with new XP
      console.log('[XPSystem] xp:added received:', data)
      setCurrentXP(data.state.currentXP)
      setCurrentLevel(data.state.currentLevel)
      setProgress(data.state.progress)
      setComboCount(data.state.comboCount)
      console.log(`+${data.xp}XP (×${data.multiplier.toFixed(2)})`)
    })

    socket.on('level:up', (data: any) => {
      setCurrentLevel(data.newLevel)
      setCurrentXP(data.xp)
      console.log(`🎉 LEVEL UP! Level ${data.newLevel}`)
    })

    socket.on('combo:decay', (data: any) => {
      setComboCount(data.comboCount)
    })

    socket.on('xp:reset', (data: any) => {
      setCurrentXP(data.currentXP)
      setCurrentLevel(data.currentLevel)
      setProgress(0)
      setComboCount(0)
    })

    return () => {
      socket.off('xp:state')
      socket.off('xp:added')
      socket.off('level:up')
      socket.off('combo:decay')
      socket.off('xp:reset')
    }
  }, [socket, setCurrentXP, setCurrentLevel, setProgress, setComboCount])

  // Add XP from audio trigger
  const addAudioXP = useCallback(
    async (triggerType: 'drop' | 'buildUp') => {
      try {
        if (socket) {
          socket.emit('xp:add-audio', { triggerType })
        } else {
          await apiClient.post('/api/xp/add-audio', { triggerType })
        }
      } catch (err) {
        console.error('Failed to add audio XP:', err)
      }
    },
    [socket]
  )

  // Add manual XP
  const addManualXP = useCallback(
    async (amount: number) => {
      try {
        if (socket) {
          socket.emit('xp:add', { amount, source: 'manual' })
        } else {
          await apiClient.post('/api/xp/add-manual', { amount })
        }
      } catch (err) {
        console.error('Failed to add manual XP:', err)
      }
    },
    [socket]
  )

  // Add fixed XP (for testing)
  const addFixedXP = useCallback(
    async (amount: number) => {
      try {
        const response = await apiClient.post('/api/xp/add-fixed', { amount })
        const state = response.data.state
        setCurrentXP(state.currentXP)
        setCurrentLevel(state.currentLevel)
        setProgress(state.progress)
        setComboCount(state.comboCount)
      } catch (err) {
        console.error('Failed to add fixed XP:', err)
      }
    },
    [setCurrentXP, setCurrentLevel, setProgress, setComboCount]
  )

  // Force level up (for testing)
  const forceLevelUp = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/xp/level-up')
      const state = response.data.state
      setCurrentXP(state.currentXP)
      setCurrentLevel(state.currentLevel)
      setProgress(state.progress)
    } catch (err) {
      console.error('Failed to force level up:', err)
    }
  }, [setCurrentXP, setCurrentLevel, setProgress])

  // Reset XP session
  const resetSession = useCallback(async () => {
    try {
      if (socket) {
        socket.emit('xp:reset')
      } else {
        await apiClient.post('/api/xp/reset')
      }
    } catch (err) {
      console.error('Failed to reset session:', err)
    }
  }, [socket])

  // Simulate viewer join (for testing)
  const simulateViewerJoin = useCallback(
    async (viewerName: string = 'TestViewer') => {
      try {
        if (socket) {
          socket.emit('viewer:join', { viewerName })
          console.log(`Simulated viewer join: ${viewerName}`)
        }
      } catch (err) {
        console.error('Failed to simulate viewer join:', err)
      }
    },
    [socket]
  )

  // Get current state
  const getState = useCallback(async (): Promise<XPState | null> => {
    try {
      const response = await apiClient.get('/api/xp/state')
      return response.data
    } catch (err) {
      console.error('Failed to get XP state:', err)
      return null
    }
  }, [])

  return {
    addAudioXP,
    addManualXP,
    addFixedXP,
    forceLevelUp,
    simulateViewerJoin,
    resetSession,
    getState,
  }
}
