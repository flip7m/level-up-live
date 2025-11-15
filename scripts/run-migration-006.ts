import { Pool } from 'pg'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const pool = new Pool({
  host: 'localhost',
  port: 8010,
  user: 'levelup_user',
  password: 'levelup_dev_2024',
  database: 'levelup_live',
})

async function runMigration() {
  console.log('Running migration 006_update_level_sounds.sql...')

  try {
    const migrationPath = join(__dirname, '..', 'src', 'server', 'database', 'migrations', '006_update_level_sounds.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    await pool.query(sql)

    console.log('✅ Migration 006 completed successfully!')

    // Verify the migration
    const result = await pool.query(`
      SELECT id, name, sounds_json
      FROM levels
      LIMIT 1
    `)

    if (result.rows.length > 0) {
      console.log('\nSample level sounds structure:')
      console.log(JSON.stringify(result.rows[0].sounds_json, null, 2))
    }

  } catch (err) {
    console.error('❌ Migration failed:', err)
    throw err
  } finally {
    await pool.end()
  }
}

runMigration()
