import pg from 'pg'

const pool = new pg.Pool({
  host: 'localhost',
  port: 8010,
  database: 'levelup_live',
  user: 'levelup_user',
  password: 'levelup_dev_2024',
})

const result = await pool.query('SELECT id, name, effect_type, effect_config_json::text FROM events LIMIT 3')
console.log('Events in database:')
console.log(JSON.stringify(result.rows, null, 2))

await pool.end()
