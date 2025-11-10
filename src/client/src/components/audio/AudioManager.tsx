import { useEffect, useState, useRef } from 'react'
import { Howl } from 'howler'
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
  const musicHowlRef = useRef<Howl | null>(null)

  // Web Audio API para análise
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const progressIntervalRef = useRef<number | null>(null)

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
        const response = await fetch('http://localhost:8881/api/playlist')
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

  // Função para tocar próxima música
  const playNextSong = () => {
    if (playlist.length === 0) {
      console.warn('[AudioManager] No songs in playlist')
      return
    }

    // Parar música atual se existir
    if (musicHowlRef.current) {
      musicHowlRef.current.unload()
      musicHowlRef.current = null
    }

    const song = playlist[currentIndex]
    console.log(`[AudioManager] 🎵 Playing: ${song.title || song.filename} (${currentIndex + 1}/${playlist.length})`)

    // Update audioStore with current song
    setCurrentSong(song)

    // Criar nova instância Howl para a música
    musicHowlRef.current = new Howl({
      src: [`http://localhost:8881/assets/music/${song.filename}`],
      html5: true,
      volume: 0.7,
      // Removed onload audio analysis setup (causes CORS and audio to not play)
      onplay: () => {
        // Start progress tracking when playing starts
        startProgressTracking()
        // Start visual-only analysis (fake data for now)
        startVisualAnalysis()
      },
      onend: () => {
        // Próxima música (loop)
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
      },
      onloaderror: (id, error) => {
        console.error('[AudioManager] Error loading song:', error)
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
      },
      onplayerror: (id, error) => {
        console.error('[AudioManager] Error playing song:', error)
        setCurrentIndex((prev) => (prev + 1) % playlist.length)
      }
    })

    musicHowlRef.current.play()

    // Emitir evento para atualizar NowPlaying com música atual e próxima
    if (socket) {
      const nextIndex = (currentIndex + 1) % playlist.length
      const nextSong = playlist[nextIndex]
      socket.emit('audio:nowplaying', { song, nextSong })
    }
  }

  // Função para parar música
  const stopMusic = () => {
    stopAnalysisLoop() // Stops visual analysis
    stopProgressTracking()
    if (musicHowlRef.current) {
      musicHowlRef.current.unload()
      musicHowlRef.current = null
    }
    setCurrentSong(null)

    // Send stopped state to waveform via custom event
    window.dispatchEvent(
      new CustomEvent('audio:analysis', {
        detail: {
          frequencies: [],
          playing: false,
        },
      })
    )

    console.log('[AudioManager] Music stopped')
  }

  // Função para tocar efeito sonoro
  const playSFX = (soundPath: string) => {
    if (!soundPath || soundPath.trim() === '') {
      console.debug('[AudioManager] No sound path provided, skipping')
      return
    }

    console.log('[AudioManager] 🔊 Playing SFX:', soundPath)

    const sfx = new Howl({
      src: [`http://localhost:8881/${soundPath}`],
      volume: 0.8,
      onloaderror: (id, err) => {
        console.error('[AudioManager] Failed to load sound:', soundPath, err)
      },
      onplayerror: (id, err) => {
        console.error('[AudioManager] Failed to play sound:', soundPath, err)
      }
    })

    sfx.play()
  }

  // Setup Web Audio API for analysis
  const setupAudioAnalysis = (howl: Howl) => {
    try {
      // Get the HTML audio element from Howler
      const audioElement = (howl as any)._sounds[0]._node

      if (!audioElement) {
        console.warn('[AudioManager] No audio element found for analysis')
        return
      }

      // Create AudioContext if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const ctx = audioContextRef.current

      // Create analyser if not exists
      if (!analyserRef.current) {
        analyserRef.current = ctx.createAnalyser()
        analyserRef.current.fftSize = 256
        analyserRef.current.connect(ctx.destination)
      }

      // Create source node if not exists or if it's different
      if (!sourceNodeRef.current) {
        sourceNodeRef.current = ctx.createMediaElementSource(audioElement)
        sourceNodeRef.current.connect(analyserRef.current)
      }

      // Start analysis loop
      startAnalysisLoop()
    } catch (err) {
      console.error('[AudioManager] Error setting up audio analysis:', err)
    }
  }

  // Visual analysis (simulated data - Web Audio API causes CORS issues)
  const startVisualAnalysis = () => {
    const analyze = () => {
      if (!musicHowlRef.current?.playing()) {
        return
      }

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

  // Start progress tracking
  const startProgressTracking = () => {
    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
    }

    // Update progress every 100ms
    progressIntervalRef.current = window.setInterval(() => {
      const howl = musicHowlRef.current
      if (howl && howl.playing()) {
        const seek = howl.seek() as number
        setProgress(seek)
        setPlaying(true)
      } else {
        setPlaying(false)
      }
    }, 100)
  }

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    setProgress(0)
    setPlaying(false)
  }

  // Listener: live:start → tocar música
  useEffect(() => {
    if (!socket) {
      console.warn('[AudioManager] Socket not available yet for live:start listener')
      return
    }

    console.log('[AudioManager] ✅ Registering live:start listener (socket ready)')

    const handleLiveStart = () => {
      console.log('[AudioManager] 🎵 Live started event received! Starting music...')
      console.log('[AudioManager] Playlist length:', playlist.length)

      // Reset e iniciar do zero
      if (musicHowlRef.current) {
        musicHowlRef.current.unload()
        musicHowlRef.current = null
      }

      setCurrentIndex(0)

      // Tocar imediatamente se playlist já carregou
      if (playlist.length > 0) {
        playNextSong()
      } else {
        console.warn('[AudioManager] ⚠️ Playlist not loaded, waiting...')
        // Retry depois de 1 segundo
        const retryInterval = setInterval(() => {
          if (playlist.length > 0) {
            clearInterval(retryInterval)
            console.log('[AudioManager] ✅ Playlist loaded, starting now!')
            playNextSong()
          }
        }, 200)

        // Timeout de 5 segundos
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

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      stopAnalysisLoop()
      stopProgressTracking()
      if (musicHowlRef.current) {
        musicHowlRef.current.unload()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  // Este componente não renderiza nada
  return null
}
