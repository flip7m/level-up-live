import { pool, closeDatabase } from './index.js'
import { logger } from '../utils/logger.js'

async function clearAllLevels() {
  try {
    logger.info('Deleting all levels...')
    await pool.query('DELETE FROM levels')
    logger.info('✅ All levels deleted successfully')
    await closeDatabase()
  } catch (err) {
    logger.error('Error clearing levels:', err)
    await closeDatabase()
    process.exit(1)
  }
}

clearAllLevels()
