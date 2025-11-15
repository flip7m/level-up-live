import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  port: 8010,
  user: 'levelup_user',
  password: 'levelup_dev_2024',
  database: 'levelup_live',
})

async function updateAllLevelsSounds() {
  console.log('Updating ALL levels with test sounds...')

  try {
    // Update ALL levels with test sound paths
    const result = await pool.query(`
      UPDATE levels
      SET sounds_json = jsonb_set(
        jsonb_set(
          jsonb_set(
            jsonb_set(
              jsonb_set(
                jsonb_set(
                  sounds_json,
                  '{xpGain}', '"assets/sounds/effects/coin.mp3"'
                ),
                '{drop}', '"assets/sounds/effects/coin.mp3"'
              ),
              '{buildUp}', '"assets/sounds/effects/coin.mp3"'
            ),
            '{levelUp}', '"assets/sounds/levelups/level-up.mp3"'
          ),
          '{viewerJoin}', '"assets/sounds/effects/coin.mp3"'
        ),
        '{transition}', '"assets/sounds/transitions/splash.mp3"'
      )
      RETURNING id, name, order_num, sounds_json
    `)

    console.log(`✅ ${result.rows.length} levels updated successfully!\n`)

    result.rows.forEach(row => {
      console.log(`Level ${row.order_num}: ${row.name}`)
      console.log('Sounds:', JSON.stringify(row.sounds_json, null, 2))
      console.log('---')
    })

  } catch (err) {
    console.error('❌ Update failed:', err)
    throw err
  } finally {
    await pool.end()
  }
}

updateAllLevelsSounds()
