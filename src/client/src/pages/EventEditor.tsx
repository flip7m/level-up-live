import { useEffect } from 'react'
import { useEventEditor } from '../hooks/useEventEditor'
import { EventList } from '../components/event/EventList'
import { EventForm } from '../components/event/EventForm'
import { GameEvent } from '@shared/types'

export function EventEditor() {
  const {
    events,
    selectedEvent,
    loading,
    error,
    setSelectedEvent,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEventEditor()

  // Load events on mount
  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const handleCreateNew = () => {
    const newEvent: Partial<GameEvent> = {
      id: 'new',
      name: 'Novo Evento',
      description: '',
      type: 'visual',
      triggerType: 'manual',
      duration: 5,
      triggerConfig: {
        cooldown: 30,
        minLevel: 1,
        probability: 1.0,
      },
      assets: {
        layers: [],
        sounds: [],
      },
      createdAt: new Date().toISOString(),
    }
    setSelectedEvent(newEvent as GameEvent)
  }

  const handleSave = async (data: any) => {
    try {
      if (selectedEvent?.id === 'new') {
        // Create new event
        const created = await createEvent(data)
        if (created) {
          setSelectedEvent(created)
        }
      } else if (selectedEvent) {
        // Update existing event
        await updateEvent(selectedEvent.id, data)
      }
    } catch (err: any) {
      console.error('Failed to save event:', err)
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface-dark">
      {/* Header */}
      <div className="border-b border-primary-900 px-6 py-4">
        <h1 className="text-2xl font-bold text-primary-100">Editor de Eventos</h1>
        <p className="text-sm text-primary-400 mt-1">
          Crie e gerencie eventos especiais para suas lives
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Event List */}
        <div className="w-80 border-r border-primary-900 bg-surface-light">
          <EventList
            events={events}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            onCreateNew={handleCreateNew}
            onDelete={deleteEvent}
            loading={loading}
          />
        </div>

        {/* Main Editor */}
        <div className="flex-1 bg-surface-dark">
          <EventForm event={selectedEvent} onSave={handleSave} loading={loading} />
        </div>
      </div>
    </div>
  )
}
