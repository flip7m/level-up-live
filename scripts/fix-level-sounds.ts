import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  port: 8010,
  user: 'levelup_user',
  password: 'levelup_dev_2024',
  database: 'levelup_live',
})

async function fixLevelSounds() {
  console.log('Fixing level sounds in database...\n')

  try {
    // Update all levels with correct sounds
    const result = await pool.query(`
      UPDATE levels
      SET sounds_json = jsonb_build_object(
        'xpGain', 'assets/sounds/xp/xp.mp3',
        'drop', 'assets/sounds/drops/drop.mp3',
        'buildUp', 'assets/sounds/buildups/builups.mp3',
        'levelUp', 'assets/sounds/levelups/level-up.mp3',
        'viewerJoin', 'assets/sounds/viewers/viewers.mp3',
        'transition', 'assets/sounds/transitions/splash.mp3',
        'ambient', NULL
      )
      RETURNING id, name, order_num, sounds_json
    `)

    console.log(`✅ Updated ${result.rows.length} levels successfully!\n`)

    result.rows.forEach(row => {
      console.log(`📍 Level ${row.order_num}: ${row.name}`)
      console.log('   Sounds:', JSON.stringify(row.sounds_json, null, 2))
      console.log('---')
    })

  } catch (err) {
    console.error('❌ Update failed:', err)
    throw err
  } finally {
    await pool.end()
  }
}

fixLevelSounds()
