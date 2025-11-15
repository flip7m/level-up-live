import { create } from 'zustand'
import { Song, AudioEngineState, AudioAnalysis } from '@shared/types'

interface AudioStore extends AudioEngineState {
  currentSong: Song | null
  songs: Song[]
  musicVolume: number
  sfxVolume: number
  isLooping: boolean
  isShuffling: boolean

  // Actions
  setPlaying: (playing: boolean) => void
  setCurrentSong: (song: Song | null) => void
  setSongs: (songs: Song[]) => void
  setVolume: (type: 'music' | 'sfx', volume: number) => void
  setProgress: (progress: number) => void
  setLoop: (enabled: boolean) => void
  setShuffle: (enabled: boolean) => void
  setAnalysis: (analysis: AudioAnalysis) => void
  reset: () => void
}

const initialState: AudioStore = {
  playing: false,
  paused: false,
  progress: 0,
  duration: 0,
  bpm: 0,
  energy: 0,
  frequencyData: new Uint8Array(0),
  analysis: undefined,
  currentSong: null,
  songs: [],
  musicVolume: 0.7,
  sfxVolume: 0.8,
  isLooping: false,
  isShuffling: false,
  setPlaying: () => {},
  setCurrentSong: () => {},
  setSongs: () => {},
  setVolume: () => {},
  setProgress: () => {},
  setLoop: () => {},
  setShuffle: () => {},
  setAnalysis: () => {},
  reset: () => {},
}

export const useAudioStore = create<AudioStore>((set) => ({
  ...initialState,

  setPlaying: (playing: boolean) =>
    set({
      playing,
      paused: !playing,
    }),

  setCurrentSong: (song: Song | null) =>
    set({
      currentSong: song,
      progress: 0,
      duration: song?.duration || 0,
    }),

  setSongs: (songs: Song[]) =>
    set({
      songs,
    }),

  setVolume: (type: 'music' | 'sfx', volume: number) =>
    set({
      ...(type === 'music' ? { musicVolume: volume } : { sfxVolume: volume }),
    }),

  setProgress: (progress: number) =>
    set({
      progress,
    }),

  setLoop: (enabled: boolean) =>
    set({
      isLooping: enabled,
    }),

  setShuffle: (enabled: boolean) =>
    set({
      isShuffling: enabled,
    }),

  setAnalysis: (analysis: AudioAnalysis) =>
    set({
      analysis,
    }),

  reset: () => set(initialState),
}))
