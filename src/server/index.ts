import http from 'http'
import { createApp } from './app.js'
import { createLiveViewApp } from './live-view-app.js'
import { createAudioPlayerApp, getAudioPlayerPort } from './audio-player-app.js'
import { setupSocketIO } from './socket.js'
import { initializeDatabase, closeDatabase } from './database/db.js'
import { initializeXPService } from './utils/services.js'
import { config } from './utils/config.js'
import { logger } from './utils/logger.js'

const LIVE_VIEW_PORT = 8020
const AUDIO_PLAYER_PORT = getAudioPlayerPort()

async function startServer() {
  try {
    logger.info(`Starting Level Up Live server in ${config.NODE_ENV} mode`)

    // Initialize database (async)
    await initializeDatabase()

    // Initialize XPService with database thresholds (MUST be after database init)
    await initializeXPService()

    // Create main Express app (API + Frontend)
    const app = createApp()

    // Create HTTP server for main app
    const httpServer = http.createServer(app)

    // Setup Socket.IO (pass app so it can configure LevelController)
    setupSocketIO(httpServer, app)

    // Add error handler to main server
    httpServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.PORT} is already in use`)
      } else {
        logger.error(`Server error:`, err)
      }
    })

    // Start main server
    httpServer.listen(config.PORT, '0.0.0.0', () => {
      logger.info(`Server running on http://localhost:${config.PORT}`)
      logger.info(`Server running on http://0.0.0.0:${config.PORT}`)
      logger.info(`Frontend: http://localhost:5173`)
      logger.info(`WebSocket: ws://localhost:${config.PORT}`)
    })

    // Create Live View app (for OBS capture)
    const liveViewApp = createLiveViewApp()
    const liveViewServer = http.createServer(liveViewApp)

    // Add error handler to live view server
    liveViewServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${LIVE_VIEW_PORT} is already in use`)
      } else {
        logger.error(`Live View server error:`, err)
      }
    })

    // Start Live View server
    liveViewServer.listen(LIVE_VIEW_PORT, '0.0.0.0', () => {
      logger.info(`Live View server running on http://localhost:${LIVE_VIEW_PORT}`)
      logger.info(`OBS Capture URL: http://localhost:${LIVE_VIEW_PORT}`)
    })

    // Create Audio Player app (port 8021)
    const audioPlayerApp = createAudioPlayerApp()
    const audioPlayerServer = http.createServer(audioPlayerApp)

    // Add error handler to audio player server
    audioPlayerServer.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${AUDIO_PLAYER_PORT} is already in use`)
      } else {
        logger.error(`Audio Player server error:`, err)
      }
    })

    // Start Audio Player server
    audioPlayerServer.listen(AUDIO_PLAYER_PORT, '0.0.0.0', () => {
      logger.info(`Audio Player server running on http://localhost:${AUDIO_PLAYER_PORT}`)
      logger.info(`Audio URL for Chromium: http://localhost:${AUDIO_PLAYER_PORT}`)
    })

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP servers')
      httpServer.close(() => {
        liveViewServer.close(() => {
          audioPlayerServer.close(() => {
            logger.info('All servers closed')
            closeDatabase()
            process.exit(0)
          })
        })
      })
    })

    process.on('SIGINT', () => {
      logger.info('SIGINT signal received: closing HTTP servers')
      httpServer.close(() => {
        liveViewServer.close(() => {
          audioPlayerServer.close(() => {
            logger.info('All servers closed')
            closeDatabase()
            process.exit(0)
          })
        })
      })
    })
  } catch (err) {
    logger.error('Failed to start server', err)
    closeDatabase()
    process.exit(1)
  }
}

startServer()
