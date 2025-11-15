import { useMemo, useRef, useState, useEffect } from 'react'
import { Level, LayerTransform } from '@shared/types'

interface LivePreviewProps {
  level?: Level
  selectedLayer?: string
}

export function LivePreview({ level, selectedLayer }: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  // Recalculate scale when container width changes
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth
        const newScale = width / 1920
        setScale(newScale)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Detecta se um arquivo é vídeo pela extensão
  const isVideo = (filePath: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv']
    const ext = filePath.toLowerCase().substring(filePath.lastIndexOf('.'))
    return videoExtensions.includes(ext)
  }

  const layers = useMemo(() => {
    console.log('🖼️ LivePreview: Rendering with level:', level)

    if (!level) return []

    console.log('🖼️ LivePreview: level.layers:', level.layers)

    // Renderizar APENAS as camadas adicionadas pelo usuário (effects)
    const allLayers = level.layers.effects.map((layerTransform: LayerTransform, idx: number) => {
      return {
        id: `layer-${idx}`,
        name: (layerTransform as any).name || `Camada ${idx + 1}`,
        path: (layerTransform as any).path || '',
        transform: layerTransform,
        zIndex: 10 + idx,
      };
    })

    console.log('🖼️ LivePreview: Layers to render:', allLayers)

    return allLayers
  }, [level])

  if (!level) {
    return (
      <div className="w-full h-full bg-surface-dark rounded-lg border border-primary-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-400 text-sm">Selecione um nível para visualizar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Preview Area - Responsive 1920x1080 container */}
      <div
        ref={containerRef}
        className="w-full bg-black rounded-lg overflow-hidden mx-auto"
        style={{ aspectRatio: '16 / 9' }}
      >
        {/* Container 16:9 aspect ratio - responsive */}
        <div
          className="relative bg-gradient-to-br from-gray-900 to-black w-full h-full"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Inner container - scaled proporcionalmente */}
          <div
            className="relative"
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              pointerEvents: 'auto',
            }}
          >
          <div className="relative w-full h-full">
          {layers.length === 0 ? (
            <div className="text-center">
              <p className="text-primary-400 text-sm">Nenhuma camada configurada</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Renderizar camadas sobrepostas */}
              {layers.map((layer, idx) => {
                const videoFile = isVideo(layer.path)

                return (
                  <div
                    key={layer.id}
                    className={`absolute transition-all duration-300 ${
                      selectedLayer === layer.id ? 'ring-2 ring-accent-pink' : ''
                    }`}
                    style={{
                      left: `${layer.transform.x * scale}px`,
                      top: `${layer.transform.y * scale}px`,
                      zIndex: layer.zIndex,
                      pointerEvents: 'none',
                      transform: `scale(${layer.transform.scale})`,
                      opacity: layer.transform.opacity !== undefined ? layer.transform.opacity : 1,
                      transformOrigin: '0 0',
                    }}
                  >
                    {videoFile ? (
                      // Renderizar vídeo em loop
                      <video
                        src={`/${layer.path}`}
                        className="max-w-full max-h-full object-contain"
                        style={{
                          display: 'block',
                        }}
                        autoPlay
                        loop
                        muted
                        onLoadedData={() => console.log(`✅ Video ${idx + 1} loaded:`, layer.path)}
                        onError={(e) => {
                          console.error(`❌ Video ${idx + 1} failed:`, layer.path)
                          const target = e.target as HTMLVideoElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      // Renderizar imagem estática
                      <img
                        src={`/${layer.path}`}
                        alt={layer.name}
                        className="max-w-full max-h-full object-contain"
                        style={{
                          display: 'block',
                        }}
                        onLoad={() => console.log(`✅ Layer ${idx + 1} rendered:`, layer.path)}
                        onError={(e) => {
                          console.error(`❌ Layer ${idx + 1} failed:`, layer.path)
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
          </div>
        </div>
      </div>

      {/* Layer Info */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="bg-surface-light rounded-lg p-3 border border-primary-800">
          <p className="text-xs font-medium text-primary-300 uppercase">Camadas</p>
          <p className="text-lg font-bold text-primary-100 mt-1">{layers.length}</p>
        </div>
        <div className="bg-surface-light rounded-lg p-3 border border-primary-800">
          <p className="text-xs font-medium text-primary-300 uppercase">Transição</p>
          <p className="text-sm text-primary-100 mt-1 capitalize">
            {level.visualConfig?.transitionEffect || 'fade'}
          </p>
        </div>
      </div>

      {/* Animação da transição (visual feedback) */}
      <style>{`
        @keyframes transitionFade {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 1; }
        }

        @keyframes transitionSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0); }
        }

        @keyframes transitionZoom {
          0% { transform: scale(0.8); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
