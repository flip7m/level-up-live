import { Song } from '../../shared/types.js'
import { BaseRepository } from './BaseRepository.js'

export class SongRepository extends BaseRepository {
  async getAllSongs(): Promise<Song[]> {
    return this.all<Song>(
      'SELECT * FROM songs ORDER BY playlist_order ASC'
    )
  }

  async getSongById(id: string): Promise<Song | undefined> {
    return this.get<Song>(
      'SELECT * FROM songs WHERE id = $1',
      [id]
    )
  }

  async createSong(song: Song): Promise<void> {
    await this.run(
      `INSERT INTO songs (
        id, file_path, filename, title, artist, duration, bpm, playlist_order, added_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        song.id,
        song.filePath,
        song.filename,
        song.title,
        song.artist,
        song.duration,
        song.bpm,
        song.playlistOrder || 0,
        song.addedAt,
      ]
    )
  }

  async updateSong(song: Song): Promise<void> {
    await this.run(
      `UPDATE songs SET
        file_path = $1, filename = $2, title = $3, artist = $4,
        duration = $5, bpm = $6
      WHERE id = $7`,
      [
        song.filePath,
        song.filename,
        song.title,
        song.artist,
        song.duration,
        song.bpm,
        song.id,
      ]
    )
  }

  async deleteSong(id: string): Promise<void> {
    await this.run('DELETE FROM songs WHERE id = $1', [id])
  }

  async reorderSongs(orders: Array<{ id: string; order: number }>): Promise<void> {
    await this.transaction(async () => {
      for (const { id, order } of orders) {
        await this.run('UPDATE songs SET playlist_order = $1 WHERE id = $2', [order, id])
      }
    })
  }
}
