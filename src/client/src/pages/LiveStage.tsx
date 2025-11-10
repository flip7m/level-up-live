import { useEffect, useRef, useState } from 'react'
import { useWebSocket } from '../hooks/useWebSocket'
import { useLiveStore } from '../stores/liveStore'
import { useLevels } from '../hooks/useLevels'
import { Waveform } from '../components/audio/Waveform'
import { ProceduralEffect, ProceduralEffectType } from '../components/event/ProceduralEffect'
import '../styles/livestage.css'

interface Layer {
  id: string
  type: 'background' | 'stage' | 'crowd' | 'effects'
  url: string
  opacity?: number
  zIndex?: number
}

interface EventLayer {
  id: string
  eventId: string
  eventName: string
  type: 'image' | 'video' | 'browser' | 'text'
  url: string
  opacity: number
  zIndex: number
  transform: {
    x: number
    y: number
    width: number
    height: number
    rotation: number
    opacity: number
  }
}

export function LiveStage() {
  const socket = useWebSocket()
  const { currentLevel } = useLiveStore()
  const { levels, fetchLevels } = useLevels()
  const stageRef = useRef<HTMLDivElement>(null)
  const [layers, setLayers] = useState<Layer[]>([])
  const [eventLayers, setEventLayers] = useState<EventLayer[]>([])
  const [proceduralEffects, setProceduralEffects] = useState<
    Array<{
      id: string
      effectType: ProceduralEffectType
      duration: number
      config?: any
    }>
  >([])
  const [showWaveform, setShowWaveform] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Fetch levels on mount
  useEffect(() => {
    fetchLevels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch level data when currentLevel changes
  useEffect(() => {
    if (currentLevel !== null && levels.length > 0) {
      const level = levels.find((l) => l.order === currentLevel)
      if (level && level.layers) {
        // Convert level layers to renderable format
        const renderedLayers: Layer[] = []
        let zIndex = 0

        // Add background
        if (level.layers.background) {
          renderedLayers.push({
            id: `${currentLevel}-background`,
            type: 'background',
            url: level.layers.background,
            opacity: 1,
            zIndex: zIndex++,
          })
        }

        // Add stage
        if (level.layers.stage) {
          renderedLayers.push({
            id: `${currentLevel}-stage`,
            type: 'stage',
            url: level.layers.stage,
            opacity: 1,
            zIndex: zIndex++,
          })
        }

        // Add crowd
        if (level.layers.crowd) {
          renderedLayers.push({
            id: `${currentLevel}-crowd`,
            type: 'crowd',
            url: level.layers.crowd,
            opacity: 1,
            zIndex: zIndex++,
          })
        }

        // Add effects layers
        if (level.layers.effects && Array.isArray(level.layers.effects)) {
          level.layers.effects.forEach((effect, index: number) => {
            // Handle both old string format and new LayerTransform format
            const effectPath = typeof effect === 'string' ? effect : effect.path
            renderedLayers.push({
              id: `${currentLevel}-effect-${index}`,
              type: 'effects',
              url: effectPath,
              opacity: 1,
              zIndex: zIndex++,
            })
          })
        }

        setLayers(renderedLayers)
      }
    }
  }, [currentLevel, levels])

  // Handle level-up and events
  useEffect(() => {
    if (!socket) return

    const handleLevelUp = (data: any) => {
      console.log('[LiveStage] Level up event:', data)
      // Level layers will update automatically via currentLevel change
    }

    const handleEventTriggered = async (data: any) => {
      console.log('[LiveStage] Event triggered:', data)

      try {
        // Check if it's a procedural effect
        if (data.effectType) {
          // Procedural effect (Canvas-based)
          console.log('[LiveStage] Rendering procedural effect:', data.effectType)
          setProceduralEffects((prev) => [
            ...prev,
            {
              id: data.eventId,
              effectType: data.effectType,
              duration: data.duration,
              config: data.effectConfig || {},
            },
          ])

          // Play event sounds (if any)
          if (data.sounds && data.sounds.length > 0) {
            data.sounds.forEach((soundPath: string) => {
              const audio = new Audio(soundPath)
              audio.volume = 0.7
              audio.play().catch((err) => console.error('Error playing event sound:', err))
            })
          }

          // Remove after duration (handled by ProceduralEffect component)
        } else if (data.assets && data.assets.layers) {
          // Image/Video layers (original system)
          console.log('[LiveStage] Rendering event layers:', data.name)

          // Convert event layers to EventLayer format
          const newEventLayers: EventLayer[] = data.assets.layers.map((layer: any) => ({
            id: layer.id,
            eventId: data.eventId,
            eventName: data.name,
            type: layer.type,
            url: layer.source,
            opacity: layer.transform.opacity,
            zIndex: layer.order,
            transform: layer.transform,
          }))

          // Add event layers to state
          setEventLayers((prev) => [...prev, ...newEventLayers])

          // Play event sounds (if any)
          if (data.assets.sounds && data.assets.sounds.length > 0) {
            data.assets.sounds.forEach((soundPath: string) => {
              const audio = new Audio(soundPath)
              audio.volume = 0.7
              audio.play().catch((err) => console.error('Error playing event sound:', err))
            })
          }

          // Schedule removal after duration
          setTimeout(() => {
            setEventLayers((prev) => prev.filter((layer) => layer.eventId !== data.eventId))
          }, data.duration * 1000)
        }
      } catch (error) {
        console.error('[LiveStage] Error loading event:', error)
      }
    }

    const handleEventEnded = (data: any) => {
      console.log('[LiveStage] Event ended:', data)
      // Remove event layers
      setEventLayers((prev) => prev.filter((layer) => layer.eventId !== data.eventId))
    }

    socket.on('level:up', handleLevelUp)
    socket.on('event:triggered', handleEventTriggered)
    socket.on('event:ended', handleEventEnded)

    return () => {
      socket.off('level:up', handleLevelUp)
      socket.off('event:triggered', handleEventTriggered)
      socket.off('event:ended', handleEventEnded)
    }
  }, [socket])

  // Handle fullscreen with F key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          stageRef.current?.requestFullscreen().catch((err) => {
            console.error('Error attempting to enable fullscreen:', err)
          })
          setIsFullscreen(true)
        } else {
          document.exitFullscreen()
          setIsFullscreen(false)
        }
      }

      // Hide waveform with W key
      if (e.key.toLowerCase() === 'w') {
        setShowWaveform((prev) => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Render a layer as background image or video
  const renderLayer = (layer: Layer) => {
    const isVideo = layer.url?.endsWith('.mp4') || layer.url?.endsWith('.webm')

    return (
      <div
        key={layer.id}
        className="livestage-layer"
        style={{
          zIndex: layer.zIndex,
          opacity: layer.opacity,
          backgroundImage: !isVideo ? `url(${layer.url})` : undefined,
        }}
      >
        {isVideo && (
          <video
            autoPlay
            loop
            muted
            className="livestage-video"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          >
            <source src={layer.url} type={layer.url?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>
        )}
      </div>
    )
  }

  // Render an event layer with transforms and animations
  const renderEventLayer = (layer: EventLayer) => {
    const isVideo = layer.url?.endsWith('.mp4') || layer.url?.endsWith('.webm')
    const { transform } = layer

    return (
      <div
        key={layer.id}
        className="livestage-event-layer livestage-event-layer-enter"
        style={{
          position: 'absolute',
          left: `${transform.x}px`,
          top: `${transform.y}px`,
          width: `${transform.width}px`,
          height: `${transform.height}px`,
          zIndex: layer.zIndex,
          opacity: transform.opacity,
          transform: `rotate(${transform.rotation}deg)`,
          pointerEvents: 'none',
          transition: 'opacity 0.5s ease-in-out',
        }}
        title={layer.eventName}
      >
        {!isVideo ? (
          <img
            src={layer.url}
            alt={layer.eventName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <video
            autoPlay
            loop
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          >
            <source src={layer.url} type={layer.url?.endsWith('.webm') ? 'video/webm' : 'video/mp4'} />
          </video>
        )}
      </div>
    )
  }

  return (
    <div
      ref={stageRef}
      className={`livestage-container ${isFullscreen ? 'livestage-fullscreen' : ''}`}
    >
      {/* Render layers */}
      <div className="livestage-scene">
        {layers.length > 0 ? (
          <>
            {/* Level layers (z-index 0-99) */}
            {layers.map(renderLayer)}

            {/* Event layers (z-index 100+) */}
            {eventLayers.map(renderEventLayer)}

            {/* Procedural effects (z-index 1000+) */}
            {proceduralEffects.map((effect) => (
              <ProceduralEffect
                key={effect.id}
                effectType={effect.effectType}
                duration={effect.duration}
                config={effect.config}
                onComplete={() => {
                  // Remove effect from state when complete
                  setProceduralEffects((prev) => prev.filter((e) => e.id !== effect.id))
                }}
              />
            ))}
          </>
        ) : (
          <div className="livestage-placeholder">
            <div className="livestage-no-content">
              <h1>Level {currentLevel ? currentLevel + 1 : 1}</h1>
              <p>Scene layers loading...</p>
            </div>
          </div>
        )}
      </div>

      {/* Waveform overlay (for visual feedback) */}
      {showWaveform && !isFullscreen && (
        <div className="livestage-waveform-overlay">
          <Waveform />
        </div>
      )}

      {/* Info overlay (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="livestage-info-overlay">
          <div className="livestage-info-content">
            <p>Level {currentLevel ? currentLevel + 1 : 1}</p>
            <p className="livestage-info-hint">Press F for fullscreen | W to toggle waveform</p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {layers.length === 0 && (
        <div className="livestage-loading">
          <div className="livestage-spinner"></div>
        </div>
      )}
    </div>
  )
}
