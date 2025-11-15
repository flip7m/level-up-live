import express, { Express, Request, Response } from 'express'
import { logger } from './utils/logger.js'

const AUDIO_PLAYER_PORT = 8021

export function createAudioPlayerApp(): Express {
  const app = express()

  // Middleware
  app.use(express.json())
  app.use('/assets', express.static('assets'))

  // CORS
  app.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin || '*'
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })

  // Serve audio player HTML
  app.get('/', (req: Request, res: Response) => {
    res.sendFile('src/server/views/audio-player.html', { root: '.' })
  })

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'audio-player', timestamp: new Date().toISOString() })
  })

  return app
}

export function getAudioPlayerPort(): number {
  return AUDIO_PLAYER_PORT
}
