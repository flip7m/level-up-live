import { EventEmitter } from 'events'
import { XPEvent, Level } from '@shared/types'
import { SoundService } from './SoundService'
import { LevelRepository } from '../database/repositories/LevelRepository.js'
import { logger } from '../utils/logger.js'

export interface XPConfig {
  sources: {
    audioDrop: number
    audioBuildUp: number
    manualTrigger: number
  }
  multipliers: {
    comboMax: number
    comboDecay: number
    timeBonusPerMinute: number
  }
}

export interface XPState {
  currentXP: number
  currentLevel: number
  totalXPEarned: number
  comboCount: number
  lastEventTime: number
  sessionStartTime: number
}

export class XPService extends EventEmitter {
  private state: XPState
  private config: XPConfig
  private xpHistory: XPEvent[] = []
  private soundService: SoundService | null = null
  private levelRepository: LevelRepository
  private levelThresholds: Map<number, number> = new Map() // order -> xpThreshold
  private maxLevel: number = 1

  constructor(levelRepository: LevelRepository, config?: Partial<XPConfig>) {
    super()
    this.levelRepository = levelRepository

    this.config = {
      sources: {
        audioDrop: 2,
        audioBuildUp: 1,
        manualTrigger: 10,
        ...config?.sources,
      },
      multipliers: {
        comboMax: 2.0, // 2x multiplier at max combo
        comboDecay: 5000, // Combo decays after 5 seconds of inactivity
        timeBonusPerMinute: 0.1, // 10% bonus per minute of live
        ...config?.multipliers,
      },
    }

    const now = Date.now()
    this.state = {
      currentXP: 0,
      currentLevel: 1,
      totalXPEarned: 0,
      comboCount: 0,
      lastEventTime: now,
      sessionStartTime: now,
    }

    this.setupAutoDecayCombo()
  }

  /**
   * Initialize service - load level thresholds from database
   * MUST be called after construction
   */
  public async initialize(): Promise<void> {
    await this.loadLevelThresholds()
    logger.info('[XPService] Initialized with thresholds from database:',
      Array.from(this.levelThresholds.entries()))
  }

  /**
   * Load level thresholds from database
   */
  private async loadLevelThresholds(): Promise<void> {
    try {
      const levels = await this.levelRepository.getAllLevels()

      this.levelThresholds.clear()
      this.maxLevel = levels.length

      // Build map: level order -> XP threshold
      for (const level of levels) {
        this.levelThresholds.set(level.order, level.xpThreshold)
      }

      logger.info(`[XPService] Loaded ${levels.length} level thresholds from database`)
    } catch (err) {
      logger.error('[XPService] Error loading level thresholds:', err)
      throw err
    }
  }

  /**
   * Reload level thresholds from database (call when levels are modified)
   */
  public async reloadLevelThresholds(): Promise<void> {
    await this.loadLevelThresholds()
    logger.info('[XPService] Reloaded level thresholds from database')
  }

  /**
   * Set SoundService instance for sound emission
   */
  public setSoundService(soundService: SoundService): void {
    this.soundService = soundService
  }

  /**
   * Add XP from an audio trigger (drop, build-up)
   */
  public async addAudioXP(triggerType: 'drop' | 'buildUp'): Promise<XPState> {
    const baseXP =
      triggerType === 'drop'
        ? this.config.sources.audioDrop
        : this.config.sources.audioBuildUp

    // Emit sound if SoundService is available
    if (this.soundService) {
      const levelId = await this.soundService.getLevelIdByOrder(this.state.currentLevel)
      if (levelId) {
        if (triggerType === 'drop') {
          await this.soundService.playDropSound(levelId)
        } else {
          await this.soundService.playBuildUpSound(levelId)
        }
      }
    }

    return this.addXP(baseXP, triggerType === 'drop' ? 'audioDrop' : 'audioBuildUp')
  }

  /**
   * Add XP from manual trigger
   */
  public addManualXP(amount: number = this.config.sources.manualTrigger): XPState {
    return this.addXP(amount, 'manualTrigger')
  }

  /**
   * Internal XP addition with multipliers
   */
  private addXP(baseXP: number, source: keyof XPConfig['sources']): XPState {
    const now = Date.now()
    const timeSinceLastEvent = now - this.state.lastEventTime

    // Check if combo should decay
    if (timeSinceLastEvent > this.config.multipliers.comboDecay) {
      this.state.comboCount = 0
    }

    // Calculate multipliers
    const comboMultiplier = this.calculateComboMultiplier()
    const timeBonus = this.calculateTimeBonus()
    const totalMultiplier = comboMultiplier + timeBonus

    // Calculate final XP
    const finalXP = Math.floor(baseXP * totalMultiplier)

    // Update state
    this.state.currentXP += finalXP
    this.state.totalXPEarned += finalXP
    this.state.comboCount += 1
    this.state.lastEventTime = now

    // Emit XP gain sound ONLY if source is NOT audioDrop or audioBuildUp
    // (those already played their specific sounds)
    if (this.soundService && source !== 'audioDrop' && source !== 'audioBuildUp') {
      this.soundService.getLevelIdByOrder(this.state.currentLevel).then((levelId) => {
        if (levelId) {
          this.soundService!.playXPGainSound(levelId, finalXP)
        }
      })
    }

    // Log event
    const xpEvent: XPEvent = {
      timestamp: now,
      source: source as any,
      amount: finalXP,
      multiplier: totalMultiplier,
    }
    this.xpHistory.push(xpEvent)

    // Check for level up
    this.checkLevelUp()

    // Emit XP added event
    this.emit('xp:added', {
      xp: finalXP,
      baseXP,
      multiplier: totalMultiplier,
      comboCount: this.state.comboCount,
      state: { ...this.state },
    })

    console.log(`[XPService] +${finalXP}XP (base: ${baseXP}, multiplier: ${totalMultiplier.toFixed(2)}x, combo: ${this.state.comboCount})`)

    return { ...this.state }
  }

  /**
   * Calculate combo multiplier (increases with consecutive events)
   */
  private calculateComboMultiplier(): number {
    const comboBonus = (this.state.comboCount * 0.1) // 10% per combo
    const multiplier = Math.min(1 + comboBonus, this.config.multipliers.comboMax)
    return multiplier
  }

  /**
   * Calculate time bonus (reward for staying live longer)
   */
  private calculateTimeBonus(): number {
    const elapsedMs = Date.now() - this.state.sessionStartTime
    const elapsedMinutes = elapsedMs / (1000 * 60)
    const bonus = elapsedMinutes * this.config.multipliers.timeBonusPerMinute
    return bonus
  }

  /**
   * Check if player leveled up
   */
  private checkLevelUp(playSound: boolean = true): void {
    const nextLevelThreshold = this.getNextLevelThreshold()

    // Check if we can level up (next level exists in database)
    if (this.state.currentXP >= nextLevelThreshold && this.state.currentLevel < this.maxLevel) {
      this.state.currentLevel += 1

      // Emit level up sound (async, don't wait) - only if playSound is true
      if (this.soundService && playSound) {
        this.soundService.playLevelUpSound(this.state.currentLevel)
      }

      // Emit level up event
      this.emit('level:up', {
        newLevel: this.state.currentLevel,
        xp: this.state.currentXP,
        state: { ...this.state },
      })

      logger.info(`[XPService] LEVEL UP! → Level ${this.state.currentLevel}`)

      // Recursively check for multiple level-ups (in case user gained a lot of XP at once)
      this.checkLevelUp(playSound)
    }
  }

  /**
   * Force a level up (for testing)
   */
  public forceLevelUp(): XPState {
    if (this.state.currentLevel < this.maxLevel) {
      const nextThreshold = this.getNextLevelThreshold()
      this.state.currentXP = nextThreshold
      this.checkLevelUp()
    }
    return { ...this.state }
  }

  /**
   * Add fixed XP amount (for testing)
   * NOTE: No sound is emitted here - sounds are handled by frontend buttons
   */
  public addFixedXP(amount: number): XPState {
    this.state.currentXP += amount
    this.state.totalXPEarned += amount

    // Check level up without playing sound (frontend handles sounds)
    this.checkLevelUp(false)

    this.emit('xp:added', {
      xp: amount,
      baseXP: amount,
      multiplier: 1,
      comboCount: this.state.comboCount,
      state: { ...this.state },
    })

    console.log(`[XPService] +${amount}XP (direct add)`)
    return { ...this.state }
  }

  /**
   * Get current level XP threshold (XP needed to reach CURRENT level)
   * For level 1, this is 0 (start of the game)
   * For level 2, this is the threshold stored for level 1, etc.
   */
  public getCurrentLevelThreshold(): number {
    if (this.state.currentLevel === 1) {
      return 0 // Level 1 starts at 0 XP
    }
    // Current threshold is the previous level's threshold
    return this.levelThresholds.get(this.state.currentLevel - 1) || 0
  }

  /**
   * Get next level XP threshold (XP needed to reach NEXT level)
   */
  public getNextLevelThreshold(): number {
    // Next threshold is the next level's stored threshold (currentLevel + 1)
    return this.levelThresholds.get(this.state.currentLevel + 1) || Number.MAX_SAFE_INTEGER
  }

  /**
   * Get XP progress for current level (0-100)
   */
  public getLevelProgress(): number {
    const currentThreshold = this.getCurrentLevelThreshold()
    const nextThreshold = this.getNextLevelThreshold()
    const progress = ((this.state.currentXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    return Math.min(Math.max(progress, 0), 100)
  }

  /**
   * Get XP needed to next level
   */
  public getXPToNextLevel(): number {
    return Math.max(this.getNextLevelThreshold() - this.state.currentXP, 0)
  }

  /**
   * Reset session (for new live session)
   */
  public resetSession(): XPState {
    const now = Date.now()
    this.state = {
      currentXP: 0,
      currentLevel: 1,
      totalXPEarned: 0,
      comboCount: 0,
      lastEventTime: now,
      sessionStartTime: now,
    }
    this.xpHistory = []

    this.emit('session:reset', { state: { ...this.state } })
    console.log('[XPService] Session reset')

    return { ...this.state }
  }

  /**
   * Get current state
   */
  public getState(): XPState {
    return { ...this.state }
  }

  /**
   * Get XP history
   */
  public getHistory(): XPEvent[] {
    return [...this.xpHistory]
  }

  /**
   * Setup auto decay for combo counter
   */
  private setupAutoDecayCombo(): void {
    setInterval(() => {
      const timeSinceLastEvent = Date.now() - this.state.lastEventTime

      if (timeSinceLastEvent > this.config.multipliers.comboDecay && this.state.comboCount > 0) {
        console.log(`[XPService] Combo decayed from ${this.state.comboCount} to 0`)
        this.state.comboCount = 0
        this.emit('combo:decay', { comboCount: 0 })
      }
    }, 1000) // Check every second
  }
}

export default XPService
