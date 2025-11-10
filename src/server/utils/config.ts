import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

interface Config {
  // Server
  PORT: number
  NODE_ENV: 'development' | 'production'

  // Paths
  ASSETS_PATH: string
  DATA_PATH: string
  MUSIC_PATH: string
  SCENES_PATH: string
  SOUNDS_PATH: string

  // Database - PostgreSQL
  POSTGRES_HOST: string
  POSTGRES_PORT: number
  POSTGRES_DB: string
  POSTGRES_USER: string
  POSTGRES_PASSWORD: string

  // Audio
  DEFAULT_MUSIC_VOLUME: number
  DEFAULT_SFX_VOLUME: number

  // XP Rates
  XP_RATE_AUDIO_DROP: number
  XP_RATE_AUDIO_BUILD: number
}

const requiredEnvVars = [
  'PORT',
  'NODE_ENV',
  'ASSETS_PATH',
  'DATA_PATH',
  'POSTGRES_HOST',
  'POSTGRES_PORT',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
]

function getConfig(): Config {
  const config: Config = {
    PORT: parseInt(process.env.PORT || '3000'),
    NODE_ENV: (process.env.NODE_ENV as Config['NODE_ENV']) || 'development',
    ASSETS_PATH: process.env.ASSETS_PATH || './assets',
    DATA_PATH: process.env.DATA_PATH || './data',
    MUSIC_PATH: process.env.MUSIC_PATH || './assets/music',
    SCENES_PATH: process.env.SCENES_PATH || './assets/scenes',
    SOUNDS_PATH: process.env.SOUNDS_PATH || './assets/sounds',
    POSTGRES_HOST: process.env.POSTGRES_HOST || 'localhost',
    POSTGRES_PORT: parseInt(process.env.POSTGRES_PORT || '5432'),
    POSTGRES_DB: process.env.POSTGRES_DB || 'levelup_live',
    POSTGRES_USER: process.env.POSTGRES_USER || 'levelup_user',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || '',
    DEFAULT_MUSIC_VOLUME: parseFloat(process.env.DEFAULT_MUSIC_VOLUME || '0.7'),
    DEFAULT_SFX_VOLUME: parseFloat(process.env.DEFAULT_SFX_VOLUME || '0.8'),
    XP_RATE_AUDIO_DROP: parseInt(process.env.XP_RATE_AUDIO_DROP || '2'),
    XP_RATE_AUDIO_BUILD: parseInt(process.env.XP_RATE_AUDIO_BUILD || '1'),
  }

  // Validate required vars
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.warn(`Warning: ${varName} not defined in .env`)
    }
  }

  return config
}

export const config = getConfig()
