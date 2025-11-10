import { useEffect, useState, useCallback } from 'react'
import { Level } from '@shared/types'
import { useLevels } from '../hooks/useLevels'
import { LevelForm } from '../components/level/LevelForm'
import { Plus, AlertCircle } from 'lucide-react'

export function LevelEditor() {
  const { levels, loading, error, fetchLevels, updateLevel, deleteLevel, createLevel } = useLevels()
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Fetch levels on mount
  useEffect(() => {
    fetchLevels()
  }, [fetchLevels])

  // Ensure levels is always an array
  const levelsArray = Array.isArray(levels) ? levels : []
  const selectedLevel = levelsArray.find((l) => l.id === selectedLevelId)

  const handleSelectLevel = useCallback((levelId: string) => {
    setSelectedLevelId(levelId)
    setIsCreating(false)
  }, [])

  const handleCreateLevel = useCallback(async () => {
    try {
      const newLevel = await createLevel('Novo Nível', 'Descrição do nível', 0)
      if (newLevel) {
        setSelectedLevelId(newLevel.id)
        setIsCreating(false)
        showToast('Nível criado com sucesso!', 'success')
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao criar nível', 'error')
    }
  }, [createLevel])

  const handleSaveLevel = useCallback(
    async (level: Level) => {
      try {
        const updated = await updateLevel(level.id, level)
        if (updated) {
          showToast('Nível salvo com sucesso!', 'success')
        }
      } catch (err: any) {
        showToast(err.message || 'Erro ao salvar nível', 'error')
      }
    },
    [updateLevel]
  )

  const handleDeleteLevel = useCallback(async () => {
    if (!selectedLevel) return

    try {
      const success = await deleteLevel(selectedLevel.id)
      if (success) {
        setSelectedLevelId(null)
        showToast('Nível deletado com sucesso!', 'success')
      }
    } catch (err: any) {
      showToast(err.message || 'Erro ao deletar nível', 'error')
    }
  }, [selectedLevel, deleteLevel])

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-primary-100 mb-2">Editor de Níveis</h1>
        <p className="text-primary-400">Crie e customize seus níveis com layers, sons e configurações visuais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-surface-light border border-primary-900 rounded-lg overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-primary-800 bg-surface-darker">
              <h2 className="text-lg font-semibold text-primary-100">Níveis ({levelsArray.length})</h2>
            </div>

            {/* Levels list */}
            <div className="flex-grow overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <p className="text-primary-400 text-sm">Carregando níveis...</p>
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="flex gap-2 items-start text-red-300">
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <p className="text-xs">{error}</p>
                  </div>
                </div>
              ) : levelsArray.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-primary-400 text-sm">Nenhum nível criado</p>
                  <p className="text-primary-500 text-xs mt-2">Clique em "Novo Nível" para começar</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {levelsArray.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => handleSelectLevel(level.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedLevelId === level.id
                          ? 'bg-primary-600/30 border border-primary-500'
                          : 'bg-surface-darker hover:bg-surface-lighter border border-transparent'
                      }`}
                    >
                      <p className="text-primary-100 font-medium text-sm">{level.name}</p>
                      <p className="text-primary-400 text-xs">Nível {level.order} • {level.xpThreshold} XP</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Create button */}
            <div className="p-3 border-t border-primary-800 bg-surface-darker">
              <button
                onClick={handleCreateLevel}
                disabled={isCreating || loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                <span>Novo Nível</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Editor */}
        <div className="lg:col-span-3">
          {selectedLevel ? (
            <div className="bg-surface-light border border-primary-900 rounded-lg overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-primary-800 bg-surface-darker">
                <h2 className="text-lg font-semibold text-primary-100">{selectedLevel.name}</h2>
              </div>
              <div className="flex-grow overflow-y-auto p-6">
                <LevelForm
                  level={selectedLevel}
                  onSave={handleSaveLevel}
                  onCancel={() => setSelectedLevelId(null)}
                  onDelete={handleDeleteLevel}
                />
              </div>
            </div>
          ) : (
            <div className="bg-surface-light border border-primary-900 rounded-lg p-12 flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-primary-400 text-lg mb-2">Nenhum nível selecionado</p>
                <p className="text-primary-500 text-sm">Selecione um nível na lista ou crie um novo</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast notifications */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg font-medium text-white animate-in fade-in slide-in-from-bottom-4 ${
            toastMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toastMessage.text}
        </div>
      )}
    </div>
  )
}
