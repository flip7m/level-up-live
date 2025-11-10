import pkg from 'pg'
const { Pool } = pkg

const pool = new Pool({
  host: 'localhost',
  port: 8010,
  user: 'levelup_user',
  password: 'levelup_dev_2024',
  database: 'levelup_live'
})

const res = await pool.query('SELECT id, name, order_num, layers_json FROM levels ORDER BY order_num')
console.log('All levels:')
console.log(JSON.stringify(res.rows, null, 2))
await pool.end()
