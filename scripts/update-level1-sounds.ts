import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  port: 8010,
  user: 'levelup_user',
  password: 'levelup_dev_2024',
  database: 'levelup_live',
})

async function updateLevel1Sounds() {
  console.log('Updating Level 1 with test sounds...')

  try {
    // Update Level 1 (order = 1) with test sound paths
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
      WHERE order_num = 1
      RETURNING id, name, sounds_json
    `)

    if (result.rows.length > 0) {
      console.log('✅ Level 1 updated successfully!')
      console.log('Level:', result.rows[0].name)
      console.log('Sounds:', JSON.stringify(result.rows[0].sounds_json, null, 2))
    } else {
      console.log('❌ No level with order = 1 found')
    }

  } catch (err) {
    console.error('❌ Update failed:', err)
    throw err
  } finally {
    await pool.end()
  }
}

updateLevel1Sounds()
