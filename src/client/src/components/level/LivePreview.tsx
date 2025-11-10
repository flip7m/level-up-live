import { useMemo } from 'react'
import { Level, LayerTransform } from '@shared/types'

interface LivePreviewProps {
  level?: Level
  selectedLayer?: string
}

export function LivePreview({ level, selectedLayer }: LivePreviewProps) {
  const layers = useMemo(() => {
    console.log('🖼️ LivePreview: Rendering with level:', level)

    if (!level) return []

    console.log('🖼️ LivePreview: level.layers:', level.layers)

    // Renderizar APENAS as camadas adicionadas pelo usuário (effects)
    const allLayers = level.layers.effects.map((layerTransform: LayerTransform, idx: number) => ({
      id: `layer-${idx}`,
      name: `Camada ${idx + 1}`,
      path: layerTransform.path,
      transform: layerTransform,
      zIndex: 10 + idx,
    }))

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
      {/* Preview Area - 1920x1080 aspect ratio (16:9) */}
      <div className="w-full bg-black rounded-lg overflow-hidden mx-auto" style={{ maxWidth: '100%' }}>
        {/* 16:9 aspect ratio container (1920x1080) */}
        <div className="relative w-full bg-gradient-to-br from-gray-900 to-black" style={{ paddingBottom: '56.25%' }}>
          <div className="absolute inset-0 flex items-center justify-center">
          {layers.length === 0 ? (
            <div className="text-center">
              <p className="text-primary-400 text-sm">Nenhuma camada configurada</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Renderizar camadas sobrepostas */}
              {layers.map((layer, idx) => (
                <div
                  key={layer.id}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                    selectedLayer === layer.id ? 'ring-2 ring-accent-pink' : ''
                  }`}
                  style={{
                    zIndex: layer.zIndex,
                    pointerEvents: 'none', // Permite clicar através das camadas
                  }}
                >
                  <img
                    src={`/${layer.path}`}
                    alt={layer.name}
                    className="max-w-full max-h-full object-contain"
                    style={{
                      position: 'relative',
                      transform: `translate(${layer.transform.x}px, ${layer.transform.y}px) scale(${layer.transform.scale})`,
                      opacity: layer.transform.opacity !== undefined ? layer.transform.opacity : 1,
                      transition: 'transform 0.2s ease-out, opacity 0.2s ease-out',
                    }}
                    onLoad={() => console.log(`✅ Layer ${idx + 1} rendered:`, layer.path, 'transform:', layer.transform)}
                    onError={(e) => {
                      console.error(`❌ Layer ${idx + 1} failed:`, layer.path)
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                    }}
                  />
                </div>
              ))}
            </div>
          )}
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
