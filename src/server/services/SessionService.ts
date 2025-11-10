import { LiveSession } from '../../shared/types.js'
import { SessionRepository } from '../database/repositories/SessionRepository.js'
import { randomUUID } from 'crypto'

export class SessionService {
  private currentSessionId: string | null = null
  private sessionStartTime: number = 0

  constructor(private sessionRepository: SessionRepository) {}

  /**
   * Get current active session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId
  }

  /**
   * Check if there's an active session
   */
  isSessionActive(): boolean {
    return this.currentSessionId !== null
  }

  /**
   * Start a new live session
   * @returns Session ID
   */
  async startSession(): Promise<string> {
    // If there's an active session, stop it first (auto-cleanup)
    if (this.currentSessionId) {
      try {
        await this.stopSession(1, 0) // Stop with minimal data
      } catch (err) {
        // Ignore errors, just reset
        this.currentSessionId = null
        this.sessionStartTime = 0
      }
    }

    const sessionId = randomUUID()
    const session: LiveSession = {
      id: sessionId,
      startedAt: new Date().toISOString(),
    }

    await this.sessionRepository.createSession(session)
    this.currentSessionId = sessionId
    this.sessionStartTime = Date.now()

    return sessionId
  }

  /**
   * Stop current live session
   * @param finalLevel - Final level reached
   * @param totalXP - Total XP earned
   * @param metricsJson - Additional metrics (optional)
   */
  async stopSession(
    finalLevel: number,
    totalXP: number,
    metricsJson?: string
  ): Promise<LiveSession | null> {
    if (!this.currentSessionId) {
      throw new Error('No active session to stop')
    }

    const endedAt = new Date().toISOString()
    const totalDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000) // seconds

    const session: LiveSession = {
      id: this.currentSessionId,
      startedAt: new Date(this.sessionStartTime).toISOString(),
      endedAt,
      totalDuration,
      finalLevel,
      totalXP,
      metricsJson,
    }

    await this.sessionRepository.updateSession(session)

    const sessionId = this.currentSessionId
    this.currentSessionId = null
    this.sessionStartTime = 0

    return await this.sessionRepository.getSessionById(sessionId)
  }

  /**
   * Get current session info
   */
  async getCurrentSession(): Promise<LiveSession | null> {
    if (!this.currentSessionId) {
      return null
    }

    return await this.sessionRepository.getSessionById(this.currentSessionId)
  }

  /**
   * Log XP event to history
   */
  async logXPEvent(
    source: string,
    amount: number,
    multiplier: number,
    currentLevel: number,
    currentXP: number
  ): Promise<void> {
    if (!this.currentSessionId) {
      return // Don't log if no active session
    }

    await this.sessionRepository.addXPHistory(
      this.currentSessionId,
      new Date().toISOString(),
      source,
      amount,
      multiplier,
      currentLevel,
      currentXP
    )
  }

  /**
   * Get XP history for current session
   */
  async getSessionXPHistory(): Promise<any[]> {
    if (!this.currentSessionId) {
      return []
    }

    return await this.sessionRepository.getXPHistory(this.currentSessionId)
  }

  /**
   * Get all sessions (for metrics dashboard)
   */
  async getAllSessions(): Promise<LiveSession[]> {
    return await this.sessionRepository.getAllSessions()
  }

  /**
   * Get session by ID
   */
  async getSessionById(id: string): Promise<LiveSession | undefined> {
    return await this.sessionRepository.getSessionById(id)
  }
}
