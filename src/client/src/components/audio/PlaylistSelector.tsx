import { useState, useEffect } from 'react'
import { Play, Music } from 'lucide-react'
import { usePlaylist } from '../../hooks/usePlaylist'
import { useHowlerAudio } from '../../hooks/useHowlerAudio'
import { formatDuration } from '../../lib/utils'
import { Song } from '@shared/types'

export function PlaylistSelector() {
  const { songs, setCurrentSong } = usePlaylist()
  const { play } = useHowlerAudio()
  const [selectedSongId, setSelectedSongId] = useState<string>('')

  // Auto-select first song when playlist loads
  useEffect(() => {
    if (songs.length > 0 && !selectedSongId) {
      setSelectedSongId(songs[0].id)
    }
  }, [songs, selectedSongId])

  const handlePlaySelected = () => {
    const selectedSong = songs.find((s) => s.id === selectedSongId)
    if (selectedSong) {
      setCurrentSong(selectedSong)
      play(selectedSong.filename, selectedSong.duration)
    }
  }

  if (songs.length === 0) {
    return (
      <div className="bg-surface-light border border-primary-900 rounded-lg p-4">
        <div className="flex items-center gap-3 text-primary-300">
          <Music size={20} className="text-primary-500" />
          <p className="text-sm">Nenhuma música na playlist. Adicione músicas em Playlist Manager.</p>
        </div>
      </div>
    )
  }

  const selectedSong = songs.find((s) => s.id === selectedSongId)

  return (
    <div className="bg-surface-light border border-primary-900 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Music size={18} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-primary-200">Selecionar Música</h3>
      </div>

      <div className="flex items-center gap-3">
        {/* Dropdown */}
        <select
          value={selectedSongId}
          onChange={(e) => setSelectedSongId(e.target.value)}
          className="flex-1 px-3 py-2 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
        >
          {songs.map((song) => (
            <option key={song.id} value={song.id}>
              {song.title || song.filename}
              {song.artist && ` - ${song.artist}`}
              {' • '}
              {formatDuration(song.duration)}
            </option>
          ))}
        </select>

        {/* Play Button */}
        <button
          onClick={handlePlaySelected}
          disabled={!selectedSongId}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-900 disabled:cursor-not-allowed text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
          title="Tocar música selecionada"
        >
          <Play size={16} />
          Tocar
        </button>
      </div>

      {/* Selected song info */}
      {selectedSong && (
        <div className="mt-3 pt-3 border-t border-primary-900">
          <p className="text-xs text-primary-300">
            <span className="font-semibold">Selecionada:</span>{' '}
            {selectedSong.title || selectedSong.filename}
            {selectedSong.artist && ` • ${selectedSong.artist}`}
            {' • '}
            {formatDuration(selectedSong.duration)}
          </p>
        </div>
      )}
    </div>
  )
}
