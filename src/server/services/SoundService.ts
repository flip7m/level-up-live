import { Server } from 'socket.io'
import { LevelRepository } from '../database/repositories/LevelRepository'
import { logger } from '../utils/logger'

export type SoundType = 'xpGain' | 'drop' | 'buildUp' | 'levelUp' | 'viewerJoin' | 'transition' | 'ambient'

export interface SoundEvent {
  type: SoundType
  soundPath: string
  levelId?: string
  metadata?: {
    viewerName?: string
    xpAmount?: number
    fromLevel?: number
    toLevel?: number
  }
}

export class SoundService {
  private levelRepository: LevelRepository
  private io: Server | null = null

  // Default sound paths (fallback quando não configurado no level)
  private readonly defaultSounds = {
    xpGain: 'assets/sounds/xp/xp.mp3',
    drop: 'assets/sounds/drops/drop.mp3',
    buildUp: 'assets/sounds/buildups/builups.mp3',
    viewerJoin: 'assets/sounds/viewers/viewers.mp3',
    levelUp: 'assets/sounds/levelups/level-up.mp3',
  }

  constructor(levelRepository: LevelRepository) {
    this.levelRepository = levelRepository
    logger.info('SoundService initialized')
  }

  /**
   * Set Socket.IO server instance
   */
  public setSocketServer(io: Server) {
    this.io = io
  }

  /**
   * Get sound path from level configuration
   */
  private async getSoundPath(levelId: string, soundType: SoundType): Promise<string | null> {
    try {
      const level = await this.levelRepository.getLevelById(levelId)
      if (!level) {
        logger.warn(`Level not found: ${levelId}`)
        return null
      }

      const soundPath = level.sounds[soundType]
      if (!soundPath || soundPath.trim() === '') {
        logger.debug(`No ${soundType} sound configured for level ${level.name}`)
        return null
      }

      return soundPath
    } catch (err) {
      logger.error(`Error getting sound path for level ${levelId}:`, err)
      return null
    }
  }

  /**
   * Emit sound event to all connected clients
   */
  private emitSound(event: SoundEvent) {
    if (!this.io) {
      logger.warn('Socket.IO server not initialized, cannot emit sound')
      return
    }

    if (!event.soundPath) {
      logger.debug(`No sound path for ${event.type}, skipping`)
      return
    }

    logger.debug(`Emitting sound: ${event.type} -> ${event.soundPath}`)
    this.io.emit(`sound:${event.type}`, event)
  }

  /**
   * Play XP gain sound
   */
  public async playXPGainSound(levelId: string, xpAmount: number) {
    let soundPath = await this.getSoundPath(levelId, 'xpGain')
    if (!soundPath) {
      soundPath = this.defaultSounds.xpGain
      logger.debug(`Using default xpGain sound: ${soundPath}`)
    }

    this.emitSound({
      type: 'xpGain',
      soundPath,
      levelId,
      metadata: { xpAmount },
    })
  }

  /**
   * Play drop sound
   */
  public async playDropSound(levelId: string) {
    let soundPath = await this.getSoundPath(levelId, 'drop')
    if (!soundPath) {
      soundPath = this.defaultSounds.drop
      logger.debug(`Using default drop sound: ${soundPath}`)
    }

    this.emitSound({
      type: 'drop',
      soundPath,
      levelId,
    })
  }

  /**
   * Play build up sound
   */
  public async playBuildUpSound(levelId: string) {
    let soundPath = await this.getSoundPath(levelId, 'buildUp')
    if (!soundPath) {
      soundPath = this.defaultSounds.buildUp
      logger.debug(`Using default buildUp sound: ${soundPath}`)
    }

    this.emitSound({
      type: 'buildUp',
      soundPath,
      levelId,
    })
  }

  /**
   * Play level up sound
   */
  public async playLevelUpSound(newLevel: number) {
    // Get the NEW level's sounds
    try {
      const levels = await this.levelRepository.getAllLevels()
      const level = levels.find((l) => l.order === newLevel)

      if (!level) {
        logger.warn(`Level ${newLevel} not found`)
        return
      }

      let soundPath = level.sounds.levelUp
      if (!soundPath || soundPath.trim() === '') {
        soundPath = this.defaultSounds.levelUp
        logger.debug(`Using default levelUp sound: ${soundPath}`)
      }

      this.emitSound({
        type: 'levelUp',
        soundPath,
        levelId: level.id,
        metadata: { toLevel: newLevel },
      })
    } catch (err) {
      logger.error(`Error playing level up sound:`, err)
    }
  }

  /**
   * Play viewer join sound
   */
  public async playViewerJoinSound(levelId: string, viewerName?: string) {
    let soundPath = await this.getSoundPath(levelId, 'viewerJoin')
    if (!soundPath) {
      soundPath = this.defaultSounds.viewerJoin
      logger.debug(`Using default viewerJoin sound: ${soundPath}`)
    }

    this.emitSound({
      type: 'viewerJoin',
      soundPath,
      levelId,
      metadata: { viewerName },
    })
  }

  /**
   * Play transition sound (when switching levels visually)
   */
  public async playTransitionSound(fromLevel: number, toLevel: number) {
    try {
      const levels = await this.levelRepository.getAllLevels()
      const level = levels.find((l) => l.order === toLevel)

      if (!level) {
        logger.warn(`Level ${toLevel} not found`)
        return
      }

      const soundPath = level.sounds.transition
      if (!soundPath || soundPath.trim() === '') {
        logger.debug(`No transition sound configured for level ${level.name}`)
        return
      }

      this.emitSound({
        type: 'transition',
        soundPath,
        levelId: level.id,
        metadata: { fromLevel, toLevel },
      })
    } catch (err) {
      logger.error(`Error playing transition sound:`, err)
    }
  }

  /**
   * Get current level ID from level number (order)
   */
  public async getLevelIdByOrder(order: number): Promise<string | null> {
    try {
      const levels = await this.levelRepository.getAllLevels()
      const level = levels.find((l) => l.order === order)
      return level?.id || null
    } catch (err) {
      logger.error(`Error getting level ID by order ${order}:`, err)
      return null
    }
  }
}
