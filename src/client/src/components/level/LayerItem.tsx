import { Eye, EyeOff, Trash2, Edit2, MoveHorizontal, MoveVertical, Maximize2 } from 'lucide-react'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { LayerTransform } from '@shared/types'
import { useState } from 'react'

interface LayerItemProps {
  id: string
  name: string
  imagePath?: string
  transform?: LayerTransform
  visible?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onVisibilityToggle?: () => void
  onTransformChange?: (transform: Partial<LayerTransform>) => void
  isDragging?: boolean
  isSelected?: boolean
  isEffect?: boolean
}

export function LayerItem({
  id,
  name,
  imagePath,
  transform: layerTransform,
  visible = true,
  onEdit,
  onDelete,
  onVisibilityToggle,
  onTransformChange,
  isDragging,
  isSelected,
  isEffect,
}: LayerItemProps) {
  const [showControls, setShowControls] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-2 p-3 rounded-lg border transition-all ${
        isSelected
          ? 'bg-primary-600/30 border-primary-500 shadow-lg shadow-primary-500/20'
          : 'bg-surface-darker border-primary-800 hover:border-primary-700 hover:bg-surface-lighter'
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Drag handle (6 dots) - ONLY this element is draggable */}
      <div
        className="flex-shrink-0 text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <circle cx="9" cy="6" r="2" />
          <circle cx="9" cy="12" r="2" />
          <circle cx="9" cy="18" r="2" />
          <circle cx="15" cy="6" r="2" />
          <circle cx="15" cy="12" r="2" />
          <circle cx="15" cy="18" r="2" />
        </svg>
      </div>

      {/* Thumbnail */}
      {imagePath && (
        <div className="flex-shrink-0 w-10 h-10 rounded-md overflow-hidden border border-primary-700 bg-black/30">
          <img
            src={`/${imagePath}`}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Layer info */}
      <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-primary-100 truncate">{name}</p>
        {imagePath && (
          <p className="text-xs text-primary-400 truncate">{imagePath.split('/').pop()}</p>
        )}
        {isEffect && (
          <p className="text-xs text-accent-pink font-semibold uppercase">Efeito</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Transform controls toggle */}
        {onTransformChange && layerTransform && (
          <button
            onClick={() => setShowControls(!showControls)}
            className={`p-1.5 rounded transition-colors ${
              showControls ? 'bg-primary-600 text-white' : 'hover:bg-primary-600/50 text-primary-400'
            }`}
            title="Posição e Escala"
          >
            <Maximize2 size={16} />
          </button>
        )}

        {/* Visibility toggle */}
        <button
          onClick={onVisibilityToggle}
          className="p-1.5 rounded hover:bg-primary-600/50 transition-colors"
          title={visible ? 'Ocultar' : 'Mostrar'}
        >
          {visible ? (
            <Eye size={16} className="text-primary-400" />
          ) : (
            <EyeOff size={16} className="text-primary-500" />
          )}
        </button>

        {/* Edit button */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('✏️ LayerItem: Edit button clicked for layer:', id, name)
              onEdit()
            }}
            className="p-1.5 rounded hover:bg-primary-600/50 transition-colors"
            title="Editar Imagem"
          >
            <Edit2 size={16} className="text-primary-400" />
          </button>
        )}

        {/* Delete button */}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-600/50 transition-colors"
            title="Deletar"
          >
            <Trash2 size={16} className="text-red-400" />
          </button>
        )}
      </div>
    </div>

    {/* Transform Controls Panel */}
    {showControls && onTransformChange && layerTransform && (
      <div className="mt-2 p-3 bg-surface-lighter rounded-lg border border-primary-700 space-y-3">
        <p className="text-xs font-semibold text-primary-300 uppercase">Posição e Escala</p>

        {/* Position X */}
        <div>
          <label className="flex items-center gap-2 text-xs text-primary-300 mb-1">
            <MoveHorizontal size={14} />
            Posição X (pixels)
          </label>
          <input
            type="number"
            value={layerTransform.x}
            onChange={(e) => onTransformChange({ x: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 bg-[#0F0A1E] border border-primary-700 rounded text-sm text-primary-100 focus:border-primary-500 focus:outline-none"
            step="10"
          />
        </div>

        {/* Position Y */}
        <div>
          <label className="flex items-center gap-2 text-xs text-primary-300 mb-1">
            <MoveVertical size={14} />
            Posição Y (pixels)
          </label>
          <input
            type="number"
            value={layerTransform.y}
            onChange={(e) => onTransformChange({ y: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 bg-[#0F0A1E] border border-primary-700 rounded text-sm text-primary-100 focus:border-primary-500 focus:outline-none"
            step="10"
          />
        </div>

        {/* Scale */}
        <div>
          <label className="flex items-center gap-2 text-xs text-primary-300 mb-1">
            <Maximize2 size={14} />
            Escala (%)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="10"
              max="300"
              value={layerTransform.scale * 100}
              onChange={(e) => onTransformChange({ scale: parseFloat(e.target.value) / 100 })}
              className="flex-grow"
            />
            <input
              type="number"
              value={Math.round(layerTransform.scale * 100)}
              onChange={(e) => onTransformChange({ scale: parseFloat(e.target.value) / 100 || 1 })}
              className="w-16 px-2 py-1 bg-[#0F0A1E] border border-primary-700 rounded text-sm text-primary-100 focus:border-primary-500 focus:outline-none"
              min="10"
              max="300"
            />
            <span className="text-xs text-primary-400">%</span>
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => onTransformChange({ x: 0, y: 0, scale: 1 })}
          className="w-full px-3 py-1.5 bg-primary-600/20 border border-primary-600 hover:bg-primary-600/30 text-primary-300 rounded text-xs font-medium transition-colors"
        >
          Resetar Posição e Escala
        </button>
      </div>
    )}
    </>
  )
}
