import { Request, Response } from 'express'
import { audioEngine } from '../services/AudioEngine.js'
import { audioAnalyzer } from '../services/AudioAnalyzer.js'
import { logger } from '../utils/logger.js'

export class AudioEngineController {
  /**
   * GET /api/audio/state
   * Get current audio state
   */
  static getState(req: Request, res: Response) {
    try {
      const state = audioEngine.getState()
      res.json(state)
    } catch (err) {
      logger.error('Failed to get audio state', err)
      res.status(500).json({ error: 'Failed to get audio state' })
    }
  }

  /**
   * POST /api/audio/play
   * Play audio with track path and duration
   */
  static play(req: Request, res: Response) {
    try {
      const { trackPath, duration } = req.body

      if (!trackPath) {
        return res.status(400).json({ error: 'trackPath is required' })
      }

      audioEngine.play(trackPath, duration || 0)
      res.json({ status: 'playing', trackPath, duration })
    } catch (err) {
      logger.error('Failed to play audio', err)
      res.status(500).json({ error: 'Failed to play audio' })
    }
  }

  /**
   * POST /api/audio/pause
   * Pause audio
   */
  static pause(req: Request, res: Response) {
    try {
      audioEngine.pause()
      res.json({ status: 'paused' })
    } catch (err) {
      logger.error('Failed to pause audio', err)
      res.status(500).json({ error: 'Failed to pause audio' })
    }
  }

  /**
   * POST /api/audio/resume
   * Resume audio
   */
  static resume(req: Request, res: Response) {
    try {
      audioEngine.resume()
      res.json({ status: 'resumed' })
    } catch (err) {
      logger.error('Failed to resume audio', err)
      res.status(500).json({ error: 'Failed to resume audio' })
    }
  }

  /**
   * POST /api/audio/stop
   * Stop audio
   */
  static stop(req: Request, res: Response) {
    try {
      audioEngine.stop()
      audioAnalyzer.reset()
      res.json({ status: 'stopped' })
    } catch (err) {
      logger.error('Failed to stop audio', err)
      res.status(500).json({ error: 'Failed to stop audio' })
    }
  }

  /**
   * POST /api/audio/seek
   * Seek to time in seconds
   */
  static seek(req: Request, res: Response) {
    try {
      const { time } = req.body

      if (typeof time !== 'number') {
        return res.status(400).json({ error: 'time must be a number' })
      }

      audioEngine.seek(time)
      res.json({ status: 'seeked', time })
    } catch (err) {
      logger.error('Failed to seek', err)
      res.status(500).json({ error: 'Failed to seek' })
    }
  }

  /**
   * POST /api/audio/volume
   * Set volume (0-1)
   */
  static setVolume(req: Request, res: Response) {
    try {
      const { volume } = req.body

      if (typeof volume !== 'number') {
        return res.status(400).json({ error: 'volume must be a number' })
      }

      audioEngine.setVolume(volume)
      res.json({ status: 'volumeSet', volume })
    } catch (err) {
      logger.error('Failed to set volume', err)
      res.status(500).json({ error: 'Failed to set volume' })
    }
  }

  /**
   * GET /api/audio/analysis
   * Get current audio analysis data
   */
  static getAnalysis(req: Request, res: Response) {
    try {
      const analysis = audioEngine.getAnalysis()
      res.json(analysis)
    } catch (err) {
      logger.error('Failed to get analysis', err)
      res.status(500).json({ error: 'Failed to get analysis' })
    }
  }

  /**
   * POST /api/audio/test
   * Test audio playback (simulated)
   */
  static testPlayback(req: Request, res: Response) {
    try {
      const { duration = 30 } = req.body

      // Play a dummy track
      audioEngine.play('test-track.mp3', duration)

      res.json({
        status: 'testing',
        message: 'Audio playback test started',
        duration,
      })
    } catch (err) {
      logger.error('Failed to test playback', err)
      res.status(500).json({ error: 'Failed to test playback' })
    }
  }
}
