import { useEffect, useState, useCallback } from 'react'
import { usePlaylist } from '../hooks/usePlaylist'
import { Song } from '@shared/types'
import apiClient from '../lib/api'
import { Plus, Trash2, RefreshCw, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableSongProps {
  song: Song
  index: number
  onRemove: (id: string) => void
}

function SortableSongItem({ song, index, onRemove }: SortableSongProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: song.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const formatarDuracao = (seconds: number) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 bg-surface-darker hover:bg-surface-lighter rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-primary-700 rounded"
          title="Arrastar para reordenar"
        >
          <GripVertical size={16} className="text-primary-400" />
        </button>
        <span className="text-primary-400 font-mono text-sm min-w-[2rem]">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="text-primary-100 font-medium text-sm truncate">{song.title}</p>
          {song.artist && song.artist !== 'Unknown' && song.artist !== 'Desconhecido' && (
            <p className="text-primary-400 text-xs truncate">{song.artist}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        <div className="text-primary-400 text-xs font-mono min-w-[3rem] text-right">
          {formatarDuracao(song.duration)}
        </div>
        <button
          onClick={() => onRemove(song.id)}
          className="p-2 hover:bg-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Remover da playlist"
        >
          <Trash2 size={14} className="text-red-400 hover:text-white" />
        </button>
      </div>
    </div>
  )
}

export function PlaylistManager() {
  const { songs, addSong, removeSong, reorderSongs } = usePlaylist()
  const [availableSongs, setAvailableSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchAvailableMusic = useCallback(async (forceRefresh: boolean = false) => {
    try {
      setRefreshing(true)
      const url = forceRefresh ? '/api/playlist/available?refresh=true' : '/api/playlist/available'
      const response = await apiClient.get(url)
      setAvailableSongs(response.data.data)
      console.log(`[Playlist] Loaded ${response.data.data.length} available songs (refresh: ${forceRefresh})`)
    } catch (error) {
      console.error('Falha ao carregar músicas disponíveis:', error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Carregamento inicial
  useEffect(() => {
    setLoading(true)
    fetchAvailableMusic().then(() => setLoading(false))
  }, [fetchAvailableMusic])

  const handleAddSong = async (song: Song) => {
    await addSong(song)
  }

  const handleRemoveSong = async (id: string) => {
    await removeSong(id)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = songs.findIndex((s) => s.id === active.id)
      const newIndex = songs.findIndex((s) => s.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(songs, oldIndex, newIndex)
        const songIds = newOrder.map((s) => s.id)
        await reorderSongs(songIds)
      }
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-primary-100 mb-8">Gerenciador de Playlist</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Músicas Disponíveis */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-primary-100">Músicas Disponíveis</h2>
            <button
              onClick={() => fetchAvailableMusic(true)}
              disabled={refreshing}
              className="p-2 rounded-lg bg-primary-700 hover:bg-primary-600 disabled:opacity-50 transition-colors"
              title="Escanear novamente a pasta de músicas"
            >
              <RefreshCw size={16} className={`text-white ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <p className="text-primary-400">Carregando...</p>
          ) : availableSongs.length === 0 ? (
            <p className="text-primary-400">Nenhum arquivo de música encontrado em /assets/music</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 bg-surface-darker hover:bg-surface-lighter rounded-lg transition-colors group"
                >
                  <p className="text-primary-100 font-medium text-sm truncate flex-1">{song.title}</p>
                  <button
                    onClick={() => handleAddSong(song)}
                    className="ml-2 p-2 bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Adicionar à playlist"
                  >
                    <Plus size={16} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Playlist Atual */}
        <div className="bg-surface-light border border-primary-900 rounded-lg p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-primary-100 mb-4">Playlist</h2>

          {songs.length === 0 ? (
            <div className="text-center py-12 flex-1 flex flex-col justify-center">
              <p className="text-primary-400">Nenhuma música na playlist</p>
            </div>
          ) : (
            <>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={songs.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2 max-h-96 overflow-y-auto flex-1">
                    {songs.map((song, index) => (
                      <SortableSongItem
                        key={song.id}
                        song={song}
                        index={index}
                        onRemove={handleRemoveSong}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="mt-4 pt-4 border-t border-primary-900">
                <div className="flex justify-between items-center">
                  <span className="text-primary-400 text-sm">{songs.length} músicas</span>
                  <span className="text-primary-100 font-mono font-semibold">
                    {(() => {
                      const totalSeconds = songs.reduce((sum, song) => {
                        const duration = typeof song.duration === 'number' && !isNaN(song.duration) ? song.duration : 0
                        return sum + duration
                      }, 0)

                      if (!isFinite(totalSeconds) || totalSeconds < 0) {
                        return '--:--'
                      }

                      const hours = Math.floor(totalSeconds / 3600)
                      const minutes = Math.floor((totalSeconds % 3600) / 60)
                      const seconds = Math.floor(totalSeconds % 60)

                      if (hours > 0) {
                        return `${hours}h ${minutes}m ${seconds}s`
                      } else if (minutes > 0) {
                        return `${minutes}m ${seconds}s`
                      } else {
                        return `${seconds}s`
                      }
                    })()}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
