import { Request, Response } from 'express'
import { XPService } from '../services/XPService'

export class XPController {
  constructor(private xpService: XPService) {}

  /**
   * GET /api/xp/state - Get current XP state
   */
  public getState = (req: Request, res: Response) => {
    const state = this.xpService.getState()
    const progress = this.xpService.getLevelProgress()
    const xpToNext = this.xpService.getXPToNextLevel()
    const nextThreshold = this.xpService.getNextLevelThreshold()

    res.json({
      currentXP: state.currentXP,
      currentLevel: state.currentLevel,
      totalXPEarned: state.totalXPEarned,
      progress,
      xpToNext,
      nextLevelThreshold: nextThreshold,
      comboCount: state.comboCount,
    })
  }

  /**
   * POST /api/xp/add-audio - Add XP from audio trigger
   */
  public addAudioXP = (req: Request, res: Response) => {
    const { triggerType } = req.body

    if (!triggerType || !['drop', 'buildUp'].includes(triggerType)) {
      return res.status(400).json({ error: 'Invalid triggerType' })
    }

    const state = this.xpService.addAudioXP(triggerType as 'drop' | 'buildUp')

    res.json({
      success: true,
      state,
    })
  }

  /**
   * POST /api/xp/add-manual - Add XP from manual trigger
   */
  public addManualXP = (req: Request, res: Response) => {
    const { amount } = req.body
    const xpAmount = amount || 10

    const state = this.xpService.addManualXP(xpAmount)

    res.json({
      success: true,
      state,
    })
  }

  /**
   * POST /api/xp/add-fixed - Add fixed XP amount (for testing)
   */
  public addFixedXP = (req: Request, res: Response) => {
    const { amount } = req.body

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' })
    }

    const state = this.xpService.addFixedXP(amount)
    const progress = this.xpService.getLevelProgress()
    const xpToNext = this.xpService.getXPToNextLevel()
    const nextLevelThreshold = this.xpService.getNextLevelThreshold()

    res.json({
      success: true,
      state: {
        ...state,
        progress,
        xpToNext,
        nextLevelThreshold
      },
    })
  }

  /**
   * POST /api/xp/level-up - Force level up (for testing)
   */
  public forceLevelUp = (req: Request, res: Response) => {
    const state = this.xpService.forceLevelUp()
    const progress = this.xpService.getLevelProgress()
    const xpToNext = this.xpService.getXPToNextLevel()
    const nextLevelThreshold = this.xpService.getNextLevelThreshold()

    res.json({
      success: true,
      state: {
        ...state,
        progress,
        xpToNext,
        nextLevelThreshold
      },
    })
  }

  /**
   * POST /api/xp/reset - Reset XP session
   */
  public resetSession = (req: Request, res: Response) => {
    const state = this.xpService.resetSession()
    const progress = this.xpService.getLevelProgress()
    const xpToNext = this.xpService.getXPToNextLevel()
    const nextLevelThreshold = this.xpService.getNextLevelThreshold()

    res.json({
      success: true,
      state: {
        ...state,
        progress,
        xpToNext,
        nextLevelThreshold
      },
    })
  }

  /**
   * GET /api/xp/history - Get XP history
   */
  public getHistory = (req: Request, res: Response) => {
    const history = this.xpService.getHistory()

    res.json({
      history,
      count: history.length,
    })
  }

  /**
   * GET /api/xp/config - Get XP configuration
   */
  public getConfig = (req: Request, res: Response) => {
    const state = this.xpService.getState()
    const progress = this.xpService.getLevelProgress()
    const nextThreshold = this.xpService.getNextLevelThreshold()

    res.json({
      current: {
        level: state.currentLevel,
        xp: state.currentXP,
        progress,
        comboCount: state.comboCount,
      },
      next: {
        threshold: nextThreshold,
        xpNeeded: this.xpService.getXPToNextLevel(),
      },
      total: state.totalXPEarned,
    })
  }
}

export default XPController
