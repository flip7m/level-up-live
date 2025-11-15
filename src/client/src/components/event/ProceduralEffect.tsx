import { useEffect, useRef } from 'react'

export type ProceduralEffectType =
  | 'confetti'
  | 'fireworks'
  | 'flash'
  | 'particle-burst'
  | 'rainbow-wave'
  | 'screen-shake'

interface ProceduralEffectProps {
  effectType: ProceduralEffectType
  duration: number
  onComplete?: () => void
  config?: {
    colors?: string[]
    particleCount?: number
    intensity?: number
  }
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  alpha: number
  life: number
}

interface Rocket {
  x: number
  y: number
  vy: number
  color: string
  exploded: boolean
  targetY: number
}

const DEFAULT_COLORS = ['#EC4899', '#8B5CF6', '#6366F1', '#F59E0B', '#10B981', '#EF4444']

export function ProceduralEffect({
  effectType,
  duration,
  onComplete,
  config = {},
}: ProceduralEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container (1920x1080 for OBS)
    canvas.width = 1920
    canvas.height = 1080

    const particles: Particle[] = []
    const rockets: Rocket[] = []
    const colors = config.colors || DEFAULT_COLORS

    // Initialize effect
    switch (effectType) {
      case 'confetti':
        initConfetti(particles, colors, config.particleCount || 150)
        break
      case 'fireworks':
        // Fireworks spawn rockets over time
        break
      case 'particle-burst':
        initParticleBurst(particles, colors, config.particleCount || 100)
        break
    }

    let shakeOffsetX = 0
    let shakeOffsetY = 0
    let flashAlpha = 1
    let waveOffset = 0

    // Animation loop
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = elapsed / (duration * 1000)

      if (progress >= 1) {
        onComplete?.()
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      switch (effectType) {
        case 'confetti':
          animateConfetti(ctx, particles, canvas)
          break

        case 'fireworks':
          animateFireworks(ctx, particles, rockets, colors, canvas, elapsed)
          break

        case 'flash':
          animateFlash(ctx, canvas, flashAlpha, colors)
          flashAlpha = Math.max(0, flashAlpha - 0.05)
          break

        case 'particle-burst':
          animateParticleBurst(ctx, particles, canvas)
          break

        case 'rainbow-wave':
          animateRainbowWave(ctx, canvas, waveOffset)
          waveOffset += 5
          break

        case 'screen-shake':
          animateScreenShake(canvas, shakeOffsetX, shakeOffsetY, progress)
          shakeOffsetX = (Math.random() - 0.5) * (config.intensity || 20)
          shakeOffsetY = (Math.random() - 0.5) * (config.intensity || 20)
          break
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [effectType, duration, onComplete, config])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1000 }}
    />
  )
}

// ============================================================================
// CONFETTI
// ============================================================================
function initConfetti(particles: Particle[], colors: string[], count: number) {
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * 1920,
      y: Math.random() * -500,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 2 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      alpha: 1,
      life: 1,
    })
  }
}

function animateConfetti(ctx: CanvasRenderingContext2D, particles: Particle[], canvas: HTMLCanvasElement) {
  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.15 // gravity
    p.rotation += p.rotationSpeed

    // Bounce off sides
    if (p.x < 0 || p.x > canvas.width) {
      p.vx *= -0.5
    }

    ctx.save()
    ctx.translate(p.x, p.y)
    ctx.rotate((p.rotation * Math.PI) / 180)
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
    ctx.restore()

    // Fade out at bottom
    if (p.y > canvas.height - 200) {
      p.alpha = Math.max(0, p.alpha - 0.02)
    }
  })
}

// ============================================================================
// FIREWORKS
// ============================================================================
function animateFireworks(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  rockets: Rocket[],
  colors: string[],
  canvas: HTMLCanvasElement,
  elapsed: number
) {
  // Spawn rockets every 400ms
  if (elapsed % 400 < 16 && rockets.length < 5) {
    const color = colors[Math.floor(Math.random() * colors.length)]
    rockets.push({
      x: Math.random() * canvas.width,
      y: canvas.height,
      vy: -(Math.random() * 8 + 12), // upward velocity
      color,
      exploded: false,
      targetY: Math.random() * 300 + 200,
    })
  }

  // Update rockets
  rockets.forEach((rocket, index) => {
    if (!rocket.exploded) {
      rocket.y += rocket.vy
      rocket.vy += 0.2 // gravity

      // Draw rocket trail
      ctx.fillStyle = rocket.color
      ctx.globalAlpha = 0.8
      ctx.fillRect(rocket.x - 2, rocket.y, 4, 10)

      // Explode at target height
      if (rocket.y <= rocket.targetY) {
        rocket.exploded = true
        createFireworkExplosion(particles, rocket.x, rocket.y, rocket.color)
        rockets.splice(index, 1)
      }
    }
  })

  // Update particles
  particles.forEach((p, index) => {
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.1 // gravity
    p.alpha -= 0.01
    p.life -= 0.01

    if (p.life <= 0) {
      particles.splice(index, 1)
      return
    }

    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.globalAlpha = 1
}

function createFireworkExplosion(particles: Particle[], x: number, y: number, color: string) {
  const particleCount = 80
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.PI * 2 * i) / particleCount
    const speed = Math.random() * 5 + 3
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color,
      size: Math.random() * 3 + 2,
      rotation: 0,
      rotationSpeed: 0,
      alpha: 1,
      life: 1,
    })
  }
}

// ============================================================================
// FLASH
// ============================================================================
function animateFlash(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  alpha: number,
  colors: string[]
) {
  ctx.globalAlpha = alpha
  ctx.fillStyle = colors[0] || '#FFFFFF'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
}

// ============================================================================
// PARTICLE BURST
// ============================================================================
function initParticleBurst(particles: Particle[], colors: string[], count: number) {
  const centerX = 1920 / 2
  const centerY = 1080 / 2

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = Math.random() * 8 + 4
    particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 3,
      rotation: 0,
      rotationSpeed: 0,
      alpha: 1,
      life: 1,
    })
  }
}

function animateParticleBurst(ctx: CanvasRenderingContext2D, particles: Particle[], canvas: HTMLCanvasElement) {
  particles.forEach((p) => {
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 0.015
    p.life -= 0.015

    // Draw trail
    ctx.globalAlpha = p.alpha * 0.3
    ctx.strokeStyle = p.color
    ctx.lineWidth = p.size
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3)
    ctx.stroke()

    // Draw particle
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.globalAlpha = 1
}

// ============================================================================
// RAINBOW WAVE
// ============================================================================
function animateRainbowWave(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, offset: number) {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  const colors = ['#EC4899', '#8B5CF6', '#6366F1', '#10B981', '#F59E0B', '#EF4444']

  colors.forEach((color, i) => {
    const position = ((i / colors.length + offset / canvas.width) % 1)
    gradient.addColorStop(position, color)
  })

  ctx.globalAlpha = 0.4
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
}

// ============================================================================
// SCREEN SHAKE
// ============================================================================
function animateScreenShake(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, progress: number) {
  // Reduce shake intensity over time
  const intensity = 1 - progress
  canvas.style.transform = `translate(${offsetX * intensity}px, ${offsetY * intensity}px)`
}
