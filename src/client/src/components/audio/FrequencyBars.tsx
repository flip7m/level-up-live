import { useEffect, useRef } from 'react'
import { useAudioStore } from '../../stores/audioStore'
import './FrequencyBars.css'

export function FrequencyBars() {
  const { analysis } = useAudioStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barsRef = useRef<number[]>(new Array(32).fill(0))
  const smoothingRef = useRef<number[]>(new Array(32).fill(0))
  const animationRef = useRef<number | null>(null)

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

    const barWidth = canvas.width / 32
    const barGap = 2
    const barPadding = 1

    const drawBars = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(15, 10, 30, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update bars from analysis data
      if (analysis?.frequencies) {
        const frequencies = analysis.frequencies as number[]
        for (let i = 0; i < 32; i++) {
          // Get frequency value (0-1)
          const freqValue = frequencies[i] !== undefined ? frequencies[i] : 0
          // Smooth the value
          smoothingRef.current[i] = smoothingRef.current[i] * 0.7 + freqValue * 0.3
          // Store for decay animation
          barsRef.current[i] = smoothingRef.current[i]
        }
      } else {
        // Decay animation when no analysis
        for (let i = 0; i < 32; i++) {
          barsRef.current[i] = barsRef.current[i] * 0.9
        }
      }

      // Draw bars
      for (let i = 0; i < 32; i++) {
        const barHeight = (barsRef.current[i] || 0) * canvas.height
        const x = i * barWidth + barPadding
        const y = canvas.height - barHeight

        // Gradient color based on frequency (low=blue, mid=purple, high=pink)
        const hue = 270 + (i / 32) * 30 // 270° (purple) to 300° (pink)
        const saturation = 80 + (barsRef.current[i] || 0) * 20
        const lightness = 50 + (barsRef.current[i] || 0) * 10

        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`

        // Draw bar with rounded top
        const radius = 3
        ctx.beginPath()
        ctx.moveTo(x, y + radius)
        ctx.lineTo(x, canvas.height - barGap)
        ctx.lineTo(x + barWidth - barPadding * 2, canvas.height - barGap)
        ctx.lineTo(x + barWidth - barPadding * 2, y + radius)
        ctx.arcTo(
          x + barWidth - barPadding * 2,
          y,
          x,
          y,
          radius
        )
        ctx.arcTo(x, y, x, y + radius, radius)
        ctx.fill()

        // Glow effect for high energy
        if ((barsRef.current[i] || 0) > 0.7) {
          ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness}%, 0.5)`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(drawBars)
    }

    drawBars()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [analysis])

  return (
    <div className="frequency-bars-container">
      <canvas ref={canvasRef} className="frequency-bars-canvas" />
    </div>
  )
}
