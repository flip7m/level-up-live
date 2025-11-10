import { useAudioStore } from '../stores/audioStore'
import { Song } from '@shared/types'
import { useEffect, useCallback } from 'react'
import apiClient from '../lib/api'

export function usePlaylist() {
  const {
    songs,
    setSongs,
    currentSong,
    setCurrentSong,
    isLooping,
    isShuffling,
    setLoop,
    setShuffle,
  } = useAudioStore()

  // Load playlist from backend on mount
  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        const response = await apiClient.get('/api/playlist')
        if (response.data.data && Array.isArray(response.data.data)) {
          // Converter duração de string para número se necessário
          const songsWithNumericDuration = response.data.data.map((song: Song) => ({
            ...song,
            duration: typeof song.duration === 'string' ? parseFloat(song.duration) : song.duration,
          }))
          setSongs(songsWithNumericDuration)
        }
      } catch (error) {
        console.error('Falha ao carregar playlist:', error)
      }
    }

    loadPlaylist()
  }, [setSongs])

  const addSong = useCallback(async (song: Song) => {
    try {
      const response = await apiClient.post('/api/playlist/add', {
        filePath: song.filePath,
        filename: song.filename,
        title: song.title,
        artist: song.artist,
        duration: song.duration,
        bpm: song.bpm,
      })

      // Add to local state with the returned song data (which includes ID from backend)
      const newSongs = [...songs, response.data.data]
      setSongs(newSongs)
    } catch (error) {
      console.error('Failed to add song to backend:', error)
      throw error
    }
  }, [songs, setSongs])

  const removeSong = useCallback(async (id: string) => {
    try {
      await apiClient.delete(`/api/playlist/${id}`)

      // Remove from local state
      const newSongs = songs.filter((s) => s.id !== id)
      setSongs(newSongs)
    } catch (error) {
      console.error('Failed to remove song from backend:', error)
      throw error
    }
  }, [songs, setSongs])

  const reorderSongs = useCallback(async (songIds: string[]) => {
    try {
      const response = await apiClient.post('/api/playlist/reorder', {
        songIds,
      })

      // Update local state with reordered songs
      if (response.data.data && Array.isArray(response.data.data)) {
        setSongs(response.data.data)
      }
    } catch (error) {
      console.error('Failed to reorder songs:', error)
      throw error
    }
  }, [setSongs])

  const getNextSong = useCallback((): Song | null => {
    if (!currentSong || songs.length === 0) return null

    const currentIndex = songs.findIndex((s) => s.id === currentSong.id)
    if (currentIndex === -1) return songs[0] || null

    if (isShuffling) {
      return songs[Math.floor(Math.random() * songs.length)]
    }

    const nextIndex = (currentIndex + 1) % songs.length
    if (nextIndex === 0 && !isLooping) return null

    return songs[nextIndex]
  }, [currentSong, songs, isLooping, isShuffling])

  return {
    songs,
    currentSong,
    isLooping,
    isShuffling,
    addSong,
    removeSong,
    reorderSongs,
    getNextSong,
    setCurrentSong,
    setLoop,
    setShuffle,
  }
}
