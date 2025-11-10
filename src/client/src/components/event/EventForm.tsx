import { useState, useEffect } from 'react'
import { GameEvent } from '@shared/types'
import { Save, FileText, Image, Music, Settings } from 'lucide-react'

interface EventFormProps {
  event: GameEvent | null
  onSave: (data: any) => Promise<void>
  loading?: boolean
}

type TabType = 'info' | 'visual' | 'sounds' | 'trigger'

export function EventForm({ event, onSave, loading }: EventFormProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'visual' as 'visual' | 'audio' | 'interactive',
    triggerType: 'manual' as 'manual' | 'random' | 'audio' | 'vote' | 'xp-milestone',
    duration: 5,
    triggerConfig: {
      cooldown: 30,
      minLevel: 1,
      probability: 1.0,
      audioType: undefined as 'drop' | 'buildUp' | undefined,
    },
    // Procedural effects
    effectType: undefined as 'confetti' | 'fireworks' | 'flash' | 'particle-burst' | 'rainbow-wave' | 'screen-shake' | undefined,
    effectConfig: {
      particleCount: 150,
      intensity: 20,
      colors: [] as string[],
    },
    // Traditional assets
    assets: {
      layers: [] as any[],
      sounds: [] as string[],
    },
  })

  // Load event data when event changes
  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name,
        description: event.description || '',
        type: event.type,
        triggerType: event.triggerType,
        duration: event.duration,
        triggerConfig: {
          cooldown: event.triggerConfig?.cooldown || 30,
          minLevel: event.triggerConfig?.minLevel || 1,
          probability: event.triggerConfig?.probability || 1.0,
          audioType: event.triggerConfig?.audioType,
        },
        // Procedural effects
        effectType: event.effectType,
        effectConfig: {
          particleCount: event.effectConfig?.particleCount || 150,
          intensity: event.effectConfig?.intensity || 20,
          colors: event.effectConfig?.colors || [],
        },
        // Traditional assets
        assets: event.assets || { layers: [], sounds: [] },
      })
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave(formData)
  }

  const tabs = [
    { id: 'info', label: 'Info', icon: FileText },
    { id: 'visual', label: 'Visual', icon: Image },
    { id: 'sounds', label: 'Sons', icon: Music },
    { id: 'trigger', label: 'Trigger', icon: Settings },
  ] as const

  if (!event && formData.name === '') {
    return (
      <div className="flex items-center justify-center h-full text-primary-400">
        <div className="text-center">
          <p className="mb-2">Selecione um evento ou crie um novo</p>
          <p className="text-xs">Use o botão + na sidebar</p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Tabs */}
      <div className="border-b border-primary-900">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-primary-300 hover:bg-surface-lighter'
                  }
                `}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'info' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Nome do Evento *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Ex: Explosão de Confetes"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                placeholder="Descreva o evento..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Tipo de Evento
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="visual">Visual</option>
                  <option value="audio">Áudio</option>
                  <option value="interactive">Interativo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Duração (segundos) *
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  required
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visual' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Tipo de Efeito Visual
              </label>
              <select
                value={formData.effectType || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setFormData({
                    ...formData,
                    effectType: value ? (value as any) : undefined,
                  })
                }}
                className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="">Nenhum (usar layers de imagem/vídeo)</option>
                <option value="confetti">🎊 Confetti Explosion</option>
                <option value="fireworks">🎆 Fireworks</option>
                <option value="flash">⚡ Flash Bang</option>
                <option value="particle-burst">✨ Particle Burst</option>
                <option value="rainbow-wave">🌈 Rainbow Wave</option>
                <option value="screen-shake">📳 Screen Shake</option>
              </select>
              <p className="text-xs text-primary-400 mt-1">
                Efeitos procedurais são gerados via Canvas (leves e customizáveis)
              </p>
            </div>

            {formData.effectType && (
              <div className="bg-blue-500/10 border border-blue-700 rounded-lg p-4">
                <p className="text-sm text-blue-300 font-medium mb-2">
                  ✓ Efeito procedural selecionado: {formData.effectType}
                </p>
                <p className="text-xs text-blue-400">
                  Configurações avançadas (cores, intensidade, etc.) serão adicionadas em breve.
                </p>
              </div>
            )}

            {!formData.effectType && (
              <div className="bg-yellow-500/10 border border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-300">
                  ⚠️ Editor de layers de imagem/vídeo em desenvolvimento.
                </p>
                <p className="text-xs text-yellow-400 mt-2">
                  Por enquanto, use efeitos procedurais acima ou edite assets via API/seed.
                </p>
                <p className="text-xs text-yellow-400 mt-1">
                  Layers atuais: {formData.assets?.layers?.length || 0}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'sounds' && (
          <div className="space-y-4">
            <p className="text-sm text-primary-400">
              Sons que tocam quando o evento é disparado.
            </p>
            <div className="bg-yellow-500/10 border border-yellow-700 rounded-lg p-4">
              <p className="text-sm text-yellow-300">
                ⚠️ Editor de sons em desenvolvimento. Por enquanto, edite via API ou seed.
              </p>
              <p className="text-xs text-yellow-400 mt-2">
                Sons atuais: {formData.assets.sounds.length}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'trigger' && (
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-primary-200 mb-2">
                Tipo de Trigger
              </label>
              <select
                value={formData.triggerType}
                onChange={(e) => {
                  const newTriggerType = e.target.value as any
                  setFormData({
                    ...formData,
                    triggerType: newTriggerType,
                    triggerConfig: {
                      ...formData.triggerConfig,
                      audioType: newTriggerType === 'audio' ? 'drop' : undefined,
                    },
                  })
                }}
                className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                <option value="manual">Manual (botão)</option>
                <option value="random">Aleatório</option>
                <option value="audio">Áudio (drop/build-up)</option>
                <option value="vote">Votação (futuro)</option>
                <option value="xp-milestone">XP Milestone (futuro)</option>
              </select>
              <p className="text-xs text-primary-400 mt-1">
                Como o evento será disparado
              </p>
            </div>

            {formData.triggerType === 'audio' && (
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Tipo de Áudio
                </label>
                <select
                  value={formData.triggerConfig.audioType || 'drop'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggerConfig: {
                        ...formData.triggerConfig,
                        audioType: e.target.value as 'drop' | 'buildUp',
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                >
                  <option value="drop">Drop (batida forte)</option>
                  <option value="buildUp">Build-up (tensão)</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Cooldown (segundos)
                </label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={formData.triggerConfig.cooldown}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggerConfig: {
                        ...formData.triggerConfig,
                        cooldown: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <p className="text-xs text-primary-400 mt-1">
                  Tempo entre disparos do mesmo evento
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Nível Mínimo
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.triggerConfig.minLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggerConfig: {
                        ...formData.triggerConfig,
                        minLevel: parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <p className="text-xs text-primary-400 mt-1">
                  Evento só aparece a partir deste nível
                </p>
              </div>
            </div>

            {(formData.triggerType === 'random' || formData.triggerType === 'audio') && (
              <div>
                <label className="block text-sm font-medium text-primary-200 mb-2">
                  Probabilidade (0.0 - 1.0)
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={formData.triggerConfig.probability}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      triggerConfig: {
                        ...formData.triggerConfig,
                        probability: parseFloat(e.target.value),
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-surface-dark border border-primary-800 rounded-lg text-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <p className="text-xs text-primary-400 mt-1">
                  Chance do evento ser sorteado (1.0 = 100%)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="border-t border-primary-900 p-4">
        <button
          type="submit"
          disabled={loading || !formData.name}
          className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-500 disabled:bg-primary-900 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Save size={18} />
          {loading ? 'Salvando...' : 'Salvar Evento'}
        </button>
      </div>
    </form>
  )
}
