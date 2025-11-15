import { useState, useEffect } from 'react'
import { Sparkles, Zap, AlertCircle, Clock } from 'lucide-react'
import { useEvents, ActiveEvent } from '../../hooks/useEvents'

export function EventPanel() {
  const {
    availableEvents,
    activeEvents,
    loading,
    error,
    triggerEvent,
    triggerRandomEvent,
    getRemainingTime,
  } = useEvents()

  const [selectedEventId, setSelectedEventId] = useState<string>('')
  const [remainingTimes, setRemainingTimes] = useState<Record<string, number>>({})

  // Auto-select first event when available events load
  useEffect(() => {
    if (availableEvents.length > 0 && !selectedEventId) {
      setSelectedEventId(availableEvents[0].id)
    }
  }, [availableEvents, selectedEventId])

  // Update remaining times every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimes: Record<string, number> = {}
      activeEvents.forEach((event) => {
        newTimes[event.eventId] = getRemainingTime(event)
      })
      setRemainingTimes(newTimes)
    }, 1000)

    return () => clearInterval(interval)
  }, [activeEvents, getRemainingTime])

  const handleTriggerRandom = async () => {
    try {
      await triggerRandomEvent()
    } catch (err: any) {
      console.error('Error triggering random event:', err)
    }
  }

  const handleTriggerSpecific = async () => {
    if (!selectedEventId) return

    try {
      await triggerEvent(selectedEventId)
    } catch (err: any) {
      console.error('Error triggering event:', err)
    }
  }

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-surface-light border border-primary-900 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-primary-100 mb-4 flex items-center gap-2">
        <Sparkles size={20} className="text-primary-400" />
        Event Triggers
      </h2>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-center gap-2 text-red-300 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* Active Events Section */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-primary-300 uppercase mb-3">Eventos Ativos</h3>
        {activeEvents.length === 0 ? (
          <p className="text-sm text-primary-400 italic">Nenhum evento ativo</p>
        ) : (
          <div className="space-y-2">
            {activeEvents.map((event) => {
              const remaining = remainingTimes[event.eventId] || 0
              const progress = ((event.duration - remaining) / event.duration) * 100

              return (
                <div
                  key={event.eventId}
                  className="bg-surface-dark border border-primary-800 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-primary-100">{event.name}</span>
                    <div className="flex items-center gap-1 text-xs text-primary-400">
                      <Clock size={12} />
                      {formatTime(remaining)}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-surface-lighter rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-600 to-accent-pink transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Event type badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        event.type === 'manual'
                          ? 'bg-accent-indigo/20 text-indigo-300'
                          : event.type === 'random'
                          ? 'bg-accent-pink/20 text-pink-300'
                          : 'bg-primary-600/20 text-primary-300'
                      }`}
                    >
                      {event.type === 'manual' ? 'Manual' : event.type === 'random' ? 'Aleatório' : 'Áudio'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Trigger Controls Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-primary-300 uppercase">Disparar Eventos</h3>

        {/* Random Event Button */}
        <button
          onClick={handleTriggerRandom}
          disabled={loading || availableEvents.length === 0}
          className="w-full px-4 py-3 bg-accent-pink hover:bg-pink-600 disabled:bg-primary-900 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          title="Disparar evento aleatório"
        >
          <Sparkles size={18} />
          {loading ? 'Disparando...' : 'Evento Aleatório'}
        </button>

        {/* Specific Event Selector */}
        {availableEvents.length > 0 ? (
          <div className="flex items-center gap-2">
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="flex-1 px-3 py-2 bg-surface-dark border border-primary-800 text-primary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
              disabled={loading}
            >
              {availableEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name} ({event.duration}s)
                </option>
              ))}
            </select>

            <button
              onClick={handleTriggerSpecific}
              disabled={loading || !selectedEventId}
              className="px-4 py-2 bg-accent-indigo hover:bg-indigo-600 disabled:bg-primary-900 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              title="Disparar evento selecionado"
            >
              <Zap size={16} />
              Disparar
            </button>
          </div>
        ) : (
          <p className="text-sm text-primary-400 italic text-center py-2">
            Nenhum evento disponível para o nível atual
          </p>
        )}
      </div>

      {/* Available Events Count */}
      <div className="mt-4 pt-4 border-t border-primary-900">
        <p className="text-xs text-primary-400">
          {availableEvents.length} evento{availableEvents.length !== 1 ? 's' : ''} disponível
          {availableEvents.length !== 1 ? 'is' : ''}
        </p>
      </div>
    </div>
  )
}
