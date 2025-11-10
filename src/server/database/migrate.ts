import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { initializeDatabase, closeDatabase, getPool } from './db.js'
import { logger } from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function runMigrations() {
  try {
    logger.info('Starting database migrations...')

    await initializeDatabase()
    const pool = getPool()

    const migrationsDir = path.join(__dirname, 'migrations')
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort()

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf-8')

      logger.info(`Executing migration: ${file}`)

      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Split by semicolons and execute each statement
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0)

        for (const statement of statements) {
          await client.query(statement)
        }

        await client.query('COMMIT')
        logger.info(`✓ Migration completed: ${file}`)
      } catch (err) {
        await client.query('ROLLBACK')
        logger.error(`✗ Migration failed: ${file}`, err)
        throw err
      } finally {
        client.release()
      }
    }

    logger.info('All migrations completed successfully!')
    await closeDatabase()
  } catch (err) {
    logger.error('Migration process failed', err)
    await closeDatabase()
    process.exit(1)
  }
}

runMigrations()
