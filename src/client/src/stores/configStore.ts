import { create } from 'zustand'
import { Level, GameEvent } from '@shared/types'

interface ConfigStore {
  levels: Level[]
  events: GameEvent[]
  isDarkMode: boolean

  // Actions
  setLevels: (levels: Level[]) => void
  setEvents: (events: GameEvent[]) => void
  toggleDarkMode: () => void
}

const initialState: ConfigStore = {
  levels: [],
  events: [],
  isDarkMode: true,
  setLevels: () => {},
  setEvents: () => {},
  toggleDarkMode: () => {},
}

export const useConfigStore = create<ConfigStore>((set) => ({
  ...initialState,

  setLevels: (levels: Level[]) =>
    set({
      levels,
    }),

  setEvents: (events: GameEvent[]) =>
    set({
      events,
    }),

  toggleDarkMode: () =>
    set((state) => ({
      isDarkMode: !state.isDarkMode,
    })),
}))
