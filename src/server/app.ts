import express, { Express, Request, Response } from 'express'
import { logger } from './utils/logger.js'
import { AudioEngineController } from './controllers/AudioEngineController.js'
import { XPController } from './controllers/XPController.js'
import { LevelController } from './controllers/LevelController.js'
import { PlaylistController } from './controllers/PlaylistController.js'
import { AssetController } from './controllers/AssetController.js'
import { EventController } from './controllers/EventController.js'
import { getXPService, getLevelService, getPlaylistService, getEventService, getSessionService } from './utils/services.js'

export function createApp(): Express {
  const app = express()

  // CORS middleware
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

  // Middleware
  app.use(express.json())
  app.use(express.static('dist/client'))
  // Serve assets (music, sounds, scenes) as static files
  app.use('/assets', express.static('assets'))

  // Request logging
  app.use((req: Request, res: Response, next) => {
    logger.info(`${req.method} ${req.path}`)
    next()
  })

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Audio Engine endpoints
  app.get('/api/audio/state', AudioEngineController.getState)
  app.post('/api/audio/play', AudioEngineController.play)
  app.post('/api/audio/pause', AudioEngineController.pause)
  app.post('/api/audio/resume', AudioEngineController.resume)
  app.post('/api/audio/stop', AudioEngineController.stop)
  app.post('/api/audio/seek', AudioEngineController.seek)
  app.post('/api/audio/volume', AudioEngineController.setVolume)
  app.get('/api/audio/analysis', AudioEngineController.getAnalysis)
  app.post('/api/audio/test', AudioEngineController.testPlayback)

  // XP System endpoints
  const xpService = getXPService()
  const xpController = new XPController(xpService)
  app.get('/api/xp/state', xpController.getState)
  app.get('/api/xp/config', xpController.getConfig)
  app.post('/api/xp/add-audio', xpController.addAudioXP)
  app.post('/api/xp/add-manual', xpController.addManualXP)
  app.post('/api/xp/add-fixed', xpController.addFixedXP)
  app.post('/api/xp/level-up', xpController.forceLevelUp)
  app.post('/api/xp/reset', xpController.resetSession)
  app.get('/api/xp/history', xpController.getHistory)

  // Level System endpoints
  const levelService = getLevelService()
  const levelController = new LevelController(levelService)
  // Note: Socket.IO and XPService will be set in socket.ts after initialization
  app.get('/api/levels', levelController.getAllLevels)
  app.get('/api/levels/:id', levelController.getLevelById)
  app.get('/api/levels/order/:order', levelController.getLevelByOrder)
  app.post('/api/levels', levelController.createLevel)
  app.put('/api/levels/:id', levelController.updateLevel)
  app.delete('/api/levels/:id', levelController.deleteLevel)
  app.post('/api/levels/reorder', levelController.reorderLevels)
  app.get('/api/levels/xp/:xp', levelController.getLevelForXP)

  // Export levelController so socket.ts can configure it
  app.set('levelController', levelController)

  // Playlist endpoints
  const playlistService = getPlaylistService()
  const playlistController = new PlaylistController(playlistService)
  app.get('/api/playlist', playlistController.getAllSongs)
  app.get('/api/playlist/available', playlistController.getAvailableMusic)
  app.get('/api/playlist/current', playlistController.getCurrentSong)
  app.get('/api/playlist/stats', playlistController.getStats)
  app.post('/api/playlist/add', playlistController.addSong)
  app.delete('/api/playlist/:id', playlistController.removeSong)
  app.post('/api/playlist/reorder', playlistController.reorderSongs)
  app.post('/api/playlist/next', playlistController.playNext)
  app.post('/api/playlist/previous', playlistController.playPrevious)
  app.post('/api/playlist/jump/:index', playlistController.jumpToSong)
  app.post('/api/playlist/toggle-loop', playlistController.toggleLoop)
  app.post('/api/playlist/toggle-shuffle', playlistController.toggleShuffle)
  app.delete('/api/playlist-clear', playlistController.clearPlaylist)
  app.get('/api/playlist/search', playlistController.searchSongs)

  // Asset endpoints
  const assetController = new AssetController()
  app.get('/api/assets/images', assetController.getImageAssets)
  app.get('/api/assets/scenes', assetController.getSceneAssets)
  app.get('/api/assets/artists', assetController.getArtistAssets)
  app.get('/api/assets/sounds', assetController.getSoundAssets)
  app.get('/api/assets/all', assetController.getAllAssets)

  // Event System endpoints
  const eventService = getEventService()
  const eventController = new EventController(eventService)
  app.get('/api/events', eventController.getAllEvents)
  app.get('/api/events/available', eventController.getAvailableEvents)
  app.get('/api/events/:id', eventController.getEventById)
  app.post('/api/events', eventController.createEvent)
  app.put('/api/events/:id', eventController.updateEvent)
  app.delete('/api/events/:id', eventController.deleteEvent)
  app.post('/api/events/trigger/:id', eventController.triggerEvent)
  app.post('/api/events/trigger-random', eventController.triggerRandomEvent)
  app.post('/api/events/clear-cooldowns', eventController.clearCooldowns)

  // Session endpoints (for live control)
  const sessionService = getSessionService()
  app.get('/api/session/current', async (req: Request, res: Response) => {
    try {
      const session = await sessionService.getCurrentSession()
      res.json({ success: true, data: session, active: sessionService.isSessionActive() })
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message })
    }
  })

  app.post('/api/session/start', async (req: Request, res: Response) => {
    try {
      const sessionId = await sessionService.startSession()
      logger.info(`Live session started: ${sessionId}`)
      res.json({ success: true, sessionId, message: 'Live session started' })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  })

  app.post('/api/session/stop', async (req: Request, res: Response) => {
    try {
      const { finalLevel, totalXP } = req.body
      const session = await sessionService.stopSession(finalLevel, totalXP)
      logger.info(`Live session stopped: ${session?.id}`)
      res.json({ success: true, data: session, message: 'Live session stopped' })
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message })
    }
  })

  // 404 handler
  app.use((req: Request, res: Response) => {
    logger.warn(`404 Not Found: ${req.method} ${req.path}`)
    res.status(404).json({ error: 'Not Found' })
  })

  // Error handler
  app.use(
    (err: any, req: Request, res: Response, next: express.NextFunction) => {
      logger.error(`Error: ${err.message}`, err)
      res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
      })
    }
  )

  return app
}
