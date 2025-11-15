import { Pool, PoolClient } from 'pg'
import { config } from '../utils/config.js'
import { logger } from '../utils/logger.js'

let pool: Pool | null = null
let client: PoolClient | null = null

export async function initializeDatabase(): Promise<Pool> {
  try {
    pool = new Pool({
      host: config.POSTGRES_HOST,
      port: config.POSTGRES_PORT,
      database: config.POSTGRES_DB,
      user: config.POSTGRES_USER,
      password: config.POSTGRES_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    pool.on('error', (err) => {
      logger.error('Unexpected error on idle client', err)
    })

    // Test connection
    const testClient = await pool.connect()
    await testClient.query('SELECT NOW()')
    testClient.release()

    logger.info(
      `PostgreSQL database connected: ${config.POSTGRES_DB} @ ${config.POSTGRES_HOST}:${config.POSTGRES_PORT}`
    )

    return pool
  } catch (err) {
    logger.error('Failed to initialize database', err)
    throw err
  }
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error(
      'Database pool not initialized. Call initializeDatabase() first.'
    )
  }
  return pool
}

export async function executeQuery(
  sql: string,
  params: any[] = []
): Promise<any[]> {
  try {
    const result = await pool!.query(sql, params)
    return result.rows
  } catch (err) {
    logger.error(`Failed to execute query: ${sql}`, err)
    throw err
  }
}

export async function executeSingleQuery(
  sql: string,
  params: any[] = []
): Promise<any> {
  try {
    const result = await pool!.query(sql, params)
    return result.rows[0] || null
  } catch (err) {
    logger.error(`Failed to execute single query: ${sql}`, err)
    throw err
  }
}

export async function executeUpdate(
  sql: string,
  params: any[] = []
): Promise<number> {
  try {
    const result = await pool!.query(sql, params)
    return result.rowCount || 0
  } catch (err) {
    logger.error(`Failed to execute update: ${sql}`, err)
    throw err
  }
}

export async function executeBatch(sqlStatements: string[]): Promise<void> {
  const client = await pool!.connect()
  try {
    await client.query('BEGIN')

    for (const sql of sqlStatements) {
      await client.query(sql)
    }

    await client.query('COMMIT')
    logger.info(`Batch executed: ${sqlStatements.length} statements`)
  } catch (err) {
    await client.query('ROLLBACK')
    logger.error('Failed to execute batch', err)
    throw err
  } finally {
    client.release()
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    logger.info('Database pool closed')
  }
}

export default getPool
