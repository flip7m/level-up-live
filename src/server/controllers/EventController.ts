import { Request, Response } from 'express'
import { EventService } from '../services/EventService.js'
import { GameEvent } from '@shared/types'
import { logger } from '../utils/logger.js'
import { Server as SocketServer } from 'socket.io'

export class EventController {
  private io: SocketServer | null = null

  constructor(private eventService: EventService) {}

  /**
   * Set Socket.IO instance for real-time events
   */
  setSocketServer(io: SocketServer) {
    this.io = io
  }

  /**
   * GET /api/events - Get all events
   */
  getAllEvents = async (req: Request, res: Response) => {
    try {
      const events = await this.eventService.getAllEvents()

      res.json({
        success: true,
        data: events,
        count: events.length,
      })
    } catch (err: any) {
      logger.error('Error getting all events:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/events/available - Get available events for current level
   */
  getAvailableEvents = async (req: Request, res: Response) => {
    try {
      const { level } = req.query
      const currentLevel = level ? parseInt(level as string) : 1

      const events = await this.eventService.getAvailableEvents(currentLevel)

      res.json({
        success: true,
        data: events,
        count: events.length,
      })
    } catch (err: any) {
      logger.error('Error getting available events:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/events/:id - Get event by ID
   */
  getEventById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const event = await this.eventService.getEventById(id)

      if (!event) {
        return res.status(404).json({
          success: false,
          error: 'Event not found',
        })
      }

      res.json({
        success: true,
        data: event,
      })
    } catch (err: any) {
      logger.error('Error getting event by ID:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/events/trigger/:id - Trigger specific event
   */
  triggerEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const { level } = req.body
      const currentLevel = level || 1

      const event = await this.eventService.triggerEvent(id, currentLevel)

      // DEBUG: Log event data
      logger.info(
        `[EventController] Event from DB: ${event.name}, effectType=${event.effectType}, hasAssets=${!!event.assets}`
      )

      // Emit WebSocket event with complete event data
      if (this.io) {
        const payload = {
          eventId: event.id,
          name: event.name,
          description: event.description,
          duration: event.duration,
          // Procedural effects
          effectType: event.effectType,
          effectConfig: event.effectConfig,
          sounds: event.assets?.sounds || [],
          // Traditional assets (image/video layers)
          assets: event.assets,
          triggeredAt: new Date().toISOString(),
          type: 'manual',
        }

        logger.info(`[EventController] Emitting: effectType=${payload.effectType}`)

        this.io.emit('event:triggered', payload)

        // Schedule end event
        setTimeout(() => {
          if (this.io) {
            this.io.emit('event:ended', {
              eventId: event.id,
              name: event.name,
              endedAt: new Date().toISOString(),
            })
          }
        }, event.duration * 1000)
      }

      logger.info(`Event triggered: ${event.name} (ID: ${event.id})`)

      res.json({
        success: true,
        data: event,
        message: `Event "${event.name}" triggered`,
      })
    } catch (err: any) {
      logger.error('Error triggering event:', err)
      res.status(400).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/events/trigger-random - Trigger random event
   */
  triggerRandomEvent = async (req: Request, res: Response) => {
    try {
      const { level } = req.body
      const currentLevel = level || 1

      const event = await this.eventService.triggerRandomEvent(currentLevel)

      // Emit WebSocket event
      if (this.io) {
        this.io.emit('event:triggered', {
          eventId: event.id,
          name: event.name,
          description: event.description,
          duration: event.duration,
          // Procedural effects
          effectType: event.effectType,
          effectConfig: event.effectConfig,
          sounds: event.assets?.sounds || [],
          // Traditional assets (image/video layers)
          assets: event.assets,
          triggeredAt: new Date().toISOString(),
          type: 'random',
        })

        // Schedule end event
        setTimeout(() => {
          if (this.io) {
            this.io.emit('event:ended', {
              eventId: event.id,
              name: event.name,
              endedAt: new Date().toISOString(),
            })
          }
        }, event.duration * 1000)
      }

      logger.info(`Random event triggered: ${event.name} (ID: ${event.id})`)

      res.json({
        success: true,
        data: event,
        message: `Random event "${event.name}" triggered`,
      })
    } catch (err: any) {
      logger.error('Error triggering random event:', err)
      res.status(400).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/events - Create new event
   */
  createEvent = async (req: Request, res: Response) => {
    try {
      const eventData = req.body

      if (!eventData.name || !eventData.type || !eventData.triggerType) {
        return res.status(400).json({
          success: false,
          error: 'name, type, and triggerType are required',
        })
      }

      const event = await this.eventService.createEvent(eventData)

      logger.info(`Event created: ${event.name} (ID: ${event.id})`)

      res.status(201).json({
        success: true,
        data: event,
        message: 'Event created successfully',
      })
    } catch (err: any) {
      logger.error('Error creating event:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * PUT /api/events/:id - Update event
   */
  updateEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params
      const updates = req.body

      const event = await this.eventService.updateEvent(id, updates)

      logger.info(`Event updated: ${event.name} (ID: ${event.id})`)

      res.json({
        success: true,
        data: event,
        message: 'Event updated successfully',
      })
    } catch (err: any) {
      logger.error('Error updating event:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * DELETE /api/events/:id - Delete event
   */
  deleteEvent = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      await this.eventService.deleteEvent(id)

      logger.info(`Event deleted: ${id}`)

      res.json({
        success: true,
        message: 'Event deleted successfully',
      })
    } catch (err: any) {
      logger.error('Error deleting event:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/events/clear-cooldowns - Clear all cooldowns (testing only)
   */
  clearCooldowns = (req: Request, res: Response) => {
    try {
      this.eventService.clearCooldowns()

      logger.info('All event cooldowns cleared')

      res.json({
        success: true,
        message: 'All cooldowns cleared',
      })
    } catch (err: any) {
      logger.error('Error clearing cooldowns:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  setupSocketListeners(io: SocketServer) {
    this.io = io

    io.on('connection', (socket) => {
      // Listen for event trigger requests
      socket.on('event:trigger', async (data: { eventId: string; level?: number }) => {
        try {
          const currentLevel = data.level || 1
          const event = await this.eventService.triggerEvent(data.eventId, currentLevel)

          // Emit to all clients with complete event data
          io.emit('event:triggered', {
            eventId: event.id,
            name: event.name,
            description: event.description,
            duration: event.duration,
            // Procedural effects
            effectType: event.effectType,
            effectConfig: event.effectConfig,
            sounds: event.assets?.sounds || [],
            // Traditional assets (image/video layers)
            assets: event.assets,
            triggeredAt: new Date().toISOString(),
            type: 'manual',
          })

          // Schedule end event
          setTimeout(() => {
            io.emit('event:ended', {
              eventId: event.id,
              name: event.name,
              endedAt: new Date().toISOString(),
            })
          }, event.duration * 1000)
        } catch (err: any) {
          socket.emit('event:error', {
            error: err.message,
          })
        }
      })

      // Listen for random event trigger requests
      socket.on('event:trigger-random', async (data: { level?: number }) => {
        try {
          const currentLevel = data.level || 1
          const event = await this.eventService.triggerRandomEvent(currentLevel)

          // Emit to all clients with complete event data
          io.emit('event:triggered', {
            eventId: event.id,
            name: event.name,
            description: event.description,
            duration: event.duration,
            // Procedural effects
            effectType: event.effectType,
            effectConfig: event.effectConfig,
            sounds: event.assets?.sounds || [],
            // Traditional assets (image/video layers)
            assets: event.assets,
            triggeredAt: new Date().toISOString(),
            type: 'random',
          })

          // Schedule end event
          setTimeout(() => {
            io.emit('event:ended', {
              eventId: event.id,
              name: event.name,
              endedAt: new Date().toISOString(),
            })
          }, event.duration * 1000)
        } catch (err: any) {
          socket.emit('event:error', {
            error: err.message,
          })
        }
      })
    })
  }
}

export default EventController
