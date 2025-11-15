import { Sparkles, Plus, Trash2 } from 'lucide-react'
import { GameEvent } from '@shared/types'

interface EventListProps {
  events: GameEvent[]
  selectedEvent: GameEvent | null
  onSelectEvent: (event: GameEvent) => void
  onCreateNew: () => void
  onDelete: (id: string) => void
  loading?: boolean
}

export function EventList({
  events,
  selectedEvent,
  onSelectEvent,
  onCreateNew,
  onDelete,
  loading,
}: EventListProps) {
  const getTriggerTypeBadge = (triggerType: string) => {
    const colors = {
      manual: 'bg-indigo-500/20 text-indigo-300',
      random: 'bg-pink-500/20 text-pink-300',
      audio: 'bg-purple-500/20 text-purple-300',
      vote: 'bg-green-500/20 text-green-300',
      'xp-milestone': 'bg-yellow-500/20 text-yellow-300',
    }
    return colors[triggerType as keyof typeof colors] || 'bg-gray-500/20 text-gray-300'
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-primary-900">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-primary-100 flex items-center gap-2">
            <Sparkles size={20} className="text-primary-400" />
            Eventos
          </h2>
          <button
            onClick={onCreateNew}
            disabled={loading}
            className="p-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors disabled:opacity-50"
            title="Criar novo evento"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="text-xs text-primary-400">
          {events.length} evento{events.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Event List */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="p-4 text-center text-primary-400 text-sm">
            Nenhum evento criado ainda
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {events.map((event) => (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event)}
                className={`
                  relative group p-3 rounded-lg cursor-pointer transition-all
                  ${
                    selectedEvent?.id === event.id
                      ? 'bg-primary-600 border-2 border-primary-400'
                      : 'bg-surface-lighter border-2 border-transparent hover:border-primary-700'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-medium text-sm mb-1 truncate ${
                        selectedEvent?.id === event.id ? 'text-white' : 'text-primary-100'
                      }`}
                    >
                      {event.name}
                    </h3>
                    <p
                      className={`text-xs mb-2 line-clamp-2 ${
                        selectedEvent?.id === event.id ? 'text-primary-200' : 'text-primary-400'
                      }`}
                    >
                      {event.description || 'Sem descrição'}
                    </p>

                    {/* Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded ${getTriggerTypeBadge(event.triggerType)}`}>
                        {event.triggerType}
                      </span>
                      <span className="text-xs text-primary-400">
                        {event.duration}s
                      </span>
                      {event.triggerConfig?.minLevel && (
                        <span className="text-xs text-primary-400">
                          Nível {event.triggerConfig.minLevel}+
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Deletar evento "${event.name}"?`)) {
                        onDelete(event.id)
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all text-red-400"
                    title="Deletar evento"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
