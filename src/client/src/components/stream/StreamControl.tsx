import { useState, useEffect } from 'react'
import { Play, Square, AlertCircle } from 'lucide-react'
import { useWebSocket } from '../../hooks/useWebSocket'
import apiClient from '../../lib/api'

export function StreamControl() {
  const socket = useWebSocket()
  const [isStreaming, setIsStreaming] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check stream status on mount and listen for updates
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await apiClient.get('/api/stream/status')
        if (response.data) {
          setIsStreaming(response.data.isStreaming || false)
        }
      } catch (err) {
        console.error('[StreamControl] Error checking status:', err)
      }
    }

    checkStatus()

    // Listen for stream state updates from server (para persistir F5)
    if (socket) {
      socket.on('stream:state', (data: { isStreaming: boolean; pid: number | null }) => {
        console.log('[StreamControl] 📡 Received stream:state from server:', data)
        setIsStreaming(data.isStreaming || false)
      })

      return () => {
        socket.off('stream:state')
      }
    }
  }, [socket])

  const startStream = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[StreamControl] 🎥 Starting stream...')
      const response = await apiClient.post('/api/stream/start')

      if (response.data.success) {
        console.log('[StreamControl] ✅ Stream started:', response.data)
        setIsStreaming(true)
      } else {
        setError(response.data.error || 'Erro ao iniciar stream')
      }
    } catch (err: any) {
      console.error('[StreamControl] Error starting stream:', err)
      setError(err.message || 'Erro ao iniciar stream')
    } finally {
      setIsLoading(false)
    }
  }

  const stopStream = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[StreamControl] ⏹ Stopping stream...')
      const response = await apiClient.post('/api/stream/stop')

      if (response.data.success) {
        console.log('[StreamControl] ✅ Stream stopped:', response.data)
        setIsStreaming(false)
      } else {
        setError(response.data.error || 'Erro ao parar stream')
      }
    } catch (err: any) {
      console.error('[StreamControl] Error stopping stream:', err)
      setError(err.message || 'Erro ao parar stream')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-surface-light border border-primary-900 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-4">
        {isStreaming ? (
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        ) : (
          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
        )}
        <h3 className="text-sm font-semibold text-primary-200">
          {isStreaming ? 'Transmissão Ativa' : 'Transmissão'}
        </h3>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-900/30 border border-red-600 rounded flex gap-2 text-xs text-red-300">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3">
        {!isStreaming ? (
          <button
            onClick={startStream}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 text-white rounded font-medium transition-all duration-200"
          >
            <Play size={16} />
            {isLoading ? 'Iniciando...' : 'Iniciar Stream'}
          </button>
        ) : (
          <button
            onClick={stopStream}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 text-white rounded font-medium transition-all duration-200"
          >
            <Square size={16} />
            {isLoading ? 'Parando...' : 'Parar Stream'}
          </button>
        )}

        <div className="pt-2 border-t border-primary-800">
          <p className="text-xs text-primary-400">
            {isStreaming ? (
              <>
                🔴 <span className="text-green-400 font-medium">Transmitindo ao vivo para YouTube</span>
              </>
            ) : (
              <>
                ⚪ Pronto para transmitir
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
