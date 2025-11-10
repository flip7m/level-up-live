import { LiveSession } from '../../shared/types.js'
import { BaseRepository } from './BaseRepository.js'

export class SessionRepository extends BaseRepository {
  async getAllSessions(): Promise<LiveSession[]> {
    return this.all<LiveSession>(
      'SELECT * FROM live_sessions ORDER BY started_at DESC'
    )
  }

  async getSessionById(id: string): Promise<LiveSession | undefined> {
    return this.get<LiveSession>(
      'SELECT * FROM live_sessions WHERE id = $1',
      [id]
    )
  }

  async createSession(session: LiveSession): Promise<void> {
    await this.run(
      `INSERT INTO live_sessions (
        id, started_at, ended_at, total_duration, final_level, total_xp, metrics_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        session.id,
        session.startedAt,
        session.endedAt,
        session.totalDuration,
        session.finalLevel,
        session.totalXP,
        session.metricsJson,
      ]
    )
  }

  async updateSession(session: LiveSession): Promise<void> {
    await this.run(
      `UPDATE live_sessions SET
        ended_at = $1, total_duration = $2, final_level = $3, total_xp = $4, metrics_json = $5
      WHERE id = $6`,
      [
        session.endedAt,
        session.totalDuration,
        session.finalLevel,
        session.totalXP,
        session.metricsJson,
        session.id,
      ]
    )
  }

  async deleteSession(id: string): Promise<void> {
    await this.run('DELETE FROM live_sessions WHERE id = $1', [id])
  }

  async addXPHistory(
    sessionId: string,
    timestamp: string,
    source: string,
    amount: number,
    multiplier: number,
    currentLevel: number,
    currentXP: number
  ): Promise<void> {
    await this.run(
      `INSERT INTO xp_history (
        session_id, timestamp, source, amount, multiplier, current_level, current_xp
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, timestamp, source, amount, multiplier, currentLevel, currentXP]
    )
  }

  async getXPHistory(sessionId: string): Promise<any[]> {
    return this.all(
      'SELECT * FROM xp_history WHERE session_id = $1 ORDER BY timestamp ASC',
      [sessionId]
    )
  }
}
