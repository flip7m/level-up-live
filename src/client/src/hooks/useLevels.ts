import { useCallback, useState } from 'react'
import { Level } from '@shared/types'
import apiClient from '../lib/api'

export function useLevels() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all levels
  const fetchLevels = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/levels')
      console.log('🎮 useLevels: Full API response:', response.data)
      console.log('🎮 useLevels: Levels array:', response.data.data)
      console.log('🎮 useLevels: First level:', response.data.data[0])
      console.log('🎮 useLevels: First level layers:', response.data.data[0]?.layers)
      setLevels(response.data.data)
    } catch (err: any) {
      console.error('❌ useLevels: Error fetching levels:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Get level by ID
  const getLevelById = useCallback(async (id: string) => {
    try {
      const response = await apiClient.get(`/api/levels/${id}`)
      return response.data.data
    } catch (err: any) {
      setError(err.message)
      return null
    }
  }, [])

  // Create level
  const createLevel = useCallback(
    async (name: string, description: string, xpThreshold: number) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.post('/api/levels', {
          name,
          description,
          xpThreshold,
        })
        const newLevel = response.data.data
        setLevels([...levels, newLevel])
        return newLevel
      } catch (err: any) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [levels]
  )

  // Update level
  const updateLevel = useCallback(
    async (id: string, updates: Partial<Level>) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.put(`/api/levels/${id}`, updates)
        const updated = response.data.data
        setLevels(levels.map((l) => (l.id === id ? updated : l)))
        return updated
      } catch (err: any) {
        setError(err.message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [levels]
  )

  // Delete level
  const deleteLevel = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        await apiClient.delete(`/api/levels/${id}`)
        setLevels(levels.filter((l) => l.id !== id))
        return true
      } catch (err: any) {
        setError(err.message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [levels]
  )

  // Reorder levels
  const reorderLevels = useCallback(
    async (levelIds: string[]) => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.post('/api/levels/reorder', { levelIds })
        setLevels(response.data.data)
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

  return {
    levels,
    loading,
    error,
    fetchLevels,
    getLevelById,
    createLevel,
    updateLevel,
    deleteLevel,
    reorderLevels,
  }
}
