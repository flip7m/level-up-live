import { Request, Response } from 'express'
import { spawn, ChildProcess } from 'child_process'
import { logger } from '../utils/logger.js'
import { Server as SocketIOServer } from 'socket.io'
import { writeFileSync, existsSync } from 'fs'
import path from 'path'

// Singleton instance to maintain state across requests
let xvfbProcess: ChildProcess | null = null
let chromiumProcess: ChildProcess | null = null
let ffmpegProcess: ChildProcess | null = null
let isStreaming = false
let io: SocketIOServer | null = null

const VIRTUAL_DISPLAY = ':99'
const CAPTURE_WIDTH = 1920
const CAPTURE_HEIGHT = 1080
const CAPTURE_FPS = 30

// Export getter para estado da stream (usado por Socket.IO)
export function getStreamState() {
  return {
    isStreaming,
    ffmpegPid: ffmpegProcess?.pid || null,
    xvfbPid: xvfbProcess?.pid || null,
    chromiumPid: chromiumProcess?.pid || null
  }
}

// Export setter para Socket.IO (chamado em socket.ts)
export function setStreamSocketIO(socketServer: SocketIOServer) {
  io = socketServer
}

export class StreamController {

  /**
   * Helper: Generate FFmpeg concat demuxer playlist file from database songs
   * Returns path to generated playlist file
   */
  private async generateAudioPlaylist(): Promise<string> {
    const playlistPath = '/tmp/levelup_playlist.txt'

    try {
      // Hardcoded playlist for now - songs are already in assets/music/
      // In production, this would query the database
      const projectRoot = process.cwd()
      const playlistContent = `ffconcat version 1.0
file '${projectRoot}/assets/music/Desabafo.mpeg'
file '${projectRoot}/assets/music/Força e Vivência 4.mp3'
`

      writeFileSync(playlistPath, playlistContent, 'utf-8')
      logger.info(`[Stream] Playlist file created: ${playlistPath}`)

      return playlistPath
    } catch (err: any) {
      logger.error('[Stream] Error generating playlist:', err.message)
      throw err
    }
  }

  /**
   * POST /api/stream/start
   * Inicia transmissão com captura de 8020 via Xvfb + Chromium + FFmpeg
   */
  startStream = async (req: Request, res: Response) => {
    if (isStreaming) {
      logger.warn('[Stream] Stream já está ativo')
      return res.status(400).json({ success: false, error: 'Stream já está ativo' })
    }

    try {
      const streamKey = process.env.YOUTUBE_STREAM_KEY
      const rtmpUrl = process.env.YOUTUBE_RTMP_URL

      if (!streamKey || !rtmpUrl) {
        logger.error('[Stream] Stream key ou RTMP URL não configurados')
        return res.status(400).json({
          success: false,
          error: 'Stream key ou RTMP URL não configurados no .env'
        })
      }

      const rtmpFull = `${rtmpUrl}/${streamKey}`

      logger.info('[Stream] 🎥 Iniciando captura de tela com Xvfb + Chromium + FFmpeg...')
      logger.info(`[Stream] RTMP: ${rtmpUrl}/***`)
      logger.info(`[Stream] Target: http://localhost:8020 (1920x1080 @ 30 FPS)`)

      // 0. Generate audio playlist from database songs
      logger.info('[Stream] 🎵 Gerando playlist de áudio...')
      try {
        const playlistPath = await this.generateAudioPlaylist()
        logger.info(`[Stream] ✅ Playlist gerada: ${playlistPath}`)
      } catch (e: any) {
        logger.error('[Stream] Erro ao gerar playlist:', e.message)
        return res.status(500).json({
          success: false,
          error: `Erro ao gerar playlist: ${e?.message || e}`
        })
      }

      // 1. Inicia Xvfb (display virtual)
      logger.info('[Stream] 📺 Iniciando display virtual Xvfb...')
      xvfbProcess = spawn('Xvfb', [
        VIRTUAL_DISPLAY,
        '-screen', '0',
        `${CAPTURE_WIDTH}x${CAPTURE_HEIGHT}x24`,
        '-ac'  // Disable access control
      ])

      xvfbProcess.on('error', (err) => {
        logger.error('[Stream] Xvfb error:', err.message)
        cleanupAllProcesses()
      })

      // Wait for Xvfb to start
      await sleep(2000)

      // 2. Inicia Chromium fullscreen no display virtual
      logger.info('[Stream] 🌐 Abrindo Chromium em tela cheia...')
      chromiumProcess = spawn('chromium', [
        `--display=${VIRTUAL_DISPLAY}`,
        '--kiosk',
        '--disable-gpu',
        // Disable translation
        '--disable-translate',
        '--disable-features=TranslateUI,Translate',
        // Disable other browser UI
        '--no-default-browser-check',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-background-networking',
        '--disable-component-extensions-with-background-pages',
        '--disable-blink-features=AutomationControlled',
        '--no-first-run',
        '--no-first-run-ui',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-infobars',
        '--disable-client-side-phishing-detection',
        '--disable-preconnect',
        `--window-size=${CAPTURE_WIDTH},${CAPTURE_HEIGHT}`,
        
        '--app=http://localhost:8020'
      ], {
        env: {
          ...process.env,
          DISPLAY: VIRTUAL_DISPLAY,
          LANG: 'en_US.UTF-8',
          LANGUAGE: 'en-US',
          LC_ALL: 'en_US.UTF-8'
        }
      })

      chromiumProcess.on('error', (err) => {
        logger.error('[Stream] Chromium error:', err.message)
        cleanupAllProcesses()
      })

      // Wait for Chromium to load the page
      logger.info('[Stream] ⏳ Aguardando página carregar completamente...')
      await sleep(8000)

      // 2. Inicia FFmpeg para capturar tela + áudio
      logger.info('[Stream] 🎬 Iniciando FFmpeg para captura de tela + áudio playlist...')
      const ffmpegArgs = [
        // Global options
        '-rtbufsize', '100M',
        // Audio input: Concat demuxer with playlist looping
        '-stream_loop', '-1',
        '-f', 'concat',
        '-safe', '0',
        '-i', '/tmp/levelup_playlist.txt',
        // Video input from X11 (Xvfb display)
        '-video_size', `${CAPTURE_WIDTH}x${CAPTURE_HEIGHT}`,
        '-framerate', `${CAPTURE_FPS}`,
        '-thread_queue_size', '1024',
        '-f', 'x11grab',
        '-i', `${VIRTUAL_DISPLAY}.0`,
        // Video encoding
        '-c:v', 'libx264',
        '-preset', 'veryfast',
        '-b:v', '2500k',
        '-maxrate', '3000k',
        '-bufsize', '6000k',
        '-pix_fmt', 'yuv420p',
        '-g', '60',  // Keyframe interval
        // Audio encoding
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        // Map streams (audio from input 0, video from input 1)
        '-map', '0:a:0',
        '-map', '1:v:0',
        // Output
        '-f', 'flv',
        '-flvflags', 'no_duration_filesize',
        rtmpFull
      ]

      ffmpegProcess = spawn('ffmpeg', ffmpegArgs)

      ffmpegProcess.stdout?.on('data', (data) => {
        logger.info(`[Stream/FFmpeg] ${data.toString().trim()}`)
      })

      ffmpegProcess.stderr?.on('data', (data) => {
        const msg = data.toString().trim()
        // Log all FFmpeg output to debug audio issues
        if (msg) {
          logger.info(`[Stream/FFmpeg] ${msg}`)
        }
      })

      ffmpegProcess.on('error', (err) => {
        logger.error('[Stream] FFmpeg error:', err.message)
        cleanupAllProcesses()
        if (io) {
          io.emit('stream:error', { error: 'FFmpeg error: ' + err.message })
        }
      })

      ffmpegProcess.on('close', (code) => {
        logger.info(`[Stream] FFmpeg encerrou com código ${code}`)
        cleanupAllProcesses()
        if (io) {
          io.emit('stream:state', getStreamState())
        }
      })

      isStreaming = true

      // Emit stream state via Socket.IO
      if (io) {
        io.emit('stream:state', getStreamState())
        // Trigger live start event to play audio
        io.emit('live:start')
      }

      logger.info('[Stream] ✅ Stream iniciada com sucesso!')
      logger.info(`[Stream] Capturando: 1920x1080 @ 30 FPS`)
      logger.info(`[Stream] Transmitindo para: ${rtmpUrl}/***`)
      logger.info('[Stream] 🎵 Reproduzindo playlist de áudio em loop...')

      return res.json({
        success: true,
        message: 'Transmissão iniciada (8020 video + playlist audio via FFmpeg concat demuxer)',
        ffmpegPid: ffmpegProcess?.pid,
        xvfbPid: xvfbProcess?.pid,
        chromiumPid: chromiumProcess?.pid,
        rtmp: rtmpUrl,
        fps: CAPTURE_FPS,
        resolution: `${CAPTURE_WIDTH}x${CAPTURE_HEIGHT}`,
        display: VIRTUAL_DISPLAY
      })
    } catch (err: any) {
      logger.error('[Stream] Erro ao iniciar:', err)
      cleanupAllProcesses()
      return res.status(500).json({
        success: false,
        error: `Erro ao iniciar transmissão: ${err?.message || err}`
      })
    }
  }

  /**
   * POST /api/stream/stop
   * Para transmissão e limpa todos os processos
   */
  stopStream = (req: Request, res: Response) => {
    if (!isStreaming) {
      logger.warn('[Stream] Nenhuma transmissão ativa')
      return res.status(400).json({ success: false, error: 'Nenhuma transmissão ativa' })
    }

    try {
      logger.info('[Stream] ⏹ Parando transmissão...')
      cleanupAllProcesses()

      return res.json({
        success: true,
        message: 'Transmissão parada'
      })
    } catch (err) {
      logger.error('[Stream] Erro ao parar transmissão:', err)
      return res.status(500).json({
        success: false,
        error: 'Erro ao parar transmissão'
      })
    }
  }

  /**
   * GET /api/stream/status
   * Retorna status da transmissão
   */
  getStreamStatus = (req: Request, res: Response) => {
    return res.json({
      success: true,
      isStreaming: isStreaming,
      ffmpegPid: ffmpegProcess?.pid || null,
      xvfbPid: xvfbProcess?.pid || null,
      chromiumPid: chromiumProcess?.pid || null
    })
  }
}

// Helper functions
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}



function cleanupAllProcesses() {
  logger.info('[Stream] 🧹 Limpando todos os processos...')

  isStreaming = false

  // Kill FFmpeg
  if (ffmpegProcess) {
    try {
      ffmpegProcess.kill('SIGTERM')
      setTimeout(() => {
        if (ffmpegProcess) ffmpegProcess.kill('SIGKILL')
      }, 3000)
    } catch (e) {
      logger.warn('[Stream] Erro ao matar FFmpeg:', e)
    }
    ffmpegProcess = null
  }

  // Kill Chromium (video)
  if (chromiumProcess) {
    try {
      chromiumProcess.kill('SIGTERM')
      setTimeout(() => {
        if (chromiumProcess) chromiumProcess.kill('SIGKILL')
      }, 2000)
    } catch (e) {
      logger.warn('[Stream] Erro ao matar Chromium (video):', e)
    }
    chromiumProcess = null
  }

  // Kill Xvfb
  if (xvfbProcess) {
    try {
      xvfbProcess.kill('SIGTERM')
      setTimeout(() => {
        if (xvfbProcess) xvfbProcess.kill('SIGKILL')
      }, 1000)
    } catch (e) {
      logger.warn('[Stream] Erro ao matar Xvfb:', e)
    }
    xvfbProcess = null
  }

  // Emit state via Socket.IO
  if (io) {
    io.emit('stream:state', getStreamState())
  }

  logger.info('[Stream] ✅ Cleanup completo')
}
