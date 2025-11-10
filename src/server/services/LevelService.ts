import { Level } from '@shared/types'
import { LevelRepository } from '../database/repositories/LevelRepository.js'
import { logger } from '../utils/logger.js'
import { randomUUID } from 'crypto'

export class LevelService {
  constructor(private levelRepository: LevelRepository) {}

  /**
   * Get all levels
   */
  async getAllLevels(): Promise<Level[]> {
    try {
      return await this.levelRepository.getAllLevels()
    } catch (err) {
      logger.error('Error getting all levels:', err)
      throw err
    }
  }

  /**
   * Get level by ID
   */
  async getLevelById(id: string): Promise<Level | undefined> {
    try {
      return await this.levelRepository.getLevelById(id)
    } catch (err) {
      logger.error(`Error getting level ${id}:`, err)
      throw err
    }
  }

  /**
   * Get level by order
   */
  async getLevelByOrder(order: number): Promise<Level | undefined> {
    try {
      return await this.levelRepository.getLevelByOrder(order)
    } catch (err) {
      logger.error(`Error getting level by order ${order}:`, err)
      throw err
    }
  }

  /**
   * Create a new level
   */
  async createLevel(
    name: string,
    description: string,
    xpThreshold: number,
    order?: number
  ): Promise<Level> {
    try {
      const allLevels = await this.getAllLevels()
      const finalOrder = order || allLevels.length + 1
      const now = new Date().toISOString()

      const newLevel: Level = {
        id: randomUUID(),
        order: finalOrder,
        name,
        description,
        xpThreshold,
        layers: {
          background: '',  // Empty - user will add manually
          stage: '',       // Empty - user will add manually
          crowd: '',       // Empty - user will add manually
          effects: [],     // Empty array - user adds effects
        },
        sounds: {
          transition: '',  // Empty - user will add manually
          levelUp: '',     // Empty - user will add manually
        },
        visualConfig: {
          transitionDuration: 500,
          transitionEffect: 'fade',
        },
        availableEvents: [],
        createdAt: now,
        updatedAt: now,
      }

      await this.levelRepository.createLevel(newLevel)
      logger.info(`Level created: ${newLevel.id} (${name})`)

      return newLevel
    } catch (err) {
      logger.error('Error creating level:', err)
      throw err
    }
  }

  /**
   * Update a level
   */
  async updateLevel(id: string, updates: Partial<Level>): Promise<Level | undefined> {
    try {
      const existing = await this.getLevelById(id)
      if (!existing) {
        logger.warn(`Level not found: ${id}`)
        return undefined
      }

      const updated: Level = {
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      }

      await this.levelRepository.updateLevel(updated)
      logger.info(`Level updated: ${id}`)

      return updated
    } catch (err) {
      logger.error(`Error updating level ${id}:`, err)
      throw err
    }
  }

  /**
   * Delete a level
   */
  async deleteLevel(id: string): Promise<boolean> {
    try {
      const existing = await this.getLevelById(id)
      if (!existing) {
        logger.warn(`Level not found: ${id}`)
        return false
      }

      await this.levelRepository.deleteLevel(id)
      logger.info(`Level deleted: ${id}`)

      return true
    } catch (err) {
      logger.error(`Error deleting level ${id}:`, err)
      throw err
    }
  }

  /**
   * Reorder levels
   */
  async reorderLevels(levelIds: string[]): Promise<void> {
    try {
      const orders = levelIds.map((id, index) => ({
        id,
        order: index + 1,
      }))

      await this.levelRepository.reorderLevels(orders)
      logger.info('Levels reordered')
    } catch (err) {
      logger.error('Error reordering levels:', err)
      throw err
    }
  }

  /**
   * Get level for XP threshold (returns the appropriate level for given XP)
   */
  async getLevelForXP(xp: number): Promise<Level | undefined> {
    try {
      const allLevels = await this.getAllLevels()
      let appropriateLevel = allLevels[0]

      for (const level of allLevels) {
        if (xp >= level.xpThreshold) {
          appropriateLevel = level
        } else {
          break
        }
      }

      return appropriateLevel
    } catch (err) {
      logger.error(`Error getting level for XP ${xp}:`, err)
      throw err
    }
  }

  /**
   * Validate level data
   */
  validateLevel(level: Level): string[] {
    const errors: string[] = []

    if (!level.name || level.name.trim() === '') {
      errors.push('Level name is required')
    }

    if (level.order < 1) {
      errors.push('Level order must be >= 1')
    }

    if (level.xpThreshold < 0) {
      errors.push('XP threshold must be >= 0')
    }

    // Camadas e sons são opcionais - usuário adiciona manualmente

    return errors
  }
}

export default LevelService
