import { useEffect, useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import apiClient from '../../lib/api'

interface AssetPickerProps {
  type: 'images' | 'scenes' | 'artists' | 'sounds'
  onSelect: (path: string) => void
  currentValue?: string
}

export function AssetPicker({ type, onSelect, currentValue }: AssetPickerProps) {
  const [assets, setAssets] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredAsset, setHoveredAsset] = useState<string | null>(null)

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let endpoint = '/api/assets/scenes'
      if (type === 'sounds') {
        endpoint = '/api/assets/sounds'
      } else if (type === 'artists') {
        endpoint = '/api/assets/artists'
      } else if (type === 'images') {
        endpoint = '/api/assets/images'
      }

      const response = await apiClient.get(endpoint)
      console.log('🎨 AssetPicker: Fetched assets from', endpoint, ':', response.data.data)

      // Handle both array and object responses
      let groupedAssets: Record<string, string[]> = {}
      if (Array.isArray(response.data.data)) {
        // Flat array response - group by folder
        const items = response.data.data as string[]
        items.forEach(item => {
          const parts = item.split('/')
          const folder = parts.length > 1 ? parts[parts.length - 2] : 'root'
          if (!groupedAssets[folder]) {
            groupedAssets[folder] = []
          }
          groupedAssets[folder].push(item)
        })
      } else if (typeof response.data.data === 'object' && response.data.data !== null) {
        // Already grouped object
        groupedAssets = response.data.data as Record<string, string[]>
      }

      setAssets(groupedAssets)
    } catch (err: any) {
      console.error('❌ AssetPicker: Error fetching assets:', err)
      setError(err.message || 'Erro ao carregar assets')
    } finally {
      setLoading(false)
    }
  }, [type])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const isSoundType = type === 'sounds'

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-primary-300">Carregando assets...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-950 border border-red-700 rounded-lg">
        <p className="text-red-200 text-sm">{error}</p>
        <button
          onClick={fetchAssets}
          className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 text-white rounded text-sm"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Refresh button */}
      <button
        onClick={fetchAssets}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary-700/30 border border-primary-600 hover:bg-primary-700/50 disabled:opacity-50 disabled:cursor-not-allowed text-primary-200 rounded-lg transition-all"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        <span className="text-sm font-medium">Recarregar Galeria</span>
      </button>

      {Object.entries(assets).map(([folder, files]) => (
        <div key={folder}>
          <h4 className="text-sm font-medium text-primary-200 mb-2 capitalize">{folder}</h4>

          {files.length === 0 ? (
            <p className="text-primary-500 text-xs italic">Nenhum arquivo disponível</p>
          ) : isSoundType ? (
            // Sound list
            <div className="space-y-2">
              {files.map((file) => (
                <button
                  key={file}
                  onClick={() => onSelect(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentValue === file
                      ? 'bg-primary-600 text-primary-50'
                      : 'bg-surface-darker hover:bg-surface-lighter text-primary-100'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{file.split('/').pop()}</p>
                  <p className="text-xs text-primary-400">{file}</p>
                </button>
              ))}
            </div>
          ) : (
            // Image grid
            <div className="grid grid-cols-3 gap-2">
              {files.map((file) => (
                <button
                  key={file}
                  onClick={() => onSelect(file)}
                  onMouseEnter={() => setHoveredAsset(file)}
                  onMouseLeave={() => setHoveredAsset(null)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    currentValue === file
                      ? 'border-primary-500 shadow-lg shadow-primary-500/50'
                      : 'border-primary-800 hover:border-primary-600'
                  }`}
                >
                  <img
                    src={`/${file}`}
                    alt={file}
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('✅ Image loaded:', file)}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', file, e)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                  {hoveredAsset === file && (
                    <div className="absolute inset-0 bg-black/60 flex items-end p-2">
                      <p className="text-xs text-white truncate">{file.split('/').pop()}</p>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {Object.keys(assets).length === 0 && (
        <div className="text-center p-8">
          <p className="text-primary-400 text-sm">Nenhum asset disponível</p>
          <p className="text-primary-500 text-xs mt-2">
            Adicione arquivos na pasta correspondente de assets
          </p>
        </div>
      )}
    </div>
  )
}
