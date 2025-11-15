import { create } from 'zustand'
import { XPState, LiveSession } from '@shared/types'

interface LiveStore extends XPState {
  isLive: boolean
  currentSession: LiveSession | null
  comboCount: number

  // Actions
  setIsLive: (isLive: boolean) => void
  startLive: () => void
  stopLive: () => void
  addXP: (amount: number) => void
  setLevel: (level: number) => void
  setCurrentXP: (xp: number) => void
  setCurrentLevel: (level: number) => void
  setProgress: (progress: number) => void
  setComboCount: (combo: number) => void
  reset: () => void
}

const initialState: LiveStore = {
  isLive: false,
  currentXP: 0,
  currentLevel: 1,
  nextLevelXP: 100,
  progress: 0,
  totalXPEarned: 0,
  comboCount: 0,
  currentSession: null,
  startLive: () => {},
  stopLive: () => {},
  addXP: () => {},
  setLevel: () => {},
  setCurrentXP: () => {},
  setCurrentLevel: () => {},
  setProgress: () => {},
  setComboCount: () => {},
  reset: () => {},
}

export const useLiveStore = create<LiveStore>((set) => ({
  ...initialState,

  setIsLive: (isLive: boolean) =>
    set(() => ({
      isLive,
    })),

  startLive: () =>
    set(() => ({
      isLive: true,
      currentSession: {
        id: Date.now().toString(),
        startedAt: new Date().toISOString(),
      } as LiveSession,
    })),

  stopLive: () =>
    set((state) => ({
      isLive: false,
      currentSession: state.currentSession
        ? {
            ...state.currentSession,
            endedAt: new Date().toISOString(),
            totalDuration: Math.floor(
              (new Date().getTime() - new Date(state.currentSession.startedAt).getTime()) / 1000
            ),
            finalLevel: state.currentLevel,
            totalXP: state.totalXPEarned,
          }
        : null,
    })),

  addXP: (amount: number) =>
    set((state) => ({
      currentXP: state.currentXP + amount,
      totalXPEarned: state.totalXPEarned + amount,
      progress: ((state.currentXP + amount) / state.nextLevelXP) * 100,
    })),

  setLevel: (level: number) =>
    set(() => ({
      currentLevel: level,
      currentXP: 0,
      progress: 0,
      nextLevelXP: 100 * level,
    })),

  setCurrentXP: (xp: number) =>
    set((state) => {
      const newProgress = state.nextLevelXP > 0 ? (xp / state.nextLevelXP) * 100 : 0
      console.log('[LiveStore] setCurrentXP:', xp, '/', state.nextLevelXP, '=', newProgress.toFixed(1), '%')
      return {
        currentXP: xp,
        progress: newProgress,
      }
    }),

  setCurrentLevel: (level: number) =>
    set((state) => {
      const nextLevelXP = 100 * level // Formula: 100 * level
      const newProgress = state.currentXP > 0 ? (state.currentXP / nextLevelXP) * 100 : 0
      console.log('[LiveStore] setCurrentLevel:', level, 'nextLevelXP:', nextLevelXP)
      return {
        currentLevel: level,
        nextLevelXP,
        progress: newProgress,
      }
    }),

  setProgress: (progress: number) =>
    set(() => {
      console.log('[LiveStore] setProgress:', progress.toFixed(1), '%')
      return {
        progress,
      }
    }),

  setComboCount: (combo: number) =>
    set(() => ({
      comboCount: combo,
    })),

  reset: () => set(initialState),
}))
