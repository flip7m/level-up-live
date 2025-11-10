import { Pool } from 'pg'
import { getPool } from '../db.js'

export abstract class BaseRepository {
  protected pool: Pool

  constructor() {
    this.pool = getPool()
  }

  protected async all<T>(query: string, params?: unknown[]): Promise<T[]> {
    const result = await this.pool.query(query, params || [])
    return result.rows as T[]
  }

  protected async get<T>(query: string, params?: unknown[]): Promise<T | undefined> {
    const result = await this.pool.query(query, params || [])
    return result.rows[0] as T | undefined
  }

  protected async run(query: string, params?: unknown[]): Promise<void> {
    await this.pool.query(query, params || [])
  }

  protected async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const result = await fn()
      await client.query('COMMIT')
      return result
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  }
}
