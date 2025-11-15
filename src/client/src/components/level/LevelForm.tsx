import { useState, useCallback, useEffect } from 'react'
import { Level } from '@shared/types'
import { Save, X, Trash2, FileText, Award, Clock, Sparkles } from 'lucide-react'
import { LayerManager } from './LayerManager'
import { SoundPicker } from './SoundPicker'
import { LivePreview } from './LivePreview'

interface LevelFormProps {
  level: Level
  onSave: (level: Level) => Promise<void>
  onCancel: () => void
  onDelete?: () => Promise<void>
  isSaving?: boolean
}

type Tab = 'visual' | 'sounds' | 'config' | 'events'

export function LevelForm({ level, onSave, onCancel, onDelete, isSaving }: LevelFormProps) {
  // Ensure level has all required properties
  const sanitizedLevel: Level = {
    ...level,
    layers: {
      background: level.layers?.background || '',
      stage: level.layers?.stage || '',
      crowd: level.layers?.crowd || '',
      effects: Array.isArray(level.layers?.effects) ? level.layers.effects : [],
    },
    sounds: level.sounds || { transition: '', levelUp: '' },
    visualConfig: level.visualConfig || { transitionDuration: 500, transitionEffect: 'fade' },
  }

  const [activeTab, setActiveTab] = useState<Tab>('visual')
  const [formData, setFormData] = useState<Level>(sanitizedLevel)
  const [selectedLayer, setSelectedLayer] = useState<string>('background')
  const [isDirty, setIsDirty] = useState(false)
  const [isSavingLocal, setIsSavingLocal] = useState(false)

  // Update formData when level prop changes (when selecting a different level)
  useEffect(() => {
    setFormData(sanitizedLevel)
    setIsDirty(false)
    setActiveTab('visual') // Reset to visual tab
  }, [level.id]) // Only re-run when level ID changes

  const handleFormChange = useCallback((updates: Partial<Level>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
    setIsDirty(true)
  }, [])

  const handleSave = async () => {
    setIsSavingLocal(true)
    try {
      await onSave(formData)
      setIsDirty(false)
    } finally {
      setIsSavingLocal(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    const confirmed = window.confirm(
      `Tem certeza que deseja deletar o nível "${formData.name}"? Esta ação é irreversível.`
    )
    if (confirmed) {
      await onDelete()
    }
  }

  const isLoading = isSaving || isSavingLocal

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-primary-800">
        {(['visual', 'sounds', 'config', 'events'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'text-primary-100 border-primary-500'
                : 'text-primary-400 border-transparent hover:text-primary-300'
            }`}
          >
            {tab === 'visual' && 'Visual'}
            {tab === 'sounds' && 'Sons'}
            {tab === 'config' && 'Configuração'}
            {tab === 'events' && 'Eventos'}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Main content - full width */}
        <div className="space-y-4">
          {/* VISUAL TAB */}
          {activeTab === 'visual' && (
            <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-primary-100">Editor de Camadas</h3>
              <LayerManager
                level={formData}
                selectedLayer={selectedLayer}
                onLayerSelect={setSelectedLayer}
                onLayersUpdate={(updated) => handleFormChange({ layers: updated.layers })}
              />
            </div>
          )}

          {/* SOUNDS TAB */}
          {activeTab === 'sounds' && (
            <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary-100">Sons do Nível</h3>

              <SoundPicker
                label="Som de Transição"
                currentValue={formData.sounds.transition}
                onSelect={(path) =>
                  handleFormChange({
                    sounds: { ...formData.sounds, transition: path },
                  })
                }
              />

              <div className="border-t border-primary-800 pt-6">
                <SoundPicker
                  label="Som de Level Up"
                  currentValue={formData.sounds.levelUp}
                  onSelect={(path) =>
                    handleFormChange({
                      sounds: { ...formData.sounds, levelUp: path },
                    })
                  }
                />
              </div>

              <div className="border-t border-primary-800 pt-6">
                <SoundPicker
                  label="Som Ambiente (Opcional)"
                  currentValue={formData.sounds.ambient}
                  onSelect={(path) =>
                    handleFormChange({
                      sounds: { ...formData.sounds, ambient: path },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* CONFIG TAB */}
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-primary-600/20 rounded-lg">
                    <FileText size={20} className="text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-100">Informações Básicas</h3>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                    <span>Nome do Nível</span>
                    <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleFormChange({ name: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-gray-500"
                    placeholder="ex: Garagem, Arena, Estádio"
                  />
                  <p className="mt-1 text-xs text-primary-500">
                    O nome que aparece na progressão do nível
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                    <span>Descrição</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleFormChange({ description: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none placeholder:text-gray-500"
                    rows={3}
                    placeholder="Descreva o ambiente e atmosfera deste nível..."
                  />
                  <p className="mt-1 text-xs text-primary-500">
                    Descrição opcional para organização interna
                  </p>
                </div>
              </div>

              {/* Progressão e XP */}
              <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-accent-pink/20 rounded-lg">
                    <Award size={20} className="text-accent-pink" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-100">Progressão e XP</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                      <span>XP Necessário</span>
                      <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.xpThreshold}
                        onChange={(e) => handleFormChange({ xpThreshold: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-accent-pink focus:ring-1 focus:ring-accent-pink transition-all"
                        min="0"
                        step="50"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-500 text-sm font-medium">
                        XP
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-primary-500">
                      XP total para alcançar este nível
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                      <span>Ordem</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.order}
                        disabled
                        className="w-full px-4 py-3 bg-surface-dark/50 border border-primary-800 text-primary-400 rounded-lg cursor-not-allowed"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <span className="px-2 py-1 bg-primary-600/20 text-primary-400 text-xs font-semibold rounded">
                          AUTO
                        </span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-primary-500">
                      Posição na lista (automático)
                    </p>
                  </div>
                </div>
              </div>

              {/* Efeitos Visuais */}
              <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Sparkles size={20} className="text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-primary-100">Efeitos Visuais</h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                      <Clock size={14} className="text-primary-400" />
                      <span>Duração da Transição</span>
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="100"
                        max="3000"
                        step="100"
                        value={formData.visualConfig.transitionDuration}
                        onChange={(e) =>
                          handleFormChange({
                            visualConfig: {
                              ...formData.visualConfig,
                              transitionDuration: parseInt(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-primary-500">100ms</span>
                        <div className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-lg text-sm font-semibold">
                          {formData.visualConfig.transitionDuration}ms
                        </div>
                        <span className="text-xs text-primary-500">3000ms</span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-primary-500">
                      Tempo de transição entre níveis
                    </p>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-primary-200 mb-2">
                      <Sparkles size={14} className="text-primary-400" />
                      <span>Tipo de Transição</span>
                    </label>
                    <select
                      value={formData.visualConfig.transitionEffect}
                      onChange={(e) =>
                        handleFormChange({
                          visualConfig: {
                            ...formData.visualConfig,
                            transitionEffect: e.target.value as 'fade' | 'slide' | 'zoom',
                          },
                        })
                      }
                      className="w-full px-4 py-3 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%238B5CF6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                        backgroundPosition: 'right 0.5rem center',
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '1.5em 1.5em',
                        paddingRight: '2.5rem',
                      }}
                    >
                      <option value="fade">✨ Fade - Transição suave</option>
                      <option value="slide">➡️ Slide - Deslizar</option>
                      <option value="zoom">🔍 Zoom - Ampliar</option>
                    </select>
                    <p className="mt-2 text-xs text-primary-500">
                      Efeito aplicado ao subir de nível
                    </p>
                  </div>
                </div>

                {/* Preview do efeito */}
                <div className="mt-4 p-4 bg-surface-darker/50 border border-primary-800 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium text-primary-300">
                        Preview: {formData.visualConfig.transitionEffect} • {formData.visualConfig.transitionDuration}ms
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* EVENTS TAB */}
          {activeTab === 'events' && (
            <div className="bg-surface-light border border-primary-900 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-primary-100">Eventos Disponíveis</h3>
              <p className="text-primary-400 text-sm">
                Este recurso será implementado em breve. Defina quais eventos podem ocorrer neste nível.
              </p>
            </div>
          )}
        </div>

        {/* Preview panel - Full width abaixo */}
        <div className="bg-surface-light border border-primary-900 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-primary-800 bg-surface-darker flex items-center justify-between">
            <h4 className="text-sm font-semibold text-primary-200">Preview Live (1920x1080)</h4>
            <div className="flex items-center gap-4 text-xs text-primary-400">
              <span>Nível {formData.order}</span>
              <span>•</span>
              <span>{formData.xpThreshold} XP</span>
              <span>•</span>
              <span>{formData.layers?.effects?.length || 0} camada(s)</span>
              {isDirty && (
                <>
                  <span>•</span>
                  <span className="text-accent-pink font-semibold">Não salvo</span>
                </>
              )}
            </div>
          </div>
          <div className="bg-black p-4">
            <LivePreview level={formData} selectedLayer={selectedLayer} />
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="sticky bottom-0 flex gap-2 pt-4 border-t border-primary-800 bg-surface-dark/95 backdrop-blur">
        <button
          onClick={onCancel}
          className="px-4 py-2 flex items-center gap-2 bg-surface-light hover:bg-surface-lighter text-primary-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          <X size={16} />
          Cancelar
        </button>

        <button
          onClick={handleSave}
          disabled={isLoading || !isDirty}
          className="flex-grow px-4 py-2 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>

        {onDelete && (
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="px-4 py-2 flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Deletar nível"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
