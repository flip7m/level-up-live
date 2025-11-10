import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { Express } from 'express'
import { logger } from './utils/logger.js'
import { getAudioEngine, getAudioAnalyzer, getXPService, getEventService, getSoundService } from './utils/services.js'
import { EventController } from './controllers/EventController.js'
import { LevelController } from './controllers/LevelController.js'

export function setupSocketIO(httpServer: HTTPServer, app?: Express): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  // Get service instances
  const audioEngine = getAudioEngine()
  const audioAnalyzer = getAudioAnalyzer()
  const xpService = getXPService()
  const eventService = getEventService()
  const soundService = getSoundService()

  // Initialize SoundService with Socket.IO server
  soundService.setSocketServer(io)

  // Inject SoundService into XPService
  xpService.setSoundService(soundService)

  // Configure LevelController with Socket.IO and XPService (if available)
  if (app) {
    const levelController = app.get('levelController') as LevelController
    if (levelController) {
      levelController.setSocketServer(io)
      levelController.setXPService(xpService)
      logger.info('LevelController configured with Socket.IO and XPService')
    }
  }

  // Setup EventController with Socket.IO
  const eventController = new EventController(eventService)
  eventController.setupSocketListeners(io)

  // Setup audio engine events to broadcast to all clients
  audioEngine.on('play', (data) => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('pause', () => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('resume', () => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('stop', () => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('seek', (data) => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('volumeChange', (data) => {
    io.emit('audio:state', audioEngine.getState())
  })

  audioEngine.on('state', (state) => {
    io.emit('audio:state', state)
  })

  audioEngine.on('analysis', (analysis) => {
    io.emit('audio:analysis', analysis)
  })

  audioEngine.on('drop-detected', async (data) => {
    io.emit('audio:drop-detected', data)
    // Auto add XP for detected drop
    const xpState = await xpService.addAudioXP('drop')
    const progress = xpService.getLevelProgress()
    const xpToNext = xpService.getXPToNextLevel()
    const nextLevelThreshold = xpService.getNextLevelThreshold()
    io.emit('xp:state', { ...xpState, progress, xpToNext, nextLevelThreshold })
  })

  audioEngine.on('build-up', async (data) => {
    io.emit('audio:build-up', data)
    // Auto add XP for detected build-up
    const xpState = await xpService.addAudioXP('buildUp')
    const progress = xpService.getLevelProgress()
    const xpToNext = xpService.getXPToNextLevel()
    const nextLevelThreshold = xpService.getNextLevelThreshold()
    io.emit('xp:state', { ...xpState, progress, xpToNext, nextLevelThreshold })
  })

  audioEngine.on('ended', () => {
    io.emit('audio:ended')
  })

  // Setup XP service events to broadcast to all clients
  xpService.on('xp:added', (data) => {
    const progress = xpService.getLevelProgress()
    const xpToNext = xpService.getXPToNextLevel()
    const nextLevelThreshold = xpService.getNextLevelThreshold()
    io.emit('xp:added', {
      ...data,
      state: {
        ...data.state,
        progress,
        xpToNext,
        nextLevelThreshold
      }
    })
  })

  xpService.on('level:up', (data) => {
    io.emit('level:up', data)
  })

  xpService.on('combo:decay', (data) => {
    io.emit('combo:decay', data)
  })

  xpService.on('session:reset', (data) => {
    io.emit('xp:reset', data)
  })

  // Connection handler
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`)

    // Send current audio state to new client
    socket.emit('audio:state', audioEngine.getState())

    // Audio events from client
    socket.on('audio:play', (data: { trackPath: string; duration?: number }) => {
      logger.debug('Audio play event received')
      audioEngine.play(data.trackPath, data.duration || 0)
    })

    socket.on('audio:pause', () => {
      logger.debug('Audio pause event received')
      audioEngine.pause()
    })

    socket.on('audio:resume', () => {
      logger.debug('Audio resume event received')
      audioEngine.resume()
    })

    socket.on('audio:stop', () => {
      logger.debug('Audio stop event received')
      audioEngine.stop()
      audioAnalyzer.reset()
    })

    socket.on('audio:seek', (data: { time: number }) => {
      logger.debug(`Audio seek event received: ${data.time}`)
      audioEngine.seek(data.time)
    })

    socket.on('audio:volume', (data: { volume: number }) => {
      logger.debug(`Audio volume event received: ${data.volume}`)
      audioEngine.setVolume(data.volume)
    })

    // Live control events
    socket.on('live:start', () => {
      logger.info(`[Socket.IO] 📡 Received live:start from client ${socket.id}`)
      logger.info(`[Socket.IO] 🔄 Resetting XP session...`)
      xpService.resetSession()
      logger.info(`[Socket.IO] 📤 Broadcasting xp:reset to all clients`)
      io.emit('xp:reset', xpService.getState())
      logger.info(`[Socket.IO] 📤 Broadcasting live:start to ALL clients (including sender)`)
      io.emit('live:start') // Broadcast to all clients including live-view
      logger.info(`[Socket.IO] ✅ live:start broadcast complete`)
    })

    socket.on('live:stop', () => {
      logger.info('Live session stopped')
      io.emit('live:stop') // Broadcast to all clients including live-view
    })

    // Audio now playing (from live-view to control panel)
    socket.on('audio:nowplaying', (data: { song: any }) => {
      logger.debug(`Now playing: ${data.song.title || data.song.filename}`)
      io.emit('audio:nowplaying', data) // Broadcast to all clients
    })

    // Viewer join event
    socket.on('viewer:join', async (data: { viewerName?: string }) => {
      logger.info(`Viewer joined: ${data.viewerName || 'Anonymous'}`)
      const levelId = await soundService.getLevelIdByOrder(xpService.getState().currentLevel)
      if (levelId) {
        await soundService.playViewerJoinSound(levelId, data.viewerName)
      }
    })

    // XP events from client
    socket.on('xp:add', (data: { amount: number; source: string }) => {
      logger.debug(`XP added: ${data.amount} from ${data.source}`)
      const xpState = xpService.addManualXP(data.amount)
      const progress = xpService.getLevelProgress()
      const xpToNext = xpService.getXPToNextLevel()
      const nextLevelThreshold = xpService.getNextLevelThreshold()
      io.emit('xp:state', { ...xpState, progress, xpToNext, nextLevelThreshold })
    })

    socket.on('xp:add-audio', async (data: { triggerType: 'drop' | 'buildUp' }) => {
      logger.debug(`Audio XP trigger: ${data.triggerType}`)
      const xpState = await xpService.addAudioXP(data.triggerType)
      const progress = xpService.getLevelProgress()
      const xpToNext = xpService.getXPToNextLevel()
      const nextLevelThreshold = xpService.getNextLevelThreshold()
      io.emit('xp:state', { ...xpState, progress, xpToNext, nextLevelThreshold })
    })

    socket.on('xp:reset', () => {
      logger.info('XP session reset')
      const xpState = xpService.resetSession()
      const progress = xpService.getLevelProgress()
      const xpToNext = xpService.getXPToNextLevel()
      const nextLevelThreshold = xpService.getNextLevelThreshold()
      io.emit('xp:reset', { ...xpState, progress, xpToNext, nextLevelThreshold })
    })

    socket.on('level:force', (data: { level: number }) => {
      logger.debug(`Force level: ${data.level}`)
      const xpState = xpService.forceLevelUp()
      io.emit('level:up', xpState)
    })

    socket.on('event:trigger', (data: { eventId: string }) => {
      logger.debug(`Event triggered: ${data.eventId}`)
    })

    // Editor events
    socket.on('level:save', (data) => {
      logger.debug('Level save event received')
    })

    socket.on('level:delete', (data: { levelId: string }) => {
      logger.debug(`Level deleted: ${data.levelId}`)
    })

    // Disconnection handler
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`)
    })

    // Error handler
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error)
    })
  })

  logger.info('Socket.IO server initialized')

  return io
}

export function broadcastToAll(io: SocketIOServer, event: string, data: any) {
  io.emit(event, data)
}

export function broadcastToAllExcept(
  io: SocketIOServer,
  event: string,
  data: any,
  socketId: string
) {
  io.except(socketId).emit(event, data)
}
