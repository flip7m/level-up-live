import express, { Express, Request, Response } from 'express'
import path from 'path'
import { logger } from './utils/logger.js'

export function createLiveViewApp(): Express {
  const app = express()

  // CORS middleware
  app.use((req: Request, res: Response, next) => {
    const origin = req.headers.origin || '*'
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })

  // Serve assets (music, sounds, scenes)
  app.use('/assets', express.static('assets'))

  // Serve the live view HTML page
  app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(process.cwd(), 'src', 'server', 'views', 'live-view.html'))
  })

  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'live-view', timestamp: new Date().toISOString() })
  })

  // 404 handler
  app.use((req: Request, res: Response) => {
    logger.warn(`[Live View] 404 Not Found: ${req.method} ${req.path}`)
    res.status(404).send('Not Found')
  })

  return app
}
