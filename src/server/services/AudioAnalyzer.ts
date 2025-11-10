import { logger } from '../utils/logger.js'

export interface FrequencyAnalysis {
  bins: number[] // 256 bins (0-255 values)
  avgEnergy: number // average energy 0-100
  bassEnergy: number // bass frequencies energy
  midEnergy: number // mid frequencies energy
  trebleEnergy: number // treble frequencies energy
}

export interface BPMAnalysis {
  bpm: number // detected beats per minute
  confidence: number // 0-1, how confident we are
  beats: number[] // timestamps of detected beats
}

export interface AudioAnalysis extends FrequencyAnalysis, BPMAnalysis {
  isDrop: boolean // sudden energy decrease
  isBuildUp: boolean // gradual energy increase
  isKick: boolean // kick drum detected
  isBass: boolean // bass frequencies prominent
}

/**
 * Analyzes audio data and detects patterns
 * Works with simulated frequency data from AudioEngine
 */
export class AudioAnalyzer {
  private frequencyHistory: number[][] = []
  private energyHistory: number[] = []
  private bpmBuffer: number[] = []
  private maxHistoryLength = 200 // ~20 seconds at 10 updates/sec

  constructor() {
    logger.info('AudioAnalyzer initialized')
  }

  /**
   * Analyze frequency data
   */
  analyzeFrequency(frequencyData: number[]): FrequencyAnalysis {
    // Ensure we have 256 bins
    const bins = frequencyData.slice(0, 256)
    while (bins.length < 256) {
      bins.push(0)
    }

    // Calculate energy by frequency band
    const bassEnergy = this.calculateBandEnergy(bins, 0, 20) // ~20-250Hz
    const midEnergy = this.calculateBandEnergy(bins, 20, 120) // ~250-2kHz
    const trebleEnergy = this.calculateBandEnergy(bins, 120, 256) // ~2kHz+

    // Calculate average energy
    const avgEnergy = (bassEnergy + midEnergy + trebleEnergy) / 3

    // Store for history
    this.frequencyHistory.push(bins)
    this.energyHistory.push(avgEnergy)

    // Keep history size limited
    if (this.frequencyHistory.length > this.maxHistoryLength) {
      this.frequencyHistory.shift()
      this.energyHistory.shift()
    }

    return {
      bins,
      avgEnergy,
      bassEnergy,
      midEnergy,
      trebleEnergy,
    }
  }

  /**
   * Detect BPM from energy variations
   */
  detectBPM(frequencyAnalysis: FrequencyAnalysis): BPMAnalysis {
    // Use energy history to detect BPM
    // A simple approach: count peaks in the energy signal

    const energyData = this.energyHistory
    if (energyData.length < 10) {
      return {
        bpm: 120, // default
        confidence: 0,
        beats: [],
      }
    }

    // Find peaks in energy (potential beats)
    const beats: number[] = []
    for (let i = 1; i < energyData.length - 1; i++) {
      if (
        energyData[i] > energyData[i - 1] &&
        energyData[i] > energyData[i + 1] &&
        energyData[i] > 50
      ) {
        beats.push(i)
      }
    }

    // Calculate BPM from beat intervals
    // Assuming 100ms per sample, convert to seconds and then to BPM
    let bpm = 120
    let confidence = 0

    if (beats.length >= 2) {
      const intervals = []
      for (let i = 1; i < beats.length; i++) {
        intervals.push(beats[i] - beats[i - 1])
      }

      // Average interval in samples (100ms each)
      const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length
      const avgIntervalSeconds = avgInterval * 0.1 // 100ms per sample

      // Convert to BPM
      bpm = Math.round(60 / avgIntervalSeconds)

      // Confidence based on how consistent the intervals are
      const variance =
        intervals.reduce((sum, val) => sum + Math.pow(val - avgInterval, 2), 0) /
        intervals.length
      confidence = Math.max(0, 1 - variance / (avgInterval * avgInterval))
    }

    // Clamp BPM to realistic range
    bpm = Math.max(60, Math.min(200, bpm))

    return {
      bpm,
      confidence,
      beats,
    }
  }

  /**
   * Detect audio patterns (drop, build-up, kick, bass)
   */
  detectPatterns(frequencyAnalysis: FrequencyAnalysis): Partial<AudioAnalysis> {
    const { avgEnergy, bassEnergy, trebleEnergy } = frequencyAnalysis

    // Drop detection: sudden energy decrease
    const isDrop =
      this.energyHistory.length >= 2 &&
      this.energyHistory[this.energyHistory.length - 1] < 30 &&
      this.energyHistory[this.energyHistory.length - 2] > 70

    // Build-up detection: gradual energy increase over time
    const isBuildUp =
      this.energyHistory.length >= 5 &&
      this.energyHistory[this.energyHistory.length - 1] > 70 &&
      this.energyHistory[this.energyHistory.length - 5] < 50

    // Kick detection: sharp energy spike in bass
    const isKick =
      bassEnergy > 150 &&
      this.energyHistory.length >= 2 &&
      this.energyHistory[this.energyHistory.length - 2] < 80

    // Bass prominence
    const isBass = bassEnergy > midEnergy && bassEnergy > trebleEnergy

    return {
      isDrop,
      isBuildUp,
      isKick,
      isBass,
    }
  }

  /**
   * Full analysis
   */
  analyze(frequencyData: number[]): AudioAnalysis {
    const frequency = this.analyzeFrequency(frequencyData)
    const bpm = this.detectBPM(frequency)
    const patterns = this.detectPatterns(frequency)

    return {
      ...frequency,
      ...bpm,
      isDrop: patterns.isDrop || false,
      isBuildUp: patterns.isBuildUp || false,
      isKick: patterns.isKick || false,
      isBass: patterns.isBass || false,
    }
  }

  /**
   * Reset analyzer (e.g., when song changes)
   */
  reset(): void {
    this.frequencyHistory = []
    this.energyHistory = []
    this.bpmBuffer = []
    logger.info('AudioAnalyzer reset')
  }

  /**
   * Helper: calculate energy in a frequency band
   */
  private calculateBandEnergy(
    frequencyData: number[],
    startBin: number,
    endBin: number
  ): number {
    const bandData = frequencyData.slice(startBin, endBin)
    if (bandData.length === 0) return 0

    const sum = bandData.reduce((a, b) => a + b, 0)
    return (sum / bandData.length / 255) * 100 // Normalize to 0-100
  }
}

// Singleton instance
export const audioAnalyzer = new AudioAnalyzer()
