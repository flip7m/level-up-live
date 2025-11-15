import { useEffect, useState, useRef } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useLiveStore } from '../../stores/liveStore'
import { useAudioStore } from '../../stores/audioStore'
import { Song } from '@shared/types'

/**
 * AudioManager - Gerenciador central de áudio
 *
 * Responsável por:
 * - Tocar música da playlist via Howler.js
 * - Tocar efeitos sonoros quando recebe eventos Socket.IO
 * - Gerenciar volume separado (música 70%, efeitos 80%)
 * - Auto-start quando live:start é emitido
 * - Auto-stop quando live:stop é emitido
 * - Análise de áudio em tempo real (Web Audio API)
 *
 * IMPORTANTE: Este componente NÃO renderiza UI, apenas gerencia áudio.
 * O áudio é capturado pelo OBS via "Application Audio Capture" do navegador.
 */
export function AudioManager() {
  const socket = useWebSocket()
  const { isLive } = useLiveStore()
  const { setProgress, setPlaying, setCurrentSong } = useAudioStore()

  // Estados para música
  const [playlist, setPlaylist] = useState<Song[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // Refs for visual analysis only (fake data, no real audio)
  const animationFrameRef = useRef<number | null>(null)

  // Estado para level atual (para debug)
  const [currentLevel, setCurrentLevel] = useState(1)

  // Log when component mounts
  useEffect(() => {
    console.log('[AudioManager] Component mounted')
    console.log('[AudioManager] Socket available:', !!socket)
    console.log('[AudioManager] isLive:', isLive)
  }, [])

  // Carregar playlist da API
  useEffect(() => {
    async function loadPlaylist() {
      try {
        const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
        const baseURL = `http://${host}:8881`
        const response = await fetch(`${baseURL}/api/playlist`)
        const data = await response.json()
        if (data.success && data.data) {
          setPlaylist(data.data)
          console.log('[AudioManager] Loaded playlist:', data.data.length, 'songs')
        }
      } catch (err) {
        console.error('[AudioManager] Failed to load playlist:', err)
      }
    }
    loadPlaylist()
  }, [])

  // Get backend URL dynamically
  const getBackendURL = () => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
    return `http://${host}:8881`
  }

  // Função para tocar próxima música (sends command to 8020)
  const playNextSong = () => {
    if (playlist.length === 0) {
      console.warn('[AudioManager] No songs in playlist')
      return
    }

    const song = playlist[currentIndex]
    console.log(`[AudioManager] 🎵 Sending play command: ${song.title || song.filename} (${currentIndex + 1}/${playlist.length})`)

    // Update local audioStore with current song
    setCurrentSong(song)

    // Send play command to 8020 via Socket.IO
    if (socket) {
      socket.emit('audio:remote-play', { song })

      // Emit nowplaying for next song info
      const nextIndex = (currentIndex + 1) % playlist.length
      const nextSong = playlist[nextIndex]
      socket.emit('audio:nowplaying', { song, nextSong })
    }

    // Start visual-only analysis (fake data for UI)
    startVisualAnalysis()
  }

  // Função para parar música
  const stopMusic = () => {
    console.log('[AudioManager] ⏹ Sending stop command')

    stopAnalysisLoop() // Stops visual analysis
    setCurrentSong(null)
    setPlaying(false)
    setProgress(0)

    // Send stop command to 8020 via Socket.IO
    if (socket) {
      socket.emit('audio:remote-stop')
    }

    // Send stopped state to waveform via custom event
    window.dispatchEvent(
      new CustomEvent('audio:analysis', {
        detail: {
          frequencies: [],
          playing: false,
        },
      })
    )
  }

  // Função para tocar efeito sonoro (local, for immediate feedback)
  const playSFX = (soundPath: string) => {
    if (!soundPath || soundPath.trim() === '') {
      console.debug('[AudioManager] No sound path provided, skipping')
      return
    }

    console.log('[AudioManager] 🔊 Playing SFX locally:', soundPath)

    // Keep SFX local for immediate feedback (fast, no network delay)
    // TODO: Consider sending to 8020 for OBS capture
    const baseURL = getBackendURL()
    const audio = new Audio(`${baseURL}/${soundPath}`)
    audio.volume = 0.8
    audio.play().catch((err) => {
      console.error('[AudioManager] Failed to play SFX:', soundPath, err)
    })
  }

  // Visual analysis (simulated data - Web Audio API causes CORS issues)
  const startVisualAnalysis = () => {
    const analyze = () => {
      // Generate simulated frequency data (128 bars)
      const frequencies = new Array(128).fill(0).map(() => {
        // Random values weighted by typical music spectrum
        // More energy in low/mid frequencies, less in high
        const random = Math.random()
        const energy = Math.pow(random, 0.5) * 255 // More likely to be higher
        return Math.floor(energy)
      })

      // Dispatch custom browser event for waveform
      window.dispatchEvent(
        new CustomEvent('audio:analysis', {
          detail: {
            frequencies,
            playing: true,
          },
        })
      )

      animationFrameRef.current = requestAnimationFrame(analyze)
    }

    console.log('[AudioManager] Starting visual analysis')
    analyze()
  }

  // Stop analysis loop
  const stopAnalysisLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }

  // Listener for playback status from 8020
  useEffect(() => {
    if (!socket) return

    const handlePlaybackStatus = (data: {
      isPlaying: boolean
      currentTime: number
      duration: number
      song: Song | null
    }) => {
      console.log('[AudioManager] 📊 Playback status from 8020:', data)

      // Update local state with actual playback data from 8020
      setPlaying(data.isPlaying)
      setProgress(data.currentTime)
      if (data.song) {
        setCurrentSong(data.song)
      }

      // Check if song ended and play next
      if (!data.isPlaying && data.currentTime === 0 && !data.song) {
        // Song ended, play next
        console.log('[AudioManager] ✅ Song ended, queuing next...')
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
      }
    }

    socket.on('audio:playback-status', handlePlaybackStatus)

    return () => {
      socket.off('audio:playback-status', handlePlaybackStatus)
    }
  }, [socket, playlist])

  // Listener: live:start → tocar música
  useEffect(() => {
    if (!socket) {
      console.warn('[AudioManager] Socket not available yet for live:start listener')
      return
    }

    console.log('[AudioManager] ✅ Registering live:start listener (socket ready)')

    const handleLiveStart = () => {
      console.log('[AudioManager] 🎵 Live started event received! Sending play command...')
      console.log('[AudioManager] Playlist length:', playlist.length)

      setCurrentIndex(0)

      // Send play command immediately if playlist loaded
      if (playlist.length > 0) {
        playNextSong()
      } else {
        console.warn('[AudioManager] ⚠️ Playlist not loaded, waiting...')
        // Retry after 200ms
        const retryInterval = setInterval(() => {
          if (playlist.length > 0) {
            clearInterval(retryInterval)
            console.log('[AudioManager] ✅ Playlist loaded, starting now!')
            playNextSong()
          }
        }, 200)

        // Timeout of 5 seconds
        setTimeout(() => {
          clearInterval(retryInterval)
          console.error('[AudioManager] ❌ Timeout waiting for playlist')
        }, 5000)
      }
    }

    socket.on('live:start', handleLiveStart)

    return () => {
      console.log('[AudioManager] ⚠️ Unregistering live:start listener')
      socket.off('live:start', handleLiveStart)
    }
  }, [socket, playlist])

  // Listener: live:stop → parar música
  useEffect(() => {
    if (!socket) return

    const handleLiveStop = () => {
      console.log('[AudioManager] ⛔ Live stopped! Stopping music...')
      stopMusic()
    }

    socket.on('live:stop', handleLiveStop)

    return () => {
      socket.off('live:stop', handleLiveStop)
    }
  }, [socket])

  // Listener: Próxima música quando currentIndex muda
  useEffect(() => {
    if (isLive && currentIndex > 0) {
      playNextSong()
    }
  }, [currentIndex])

  // Listeners de sons
  useEffect(() => {
    if (!socket) return

    const handleXPGain = (data: any) => {
      console.log('[AudioManager] 🎵 XP Gain sound:', data)
      playSFX(data.soundPath)
    }

    const handleDrop = (data: any) => {
      console.log('[AudioManager] 💥 Drop sound:', data)
      playSFX(data.soundPath)
    }

    const handleBuildUp = (data: any) => {
      console.log('[AudioManager] 📈 Build Up sound:', data)
      playSFX(data.soundPath)
    }

    const handleLevelUp = (data: any) => {
      console.log('[AudioManager] 🎉 Level Up sound:', data)
      playSFX(data.soundPath)
    }

    const handleViewerJoin = (data: any) => {
      console.log('[AudioManager] 👥 Viewer Join sound:', data)
      playSFX(data.soundPath)
    }

    const handleTransition = (data: any) => {
      console.log('[AudioManager] 🔄 Transition sound:', data)
      playSFX(data.soundPath)
    }

    socket.on('sound:xpGain', handleXPGain)
    socket.on('sound:drop', handleDrop)
    socket.on('sound:buildUp', handleBuildUp)
    socket.on('sound:levelUp', handleLevelUp)
    socket.on('sound:viewerJoin', handleViewerJoin)
    socket.on('sound:transition', handleTransition)

    return () => {
      socket.off('sound:xpGain', handleXPGain)
      socket.off('sound:drop', handleDrop)
      socket.off('sound:buildUp', handleBuildUp)
      socket.off('sound:levelUp', handleLevelUp)
      socket.off('sound:viewerJoin', handleViewerJoin)
      socket.off('sound:transition', handleTransition)
    }
  }, [socket])

  // Listener: level:up → atualizar currentLevel (para debug)
  useEffect(() => {
    if (!socket) return

    const handleLevelUp = (data: any) => {
      setCurrentLevel(data.newLevel)
      console.log('[AudioManager] Level updated to:', data.newLevel)
    }

    socket.on('level:up', handleLevelUp)

    return () => {
      socket.off('level:up', handleLevelUp)
    }
  }, [socket])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysisLoop()
      stopMusic()
    }
  }, [socket])

  // Este componente não renderiza nada
  return null
}
