import { useCallback, useState } from 'react'
import { Song } from '@shared/types'
import apiClient from '../lib/api'

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all songs
  const fetchSongs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/playlist')
      setSongs(response.data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Add song
  const addSong = useCallback(
    async (filePath: string, filename: string, title: string, artist?: string, duration?: number, bpm?: number) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.post('/api/playlist/add', {
          filePath,
          filename,
          title,
          artist,
          duration,
          bpm,
        })
        const newSong = response.data.data
        setSongs([...songs, newSong])
        return newSong
      } catch (err: any) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [songs]
  )

  // Remove song
  const removeSong = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiClient.delete(`/api/playlist/${id}`)
        setSongs(songs.filter((s) => s.id !== id))
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [songs]
  )

  // Reorder songs
  const reorderSongs = useCallback(
    async (songIds: string[]) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.post('/api/playlist/reorder', { songIds })
        setSongs(response.data.data)
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Play next
  const playNext = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/playlist/next')
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  // Play previous
  const playPrevious = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/playlist/previous')
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  // Jump to song
  const jumpToSong = useCallback(async (index: number) => {
    try {
      const response = await apiClient.post(`/api/playlist/jump/${index}`)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  // Toggle loop
  const toggleLoop = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/playlist/toggle-loop')
      return response.data.isLooping
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }, [])

  // Toggle shuffle
  const toggleShuffle = useCallback(async () => {
    try {
      const response = await apiClient.post('/api/playlist/toggle-shuffle')
      return response.data.isShuffling
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }, [])

  // Search songs
  const searchSongs = useCallback(async (query: string) => {
    try {
      const response = await apiClient.get('/api/playlist/search', { params: { q: query } })
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      return []
    }
  }, [])

  return {
    songs,
    loading,
    error,
    fetchSongs,
    addSong,
    removeSong,
    reorderSongs,
    playNext,
    playPrevious,
    jumpToSong,
    toggleLoop,
    toggleShuffle,
    searchSongs,
  }
}
