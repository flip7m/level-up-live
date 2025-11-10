import { useEffect, useState } from 'react'
import { Music, Clock } from 'lucide-react'
import { useAudioStore } from '../../stores/audioStore'
import { useWebSocket } from '../../hooks/useWebSocket'
import { formatDuration } from '../../lib/utils'
import { Song } from '@shared/types'

export function NowPlaying() {
  const socket = useWebSocket()
  const { playing, progress } = useAudioStore()
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [nextSong, setNextSong] = useState<Song | null>(null)
  const [displayTime, setDisplayTime] = useState('0:00')
  const [displayDuration, setDisplayDuration] = useState('0:00')

  const duration = currentSong?.duration || 0

  useEffect(() => {
    setDisplayTime(formatDuration(progress))
    setDisplayDuration(formatDuration(duration))
  }, [progress, duration])

  // Listen for current song updates from AudioManager
  useEffect(() => {
    if (!socket) return

    socket.on('audio:nowplaying', (data: { song: Song; nextSong?: Song }) => {
      setCurrentSong(data.song)
      setNextSong(data.nextSong || null)
    })

    return () => {
      socket.off('audio:nowplaying')
    }
  }, [socket])

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div className="bg-surface-light border border-primary-900 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <Music size={18} className="text-primary-400" />
        <h3 className="text-sm font-semibold text-primary-200">Tocando Agora</h3>
      </div>

      {currentSong ? (
        <div className="space-y-3">
          {/* Song info */}
          <div>
            <p className="text-lg font-semibold text-primary-100 truncate">
              {currentSong.title || currentSong.filename}
            </p>
            {currentSong.artist && (
              <p className="text-sm text-primary-400 truncate">{currentSong.artist}</p>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="w-full h-2 bg-surface-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-600 to-accent-pink transition-all duration-300"
                style={{ width: `${Math.min(progressPercent, 100)}%` }}
              />
            </div>

            {/* Time */}
            <div className="flex items-center justify-between text-xs text-primary-400">
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{displayTime}</span>
              </div>
              <span>{displayDuration}</span>
            </div>
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2">
            {playing ? (
              <div className="flex items-center gap-2 text-green-400">
                <div className="flex gap-0.5">
                  <div className="w-1 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '100ms' }} />
                  <div className="w-1 h-4 bg-green-400 animate-pulse" style={{ animationDelay: '200ms' }} />
                </div>
                <span className="text-xs font-medium">Reproduzindo</span>
              </div>
            ) : (
              <span className="text-xs text-primary-500">Pausado</span>
            )}
          </div>

          {/* Next song */}
          {nextSong && (
            <div className="pt-3 border-t border-primary-800">
              <p className="text-xs text-primary-400 mb-1">Próxima música:</p>
              <p className="text-sm text-primary-200 truncate">
                {nextSong.title || nextSong.filename}
              </p>
              {nextSong.artist && (
                <p className="text-xs text-primary-500 truncate">{nextSong.artist}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-6 text-center">
          <Music size={32} className="mx-auto mb-2 text-primary-700" />
          <p className="text-sm text-primary-500">Nenhuma música selecionada</p>
          <p className="text-xs text-primary-600 mt-1">
            Clique em "Iniciar Live" para começar a playlist
          </p>
        </div>
      )}
    </div>
  )
}
