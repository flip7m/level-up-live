import { useAudioStore } from '../stores/audioStore'

export function useAudioPlayer() {
  const {
    playing,
    paused,
    currentSong,
    progress,
    duration,
    bpm,
    energy,
    songs,
    musicVolume,
    sfxVolume,
    isLooping,
    isShuffling,
    setPlaying,
    setCurrentSong,
    setSongs,
    setVolume,
    setProgress,
    setLoop,
    setShuffle,
    reset,
  } = useAudioStore()

  return {
    playing,
    paused,
    currentSong,
    progress,
    duration,
    bpm,
    energy,
    songs,
    musicVolume,
    sfxVolume,
    isLooping,
    isShuffling,
    setPlaying,
    setCurrentSong,
    setSongs,
    setVolume,
    setProgress,
    setLoop,
    setShuffle,
    reset,
  }
}
