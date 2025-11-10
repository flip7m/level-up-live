/**
 * Singleton service instances
 * This file manages all service instances to ensure they're used consistently throughout the app
 */

import { AudioEngine } from '../services/AudioEngine.js'
import { AudioAnalyzer } from '../services/AudioAnalyzer.js'
import { XPService } from '../services/XPService.js'
import { LevelService } from '../services/LevelService.js'
import { SceneManager } from '../services/SceneManager.js'
import { PlaylistService } from '../services/PlaylistService.js'
import { EventService } from '../services/EventService.js'
import { SessionService } from '../services/SessionService.js'
import { SoundService } from '../services/SoundService.js'
import { LevelRepository } from '../database/repositories/LevelRepository.js'
import { SongRepository } from '../database/repositories/SongRepository.js'
import { EventRepository } from '../database/repositories/EventRepository.js'
import { SessionRepository } from '../database/repositories/SessionRepository.js'
import { logger } from './logger.js'

let audioEngine: AudioEngine | null = null
let audioAnalyzer: AudioAnalyzer | null = null
let xpService: XPService | null = null
let levelService: LevelService | null = null
let sceneManager: SceneManager | null = null
let playlistService: PlaylistService | null = null
let eventService: EventService | null = null
let sessionService: SessionService | null = null
let soundService: SoundService | null = null

/**
 * Get or create AudioEngine instance
 */
export function getAudioEngine(): AudioEngine {
  if (!audioEngine) {
    audioEngine = new AudioEngine()
    logger.info('AudioEngine service initialized')
  }
  return audioEngine
}

/**
 * Get or create AudioAnalyzer instance
 */
export function getAudioAnalyzer(): AudioAnalyzer {
  if (!audioAnalyzer) {
    audioAnalyzer = new AudioAnalyzer()
    logger.info('AudioAnalyzer service initialized')
  }
  return audioAnalyzer
}

/**
 * Get or create XPService instance
 * NOTE: Must call initializeXPService() after getting instance
 */
export function getXPService(): XPService {
  if (!xpService) {
    const levelRepository = new LevelRepository()
    xpService = new XPService(levelRepository)
    logger.info('XPService created (awaiting initialization)')
  }
  return xpService
}

/**
 * Initialize XPService (loads level thresholds from database)
 * MUST be called after getXPService() and before using the service
 */
export async function initializeXPService(): Promise<void> {
  const service = getXPService()
  await service.initialize()
  logger.info('XPService fully initialized with database thresholds')
}

/**
 * Get or create LevelService instance
 */
export function getLevelService(): LevelService {
  if (!levelService) {
    const levelRepository = new LevelRepository()
    levelService = new LevelService(levelRepository)
    logger.info('LevelService initialized')
  }
  return levelService
}

/**
 * Get or create SceneManager instance
 */
export function getSceneManager(): SceneManager {
  if (!sceneManager) {
    sceneManager = new SceneManager()
    logger.info('SceneManager initialized')
  }
  return sceneManager
}

/**
 * Get or create PlaylistService instance
 */
export function getPlaylistService(): PlaylistService {
  if (!playlistService) {
    const songRepository = new SongRepository()
    playlistService = new PlaylistService(songRepository)
    logger.info('PlaylistService initialized')
  }
  return playlistService
}

/**
 * Get or create EventService instance
 */
export function getEventService(): EventService {
  if (!eventService) {
    const eventRepository = new EventRepository()
    eventService = new EventService(eventRepository)
    logger.info('EventService initialized')
  }
  return eventService
}

/**
 * Get or create SessionService instance
 */
export function getSessionService(): SessionService {
  if (!sessionService) {
    const sessionRepository = new SessionRepository()
    sessionService = new SessionService(sessionRepository)
    logger.info('SessionService initialized')
  }
  return sessionService
}

/**
 * Get or create SoundService instance
 */
export function getSoundService(): SoundService {
  if (!soundService) {
    const levelRepository = new LevelRepository()
    soundService = new SoundService(levelRepository)
    logger.info('SoundService initialized')
  }
  return soundService
}

/**
 * Reset all services (for testing)
 */
export function resetAllServices(): void {
  audioEngine = null
  audioAnalyzer = null
  xpService = null
  levelService = null
  sceneManager = null
  playlistService = null
  eventService = null
  sessionService = null
  soundService = null
  logger.info('All services reset')
}
