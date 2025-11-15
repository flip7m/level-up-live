import { initializeDatabase, closeDatabase, getPool } from './db.js'
import { randomUUID } from 'crypto'
import { logger } from '../utils/logger.js'
import { readdirSync, existsSync } from 'fs'
import { join } from 'path'

async function seedInitialData() {
  try {
    await initializeDatabase()
    const pool = getPool()

    // Delete existing levels
    await pool.query('DELETE FROM levels')
    logger.info('Deleted existing levels')

    logger.info('Seeding initial data...')

    const now = new Date().toISOString()

    // Level 1 - Empty template for user to configure
    const level1Id = randomUUID()
    const level1Layers = {
      background: '',  // Empty - user will select in editor
      stage: '',       // Empty - user will select in editor
      crowd: '',       // Empty - user will select in editor
      effects: [],     // Empty - user will add effects in editor
    }

    const level1Sounds = {
      transition: '',  // Empty - user will select in editor
      levelUp: '',     // Empty - user will select in editor
    }

    const level1Config = {
      transitionDuration: 500,
      transitionEffect: 'fade',
    }

    await pool.query(
      `INSERT INTO levels (
        id, order_num, name, description, xp_threshold,
        layers_json, sounds_json, visual_config_json,
        available_events_json, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        level1Id,
        1,
        'Level 1: The Beginning',
        'Configure este nível usando o editor. Clique em cada camada para selecionar imagens da pasta assets/imagens',
        0,
        JSON.stringify(level1Layers),
        JSON.stringify(level1Sounds),
        JSON.stringify(level1Config),
        JSON.stringify([]),
        now,
        now,
      ]
    )

    // Level 2 - Empty template for user to configure
    const level2Id = randomUUID()

    const level2Layers = {
      background: '',
      stage: '',
      crowd: '',
      effects: [],
    }

    const level2Sounds = {
      transition: '',
      levelUp: '',
    }

    const level2Config = {
      transitionDuration: 750,
      transitionEffect: 'slide',
    }

    await pool.query(
      `INSERT INTO levels (
        id, order_num, name, description, xp_threshold,
        layers_json, sounds_json, visual_config_json,
        available_events_json, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        level2Id,
        2,
        'Level 2: The Climax',
        'Configure este nível usando o editor. Use imagens e sons diferentes do Level 1.',
        250,
        JSON.stringify(level2Layers),
        JSON.stringify(level2Sounds),
        JSON.stringify(level2Config),
        JSON.stringify([]),
        now,
        now,
      ]
    )

    logger.info('✅ Levels created: 2')

    // Delete existing events
    await pool.query('DELETE FROM events')
    logger.info('Deleted existing events')

    // =====================================================================
    // PROCEDURAL EVENTS (Canvas-based effects)
    // =====================================================================

    // Event 1: Confetti Explosion (procedural, manual, level 1)
    const event1Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event1Id,
        'Confetti Explosion',
        'Explosão de confetes coloridos (Canvas procedural)',
        'visual',
        'manual',
        JSON.stringify({ cooldown: 30, minLevel: 1, probability: 1.0 }),
        5,
        'confetti',
        JSON.stringify({
          particleCount: 200,
          colors: ['#EC4899', '#8B5CF6', '#6366F1', '#F59E0B', '#10B981', '#EF4444'],
        }),
        now,
      ]
    )

    // Event 2: Fireworks (procedural, random, level 1)
    const event2Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event2Id,
        'Fireworks Show',
        'Fogos de artifício espetaculares (Canvas procedural)',
        'visual',
        'random',
        JSON.stringify({ cooldown: 60, minLevel: 1, probability: 0.3 }),
        8,
        'fireworks',
        JSON.stringify({
          colors: ['#EC4899', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444'],
        }),
        now,
      ]
    )

    // Event 3: Flash Bang (procedural, manual, level 1)
    const event3Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event3Id,
        'Flash Bang',
        'Flash de luz intenso (Canvas procedural)',
        'visual',
        'manual',
        JSON.stringify({ cooldown: 20, minLevel: 1, probability: 1.0 }),
        2,
        'flash',
        JSON.stringify({
          colors: ['#FFFFFF'],
        }),
        now,
      ]
    )

    // Event 4: Particle Burst (procedural, random, level 1)
    const event4Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event4Id,
        'Particle Burst',
        'Explosão de partículas do centro (Canvas procedural)',
        'visual',
        'random',
        JSON.stringify({ cooldown: 45, minLevel: 1, probability: 0.4 }),
        4,
        'particle-burst',
        JSON.stringify({
          particleCount: 120,
          colors: ['#EC4899', '#8B5CF6', '#6366F1', '#10B981'],
        }),
        now,
      ]
    )

    // Event 5: Rainbow Wave (procedural, manual, level 2)
    const event5Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event5Id,
        'Rainbow Wave',
        'Onda de gradiente colorido (Canvas procedural)',
        'visual',
        'manual',
        JSON.stringify({ cooldown: 90, minLevel: 2, probability: 1.0 }),
        6,
        'rainbow-wave',
        JSON.stringify({}),
        now,
      ]
    )

    // Event 6: Screen Shake (procedural, manual, level 2)
    const event6Id = randomUUID()
    await pool.query(
      `INSERT INTO events (
        id, name, description, type, trigger_type,
        trigger_config_json, duration, effect_type, effect_config_json, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        event6Id,
        'Screen Shake',
        'Tremor da tela (Canvas procedural)',
        'visual',
        'manual',
        JSON.stringify({ cooldown: 30, minLevel: 2, probability: 1.0 }),
        3,
        'screen-shake',
        JSON.stringify({
          intensity: 25,
        }),
        now,
      ]
    )

    logger.info('✅ Events created: 6 procedural effects')

    // =====================================================================
    // SEED SONGS FROM FILESYSTEM
    // =====================================================================

    // Delete existing songs
    await pool.query('DELETE FROM songs')
    logger.info('Deleted existing songs')

    // Scan music directory for songs
    const musicDir = join(process.cwd(), 'assets', 'music')
    if (existsSync(musicDir)) {
      const files = readdirSync(musicDir).filter((file) => {
        const ext = file.toLowerCase().split('.').pop()
        return ['mp3', 'mpeg', 'mpg', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext || '') && !file.endsWith('.metadata.json')
      })

      logger.info(`Found ${files.length} music files to seed`)

      let songsCreated = 0
      for (let i = 0; i < files.length; i++) {
        const filename = files[i]
        try {
          await pool.query(
            `INSERT INTO songs (
              id, file_path, filename, title, artist, duration, bpm, playlist_order, added_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              randomUUID(),
              `/assets/music/${filename}`,
              filename,
              filename.replace(/\.[^/.]+$/, ''), // Use filename without extension as title
              'Unknown Artist',
              0, // Duration will be extracted by frontend
              null, // BPM
              i + 1, // Playlist order
              now,
            ]
          )
          songsCreated++
          logger.info(`✅ Seeded song: ${filename}`)
        } catch (err) {
          logger.warn(`⚠️ Failed to seed song ${filename}:`, err)
        }
      }

      logger.info(`✅ Songs seeded: ${songsCreated}/${files.length}`)
    } else {
      logger.warn('Music directory not found at:', musicDir)
    }

    logger.info('✅ Seed completed successfully')
    await closeDatabase()
  } catch (err) {
    logger.error('Error seeding data:', err)
    await closeDatabase()
    process.exit(1)
  }
}

seedInitialData()
