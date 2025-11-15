import { useEffect, useCallback } from 'react'
import { useAudioStore } from '../stores/audioStore'
import { useWebSocket } from './useWebSocket'
import apiClient from '../lib/api'

export interface AudioState {
  playing: boolean
  paused: boolean
  currentTrack: string | null
  progress: number
  duration: number
  volume: number
}

export interface AudioAnalysis {
  bins: number[]
  avgEnergy: number
  bassEnergy: number
  midEnergy: number
  trebleEnergy: number
  bpm: number
  confidence: number
  beats: number[]
  isDrop: boolean
  isBuildUp: boolean
  isKick: boolean
  isBass: boolean
}

export function useAudioEngine() {
  const socket = useWebSocket()
  const {
    setPlaying,
    setCurrentSong,
    setVolume,
    setProgress,
    setAnalysis,
  } = useAudioStore()

  // Listen for audio state updates from server
  useEffect(() => {
    if (!socket) return

    socket.on('audio:state', (state: AudioState) => {
      setPlaying(state.playing)
      setProgress(state.progress)

      if (state.currentTrack) {
        setCurrentSong({
          id: state.currentTrack,
          title: state.currentTrack,
          artist: 'Unknown',
          filePath: state.currentTrack,
          filename: state.currentTrack,
          duration: state.duration,
          addedAt: new Date().toISOString(),
        })
      }
    })

    socket.on('audio:analysis', (analysis: AudioAnalysis) => {
      setAnalysis({
        frequencies: analysis.bins,
        bpm: analysis.bpm,
        energy: analysis.avgEnergy,
        bass: analysis.bassEnergy,
        mid: analysis.midEnergy,
        treble: analysis.trebleEnergy,
        dropsDetected: analysis.isDrop,
        buildUpDetected: analysis.isBuildUp,
      })
    })

    socket.on('audio:drop-detected', (data: any) => {
      console.log('Drop detected!', data)
    })

    socket.on('audio:build-up', (data: any) => {
      console.log('Build-up detected!', data)
    })

    socket.on('audio:ended', () => {
      console.log('Song ended')
      setPlaying(false)
    })

    return () => {
      socket.off('audio:state')
      socket.off('audio:analysis')
      socket.off('audio:drop-detected')
      socket.off('audio:build-up')
      socket.off('audio:ended')
    }
  }, [socket, setPlaying, setCurrentSong, setProgress, setAnalysis])

  // Play
  const play = useCallback(
    async (trackPath: string, duration: number = 0) => {
      try {
        if (socket) {
          socket.emit('audio:play', { trackPath, duration })
        } else {
          await apiClient.post('/api/audio/play', { trackPath, duration })
        }
      } catch (err) {
        console.error('Failed to play:', err)
      }
    },
    [socket]
  )

  // Pause
  const pause = useCallback(async () => {
    try {
      if (socket) {
        socket.emit('audio:pause')
      } else {
        await apiClient.post('/api/audio/pause')
      }
    } catch (err) {
      console.error('Failed to pause:', err)
    }
  }, [socket])

  // Resume
  const resume = useCallback(async () => {
    try {
      if (socket) {
        socket.emit('audio:resume')
      } else {
        await apiClient.post('/api/audio/resume')
      }
    } catch (err) {
      console.error('Failed to resume:', err)
    }
  }, [socket])

  // Stop
  const stop = useCallback(async () => {
    try {
      if (socket) {
        socket.emit('audio:stop')
      } else {
        await apiClient.post('/api/audio/stop')
      }
    } catch (err) {
      console.error('Failed to stop:', err)
    }
  }, [socket])

  // Seek
  const seek = useCallback(
    async (time: number) => {
      try {
        if (socket) {
          socket.emit('audio:seek', { time })
        } else {
          await apiClient.post('/api/audio/seek', { time })
        }
      } catch (err) {
        console.error('Failed to seek:', err)
      }
    },
    [socket]
  )

  // Set volume
  const setAudioVolume = useCallback(
    async (volume: number) => {
      try {
        setVolume('music', volume)
        if (socket) {
          socket.emit('audio:volume', { volume })
        } else {
          await apiClient.post('/api/audio/volume', { volume })
        }
      } catch (err) {
        console.error('Failed to set volume:', err)
      }
    },
    [socket, setVolume]
  )

  // Get analysis
  const getAnalysis = useCallback(async (): Promise<AudioAnalysis | null> => {
    try {
      const response = await apiClient.get('/api/audio/analysis')
      return response.data
    } catch (err) {
      console.error('Failed to get analysis:', err)
      return null
    }
  }, [])

  return {
    play,
    pause,
    resume,
    stop,
    seek,
    setVolume: setAudioVolume,
    getAnalysis,
  }
}
