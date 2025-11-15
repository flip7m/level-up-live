import { Request, Response } from 'express'
import { Server as SocketIOServer } from 'socket.io'
import { LevelService } from '../services/LevelService.js'
import { XPService } from '../services/XPService.js'

export class LevelController {
  private io: SocketIOServer | null = null
  private xpService: XPService | null = null

  constructor(private levelService: LevelService) {}

  /**
   * Set Socket.IO server for broadcasting level changes
   */
  public setSocketServer(io: SocketIOServer): void {
    this.io = io
  }

  /**
   * Set XPService for reloading thresholds
   */
  public setXPService(xpService: XPService): void {
    this.xpService = xpService
  }

  /**
   * Helper to reload XP thresholds and broadcast to clients
   */
  private async reloadXPThresholds(): Promise<void> {
    if (this.xpService) {
      await this.xpService.reloadLevelThresholds()
    }
    if (this.io) {
      this.io.emit('levels:updated')
    }
  }

  /**
   * GET /api/levels - Get all levels
   */
  getAllLevels = async (req: Request, res: Response) => {
    try {
      const levels = await this.levelService.getAllLevels()
      res.json({
        success: true,
        data: levels,
        count: levels.length,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/levels/:id - Get level by ID
   */
  getLevelById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const level = await this.levelService.getLevelById(id)

      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Level not found',
        })
      }

      res.json({
        success: true,
        data: level,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/levels/order/:order - Get level by order
   */
  getLevelByOrder = async (req: Request, res: Response) => {
    try {
      const { order } = req.params
      const level = await this.levelService.getLevelByOrder(parseInt(order))

      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Level not found',
        })
      }

      res.json({
        success: true,
        data: level,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/levels - Create level
   */
  createLevel = async (req: Request, res: Response) => {
    try {
      const { name, description, xpThreshold, order } = req.body

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Name is required',
        })
      }

      const level = await this.levelService.createLevel(
        name,
        description || '',
        xpThreshold || 0,
        order
      )

      // Reload XP thresholds and broadcast
      await this.reloadXPThresholds()

      res.status(201).json({
        success: true,
        data: level,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * PUT /api/levels/:id - Update level
   */
  updateLevel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updates = req.body

      const updated = await this.levelService.updateLevel(id, updates)

      if (!updated) {
        return res.status(404).json({
          success: false,
          error: 'Level not found',
        })
      }

      // Validate updated level
      const errors = this.levelService.validateLevel(updated)
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors,
        })
      }

      // Reload XP thresholds and broadcast
      await this.reloadXPThresholds()

      res.json({
        success: true,
        data: updated,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * DELETE /api/levels/:id - Delete level
   */
  deleteLevel = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const deleted = await this.levelService.deleteLevel(id)

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Level not found',
        })
      }

      // Reload XP thresholds and broadcast
      await this.reloadXPThresholds()

      res.json({
        success: true,
        message: 'Level deleted successfully',
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/levels/reorder - Reorder levels
   */
  reorderLevels = async (req: Request, res: Response) => {
    try {
      const { levelIds } = req.body

      if (!Array.isArray(levelIds)) {
        return res.status(400).json({
          success: false,
          error: 'levelIds must be an array',
        })
      }

      await this.levelService.reorderLevels(levelIds)

      const updated = await this.levelService.getAllLevels()

      // Reload XP thresholds and broadcast
      await this.reloadXPThresholds()

      res.json({
        success: true,
        message: 'Levels reordered successfully',
        data: updated,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/levels/xp/:xp - Get level for given XP
   */
  getLevelForXP = async (req: Request, res: Response) => {
    try {
      const { xp } = req.params
      const level = await this.levelService.getLevelForXP(parseInt(xp))

      if (!level) {
        return res.status(404).json({
          success: false,
          error: 'Level not found',
        })
      }

      res.json({
        success: true,
        data: level,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }
}

export default LevelController
