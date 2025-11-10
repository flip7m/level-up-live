import { useEffect, useRef } from 'react'
import './Waveform.css'

export function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const audioDataRef = useRef<number[]>([])
  const isPlayingRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (rect) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const centerY = canvas.height / 2
    const barCount = 100
    const barWidth = canvas.width / barCount

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#0F0A1E'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw center line
      ctx.strokeStyle = '#4c1d95'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, centerY)
      ctx.lineTo(canvas.width, centerY)
      ctx.stroke()

      // Draw waveform bars
      const audioData = audioDataRef.current
      const hasData = audioData.length > 0

      for (let i = 0; i < barCount; i++) {
        const x = i * barWidth

        // Get audio data or use low baseline
        let barHeight: number
        if (hasData && isPlayingRef.current) {
          // Map audio data to bar (sample from available data)
          const dataIndex = Math.floor((i / barCount) * audioData.length)
          const value = audioData[dataIndex] || 0
          barHeight = (value / 255) * (canvas.height * 0.4)
        } else {
          // Idle state - minimal bars
          barHeight = 2
        }

        // Draw upper bar
        const opacity = isPlayingRef.current ? 0.8 : 0.3
        ctx.fillStyle = `hsla(280, 80%, 60%, ${opacity})`
        ctx.fillRect(x, centerY - barHeight, barWidth - 1, barHeight)

        // Draw lower bar (mirrored)
        ctx.fillStyle = `hsla(280, 80%, 50%, ${opacity * 0.9})`
        ctx.fillRect(x, centerY, barWidth - 1, barHeight)
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Listen for audio analysis data from AudioManager (via custom event)
  useEffect(() => {
    const handleAudioData = (event: Event) => {
      const customEvent = event as CustomEvent<{ frequencies: number[]; playing: boolean }>
      const data = customEvent.detail
      console.log('[Waveform] Received audio data:', data.frequencies.length, 'frequencies, playing:', data.playing)
      audioDataRef.current = data.frequencies
      isPlayingRef.current = data.playing
    }

    window.addEventListener('audio:analysis', handleAudioData)
    console.log('[Waveform] Listening for audio:analysis custom events')

    return () => {
      window.removeEventListener('audio:analysis', handleAudioData)
    }
  }, [])

  return (
    <div className="waveform-container">
      <canvas ref={canvasRef} className="waveform-canvas" />
    </div>
  )
}
