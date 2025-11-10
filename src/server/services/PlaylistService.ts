import { Song } from '@shared/types'
import { SongRepository } from '../database/repositories/SongRepository.js'
import { logger } from '../utils/logger.js'

export interface PlaylistState {
  songs: Song[]
  currentIndex: number
  isLooping: boolean
  isShuffling: boolean
  shuffleOrder: number[]
}

export class PlaylistService {
  private playlist: PlaylistState

  constructor(private songRepository: SongRepository) {
    this.playlist = {
      songs: [],
      currentIndex: 0,
      isLooping: false,
      isShuffling: false,
      shuffleOrder: [],
    }

    // Load songs from database
    this.loadSongsFromDatabase()
  }

  /**
   * Load all songs from database into playlist
   */
  private async loadSongsFromDatabase(): Promise<void> {
    try {
      this.playlist.songs = await this.songRepository.getAllSongs()
      this.generateShuffleOrder()
      logger.info(`Loaded ${this.playlist.songs.length} songs from database`)
    } catch (err) {
      logger.error('Error loading songs from database:', err)
    }
  }

  /**
   * Reload songs from database (called after external changes)
   */
  async reloadSongs(): Promise<void> {
    await this.loadSongsFromDatabase()
  }

  /**
   * Generate shuffle order
   */
  private generateShuffleOrder(): void {
    this.playlist.shuffleOrder = Array.from({ length: this.playlist.songs.length }, (_, i) => i).sort(() => Math.random() - 0.5)
  }

  /**
   * Get current playlist state
   */
  getPlaylistState(): PlaylistState {
    return { ...this.playlist }
  }

  /**
   * Get all songs
   */
  getAllSongs(): Song[] {
    return [...this.playlist.songs]
  }

  /**
   * Get current song
   */
  getCurrentSong(): Song | null {
    if (this.playlist.songs.length === 0) return null

    const index = this.playlist.isShuffling ? this.playlist.shuffleOrder[this.playlist.currentIndex] : this.playlist.currentIndex
    return this.playlist.songs[index] || null
  }

  /**
   * Add song to playlist
   */
  async addSong(song: Song): Promise<void> {
    try {
      // Check if song already exists
      const exists = this.playlist.songs.some((s) => s.id === song.id)
      if (exists) {
        logger.warn(`Song ${song.id} already in playlist`)
        return
      }

      await this.songRepository.createSong(song)
      this.playlist.songs.push(song)
      this.generateShuffleOrder()

      logger.info(`Song added to playlist: ${song.id}`)
    } catch (err) {
      logger.error('Error adding song:', err)
      throw err
    }
  }

  /**
   * Remove song from playlist
   */
  async removeSong(id: string): Promise<boolean> {
    try {
      const index = this.playlist.songs.findIndex((s) => s.id === id)
      if (index === -1) return false

      // Remove from database
      await this.songRepository.deleteSong(id)

      // Remove from playlist
      this.playlist.songs.splice(index, 1)

      // Adjust currentIndex if needed
      if (this.playlist.currentIndex >= this.playlist.songs.length && this.playlist.songs.length > 0) {
        this.playlist.currentIndex = this.playlist.songs.length - 1
      }

      this.generateShuffleOrder()
      logger.info(`Song removed from playlist: ${id}`)

      return true
    } catch (err) {
      logger.error(`Error removing song ${id}:`, err)
      throw err
    }
  }

  /**
   * Reorder songs in playlist
   */
  async reorderSongs(songIds: string[]): Promise<void> {
    try {
      // Validate all songs exist
      const validIds = new Set(songIds)
      const allExist = this.playlist.songs.every((s) => validIds.has(s.id))

      if (!allExist || validIds.size !== this.playlist.songs.length) {
        throw new Error('Invalid song IDs in reorder request')
      }

      // Reorder
      const newPlaylist: Song[] = []
      for (let i = 0; i < songIds.length; i++) {
        const id = songIds[i]
        const song = this.playlist.songs.find((s) => s.id === id)
        if (song) {
          song.playlistOrder = i + 1 // 1-indexed for display
          newPlaylist.push(song)
        }
      }

      this.playlist.songs = newPlaylist
      this.generateShuffleOrder()

      // Save reordered playlist to database
      for (const song of this.playlist.songs) {
        await this.songRepository.updateSong(song)
      }

      logger.info('Playlist reordered')
    } catch (err) {
      logger.error('Error reordering playlist:', err)
      throw err
    }
  }

  /**
   * Play next song
   */
  playNext(): Song | null {
    if (this.playlist.songs.length === 0) return null

    const maxIndex = this.playlist.songs.length - 1

    if (this.playlist.currentIndex < maxIndex) {
      this.playlist.currentIndex += 1
    } else if (this.playlist.isLooping) {
      this.playlist.currentIndex = 0
    } else {
      return null // End of playlist
    }

    return this.getCurrentSong()
  }

  /**
   * Play previous song
   */
  playPrevious(): Song | null {
    if (this.playlist.songs.length === 0) return null

    if (this.playlist.currentIndex > 0) {
      this.playlist.currentIndex -= 1
    } else if (this.playlist.isLooping) {
      this.playlist.currentIndex = this.playlist.songs.length - 1
    } else {
      return null // Beginning of playlist
    }

    return this.getCurrentSong()
  }

  /**
   * Jump to song index
   */
  jumpToSong(index: number): Song | null {
    if (index < 0 || index >= this.playlist.songs.length) {
      return null
    }

    this.playlist.currentIndex = index
    return this.getCurrentSong()
  }

  /**
   * Toggle loop
   */
  toggleLoop(): boolean {
    this.playlist.isLooping = !this.playlist.isLooping
    logger.info(`Loop ${this.playlist.isLooping ? 'enabled' : 'disabled'}`)
    return this.playlist.isLooping
  }

  /**
   * Toggle shuffle
   */
  toggleShuffle(): boolean {
    this.playlist.isShuffling = !this.playlist.isShuffling

    if (this.playlist.isShuffling) {
      this.generateShuffleOrder()
    }

    logger.info(`Shuffle ${this.playlist.isShuffling ? 'enabled' : 'disabled'}`)
    return this.playlist.isShuffling
  }

  /**
   * Clear playlist
   */
  async clearPlaylist(): Promise<void> {
    try {
      // Delete all songs from database
      for (const song of this.playlist.songs) {
        await this.songRepository.deleteSong(song.id)
      }

      this.playlist.songs = []
      this.playlist.currentIndex = 0
      this.playlist.shuffleOrder = []

      logger.info('Playlist cleared')
    } catch (err) {
      logger.error('Error clearing playlist:', err)
      throw err
    }
  }

  /**
   * Search songs
   */
  async searchSongs(query: string): Promise<Song[]> {
    try {
      return await this.songRepository.all<Song>(
        'SELECT * FROM songs WHERE title ILIKE $1 OR artist ILIKE $1 ORDER BY playlist_order ASC',
        [`%${query}%`]
      )
    } catch (err) {
      logger.error(`Error searching songs: ${err}`)
      throw err
    }
  }

  /**
   * Get playlist stats
   */
  getStats() {
    return {
      totalSongs: this.playlist.songs.length,
      currentIndex: this.playlist.currentIndex,
      isLooping: this.playlist.isLooping,
      isShuffling: this.playlist.isShuffling,
      currentSong: this.getCurrentSong(),
    }
  }
}

export default PlaylistService
