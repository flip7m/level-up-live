import { GameEvent } from '../../shared/types.js'
import { EventRepository } from '../database/repositories/EventRepository.js'

export class EventService {
  private eventRepository: EventRepository
  private eventCooldowns: Map<string, number> = new Map()

  constructor(eventRepository: EventRepository) {
    this.eventRepository = eventRepository
  }

  /**
   * Get all events from database
   */
  async getAllEvents(): Promise<GameEvent[]> {
    return await this.eventRepository.getAllEvents()
  }

  /**
   * Get event by ID
   */
  async getEventById(id: string): Promise<GameEvent | undefined> {
    return await this.eventRepository.getEventById(id)
  }

  /**
   * Get events available for current level (filtering by minLevel and cooldowns)
   */
  async getAvailableEvents(currentLevel: number): Promise<GameEvent[]> {
    const allEvents = await this.getAllEvents()
    const now = Date.now()

    return allEvents.filter((event) => {
      // Check minimum level requirement
      const minLevel = event.triggerConfig?.minLevel || 1
      if (currentLevel < minLevel) {
        return false
      }

      // Check cooldown
      if (this.isOnCooldown(event.id, now)) {
        return false
      }

      return true
    })
  }

  /**
   * Check if event is on cooldown
   */
  isOnCooldown(eventId: string, now: number = Date.now()): boolean {
    const cooldownEnd = this.eventCooldowns.get(eventId)
    if (!cooldownEnd) return false
    return now < cooldownEnd
  }

  /**
   * Get cooldown remaining time in seconds
   */
  getCooldownRemaining(eventId: string, now: number = Date.now()): number {
    const cooldownEnd = this.eventCooldowns.get(eventId)
    if (!cooldownEnd) return 0
    const remaining = Math.max(0, cooldownEnd - now)
    return Math.ceil(remaining / 1000)
  }

  /**
   * Trigger specific event
   * @throws Error if event not found, level too low, or on cooldown
   */
  async triggerEvent(eventId: string, currentLevel: number): Promise<GameEvent> {
    const event = await this.getEventById(eventId)
    if (!event) {
      throw new Error(`Event not found: ${eventId}`)
    }

    // Validate minimum level
    const minLevel = event.triggerConfig?.minLevel || 1
    if (currentLevel < minLevel) {
      throw new Error(
        `Level ${currentLevel} too low for event "${event.name}" (requires level ${minLevel})`
      )
    }

    // Validate cooldown
    const now = Date.now()
    if (this.isOnCooldown(eventId, now)) {
      const remaining = this.getCooldownRemaining(eventId, now)
      throw new Error(`Event "${event.name}" is on cooldown (${remaining}s remaining)`)
    }

    // Set cooldown
    const cooldownMs = (event.triggerConfig?.cooldown || 0) * 1000
    if (cooldownMs > 0) {
      this.eventCooldowns.set(eventId, now + cooldownMs)
    }

    return event
  }

  /**
   * Trigger random event from available events
   * @throws Error if no events available
   */
  async triggerRandomEvent(currentLevel: number): Promise<GameEvent> {
    const availableEvents = await this.getAvailableEvents(currentLevel)

    if (availableEvents.length === 0) {
      throw new Error('No events available at current level or all on cooldown')
    }

    // If events have probability weights, use them
    const eventsWithProbability = availableEvents.filter(
      (e) => e.triggerConfig?.probability !== undefined
    )

    if (eventsWithProbability.length > 0) {
      // Weighted random selection
      const totalProbability = eventsWithProbability.reduce(
        (sum, e) => sum + (e.triggerConfig?.probability || 0),
        0
      )
      let random = Math.random() * totalProbability
      for (const event of eventsWithProbability) {
        random -= event.triggerConfig?.probability || 0
        if (random <= 0) {
          return await this.triggerEvent(event.id, currentLevel)
        }
      }
    }

    // Simple random selection
    const randomEvent = availableEvents[Math.floor(Math.random() * availableEvents.length)]
    return await this.triggerEvent(randomEvent.id, currentLevel)
  }

  /**
   * Create new event
   */
  async createEvent(eventData: Omit<GameEvent, 'id' | 'createdAt'>): Promise<GameEvent> {
    const event: GameEvent = {
      ...eventData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
    }
    await this.eventRepository.createEvent(event)
    return event
  }

  /**
   * Update event
   */
  async updateEvent(id: string, updates: Partial<GameEvent>): Promise<GameEvent> {
    const existing = await this.getEventById(id)
    if (!existing) {
      throw new Error(`Event not found: ${id}`)
    }

    const updated: GameEvent = { ...existing, ...updates, id }
    await this.eventRepository.updateEvent(updated)
    return updated
  }

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await this.eventRepository.deleteEvent(id)
    this.eventCooldowns.delete(id)
  }

  /**
   * Clear all cooldowns (useful for testing)
   */
  clearCooldowns(): void {
    this.eventCooldowns.clear()
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  }
}
