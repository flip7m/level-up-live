import { Level, LayerTransform } from '../../shared/types.js'
import { BaseRepository } from './BaseRepository.js'

export class LevelRepository extends BaseRepository {
  /**
   * Migrates old string array format to LayerTransform format
   */
  private migrateEffectsArray(effects: any[]): LayerTransform[] {
    return effects.map((effect: any) => {
      // If it's already a LayerTransform object, return it
      if (typeof effect === 'object' && effect !== null && 'path' in effect) {
        return {
          path: effect.path,
          x: effect.x ?? 0,
          y: effect.y ?? 0,
          scale: effect.scale ?? 1,
          rotation: effect.rotation,
          opacity: effect.opacity ?? 1,
        }
      }
      // If it's a string (old format), convert to LayerTransform
      if (typeof effect === 'string') {
        return {
          path: effect,
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
        }
      }
      // Fallback for unexpected formats
      return {
        path: '',
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
      }
    })
  }

  /**
   * Maps database row to Level object with proper JSONB parsing
   */
  private mapRowToLevel(row: any): Level {
    const layers = typeof row.layers_json === 'string' ? JSON.parse(row.layers_json) : row.layers_json

    // Ensure effects is always an array and migrate format if needed
    if (layers) {
      if (!Array.isArray(layers.effects)) {
        // If effects is not an array (null, undefined, string, object), reset to empty array
        layers.effects = []
      } else {
        // Migrate old effects format to new LayerTransform format
        layers.effects = this.migrateEffectsArray(layers.effects)
      }
    }

    return {
      id: row.id,
      order: row.order_num,
      name: row.name,
      description: row.description,
      xpThreshold: row.xp_threshold,
      layers,
      sounds: typeof row.sounds_json === 'string' ? JSON.parse(row.sounds_json) : row.sounds_json,
      visualConfig: typeof row.visual_config_json === 'string' ? JSON.parse(row.visual_config_json) : row.visual_config_json,
      availableEvents: typeof row.available_events_json === 'string' ? JSON.parse(row.available_events_json) : row.available_events_json,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
  }

  async getAllLevels(): Promise<Level[]> {
    const rows = await this.all<any>(
      'SELECT * FROM levels ORDER BY order_num ASC'
    )
    return rows.map(row => this.mapRowToLevel(row))
  }

  async getLevelById(id: string): Promise<Level | undefined> {
    const row = await this.get<any>(
      'SELECT * FROM levels WHERE id = $1',
      [id]
    )
    return row ? this.mapRowToLevel(row) : undefined
  }

  async getLevelByOrder(order: number): Promise<Level | undefined> {
    const row = await this.get<any>(
      'SELECT * FROM levels WHERE order_num = $1',
      [order]
    )
    return row ? this.mapRowToLevel(row) : undefined
  }

  async createLevel(level: Level): Promise<void> {
    await this.run(
      `INSERT INTO levels (
        id, order_num, name, description, xp_threshold,
        layers_json, sounds_json, visual_config_json,
        available_events_json, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        level.id,
        level.order,
        level.name,
        level.description,
        level.xpThreshold,
        JSON.stringify(level.layers),
        JSON.stringify(level.sounds),
        JSON.stringify(level.visualConfig),
        JSON.stringify(level.availableEvents || []),
        level.createdAt,
        level.updatedAt,
      ]
    )
  }

  async updateLevel(level: Level): Promise<void> {
    await this.run(
      `UPDATE levels SET
        name = $1, description = $2, xp_threshold = $3,
        layers_json = $4, sounds_json = $5, visual_config_json = $6,
        available_events_json = $7, updated_at = $8
      WHERE id = $9`,
      [
        level.name,
        level.description,
        level.xpThreshold,
        JSON.stringify(level.layers),
        JSON.stringify(level.sounds),
        JSON.stringify(level.visualConfig),
        JSON.stringify(level.availableEvents || []),
        level.updatedAt,
        level.id,
      ]
    )
  }

  async deleteLevel(id: string): Promise<void> {
    await this.run('DELETE FROM levels WHERE id = $1', [id])
  }

  async reorderLevels(orders: Array<{ id: string; order: number }>): Promise<void> {
    await this.transaction(async () => {
      for (const { id, order } of orders) {
        await this.run('UPDATE levels SET order_num = $1 WHERE id = $2', [order, id])
      }
    })
  }
}
