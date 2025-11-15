import { useEffect, useState, useCallback } from 'react'
import apiClient from '../../lib/api'
import { Play, Square } from 'lucide-react'

interface SoundPickerProps {
  label: string
  currentValue?: string
  onSelect: (path: string) => void
}

export function SoundPicker({ label, currentValue, onSelect }: SoundPickerProps) {
  const [assets, setAssets] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playing, setPlaying] = useState<string | null>(null)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.get('/api/assets/sounds')
      setAssets(response.data.data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar sons')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()

    // Cleanup audio element
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.currentTime = 0
      }
    }
  }, [fetchAssets])

  const handlePlaySound = (soundPath: string) => {
    // Pause current audio if any
    if (audioElement) {
      audioElement.pause()
      audioElement.currentTime = 0
    }

    if (playing === soundPath) {
      setPlaying(null)
      return
    }

    const audio = new Audio(`/${soundPath}`)
    audio.addEventListener('ended', () => setPlaying(null))
    audio.addEventListener('error', () => {
      setError('Erro ao reproduzir som')
      setPlaying(null)
    })

    setAudioElement(audio)
    setPlaying(soundPath)
    audio.play()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-primary-300">Carregando sons...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950 border border-red-700 rounded-lg">
        <p className="text-red-200 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-primary-200 mb-3">{label}</label>

        {Object.entries(assets).length === 0 ? (
          <div className="text-center p-8 bg-surface-darker rounded-lg border border-primary-800">
            <p className="text-primary-400 text-sm">Nenhum som disponível</p>
            <p className="text-primary-500 text-xs mt-2">Adicione sons na pasta assets/sounds/</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.entries(assets).map(([folder, files]) => (
              <div key={folder}>
                <p className="text-xs font-semibold text-primary-300 uppercase mb-2 opacity-75">
                  {folder}
                </p>

                <div className="space-y-2 pl-2">
                  {files.length === 0 ? (
                    <p className="text-primary-500 text-xs italic">Vazio</p>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                          currentValue === file
                            ? 'bg-primary-600/20 border border-primary-600'
                            : 'bg-surface-darker border border-primary-800 hover:border-primary-600'
                        }`}
                      >
                        <button
                          onClick={() => handlePlaySound(file)}
                          className="flex-shrink-0 p-1.5 rounded hover:bg-primary-600 transition-colors"
                          title={playing === file ? 'Parar' : 'Reproduzir'}
                        >
                          {playing === file ? (
                            <Square size={16} className="text-accent-pink" fill="currentColor" />
                          ) : (
                            <Play size={16} className="text-primary-400" fill="currentColor" />
                          )}
                        </button>

                        <button
                          onClick={() => onSelect(file)}
                          className="flex-grow text-left min-w-0 hover:opacity-80 transition-opacity"
                        >
                          <p className="text-sm font-medium text-primary-100 truncate">
                            {file.split('/').pop()}
                          </p>
                          <p className="text-xs text-primary-400">{file}</p>
                        </button>

                        {currentValue === file && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary-500"></div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {currentValue && (
        <div className="p-3 bg-primary-900/30 border border-primary-700 rounded-lg">
          <p className="text-xs text-primary-300">Selecionado:</p>
          <p className="text-sm text-primary-100 font-medium truncate mt-1">{currentValue}</p>
        </div>
      )}
    </div>
  )
}
