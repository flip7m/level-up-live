import { useState, useCallback } from 'react'
import { Level, LayerTransform } from '@shared/types'
import { Plus } from 'lucide-react'
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
} from '@dnd-kit/sortable'
import { LayerItem } from './LayerItem'
import { AssetPicker } from './AssetPicker'

// Animation system removed - static layers only

interface LayerManagerProps {
  level: Level
  selectedLayer?: string
  onLayerSelect?: (layerId: string) => void
  onLayersUpdate?: (level: Level) => void
}

export function LayerManager({
  level,
  selectedLayer,
  onLayerSelect,
  onLayersUpdate,
}: LayerManagerProps) {
  const [isEditingLayer, setIsEditingLayer] = useState<string | null>(null)
  const [showAssetPicker, setShowAssetPicker] = useState(false)
  const [isAddingLayer, setIsAddingLayer] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Construir array de camadas - SOMENTE effects (camadas adicionadas manualmente)
  const layersArray = level.layers.effects.map((layerTransform, idx) => ({
    id: `layer-${idx}`,
    name: `Camada ${idx + 1}`,
    path: layerTransform.path,
    transform: layerTransform,
    isEffect: false, // Todas são camadas normais agora
  }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = layersArray.findIndex((l) => l.id === active.id)
      const newIndex = layersArray.findIndex((l) => l.id === over.id)

      // Reordenar camadas
      const newLayers = arrayMove(level.layers.effects, oldIndex, newIndex)
      const updatedLevel: Level = {
        ...level,
        layers: {
          ...level.layers,
          effects: newLayers,
        },
      }
      onLayersUpdate?.(updatedLevel)
    }
  }

  const handleLayerChange = useCallback(
    (layerId: string, newPath: string) => {
      const idx = parseInt(layerId.split('-')[1])
      const updatedEffects = [...level.layers.effects]
      updatedEffects[idx] = {
        ...updatedEffects[idx],
        path: newPath,
      }

      const updatedLevel: Level = {
        ...level,
        layers: {
          ...level.layers,
          effects: updatedEffects,
        },
      }

      onLayersUpdate?.(updatedLevel)
      setIsEditingLayer(null)
    },
    [level, onLayersUpdate]
  )

  const handleLayerTransformChange = useCallback(
    (layerId: string, transform: Partial<LayerTransform>) => {
      const idx = parseInt(layerId.split('-')[1])
      const updatedEffects = [...level.layers.effects]
      updatedEffects[idx] = {
        ...updatedEffects[idx],
        ...transform,
      }

      const updatedLevel: Level = {
        ...level,
        layers: {
          ...level.layers,
          effects: updatedEffects,
        },
      }

      onLayersUpdate?.(updatedLevel)
    },
    [level, onLayersUpdate]
  )

  const handleDeleteLayer = useCallback(
    (layerIndex: number) => {
      const newLayers = level.layers.effects.filter((_, idx) => idx !== layerIndex)
      const updatedLevel: Level = {
        ...level,
        layers: {
          ...level.layers,
          effects: newLayers,
        },
      }
      onLayersUpdate?.(updatedLevel)
    },
    [level, onLayersUpdate]
  )

  const handleAddEffect = useCallback(() => {
    setIsAddingLayer(true)
    setShowAssetPicker(true)
  }, [])

  const handleAddEffectImage = (imagePath: string) => {
    const newLayer: LayerTransform = {
      path: imagePath,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 1,
    }
    const updatedLevel: Level = {
      ...level,
      layers: {
        ...level.layers,
        effects: [...level.layers.effects, newLayer],
      },
    }
    onLayersUpdate?.(updatedLevel)
    setShowAssetPicker(false)
    setIsAddingLayer(false)
  }

  return (
    <div className="space-y-4">
      {/* Layers list */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-primary-200">Camadas</h3>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={layersArray.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {layersArray.map((layer) => (
                <div key={layer.id}>
                  {isEditingLayer === layer.id ? (
                    // Asset picker for this layer
                    <div className="bg-surface-darker border border-primary-600 rounded-lg p-3 space-y-2">
                      <p className="text-sm font-medium text-primary-200 mb-2">
                        Selecionar imagem para {layer.name}
                      </p>
                      <AssetPicker
                        type="images"
                        currentValue={layer.path}
                        onSelect={(path) => handleLayerChange(layer.id, path)}
                      />
                      <button
                        onClick={() => setIsEditingLayer(null)}
                        className="w-full mt-3 px-3 py-2 bg-surface-light hover:bg-surface-lighter text-primary-100 rounded transition-colors text-sm"
                      >
                        Concluído
                      </button>
                    </div>
                  ) : (
                    <LayerItem
                      id={layer.id}
                      name={layer.name}
                      imagePath={layer.path}
                      transform={layer.transform}
                      isSelected={selectedLayer === layer.id}
                      isEffect={false}
                      onEdit={() => {
                        console.log('🔧 LayerManager: onEdit called for layer:', layer.id, layer.name)
                        onLayerSelect?.(layer.id)
                        console.log('🔧 LayerManager: Setting isEditingLayer to:', layer.id)
                        setIsEditingLayer(layer.id)
                      }}
                      onDelete={() => handleDeleteLayer(parseInt(layer.id.split('-')[1]))}
                      onTransformChange={(transform) => handleLayerTransformChange(layer.id, transform)}
                    />
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      {/* Add layer button */}
      {!showAssetPicker && (
        <button
          onClick={handleAddEffect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600/20 border border-primary-600 hover:bg-primary-600/30 text-primary-300 rounded-lg transition-colors"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Adicionar Camada</span>
        </button>
      )}

      {/* Asset picker for new layer */}
      {showAssetPicker && (
        <div className="bg-surface-darker border border-primary-600 rounded-lg p-3 space-y-2">
          <p className="text-sm font-medium text-primary-200">Selecionar imagem para nova camada</p>
          <AssetPicker type="images" onSelect={handleAddEffectImage} />
          <button
            onClick={() => {
              setShowAssetPicker(false)
              setIsAddingLayer(false)
            }}
            className="w-full px-3 py-2 bg-surface-light hover:bg-surface-lighter text-primary-100 rounded transition-colors text-sm"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
