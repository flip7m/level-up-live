import { Request, Response } from 'express'
import { PlaylistService } from '../services/PlaylistService.js'
import { Song } from '@shared/types'
import { randomUUID } from 'crypto'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parseFile } from 'music-metadata'
import { logger } from '../utils/logger.js'

interface MetadataCache {
  filename: string
  title: string
  artist: string
  duration: number
  bpm: number | null
  addedAt: string
}

export class PlaylistController {
  constructor(private playlistService: PlaylistService) {}

  /**
   * GET /api/playlist - Obter todas as músicas da playlist
   */
  getAllSongs = async (req: Request, res: Response) => {
    try {
      const songs = this.playlistService.getAllSongs()
      const stats = this.playlistService.getStats()

      // Garantir que duration é um número
      const songsWithNumericDuration = songs.map(song => ({
        ...song,
        duration: typeof song.duration === 'string' ? parseFloat(song.duration) : (song.duration || 0),
      }))

      res.json({
        success: true,
        data: songsWithNumericDuration,
        stats,
        count: songsWithNumericDuration.length,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/playlist/current - Obter música atual
   */
  getCurrentSong = (req: Request, res: Response) => {
    try {
      const song = this.playlistService.getCurrentSong()

      res.json({
        success: true,
        data: song,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/add - Adicionar música à playlist
   */
  addSong = async (req: Request, res: Response) => {
    try {
      const { filePath, filename, title, artist, duration, bpm } = req.body

      if (!filePath || !filename || !title) {
        return res.status(400).json({
          success: false,
          error: 'filePath, filename e title são obrigatórios',
        })
      }

      const song: Song = {
        id: randomUUID(),
        filePath,
        filename,
        title,
        artist: artist || 'Desconhecido',
        duration: duration || 0,
        bpm,
        playlistOrder: 0,
        addedAt: new Date().toISOString(),
      }

      await this.playlistService.addSong(song)

      res.status(201).json({
        success: true,
        data: song,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * DELETE /api/playlist/:id - Remover música da playlist
   */
  removeSong = async (req: Request, res: Response) => {
    try {
      const { id } = req.params

      const removed = await this.playlistService.removeSong(id)

      if (!removed) {
        return res.status(404).json({
          success: false,
          error: 'Música não encontrada',
        })
      }

      res.json({
        success: true,
        message: 'Música removida da playlist',
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/reorder - Reordenar músicas
   */
  reorderSongs = async (req: Request, res: Response) => {
    try {
      const { songIds } = req.body

      if (!Array.isArray(songIds)) {
        return res.status(400).json({
          success: false,
          error: 'songIds deve ser um array',
        })
      }

      await this.playlistService.reorderSongs(songIds)
      const songs = this.playlistService.getAllSongs()

      res.json({
        success: true,
        message: 'Playlist reordenada',
        data: songs,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/next - Próxima música
   */
  playNext = (req: Request, res: Response) => {
    try {
      const song = this.playlistService.playNext()
      const stats = this.playlistService.getStats()

      res.json({
        success: true,
        data: song,
        stats,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/previous - Música anterior
   */
  playPrevious = (req: Request, res: Response) => {
    try {
      const song = this.playlistService.playPrevious()
      const stats = this.playlistService.getStats()

      res.json({
        success: true,
        data: song,
        stats,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/jump/:index - Pular para música
   */
  jumpToSong = (req: Request, res: Response) => {
    try {
      const { index } = req.params
      const song = this.playlistService.jumpToSong(parseInt(index))

      if (!song) {
        return res.status(404).json({
          success: false,
          error: 'Índice inválido',
        })
      }

      const stats = this.playlistService.getStats()

      res.json({
        success: true,
        data: song,
        stats,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/toggle-loop - Alternar repetição
   */
  toggleLoop = (req: Request, res: Response) => {
    try {
      const isLooping = this.playlistService.toggleLoop()

      res.json({
        success: true,
        isLooping,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * POST /api/playlist/toggle-shuffle - Alternar embaralho
   */
  toggleShuffle = (req: Request, res: Response) => {
    try {
      const isShuffling = this.playlistService.toggleShuffle()

      res.json({
        success: true,
        isShuffling,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * DELETE /api/playlist - Limpar playlist
   */
  clearPlaylist = async (req: Request, res: Response) => {
    try {
      await this.playlistService.clearPlaylist()

      res.json({
        success: true,
        message: 'Playlist limpa',
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/playlist/search - Buscar músicas
   */
  searchSongs = async (req: Request, res: Response) => {
    try {
      const { q } = req.query

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Termo de busca é obrigatório',
        })
      }

      const songs = await this.playlistService.searchSongs(q)

      res.json({
        success: true,
        data: songs,
        count: songs.length,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * GET /api/playlist/stats - Obter estatísticas da playlist
   */
  getStats = (req: Request, res: Response) => {
    try {
      const stats = this.playlistService.getStats()

      res.json({
        success: true,
        data: stats,
      })
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }

  /**
   * Extrair metadados do arquivo de áudio ou usar metadados em cache
   */
  private async extractMetadata(musicDir: string, filename: string, forceRefresh: boolean = false): Promise<MetadataCache> {
    try {
      const metadataFile = join(musicDir, `${filename}.metadata.json`)
      const musicFile = join(musicDir, filename)

      // Tenta carregar do cache primeiro (exceto se forceRefresh)
      if (!forceRefresh && existsSync(metadataFile)) {
        try {
          const cached = JSON.parse(readFileSync(metadataFile, 'utf-8')) as MetadataCache
          return cached
        } catch (err) {
          logger.warn(`Falha ao ler cache de metadados para ${filename}`, err)
        }
      }

      // Extrai metadados do arquivo
      let duration = 0
      let bpm: number | null = null

      try {
        const metadata = await parseFile(musicFile)
        if (metadata.format.duration) {
          duration = Math.round(metadata.format.duration * 10) / 10 // Arredonda para 1 casa decimal
        }

        // Tenta extrair BPM das tags ID3 se disponível
        if (metadata.common.bpm) {
          bpm = metadata.common.bpm
        }
      } catch (err) {
        logger.warn(`Falha ao analisar metadados de ${filename}`, err)
        duration = 0
      }

      // Cria objeto de metadados
      const metadataObj: MetadataCache = {
        filename,
        title: filename.replace(/\.[^/.]+$/, ''), // Remove extensão
        artist: 'Desconhecido',
        duration,
        bpm,
        addedAt: new Date().toISOString(),
      }

      // Cacheia
      try {
        writeFileSync(metadataFile, JSON.stringify(metadataObj, null, 2))
      } catch (err) {
        logger.warn(`Falha ao escrever cache de metadados para ${filename}`, err)
      }

      return metadataObj
    } catch (err) {
      logger.error(`Erro ao extrair metadados de ${filename}:`, err)
      return {
        filename,
        title: filename.replace(/\.[^/.]+$/, ''),
        artist: 'Desconhecido',
        duration: 0,
        bpm: null,
        addedAt: new Date().toISOString(),
      }
    }
  }

  /**
   * GET /api/playlist/available - Listar arquivos de música disponíveis em assets/music
   * Query params: ?refresh=true para forçar re-scan de metadados
   */
  getAvailableMusic = async (req: Request, res: Response) => {
    try {
      const { refresh } = req.query
      const forceRefresh = refresh === 'true'

      const musicDir = join(process.cwd(), 'assets', 'music')

      if (!existsSync(musicDir)) {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'Diretório de música não encontrado',
        })
      }

      const files = readdirSync(musicDir).filter((file) => {
        const ext = file.toLowerCase().split('.').pop()
        return ['mp3', 'mpeg', 'mpg', 'wav', 'ogg', 'flac', 'm4a', 'aac'].includes(ext || '') && !file.endsWith('.metadata.json')
      })

      logger.info(`Scanning ${files.length} music files (refresh: ${forceRefresh})`)

      // Extrai metadados de todos os arquivos
      const songs: Song[] = await Promise.all(
        files.map(async (filename, index) => {
          const metadata = forceRefresh
            ? await this.extractMetadata(musicDir, filename, true)
            : await this.extractMetadata(musicDir, filename)

          return {
            id: `asset-${index}-${filename}`,
            filePath: `/assets/music/${filename}`,
            filename,
            title: metadata.title,
            artist: metadata.artist,
            duration: typeof metadata.duration === 'string' ? parseFloat(metadata.duration) : metadata.duration,
            bpm: metadata.bpm,
            playlistOrder: 0,
            addedAt: metadata.addedAt,
          } as Song
        })
      )

      res.json({
        success: true,
        data: songs,
        count: songs.length,
      })
    } catch (err: any) {
      logger.error('Erro ao obter músicas disponíveis:', err)
      res.status(500).json({
        success: false,
        error: err.message,
      })
    }
  }
}

export default PlaylistController
