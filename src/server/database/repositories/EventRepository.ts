import { GameEvent } from '../../shared/types.js'
import { BaseRepository } from './BaseRepository.js'

export class EventRepository extends BaseRepository {
  // Map PostgreSQL snake_case to TypeScript camelCase
  private mapRowToEvent(row: any): GameEvent {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      triggerType: row.trigger_type,
      triggerConfig: row.trigger_config_json,
      duration: row.duration,
      effectType: row.effect_type || undefined,
      effectConfig: row.effect_config_json || undefined,
      assets: row.assets_json || undefined,
      voteOptions: row.vote_options_json || undefined,
      createdAt: row.created_at,
    }
  }

  async getAllEvents(): Promise<GameEvent[]> {
    const rows = await this.all<any>('SELECT * FROM events')
    return rows.map((row) => this.mapRowToEvent(row))
  }

  async getEventById(id: string): Promise<GameEvent | undefined> {
    const row = await this.get<any>('SELECT * FROM events WHERE id = $1', [id])
    return row ? this.mapRowToEvent(row) : undefined
  }

  async createEvent(event: GameEvent): Promise<void> {
    await this.run(
      `INSERT INTO events (
        id, name, description, type, trigger_type, trigger_config_json,
        duration, effect_type, effect_config_json, assets_json, vote_options_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        event.id,
        event.name,
        event.description,
        event.type,
        event.triggerType,
        event.triggerConfig,
        event.duration,
        event.effectType || null,
        event.effectConfig || null,
        event.assets || null,
        event.voteOptions || null,
        event.createdAt,
      ]
    )
  }

  async updateEvent(event: GameEvent): Promise<void> {
    await this.run(
      `UPDATE events SET
        name = $1, description = $2, type = $3, trigger_type = $4,
        trigger_config_json = $5, duration = $6, effect_type = $7,
        effect_config_json = $8, assets_json = $9, vote_options_json = $10
      WHERE id = $11`,
      [
        event.name,
        event.description,
        event.type,
        event.triggerType,
        event.triggerConfig,
        event.duration,
        event.effectType || null,
        event.effectConfig || null,
        event.assets || null,
        event.voteOptions || null,
        event.id,
      ]
    )
  }

  async deleteEvent(id: string): Promise<void> {
    await this.run('DELETE FROM events WHERE id = $1', [id])
  }
}
