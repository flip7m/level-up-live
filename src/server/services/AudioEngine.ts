import { EventEmitter } from 'events'
import { logger } from '../utils/logger.js'

export interface AudioState {
  playing: boolean
  paused: boolean
  currentTrack: string | null
  progress: number // in seconds
  duration: number // in seconds
  volume: number // 0-1
}

export interface AudioAnalysisData {
  bpm: number
  energy: number // 0-100
  frequencyData: number[] // 0-255 for each frequency bin
  isBass: boolean
  isDrop: boolean
  isBuildUp: boolean
}

export class AudioEngine extends EventEmitter {
  private state: AudioState = {
    playing: false,
    paused: false,
    currentTrack: null,
    progress: 0,
    duration: 0,
    volume: 0.7,
  }

  private analysisData: AudioAnalysisData = {
    bpm: 0,
    energy: 0,
    frequencyData: new Array(256).fill(0),
    isBass: false,
    isDrop: false,
    isBuildUp: false,
  }

  // Simulated playback
  private playbackInterval: NodeJS.Timer | null = null
  private startTime: number = 0
  private pauseTime: number = 0

  constructor() {
    super()
    logger.info('AudioEngine initialized')
  }

  /**
   * Play audio
   */
  play(trackPath: string, duration: number = 0): void {
    try {
      this.state.playing = true
      this.state.paused = false
      this.state.currentTrack = trackPath
      this.state.duration = duration
      this.startTime = Date.now() - this.state.progress * 1000

      this.startPlaybackSimulation()

      logger.info(`Playing: ${trackPath}`)
      this.emit('play', { track: trackPath, duration })
    } catch (err) {
      logger.error('Failed to play audio', err)
      this.emit('error', err)
    }
  }

  /**
   * Pause audio
   */
  pause(): void {
    this.state.playing = false
    this.state.paused = true
    this.pauseTime = Date.now()

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
      this.playbackInterval = null
    }

    logger.info('Audio paused')
    this.emit('pause')
  }

  /**
   * Resume audio
   */
  resume(): void {
    if (!this.state.paused) return

    this.state.playing = true
    this.state.paused = false
    this.startTime = Date.now() - this.state.progress * 1000

    this.startPlaybackSimulation()

    logger.info('Audio resumed')
    this.emit('resume')
  }

  /**
   * Stop audio
   */
  stop(): void {
    this.state.playing = false
    this.state.paused = false
    this.state.currentTrack = null
    this.state.progress = 0

    if (this.playbackInterval) {
      clearInterval(this.playbackInterval)
      this.playbackInterval = null
    }

    logger.info('Audio stopped')
    this.emit('stop')
  }

  /**
   * Seek to time
   */
  seek(time: number): void {
    this.state.progress = Math.max(0, Math.min(time, this.state.duration))
    this.startTime = Date.now() - this.state.progress * 1000

    logger.info(`Seeking to ${time}s`)
    this.emit('seek', { time: this.state.progress })
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.state.volume = Math.max(0, Math.min(1, volume))
    logger.info(`Volume: ${Math.round(this.state.volume * 100)}%`)
    this.emit('volumeChange', { volume: this.state.volume })
  }

  /**
   * Get current state
   */
  getState(): AudioState {
    return { ...this.state }
  }

  /**
   * Get analysis data
   */
  getAnalysis(): AudioAnalysisData {
    return { ...this.analysisData }
  }

  /**
   * Simulate audio playback and analysis
   */
  private startPlaybackSimulation(): void {
    if (this.playbackInterval) clearInterval(this.playbackInterval)

    this.playbackInterval = setInterval(() => {
      if (!this.state.playing) return

      // Update progress
      this.state.progress = (Date.now() - this.startTime) / 1000

      // Check if finished
      if (this.state.progress >= this.state.duration) {
        this.stop()
        this.emit('ended')
        return
      }

      // Simulate audio analysis
      this.updateAnalysis()

      // Emit state update every 100ms
      this.emit('state', this.getState())
    }, 100)
  }

  /**
   * Simulate audio analysis (FFT, BPM, energy, etc)
   */
  private updateAnalysis(): void {
    // Simulate frequency data (0-255)
    const frequencyData = new Array(256)
    for (let i = 0; i < 256; i++) {
      // Create a more realistic frequency response
      const baseValue = Math.random() * 50
      const peakValue = Math.sin(i / 256 * Math.PI) * 100
      frequencyData[i] = Math.max(0, Math.min(255, baseValue + peakValue))
    }

    // Calculate energy (average of frequencies)
    const energy = Math.min(100, frequencyData.reduce((a, b) => a + b) / 256 * 1.5)

    // Simulate BPM detection (between 90-180)
    const bpm = 120 + Math.sin(this.state.progress / 10) * 30

    // Detect if bass is prominent
    const bassEnergy = frequencyData.slice(0, 20).reduce((a, b) => a + b) / 20
    const isBass = bassEnergy > 150

    // Simulate drop detection (sudden energy decrease)
    const isDrop = energy < 30 && Math.random() < 0.1

    // Simulate build-up detection (gradual energy increase)
    const isBuildUp = energy > 70 && Math.random() < 0.15

    this.analysisData = {
      frequencyData: frequencyData.map(v => Math.round(v)),
      energy: Math.round(energy),
      bpm: Math.round(bpm),
      isBass,
      isDrop,
      isBuildUp,
    }

    // Emit analysis data
    this.emit('analysis', this.getAnalysis())

    // Emit specific events
    if (isDrop) {
      logger.debug('Drop detected')
      this.emit('drop-detected', { energy })
    }
    if (isBuildUp) {
      logger.debug('Build up detected')
      this.emit('build-up', { energy })
    }
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
